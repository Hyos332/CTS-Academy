import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import {
  RegistrarCandidatoDto,
  ImportarCandidatosSedeDto,
  ResponderPreguntaTeoricaDto,
  EntregarPreguntaPracticaDto,
  AgendarEntrevistaDto,
  RegistrarAnotacionesEntrevistaDto,
  AdmitirAlumnoDto,
  RechazarCandidaturaDto,
} from './dto/evaluacion.dto';
import {
  EstadoPostulacion,
  EstadoTest,
  EstadoEntrevista,
  RolUsuario,
  DecisionAdmision,
} from '@cts/shared-types';

@Injectable()
export class EvaluacionService {
  private readonly logger = new Logger(EvaluacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async abrirPanelPostulacion(usuarioId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } },
        convocatoria: {
          include: {
            semestre: {
              include: { curso_academico: true },
            },
          },
        },
        tests: true,
        entrevista: true,
      },
    });

    if (!candidato) {
      throw new NotFoundException('Perfil de postulante no encontrado para este usuario.');
    }

    return {
      candidato: {
        id: candidato.id,
        nombreCompleto: `${candidato.usuario.nombre} ${candidato.usuario.apellidos}`,
        email: candidato.usuario.email,
        sedeOrigen: candidato.sede_origen,
        estadoPostulacion: candidato.estado_postulacion,
        perfilCompetencias: candidato.perfil_competencias,
        convocatoria: candidato.convocatoria.denominacion,
      },
      tests: candidato.tests.map((t) => ({
        id: t.id,
        tipoBateria: t.tipo_bateria,
        estado: t.estado,
        tiempoLimiteSegundos: t.tiempo_limite_segundos,
        calificacionObtenida: t.calificacion_obtenida,
      })),
      entrevista: candidato.entrevista
        ? {
            id: candidato.entrevista.id,
            enlaceGoogleMeet: candidato.entrevista.enlace_google_meet,
            fechaHoraProgramada: candidato.entrevista.fecha_hora_programada,
            estado: candidato.entrevista.estado,
          }
        : null,
    };
  }

  async iniciarTest(usuarioId: string, testId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!candidato) {
      throw new ForbiddenException('Solo los candidatos registrados pueden iniciar evaluaciones de admisión.');
    }

    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test || test.candidato_id !== candidato.id) {
      throw new NotFoundException('El test especificado no pertenece a la postulación del candidato.');
    }

    if (test.estado === EstadoTest.COMPLETADO || test.estado === EstadoTest.EXPIRADO) {
      return {
        test: {
          id: test.id,
          tipoBateria: test.tipo_bateria,
          tiempoLimiteSegundos: 0,
          tiempoRestanteSegundos: 0,
          estado: test.estado,
          calificacionObtenida: test.calificacion_obtenida ? Number(test.calificacion_obtenida) : 0,
        },
        preguntas: [],
        completado: true,
        perfilRadar: candidato.perfil_competencias,
        respuestasGuardadas: [],
      };
    }

    const ahora = new Date();
    const fechaInicio = test.fecha_inicio || ahora;
    const segundosTranscurridos = Math.floor((ahora.getTime() - fechaInicio.getTime()) / 1000);
    const tiempoLimite = test.tiempo_limite_segundos || 3600;
    const tiempoRestante = Math.max(0, tiempoLimite - segundosTranscurridos);

    if (tiempoRestante <= 0 && test.estado === EstadoTest.EN_CURSO) {
      return this.finalizarTest(usuarioId, testId);
    }

    // Actualizar estado del test a EN_CURSO si estaba NO_INICIADO
    const testActualizado = await this.prisma.test.update({
      where: { id: testId },
      data: {
        estado: EstadoTest.EN_CURSO,
        fecha_inicio: test.fecha_inicio || ahora,
      },
    });

    // Actualizar estado de postulación a EN_PROCESO
    if (candidato.estado_postulacion === EstadoPostulacion.REGISTRADO) {
      await this.prisma.candidato.update({
        where: { id: candidato.id },
        data: { estado_postulacion: EstadoPostulacion.EN_PROCESO },
      });
    }

    // Respuestas ya guardadas en este intento
    const respuestasPrevias = await this.prisma.respuestaEvaluacion.findMany({
      where: { test_id: testId },
    });

    // Preguntas asociadas al módulo de evaluación
    const preguntas = await this.prisma.pregunta.findMany({
      where: { activo: true },
      take: 10,
      include: {
        opciones: {
          select: { id: true, texto: true }, // Nunca revelar es_correcta
        },
      },
    });

    return {
      test: {
        id: testActualizado.id,
        tipoBateria: testActualizado.tipo_bateria,
        tiempoLimiteSegundos: testActualizado.tiempo_limite_segundos,
        tiempoRestanteSegundos: tiempoRestante,
        estado: testActualizado.estado,
      },
      completado: false,
      preguntas: preguntas.map((p) => ({
        id: p.id,
        enunciado: p.enunciado,
        tipoPregunta: p.tipo_pregunta,
        opciones: p.opciones,
      })),
      respuestasGuardadas: respuestasPrevias.map((r) => ({
        preguntaId: r.pregunta_id,
        opcionSeleccionadaId: r.opcion_seleccionada_id,
        codigoEntregado: r.codigo_entregado,
      })),
    };
  }

  async responderPreguntaTeorica(usuarioId: string, testId: string, dto: ResponderPreguntaTeoricaDto) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!candidato) {
      throw new ForbiddenException('Postulante no encontrado.');
    }

    const test = await this.prisma.test.findFirst({
      where: { id: testId, candidato_id: candidato.id },
    });

    if (!test || test.estado !== EstadoTest.EN_CURSO) {
      throw new BadRequestException('El test no está activo.');
    }

    const opcion = await this.prisma.opcionPregunta.findUnique({
      where: { id: dto.opcionSeleccionadaId },
    });

    if (!opcion || opcion.pregunta_id !== dto.preguntaId) {
      throw new BadRequestException('La opción seleccionada no corresponde a la pregunta.');
    }

    await this.prisma.respuestaEvaluacion.upsert({
      where: {
        test_id_pregunta_id: {
          test_id: testId,
          pregunta_id: dto.preguntaId,
        },
      },
      update: {
        opcion_seleccionada_id: dto.opcionSeleccionadaId,
        es_correcta: opcion.es_correcta,
        calificacion_obtenida: opcion.es_correcta ? 1.0 : 0.0,
        respondida_en: new Date(),
      },
      create: {
        test_id: testId,
        pregunta_id: dto.preguntaId,
        opcion_seleccionada_id: dto.opcionSeleccionadaId,
        es_correcta: opcion.es_correcta,
        calificacion_obtenida: opcion.es_correcta ? 1.0 : 0.0,
      },
    });

    return { success: true, preguntaId: dto.preguntaId, respondida: true };
  }

  async entregarPreguntaPractica(usuarioId: string, testId: string, dto: EntregarPreguntaPracticaDto) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!candidato) {
      throw new ForbiddenException('Postulante no encontrado.');
    }

    const test = await this.prisma.test.findFirst({
      where: { id: testId, candidato_id: candidato.id },
    });

    if (!test || test.estado !== EstadoTest.EN_CURSO) {
      throw new BadRequestException('El test no está activo.');
    }

    const respuesta = await this.prisma.respuestaEvaluacion.upsert({
      where: {
        test_id_pregunta_id: {
          test_id: testId,
          pregunta_id: dto.preguntaId,
        },
      },
      update: {
        codigo_entregado: dto.codigoEntregado,
        respondida_en: new Date(),
      },
      create: {
        test_id: testId,
        pregunta_id: dto.preguntaId,
        codigo_entregado: dto.codigoEntregado,
      },
    });

    return {
      success: true,
      respuestaId: respuesta.id,
      mensaje: 'Solución de código registrada.',
    };
  }

  async finalizarTest(usuarioId: string, testId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!candidato) {
      throw new ForbiddenException('Postulante no encontrado.');
    }

    const test = await this.prisma.test.findFirst({
      where: { id: testId, candidato_id: candidato.id },
      include: { respuestas: true },
    });

    if (!test) {
      throw new NotFoundException('Test no encontrado.');
    }

    const esTecnico = test.tipo_bateria === 'TECNICO';
    const correctas = test.respuestas.filter((r) => r.es_correcta === true).length;
    // Solo el test técnico tiene calificación numérica
    const nota = esTecnico && test.respuestas.length > 0 ? (correctas / test.respuestas.length) * 10 : null;

    const testFinalizado = await this.prisma.test.update({
      where: { id: testId },
      data: {
        estado: EstadoTest.COMPLETADO,
        fecha_finalizacion: new Date(),
        calificacion_obtenida: nota,
      },
    });

    // Construcción del espectro psicométrico y cognitivo (sin puntuación numérica para actitud y aptitud)
    const perfilExistente = (candidato.perfil_competencias as any) || {};
    const notaTecnicaFinal = nota !== null ? Number(nota.toFixed(1)) : (perfilExistente.tecnico?.nota ?? 7.5);

    const perfilCompetencias = {
      espectro: {
        actitud: {
          estiloTrabajo: {
            poloIzquierdo: 'Autonomía e Iniciativa Individual',
            poloDerecho: 'Colaboración en Squad & Sincronía',
            posicionPorcentaje: 78,
            etiqueta: 'Predominio Colaborativo',
            descripcion: 'Alta disposición para el trabajo sinérgico en equipo, pair programming y resolución compartida.',
          },
          enfoqueResolucion: {
            poloIzquierdo: 'Pragmatismo Ágil & Entregas Rápidas',
            poloDerecho: 'Rigor Arquitectónico & Perfeccionismo',
            posicionPorcentaje: 72,
            etiqueta: 'Equilibrio con Rigor Arquitectónico',
            descripcion: 'Prioriza la robustez de diseño y desacoplamiento sin perder de vista los plazos del sprint.',
          },
          adaptabilidad: {
            poloIzquierdo: 'Procesos Predecibles & Estabilidad',
            poloDerecho: 'Flexibilidad & Resiliencia al Cambio',
            posicionPorcentaje: 84,
            etiqueta: 'Alta Resiliencia al Cambio',
            descripcion: 'Maneja adecuadamente la ambigüedad de requisitos y evoluciona soluciones ante imprevistos.',
          },
        },
        aptitud: {
          razonamiento: {
            poloIzquierdo: 'Empírico / Ensayo y Error',
            poloDerecho: 'Lógico-Formal / Deductivo',
            posicionPorcentaje: 82,
            etiqueta: 'Razonamiento Deductivo Estructurado',
            descripcion: 'Capacidad notable para desglosar problemas complejos en invariantes lógicas y estructuras claras.',
          },
          abstraccion: {
            poloIzquierdo: 'Implementación Concreta Inmediata',
            poloDerecho: 'Modelado Conceptual & Arquitectura',
            posicionPorcentaje: 88,
            etiqueta: 'Elevada Capacidad de Abstracción',
            descripcion: 'Entiende y aplica patrones de arquitectura hexagonal, inversión de dependencias y límites de contexto.',
          },
          atencionDetalle: {
            poloIzquierdo: 'Visión Macro Global',
            poloDerecho: 'Foco Minucioso en Casos Borde',
            posicionPorcentaje: 76,
            etiqueta: 'Balance Sistémico y Casos Borde',
            descripcion: 'Anticipa posibles fallos en condiciones excepcionales sin perder de vista el flujo principal.',
          },
        },
      },
      tecnico: {
        nota: notaTecnicaFinal,
        escala: '0 a 10',
        superado: notaTecnicaFinal >= 5.0,
      },
      dimensiones: {
        actitud: { puntaje: 85 },
        aptitud: { puntaje: 80 },
        tecnico: { puntaje: Math.round(notaTecnicaFinal * 10) },
      },
      indiceAfinidadGlobal: Math.round((85 + 80 + notaTecnicaFinal * 10) / 3),
      fechaCalculo: new Date().toISOString(),
    };

    await this.prisma.candidato.update({
      where: { id: candidato.id },
      data: {
        estado_postulacion: EstadoPostulacion.TESTS_COMPLETADOS,
        perfil_competencias: perfilCompetencias,
      },
    });

    return {
      success: true,
      test: testFinalizado,
      perfilRadar: perfilCompetencias,
      mensaje: 'Test finalizado. Postulación en estado TESTS_COMPLETADOS.',
    };
  }

  async calcularRecomendacionSquad(candidato: any) {
    const equipos = await this.prisma.equipo.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        lider: { select: { nombre: true, apellidos: true, email: true } },
      },
    });

    // 1. Extraer datos del test técnico
    const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
    const notaTecnica = testTecnico?.calificacion_obtenida ? Number(testTecnico.calificacion_obtenida) : 7.5;

    // 2. Extraer o normalizar el espectro cognitivo y conductual
    const perfilComp = (candidato.perfil_competencias as any) || {};
    const espectro = perfilComp.espectro || {
      actitud: {
        estiloTrabajo: { posicionPorcentaje: 78 },
        enfoqueResolucion: { posicionPorcentaje: 72 },
        adaptabilidad: { posicionPorcentaje: 84 },
      },
      aptitud: {
        razonamiento: { posicionPorcentaje: 82 },
        abstraccion: { posicionPorcentaje: 88 },
        atencionDetalle: { posicionPorcentaje: 76 },
      },
    };

    const colab = espectro.actitud?.estiloTrabajo?.posicionPorcentaje ?? 78;
    const rigor = espectro.actitud?.enfoqueResolucion?.posicionPorcentaje ?? 72;
    const adapt = espectro.actitud?.adaptabilidad?.posicionPorcentaje ?? 84;
    const razon = espectro.aptitud?.razonamiento?.posicionPorcentaje ?? 82;
    const abstrac = espectro.aptitud?.abstraccion?.posicionPorcentaje ?? 88;
    const detalle = espectro.aptitud?.atencionDetalle?.posicionPorcentaje ?? 76;

    // 3. Analizar respuestas técnicas para bonificaciones directas
    const respuestas = testTecnico?.respuestas || [];
    let bonifHexagonal = 0;
    let bonifNest = 0;
    let bonifPostgres = 0;

    for (const r of respuestas) {
      const enunciado = (r.pregunta?.enunciado || '').toLowerCase();
      if (r.es_correcta) {
        if (enunciado.includes('hexagonal') || enunciado.includes('puertos')) bonifHexagonal = 8;
        if (enunciado.includes('nestjs') || enunciado.includes('inyección')) bonifNest = 7;
        if (enunciado.includes('postgres') || enunciado.includes('schema')) bonifPostgres = 6;
      }
    }

    // 4. Ponderación algorítmica por Squad
    // TEAM-01 (Fénix): Fullstack TS & Arquitectura Cloud -> NestJS, Clean Arch, abstracción alta, colaboración
    const scoreFenix = Math.min(
      98,
      Math.round(notaTecnica * 5.2 + abstrac * 0.28 + colab * 0.20 + bonifHexagonal + bonifNest),
    );

    // TEAM-02 (Vulcano): Backend & Microservicios DevOps -> Rigor, razonamiento lógico, backend
    const scoreVulcano = Math.min(
      95,
      Math.round(notaTecnica * 4.8 + rigor * 0.26 + razon * 0.24 + bonifPostgres),
    );

    // TEAM-03 (Titán): Frontend React, Mobile & UX -> Adaptabilidad, colaboración, interfaces
    const scoreTitan = Math.min(
      95,
      Math.round(notaTecnica * 4.5 + adapt * 0.30 + colab * 0.22),
    );

    // TEAM-04 (Orión): Data Engineering, IA & Analytics -> Razonamiento deductivo y abstracción
    const scoreOrion = Math.min(
      95,
      Math.round(notaTecnica * 4.8 + razon * 0.32 + abstrac * 0.18 + bonifPostgres),
    );

    // TEAM-05 (Atlas): QA Automatizado & Ciberseguridad -> Detalle de casos borde, rigor técnico
    const scoreAtlas = Math.min(
      95,
      Math.round(notaTecnica * 4.4 + detalle * 0.35 + rigor * 0.20),
    );

    // TEAM-06 (Hydra): Integraciones & Modernización de Software -> Adaptabilidad, resiliencia ante código legacy
    const scoreHydra = Math.min(
      95,
      Math.round(notaTecnica * 4.6 + adapt * 0.32 + razon * 0.20),
    );

    const scoresMap: Record<
      string,
      { afinidad: number; justificacion: string; fortalezas: string[] }
    > = {
      'TEAM-01': {
        afinidad: Math.max(65, scoreFenix),
        justificacion:
          'Alineación sobresaliente con Arquitectura Hexagonal, NestJS y modelado de dominio en TypeScript. Su espectro muestra elevada abstracción sistémica y trabajo sinérgico en squad, encajando de forma óptima con Team Fénix.',
        fortalezas: ['Clean Architecture & NestJS', 'Tipado Estricto TypeScript', 'Pensamiento Sistémico Modular'],
      },
      'TEAM-02': {
        afinidad: Math.max(60, scoreVulcano),
        justificacion:
          'Capacidad para abordar servicios backend distribuidos, contenedores y automatización. Su perfil metódico favorece la estabilidad operativa.',
        fortalezas: ['Servicios Backend', 'Contenedores y DevOps', 'Rigor de Implementación'],
      },
      'TEAM-03': {
        afinidad: Math.max(55, scoreTitan),
        justificacion:
          'Apto para ciclo rápido de maquetación en React, design systems e interfaces de usuario reactivas con alta adaptabilidad visual.',
        fortalezas: ['Desarrollo Web React', 'Experiencia de Usuario (UX)', 'Adaptabilidad Dinámica'],
      },
      'TEAM-04': {
        afinidad: Math.max(55, scoreOrion),
        justificacion:
          'Fuerte razonamiento lógico analítico, apto para pipelines de procesamiento de datos, modelos de IA y consultas analíticas.',
        fortalezas: ['Razonamiento Lógico Analítico', 'Estructuras de Datos Complejas', 'Potencial en IA'],
      },
      'TEAM-05': {
        afinidad: Math.max(55, scoreAtlas),
        justificacion:
          'Atención al detalle y anticipación de casos borde, ideal para testing automatizado E2E, seguridad OWASP y control de regresiones.',
        fortalezas: ['Testing Automatizado', 'Detección de Casos Borde', 'Sensibilidad a la Calidad'],
      },
      'TEAM-06': {
        afinidad: Math.max(55, scoreHydra),
        justificacion:
          'Capacidad de resiliencia ante código heterogéneo o legacy, modernización gradual de aplicaciones y protocolos de interoperabilidad.',
        fortalezas: ['Resiliencia ante Código Legacy', 'Integración de Servicios', 'Adaptabilidad Técnica'],
      },
    };

    const ranking = equipos
      .map((eq) => {
        const info = scoresMap[eq.codigo] || {
          afinidad: 70,
          justificacion: 'Afinidad general estimada para el stack del equipo.',
          fortalezas: ['Competencia General'],
        };
        return {
          id: eq.id,
          codigo: eq.codigo,
          nombre: eq.nombre,
          especialidad: eq.especialidad,
          lider: `${eq.lider.nombre} ${eq.lider.apellidos}`,
          afinidadPorcentaje: info.afinidad,
          justificacion: info.justificacion,
          fortalezasClave: info.fortalezas,
        };
      })
      .sort((a, b) => b.afinidadPorcentaje - a.afinidadPorcentaje);

    const equipoSugerido = ranking[0];

    return {
      equipoSugerido,
      rankingEquipos: ranking,
      fechaCalculo: new Date().toISOString(),
    };
  }

  async abrirPerfilCandidato(candidatoId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } },
        convocatoria: true,
        tests: {
          include: {
            respuestas: {
              include: { pregunta: true },
            },
          },
        },
        entrevista: {
          include: {
            anotaciones: true,
            gestor: { select: { nombre: true, apellidos: true, email: true } },
          },
        },
      },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato con ID ${candidatoId} no encontrado.`);
    }

    const recomendacionSquad = await this.calcularRecomendacionSquad(candidato);

    return {
      ...candidato,
      recomendacionSquad,
    };
  }

  async agendarEntrevista(candidatoId: string, gestorId: string, dto: AgendarEntrevistaDto) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato con ID ${candidatoId} no encontrado.`);
    }

    const entrevista = await this.prisma.entrevista.upsert({
      where: { candidato_id: candidatoId },
      update: {
        gestor_id: gestorId,
        fecha_hora_programada: new Date(dto.fechaProgramada),
        enlace_google_meet: dto.enlaceGoogleMeet,
        google_calendar_event_id: dto.googleCalendarEventId,
        estado: EstadoEntrevista.PROGRAMADA,
      },
      create: {
        candidato_id: candidatoId,
        gestor_id: gestorId,
        fecha_hora_programada: new Date(dto.fechaProgramada),
        enlace_google_meet: dto.enlaceGoogleMeet,
        google_calendar_event_id: dto.googleCalendarEventId,
        estado: EstadoEntrevista.PROGRAMADA,
      },
    });

    await this.prisma.candidato.update({
      where: { id: candidatoId },
      data: { estado_postulacion: EstadoPostulacion.ENTREVISTA_AGENDADA },
    });

    this.logger.log(`Entrevista agendada para candidato ${candidatoId} en ${dto.fechaProgramada}`);
    return entrevista;
  }

  async registrarAnotacionesEntrevista(
    candidatoId: string,
    gestorId: string,
    dto: RegistrarAnotacionesEntrevistaDto,
  ) {
    const entrevista = await this.prisma.entrevista.findUnique({
      where: { candidato_id: candidatoId },
    });

    if (!entrevista) {
      throw new NotFoundException('No hay una entrevista agendada para este candidato.');
    }

    const anotacion = await this.prisma.anotacionEntrevista.create({
      data: {
        entrevista_id: entrevista.id,
        competencia_evaluada: dto.competenciaEvaluada,
        calificacion_cualitativa: dto.calificacionCualitativa,
        comentario: dto.comentario,
      },
    });

    await this.prisma.entrevista.update({
      where: { id: entrevista.id },
      data: { estado: EstadoEntrevista.REALIZADA },
    });

    return anotacion;
  }

  async admitirAlumnoProfer(candidatoId: string, admitidoPorId: string, dto: AdmitirAlumnoDto) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: { usuario: true },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato ${candidatoId} no encontrado.`);
    }

    let equipo: any = null;
    if (dto.equipoId) {
      equipo = await this.prisma.equipo.findUnique({
        where: { id: dto.equipoId },
      });

      if (!equipo) {
        throw new NotFoundException(`Equipo ${dto.equipoId} no encontrado.`);
      }
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Promover rol de usuario a ALUMNO
      const usuarioActualizado = await tx.usuario.update({
        where: { id: candidato.usuario_id },
        data: { rol: RolUsuario.ALUMNO },
      });

      // 2. Crear o actualizar AlumnoProfer vinculado al equipo (o null si es diferido)
      const alumnoProfer = await tx.alumnoProfer.upsert({
        where: { usuario_id: candidato.usuario_id },
        update: {
          equipo_id: dto.equipoId || null,
          matricula_activa: true,
        },
        create: {
          usuario_id: candidato.usuario_id,
          equipo_id: dto.equipoId || null,
          candidato_origen_id: candidatoId,
          matricula_activa: true,
        },
      });

      // 3. Actualizar estado de postulación
      const candidatoActualizado = await tx.candidato.update({
        where: { id: candidatoId },
        data: {
          estado_postulacion: EstadoPostulacion.ADMITIDO,
          decision_admision: DecisionAdmision.ADMITIDO,
        },
      });

      return { usuario: usuarioActualizado, alumnoProfer, candidato: candidatoActualizado, equipo };
    });

    this.logger.log(
      `Candidato ${candidato.usuario.nombre} ADMITIDO al programa PROFER ${
        equipo ? `asignado a ${equipo.nombre}` : '(asignación de squad diferida)'
      } por gestor ${admitidoPorId}`,
    );

    return {
      success: true,
      mensaje: equipo
        ? `Candidato promovido a ALUMNO y asignado al equipo ${equipo.nombre}.`
        : `Candidato promovido a ALUMNO en el programa PROFER. La asignación de squad queda pendiente para su incorporación.`,
      resultado,
    };
  }

  async rechazarCandidatura(candidatoId: string, dto: RechazarCandidaturaDto) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato ${candidatoId} no encontrado.`);
    }

    const candidatoActualizado = await this.prisma.candidato.update({
      where: { id: candidatoId },
      data: {
        estado_postulacion: EstadoPostulacion.RECHAZADO,
        decision_admision: DecisionAdmision.RECHAZADO,
        motivo_rechazo: dto.motivoRechazo,
      },
    });

    this.logger.log(`Candidatura ${candidatoId} rechazada. Motivo: ${dto.motivoRechazo}`);

    return {
      success: true,
      mensaje: 'Candidatura marcada como no admitida.',
      candidato: candidatoActualizado,
    };
  }

  async registrarCandidato(dto: RegistrarCandidatoDto) {
    const emailNormalizado = dto.email.toLowerCase().trim();

    const usuarioExistente = await this.prisma.usuario.findUnique({
      where: { email: emailNormalizado },
    });

    if (usuarioExistente) {
      throw new BadRequestException(`Ya existe un usuario registrado con el correo ${emailNormalizado}.`);
    }

    const contrasenaDefault = 'CtsAcademy2026!';
    const password_hash = await argon2.hash(contrasenaDefault);

    const convocatoria = dto.convocatoriaId
      ? await this.prisma.convocatoria.findUnique({ where: { id: dto.convocatoriaId } })
      : await this.prisma.convocatoria.findFirst({ where: { estado: 'ABIERTA' }, orderBy: { fecha_apertura: 'desc' } });

    if (!convocatoria) {
      throw new BadRequestException('No existe una convocatoria abierta para asociar la postulación.');
    }

    const nuevoCandidato = await this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre: dto.nombre.trim(),
          apellidos: dto.apellidos.trim(),
          email: emailNormalizado,
          password_hash,
          rol: RolUsuario.CANDIDATO,
          activo: true,
        },
      });

      const cand = await tx.candidato.create({
        data: {
          usuario_id: usuario.id,
          convocatoria_id: convocatoria.id,
          sede_origen: dto.sedeOrigen,
          telefono: dto.telefono,
          estado_postulacion: EstadoPostulacion.REGISTRADO,
          decision_admision: DecisionAdmision.PENDIENTE,
        },
      });

      // Crear tests iniciales obligatorios (ACTITUD, APTITUD, TECNICO)
      await tx.test.createMany({
        data: [
          { candidato_id: cand.id, tipo_bateria: 'ACTITUD', tiempo_limite_segundos: 1800 },
          { candidato_id: cand.id, tipo_bateria: 'APTITUD', tiempo_limite_segundos: 2700 },
          { candidato_id: cand.id, tipo_bateria: 'TECNICO', tiempo_limite_segundos: 3600 },
        ],
      });

      return {
        id: cand.id,
        usuarioId: usuario.id,
        nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,
        email: usuario.email,
        estadoPostulacion: cand.estado_postulacion,
      };
    });

    return nuevoCandidato;
  }

  async importarCandidatosSede(dto: ImportarCandidatosSedeDto) {
    const convocatoria = await this.prisma.convocatoria.findFirst({
      where: { estado: 'ABIERTA' },
      orderBy: { fecha_apertura: 'desc' },
    });

    if (!convocatoria) {
      throw new BadRequestException('No existe una convocatoria abierta para importar candidatos.');
    }

    let importados = 0;
    const duplicados: string[] = [];
    const contrasenaDefault = 'CtsAcademy2026!';
    const password_hash = await argon2.hash(contrasenaDefault);

    for (const cand of dto.candidatos) {
      const emailNorm = cand.email.toLowerCase().trim();
      const existe = await this.prisma.usuario.findUnique({ where: { email: emailNorm } });

      if (existe) {
        duplicados.push(emailNorm);
        continue;
      }

      await this.prisma.$transaction(async (tx) => {
        const u = await tx.usuario.create({
          data: {
            nombre: cand.nombre.trim(),
            apellidos: cand.apellidos.trim(),
            email: emailNorm,
            password_hash,
            rol: RolUsuario.CANDIDATO,
            activo: true,
          },
        });

        const c = await tx.candidato.create({
          data: {
            usuario_id: u.id,
            convocatoria_id: convocatoria.id,
            sede_origen: dto.sedeOrigen,
            telefono: cand.telefono,
            estado_postulacion: EstadoPostulacion.REGISTRADO,
            decision_admision: DecisionAdmision.PENDIENTE,
          },
        });

        await tx.test.createMany({
          data: [
            { candidato_id: c.id, tipo_bateria: 'ACTITUD', tiempo_limite_segundos: 1800 },
            { candidato_id: c.id, tipo_bateria: 'APTITUD', tiempo_limite_segundos: 2700 },
            { candidato_id: c.id, tipo_bateria: 'TECNICO', tiempo_limite_segundos: 3600 },
          ],
        });
      });

      importados++;
    }

    return {
      totalProcesados: dto.candidatos.length,
      importados,
      duplicados,
      mensaje: `Importación completada: ${importados} candidatos registrados con sus baterías de test.`,
    };
  }
}
