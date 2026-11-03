import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EnviarEntregableDto,
  RevisarEntregableDto,
  AprobarEntregableDto,
  SolicitarCambiosEntregableDto,
  EvaluarCapacitacionAlumnoDto,
  CrearMaterialDto,
  EditarMaterialDto,
  CrearPreguntaDto,
  EditarPreguntaDto,
} from './dto/formacion.dto';
import { EstadoEntregaLaboratorio } from '@cts/shared-types';

@Injectable()
export class FormacionService {
  private readonly logger = new Logger(FormacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  async abrirPanelAlumno(usuarioId: string) {
    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } },
        equipo: true,
        lecturas_material: true,
        entregas_laboratorio: {
          include: {
            laboratorio: {
              include: { modulo: true },
            },
          },
          orderBy: { fecha_envio: 'desc' },
        },
      },
    });

    if (!alumno) {
      throw new NotFoundException('Perfil de AlumnoProfer no encontrado para este usuario.');
    }

    // Módulos asignados al equipo del alumno
    const modulos = await this.prisma.modulo.findMany({
      where: { equipo_propietario_id: alumno.equipo_id },
      include: {
        materiales: { orderBy: { orden: 'asc' } },
        laboratorios: { orderBy: { orden: 'asc' } },
      },
      orderBy: { orden: 'asc' },
    });

    const lecturasSet = new Set(alumno.lecturas_material.map((l) => l.material_id));

    let totalMateriales = 0;
    let materialesLeidos = 0;

    for (const m of modulos) {
      totalMateriales += m.materiales.length;
      for (const mat of m.materiales) {
        if (lecturasSet.has(mat.id)) {
          materialesLeidos++;
        }
      }
    }

    const porcentajeProgreso = totalMateriales > 0 ? Math.round((materialesLeidos / totalMateriales) * 100) : 0;

    return {
      alumno: {
        id: alumno.id,
        nombreCompleto: `${alumno.usuario.nombre} ${alumno.usuario.apellidos}`,
        email: alumno.usuario.email,
        equipo: `${alumno.equipo.codigo} - ${alumno.equipo.nombre}`,
        especialidad: alumno.equipo.especialidad,
        matriculaActiva: alumno.matricula_activa,
      },
      progresoGlobal: {
        porcentaje: porcentajeProgreso,
        materialesLeidos,
        totalMateriales,
      },
      modulos: modulos.map((m) => ({
        id: m.id,
        titulo: m.titulo,
        orden: m.orden,
        descripcion: m.descripcion,
        totalMateriales: m.materiales.length,
        totalLaboratorios: m.laboratorios.length,
      })),
      entregasRecientes: alumno.entregas_laboratorio.slice(0, 5).map((e) => ({
        id: e.id,
        laboratorio: e.laboratorio.titulo,
        modulo: e.laboratorio.modulo.titulo,
        estado: e.estado,
        calificacion: e.calificacion,
        fechaEnvio: e.fecha_envio,
        fechaCalificacion: e.fecha_calificacion,
      })),
    };
  }

  async consultarCapacitacion(capacitacionId: string, usuarioId: string) {
    const capacitacion = await this.prisma.capacitacion.findUnique({
      where: { id: capacitacionId },
      include: {
        modulos: {
          orderBy: { orden: 'asc' },
          include: {
            materiales: {
              orderBy: { orden: 'asc' },
              select: {
                id: true,
                titulo: true,
                orden: true,
                estimado_minutos: true,
              },
            },
            laboratorios: {
              orderBy: { orden: 'asc' },
            },
          },
        },
      },
    });

    if (!capacitacion) {
      throw new NotFoundException(`Capacitación con ID ${capacitacionId} no encontrada.`);
    }

    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { usuario_id: usuarioId },
      include: { lecturas_material: true },
    });

    const leidosSet = new Set(alumno?.lecturas_material.map((l) => l.material_id) || []);

    return {
      id: capacitacion.id,
      trackEspecialidad: capacitacion.track_especialidad,
      modulos: capacitacion.modulos.map((m) => ({
        id: m.id,
        titulo: m.titulo,
        orden: m.orden,
        descripcion: m.descripcion,
        materiales: m.materiales.map((mat) => ({
          ...mat,
          leido: leidosSet.has(mat.id),
        })),
        laboratorios: m.laboratorios,
      })),
    };
  }

  async consultarModulo(moduloId: string, usuarioId: string) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id: moduloId },
      include: {
        capacitacion: true,
        equipo_propietario: true,
        materiales: { orderBy: { orden: 'asc' } },
        laboratorios: { orderBy: { orden: 'asc' } },
        preguntas: {
          where: { activo: true },
          include: {
            opciones: { select: { id: true, texto: true } },
          },
        },
      },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo ${moduloId} no encontrado.`);
    }

    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        lecturas_material: true,
        entregas_laboratorio: {
          where: {
            laboratorio: { modulo_id: moduloId },
          },
        },
      },
    });

    const leidosSet = new Set(alumno?.lecturas_material.map((l) => l.material_id) || []);

    return {
      modulo: {
        id: modulo.id,
        titulo: modulo.titulo,
        descripcion: modulo.descripcion,
        orden: modulo.orden,
        track: modulo.capacitacion.track_especialidad,
        equipo: modulo.equipo_propietario.nombre,
      },
      materiales: modulo.materiales.map((m) => ({
        ...m,
        leido: leidosSet.has(m.id),
      })),
      laboratorios: modulo.laboratorios,
      preguntas: modulo.preguntas,
      misEntregas: alumno?.entregas_laboratorio || [],
    };
  }

  async consultarMaterial(materialId: string, usuarioId: string) {
    const material = await this.prisma.material.findUnique({
      where: { id: materialId },
      include: {
        modulo: {
          select: { id: true, titulo: true, capacitacion_id: true },
        },
      },
    });

    if (!material) {
      throw new NotFoundException(`Material ${materialId} no encontrado.`);
    }

    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (alumno) {
      // Registrar lectura
      await this.prisma.lecturaMaterial.upsert({
        where: {
          material_id_alumno_id: {
            material_id: materialId,
            alumno_id: alumno.id,
          },
        },
        update: { leido_en: new Date() },
        create: {
          material_id: materialId,
          alumno_id: alumno.id,
        },
      });
    }

    return material;
  }

  async enviarEntregable(usuarioId: string, dto: EnviarEntregableDto) {
    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!alumno) {
      throw new ForbiddenException('Solo alumnos registrados pueden enviar entregables de laboratorio.');
    }

    const laboratorio = await this.prisma.laboratorio.findUnique({
      where: { id: dto.laboratorioId },
    });

    if (!laboratorio) {
      throw new NotFoundException(`Laboratorio ${dto.laboratorioId} no encontrado.`);
    }

    // Contar intentos previos
    const entregasPrevias = await this.prisma.entregaLaboratorio.count({
      where: {
        laboratorio_id: dto.laboratorioId,
        alumno_id: alumno.id,
      },
    });

    const entrega = await this.prisma.entregaLaboratorio.create({
      data: {
        laboratorio_id: dto.laboratorioId,
        alumno_id: alumno.id,
        numero_intento: entregasPrevias + 1,
        url_pull_request: dto.urlPullRequest,
        commit_hash: dto.commitHash,
        estado: EstadoEntregaLaboratorio.EN_REVISION,
      },
    });

    this.logger.log(`Entrega de laboratorio registrada: ${entrega.id} (Intento #${entrega.numero_intento}) por alumno ${alumno.id}`);
    return entrega;
  }

  async consultarFeedbackEntregable(entregaId: string, usuarioId: string) {
    const entrega = await this.prisma.entregaLaboratorio.findUnique({
      where: { id: entregaId },
      include: {
        laboratorio: { include: { modulo: true } },
        alumno: {
          include: {
            usuario: { select: { nombre: true, apellidos: true, email: true } },
          },
        },
        tech_leader: { select: { nombre: true, apellidos: true, email: true } },
      },
    });

    if (!entrega) {
      throw new NotFoundException(`Entrega ${entregaId} no encontrada.`);
    }

    return entrega;
  }

  async abrirEntregablesPendientes(techLeaderId: string) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { lider_usuario_id: techLeaderId },
      include: { alumnos: true },
    });

    const alumnosIds = equipo ? equipo.alumnos.map((a) => a.id) : [];

    const entregas = await this.prisma.entregaLaboratorio.findMany({
      where: {
        estado: EstadoEntregaLaboratorio.EN_REVISION,
        alumno_id: alumnosIds.length > 0 ? { in: alumnosIds } : undefined,
      },
      include: {
        laboratorio: { include: { modulo: true } },
        alumno: {
          include: {
            usuario: { select: { nombre: true, apellidos: true, email: true } },
          },
        },
      },
      orderBy: { fecha_envio: 'asc' },
    });

    return entregas;
  }

  async revisarEntregable(entregaId: string, revisorId: string, dto: RevisarEntregableDto) {
    const entrega = await this.prisma.entregaLaboratorio.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      throw new NotFoundException(`Entrega ${entregaId} no encontrada.`);
    }

    const entregaActualizada = await this.prisma.entregaLaboratorio.update({
      where: { id: entregaId },
      data: {
        tech_leader_id: revisorId,
        feedback_general: dto.comentarios,
        calificacion: dto.calificacion,
      },
    });

    return entregaActualizada;
  }

  async aprobarEntregable(entregaId: string, revisorId: string, dto: AprobarEntregableDto) {
    const entrega = await this.prisma.entregaLaboratorio.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      throw new NotFoundException(`Entrega ${entregaId} no encontrada.`);
    }

    const entregaAprobada = await this.prisma.entregaLaboratorio.update({
      where: { id: entregaId },
      data: {
        tech_leader_id: revisorId,
        estado: EstadoEntregaLaboratorio.APROBADO,
        calificacion: dto.calificacion,
        feedback_general: dto.feedbackGeneral,
        fecha_calificacion: new Date(),
      },
    });

    this.logger.log(`Entrega ${entregaId} APROBADA con nota ${dto.calificacion} por ${revisorId}`);
    return entregaAprobada;
  }

  async solicitarCambiosEntregable(entregaId: string, revisorId: string, dto: SolicitarCambiosEntregableDto) {
    const entrega = await this.prisma.entregaLaboratorio.findUnique({
      where: { id: entregaId },
    });

    if (!entrega) {
      throw new NotFoundException(`Entrega ${entregaId} no encontrada.`);
    }

    const entregaConCambios = await this.prisma.entregaLaboratorio.update({
      where: { id: entregaId },
      data: {
        tech_leader_id: revisorId,
        estado: EstadoEntregaLaboratorio.CAMBIOS_SOLICITADOS,
        feedback_general: dto.feedbackGeneral,
        fecha_calificacion: new Date(),
      },
    });

    this.logger.log(`Cambios solicitados en entrega ${entregaId} por ${revisorId}`);
    return entregaConCambios;
  }

  async evaluarCapacitacionAlumno(capacitacionId: string, techLeaderId: string, dto: EvaluarCapacitacionAlumnoDto) {
    const alumno = await this.prisma.alumnoProfer.findUnique({
      where: { id: dto.alumnoId },
    });

    if (!alumno) {
      throw new NotFoundException(`Alumno ${dto.alumnoId} no encontrado.`);
    }

    const evaluacion = await this.prisma.evaluacionSumativa.create({
      data: {
        alumno_id: dto.alumnoId,
        tech_leader_id: techLeaderId,
        nota_final_practica: dto.notaFinalPractica,
        informe_desempeno: dto.informeDesempeno,
        apto_promocion: dto.aptoPromocion,
      },
    });

    this.logger.log(`Evaluación sumativa emitida para alumno ${dto.alumnoId} por Tech Leader ${techLeaderId}`);
    return evaluacion;
  }

  // --- CRUD Materiales ---

  async crearMaterial(dto: CrearMaterialDto) {
    return this.prisma.material.create({
      data: {
        modulo_id: dto.moduloId,
        titulo: dto.titulo,
        contenido_markdown: dto.contenidoMarkdown,
        estimado_minutos: dto.estimadoMinutos || 15,
        orden: dto.orden || 1,
      },
    });
  }

  async editarMaterial(materialId: string, dto: EditarMaterialDto) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      throw new NotFoundException(`Material ${materialId} no encontrado.`);
    }

    return this.prisma.material.update({
      where: { id: materialId },
      data: {
        titulo: dto.titulo,
        contenido_markdown: dto.contenidoMarkdown,
        estimado_minutos: dto.estimadoMinutos,
        orden: dto.orden,
      },
    });
  }

  async eliminarMaterial(materialId: string) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) {
      throw new NotFoundException(`Material ${materialId} no encontrado.`);
    }

    await this.prisma.material.delete({
      where: { id: materialId },
    });

    return { success: true, message: 'Material eliminado exitosamente.' };
  }

  // --- CRUD Preguntas & Banco de ítems ---

  async crearPregunta(dto: CrearPreguntaDto) {
    return this.prisma.$transaction(async (tx) => {
      const pregunta = await tx.pregunta.create({
        data: {
          modulo_id: dto.moduloId,
          enunciado: dto.enunciado,
          tipo_pregunta: dto.tipoPregunta,
          peso_puntos: dto.pesoPuntos || 1.0,
          activo: true,
        },
      });

      if (dto.opciones && dto.opciones.length > 0) {
        await tx.opcionPregunta.createMany({
          data: dto.opciones.map((op) => ({
            pregunta_id: pregunta.id,
            texto: op.texto,
            es_correcta: op.esCorrecta,
          })),
        });
      }

      return pregunta;
    });
  }

  async editarPregunta(preguntaId: string, dto: EditarPreguntaDto) {
    const pregunta = await this.prisma.pregunta.findUnique({ where: { id: preguntaId } });
    if (!pregunta) {
      throw new NotFoundException(`Pregunta ${preguntaId} no encontrada.`);
    }

    return this.prisma.pregunta.update({
      where: { id: preguntaId },
      data: {
        enunciado: dto.enunciado,
        tipo_pregunta: dto.tipoPregunta,
        peso_puntos: dto.pesoPuntos,
        activo: dto.activo,
      },
    });
  }

  async eliminarPregunta(preguntaId: string) {
    const pregunta = await this.prisma.pregunta.findUnique({ where: { id: preguntaId } });
    if (!pregunta) {
      throw new NotFoundException(`Pregunta ${preguntaId} no encontrada.`);
    }

    await this.prisma.pregunta.update({
      where: { id: preguntaId },
      data: {
        activo: false,
        eliminado_en: new Date(),
      },
    });

    return { success: true, message: 'Pregunta desactivada exitosamente.' };
  }
}
