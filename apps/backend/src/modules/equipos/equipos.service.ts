import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearConvocatoriaDto, CerrarCorteSemestralDto } from './dto/periodo-ingreso.dto';
import { EstadoPostulacion, EstadoEntregaLaboratorio } from '@cts/shared-types';

@Injectable()
export class EquiposService {
  private readonly logger = new Logger(EquiposService.name);

  constructor(private readonly prisma: PrismaService) {}

  async obtenerPanelLider(liderUsuarioId: string) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { lider_usuario_id: liderUsuarioId },
      include: {
        lider: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
          },
        },
        alumnos: {
          where: { matricula_activa: true },
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                email: true,
                rol: true,
              },
            },
          },
        },
        modulos: {
          select: {
            id: true,
            titulo: true,
            orden: true,
          },
        },
      },
    });

    if (!equipo) {
      return {
        mensaje: 'El usuario no tiene un equipo asignado como Tech Leader.',
        equipo: null,
        miembros: [],
        entregablesPendientesCount: 0,
        modulosAsignados: [],
      };
    }

    const alumnosIds = equipo.alumnos.map((a) => a.id);

    // Contar entregas de laboratorios pendientes de revisión
    const entregablesPendientesCount = await this.prisma.entregaLaboratorio.count({
      where: {
        alumno_id: { in: alumnosIds },
        estado: EstadoEntregaLaboratorio.EN_REVISION,
      },
    });

    return {
      equipo: {
        id: equipo.id,
        codigo: equipo.codigo,
        nombre: equipo.nombre,
        especialidad: equipo.especialidad,
        totalMiembros: equipo.alumnos.length,
      },
      miembros: equipo.alumnos.map((a) => ({
        id: a.id,
        usuarioId: a.usuario.id,
        nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`,
        email: a.usuario.email,
        matriculaActiva: a.matricula_activa,
        creadoEn: a.creado_en,
      })),
      entregablesPendientesCount,
      modulosAsignados: equipo.modulos,
    };
  }

  async obtenerPanelAdmisiones() {
    // Todas las convocatorias existentes registradas ordenadas por fecha_apertura desc
    const todasLasConvocatorias = await this.prisma.convocatoria.findMany({
      orderBy: { fecha_apertura: 'desc' },
      include: {
        semestre: {
          include: { curso_academico: true },
        },
        informe_corte: true,
        _count: { select: { candidatos: true } },
      },
    });

    const convocatoriaActiva = todasLasConvocatorias.find((c) => c.estado === 'ABIERTA') || null;
    const ultimaConvocatoria = todasLasConvocatorias[0] || null;

    // Conteos globales de postulaciones por estado
    const candidatosPorEstado = await this.prisma.candidato.groupBy({
      by: ['estado_postulacion'],
      _count: { id: true },
    });

    const estadoDistribucion: Record<string, number> = {};
    for (const item of candidatosPorEstado) {
      estadoDistribucion[item.estado_postulacion] = item._count.id;
    }

    const totalCandidatos = await this.prisma.candidato.count();

    // Semestres disponibles para nuevas convocatorias
    const semestresDisponibles = await this.prisma.semestre.findMany({
      orderBy: { fecha_inicio: 'desc' },
      include: { curso_academico: true },
    });

    // Formateo consolidado de convocatorias
    const convocatoriasFormateadas = todasLasConvocatorias.map((h) => ({
      id: h.id,
      denominacion: h.denominacion,
      estado: h.estado,
      fechaApertura: h.fecha_apertura,
      fechaCierre: h.fecha_cierre,
      modeloAdmision: h.modelo_admision,
      semestre: `${h.semestre.curso_academico.denominacion} - ${h.semestre.periodo}`,
      totalCandidatos: h._count.candidatos,
      tieneInformeCorte: Boolean(h.informe_corte),
    }));

    // Equipos con detalle completo de líderes y miembros
    const equipos = await this.prisma.equipo.findMany({
      orderBy: { codigo: 'asc' },
      include: {
        lider: { select: { id: true, nombre: true, apellidos: true, email: true } },
        alumnos: {
          where: { matricula_activa: true },
          include: {
            usuario: { select: { id: true, nombre: true, apellidos: true, email: true } },
          },
        },
      },
    });

    // Alumnos admitidos en el programa que aún no tienen equipo asignado
    const alumnosSinEquipo = await this.prisma.alumnoProfer.findMany({
      where: { equipo_id: null, matricula_activa: true },
      include: {
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } },
      },
    });

    // Listado de TODOS los candidatos de todas las convocatorias (no se eliminan ni filtran en la BD)
    const candidatos = await this.prisma.candidato.findMany({
      orderBy: { creado_en: 'desc' },
      include: {
        usuario: { select: { id: true, email: true, nombre: true, apellidos: true } },
        convocatoria: {
          select: {
            id: true,
            denominacion: true,
            estado: true,
            semestre: {
              select: {
                periodo: true,
                curso_academico: { select: { denominacion: true } },
              },
            },
          },
        },
        tests: { select: { id: true, tipo_bateria: true, estado: true, calificacion_obtenida: true } },
        entrevista: {
          select: {
            id: true,
            fecha_hora_programada: true,
            estado: true,
            enlace_google_meet: true,
          },
        },
      },
    });

    return {
      convocatoriaActiva: convocatoriaActiva
        ? {
            id: convocatoriaActiva.id,
            denominacion: convocatoriaActiva.denominacion,
            estado: convocatoriaActiva.estado,
            fechaApertura: convocatoriaActiva.fecha_apertura,
            fechaCierre: convocatoriaActiva.fecha_cierre,
            modeloAdmision: convocatoriaActiva.modelo_admision,
            semestre: `${convocatoriaActiva.semestre.curso_academico.denominacion} - ${convocatoriaActiva.semestre.periodo}`,
          }
        : null,
      ultimaConvocatoria: ultimaConvocatoria
        ? {
            id: ultimaConvocatoria.id,
            denominacion: ultimaConvocatoria.denominacion,
            estado: ultimaConvocatoria.estado,
            fechaApertura: ultimaConvocatoria.fecha_apertura,
            fechaCierre: ultimaConvocatoria.fecha_cierre,
            modeloAdmision: ultimaConvocatoria.modelo_admision,
            semestre: `${ultimaConvocatoria.semestre.curso_academico.denominacion} - ${ultimaConvocatoria.semestre.periodo}`,
            tieneInformeCorte: Boolean(ultimaConvocatoria.informe_corte),
          }
        : null,
      convocatorias: convocatoriasFormateadas,
      historicoConvocatorias: convocatoriasFormateadas,
      semestresDisponibles: semestresDisponibles.map((s) => ({
        id: s.id,
        periodo: s.periodo,
        fechaInicio: s.fecha_inicio,
        fechaFin: s.fecha_fin,
        cursoAcademico: s.curso_academico.denominacion,
      })),
      metricasPostulacion: {
        totalCandidatos,
        distribucionPorEstado: estadoDistribucion,
        registrados: estadoDistribucion[EstadoPostulacion.REGISTRADO] || 0,
        enProceso: estadoDistribucion[EstadoPostulacion.EN_PROCESO] || 0,
        testsCompletados: estadoDistribucion[EstadoPostulacion.TESTS_COMPLETADOS] || 0,
        entrevistaAgendada: estadoDistribucion[EstadoPostulacion.ENTREVISTA_AGENDADA] || 0,
        admitidos: estadoDistribucion[EstadoPostulacion.ADMITIDO] || 0,
        rechazados: estadoDistribucion[EstadoPostulacion.RECHAZADO] || 0,
      },
      candidatos: candidatos.map((c) => {
        const perfil = (c.perfil_competencias as any) || {};
        return {
          id: c.id,
          usuarioId: c.usuario_id,
          nombreCompleto: `${c.usuario.nombre} ${c.usuario.apellidos}`,
          email: c.usuario.email,
          sedeOrigen: c.sede_origen,
          telefono: c.telefono,
          estadoPostulacion: c.estado_postulacion,
          decisionAdmision: c.decision_admision,
          perfilCompetencias: c.perfil_competencias,
          invitacionEnviada: Boolean(perfil.invitacion?.enviada),
          fechaInvitacion: perfil.invitacion?.fecha || null,
          convocatoriaId: c.convocatoria_id,
          convocatoriaNombre: c.convocatoria?.denominacion || 'Convocatoria General',
          convocatoriaEstado: c.convocatoria?.estado || 'ABIERTA',
          semestreNombre: c.convocatoria?.semestre
            ? `${c.convocatoria.semestre.curso_academico.denominacion} - ${c.convocatoria.semestre.periodo}`
            : '—',
          tests: c.tests.map((t) => ({
            id: t.id,
            tipoBateria: t.tipo_bateria,
            estado: t.estado,
            calificacion: t.calificacion_obtenida ? Number(t.calificacion_obtenida) : null,
          })),
          entrevista: c.entrevista
            ? {
                id: c.entrevista.id,
                fechaHoraProgramada: c.entrevista.fecha_hora_programada,
                estado: c.entrevista.estado,
                enlaceGoogleMeet: c.entrevista.enlace_google_meet,
              }
            : null,
        };
      }),
      equipos: equipos.map((eq) => ({
        id: eq.id,
        codigo: eq.codigo,
        nombre: eq.nombre,
        especialidad: eq.especialidad,
        lider: `${eq.lider.nombre} ${eq.lider.apellidos}`,
        alumnosActivos: eq.alumnos.length,
        miembros: eq.alumnos.map((a) => ({
          id: a.id,
          usuarioId: a.usuario.id,
          nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`,
          email: a.usuario.email,
          creadoEn: a.creado_en,
        })),
      })),
      alumnosSinEquipo: alumnosSinEquipo.map((a) => ({
        id: a.id,
        usuarioId: a.usuario.id,
        nombreCompleto: `${a.usuario.nombre} ${a.usuario.apellidos}`,
        email: a.usuario.email,
        creadoEn: a.creado_en,
      })),
    };
  }

  async transferirAlumnoEquipo(alumnoId: string, nuevoEquipoId: string | null) {
    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { id: alumnoId },
      include: { usuario: true, equipo: true },
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno PROFER con ID ${alumnoId} no encontrado.`);
    }

    let equipoDestino: any = null;
    if (nuevoEquipoId) {
      equipoDestino = await this.prisma.equipo.findUnique({
        where: { id: nuevoEquipoId },
      });
      if (!equipoDestino) {
        throw new NotFoundException(`Equipo de destino ${nuevoEquipoId} no encontrado.`);
      }
    }

    const alumnoActualizado = await this.prisma.alumnoProfer.update({
      where: { id: alumnoId },
      data: { equipo_id: nuevoEquipoId },
      include: { usuario: true, equipo: true },
    });

    this.logger.log(
      `Alumno ${alumno.usuario.nombre} ${alumno.usuario.apellidos} reasignado de [${
        alumno.equipo ? alumno.equipo.nombre : 'Sin Equipo'
      }] a [${equipoDestino ? equipoDestino.nombre : 'Sin Asignar'}]`,
    );

    return {
      success: true,
      mensaje: equipoDestino
        ? `Alumno ${alumno.usuario.nombre} asignado exitosamente al equipo ${equipoDestino.nombre}.`
        : `Alumno ${alumno.usuario.nombre} desvinculado del equipo (en espera de nueva asignación).`,
      alumno: {
        id: alumnoActualizado.id,
        nombreCompleto: `${alumnoActualizado.usuario.nombre} ${alumnoActualizado.usuario.apellidos}`,
        equipo: alumnoActualizado.equipo ? alumnoActualizado.equipo.nombre : null,
      },
    };
  }

  async abrirPeriodoIngreso(dto: CrearConvocatoriaDto) {
    const apertura = new Date(dto.fechaApertura);
    const cierre = new Date(dto.fechaCierre);

    if (apertura >= cierre) {
      throw new BadRequestException('La fecha de apertura debe ser anterior a la fecha de cierre de la convocatoria.');
    }

    let semestreId = dto.semestreId;

    if (!semestreId) {
      // Si no se proporcionó semestreId existente, se crea un nuevo semestre (y curso si aplica)
      const periodo = dto.periodoSemestre?.trim() || 'SEM-01';
      const cursoDenominacion =
        dto.cursoDenominacion?.trim() || `Curso ${apertura.getFullYear()}-${apertura.getFullYear() + 1}`;
      const anioInicio = dto.anioInicio || apertura.getFullYear();
      const anioFin = dto.anioFin || apertura.getFullYear() + 1;

      let curso = await this.prisma.cursoAcademico.findFirst({
        where: { denominacion: cursoDenominacion },
      });

      if (!curso) {
        curso = await this.prisma.cursoAcademico.create({
          data: {
            denominacion: cursoDenominacion,
            anio_inicio: anioInicio,
            anio_fin: anioFin,
            activo: true,
          },
        });
      }

      const nuevoSemestre = await this.prisma.semestre.create({
        data: {
          curso_academico_id: curso.id,
          periodo: periodo,
          fecha_inicio: apertura,
          fecha_fin: cierre,
        },
      });

      semestreId = nuevoSemestre.id;
    } else {
      const semestre = await this.prisma.semestre.findUnique({
        where: { id: semestreId },
      });

      if (!semestre) {
        throw new NotFoundException(`Semestre académico con ID ${semestreId} no encontrado.`);
      }
    }

    const convocatoria = await this.prisma.convocatoria.create({
      data: {
        semestre_id: semestreId,
        denominacion: dto.denominacion.trim(),
        estado: 'ABIERTA',
        fecha_apertura: apertura,
        fecha_cierre: cierre,
        modelo_admision: dto.modeloAdmision || 'CONTINUA',
      },
    });

    this.logger.log(`Nueva convocatoria de admisión abierta: ${convocatoria.denominacion} (${convocatoria.id})`);
    return convocatoria;
  }

  async reabrirConvocatoria(convocatoriaId: string) {
    const convocatoria = await this.prisma.convocatoria.findUnique({
      where: { id: convocatoriaId },
    });

    if (!convocatoria) {
      throw new NotFoundException(`Convocatoria ${convocatoriaId} no encontrada.`);
    }

    const actualizada = await this.prisma.convocatoria.update({
      where: { id: convocatoriaId },
      data: {
        estado: 'ABIERTA',
      },
    });

    this.logger.log(`Convocatoria ${convocatoria.denominacion} reabierta exitosamente.`);
    return actualizada;
  }

  async cerrarCorteSemestral(convocatoriaId: string, gestorId: string, dto: CerrarCorteSemestralDto) {
    const convocatoria = await this.prisma.convocatoria.findUnique({
      where: { id: convocatoriaId },
      include: {
        candidatos: true,
      },
    });

    if (!convocatoria) {
      throw new NotFoundException(`Convocatoria ${convocatoriaId} no encontrada.`);
    }

    if (convocatoria.estado === 'CERRADA') {
      throw new BadRequestException('La convocatoria seleccionada ya se encuentra formalmente cerrada.');
    }

    const totalPostulados = convocatoria.candidatos.length;
    const totalAdmitidos = convocatoria.candidatos.filter((c) => c.estado_postulacion === EstadoPostulacion.ADMITIDO).length;
    const totalRechazados = convocatoria.candidatos.filter((c) => c.estado_postulacion === EstadoPostulacion.RECHAZADO).length;
    const totalAbandonos = totalPostulados - totalAdmitidos - totalRechazados;

    const firmaHash = `sha256_${Date.now()}_${convocatoriaId.substring(0, 8)}`;

    const resultado = await this.prisma.$transaction(async (tx) => {
      const convActualizada = await tx.convocatoria.update({
        where: { id: convocatoriaId },
        data: {
          estado: 'CERRADA',
          fecha_cierre: new Date(),
        },
      });

      const informe = await tx.informeCorte.create({
        data: {
          convocatoria_id: convocatoriaId,
          gestor_id: gestorId,
          total_postulados: totalPostulados,
          total_admitidos: totalAdmitidos,
          total_rechazados: totalRechazados,
          total_abandonos: totalAbandonos,
          distribucion_equipos: {},
          distribucion_sedes: {},
          firma_hash_inmutable: firmaHash,
        },
      });

      return { convocatoria: convActualizada, informe };
    });

    this.logger.log(`Convocatoria ${convocatoria.denominacion} cerrada formalmente por gestor ${gestorId}. Firma: ${firmaHash}`);

    return {
      success: true,
      mensaje: `Corte semestral formalizado. Informe emitido con firma inmutable.`,
      resultado,
    };
  }
}
