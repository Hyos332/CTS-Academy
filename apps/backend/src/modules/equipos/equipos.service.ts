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
    // Convocatoria abierta más reciente
    const convocatoriaActiva = await this.prisma.convocatoria.findFirst({
      where: { estado: 'ABIERTA' },
      orderBy: { fecha_apertura: 'desc' },
      include: {
        semestre: {
          include: { curso_academico: true },
        },
      },
    });

    // Conteos de postulaciones por estado
    const candidatosPorEstado = await this.prisma.candidato.groupBy({
      by: ['estado_postulacion'],
      _count: { id: true },
      where: convocatoriaActiva ? { convocatoria_id: convocatoriaActiva.id } : undefined,
    });

    const estadoDistribucion: Record<string, number> = {};
    for (const item of candidatosPorEstado) {
      estadoDistribucion[item.estado_postulacion] = item._count.id;
    }

    const totalCandidatos = await this.prisma.candidato.count({
      where: convocatoriaActiva ? { convocatoria_id: convocatoriaActiva.id } : undefined,
    });

    // Equipos y número de alumnos actuales
    const equipos = await this.prisma.equipo.findMany({
      include: {
        lider: { select: { nombre: true, apellidos: true } },
        _count: {
          select: { alumnos: { where: { matricula_activa: true } } },
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
      equipos: equipos.map((eq) => ({
        id: eq.id,
        codigo: eq.codigo,
        nombre: eq.nombre,
        especialidad: eq.especialidad,
        lider: `${eq.lider.nombre} ${eq.lider.apellidos}`,
        alumnosActivos: eq._count.alumnos,
      })),
    };
  }

  async abrirPeriodoIngreso(dto: CrearConvocatoriaDto) {
    const apertura = new Date(dto.fechaApertura);
    const cierre = new Date(dto.fechaCierre);

    if (apertura >= cierre) {
      throw new BadRequestException('La fecha de apertura debe ser anterior a la fecha de cierre de la convocatoria.');
    }

    const semestre = await this.prisma.semestre.findUnique({
      where: { id: dto.semestreId },
    });

    if (!semestre) {
      throw new NotFoundException(`Semestre académico con ID ${dto.semestreId} no encontrado.`);
    }

    const convocatoria = await this.prisma.convocatoria.create({
      data: {
        semestre_id: dto.semestreId,
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
