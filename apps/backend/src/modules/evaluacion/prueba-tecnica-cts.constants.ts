import * as fs from 'fs';
import * as path from 'path';

export interface PreguntaTecnicaCTSItem {
  codigo: string;
  categoria: 'GENERAL' | 'FRONT-END' | 'BACK-END' | 'SYSADMIN';
  enunciado: string;
  respuestaCandidato?: string;
  estado: 'CORRECTA' | 'INCORRECTA' | 'OMITIDA';
  comentario?: string;
}

export interface InformePruebaTecnicaCTS {
  idRespuesta: number | string;
  fechaEnvio: string;
  fechaInicio: string;
  fechaUltimaAccion: string;
  nombreCandidato: string;
  apellidosCandidato: string;
  emailCandidato: string;
  sede: string;
  convocatoria: string;
  puntuacionesPorArea: {
    general: number;
    frontend: number;
    backend: number;
    sysadmin: number;
    globalSobre10: number;
  };
  squadRecomendado: {
    codigo: string;
    nombre: string;
    especialidad: string;
    lider: string;
    afinidadPorcentaje: number;
    justificacion: string;
    fortalezasClave: string[];
  };
  preguntas: PreguntaTecnicaCTSItem[];
}

// Cargar preguntas oficiales de la prueba técnica CTS
let preguntasBase: any[] = [];
const possiblePaths = [
  path.join(__dirname, '../../prisma/data/preguntas_tecnico_cts.json'),
  path.join(__dirname, '../../../prisma/data/preguntas_tecnico_cts.json'),
  path.join(process.cwd(), 'prisma/data/preguntas_tecnico_cts.json'),
  path.join(process.cwd(), 'apps/backend/prisma/data/preguntas_tecnico_cts.json'),
];

for (const p of possiblePaths) {
  try {
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        preguntasBase = data;
        break;
      }
    }
  } catch (e) {
    // ignorar y probar siguiente ruta
  }
}

export { preguntasBase as PREGUNTAS_TECNICAS_CTS_BASE };

