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
      throw new BadRequestException('El test seleccionado ya ha finalizado.');
    }

    // Actualizar estado del test a EN_CURSO si estaba NO_INICIADO
    const testActualizado = await this.prisma.test.update({
      where: { id: testId },
      data: {
        estado: EstadoTest.EN_CURSO,
        fecha_inicio: test.fecha_inicio || new Date(),
      },
    });

    // Actualizar estado de postulación a EN_PROCESO
    if (candidato.estado_postulacion === EstadoPostulacion.REGISTRADO) {
      await this.prisma.candidato.update({
        where: { id: candidato.id },
        data: { estado_postulacion: EstadoPostulacion.EN_PROCESO },
      });
    }

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
        estado: testActualizado.estado,
      },
      preguntas: preguntas.map((p) => ({
        id: p.id,
        enunciado: p.enunciado,
        tipoPregunta: p.tipo_pregunta,
        opciones: p.opciones,
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

    const correctas = test.respuestas.filter((r) => r.es_correcta === true).length;
    const nota = test.respuestas.length > 0 ? (correctas / test.respuestas.length) * 10 : 0;

    const testFinalizado = await this.prisma.test.update({
      where: { id: testId },
      data: {
        estado: EstadoTest.COMPLETADO,
        fecha_finalizacion: new Date(),
        calificacion_obtenida: nota,
      },
    });

    // Radar simplificado
    const perfilRadar = {
      dimensiones: {
        actitud: { puntaje: 85 },
        aptitud: { puntaje: 80 },
        tecnico: { puntaje: Math.round(nota * 10) },
      },
      indiceAfinidadGlobal: Math.round((85 + 80 + nota * 10) / 3),
      fechaCalculo: new Date().toISOString(),
    };

    await this.prisma.candidato.update({
      where: { id: candidato.id },
      data: {
        estado_postulacion: EstadoPostulacion.TESTS_COMPLETADOS,
        perfil_competencias: perfilRadar,
      },
    });

    return {
      success: true,
      test: testFinalizado,
      perfilRadar,
      mensaje: 'Test finalizado. Postulación en estado TESTS_COMPLETADOS.',
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

    return candidato;
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

    const equipo = await this.prisma.equipo.findUnique({
      where: { id: dto.equipoId },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo ${dto.equipoId} no encontrado.`);
    }

    const resultado = await this.prisma.$transaction(async (tx) => {
      // 1. Promover rol de usuario a ALUMNO
      const usuarioActualizado = await tx.usuario.update({
        where: { id: candidato.usuario_id },
        data: { rol: RolUsuario.ALUMNO },
      });

      // 2. Crear AlumnoProfer vinculado al equipo
      const alumnoProfer = await tx.alumnoProfer.create({
        data: {
          usuario_id: candidato.usuario_id,
          equipo_id: dto.equipoId,
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

    this.logger.log(`Candidato ${candidato.usuario.nombre} ADMITIDO al equipo ${equipo.nombre} por gestor ${admitidoPorId}`);

    return {
      success: true,
      mensaje: `Candidato promovido a ALUMNO y asignado al equipo ${equipo.nombre}.`,
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
