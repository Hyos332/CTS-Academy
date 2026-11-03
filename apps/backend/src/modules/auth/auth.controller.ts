import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('PK01 - Acceso')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (CU: iniciarSesion)', description: 'Autentica a cualquier rol (CANDIDATO, ALUMNO, LIDER_EQUIPO, ADMISIONES, GESTOR_CONTENIDO) y devuelve el JWT Bearer' })
  @ApiResponse({ status: 200, description: 'Autenticación exitosa', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o cuenta desactivada' })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión (CU: cerrarSesion)', description: 'Invalida la sesión actual del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar perfil de sesión', description: 'Retorna los datos del usuario en sesión actual' })
  @ApiResponse({ status: 200, description: 'Datos de la sesión activa' })
  async me(@CurrentUser('id') userId: string) {
    return this.authService.me(userId);
  }
}
