import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos para CTS Academy...');

  const defaultPasswordHash = await argon2.hash('CtsAcademy2026!');

  // 1. Usuarios Base
  console.log('👤 Creando usuarios base por rol...');
  const liderUser = await prisma.usuario.upsert({
    where: { email: 'lider.fenix@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.fenix@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Diego',
      apellidos: 'Moys',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  const gestorUser = await prisma.usuario.upsert({
    where: { email: 'gestor.admisiones@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'gestor.admisiones@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'María',
      apellidos: 'Sánchez Gestora',
      rol: 'GESTOR',
      activo: true,
    },
  });

  const alumnoUser = await prisma.usuario.upsert({
    where: { email: 'alumno.profer@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'alumno.profer@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Juan',
      apellidos: 'Pérez Alumno',
      rol: 'ALUMNO',
      activo: true,
    },
  });

  const candidatoUser = await prisma.usuario.upsert({
    where: { email: 'candidato.test@alumnos.uneatlantico.es' },
    update: {},
    create: {
      email: 'candidato.test@alumnos.uneatlantico.es',
      password_hash: defaultPasswordHash,
      nombre: 'Laura',
      apellidos: 'Gómez Postulante',
      rol: 'CANDIDATO',
      activo: true,
    },
  });

  // 2. Equipo TEAM-01 (Fénix)
  console.log('🛡️ Creando equipos de desarrollo...');
  const equipoFenix = await prisma.equipo.upsert({
    where: { codigo: 'TEAM-01' },
    update: {},
    create: {
      codigo: 'TEAM-01',
      nombre: 'Team Fénix',
      especialidad: 'Fullstack TypeScript & Arquitectura Cloud',
      lider_usuario_id: liderUser.id,
    },
  });

  // 3. AlumnoProfer vinculado a TEAM-01
  await prisma.alumnoProfer.upsert({
    where: { usuario_id: alumnoUser.id },
    update: {},
    create: {
      usuario_id: alumnoUser.id,
      equipo_id: equipoFenix.id,
      matricula_activa: true,
    },
  });

  // 4. Calendario Académico y Convocatoria de Admisión
  console.log('📅 Creando curso académico, semestre y convocatoria...');
  let curso = await prisma.cursoAcademico.findFirst({
    where: { denominacion: 'Curso 2025-2026' },
  });
  if (!curso) {
    curso = await prisma.cursoAcademico.create({
      data: {
        denominacion: 'Curso 2025-2026',
        anio_inicio: 2025,
        anio_fin: 2026,
        activo: true,
      },
    });
  }

  let semestre = await prisma.semestre.findFirst({
    where: { curso_academico_id: curso.id, periodo: 'SEM-02' },
  });
  if (!semestre) {
    semestre = await prisma.semestre.create({
      data: {
        curso_academico_id: curso.id,
        periodo: 'SEM-02',
        fecha_inicio: new Date('2026-02-01'),
        fecha_fin: new Date('2026-06-30'),
      },
    });
  }

  let convocatoria = await prisma.convocatoria.findFirst({
    where: { semestre_id: semestre.id, estado: 'ABIERTA' },
  });
  if (!convocatoria) {
    convocatoria = await prisma.convocatoria.create({
      data: {
        semestre_id: semestre.id,
        denominacion: 'Convocatoria Admisión Febrero 2026',
        estado: 'ABIERTA',
        fecha_apertura: new Date('2026-02-01T00:00:00Z'),
        fecha_cierre: new Date('2026-06-30T23:59:59Z'),
        modelo_admision: 'CONTINUA',
      },
    });
  }

  // 5. Postulación del Candidato
  console.log('📝 Creando postulación del candidato y baterías...');
  const candidato = await prisma.candidato.upsert({
    where: { usuario_id: candidatoUser.id },
    update: {},
    create: {
      usuario_id: candidatoUser.id,
      convocatoria_id: convocatoria.id,
      sede_origen: 'SDR_ESP',
      telefono: '+34600112233',
      estado_postulacion: 'REGISTRADO',
      decision_admision: 'PENDIENTE',
      perfil_competencias: {
        dimensiones: {
          actitud: { puntaje: 85 },
          aptitud: { puntaje: 80 },
          tecnico: { puntaje: 75 },
        },
        indiceAfinidadGlobal: 80,
      },
    },
  });

  // Tests del candidato
  let testTecnico = await prisma.test.findFirst({
    where: { candidato_id: candidato.id, tipo_bateria: 'TECNICO' },
  });
  if (!testTecnico) {
    testTecnico = await prisma.test.create({
      data: {
        candidato_id: candidato.id,
        tipo_bateria: 'TECNICO',
        estado: 'NO_INICIADO',
        tiempo_limite_segundos: 3600,
      },
    });
  }

  // 6. Capacitación, Módulo y Laboratorio
  console.log('📚 Creando tracks de formación y laboratorios...');
  let capacitacion = await prisma.capacitacion.findFirst({
    where: { track_especialidad: 'BACKEND_NESTJS' },
  });
  if (!capacitacion) {
    capacitacion = await prisma.capacitacion.create({
      data: {
        track_especialidad: 'BACKEND_NESTJS',
      },
    });
  }

  let modulo = await prisma.modulo.findFirst({
    where: { capacitacion_id: capacitacion.id, orden: 1 },
  });
  if (!modulo) {
    modulo = await prisma.modulo.create({
      data: {
        capacitacion_id: capacitacion.id,
        equipo_propietario_id: equipoFenix.id,
        orden: 1,
        titulo: 'Módulo 1: Fundamentos de Arquitectura Hexagonal y NestJS',
        descripcion: 'Diseño de microservicios robustos, desacoplamiento y tipado estricto.',
      },
    });
  }

  let material = await prisma.material.findFirst({
    where: { modulo_id: modulo.id, orden: 1 },
  });
  if (!material) {
    await prisma.material.create({
      data: {
        modulo_id: modulo.id,
        titulo: 'Guía de Arquitectura de Capas',
        contenido_markdown: '# Arquitectura Hexagonal en NestJS\n\nEn este material revisamos los puertos y adaptadores...',
        estimado_minutos: 20,
        orden: 1,
      },
    });
  }

  let laboratorio = await prisma.laboratorio.findFirst({
    where: { modulo_id: modulo.id, orden: 1 },
  });
  if (!laboratorio) {
    await prisma.laboratorio.create({
      data: {
        modulo_id: modulo.id,
        titulo: 'Lab 01: CRUD de Entidades con Prisma y DTOs Validados',
        orden: 1,
        dificultad: 'INTERMEDIA',
      },
    });
  }

  // 7. Preguntas de la Batería Técnica de Evaluación
  console.log('❓ Sembrando banco de preguntas teóricas y prácticas...');
  const preguntasExistentes = await prisma.pregunta.count({
    where: { modulo_id: modulo.id },
  });

  if (preguntasExistentes === 0) {
    // Pregunta 1: Arquitectura Hexagonal
    await prisma.pregunta.create({
      data: {
        modulo_id: modulo.id,
        tipo_pregunta: 'TEORICA',
        enunciado: '¿Cuál es el propósito primordial de los "Puertos y Adaptadores" en la Arquitectura Hexagonal?',
        peso_puntos: 1.0,
        opciones: {
          create: [
            { texto: 'Acelerar la velocidad de compilación de TypeScript evitando el uso de interfaces.', es_correcta: false },
            { texto: 'Aislar las reglas de negocio centrales de detalles técnicos de infraestructura, base de datos y frameworks.', es_correcta: true },
            { texto: 'Obligar a que toda la lógica de validación se ejecute exclusivamente en el controlador HTTP.', es_correcta: false },
            { texto: 'Reemplazar el uso de bases de datos relacionales por almacenamiento en memoria caché con Redis.', es_correcta: false },
          ],
        },
      },
    });

    // Pregunta 2: NestJS Inyección de Dependencias
    await prisma.pregunta.create({
      data: {
        modulo_id: modulo.id,
        tipo_pregunta: 'TEORICA',
        enunciado: 'En NestJS, ¿cuál es el ámbito (scope) predeterminado de un proveedor (@Injectable())?',
        peso_puntos: 1.0,
        opciones: {
          create: [
            { texto: 'DEFAULT (Singleton): una única instancia compartida por toda la aplicación.', es_correcta: true },
            { texto: 'REQUEST: se genera una nueva instancia por cada petición HTTP entrante.', es_correcta: false },
            { texto: 'TRANSIENT: cada proveedor consumidor recibe una instancia exclusiva e independiente.', es_correcta: false },
            { texto: 'GLOBAL: el proveedor se publica automáticamente en window o globalThis.', es_correcta: false },
          ],
        },
      },
    });

    // Pregunta 3: PostgreSQL Multi-Schema
    await prisma.pregunta.create({
      data: {
        modulo_id: modulo.id,
        tipo_pregunta: 'TEORICA',
        enunciado: '¿Qué ventaja aporta la partición por Esquemas Lógicos (Schemas) nativos en PostgreSQL frente a bases de datos aisladas?',
        peso_puntos: 1.0,
        opciones: {
          create: [
            { texto: 'No requiere especificar tipos de datos en las columnas de las tablas.', es_correcta: false },
            { texto: 'Permite un pool de conexiones unificado y transacciones atómicas inter-esquema con separación de dominios.', es_correcta: true },
            { texto: 'Elimina por completo la necesidad de claves foráneas e índices B-Tree.', es_correcta: false },
            { texto: 'Desactiva el motor de WAL (Write-Ahead Logging) reduciendo el uso de memoria a cero.', es_correcta: false },
          ],
        },
      },
    });

    // Pregunta 4: TypeScript Tipado Estricto
    await prisma.pregunta.create({
      data: {
        modulo_id: modulo.id,
        tipo_pregunta: 'TEORICA',
        enunciado: 'En TypeScript, ¿cuál es la principal diferencia semántica y de seguridad entre "unknown" y "any"?',
        peso_puntos: 1.0,
        opciones: {
          create: [
            { texto: '"unknown" desactiva todas las comprobaciones de tipos, mientras que "any" exige type guards.', es_correcta: false },
            { texto: '"unknown" es seguro porque obliga a acotar el tipo (type narrowing) antes de operar con el valor; "any" apaga el compilador.', es_correcta: true },
            { texto: '"unknown" solo acepta valores booleanos o nulos; "any" acepta cualquier estructura.', es_correcta: false },
            { texto: 'No existe diferencia práctica; son sinónimos introducidos en TypeScript 4.0.', es_correcta: false },
          ],
        },
      },
    });

    // Pregunta 5: Reto Práctico de Código
    await prisma.pregunta.create({
      data: {
        modulo_id: modulo.id,
        tipo_pregunta: 'PRACTICA',
        enunciado: 'Implementa una función en TypeScript `calcularRadar(evaluaciones: number[]): { promedio: number, nivel: string }` que reciba un arreglo de notas (0 a 100), filtre valores inválidos y retorne el promedio con el nivel ("JUNIOR" si < 70, "INTERMEDIO" si 70-85, "AVANZADO" si > 85).',
        peso_puntos: 2.0,
        test_cases_json: {
          inputs: [[80, 90, 70], [60, 50, 40]],
          expectedOutputs: [{ promedio: 80, nivel: 'INTERMEDIO' }, { promedio: 50, nivel: 'JUNIOR' }],
        },
        timeout_ms: 5000,
      },
    });
  }

  console.log('✅ Seed finalizado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
