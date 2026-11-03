import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, LoginResponseDto } from './auth.dto';
import { RolUsuario } from '@cts/shared-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        equipo_liderado: true,
        alumno_profer: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('La cuenta del usuario ha sido desactivada. Contacte con administración.');
    }

    const passwordValido = await argon2.verify(usuario.password_hash, dto.contrasena);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales de acceso incorrectas.');
    }

    const rol = usuario.rol as RolUsuario;
    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol,
    };

    const expiresIn = this.configService.get<number>('JWT_EXPIRATION', 86400);
    const accessToken = await this.jwtService.signAsync(payload);

    let redirectTo = '/dashboard';
    switch (rol) {
      case RolUsuario.CANDIDATO:
        redirectTo = '/evaluacion/panel';
        break;
      case RolUsuario.ALUMNO:
        redirectTo = '/formacion/panel';
        break;
      case RolUsuario.LIDER_EQUIPO:
        redirectTo = '/lider/panel';
        break;
      case RolUsuario.GESTOR:
        redirectTo = '/admisiones/panel';
        break;
    }

    this.logger.log(`Usuario autenticado con éxito: ${usuario.email} [${usuario.rol}]`);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol,
        activo: usuario.activo,
      },
      redirectTo,
    };
  }

  async logout(userId: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Sesión cerrada para el usuario: ${userId}`);
    return {
      success: true,
      message: 'Sesión cerrada correctamente.',
    };
  }

  async me(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        equipo_liderado: true,
        alumno_profer: {
          include: {
            equipo: true,
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const equipoId = usuario.equipo_liderado?.id || usuario.alumno_profer?.equipo_id || null;

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      rol: usuario.rol as RolUsuario,
      activo: usuario.activo,
      equipoId,
      equipo: usuario.equipo_liderado || usuario.alumno_profer?.equipo || null,
    };
  }
}
