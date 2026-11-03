import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RolUsuario, UsuarioBase } from '@cts/shared-types';

export class LoginDto {
  @ApiProperty({ example: 'lider.fenix@ctdesarrollo.org', description: 'Correo electrónico corporativo' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123!', description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ example: 86400, description: 'Tiempo de vida en segundos' })
  expiresIn: number;

  @ApiProperty({
    example: {
      id: 'c8f7d9e1-2b3a-4c5d-6e7f-8a9b0c1d2e3f',
      email: 'lider.fenix@ctdesarrollo.org',
      nombre: 'Diego',
      apellidos: 'Moys',
      rol: RolUsuario.LIDER_EQUIPO,
      activo: true,
    },
  })
  usuario: UsuarioBase;

  @ApiProperty({ example: '/dashboard/lider' })
  redirectTo: string;
}
