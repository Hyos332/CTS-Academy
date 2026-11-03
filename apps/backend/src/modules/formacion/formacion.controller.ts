import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { FormacionService } from './formacion.service';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolUsuario } from '@cts/shared-types';

@ApiTags('PK03 - MotorFormacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('formacion')
export class FormacionController {
  constructor(private readonly formacionService: FormacionService) {}

  @Get('alumnos/panel')
  @Roles(RolUsuario.ALUMNO)
  @ApiOperation({
    summary: 'Abrir panel del alumno (CU: abrirPanelAlumno)',
    description: 'Devuelve equipo asignado, progreso global de materiales y entregables de laboratorios recientes.',
  })
  @ApiResponse({ status: 200, description: 'Panel del estudiante' })
  async abrirPanelAlumno(@CurrentUser('id') usuarioId: string) {
    return this.formacionService.abrirPanelAlumno(usuarioId);
  }

  @Get('capacitaciones/:id')
  @Roles(RolUsuario.ALUMNO, RolUsuario.LIDER_EQUIPO, RolUsuario.GESTOR)
  @ApiParam({ name: 'id', description: 'UUID de la capacitación' })
  @ApiOperation({
    summary: 'Consultar detalle de capacitación (CU: consultarCapacitacion)',
    description: 'Estructura modular completa con índice de materiales, laboratorios y avance de lecturas.',
  })
  @ApiResponse({ status: 200, description: 'Detalle de capacitación' })
  async consultarCapacitacion(@Param('id') capacitacionId: string, @CurrentUser('id') usuarioId: string) {
    return this.formacionService.consultarCapacitacion(capacitacionId, usuarioId);
  }

  @Get('modulos/:id')
  @Roles(RolUsuario.ALUMNO, RolUsuario.LIDER_EQUIPO, RolUsuario.GESTOR)
  @ApiParam({ name: 'id', description: 'UUID del módulo formativo' })
  @ApiOperation({
    summary: 'Consultar contenido de un módulo (CU: consultarModulo)',
    description: 'Materiales Markdown, laboratorios prácticos y banco de preguntas.',
  })
  @ApiResponse({ status: 200, description: 'Contenido del módulo' })
  async consultarModulo(@Param('id') moduloId: string, @CurrentUser('id') usuarioId: string) {
    return this.formacionService.consultarModulo(moduloId, usuarioId);
  }

  @Get('materiales/:id')
  @Roles(RolUsuario.ALUMNO, RolUsuario.LIDER_EQUIPO, RolUsuario.GESTOR)
  @ApiParam({ name: 'id', description: 'UUID del material didáctico' })
  @ApiOperation({
    summary: 'Consultar recurso didáctico (CU: consultarMaterial)',
    description: 'Recupera el contenido Markdown y registra automáticamente la lectura para el alumno.',
  })
  @ApiResponse({ status: 200, description: 'Contenido del material' })
  async consultarMaterial(@Param('id') materialId: string, @CurrentUser('id') usuarioId: string) {
    return this.formacionService.consultarMaterial(materialId, usuarioId);
  }

  @Post('entregables')
  @Roles(RolUsuario.ALUMNO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Enviar entregable práctico de laboratorio (CU: enviarEntregable)',
    description: 'Registra el Pull Request y commit hash para revisión del Tech Leader.',
  })
  @ApiResponse({ status: 201, description: 'Entregable enviado' })
  async enviarEntregable(@CurrentUser('id') usuarioId: string, @Body() dto: EnviarEntregableDto) {
    return this.formacionService.enviarEntregable(usuarioId, dto);
  }

  @Get('entregables/:id/feedback')
  @Roles(RolUsuario.ALUMNO, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID del entregable' })
  @ApiOperation({
    summary: 'Consultar feedback de entrega de laboratorio (CU: consultarFeedbackEntregable)',
    description: 'Historial de revisiones, notas y comentarios asignados por el Tech Leader.',
  })
  @ApiResponse({ status: 200, description: 'Feedback del entregable' })
  async consultarFeedbackEntregable(@Param('id') entregableId: string, @CurrentUser('id') usuarioId: string) {
    return this.formacionService.consultarFeedbackEntregable(entregableId, usuarioId);
  }

  @Get('entregables/pendientes')
  @Roles(RolUsuario.LIDER_EQUIPO)
  @ApiOperation({
    summary: 'Bandeja de entregables pendientes de revisión (CU: abrirEntregablesPendientes)',
    description: 'Lista los trabajos prácticos de los alumnos del equipo en espera de calificación.',
  })
  @ApiResponse({ status: 200, description: 'Lista de entregables pendientes' })
  async abrirEntregablesPendientes(@CurrentUser('id') techLeaderId: string) {
    return this.formacionService.abrirEntregablesPendientes(techLeaderId);
  }

  @Post('entregables/:id/revisar')
  @Roles(RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del entregable' })
  @ApiOperation({
    summary: 'Iniciar o registrar revisión preliminar (CU: revisarEntregable)',
    description: 'Asigna el revisor y guarda comentarios preliminares.',
  })
  @ApiResponse({ status: 200, description: 'Revisión registrada' })
  async revisarEntregable(
    @Param('id') entregableId: string,
    @CurrentUser('id') revisorId: string,
    @Body() dto: RevisarEntregableDto,
  ) {
    return this.formacionService.revisarEntregable(entregableId, revisorId, dto);
  }

  @Post('entregables/:id/aprobar')
  @Roles(RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del entregable' })
  @ApiOperation({
    summary: 'Aprobar entregable práctico (CU: aprobarEntregable)',
    description: 'Asigna calificación satisfactoria (0.00-10.00) y da por concluido el laboratorio.',
  })
  @ApiResponse({ status: 200, description: 'Entregable aprobado' })
  async aprobarEntregable(
    @Param('id') entregableId: string,
    @CurrentUser('id') revisorId: string,
    @Body() dto: AprobarEntregableDto,
  ) {
    return this.formacionService.aprobarEntregable(entregableId, revisorId, dto);
  }

  @Post('entregables/:id/solicitar-cambios')
  @Roles(RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del entregable' })
  @ApiOperation({
    summary: 'Solicitar cambios en entregable (CU: solicitarCambiosEntregable)',
    description: 'Marca el estado como CAMBIOS_SOLICITADOS con observaciones técnicas para reentrega.',
  })
  @ApiResponse({ status: 200, description: 'Cambios solicitados' })
  async solicitarCambiosEntregable(
    @Param('id') entregableId: string,
    @CurrentUser('id') revisorId: string,
    @Body() dto: SolicitarCambiosEntregableDto,
  ) {
    return this.formacionService.solicitarCambiosEntregable(entregableId, revisorId, dto);
  }

  @Post('capacitaciones/:id/evaluar-alumno')
  @Roles(RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID de la capacitación' })
  @ApiOperation({
    summary: 'Emitir evaluación sumativa para un alumno (CU: evaluarCapacitacionAlumno)',
    description: 'Emite informe de desempeño, calificación práctica final y aptitud de promoción.',
  })
  @ApiResponse({ status: 200, description: 'Evaluación sumativa emitida' })
  async evaluarCapacitacionAlumno(
    @Param('id') capacitacionId: string,
    @CurrentUser('id') evaluadorId: string,
    @Body() dto: EvaluarCapacitacionAlumnoDto,
  ) {
    return this.formacionService.evaluarCapacitacionAlumno(capacitacionId, evaluadorId, dto);
  }

  // --- Materiales (Gestor & Líder) ---

  @Post('materiales')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear material didáctico (CU: crearMaterial)' })
  @ApiResponse({ status: 201, description: 'Material creado' })
  async crearMaterial(@Body() dto: CrearMaterialDto) {
    return this.formacionService.crearMaterial(dto);
  }

  @Put('materiales/:id')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID del material' })
  @ApiOperation({ summary: 'Editar material didáctico (CU: editarMaterial)' })
  @ApiResponse({ status: 200, description: 'Material actualizado' })
  async editarMaterial(@Param('id') materialId: string, @Body() dto: EditarMaterialDto) {
    return this.formacionService.editarMaterial(materialId, dto);
  }

  @Delete('materiales/:id')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID del material' })
  @ApiOperation({ summary: 'Eliminar material didáctico (CU: eliminarMaterial)' })
  @ApiResponse({ status: 200, description: 'Material eliminado' })
  async eliminarMaterial(@Param('id') materialId: string) {
    return this.formacionService.eliminarMaterial(materialId);
  }

  // --- Preguntas & Banco de ítems ---

  @Post('preguntas')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear pregunta didáctica (CU: crearPregunta)' })
  @ApiResponse({ status: 201, description: 'Pregunta creada' })
  async crearPregunta(@Body() dto: CrearPreguntaDto) {
    return this.formacionService.crearPregunta(dto);
  }

  @Put('preguntas/:id')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID de la pregunta' })
  @ApiOperation({ summary: 'Editar pregunta didáctica (CU: editarPregunta)' })
  @ApiResponse({ status: 200, description: 'Pregunta actualizada' })
  async editarPregunta(@Param('id') preguntaId: string, @Body() dto: EditarPreguntaDto) {
    return this.formacionService.editarPregunta(preguntaId, dto);
  }

  @Delete('preguntas/:id')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID de la pregunta' })
  @ApiOperation({ summary: 'Eliminar pregunta didáctica (CU: eliminarPregunta)' })
  @ApiResponse({ status: 200, description: 'Pregunta desactivada' })
  async eliminarPregunta(@Param('id') preguntaId: string) {
    return this.formacionService.eliminarPregunta(preguntaId);
  }
}
