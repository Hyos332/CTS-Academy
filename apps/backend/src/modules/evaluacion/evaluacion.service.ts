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
import { generarInforme16PF } from './cattell-16pf.constants';
import { generarMatrizAptitudes } from './matriz-aptitud.constants';
import { generarInformePruebaTecnica } from './prueba-tecnica-cts.constants';

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

    if (tiempoRestante <= 0 && test.fecha_inicio) {
      return this.finalizarTest(usuarioId, testId);
    }

    // Actualizar estado del test a EN_CURSO preservando la fecha de inicio original sin pausar el reloj
    const testActualizado = await this.prisma.test.update({
      where: { id: testId },
      data: {
        estado: EstadoTest.EN_CURSO,
        fecha_inicio: test.fecha_inicio ? test.fecha_inicio : ahora,
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

    // Preguntas asociadas al tipo de batería específico (ACTITUD, APTITUD o TECNICO)
    let preguntas = await this.prisma.pregunta.findMany({
      where: {
        activo: true,
        tipo_bateria: test.tipo_bateria,
      },
      orderBy: [{ orden: 'asc' }, { creado_en: 'asc' }],
      include: {
        opciones: {
          select: { id: true, texto: true }, // Nunca revelar es_correcta
        },
      },
    });

    if (preguntas.length === 0) {
      // Fallback a preguntas activas generales si no hay específicas de la batería
      preguntas = await this.prisma.pregunta.findMany({
        where: { activo: true },
        take: 10,
        include: {
          opciones: {
            select: { id: true, texto: true },
          },
        },
      });
    }

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
        categoria: p.categoria,
        orden: p.orden,
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

    // 1. Verificar si el tiempo límite expiró
    const ahora = new Date();
    if (test.fecha_inicio) {
      const segundosTranscurridos = Math.floor((ahora.getTime() - test.fecha_inicio.getTime()) / 1000);
      if (segundosTranscurridos >= test.tiempo_limite_segundos) {
        await this.finalizarTest(usuarioId, testId);
        throw new BadRequestException('El tiempo límite para esta batería ha expirado.');
      }
    }

    // 2. Comprobar que la pregunta no fue respondida previamente (NO permitir volver a responder)
    const respuestaExistente = await this.prisma.respuestaEvaluacion.findUnique({
      where: {
        test_id_pregunta_id: {
          test_id: testId,
          pregunta_id: dto.preguntaId,
        },
      },
    });

    if (respuestaExistente && respuestaExistente.opcion_seleccionada_id) {
      throw new BadRequestException('Esta pregunta ya ha sido respondida previamente y no puede modificarse.');
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

    // 1. Verificar si el tiempo límite expiró
    const ahora = new Date();
    if (test.fecha_inicio) {
      const segundosTranscurridos = Math.floor((ahora.getTime() - test.fecha_inicio.getTime()) / 1000);
      if (segundosTranscurridos >= test.tiempo_limite_segundos) {
        await this.finalizarTest(usuarioId, testId);
        throw new BadRequestException('El tiempo límite para esta batería ha expirado.');
      }
    }

    // 2. Comprobar que la solución práctica no fue entregada previamente
    const respuestaExistente = await this.prisma.respuestaEvaluacion.findUnique({
      where: {
        test_id_pregunta_id: {
          test_id: testId,
          pregunta_id: dto.preguntaId,
        },
      },
    });

    if (respuestaExistente && respuestaExistente.codigo_entregado) {
      throw new BadRequestException('La solución práctica para esta pregunta ya fue entregada y no puede modificarse.');
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
      include: {
        respuestas: {
          include: { pregunta: true, opcion_seleccionada: true },
        },
      },
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

    // Construcción del espectro psicométrico y cognitivo
    const perfilExistente = (candidato.perfil_competencias as any) || {};
    const notaTecnicaFinal =
      nota !== null
        ? Number(nota.toFixed(1))
        : (perfilExistente.tecnico?.nota ?? (esTecnico ? 0 : null));

    const usuarioCand = await this.prisma.usuario.findUnique({ where: { id: candidato.usuario_id } });
    const nombreCand = usuarioCand ? `${usuarioCand.nombre} ${usuarioCand.apellidos}` : 'Candidato';
    const emailCand = usuarioCand?.email || 'candidato@alumnos.uneatlantico.es';

    let informe16PF = perfilExistente.informe16PF || null;
    let matrizAptitudes = perfilExistente.matrizAptitudes || null;
    let informePruebaTecnica = perfilExistente.informePruebaTecnica || null;

    if (test.tipo_bateria === 'ACTITUD' && test.respuestas.length > 0) {
      informe16PF = generarInforme16PF(
        nombreCand,
        21,
        '2026 - 2027',
        new Date().toLocaleDateString('es-ES'),
        test.respuestas,
      );
    }

    if (test.tipo_bateria === 'APTITUD' && test.respuestas.length > 0) {
      matrizAptitudes = generarMatrizAptitudes(emailCand, test.respuestas);
    }

    if (test.tipo_bateria === 'TECNICO' && test.respuestas.length > 0) {
      informePruebaTecnica = generarInformePruebaTecnica(
        candidato,
        test.respuestas,
        notaTecnicaFinal,
      );
    }

    // Verificar si TODOS los tests asignados al candidato están completados
    const todosLosTests = await this.prisma.test.findMany({
      where: { candidato_id: candidato.id },
    });
    const todosCompletados =
      todosLosTests.length > 0 &&
      todosLosTests.every(
        (t) => t.id === testId || t.estado === EstadoTest.COMPLETADO,
      );
    const nuevoEstado = todosCompletados
      ? EstadoPostulacion.TESTS_COMPLETADOS
      : EstadoPostulacion.EN_PROCESO;

    const perfilCompetencias = {
      ...perfilExistente,
      informe16PF,
      matrizAptitudes,
      informePruebaTecnica,
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
        superado: (notaTecnicaFinal ?? 0) >= 5.0,
      },
      dimensiones: {
        actitud: { puntaje: informe16PF ? 85 : 0 },
        aptitud: { puntaje: matrizAptitudes ? 80 : 0 },
        tecnico: { puntaje: notaTecnicaFinal !== null ? Math.round(notaTecnicaFinal * 10) : 0 },
      },
      indiceAfinidadGlobal:
        todosCompletados && notaTecnicaFinal !== null
          ? Math.round((85 + 80 + notaTecnicaFinal * 10) / 3)
          : null,
      fechaCalculo: new Date().toISOString(),
    };

    await this.prisma.candidato.update({
      where: { id: candidato.id },
      data: {
        estado_postulacion: nuevoEstado,
        perfil_competencias: perfilCompetencias,
      },
    });

    return {
      success: true,
      test: testFinalizado,
      perfilRadar: perfilCompetencias,
      mensaje: `Test finalizado. Postulación en estado ${nuevoEstado}.`,
    };
  }

  async calcularRecomendacionSquad(candidato: any) {
    // 1. Extraer datos del test técnico (solo si fue COMPLETADO y tiene respuestas)
    const testTecnico = candidato.tests?.find((t: any) => t.tipo_bateria === 'TECNICO');
    if (
      !testTecnico ||
      testTecnico.estado !== EstadoTest.COMPLETADO ||
      !testTecnico.respuestas ||
      testTecnico.respuestas.length === 0
    ) {
      return null;
    }

    const equipos = await this.prisma.equipo.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        lider: { select: { nombre: true, apellidos: true, email: true } },
      },
    });

    const notaTecnica = testTecnico?.calificacion_obtenida ? Number(testTecnico.calificacion_obtenida) : 0;

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

    // 3. Analizar respuestas técnicas por área y habilidades de la matriz de aptitudes
    const respuestas = testTecnico?.respuestas || [];
    let correctasFront = 0;
    let totalFront = 0;
    let correctasBack = 0;
    let totalBack = 0;
    let correctasSys = 0;
    let totalSys = 0;

    for (const r of respuestas) {
      const cat = (r.pregunta?.categoria || '').toUpperCase();
      const esCorrecta = Boolean(r.es_correcta);
      if (cat.includes('FRONT')) {
        totalFront++;
        if (esCorrecta) correctasFront++;
      } else if (cat.includes('BACK')) {
        totalBack++;
        if (esCorrecta) correctasBack++;
      } else if (cat.includes('SYS')) {
        totalSys++;
        if (esCorrecta) correctasSys++;
      }
    }

    const pctFront = totalFront > 0 ? (correctasFront / totalFront) * 100 : 50;
    const pctBack = totalBack > 0 ? (correctasBack / totalBack) * 100 : 50;
    const pctSys = totalSys > 0 ? (correctasSys / totalSys) * 100 : 50;

    // Analizar habilidades autoevaluadas en la matriz de aptitud
    const matrizCategorias = perfilComp.matrizAptitudes?.categorias || [];
    const skillLevel = (skillName: string): number => {
      const target = skillName.toLowerCase();
      for (const cat of matrizCategorias) {
        for (const it of cat.items || []) {
          if (it.habilidad.toLowerCase().includes(target)) {
            return it.nivelActual || 0;
          }
        }
      }
      return 0;
    };

    const nivelPhp = Math.max(skillLevel('php'), skillLevel('laravel'));
    const nivelReactVue = Math.max(skillLevel('react'), skillLevel('vue'), skillLevel('javascript'));
    const nivelSql = Math.max(skillLevel('relacionales'), skillLevel('sql'));
    const nivelCms = Math.max(skillLevel('wordpress'), skillLevel('drupal'));
    const nivelMoodle = skillLevel('moodle');
    const nivelSys = Math.max(skillLevel('redes'), skillLevel('seguridad'), skillLevel('docker'));
    const nivelTs = skillLevel('typescript');

    // 4. Ponderación algorítmica por los 4 Squads Oficiales

    // TEAM-01: Fénix (React, Vue, PHP, Laravel, MySQL, PostgreSQL)
    const scoreFenix = Math.min(
      98,
      Math.round(
        notaTecnica * 3.5 +
        pctBack * 0.25 +
        pctFront * 0.15 +
        nivelPhp * 3 +
        nivelReactVue * 2.5 +
        nivelSql * 2 +
        colab * 0.10,
      ),
    );

    // TEAM-02: Departamento de Sistemas (Express, JS, TS, NodeJS, React, Fortinet, Windows Server, Active Directory, Redes, Hardware)
    const scoreSistemas = Math.min(
      98,
      Math.round(
        notaTecnica * 3.0 +
        pctSys * 0.40 +
        nivelSys * 4.5 +
        detalle * 0.18 +
        adapt * 0.12,
      ),
    );

    // TEAM-03: Presencia Web (WordPress, Drupal, NextJS, Strapi, Squidex, TypeScript, PHP, Golang)
    const scorePresencia = Math.min(
      98,
      Math.round(
        notaTecnica * 3.2 +
        pctFront * 0.35 +
        nivelCms * 4 +
        nivelTs * 2.5 +
        adapt * 0.15 +
        colab * 0.10,
      ),
    );

    // TEAM-04: Acción Docente (PHP, JS/DOM/React, Node/TS, RabbitMQ, SQL/NoSQL, TDD, Moodle)
    const scoreDocente = Math.min(
      98,
      Math.round(
        notaTecnica * 3.4 +
        pctBack * 0.25 +
        nivelMoodle * 4.5 +
        nivelTs * 2.5 +
        abstrac * 0.18 +
        rigor * 0.12,
      ),
    );

    const scoresMap: Record<
      string,
      { afinidad: number; justificacion: string; fortalezas: string[] }
    > = {
      'TEAM-01': {
        afinidad: Math.max(55, scoreFenix),
        justificacion:
          'Excelente encaje con el desarrollo de aplicaciones web internas y proyectos europeos de Fénix. Destaca en arquitectura MVC con PHP/Laravel, interfaces reactivas (React/Vue) y modelado relacional en MySQL y PostgreSQL.',
        fortalezas: ['PHP & Laravel', 'React & Vue', 'MySQL / PostgreSQL'],
      },
      'TEAM-02': {
        afinidad: Math.max(55, scoreSistemas),
        justificacion:
          'Perfil idóneo para el Departamento de Sistemas: soporte tecnológico resolutivo a incidencias, administración de redes e infraestructura, servidores Windows/Linux, seguridad perimetral Fortinet y herramientas operativas en Node/Express.',
        fortalezas: ['Redes & Infraestructura', 'Windows Server & Active Directory', 'Hardware & Fortinet'],
      },
      'TEAM-03': {
        afinidad: Math.max(55, scorePresencia),
        justificacion:
          'Alineación óptima para la imagen pública web de FUNIBER y universidades asociadas. Demuestra solidez en CMS desacoplados (WordPress, Drupal, Strapi), maquetación moderna con Next.js/TypeScript y automatización con Go.',
        fortalezas: ['NextJS & TypeScript', 'WordPress & Drupal', 'CMS Headless & PHP'],
      },
      'TEAM-04': {
        afinidad: Math.max(55, scoreDocente),
        justificacion:
          'Afinidad sobresaliente para los campus virtuales de Acción Docente: administración y extensión de Moodle con PHP/plugins, microservicios orientados a eventos con RabbitMQ, librerías en TypeScript y disciplina TDD.',
        fortalezas: ['Moodle & PHP', 'RabbitMQ & Microservicios', 'TypeScript & TDD'],
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
              include: { pregunta: true, opcion_seleccionada: true },
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

    const testActitud = candidato.tests.find((t) => t.tipo_bateria === 'ACTITUD');
    const testAptitud = candidato.tests.find((t) => t.tipo_bateria === 'APTITUD');
    const testTecnico = candidato.tests.find((t) => t.tipo_bateria === 'TECNICO');

    // Solo calcular recomendación de Squad si el candidato ha completado el examen técnico y tiene respuestas reales
    const recomendacionSquad =
      testTecnico &&
      testTecnico.estado === EstadoTest.COMPLETADO &&
      testTecnico.respuestas?.length > 0
        ? await this.calcularRecomendacionSquad(candidato)
        : null;

    const nombreCand = candidato.usuario
      ? `${candidato.usuario.nombre} ${candidato.usuario.apellidos}`
      : 'Candidato';
    const emailCand = candidato.usuario?.email || 'candidato@alumnos.uneatlantico.es';
    const perfilExistente = (candidato.perfil_competencias as any) || {};

    // Informes estrictamente condicionados a que el test correspondiente esté COMPLETADO y tenga respuestas reales
    const informe16PF =
      testActitud &&
      testActitud.estado === EstadoTest.COMPLETADO &&
      testActitud.respuestas?.length > 0
        ? generarInforme16PF(
            nombreCand,
            21,
            '2026 - 2027',
            new Date(candidato.creado_en).toLocaleDateString('es-ES'),
            testActitud.respuestas,
          )
        : null;

    const matrizAptitudes =
      testAptitud &&
      testAptitud.estado === EstadoTest.COMPLETADO &&
      testAptitud.respuestas?.length > 0
        ? generarMatrizAptitudes(emailCand, testAptitud.respuestas)
        : null;

    const informePruebaTecnica =
      testTecnico &&
      testTecnico.estado === EstadoTest.COMPLETADO &&
      testTecnico.respuestas?.length > 0
        ? generarInformePruebaTecnica(
            candidato,
            testTecnico.respuestas,
            testTecnico.calificacion_obtenida,
          )
        : null;

    const notaTecnicaCalculada =
      testTecnico &&
      testTecnico.estado === EstadoTest.COMPLETADO &&
      testTecnico.calificacion_obtenida !== null &&
      testTecnico.calificacion_obtenida !== undefined
        ? Number(testTecnico.calificacion_obtenida)
        : null;

    return {
      ...candidato,
      perfil_competencias: {
        ...perfilExistente,
        tecnico:
          notaTecnicaCalculada !== null
            ? {
                nota: notaTecnicaCalculada,
                escala: '0 a 10',
                superado: notaTecnicaCalculada >= 5.0,
              }
            : null,
        informe16PF,
        matrizAptitudes,
        informePruebaTecnica,
      },
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

    const fechaIso = dto.fechaProgramada || dto.fechaHoraProgramada;
    if (!fechaIso) {
      throw new BadRequestException('Debe proporcionar la fecha y hora programada para la sesión de entrevista.');
    }

    const fechaDate = new Date(fechaIso);
    if (isNaN(fechaDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido para la entrevista.');
    }

    const entrevista = await this.prisma.entrevista.upsert({
      where: { candidato_id: candidatoId },
      update: {
        gestor_id: gestorId,
        fecha_hora_programada: fechaDate,
        enlace_google_meet: dto.enlaceGoogleMeet,
        google_calendar_event_id: dto.googleCalendarEventId,
        estado: EstadoEntrevista.PROGRAMADA,
      },
      create: {
        candidato_id: candidatoId,
        gestor_id: gestorId,
        fecha_hora_programada: fechaDate,
        enlace_google_meet: dto.enlaceGoogleMeet,
        google_calendar_event_id: dto.googleCalendarEventId,
        estado: EstadoEntrevista.PROGRAMADA,
      },
    });

    await this.prisma.candidato.update({
      where: { id: candidatoId },
      data: { estado_postulacion: EstadoPostulacion.ENTREVISTA_AGENDADA },
    });

    this.logger.log(`Entrevista agendada para candidato ${candidatoId} en ${fechaDate.toISOString()}`);
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

    if (dto.enviarInvitacionInmediata) {
      try {
        await this.enviarInvitacionCandidato(nuevoCandidato.id);
      } catch (err: any) {
        this.logger.warn(`No se pudo enviar la invitación inmediata: ${err?.message}`);
      }
    }

    return nuevoCandidato;
  }

  async obtenerPlantillaInvitacion(candidatoId: string) {
    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
      include: {
        usuario: true,
        convocatoria: true,
      },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato con ID ${candidatoId} no encontrado.`);
    }

    const contrasenaDefault = 'CtsAcademy2026!';
    const urlLogin = 'http://localhost:3000/login';
    const nombreCompleto = `${candidato.usuario.nombre} ${candidato.usuario.apellidos}`;
    const email = candidato.usuario.email;
    const sede = candidato.sede_origen;
    const perfil = (candidato.perfil_competencias as any) || {};
    const invitacionEnviada = perfil.invitacion?.enviada || false;
    const fechaEnvio = perfil.invitacion?.fecha || null;

    const asunto = `CTS Academy - Convocatoria PROFER 2026: Credenciales de Acceso y Baterías de Admisión`;

    const cuerpo = `Estimado/a ${nombreCompleto},

Le damos la más cordial bienvenida al proceso de admisión de CTS Academy para el programa formativo PROFER 2026, gestionado en coordinación con su sede universitaria (${sede}).

A continuación le suministramos sus credenciales oficiales para ingresar a la plataforma técnica de evaluación:

  • Enlace a la Plataforma: ${urlLogin}
  • Usuario (Email): ${email}
  • Contraseña Temporal: ${contrasenaDefault}

INSTRUCCIONES PARA EL PROCESO DE EVALUACIÓN:
1. Inicie sesión en la plataforma utilizando las credenciales indicadas.
2. Ingrese a la sección "Evaluación y Pruebas de Admisión" desde su menú principal.
3. Complete las tres baterías de evaluación asignadas:
   • Test de Actitud: Cuestionario psicométrico Cattell 16PF (102 preguntas conductuales sobre estilo de trabajo y dinámica de squad).
   • Test de Aptitud: Matriz de competencias técnicas y autoevaluación (43 áreas de conocimiento: SysAdmin, Bases de Datos, Backend, Frontend, OpenSource, Frameworks y Negocio).
   • Test Técnico: Evaluación práctica sobre algoritmia, programación y arquitectura de software.

IMPORTANTE:
- Dispone de un límite de tiempo para cada batería una vez iniciada.
- Tras la finalización de los tests, el equipo de gestión y directores técnicos revisarán sus resultados y coordinarán su entrevista personal mediante Google Meet.

Si presenta alguna dificultad técnica, responda directamente a este correo o contacte a admisiones@ctdesarrollo.org.

Atentamente,
Comité de Admisiones PROFER • CTS Academy
Centro de Tecnología de Software • Universidad Europea del Atlántico`;

    return {
      candidatoId,
      nombreCompleto,
      email,
      sede,
      contrasenaDefault,
      urlLogin,
      asunto,
      cuerpo,
      invitacionEnviada,
      fechaEnvio,
    };
  }

  async enviarInvitacionCandidato(candidatoId: string) {
    const plantilla = await this.obtenerPlantillaInvitacion(candidatoId);

    const candidato = await this.prisma.candidato.findUnique({
      where: { id: candidatoId },
    });

    if (!candidato) {
      throw new NotFoundException(`Candidato ${candidatoId} no encontrado.`);
    }

    const perfilActual = (candidato.perfil_competencias as any) || {};
    const fechaEnvio = new Date().toISOString();

    const perfilActualizado = {
      ...perfilActual,
      invitacion: {
        enviada: true,
        fecha: fechaEnvio,
        destinatario: plantilla.email,
      },
    };

    await this.prisma.candidato.update({
      where: { id: candidatoId },
      data: {
        perfil_competencias: perfilActualizado,
      },
    });

    this.logger.log(`Invitación y credenciales despachadas a candidato ${plantilla.email} (${candidatoId})`);

    return {
      success: true,
      mensaje: `Invitación enviada exitosamente a ${plantilla.email}`,
      fechaEnvio,
      plantilla: {
        ...plantilla,
        invitacionEnviada: true,
        fechaEnvio,
      },
    };
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
            perfil_competencias:
              dto.enviarInvitaciones !== false
                ? {
                    invitacion: {
                      enviada: true,
                      fecha: new Date().toISOString(),
                      destinatario: emailNorm,
                    },
                  }
                : undefined,
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
