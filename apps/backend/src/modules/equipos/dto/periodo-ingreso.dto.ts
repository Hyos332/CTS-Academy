import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CrearConvocatoriaDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789001', description: 'UUID del semestre académico' })
  @IsUUID('4', { message: 'El ID del semestre debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El semestre es obligatorio' })
  semestreId: string;

  @ApiProperty({ example: 'Admisiones Semestre I - 2026', description: 'Denominación de la convocatoria' })
  @IsString()
  @IsNotEmpty({ message: 'La denominación de la convocatoria es obligatoria' })
  denominacion: string;

  @ApiProperty({ example: '2026-02-01T00:00:00.000Z', description: 'Fecha de apertura' })
  @IsDateString({}, { message: 'La fecha de apertura debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de apertura es obligatoria' })
  fechaApertura: string;

  @ApiProperty({ example: '2026-06-30T23:59:59.000Z', description: 'Fecha de cierre' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser una fecha ISO válida' })
  @IsNotEmpty({ message: 'La fecha de cierre es obligatoria' })
  fechaCierre: string;

  @ApiPropertyOptional({ example: 'CONTINUA', default: 'CONTINUA' })
  @IsString()
  @IsOptional()
  modeloAdmision?: string;
}

export class CerrarCorteSemestralDto {
  @ApiPropertyOptional({ example: 'Cierre regular de corte semestral tras finalizar entrevistas y admisiones.' })
  @IsString()
  @IsOptional()
  motivoCierre?: string;
}
