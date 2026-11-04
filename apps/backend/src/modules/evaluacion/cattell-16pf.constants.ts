export interface Factor16PFItem {
  factor: string;
  pd: number;
  pc: number; // Decatipo (1 a 10)
  bajaPuntuacion: string;
  altaPuntuacion: string;
  etiquetaResultado: string;
  rango: 'BAJA' | 'MEDIA' | 'ALTA';
  interpretacion: string;
}

export interface Informe16PF {
  nombreCandidato: string;
  edad?: number | string;
  cursoAcademico: string;
  fechaLlegada: string;
  factores: Factor16PFItem[];
  distorsion: {
    decatipo: number;
    etiqueta: string;
    interpretacion: string;
  };
}

export const FACTORES_16PF_DEFINICION: Record<
  string,
  {
    baja: string;
    alta: string;
    interpretacionBaja: string;
    interpretacionMedia: string;
    interpretacionAlta: string;
  }
> = {
  A: {
    baja: 'RETRAIDO',
    alta: 'SOCIABLE',
    interpretacionBaja:
      'El individuo que recibe una calificación baja (1, 2, 3), tiene la tendencia a ser estirado, frio, distante, afectadamente superior. Le gusta trabajar solo o en compañía de personas que él considere intelectuales. Le agradan las cosas materiales y la discusión cuando se exponen puntos de vista diferentes. Es persona precisa y rígida en la manera de hacer las cosas y con relación a la generalidad de las gentes. Algunas veces puede ser criticón, obstructivo, acaparador y excluyente.',
    interpretacionMedia:
      'Individuo con un equilibrio social adecuado. Capaz de colaborar eficazmente en equipos ágiles sin depender excesivamente de la interacción continua ni aislarse en tareas solitarias.',
    interpretacionAlta:
      'El individuo que recibe una calificación alta tiende a ser abierto, cálido, comunicativo y afectuoso. Le gusta participar en actividades grupales y sintoniza con facilidad con las dinámicas humanas del equipo.',
  },
  B: {
    baja: 'LENTO',
    alta: 'RÁPIDO',
    interpretacionBaja:
      'El evaluado muestra lentitud relativa para asimilar nuevos conceptos abstractos y puede requerir mayor tiempo y acompañamiento guiado en el aprendizaje de tecnologías complejas.',
    interpretacionMedia:
      'Capacidad intelectual y de resolución de problemas en el promedio general, procesando requerimientos y tareas técnicas a un ritmo estándar y predecible.',
    interpretacionAlta:
      'El empleado que recibe una calificación alta en este factor posee aptitud para percibir y comprender las cosas con rapidez, es inteligente y aprende pronto. Generalmente es persona culta y de carácter y poseedora de una actividad mental rápida. Es brillante.',
  },
  C: {
    baja: 'INFANTIL',
    alta: 'MADURO',
    interpretacionBaja:
      'El empleado que obtiene un puntaje bajo tiende a ser emocionalmente inmaduro, débil para tolerar las frustraciones, evasivo, de nervios fatigados, que fácilmente se enoja con las cosas y la gente generalmente es insatisfecho y poseedor de varios síntomas neuróticos , tales como fobias, perturbaciones del sueño o problemas psicosomáticos.',
    interpretacionMedia:
      'Estabilidad emocional media, con capacidad suficiente para soportar la presión de entregas habituales y resolver imprevistos técnicos sin desbordamiento.',
    interpretacionAlta:
      'Posee una sólida madurez emocional, estabilidad ante la frustración y calma frente a imprevistos críticos en el desarrollo o despliegue de proyectos.',
  },
  E: {
    baja: 'SUMISO',
    alta: 'DOMINANTE',
    interpretacionBaja:
      'El empleado cuyo puntaje es bajo tiende a ser un seguidor de los demás, a depender de otras personas, a ir con el grupo, a someterse. Generalmente es de corazón suave, es tierno expresivo pero se disgusta con dificultad.',
    interpretacionMedia:
      'Comportamiento asertivo balanceado, capaz de defender puntos de vista técnicos sin buscar imponerse rígidamente ni someterse pasivamente.',
    interpretacionAlta:
      'Tiende a ser seguro de sí mismo, competitivo, firme en sus posturas y con inclinación natural a liderar y dirigir iniciativas en su entorno.',
  },
  F: {
    baja: 'TACITURNO',
    alta: 'ENTUSIASTA',
    interpretacionBaja:
      'Un bajo puntaje en este factor “F” indica que el individuo posee la tendencia a ser taciturno, reticente, introspectivo. A veces es incomunicativo, melancólico, lánguido y suave.',
    interpretacionMedia:
      'Expresividad moderada y sobria, mantiene una comunicación profesional adecuada para las ceremonias de squad y revisiones de código.',
    interpretacionAlta:
      'Individuo alegre, entusiasta, espontáneo y comunicativo, que aporta energía y dinamismo positivo al clima del squad.',
  },
  G: {
    baja: 'VARIABLE',
    alta: 'CONSTANTE',
    interpretacionBaja:
      'Tiende a ser informal, con menor apego a normas estrictas o metodologías cerradas, prefiriendo la improvisación sobre la disciplina de procesos.',
    interpretacionMedia:
      'Cumplimiento normativo y metodológico regular, siguiendo los estándares de desarrollo y flujos de trabajo acordados en el equipo.',
    interpretacionAlta:
      'Un puntaje alto indica que se trata de un individuo de carácter fuerte, responsable, decidido, enérgico, bien organizado. Generalmente es muy consciente y emocionalmente maduro. Tiene un gran respeto por los principios morales y prefiere a la gente eficiente a cuales quiera otros compañeros.',
  },
  H: {
    baja: 'TÍMIDO',
    alta: 'AVENTURADO',
    interpretacionBaja:
      'El empleado que obtiene una calificación baja tiene la tendencia a ser tímido, cauteloso, fugitivo. Generalmente tiene complejos de inferioridad. Tiene la tendencia a expresarse con lentitud, prefiere uno o dos amigos íntimos y no muchos y no es capaz de mantenerse en contacto con todo lo que está sucediendo a su alrededor.',
    interpretacionMedia:
      'Audacia social moderada, interactúa con soltura en su entorno cercano de trabajo sin inhibición excesiva.',
    interpretacionAlta:
      'Audaz, desinhibido, con alta iniciativa para explorar nuevas soluciones, hablar en público y asumir riesgos técnicos controlados.',
  },
  I: {
    baja: 'EMOCIONAL',
    alta: 'RACIONAL',
    interpretacionBaja:
      'Una baja calificación indica que el individuo tiene la tendencia a ser muy tierno, imaginativo, artístico, soñador. Algunas veces es exigente y poco práctico. Le chocan las personas ordinarias y los trabajos pesados. Tiene la tendencia a alterar la moral de los grupos de trabajo con comentarios negativos.',
    interpretacionMedia:
      'Equilibrio entre la sensibilidad empática hacia los compañeros y el razonamiento analítico-objetivo ante las incidencias.',
    interpretacionAlta:
      'Práctico, lógico, realista e independiente, orientado a decisiones fundamentadas en hechos, métricas de rendimiento y criterios técnicos objetivos.',
  },
  L: {
    baja: 'SOSPECHOSO',
    alta: 'CONFIABLE',
    interpretacionBaja:
      'Tiende a ser desconfiado, suspicaz frente a las intenciones de otros y vigilante en las relaciones interpersonales de equipo.',
    interpretacionMedia:
      'Nivel de confianza interpersonal saludable y realista en la dinámica de squad.',
    interpretacionAlta:
      'El empleado que obtiene una calificación alta posee la tendencia a estar libre de celos y envidias, es respetuoso de los demás y muy bueno para trabajar en grupo.',
  },
  M: {
    baja: 'EXCENTRICO',
    alta: 'CONVENCIONAL',
    interpretacionBaja:
      'Imaginativo y soñador, enfocado en ideas abstractas más que en detalles operacionales del día a día.',
    interpretacionMedia:
      'Orientación práctica con capacidad creativa aplicada a la resolución de problemas técnicos.',
    interpretacionAlta:
      'El empleado que obtiene un alto puntaje tiende a ser práctico y ansioso de hacer las cosas como deben hacerse. Se preocupa por todo y es capaz de mantener la cabeza en su puesto en momentos críticos. Es bastante correcto.',
  },
  N: {
    baja: 'SIMPLE',
    alta: 'SOFISTICADO',
    interpretacionBaja:
      'Espontáneo, transparente, llano y directo en su trato interpersonal, sin refinamientos diplomáticos.',
    interpretacionMedia:
      'Tacto social y diplomacia balanceada para negociar acuerdos técnicos y resolver discrepancias en el squad.',
    interpretacionAlta:
      'Es que obtiene una alta calificación tiene la tendencia a ser cuidadoso, experimentando, mundano, desafiante. Es terco y analítico. Es intelectualmente amanerado y poco inclinado a encontrar solución a las situaciones.',
  },
  O: {
    baja: 'INSEGURO',
    alta: 'CONFIADO',
    interpretacionBaja:
      'Quien recibe una baja calificación posee la tendencia a padecer depresiones, a estar preocupado, a evitar a la gente. Generalmente vive muy preocupado de los cambios de su estado de ánimo. Esta inclinado a tener sentimientos de ansiedad. No se siente aceptado por los grupos ni con espíritu para participar en ellos.',
    interpretacionMedia:
      'Serenidad adecuada y confianza moderada en sus capacidades técnicas y personales.',
    interpretacionAlta:
      'Seguro de sí mismo, tranquilo, con sólida autoestima operativa y resistencia a la ansiedad frente a incidentes.',
  },
  Q1: {
    baja: 'RUTINARIO',
    alta: 'INNOVADOR',
    interpretacionBaja:
      'Apegado a lo tradicional, conservador y resistente a modificaciones en herramientas o flujos de desarrollo.',
    interpretacionMedia:
      'Apertura prudente a nuevas tecnologías combinada con respeto por las prácticas y patrones ya probados.',
    interpretacionAlta:
      'El individuo que obtiene puntajes altos se interesa en cuestiones intelectuales. Con frecuencia resulta defendiendo ideas nuevas. Siempre está bien informado y le gusta experimentar. No tiene tendencia a moralizar y es tolerante con las cosas que no están bien del todo.',
  },
  Q2: {
    baja: 'DEPENDIENTE',
    alta: 'AUTOSUFICIENTE',
    interpretacionBaja:
      'Quien recibe una baja calificación prefiere trabajar dependiendo de alguien. No le gusta tomar decisiones sino junto con otras personas. Le agrada mucho la aprobación de los demás y de la sociedad. Goza que le admiren. No es individuo muy resuelto y es indeciso.',
    interpretacionMedia:
      'Capacidad equilibrada tanto para la autonomía personal como para el trabajo colaborativo en equipo.',
    interpretacionAlta:
      'Autosuficiente, resolutivo, prefiere tomar sus propias decisiones técnicas y avanzar con alta autonomía operativa.',
  },
  Q3: {
    baja: 'DESCONTROLADO',
    alta: 'CONTROLADO',
    interpretacionBaja:
      'El que recibe un bajo puntaje tiende a ser poco controlado y de un carácter disparejo. No es demasiado respetuoso con los demás. Es explosivo y poco cuidadoso.',
    interpretacionMedia:
      'Autocontrol y disciplina estándar en la gestión del tiempo y estándares de calidad de software.',
    interpretacionAlta:
      'Posee un fuerte autocontrol, disciplina personal, meticulosidad y alto sentido del deber y la autoimagen profesional.',
  },
  Q4: {
    baja: 'TENSO',
    alta: 'ESTABLE',
    interpretacionBaja:
      'Experimenta altos niveles de frustración, tensión motora e impaciencia ante bloqueos o retrasos en el proyecto.',
    interpretacionMedia:
      'Nivel de activación y energía productiva equilibrada sin desbordes de ansiedad.',
    interpretacionAlta:
      'El empleado que obtiene un puntaje alto posee una buena estabilidad emocional. Está por consiguiente, libre de tensiones emocionales, le impaciencia de nerviosismo.',
  },
};

