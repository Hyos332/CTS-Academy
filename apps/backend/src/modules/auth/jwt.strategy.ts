import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RolUsuario } from '@cts/shared-types';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: RolUsuario;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'cts_academy_super_secret_development_key_change_in_production_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        equipo_liderado: true,
        alumno_profer: true,
      },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('El usuario ya no existe o su cuenta se encuentra inactiva.');
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
    };
  }
}
