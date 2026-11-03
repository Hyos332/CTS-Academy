import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EvaluacionService } from './evaluacion.service';
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolUsuario } from '@cts/shared-types';

@ApiTags('PK02 - MotorEvaluacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluacion')
export class EvaluacionController {
  constructor(private readonly evaluacionService: EvaluacionService) {}

  @Get('candidatos/panel')
  @Roles(RolUsuario.CANDIDATO)
  @ApiOperation({
    summary: 'Consultar panel del postulante (CU: abrirPanelPostulacion)',
    description: 'Devuelve el estado de la postulación, pruebas asignadas y detalles de entrevistas programadas.',
  })
  @ApiResponse({ status: 200, description: 'Panel de postulación' })
  async abrirPanelPostulacion(@CurrentUser('id') usuarioId: string) {
    return this.evaluacionService.abrirPanelPostulacion(usuarioId);
  }

  @Post('baterias/:testId/iniciar')
  @Roles(RolUsuario.CANDIDATO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'testId', description: 'UUID del test' })
  @ApiOperation({
    summary: 'Iniciar test de admisión (CU: iniciarTest)',
    description: 'Abre la sesión de evaluación técnica y entrega el listado de preguntas sin las respuestas correctas.',
  })
  @ApiResponse({ status: 200, description: 'Sesión de test iniciada' })
  async iniciarTest(
    @CurrentUser('id') usuarioId: string,
    @Param('testId') testId: string,
  ) {
    return this.evaluacionService.iniciarTest(usuarioId, testId);
  }

  @Post('baterias/:testId/respuestas-teoricas')
  @Roles(RolUsuario.CANDIDATO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'testId', description: 'UUID del test' })
  @ApiOperation({
    summary: 'Responder pregunta teórica (CU: responderPreguntaTeorica)',
    description: 'Guarda la opción seleccionada para una pregunta de opción múltiple.',
  })
  @ApiResponse({ status: 200, description: 'Respuesta teórica registrada' })
  async responderPreguntaTeorica(
    @CurrentUser('id') usuarioId: string,
    @Param('testId') testId: string,
    @Body() dto: ResponderPreguntaTeoricaDto,
  ) {
    return this.evaluacionService.responderPreguntaTeorica(usuarioId, testId, dto);
  }

  @Post('baterias/:testId/entregas-practicas')
  @Roles(RolUsuario.CANDIDATO)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'testId', description: 'UUID del test' })
  @ApiOperation({
    summary: 'Entregar solución de pregunta práctica (CU: entregarPreguntaPractica)',
    description: 'Registra el código fuente entregado por el candidato para evaluación.',
  })
  @ApiResponse({ status: 201, description: 'Entrega práctica registrada' })
  async entregarPreguntaPractica(
    @CurrentUser('id') usuarioId: string,
    @Param('testId') testId: string,
    @Body() dto: EntregarPreguntaPracticaDto,
  ) {
    return this.evaluacionService.entregarPreguntaPractica(usuarioId, testId, dto);
  }

  @Post('baterias/:testId/finalizar')
  @Roles(RolUsuario.CANDIDATO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'testId', description: 'UUID del test' })
  @ApiOperation({
    summary: 'Finalizar test de admisión (CU: finalizarTest)',
    description: 'Consolida los resultados teóricos, computa el radar y actualiza la postulación a TESTS_COMPLETADOS.',
  })
  @ApiResponse({ status: 200, description: 'Evaluación finalizada' })
  async finalizarTest(
    @CurrentUser('id') usuarioId: string,
    @Param('testId') testId: string,
  ) {
    return this.evaluacionService.finalizarTest(usuarioId, testId);
  }

  @Get('candidatos/:id/perfil')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiParam({ name: 'id', description: 'UUID del candidato' })
  @ApiOperation({
    summary: 'Abrir perfil de candidato (CU: abrirPerfilCandidato)',
    description: 'Retorna la ficha técnica 360 del postulante: resultados de test, código entregado, entrevista y radar.',
  })
  @ApiResponse({ status: 200, description: 'Ficha integral del candidato' })
  async abrirPerfilCandidato(@Param('id') candidatoId: string) {
    return this.evaluacionService.abrirPerfilCandidato(candidatoId);
  }

  @Post('candidatos/:id/entrevista')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.CREATED)
  @ApiParam({ name: 'id', description: 'UUID del candidato' })
  @ApiOperation({
    summary: 'Agendar entrevista técnica (CU: agendarEntrevistaGoogleMeet)',
    description: 'Programa una sesión de entrevista en Google Meet y notifica al postulante.',
  })
  @ApiResponse({ status: 201, description: 'Entrevista programada' })
  async agendarEntrevista(
    @Param('id') candidatoId: string,
    @CurrentUser('id') gestorId: string,
    @Body() dto: AgendarEntrevistaDto,
  ) {
    return this.evaluacionService.agendarEntrevista(candidatoId, gestorId, dto);
  }

  @Post('candidatos/:id/entrevista/anotaciones')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del candidato' })
  @ApiOperation({
    summary: 'Registrar anotaciones de entrevista (CU: registrarAnotacionesEntrevista)',
    description: 'Registra la deliberación técnica cualitativa y el comentario del evaluador.',
  })
  @ApiResponse({ status: 200, description: 'Anotaciones de entrevista guardadas' })
  async registrarAnotacionesEntrevista(
    @Param('id') candidatoId: string,
    @CurrentUser('id') gestorId: string,
    @Body() dto: RegistrarAnotacionesEntrevistaDto,
  ) {
    return this.evaluacionService.registrarAnotacionesEntrevista(candidatoId, gestorId, dto);
  }

  @Post('candidatos/:id/admitir')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del candidato' })
  @ApiOperation({
    summary: 'Admitir alumno a programa/equipo (CU: admitirAlumnoProfer)',
    description: 'Promueve formalmente al candidato al rol de ALUMNO y lo incorpora al equipo de desarrollo asignado (AlumnoProfer).',
  })
  @ApiResponse({ status: 200, description: 'Candidato admitido con éxito' })
  async admitirAlumnoProfer(
    @Param('id') candidatoId: string,
    @CurrentUser('id') admitidoPorId: string,
    @Body() dto: AdmitirAlumnoDto,
  ) {
    return this.evaluacionService.admitirAlumnoProfer(candidatoId, admitidoPorId, dto);
  }

  @Post('candidatos/:id/rechazar')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del candidato' })
  @ApiOperation({
    summary: 'Rechazar candidatura (CU: rechazarCandidatura)',
    description: 'Marca al candidato como RECHAZADO y archiva el motivo con fines de auditoría.',
  })
  @ApiResponse({ status: 200, description: 'Candidatura rechazada' })
  async rechazarCandidatura(
    @Param('id') candidatoId: string,
    @Body() dto: RechazarCandidaturaDto,
  ) {
    return this.evaluacionService.rechazarCandidatura(candidatoId, dto);
  }

  @Post('candidatos')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar candidato individual (CU: registrarCandidato)',
    description: 'Crea la cuenta de usuario y el expediente de postulación para un nuevo postulante.',
  })
  @ApiResponse({ status: 201, description: 'Candidato registrado exitosamente' })
  async registrarCandidato(@Body() dto: RegistrarCandidatoDto) {
    return this.evaluacionService.registrarCandidato(dto);
  }

  @Post('candidatos/importar-sede')
  @Roles(RolUsuario.GESTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Importar nómina de candidatos por sede (CU: importarCandidatosSede)',
    description: 'Carga masiva de candidatos universitarios para una sede específica.',
  })
  @ApiResponse({ status: 200, description: 'Candidatos importados con éxito' })
  async importarCandidatosSede(@Body() dto: ImportarCandidatosSedeDto) {
    return this.evaluacionService.importarCandidatosSede(dto);
  }
}
