import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsUUID, IsInt } from 'class-validator';

export class CrearConvocatoriaDto {
  @ApiPropertyOptional({ example: '12345678-1234-1234-1234-123456789001', description: 'UUID del semestre académico existente' })
  @IsUUID('4', { message: 'El ID del semestre debe ser un UUID válido' })
  @IsOptional()
  semestreId?: string;

  @ApiProperty({ example: 'Admisiones Semestre II - 2026', description: 'Denominación de la convocatoria' })
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

  // Campos opcionales para crear un nuevo semestre y curso académico en el mismo acto
  @ApiPropertyOptional({ example: 'SEM-02', description: 'Código del nuevo periodo semestral (ej. SEM-01, SEM-02)' })
  @IsString()
  @IsOptional()
  periodoSemestre?: string;

  @ApiPropertyOptional({ example: 'Curso 2026-2027', description: 'Denominación del curso académico' })
  @IsString()
  @IsOptional()
  cursoDenominacion?: string;

  @ApiPropertyOptional({ example: 2026, description: 'Año de inicio del curso académico' })
  @IsInt()
  @IsOptional()
  anioInicio?: number;

  @ApiPropertyOptional({ example: 2027, description: 'Año de fin del curso académico' })
  @IsInt()
  @IsOptional()
  anioFin?: number;
}

export class CerrarCorteSemestralDto {
  @ApiPropertyOptional({ example: 'Cierre regular de corte semestral tras finalizar entrevistas y admisiones.' })
  @IsString()
  @IsOptional()
  motivoCierre?: string;
}

export class EditarConvocatoriaDto {
  @ApiPropertyOptional({ example: 'Convocatoria Admisión Febrero 2026' })
  @IsString()
  @IsOptional()
  denominacion?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsDateString({}, { message: 'La fecha de apertura debe ser una fecha ISO válida' })
  @IsOptional()
  fechaApertura?: string;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsDateString({}, { message: 'La fecha de cierre debe ser una fecha ISO válida' })
  @IsOptional()
  fechaCierre?: string;

  @ApiPropertyOptional({ example: 'CONTINUA' })
  @IsString()
  @IsOptional()
  modeloAdmision?: string;

  @ApiPropertyOptional({ example: 'ABIERTA', enum: ['ABIERTA', 'CERRADA', 'PAUSADA'] })
  @IsString()
  @IsOptional()
  estado?: string;
}

