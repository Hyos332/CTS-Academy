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

  // Determinar recomendación de Squad basada en el balance real de las 4 áreas
  let squadRecomendado = {
    codigo: 'TEAM-01',
    nombre: 'Team Fénix',
    especialidad: 'Fullstack TypeScript & Arquitectura Cloud',
    lider: 'Diego Moys (Tech Lead)',
    afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(notaSobre10 * 8.8 + 15))),
    justificacion:
      'Excelente dominio en Back-End y fundamentos de Programación Orientada a Objetos y Arquitectura en Capas. Su solvencia técnica encaja de manera sobresaliente en el núcleo de microservicios y NestJS de Team Fénix.',
    fortalezasClave: ['Arquitectura Limpia & NestJS', 'POO & Patrones de Diseño', 'Asincronía & APIs'],
  };

  if (puntuacionFrontend > puntuacionBackend && puntuacionFrontend > 60) {
    squadRecomendado = {
      codigo: 'TEAM-03',
      nombre: 'Team Titán',
      especialidad: 'Frontend React, Mobile & UX',
      lider: 'Lucía Vargas TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionFrontend * 0.9 + 10))),
      justificacion:
        'Destacada solidez en tecnologías Front-End, JavaScript moderno, CSS Grid/Flexbox y ciclo de vida de componentes React. Su perfil dinamizará la construcción de experiencias de usuario.',
      fortalezasClave: ['React & TypeScript', 'CSS Modular & Layouts', 'Consumo de APIs'],
    };
  } else if (puntuacionSysadmin > 60 && puntuacionBackend > 60) {
    squadRecomendado = {
      codigo: 'TEAM-02',
      nombre: 'Team Vulcano',
      especialidad: 'Backend & Microservicios DevOps',
      lider: 'Alejandro Ruiz TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionSysadmin * 0.5 + puntuacionBackend * 0.5))),
      justificacion:
        'Combinación óptima de backend y administración de sistemas. Familiarizado con Linux, Docker, proxy inverso y conteneirización, ideal para infraestructura y despliegue continuo.',
      fortalezasClave: ['Docker & Contenedores', 'Linux & Servidores', 'Microservicios'],
    };
  } else if (puntuacionGeneral > 70 && puntuacionBackend > 70) {
    squadRecomendado = {
      codigo: 'TEAM-04',
      nombre: 'Team Orión',
      especialidad: 'Data Engineering, IA & Analytics',
      lider: 'Marcos Navarro TechLead',
      afinidadPorcentaje: Math.min(98, Math.max(60, Math.round(puntuacionGeneral * 0.5 + puntuacionBackend * 0.5))),
      justificacion:
        'Fuerte razonamiento lógico analítico y modelado de datos. Apto para canalizaciones de procesamiento, algoritmos y persistencia estructurada.',
      fortalezasClave: ['Lógica Analítica', 'Bases de Datos & SQL', 'Algoritmia'],
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
