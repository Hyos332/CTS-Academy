import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';
import { BILLY_ORDORES_16PF } from '../src/modules/evaluacion/cattell-16pf.constants';
import { BILLY_ORDORES_MATRIZ_APTITUD } from '../src/modules/evaluacion/matriz-aptitud.constants';

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

  const carlosUser = await prisma.usuario.upsert({
    where: { email: 'carlos.candidato@alumnos.uneatlantico.es' },
    update: {},
    create: {
      email: 'carlos.candidato@alumnos.uneatlantico.es',
      password_hash: defaultPasswordHash,
      nombre: 'Carlos',
      apellidos: 'Méndez Postulante',
      rol: 'CANDIDATO',
      activo: true,
    },
  });

  const billyUser = await prisma.usuario.upsert({
    where: { email: 'billy.ordores@alumnos.uneatlantico.es' },
    update: {},
    create: {
      email: 'billy.ordores@alumnos.uneatlantico.es',
      password_hash: defaultPasswordHash,
      nombre: 'Billy',
      apellidos: 'Ordores',
      rol: 'CANDIDATO',
      activo: true,
    },
  });

  // Líderes para los 6 squads de CTS
  const liderVulcano = await prisma.usuario.upsert({
    where: { email: 'lider.vulcano@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.vulcano@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Alejandro',
      apellidos: 'Ruiz TechLead',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  const liderTitan = await prisma.usuario.upsert({
    where: { email: 'lider.titan@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.titan@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Lucía',
      apellidos: 'Vargas TechLead',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  const liderOrion = await prisma.usuario.upsert({
    where: { email: 'lider.orion@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.orion@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Marcos',
      apellidos: 'Navarro TechLead',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  const liderAtlas = await prisma.usuario.upsert({
    where: { email: 'lider.atlas@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.atlas@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Sofía',
      apellidos: 'Campos TechLead',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  const liderHydra = await prisma.usuario.upsert({
    where: { email: 'lider.hydra@ctdesarrollo.org' },
    update: {},
    create: {
      email: 'lider.hydra@ctdesarrollo.org',
      password_hash: defaultPasswordHash,
      nombre: 'Javier',
      apellidos: 'Ortiz TechLead',
      rol: 'LIDER_EQUIPO',
      activo: true,
    },
  });

  // 2. Los 4 Equipos Oficiales de Desarrollo CTS (TEAM-01 a TEAM-04)
  console.log('🛡️ Creando los 4 squads oficiales de desarrollo CTS...');
  const equipoFenix = await prisma.equipo.upsert({
    where: { codigo: 'TEAM-01' },
    update: {
      nombre: 'Fénix',
      especialidad: 'Desarrollo de aplicaciones web internas y proyectos europeos',
      descripcion: 'Equipo encargado de proyectos internos de FUNIBER y europeos, meramente desarrollo de aplicaciones web.',
      tecnologias: ['React', 'Vue', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL'],
    },
    create: {
      codigo: 'TEAM-01',
      nombre: 'Fénix',
      especialidad: 'Desarrollo de aplicaciones web internas y proyectos europeos',
      descripcion: 'Equipo encargado de proyectos internos de FUNIBER y europeos, meramente desarrollo de aplicaciones web.',
      tecnologias: ['React', 'Vue', 'PHP', 'Laravel', 'MySQL', 'PostgreSQL'],
      lider_usuario_id: liderUser.id,
    },
  });

  const equipoSistemas = await prisma.equipo.upsert({
    where: { codigo: 'TEAM-02' },
    update: {
      nombre: 'Departamento de Sistemas',
      especialidad: 'Soporte tecnológico, infraestructura de redes y mantenimiento',
      descripcion: 'Equipo encargado de dar soporte y ayuda a diferentes incidencias de la parte tecnológica.',
      tecnologias: ['Express', 'JavaScript', 'TypeScript', 'NodeJS', 'React', 'Fortinet', 'Windows Server', 'Active Directory', 'Redes e Infraestructura', 'Mantenimiento de Hardware / PCs'],
    },
    create: {
      codigo: 'TEAM-02',
      nombre: 'Departamento de Sistemas',
      especialidad: 'Soporte tecnológico, infraestructura de redes y mantenimiento',
      descripcion: 'Equipo encargado de dar soporte y ayuda a diferentes incidencias de la parte tecnológica.',
      tecnologias: ['Express', 'JavaScript', 'TypeScript', 'NodeJS', 'React', 'Fortinet', 'Windows Server', 'Active Directory', 'Redes e Infraestructura', 'Mantenimiento de Hardware / PCs'],
      lider_usuario_id: liderVulcano.id,
    },
  });

  const equipoPresencia = await prisma.equipo.upsert({
    where: { codigo: 'TEAM-03' },
    update: {
      nombre: 'Presencia Web',
      especialidad: 'Imagen pública web FUNIBER, universidades asociadas y proyectos europeos',
      descripcion: 'Equipo encargado de manejar la imagen pública de la web de FUNIBER y universidades asociadas así como los proyectos europeos.',
      tecnologias: ['WordPress', 'Drupal', 'NextJS', 'Strapi', 'Squidex', 'TypeScript', 'PHP', 'Golang'],
    },
    create: {
      codigo: 'TEAM-03',
      nombre: 'Presencia Web',
      especialidad: 'Imagen pública web FUNIBER, universidades asociadas y proyectos europeos',
      descripcion: 'Equipo encargado de manejar la imagen pública de la web de FUNIBER y universidades asociadas así como los proyectos europeos.',
      tecnologias: ['WordPress', 'Drupal', 'NextJS', 'Strapi', 'Squidex', 'TypeScript', 'PHP', 'Golang'],
      lider_usuario_id: liderTitan.id,
    },
  });

  const equipoDocente = await prisma.equipo.upsert({
    where: { codigo: 'TEAM-04' },
    update: {
      nombre: 'Acción Docente',
      especialidad: 'Campus virtuales Moodle, microservicios orientados a eventos y librerías TypeScript',
      descripcion: 'Equipo encargado de los campus virtuales de la red universitaria FUNIBER. Gestionamos y administramos las instancias de Moodle (servidores, actualizaciones de versión, configuración) y desarrollamos plugins y temas a medida. Además, construyen microservicios orientados a eventos que integran los sistemas de otros dominios con los campus, y también desarrollamos librerías propias en TypeScript.',
      tecnologias: ['PHP', 'JavaScript', 'DOM', 'React', 'NodeJS', 'TypeScript', 'RabbitMQ', 'Bases de Datos Relacionales', 'Bases de Datos No Relacionales', 'TDD'],
    },
    create: {
      codigo: 'TEAM-04',
      nombre: 'Acción Docente',
      especialidad: 'Campus virtuales Moodle, microservicios orientados a eventos y librerías TypeScript',
      descripcion: 'Equipo encargado de los campus virtuales de la red universitaria FUNIBER. Gestionamos y administramos las instancias de Moodle (servidores, actualizaciones de versión, configuración) y desarrollamos plugins y temas a medida. Además, construyen microservicios orientados a eventos que integran los sistemas de otros dominios con los campus, y también desarrollamos librerías propias en TypeScript.',
      tecnologias: ['PHP', 'JavaScript', 'DOM', 'React', 'NodeJS', 'TypeScript', 'RabbitMQ', 'Bases de Datos Relacionales', 'Bases de Datos No Relacionales', 'TDD'],
      lider_usuario_id: liderOrion.id,
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

  // 5. Postulación del Candidato Laura (Con tests completados y espectro psicométrico)
  console.log('📝 Creando postulación del candidato y baterías...');
  const espectroLaura = {
    espectro: {
      actitud: {
        estiloTrabajo: {
          poloIzquierdo: 'Autonomía e Iniciativa Individual',
          poloDerecho: 'Colaboración en Squad & Sincronía',
          posicionPorcentaje: 82,
          etiqueta: 'Predominio Colaborativo',
          descripcion: 'Demuestra alta disposición para el trabajo sinérgico en equipo, pair programming y alineación con objetivos comunes.',
        },
        enfoqueResolucion: {
          poloIzquierdo: 'Pragmatismo Ágil & Entregas Rápidas',
          poloDerecho: 'Rigor Arquitectónico & Perfeccionismo',
          posicionPorcentaje: 75,
          etiqueta: 'Equilibrio con Rigor Arquitectónico',
          descripcion: 'Prioriza la robustez de diseño y desacoplamiento sin descuidar los plazos del sprint.',
        },
        adaptabilidad: {
          poloIzquierdo: 'Procesos Predecibles & Estabilidad',
          poloDerecho: 'Flexibilidad & Resiliencia al Cambio',
          posicionPorcentaje: 88,
          etiqueta: 'Alta Resiliencia al Cambio',
          descripcion: 'Maneja adecuadamente la ambigüedad de requerimientos y evoluciona soluciones ante imprevistos.',
        },
      },
      aptitud: {
        razonamiento: {
          poloIzquierdo: 'Empírico / Ensayo y Error',
          poloDerecho: 'Lógico-Formal / Deductivo',
          posicionPorcentaje: 84,
          etiqueta: 'Razonamiento Deductivo Estructurado',
          descripcion: 'Capacidad notable para desglosar problemas complejos en invariantes lógicas y estructuras claras.',
        },
        abstraccion: {
          poloIzquierdo: 'Implementación Concreta Inmediata',
          poloDerecho: 'Modelado Conceptual & Arquitectura',
          posicionPorcentaje: 92,
          etiqueta: 'Elevada Capacidad de Abstracción',
          descripcion: 'Entiende y aplica patrones de arquitectura hexagonal, inversión de dependencias y límites de contexto.',
        },
        atencionDetalle: {
          poloIzquierdo: 'Visión Macro Global',
          poloDerecho: 'Foco Minucioso en Casos Borde',
          posicionPorcentaje: 78,
          etiqueta: 'Balance Sistémico y Casos Borde',
          descripcion: 'Anticipa posibles fallos en condiciones excepcionales sin perder de vista el flujo principal.',
        },
      },
    },
    tecnico: {
      nota: 8.5,
      escala: '0 a 10',
      superado: true,
    },
    dimensiones: {
      actitud: { puntaje: 85 },
      aptitud: { puntaje: 80 },
      tecnico: { puntaje: 85 },
    },
    indiceAfinidadGlobal: 83,
  };

  const candidato = await prisma.candidato.upsert({
    where: { usuario_id: candidatoUser.id },
    update: {
      estado_postulacion: 'TESTS_COMPLETADOS',
      perfil_competencias: espectroLaura,
    },
    create: {
      usuario_id: candidatoUser.id,
      convocatoria_id: convocatoria.id,
      sede_origen: 'SDR_ESP',
      telefono: '+34600112233',
      estado_postulacion: 'TESTS_COMPLETADOS',
      decision_admision: 'PENDIENTE',
      perfil_competencias: espectroLaura,
    },
  });

  // Tests de Laura
  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      candidato_id: candidato.id,
      tipo_bateria: 'ACTITUD',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 1800,
      calificacion_obtenida: null, // Sin puntuación numérica
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      candidato_id: candidato.id,
      tipo_bateria: 'APTITUD',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 2700,
      calificacion_obtenida: null, // Sin puntuación numérica
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      candidato_id: candidato.id,
      tipo_bateria: 'TECNICO',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 3600,
      calificacion_obtenida: 8.5, // Única batería con nota numérica
    },
  });

  // Candidato Carlos (Fresco para pruebas interactivas de admisión)
  const carlosCandidato = await prisma.candidato.upsert({
    where: { usuario_id: carlosUser.id },
    update: {},
    create: {
      usuario_id: carlosUser.id,
      convocatoria_id: convocatoria.id,
      sede_origen: 'SDR_ESP',
      telefono: '+34611223344',
      estado_postulacion: 'REGISTRADO',
      decision_admision: 'PENDIENTE',
      perfil_competencias: {
        dimensiones: {
          actitud: { puntaje: 80 },
          aptitud: { puntaje: 75 },
          tecnico: { puntaje: 70 },
        },
        indiceAfinidadGlobal: 75,
      },
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      candidato_id: carlosCandidato.id,
      tipo_bateria: 'TECNICO',
      estado: 'NO_INICIADO',
      tiempo_limite_segundos: 3600,
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      candidato_id: carlosCandidato.id,
      tipo_bateria: 'ACTITUD',
      estado: 'NO_INICIADO',
      tiempo_limite_segundos: 1800,
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      candidato_id: carlosCandidato.id,
      tipo_bateria: 'APTITUD',
      estado: 'NO_INICIADO',
      tiempo_limite_segundos: 2700,
    },
  });

  // Candidato Billy Ordores (Fiel reflejo de los PDFs oficiales: Test Actitud y Test Aptitud)
  console.log('📄 Registrando candidato Billy Ordores con resultados de informes oficiales...');
  const billyCandidato = await prisma.candidato.upsert({
    where: { usuario_id: billyUser.id },
    update: {},
    create: {
      usuario_id: billyUser.id,
      convocatoria_id: convocatoria.id,
      sede_origen: 'SDR_ESP',
      telefono: '+34655443322',
      estado_postulacion: 'TESTS_COMPLETADOS',
      decision_admision: 'PENDIENTE',
      perfil_competencias: {
        informe16PF: {
          nombreCandidato: 'Billy ordores',
          edad: 19,
          cursoAcademico: '2021 - 2022',
          fechaLlegada: '9/28/2019',
          factores: BILLY_ORDORES_16PF,
          distorsion: {
            decatipo: 6,
            etiqueta: 'Distorsión',
            interpretacion:
              'Índice de consistencia y sinceridad en las respuestas del postulante (6/10). No se aprecian sesgos significativos ni distorsión deliberada en las respuestas de la evaluación.',
          },
        },
        matrizAptitudes: {
          nombreCandidato: 'billy.ordores@alumnos.uneatlantico.es',
          escala: '0: Conocimiento Nulo. 5: Conocimiento Muy Alto',
          promedioNivelActual: 2.8,
          categorias: BILLY_ORDORES_MATRIZ_APTITUD,
          areasFortaleza: [
            '[GIT] (5/5)',
            '[Relacionales] (5/5)',
            '[No Relacionales] (5/5)',
            '[JavaScript] (5/5)',
            '[Python] (5/5)',
            '[POO] (5/5)',
          ],
          areasMejora: [
            '[Docker] (1/5)',
            '[Kubernets] (1/5)',
            '[ORM] (1/5)',
            '[ACID] (1/5)',
            '[PHP] (1/5)',
            '[Figma] (1/5)',
          ],
        },
        espectro: {
          actitud: {
            estiloTrabajo: {
              poloIzquierdo: 'Autonomía e Iniciativa Individual',
              poloDerecho: 'Colaboración en Squad & Sincronía',
              posicionPorcentaje: 75,
              etiqueta: 'Predominio Autónomo y Focalizado',
              descripcion:
                'Muestra preferencia por concentrarse en objetivos técnicos bien acotados con solvencia individual.',
            },
            enfoqueResolucion: {
              poloIzquierdo: 'Pragmatismo Ágil & Entregas Rápidas',
              poloDerecho: 'Rigor Arquitectónico & Perfeccionismo',
              posicionPorcentaje: 80,
              etiqueta: 'Rigor y Pensamiento Lógico',
              descripcion:
                'Compromiso elevado con la consistencia del código y los principios de diseño de software.',
            },
            adaptabilidad: {
              poloIzquierdo: 'Procesos Predecibles & Estabilidad',
              poloDerecho: 'Flexibilidad & Resiliencia al Cambio',
              posicionPorcentaje: 70,
              etiqueta: 'Constancia y Estabilidad',
              descripcion:
                'Gran capacidad de concentración y apego a normas de calidad en tareas estructuradas.',
            },
          },
          aptitud: {
            razonamiento: {
              poloIzquierdo: 'Empírico / Ensayo y Error',
              poloDerecho: 'Lógico-Formal / Deductivo',
              posicionPorcentaje: 88,
              etiqueta: 'Actividad Mental Rápida (Factor B: 6)',
              descripcion:
                'Capacidad sobresaliente para percibir y comprender abstracciones lógicas con rapidez.',
            },
            abstraccion: {
              poloIzquierdo: 'Implementación Concreta Inmediata',
              poloDerecho: 'Modelado Conceptual & Arquitectura',
              posicionPorcentaje: 85,
              etiqueta: 'Alta Abstracción en Datos y Algoritmia',
              descripcion:
                'Dominio de estructuras complejas relacionales, no relacionales y POO avanzada.',
            },
            atencionDetalle: {
              poloIzquierdo: 'Visión Macro Global',
              poloDerecho: 'Foco Minucioso en Casos Borde',
              posicionPorcentaje: 78,
              etiqueta: 'Foco Convencional y Preciso',
              descripcion:
                'Práctico y orientado a realizar las implementaciones con corrección formal.',
            },
          },
        },
        tecnico: {
          nota: 8.2,
          escala: '0 a 10',
          superado: true,
        },
        dimensiones: {
          actitud: { puntaje: 82 },
          aptitud: { puntaje: 85 },
          tecnico: { puntaje: 82 },
        },
        indiceAfinidadGlobal: 83,
        invitacion: {
          enviada: true,
          fecha: '2026-02-05T10:15:00.000Z',
          destinatario: 'billy.ordores@alumnos.uneatlantico.es',
        },
      } as any,
    },
  });

  // Tests de Billy
  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000007' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000007',
      candidato_id: billyCandidato.id,
      tipo_bateria: 'ACTITUD',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 1800,
      calificacion_obtenida: null,
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000008' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000008',
      candidato_id: billyCandidato.id,
      tipo_bateria: 'APTITUD',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 2700,
      calificacion_obtenida: null,
    },
  });

  await prisma.test.upsert({
    where: { id: '00000000-0000-0000-0000-000000000009' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000009',
      candidato_id: billyCandidato.id,
      tipo_bateria: 'TECNICO',
      estado: 'COMPLETADO',
      tiempo_limite_segundos: 3600,
      calificacion_obtenida: 8.2,
    },
  });

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
        tipo_bateria: 'TECNICO',
        categoria: 'Arquitectura de Software',
        orden: 1,
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
        tipo_bateria: 'TECNICO',
        categoria: 'Frameworks & NestJS',
        orden: 2,
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
        tipo_bateria: 'TECNICO',
        categoria: 'Bases de Datos & Persistencia',
        orden: 3,
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
        tipo_bateria: 'TECNICO',
        categoria: 'Lenguajes & TypeScript',
        orden: 4,
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
        tipo_bateria: 'TECNICO',
        categoria: 'Algoritmia & Testing',
        orden: 5,
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

  // 8. Batería de Actitud (102 preguntas oficiales del test actitud.pdf)
  console.log('🧠 Sembrando 102 preguntas oficiales del Test de Actitud PROFER...');
  const preguntasActitudFile = path.join(__dirname, 'data/preguntas_actitud.json');
  if (fs.existsSync(preguntasActitudFile)) {
    const rawActitud = JSON.parse(fs.readFileSync(preguntasActitudFile, 'utf-8'));
    const existentesActitud = await prisma.pregunta.count({
      where: { tipo_bateria: 'ACTITUD' },
    });

    if (existentesActitud === 0) {
      for (const q of rawActitud) {
        await prisma.pregunta.create({
          data: {
            modulo_id: modulo.id,
            tipo_bateria: 'ACTITUD',
            categoria: q.categoria,
            orden: q.orden,
            enunciado: q.enunciado,
            tipo_pregunta: 'TEORICA',
            peso_puntos: 1.0,
            opciones: {
              create: q.opciones.map((opt: string) => ({
                texto: opt,
                es_correcta: false, // Sin respuestas correctas/incorrectas
              })),
            },
          },
        });
      }
      console.log(`✅ ${rawActitud.length} preguntas de Actitud creadas.`);
    } else {
      console.log(`ℹ️ ${existentesActitud} preguntas de Actitud ya existen en base de datos.`);
    }
  }

  // 9. Batería de Aptitud (43 preguntas oficiales del test aptitud.pdf)
  console.log('📐 Sembrando 43 preguntas oficiales del Test de Aptitud PROFER...');
  const preguntasAptitudFile = path.join(__dirname, 'data/preguntas_aptitud.json');
  if (fs.existsSync(preguntasAptitudFile)) {
    const rawAptitud = JSON.parse(fs.readFileSync(preguntasAptitudFile, 'utf-8'));
    const existentesAptitud = await prisma.pregunta.count({
      where: { tipo_bateria: 'APTITUD' },
    });

    if (existentesAptitud === 0) {
      for (const q of rawAptitud) {
        await prisma.pregunta.create({
          data: {
            modulo_id: modulo.id,
            tipo_bateria: 'APTITUD',
            categoria: q.categoria,
            orden: q.orden,
            enunciado: q.enunciado,
            tipo_pregunta: 'TEORICA',
            peso_puntos: 1.0,
            opciones: {
              create: q.opciones.map((opt: string) => ({
                texto: opt,
                es_correcta: false,
              })),
            },
          },
        });
      }
      console.log(`✅ ${rawAptitud.length} preguntas de Aptitud creadas.`);
    } else {
      console.log(`ℹ️ ${existentesAptitud} preguntas de Aptitud ya existen en base de datos.`);
    }
  }

  // 10. Batería Técnica CTS Oficial (143 preguntas de la evaluación CTS)
  console.log('💻 Sembrando 143 preguntas oficiales de la Prueba Técnica CTS...');
  const preguntasTecnicasFile = path.join(__dirname, 'data/preguntas_tecnico_cts.json');
  if (fs.existsSync(preguntasTecnicasFile)) {
    const rawTecnicas = JSON.parse(fs.readFileSync(preguntasTecnicasFile, 'utf-8'));
    let agregadas = 0;
    for (let i = 0; i < rawTecnicas.length; i++) {
      const q = rawTecnicas[i];
      const enunciadoConCodigo = `[${q.codigo}] ${q.enunciado}`;
      const yaExiste = await prisma.pregunta.findFirst({
        where: {
          tipo_bateria: 'TECNICO',
          enunciado: { contains: q.codigo },
        },
      });

      if (!yaExiste) {
        await prisma.pregunta.create({
          data: {
            modulo_id: modulo.id,
            tipo_bateria: 'TECNICO',
            categoria: q.categoria,
            orden: i + 1,
            enunciado: enunciadoConCodigo,
            tipo_pregunta: 'TEORICA',
            peso_puntos: 1.0,
            opciones: {
              create: [
                {
                  texto: q.respuestaCandidato || 'Opción conceptual estándar',
                  es_correcta: q.estado !== 'INCORRECTA',
                },
                {
                  texto: 'Alternativa incorrecta o contraejemplo técnico',
                  es_correcta: false,
                },
              ],
            },
          },
        });
        agregadas++;
      }
    }
    console.log(`✅ ${agregadas} preguntas oficiales de la Prueba Técnica CTS sincronizadas.`);
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
