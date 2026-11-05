export interface HabilidadAptitudItem {
  habilidad: string;
  nivelActual: number; // 0 a 5
  nivelDeseado: number; // 5 por defecto
}

export interface CategoriaAptitudItem {
  codigo: string;
  nombre: string;
  items: HabilidadAptitudItem[];
}

export interface MatrizAptitudInforme {
  nombreCandidato: string;
  escala: string;
  promedioNivelActual: number;
  categorias: CategoriaAptitudItem[];
  areasFortaleza: string[];
  areasMejora: string[];
}

export const BILLY_ORDORES_MATRIZ_APTITUD: CategoriaAptitudItem[] = [
  {
    codigo: 'SYSADMIN',
    nombre: 'SysAdmin & Cloud / Infraestructura',
    items: [
      { habilidad: '[GIT]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[Redes]', nivelActual: 2, nivelDeseado: 5 },
      { habilidad: '[Seguridad]', nivelActual: 2, nivelDeseado: 5 },
      { habilidad: '[Cloud]', nivelActual: 2, nivelDeseado: 5 },
      { habilidad: '[Docker]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Kubernets]', nivelActual: 1, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'DATABASES',
    nombre: 'Bases de Datos',
    items: [
      { habilidad: '[Relacionales]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[No Relacionales]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[ORM]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Normalización]', nivelActual: 3, nivelDeseado: 5 },
      { habilidad: '[ACID]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Modelos Dimensionales]', nivelActual: 2, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'BACKEND_POO',
    nombre: 'Backend & Programación Orientada a Objetos',
    items: [
      { habilidad: '[JavaScript]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[PHP]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Python]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[Creación de APIs]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Seguridad Web]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Testing]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Inteligencia Artificial]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Desarrollo Apps Móviles]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Programación orientada a objetos]', nivelActual: 5, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'FRONTEND_UI',
    nombre: 'Frontend & UI/UX',
    items: [
      { habilidad: '[HTML]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[CSS]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[JavaScript]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[(Vue, Boostrap, entre otros...)]', nivelActual: 5, nivelDeseado: 5 },
      { habilidad: '[Figma]', nivelActual: 1, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'OPEN_SOURCE_CMS',
    nombre: 'Sistemas OpenSource',
    items: [
      { habilidad: '[Drupal]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[WordPress]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Moodle]', nivelActual: 1, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'FRAMEWORKS',
    nombre: 'Frameworks',
    items: [
      { habilidad: '[Laravel]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Codeigniter]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[jQuery]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Bootstrap]', nivelActual: 4, nivelDeseado: 5 },
      { habilidad: '[Otros]', nivelActual: 3, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'NEGOCIO',
    nombre: 'Competencias de Negocio y Gestión',
    items: [
      { habilidad: '[Inteligencia de Negocios]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Procesos de Negocio]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Captura de Requerimientos]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '[Organizazión]', nivelActual: 3, nivelDeseado: 5 },
      { habilidad: '[Motivador de Equipo de trabajo]', nivelActual: 2, nivelDeseado: 5 },
    ],
  },
  {
    codigo: 'DESEMPENO',
    nombre: 'Áreas de Desempeño Preferidas',
    items: [
      { habilidad: '¿En qué área te desenvuelves mejor? [BackEnd]', nivelActual: 4, nivelDeseado: 5 },
      { habilidad: '¿En qué área te desenvuelves mejor? [FrontEnd]', nivelActual: 4, nivelDeseado: 5 },
      { habilidad: '¿En qué área te desenvuelves mejor? [SysAdmin]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '¿En qué área te desenvuelves mejor? [QA]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '¿En qué área te desenvuelves mejor? [Pruebas]', nivelActual: 1, nivelDeseado: 5 },
      { habilidad: '¿En qué área te desenvuelves mejor? [Base de Datos]', nivelActual: 2, nivelDeseado: 5 },
    ],
  },
];

export function generarMatrizAptitudes(
  emailOrNombre: string,
  respuestas?: any[],
): MatrizAptitudInforme | null {
  if (!respuestas || respuestas.length === 0) {
    return null;
  }

  // Plantilla base con nivel inicial 0
  let categorias = BILLY_ORDORES_MATRIZ_APTITUD.map((c) => ({
    ...c,
    items: c.items.map((i) => ({ ...i, nivelActual: 0 })),
  }));

  const respuestasMap = new Map<string, number>();

  for (const r of respuestas) {
    const enunciado = (r.pregunta?.enunciado || '').toLowerCase();
    const opcionTexto = (r.opcion_seleccionada?.texto || '').toLowerCase();
    const match = opcionTexto.match(/^(\d)/);
    const nivel = match ? parseInt(match[1], 10) : 0;

    if (enunciado.includes('git')) respuestasMap.set('[git]', nivel);
    else if (enunciado.includes('redes')) respuestasMap.set('[redes]', nivel);
    else if (enunciado.includes('seguridad informática') || enunciado.includes('seguridad')) respuestasMap.set('[seguridad]', nivel);
    else if (enunciado.includes('cloud') || enunciado.includes('aws') || enunciado.includes('gcp')) respuestasMap.set('[cloud]', nivel);
    else if (enunciado.includes('docker') || enunciado.includes('kubernetes')) {
      respuestasMap.set('[docker]', nivel);
      respuestasMap.set('[kubernets]', Math.max(0, nivel - 1));
    } else if (enunciado.includes('relacionales') || enunciado.includes('sql') || enunciado.includes('postgres')) respuestasMap.set('[relacionales]', nivel);
    else if (enunciado.includes('no relacionales') || enunciado.includes('mongo')) respuestasMap.set('[no relacionales]', nivel);
    else if (enunciado.includes('orm') || enunciado.includes('prisma') || enunciado.includes('typeorm')) respuestasMap.set('[orm]', nivel);
    else if (enunciado.includes('normalización')) respuestasMap.set('[normalización]', nivel);
    else if (enunciado.includes('acid')) respuestasMap.set('[acid]', nivel);
    else if (enunciado.includes('typescript')) {
      respuestasMap.set('[typescript]', nivel);
      respuestasMap.set('[javascript]', Math.max(nivel, 3));
    } else if (enunciado.includes('javascript')) respuestasMap.set('[javascript]', nivel);
    else if (enunciado.includes('php')) respuestasMap.set('[php]', nivel);
    else if (enunciado.includes('python')) respuestasMap.set('[python]', nivel);
    else if (enunciado.includes('api') || enunciado.includes('rest')) respuestasMap.set('[creación de apis]', nivel);
    else if (enunciado.includes('inteligencia artificial') || enunciado.includes('ia') || enunciado.includes('machine learning')) respuestasMap.set('[inteligencia artificial]', nivel);
    else if (enunciado.includes('móviles') || enunciado.includes('react native') || enunciado.includes('flutter')) respuestasMap.set('[desarrollo apps móviles]', nivel);
    else if (enunciado.includes('objetos') || enunciado.includes('poo') || enunciado.includes('oop')) respuestasMap.set('[programación orientada a objetos]', nivel);
    else if (enunciado.includes('html')) respuestasMap.set('[html]', nivel);
    else if (enunciado.includes('css') || enunciado.includes('scss') || enunciado.includes('sass')) respuestasMap.set('[css]', nivel);
    else if (enunciado.includes('figma')) respuestasMap.set('[figma]', nivel);
    else if (enunciado.includes('drupal')) respuestasMap.set('[drupal]', nivel);
    else if (enunciado.includes('wordpress')) respuestasMap.set('[wordpress]', nivel);
    else if (enunciado.includes('moodle')) respuestasMap.set('[moodle]', nivel);
    else if (enunciado.includes('laravel')) respuestasMap.set('[laravel]', nivel);
    else if (enunciado.includes('desempeño en backend') || enunciado.includes('mejor? [backend]')) respuestasMap.set('¿en qué área te desenvuelves mejor? [backend]', nivel);
    else if (enunciado.includes('desempeño en frontend') || enunciado.includes('mejor? [frontend]')) respuestasMap.set('¿en qué área te desenvuelves mejor? [frontend]', nivel);
    else if (enunciado.includes('desempeño en sysadmin') || enunciado.includes('mejor? [sysadmin]')) respuestasMap.set('¿en qué área te desenvuelves mejor? [sysadmin]', nivel);
    else if (enunciado.includes('desempeño en base de datos') || enunciado.includes('mejor? [base de datos]')) respuestasMap.set('¿en qué área te desenvuelves mejor? [base de datos]', nivel);
  }

  categorias = categorias.map((cat) => ({
    ...cat,
    items: cat.items.map((it) => {
      const key = it.habilidad.toLowerCase();
      let nivel = 0;
      if (respuestasMap.has(key)) {
        nivel = respuestasMap.get(key)!;
      } else {
        for (const [k, v] of respuestasMap.entries()) {
          const cleanK = k.replace(/\[|\]/g, '');
          if (key.includes(cleanK) || cleanK.includes(key)) {
            nivel = v;
            break;
          }
        }
      }
      return {
        ...it,
        nivelActual: nivel,
      };
    }),
  }));

  let totalItems = 0;
  let sumaNiveles = 0;
  const fortalezas: string[] = [];
  const mejoras: string[] = [];

  for (const cat of categorias) {
    for (const it of cat.items) {
      totalItems++;
      sumaNiveles += it.nivelActual;
      if (it.nivelActual >= 4) {
        fortalezas.push(`${it.habilidad} (${it.nivelActual}/5)`);
      } else if (it.nivelActual <= 1) {
        mejoras.push(`${it.habilidad} (${it.nivelActual}/5)`);
      }
    }
  }

  const promedioNivelActual = totalItems > 0 ? Number((sumaNiveles / totalItems).toFixed(1)) : 0;

  return {
    nombreCandidato: emailOrNombre,
    escala: '0: Conocimiento Nulo. 5: Conocimiento Muy Alto',
    promedioNivelActual,
    categorias,
    areasFortaleza: fortalezas.slice(0, 6),
    areasMejora: mejoras.slice(0, 6),
  };
}
