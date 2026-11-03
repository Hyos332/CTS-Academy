import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsUrl, IsNumber, Min, Max, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { TipoPregunta } from '@cts/shared-types';

export class EnviarEntregableDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789030', description: 'UUID del laboratorio formativo' })
  @IsUUID('4')
  @IsNotEmpty()
  laboratorioId: string;

  @ApiProperty({ example: 'https://github.com/cts-alumnos/proyecto/pull/12', description: 'URL del Pull Request' })
  @IsUrl()
  @IsNotEmpty()
  urlPullRequest: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0', description: 'Hash del commit entregado' })
  @IsString()
  @IsNotEmpty()
  commitHash: string;
}

export class RevisarEntregableDto {
  @ApiProperty({ example: 'El código presenta una adecuada separación en capas, pero falta tipar el payload del JWT.' })
  @IsString()
  @IsNotEmpty()
  comentarios: string;

  @ApiPropertyOptional({ example: 8.5, description: 'Calificación preliminar (0.00 a 10.00)' })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  calificacion?: number;
}

export class AprobarEntregableDto {
  @ApiProperty({ example: 9.5, description: 'Calificación numérica final (0.00 a 10.00)' })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  calificacion: number;

  @ApiProperty({ example: 'Excelente estructuración de servicios y cobertura de pruebas unitarias.' })
  @IsString()
  @IsNotEmpty()
  feedbackGeneral: string;
}

export class SolicitarCambiosEntregableDto {
  @ApiProperty({ example: 'Corregir la inyección de dependencias cíclica y agregar manejo de excepciones en Prisma.' })
  @IsString()
  @IsNotEmpty()
  feedbackGeneral: string;
}

export class EvaluarCapacitacionAlumnoDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789035', description: 'UUID del alumno (AlumnoProfer)' })
  @IsUUID('4')
  @IsNotEmpty()
  alumnoId: string;

  @ApiProperty({ example: 9.0, description: 'Nota final global práctica (0.00 a 10.00)' })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsNotEmpty()
  notaFinalPractica: number;

  @ApiProperty({ example: true, description: 'Si el alumno es apto para promoción' })
  @IsBoolean()
  @IsNotEmpty()
  aptoPromocion: boolean;

  @ApiProperty({ example: 'Desempeño sobresaliente en la arquitectura backend y proactividad en el squad.' })
  @IsString()
  @IsNotEmpty()
  informeDesempeno: string;
}

export class CrearMaterialDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789030', description: 'UUID del módulo al que pertenece' })
  @IsUUID('4')
  @IsNotEmpty()
  moduloId: string;

  @ApiProperty({ example: 'Introducción a la Arquitectura Hexagonal' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: '# Arquitectura Hexagonal\n\nPrincipios y puertos...' })
  @IsString()
  @IsNotEmpty()
  contenidoMarkdown: string;

  @ApiPropertyOptional({ example: 20, description: 'Minutos estimados de lectura' })
  @IsNumber()
  @IsOptional()
  estimadoMinutos?: number;

  @ApiPropertyOptional({ example: 1, description: 'Posición de ordenamiento' })
  @IsNumber()
  @IsOptional()
  orden?: number;
}

export class EditarMaterialDto {
  @ApiPropertyOptional({ example: 'Arquitectura Hexagonal Avanzada' })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contenidoMarkdown?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  estimadoMinutos?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  orden?: number;
}

export class CrearOpcionPreguntaDto {
  @ApiProperty({ example: 'Una interfaz que desacopla la lógica de negocio de la infraestructura' })
  @IsString()
  @IsNotEmpty()
  texto: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  esCorrecta: boolean;
}

export class CrearPreguntaDto {
  @ApiProperty({ description: 'UUID del módulo formativo al que pertenece' })
  @IsUUID('4')
  @IsNotEmpty()
  moduloId: string;

  @ApiProperty({ example: 'Indique la definición más precisa de Puerto en Clean Architecture.' })
  @IsString()
  @IsNotEmpty()
  enunciado: string;

  @ApiProperty({ enum: TipoPregunta, example: TipoPregunta.TEORICA })
  @IsEnum(TipoPregunta)
  @IsNotEmpty()
  tipoPregunta: TipoPregunta;

  @ApiPropertyOptional({ example: 1.0, description: 'Ponderación de puntos' })
  @IsNumber()
  @IsOptional()
  pesoPuntos?: number;

  @ApiPropertyOptional({ type: [CrearOpcionPreguntaDto] })
  @IsArray()
  @IsOptional()
  opciones?: CrearOpcionPreguntaDto[];
}

export class EditarPreguntaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  enunciado?: string;

  @ApiPropertyOptional({ enum: TipoPregunta })
  @IsEnum(TipoPregunta)
  @IsOptional()
  tipoPregunta?: TipoPregunta;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  pesoPuntos?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