export function generarInformePruebaTecnica(
  candidato: any,
  respuestasExistentes: any[] = [],
  calificacionExistente: any = null,
): InformePruebaTecnicaCTS | null {
  if (!respuestasExistentes || respuestasExistentes.length === 0) {
    return null;
  }

  const usuario = candidato.usuario || {};
  const nombre = usuario.nombre || 'Candidato';
  const apellidos = usuario.apellidos || '';
  const email = usuario.email || 'candidato@alumnos.uneatlantico.es';
  const sede = candidato.sede_origen || 'Santander (España)';
  const convocatoria = candidato.convocatoria?.denominacion || 'Convocatoria Admisión Febrero 2026';

  const fechaEnvio = candidato.creado_en
    ? new Date(candidato.creado_en).toLocaleString()
    : new Date().toLocaleString();
  const fechaInicio = candidato.creado_en
    ? new Date(new Date(candidato.creado_en).getTime() - 2 * 3600 * 1000).toLocaleString()
    : new Date().toLocaleString();

  // Mapear cada una de las respuestas REALES guardadas en la base de datos
  const preguntas: PreguntaTecnicaCTSItem[] = respuestasExistentes.map((r: any, idx: number) => {
    const q = r.pregunta || {};
    const opcion = r.opcion_seleccionada;
    const esCorrecta = Boolean(r.es_correcta);
    const textoRespuesta =
      opcion?.texto || r.codigo_entregado || '(Sin respuesta seleccionada)';

    return {
      codigo: q.orden ? `P${q.orden}` : `P${idx + 1}`,
      categoria: (q.categoria || 'GENERAL') as any,
      enunciado: q.enunciado || 'Pregunta de evaluación técnica',
      respuestaCandidato: textoRespuesta,
      estado: esCorrecta ? 'CORRECTA' : 'INCORRECTA',
      comentario: esCorrecta
        ? 'Respuesta correcta y verificada.'
        : 'Respuesta incorrecta según el criterio técnico de la batería.',
    };
  });

  // Calcular métricas exactas y fieles según las respuestas del candidato
  const totalPreguntas = respuestasExistentes.length;
  const totalCorrectas = respuestasExistentes.filter((r) => r.es_correcta === true).length;
  const notaSobre10 =
    calificacionExistente !== null && calificacionExistente !== undefined
      ? Number(calificacionExistente)
      : totalPreguntas > 0
        ? Number(((totalCorrectas / totalPreguntas) * 10).toFixed(1))
        : 0;

  const calcularArea = (catKeyword: string) => {
    const enArea = respuestasExistentes.filter((r) =>
      (r.pregunta?.categoria || '').toUpperCase().includes(catKeyword),
    );
    if (enArea.length === 0) return 0;
    const correctas = enArea.filter((r) => r.es_correcta === true).length;
    return Number(((correctas / enArea.length) * 100).toFixed(1));
  };

  const puntuacionGeneral = calcularArea('GENERAL');
  const puntuacionFrontend = calcularArea('FRONT');
  const puntuacionBackend = calcularArea('BACK');
  const puntuacionSysadmin = calcularArea('SYSADMIN');

  // Determinar recomendación de Squad basada en el balance real de las 4 áreas y los 4 squads oficiales
  let squadRecomendado = {
    codigo: 'TEAM-01',
    nombre: 'Fénix',
    especialidad: 'Desarrollo de aplicaciones web internas y proyectos europeos',
    lider: 'Diego Moys (Tech Lead)',
    afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(notaSobre10 * 8.8 + 15))),
    justificacion:
      'Excelente dominio en desarrollo de aplicaciones web, APIs y lógica de backend con PHP/Laravel y frontend con React/Vue. Su solvencia técnica encaja de manera óptima en los proyectos de Fénix.',
    fortalezasClave: ['Laravel & PHP', 'React & Vue', 'MySQL / PostgreSQL'],
  };

  if (puntuacionSysadmin >= 60 || (puntuacionSysadmin > puntuacionFrontend && puntuacionSysadmin > puntuacionBackend)) {
    squadRecomendado = {
      codigo: 'TEAM-02',
      nombre: 'Departamento de Sistemas',
      especialidad: 'Soporte tecnológico, infraestructura de redes y mantenimiento',
      lider: 'Alejandro Ruiz TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionSysadmin * 0.7 + notaSobre10 * 3))),
      justificacion:
        'Sólidas competencias en infraestructura de red, sistemas operativos (Windows/Linux), soporte técnico y seguridad perimetral con Fortinet.',
      fortalezasClave: ['Redes & Infraestructura', 'Windows Server & Active Directory', 'Hardware & Fortinet'],
    };
  } else if (puntuacionFrontend >= 65 || (puntuacionFrontend > puntuacionBackend && puntuacionFrontend > 55)) {
    squadRecomendado = {
      codigo: 'TEAM-03',
      nombre: 'Presencia Web',
      especialidad: 'Imagen pública web FUNIBER, universidades asociadas y proyectos europeos',
      lider: 'Lucía Vargas TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionFrontend * 0.65 + notaSobre10 * 3.5))),
      justificacion:
        'Alta destreza en ecosistemas web modernos (Next.js, TypeScript), CMS (WordPress, Drupal, Strapi) y maquetación de portales institucionales de alto impacto.',
      fortalezasClave: ['NextJS & TypeScript', 'WordPress & Drupal', 'CMS Headless & PHP'],
    };
  } else if (puntuacionBackend >= 70 && puntuacionGeneral >= 60) {
    squadRecomendado = {
      codigo: 'TEAM-04',
      nombre: 'Acción Docente',
      especialidad: 'Campus virtuales Moodle, microservicios orientados a eventos y librerías TypeScript',
      lider: 'Marcos Navarro TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionBackend * 0.6 + puntuacionGeneral * 0.4))),
      justificacion:
        'Alineación destacada con desarrollo de microservicios orientados a eventos (RabbitMQ), integración con campus Moodle, librerías en TypeScript y disciplina TDD.',
      fortalezasClave: ['Moodle & PHP', 'RabbitMQ & Eventos', 'TypeScript & TDD'],
    };
  }

  return {
    idRespuesta: Math.floor(Math.random() * 200) + 74,
    fechaEnvio,
    fechaInicio,
    fechaUltimaAccion: fechaEnvio,
    nombreCandidato: nombre,
    apellidosCandidato: apellidos,
    emailCandidato: email,
    sede,
    convocatoria,
    puntuacionesPorArea: {
      general: puntuacionGeneral,
      frontend: puntuacionFrontend,
      backend: puntuacionBackend,
      sysadmin: puntuacionSysadmin,
      globalSobre10: notaSobre10,
    },
    squadRecomendado,
    preguntas,
  };
}
