import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsUUID, IsUrl, IsEnum } from 'class-validator';
import { CalificacionCualitativa } from '@cts/shared-types';

export class RegistrarCandidatoDto {
  @ApiProperty({ example: 'Carlos', description: 'Nombre del candidato' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ example: 'Mendoza Ruiz', description: 'Apellidos del candidato' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiProperty({ example: 'carlos.mendoza@alumnos.uneatlantico.es', description: 'Correo institucional o personal' })
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiProperty({ example: 'SDR_ESP', description: 'Sede de origen (ej: SDR_ESP)' })
  @IsString()
  @IsNotEmpty({ message: 'La sede es obligatoria' })
  sedeOrigen: string;

  @ApiPropertyOptional({ example: '+34600112233', description: 'Teléfono de contacto' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({ example: '12345678-1234-1234-1234-123456789013', description: 'UUID de la convocatoria' })
  @IsUUID('4', { message: 'El ID de la convocatoria debe ser un UUID válido' })
  @IsOptional()
  convocatoriaId?: string;
}

export class ImportarCandidatosSedeDto {
  @ApiProperty({ example: 'SDR_ESP', description: 'Sede de procedencia' })
  @IsString()
  @IsNotEmpty()
  sedeOrigen: string;

  @ApiProperty({
    example: [
      { nombre: 'Lucía', apellidos: 'Fernández', email: 'lucia.f@alumnos.uneatlantico.es' },
      { nombre: 'Martín', apellidos: 'Gómez', email: 'martin.g@alumnos.uneatlantico.es' },
    ],
    description: 'Lista de candidatos a registrar masivamente',
  })
  candidatos: Array<{ nombre: string; apellidos: string; email: string; telefono?: string }>;
}

export class IniciarTestDto {
  @ApiPropertyOptional({ example: 'Evaluación técnica inicial' })
  @IsString()
  @IsOptional()
  notas?: string;
}

export class ResponderPreguntaTeoricaDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789014', description: 'UUID de la pregunta teórica' })
  @IsUUID('4')
  @IsNotEmpty()
  preguntaId: string;

  @ApiProperty({ example: '12345678-1234-1234-1234-123456789015', description: 'UUID de la opción seleccionada' })
  @IsUUID('4')
  @IsNotEmpty()
  opcionSeleccionadaId: string;
}

export class EntregarPreguntaPracticaDto {
  @ApiProperty({ example: '12345678-1234-1234-1234-123456789016', description: 'UUID de la pregunta práctica' })
  @IsUUID('4')
  @IsNotEmpty()
  preguntaId: string;

  @ApiProperty({ example: 'const solve = () => { return true; };', description: 'Código fuente TypeScript/Python' })
  @IsString()
  @IsNotEmpty()
  codigoEntregado: string;
}

export class FinalizarTestDto {
  @ApiPropertyOptional({ example: 'Test completado dentro del tiempo reglamentario.' })
  @IsString()
  @IsOptional()
  comentarios?: string;
}

export class AgendarEntrevistaDto {
  @ApiProperty({ example: '2026-03-15T10:00:00.000Z', description: 'Fecha y hora programada' })
  @IsNotEmpty()
  fechaProgramada: string;

  @ApiProperty({ example: 'https://meet.google.com/xyz-abcd-uvw', description: 'Enlace a Google Meet' })
  @IsUrl()
  @IsNotEmpty()
  enlaceGoogleMeet: string;

  @ApiPropertyOptional({ example: 'cal_event_123456', description: 'ID de evento Google Calendar' })
  @IsString()
  @IsOptional()
  googleCalendarEventId?: string;
}

export class RegistrarAnotacionesEntrevistaDto {
  @ApiProperty({ example: 'Arquitectura y Trabajo en Equipo', description: 'Competencia evaluada' })
  @IsString()
  @IsNotEmpty()
  competenciaEvaluada: string;

  @ApiProperty({ enum: CalificacionCualitativa, example: CalificacionCualitativa.SOBRESALIENTE })
  @IsEnum(CalificacionCualitativa)
  @IsNotEmpty()
  calificacionCualitativa: CalificacionCualitativa;

  @ApiProperty({ example: 'Demuestra excelente criterio de modularización y proactividad colaborativa.' })
  @IsString()
  @IsNotEmpty()
  comentario: string;
}

export class AdmitirAlumnoDto {
  @ApiPropertyOptional({ example: '12345678-1234-1234-1234-123456789020', description: 'UUID del equipo de destino (opcional al dar el sí; se puede asignar cuando el alumno se incorpora)' })
  @IsUUID('4')
  @IsOptional()
  equipoId?: string;

  @ApiPropertyOptional({ example: 'Perfil asignado al equipo TEAM-01 Fénix.' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class RechazarCandidaturaDto {
  @ApiProperty({ example: 'No alcanza el umbral de conocimientos en la dimensión técnica.' })
  @IsString()
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio para trazabilidad' })
  motivoRechazo: string;
}