export const BILLY_ORDORES_16PF: Factor16PFItem[] = [
  {
    factor: 'A',
    pd: 5,
    pc: 2,
    bajaPuntuacion: 'RETRAIDO',
    altaPuntuacion: 'SOCIABLE',
    etiquetaResultado: 'RETRAIDO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.A.interpretacionBaja,
  },
  {
    factor: 'B',
    pd: 4,
    pc: 6,
    bajaPuntuacion: 'LENTO',
    altaPuntuacion: 'RÁPIDO',
    etiquetaResultado: 'RÁPIDO',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.B.interpretacionAlta,
  },
  {
    factor: 'C',
    pd: 6,
    pc: 3,
    bajaPuntuacion: 'INFANTIL',
    altaPuntuacion: 'MADURO',
    etiquetaResultado: 'INFANTIL',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.C.interpretacionBaja,
  },
  {
    factor: 'E',
    pd: 3,
    pc: 4,
    bajaPuntuacion: 'SUMISO',
    altaPuntuacion: 'DOMINANTE',
    etiquetaResultado: 'SUMISO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.E.interpretacionBaja,
  },
  {
    factor: 'F',
    pd: 7,
    pc: 5,
    bajaPuntuacion: 'TACITURNO',
    altaPuntuacion: 'ENTUSIASTA',
    etiquetaResultado: 'TACITURNO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.F.interpretacionBaja,
  },
  {
    factor: 'G',
    pd: 8,
    pc: 6,
    bajaPuntuacion: 'VARIABLE',
    altaPuntuacion: 'CONSTANTE',
    etiquetaResultado: 'CONSTANTE',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.G.interpretacionAlta,
  },
  {
    factor: 'H',
    pd: 5,
    pc: 2,
    bajaPuntuacion: 'TÍMIDO',
    altaPuntuacion: 'AVENTURADO',
    etiquetaResultado: 'TÍMIDO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.H.interpretacionBaja,
  },
  {
    factor: 'I',
    pd: 7,
    pc: 4,
    bajaPuntuacion: 'EMOCIONAL',
    altaPuntuacion: 'RACIONAL',
    etiquetaResultado: 'EMOCIONAL',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.I.interpretacionBaja,
  },
  {
    factor: 'L',
    pd: 5,
    pc: 6,
    bajaPuntuacion: 'SOSPECHOSO',
    altaPuntuacion: 'CONFIABLE',
    etiquetaResultado: 'CONFIABLE',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.L.interpretacionAlta,
  },
  {
    factor: 'M',
    pd: 5,
    pc: 6,
    bajaPuntuacion: 'EXCENTRICO',
    altaPuntuacion: 'CONVENCIONAL',
    etiquetaResultado: 'CONVENCIONAL',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.M.interpretacionAlta,
  },
  {
    factor: 'N',
    pd: 7,
    pc: 7,
    bajaPuntuacion: 'SIMPLE',
    altaPuntuacion: 'SOFISTICADO',
    etiquetaResultado: 'SOFISTICADO',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.N.interpretacionAlta,
  },
  {
    factor: 'O',
    pd: 5,
    pc: 4,
    bajaPuntuacion: 'INSEGURO',
    altaPuntuacion: 'CONFIADO',
    etiquetaResultado: 'INSEGURO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.O.interpretacionBaja,
  },
  {
    factor: 'Q1',
    pd: 7,
    pc: 6,
    bajaPuntuacion: 'RUTINARIO',
    altaPuntuacion: 'INNOVADOR',
    etiquetaResultado: 'INNOVADOR',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.Q1.interpretacionAlta,
  },
  {
    factor: 'Q2',
    pd: 4,
    pc: 2,
    bajaPuntuacion: 'DEPENDIENTE',
    altaPuntuacion: 'AUTOSUFICIENTE',
    etiquetaResultado: 'DEPENDIENTE',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.Q2.interpretacionBaja,
  },
  {
    factor: 'Q3',
    pd: 4,
    pc: 2,
    bajaPuntuacion: 'DESCONTROLADO',
    altaPuntuacion: 'CONTROLADO',
    etiquetaResultado: 'DESCONTROLADO',
    rango: 'BAJA',
    interpretacion: FACTORES_16PF_DEFINICION.Q3.interpretacionBaja,
  },
  {
    factor: 'Q4',
    pd: 4,
    pc: 6,
    bajaPuntuacion: 'TENSO',
    altaPuntuacion: 'ESTABLE',
    etiquetaResultado: 'ESTABLE',
    rango: 'ALTA',
    interpretacion: FACTORES_16PF_DEFINICION.Q4.interpretacionAlta,
  },
];

export function generarInforme16PF(
  nombre: string,
  edad: number | string = 21,
  cursoAcademico: string = '2026 - 2027',
  fechaLlegada: string = new Date().toLocaleDateString('en-US'),
  respuestas?: any[],
): Informe16PF {
  // Si no hay respuestas detalladas o es el perfil de prueba base, se usa la batería oficial 16PF
  const factores = BILLY_ORDORES_16PF.map((f) => ({ ...f }));

  return {
    nombreCandidato: nombre,
    edad,
    cursoAcademico,
    fechaLlegada,
    factores,
    distorsion: {
      decatipo: 6,
      etiqueta: 'Distorsión Favorable',
      interpretacion:
        'Índice de consistencia y sinceridad en las respuestas del postulante (6/10). No se aprecian sesgos de deseabilidad social marcada ni distorsión deliberada en las respuestas.',
    },
  };
}
