/**
 * @file index.ts
 * Contratos de datos, enums y tipos unificados de CTS Academy & Evaluator.
 */

// ==========================================
// 1. Roles y Gobernanza (MotorEquipos)
// ==========================================
export enum RolUsuario {
  CANDIDATO = 'CANDIDATO',
  ALUMNO = 'ALUMNO',
  LIDER_EQUIPO = 'LIDER_EQUIPO',
  GESTOR = 'GESTOR',
}

export interface UsuarioBase {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: RolUsuario;
  activo: boolean;
}

export interface EquipoSquad {
  id: string;
  codigo: string; // TEAM-01 a TEAM-06
  nombre: string;
  especialidad: string;
  liderUsuarioId: string;
}

// ==========================================
// 2. Proceso de Admisión (MotorEvaluacion)
// ==========================================
export enum EstadoPostulacion {
  REGISTRADO = 'REGISTRADO',
  EN_PROCESO = 'EN_PROCESO',
  TESTS_COMPLETADOS = 'TESTS_COMPLETADOS',
  ENTREVISTA_AGENDADA = 'ENTREVISTA_AGENDADA',
  ADMITIDO = 'ADMITIDO',
  RECHAZADO = 'RECHAZADO',
}

export enum DecisionAdmision {
  PENDIENTE = 'PENDIENTE',
  ADMITIDO = 'ADMITIDO',
  RECHAZADO = 'RECHAZADO',
}

export enum TipoBateriaTest {
  ACTITUD = 'ACTITUD',
  APTITUD = 'APTITUD',
  TECNICO = 'TECNICO',
}

export enum EstadoTest {
  NO_INICIADO = 'NO_INICIADO',
  EN_CURSO = 'EN_CURSO',
  COMPLETADO = 'COMPLETADO',
  EXPIRADO = 'EXPIRADO',
}

export enum EstadoEntrevista {
  PROGRAMADA = 'PROGRAMADA',
  REALIZADA = 'REALIZADA',
  CANCELADA = 'CANCELADA',
  NO_ASISTIO = 'NO_ASISTIO',
}

export enum CalificacionCualitativa {
  SOBRESALIENTE = 'SOBRESALIENTE',
  COMPETENTE = 'COMPETENTE',
  EN_DESARROLLO = 'EN_DESARROLLO',
  NO_IDONEO = 'NO_IDONEO',
}

// Radar de Competencias Multidimensional (JSONB)
export interface PerfilCompetenciasRadar {
  dimensiones: {
    actitud: {
      puntaje: number;
      factores?: Record<string, number>;
    };
    aptitud: {
      puntaje: number;
      factores?: Record<string, number>;
    };
    tecnico: {
      puntaje: number;
      factores?: Record<string, number>;
    };
  };
  indiceAfinidadGlobal: number;
  fechaCalculo?: string;
}

// ==========================================
// 3. Formación y Capacitación (MotorFormacion)
// ==========================================
export enum EstadoEntregaLaboratorio {
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  CAMBIOS_SOLICITADOS = 'CAMBIOS_SOLICITADOS',
}

export enum TipoPregunta {
  TEORICA = 'TEORICA',
  PRACTICA = 'PRACTICA',
}

export enum NivelDificultadLaboratorio {
  BASICA = 'BASICA',
  INTERMEDIA = 'INTERMEDIA',
  AVANZADA = 'AVANZADA',
}

// ==========================================
// 4. DTOs y Respuestas de Autenticación
// ==========================================
export interface AuthTokenPayload {
  sub: string;
  email: string;
  rol: RolUsuario;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: UsuarioBase;
  redirectTo: string;
}
