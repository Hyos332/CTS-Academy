import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EquiposService } from './equipos.service';
import { CrearConvocatoriaDto, CerrarCorteSemestralDto } from './dto/periodo-ingreso.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolUsuario } from '@cts/shared-types';

@ApiTags('PK04 - MotorEquipos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Get('panel-lider')
  @Roles(RolUsuario.LIDER_EQUIPO, RolUsuario.GESTOR)
  @ApiOperation({
    summary: 'Consultar panel del líder de equipo (CU: abrirPanelLider)',
    description: 'Devuelve métricas operativas del equipo, lista de alumnos activos, entregables pendientes de revisión y módulos asignados.',
  })
  @ApiResponse({ status: 200, description: 'Datos del panel de líder consolidados' })
  async abrirPanelLider(@CurrentUser('id') usuarioId: string) {
    return this.equiposService.obtenerPanelLider(usuarioId);
  }

  @Get('panel-admisiones')
  @Roles(RolUsuario.GESTOR, RolUsuario.LIDER_EQUIPO)
  @ApiOperation({
    summary: 'Consultar panel de admisiones (CU: abrirPanelAdmisiones)',
    description: 'Devuelve el estado de la convocatoria activa, desglose de candidatos por estado del pipeline y capacidad por equipo.',
  })
  @ApiResponse({ status: 200, description: 'Métricas del proceso de admisión' })
  async abrirPanelAdmisiones() {
    return this.equiposService.obtenerPanelAdmisiones();
  }

  @Post('periodos-ingreso')
  @Roles(RolUsuario.GESTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Aperturar nueva convocatoria de ingreso (CU: abrirPeriodoIngreso)',
    description: 'Crea e inicializa una nueva convocatoria de admisión semestral para recibir candidatos.',
  })
  @ApiResponse({ status: 201, description: 'Convocatoria abierta exitosamente' })
  async abrirPeriodoIngreso(@Body() dto: CrearConvocatoriaDto) {
    return this.equiposService.abrirPeriodoIngreso(dto);
  }

  @Post('periodos-ingreso/:id/cierre')
  @Roles(RolUsuario.GESTOR)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID de la convocatoria a cerrar' })
  @ApiOperation({
    summary: 'Cierre formal de corte semestral (CU: cerrarCorteSemestral)',
    description: 'Formaliza el cierre de la convocatoria, computa estadísticas y genera el informe de corte con firma inmutable.',
  })
  @ApiResponse({ status: 200, description: 'Corte semestral formalizado' })
  async cerrarCorteSemestral(
    @Param('id') convocatoriaId: string,
    @CurrentUser('id') gestorId: string,
    @Body() dto: CerrarCorteSemestralDto,
  ) {
    return this.equiposService.cerrarCorteSemestral(convocatoriaId, gestorId, dto);
  }

  @Post('periodos-ingreso/:id/reabrir')
  @Roles(RolUsuario.GESTOR)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID de la convocatoria a reabrir' })
  @ApiOperation({
    summary: 'Reabrir convocatoria cerrada',
    description: 'Permite al gestor reanudar la recepción de candidatos en una convocatoria previamente cerrada.',
  })
  @ApiResponse({ status: 200, description: 'Convocatoria reabierta exitosamente' })
  async reabrirConvocatoria(@Param('id') convocatoriaId: string) {
    return this.equiposService.reabrirConvocatoria(convocatoriaId);
  }

  @Put('alumnos/:id/squad')
  @Roles(RolUsuario.GESTOR)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'UUID del AlumnoProfer' })
  @ApiOperation({
    summary: 'Asignar o transferir alumno PROFER a un squad técnico',
    description: 'Permite al Gestor adscribir o cambiar a un becario entre los 6 equipos de CTS durante su permanencia en el programa.',
  })
  async transferirAlumnoEquipo(
    @Param('id') alumnoId: string,
    @Body('equipoId') nuevoEquipoId: string | null,
  ) {
    return this.equiposService.transferirAlumnoEquipo(alumnoId, nuevoEquipoId);
  }
}
