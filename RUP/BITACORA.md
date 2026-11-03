<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | **Bitácora ADR** | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | [03 Diseño](/RUP/03-diseño/README.md) | [04 Desarrollo](/RUP/04-desarrollo/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

# Bitácora de Decisiones Arquitectónicas y Evolución RUP

Registro formal y cronológico de decisiones de diseño, acuerdos de modelado y evolución del proyecto **CTS Academy & Evaluator** bajo la metodología RUP (Rational Unified Process).

> [!NOTE]
> **Historial de Refinamiento y Lecciones Aprendidas**: Para consultar el registro de iteraciones, decisiones descartadas y correcciones de modelado realizadas sobre la marcha, visita la discusión oficial: [Discussion #9: Registro de Refinamientos](https://github.com/TheMoys/CTS-Academy/discussions/9).

---

## Índice de Decisiones (ADR)

| ID | Fecha | Título | Estado | Discusión Consolidada en GitHub |
| :---: | :---: | :--- | :---: | :--- |
| **[ADR-001](#adr-001-adopción-de-la-metodología-rup-estándar-uneatlantico)** | 2026-10-09 | Adopción de la metodología RUP estándar UNEATLANTICO | Aprobado | [Sesión 2026-10-09 (#7)](https://github.com/TheMoys/CTS-Academy/discussions/7) |
| **[ADR-002](#adr-002-diagramas-conceptuales-limpios-sin-atributos)** | 2026-10-09 | Diagramas conceptuales limpios sin atributos de entidad | Aprobado | [Sesión 2026-10-09 (#7)](https://github.com/TheMoys/CTS-Academy/discussions/7) |
| **[ADR-003](#adr-003-adopción-de-nomenclatura-institucional-programa-profer)** | 2026-10-09 | Adopción de nomenclatura institucional del Programa PROFER | Aprobado | [Sesión 2026-10-09 (#7)](https://github.com/TheMoys/CTS-Academy/discussions/7) |
| **[ADR-004](#adr-004-embudo-en-2-fases-y-asignación-a-los-6-equipos-de-cts)** | 2026-10-09 | Embudo de admisión en 2 fases y asignación a los 6 equipos de CTS | Aprobado | [Sesión 2026-10-09 (#7)](https://github.com/TheMoys/CTS-Academy/discussions/7) |
| **[ADR-005](#adr-005-gobernanza-institucional-convenio-programa-profer--universidad)** | 2026-10-09 | Gobernanza institucional: convenio Programa PROFER – Universidad | Aprobado | [Sesión 2026-10-09 (#7)](https://github.com/TheMoys/CTS-Academy/discussions/7) |
| **[ADR-006](#adr-006-descomposición-arquitectónica-en-3-microservicios)** | 2026-10-13 | Descomposición arquitectónica en 3 microservicios independientes | Aprobado | [Sesión 2026-10-13 (#8)](https://github.com/TheMoys/CTS-Academy/discussions/8) |
| **[ADR-007](#adr-007-admisión-continua-por-ciclos-académicos-batería-de-3-tests-e-inclusión-de-entrevista)** | 2026-10-14 | Admisión continua por ciclos académicos, batería de 3 tests e inclusión de entrevista | Aprobado | [Sesión 2026-10-13 (#8)](https://github.com/TheMoys/CTS-Academy/discussions/8) |
| **[ADR-008](#adr-008-canalización-de-candidatos-por-sedes-internacionales-y-eliminación-de-usuarionologueado)** | 2026-10-14 | Canalización de candidatos por sedes internacionales y eliminación de UsuarioNoLogueado | Aprobado | [Sesión 2026-10-13 (#8)](https://github.com/TheMoys/CTS-Academy/discussions/8) |
| **[ADR-009](#adr-009-delimitación-de-actores-opacidad-de-tests-para-el-candidato-entrevistas-google-meet-en-el-perfil-por-el-gestor-y-aislamiento-del-tl)** | 2026-10-14 | Delimitación de actores: opacidad de tests, entrevistas Google Meet en el Perfil y aislamiento del TL | Aprobado | — |
| **[ADR-010](#adr-010-refinamiento-estructural-del-dominio-top-to-bottom-transición-candidato-alumno-y-rediseño-pedagógico-de-materiales)** | 2026-10-22 | Refinamiento estructural del dominio top-to-bottom, transición Candidato-Alumno y rediseño pedagógico de materiales | Aprobado | — |
| **[ADR-011](#adr-011-patrón-canónico-de-acceso-usuarionologueado-exclusividad-de-cerrarsesion-en-roles-y-extend-condicional)** | 2026-10-23 | Patrón canónico de acceso: UsuarioNoLogueado, exclusividad de cerrarSesion en roles y <<extend>> condicional | Aprobado | — |
| **[ADR-012](#adr-012-elección-de-postgresql-16-para-persistencia-relacional-y-soporte-de-microservicios)** | 2026-10-29 | Elección de PostgreSQL 16 para persistencia relacional y soporte de microservicios | Aprobado | — |
| **[ADR-013](#adr-013-simplificación-pragmática-del-modelo-de-datos-der-y-alineación-con-la-operativa-real-de-cts)** | 2026-11-02 | Simplificación pragmática del modelo de datos DER y alineación con la operativa real de CTS | Aprobado | — |

---

### ADR-001: Adopción de la metodología RUP estándar UNEATLANTICO
* **Fecha**: 2026-10-09
* **Contexto**: Se requiere planificar y documentar exhaustivamente la plataforma de evaluación técnica de aspirantes y formación de becarios de CTS antes de iniciar el desarrollo, evitando deuda técnica y refactorizaciones ciegas.
* **Decisión**: Adoptar la metodología RUP canónica basada en los repositorios de referencia (*DOCUTRACE*, *pySigHor*, *pyCelda*). Estructurar el proyecto en fases secuenciales: `00-modelo-del-dominio`, `01-requisitos`, `02-analisis`, `03-diseño` y `04-desarrollo`, utilizando PlantUML (`.puml`) y Markdown para una trazabilidad integral versionada en Git.
* **Artefactos afectados**: Estructura de carpetas `/RUP` y concentradores `README.md`.

---

### ADR-002: Diagramas conceptuales limpios sin atributos
* **Fecha**: 2026-10-09
* **Contexto**: El primer borrador del modelo de dominio incluía tipos de datos y atributos que saturaban visualmente el diagrama de clases conceptual.
* **Decisión**: Eliminar los atributos de las entidades en la Fase 00 (`hide empty members`, `hide circles`). El diagrama conceptual debe reflejar con máxima claridad exclusivamente los paquetes, las entidades y las relaciones estructurales entre ellas.
* **Artefactos afectados**: `RUP/00-modelo-del-dominio/modeloDominio.puml` y diagrama Mermaid en `README.md`.

---

### ADR-003: Adopción de nomenclatura institucional Programa PROFER
* **Fecha**: 2026-10-09
* **Contexto**: Alinear la terminología genérica con la realidad institucional de CTS y el programa de becas de formación y empleo.
* **Decisión**:
  * Sustituir `Becario` por **`AlumnoProfer`**.
  * Sustituir `TutorSenior` por **`TechLeader` (TL)**.
  * Sustituir `CoordinadorAdmin` por **`GestorProfer`**.
* **Artefactos afectados**: Todas las especificaciones de dominio y máquinas de estados.

---

### ADR-004: Embudo en 2 fases y asignación a los 6 equipos de CTS
* **Fecha**: 2026-10-09
* **Contexto**: El centro tecnológico se organiza de forma permanente en 6 equipos con diferentes responsabilidades y stacks tecnológicos. La admisión a la beca requiere un filtro en dos fases: prueba técnica y entrevista.
* **Decisión**:
  * **Filtro 1 (`PruebaTecnica`)**: Núcleo digital de la plataforma. Evalúa teoría y práctica generando un `PerfilAptitudes` diagnóstico.
  * **Filtro 2 (`Entrevista`)**: Conducida exclusivamente por el `GestorProfer`. El `TechLeader` no interviene en la entrevista; su rol en selección es evaluar ejercicios prácticos y consultar perfiles y repositorios.
  * Los candidatos aptos son asignados a **1 de los 6 Equipos** con un **Rol de equipo** específico.
* **Artefactos afectados**: `modeloDominio.puml`, `estados-entidades/candidatura-estados.puml`, `00-modelo-del-dominio/README.md`.

---

### ADR-005: Gobernanza institucional: convenio Programa PROFER – Universidad
* **Fecha**: 2026-10-09
* **Contexto**: Esclarecer la relación jurídica e institucional entre la Universidad y el Centro Tecnológico.
* **Decisión**: Incorporar las entidades `ProgramaProfer` y `GerenciaUniversidad`. La Universidad no convoca becas directamente; el `ProgramaProfer` mantiene convenio con la Universidad (supervisado por su Gerencia), gestiona y opera el `CentroTecnologico` y abre las `ConvocatoriaProfer`.
* **Artefactos afectados**: `modeloDominio.puml`, `00-modelo-del-dominio/README.md`.

---

### ADR-006: Descomposición arquitectónica en 3 microservicios
* **Fecha**: 2026-10-13
* **Contexto**: El alcance del sistema abarca tres dominios claramente diferenciados: estructura organizativa, exámenes y plataforma LMS de capacitación. Mantener un monolito generaría acoplamiento excesivo.
* **Decisión**:
  * Descomponer el sistema en **3 microservicios/subsistemas independientes**:
    1. **`MotorEquipos`**: Gobierna `Programa`, `Equipo`, `Alumno`, `LiderEquipo` y `Gestor`.
    2. **`MotorEvaluacion`**: Gobierna `Convocatoria`, `Candidato`, `Test` y `Resultado`.
    3. **`MotorFormacion`**: Gobierna `Capacitacion`, `Modulo`, `Material`, `Entregable`, `Pregunta`, `Teorica` y `Practica`.
  * **Regla de negocio sobre capacitación**: No existe relación `Equipo --> Capacitacion`; la capacitación es una acción del alumno dentro del equipo (`Alumno --> Capacitacion : realiza`).
  * **Responsabilidad del Tech Leader**: `LiderEquipo --> Capacitacion : evalua`, comprendiendo por herencia y jerarquía la configuración de módulos, la revisión de entregables de código y la calificación de tests de fin de módulo de los alumnos de su equipo.
  * **Test transversal**: El `Test` de `MotorEvaluacion` es agnóstico y es ejecutado tanto por el `Candidato` (admisión) como por el `Alumno` (nivelación o cierre de módulo formativo).
  * La composición de `Test` a partir de `Pregunta` se realiza mediante API REST inter-servicios (`Test ... Pregunta`).
* **Artefactos afectados**: `RUP/00-modelo-del-dominio/modeloDominio.puml`, `RUP/00-modelo-del-dominio/README.md`, `RUP/README.md`.

---

### ADR-007: Admisión continua por ciclos académicos, batería de 3 tests e inclusión de entrevista
* **Fecha**: 2026-10-14
* **Contexto**: El proceso de selección real de los Alumnos PROFER no sigue un calendario rígido con convocatorias que expiran ni aplica una nota de corte eliminatoria sobre un único examen técnico. La captación de talento está abierta todo el año y se estructura para alimentar a los 6 equipos de CTS de forma continua.
* **Decisión**:
  * **Temporalidad y Postulación Continua**: Incorporar las entidades `CursoAcademico` y `Semestre`. La postulación no se cierra (365 días al año); las candidaturas se canalizan y agrupan según el `(CursoAcademico, Semestre)` activo para los cortes de asignación.
  * **Especialización de Tests como Indicadores**: Especializar `Test` en `Actitud` (competencias blandas y compromiso), `Aptitud` (lógica y resolución) y `Tecnico` (habilidades prácticas nutriéndose de reactivos de los módulos de los 6 equipos: `Test ... Pregunta`). Los tests no eliminan por nota de corte, sino que consolidan un perfil de indicadores y afinidades competenciales.
  * **Formalización de `Entrevista`**: Incorporar la entidad `Entrevista` en `MotorEvaluacion`.
  * **Reglas de Acceso a Entrevista**:
    * *Por derecho*: Todo candidato que completa la batería de 3 tests adquiere el derecho a agendar su entrevista personal.
    * *Por excepción*: El `Gestor` puede autorizar manualmente la agenda a un candidato con algún test pendiente o incompleto.
  * **Dictamen Final**: La entrevista personal con el `GestorProfer` es el hito resolutorio donde se decide la admisión definitiva y la asignación a uno de los 6 equipos con su rol de equipo.
* **Artefactos afectados**: `RUP/00-modelo-del-dominio/modeloDominio.puml`, `estados-entidades/candidatura-estados.puml`, `estados-entidades/test-estados.puml`, `estados-entidades/convocatoria-estados.puml`, `RUP/00-modelo-del-dominio/README.md`.

---

### ADR-008: Canalización de candidatos por sedes internacionales y eliminación de UsuarioNoLogueado
* **Fecha**: 2026-10-14
* **Contexto**: Se había asumido inicialmente que la plataforma contaba con un portal público de auto-registro donde cualquier persona anónima postulaba desde internet. La realidad operativa es que las sedes de la universidad/fundación en cada país son las encargadas de recepcionar, cribar y recopilar las solicitudes de los alumnos interesados, remitiéndolas por lotes al Gestor del programa.
* **Decisión**:
  * **Eliminación del Actor `UsuarioNoLogueado`**: El sistema no expone casos de uso para usuarios anónimos ni registro libre en la web.
  * **Ingreso Controlado por el Gestor**: El `GestorProfer` da de alta o importa a los candidatos remitidos por las sedes de cada país (`registrarCandidato()`), lo que genera sus credenciales/enlace de acceso.
  * **Los 4 Actores Autenticados**: El alcance de actores del sistema queda estrictamente delimitado a 4 perfiles autenticados: `Candidato`, `Alumno`, `LiderEquipo` y `Gestor`.
* **Artefactos afectados**: `estados-entidades/candidatura-estados.puml`, `estados-entidades/convocatoria-estados.puml`, `RUP/00-modelo-del-dominio/README.md`, catálogo de actores en `RUP/01-requisitos/01-actores-casos-uso/`.

---

### ADR-009: Delimitación de actores: opacidad de tests para el Candidato, entrevistas Google Meet en el Perfil por el Gestor y aislamiento del TL
* **Fecha**: 2026-10-14
* **Contexto**: Durante la revisión de los casos de uso y diagramas de contexto de la Fase 01, se detectaron desajustes respecto a la operativa real de selección:
  1. El `Candidato` tenía casos de uso para consultar informes de resultados y auto-agendar entrevistas, cuando los resultados son estrictamente confidenciales para el Gestor y la convocatoria a entrevistas es iniciativa unilateral del evaluador.
  2. En el `Gestor`, la realización de entrevistas y la concesión de dispensas figuraban como procesos desarticulados, cuando operativamente el Gestor revisa el expediente en el perfil del candidato, agenda una reunión virtual en Google Meet y registra allí sus notas y dictamen.
  3. El `LiderEquipo` (TL) tenía casos de uso de búsqueda de candidatos, desdibujando su responsabilidad técnica centrada en su propio equipo.
* **Decisión**:
  * **Candidato Estrictamente Evaluado**: El aspirante solo ejecuta los 3 tests (`iniciarTest()`, `responderPreguntaTeorica()`, `entregarPreguntaPractica()`, `finalizarTest()`). No tiene acceso a métricas ni a gestión de citas.
  * **Perfil Unificado del Candidato en el Gestor**: El `GestorProfer` visualiza directamente los indicadores en el perfil del aspirante (`abrirPerfilCandidato()`), agenda la sesión virtual (`agendarEntrevistaGoogleMeet()`), registra anotaciones cualitativas (`registrarAnotacionesEntrevista()`) y dictamina la resolución (`admitirAlumnoProfer()`, `rechazarCandidatura()`).
  * **Aislamiento del Líder de Equipo**: El TL queda enfocado exclusivamente en los alumnos de su equipo, sus módulos y sus entregables de código.
* **Artefactos afectados**: `RUP/00-modelo-del-dominio/modeloDominio.puml`, `estados-entidades/candidatura-estados.puml`, `RUP/00-modelo-del-dominio/README.md`, catálogo de casos de uso y diagramas de contexto en `RUP/01-requisitos/01-actores-casos-uso/` (`actoresCasosUsoCandidato.puml`, `diagramaContextoCandidato.puml`, `actoresCasosUsoGestor.puml`, `diagramaContextoGestor.puml`, `actoresCasosUsoLiderEquipo.puml`, `diagramaContextoLiderEquipo.puml`, `README.md`).

---

### ADR-010: Refinamiento estructural del dominio top-to-bottom, transición Candidato-Alumno y rediseño pedagógico de materiales
* **Fecha**: 2026-10-22
* **Contexto**: Para optimizar la legibilidad del modelo conceptual y alinear con mayor fidelidad la pedagogía de los módulos y el ciclo de vida del estudiante:
  1. La orientación horizontal saturaba la comprensión visual de los tres paquetes de microservicios.
  2. Faltaba modelar explícitamente en el diagrama conceptual la transición entre el rol evaluado (`Candidato`) y el rol becario (`Alumno`).
  3. En `MotorFormacion`, los materiales didácticos son el activo central de la capacitación que luego se organiza en módulos y genera el banco de preguntas.
  4. Los alumnos están vinculados al equipo por agregación (posibilitando transferencias de squad sin romper el expediente formativo).
* **Decisión**:
  * **Orientación Vertical Top-to-Bottom**: Retirar `left to right direction` para estructurar la lectura vertical canónica de los 3 subsistemas.
  * **Transición Explícita de Rol**: Incorporar `Candidato -- Alumno : > Cuando se acepta`, formalizando la resolución favorable del proceso de admisión.
  * **Rediseño de `MotorFormacion`**: Modelar `Capacitacion o-- Material`, `Modulo <-r- Material : se agrupa en`, `Modulo o-- Entregable` y `Material --> Pregunta : genera`.
  * **Agregación de Equipos y Composición de Entrevistas**: Modelar `Equipo o-- Alumno` y `Candidato *-- Entrevista`.
* **Artefactos afectados**: `RUP/00-modelo-del-dominio/modeloDominio.puml`, `images/RUP/00-modelo-del-dominio/modeloDominio.svg`, `RUP/00-modelo-del-dominio/README.md`.

---

### ADR-011: Patrón canónico de acceso: UsuarioNoLogueado para iniciarSesion(), exclusividad de cerrarSesion() en roles y <<extend>> condicional
* **Fecha**: 2026-10-23
* **Contexto**: Siguiendo el estándar riguroso de modelado de casos de uso RUP (referencias oficiales UNEATLANTICO / issues #48-#51):
  1. En versiones previas se había conectado directamente a los roles autenticados (`Candidato`, `Alumno`, `LiderEquipo`, `Gestor`) con `iniciarSesion()`.
  2. Esto generaba un error conceptual sistemático: el rol específico no existe en el sistema antes de validar sus credenciales.
  3. Quien está en `SESION_CERRADA` es formalmente un `UsuarioNoLogueado`.
  4. Los roles autenticados específicos solo existen tras la autenticación exitosa, por lo que son ellos quienes invocan `cerrarSesion()`, pero nunca `iniciarSesion()`.
  5. La entrada a la operativa de cada rol se produce mediante la extensión condicional de su caso de uso de apertura de panel sobre `iniciarSesion()`.
* **Decisión**:
  * **Asignación de `iniciarSesion()` a `UsuarioNoLogueado`**: El actor no autenticado es el único conectado a `iniciarSesion()`.
  * **Exclusividad de `cerrarSesion()` en Roles Autenticados**: `Candidato`, `Alumno`, `LiderEquipo` y `Gestor` están vinculados a `cerrarSesion()`.
  * **Extensión Condicional (`<<extend>>`)**:
    * `abrirPanelPostulacion ..> iniciarSesion : <<extend>>\n(condición: rol == Candidato)\n(punto: tras validación exitosa)`
    * `abrirPanelAlumno ..> iniciarSesion : <<extend>>\n(condición: rol == Alumno)\n(punto: tras validación exitosa)`
    * `abrirPanelLider ..> iniciarSesion : <<extend>>\n(condición: rol == LiderEquipo)\n(punto: tras validación exitosa)`
    * `abrirPanelAdmisiones ..> iniciarSesion : <<extend>>\n(condición: rol == Gestor)\n(punto: tras validación exitosa)`
  * **Doble Función de los Paneles**: Los casos de uso `abrirPanel<X>()` modelan tanto la entrada extendida desde el login como el retorno al panel principal desde las distintas áreas operativas de cada actor.
* **Artefactos afectados**: `actoresCasosUsoCandidato.puml`, `actoresCasosUsoAlumno.puml`, `actoresCasosUsoLiderEquipo.puml`, `actoresCasosUsoGestor.puml`, `iniciarSesion/especificacion.puml`, `iniciarSesion/README.md`, `RUP/01-requisitos/01-actores-casos-uso/README.md` y diagramas SVG compilados.

---

### ADR-012: Elección de PostgreSQL 16 para persistencia relacional y soporte de microservicios
* **Fecha**: 2026-10-29
* **Contexto**: Se evaluó la disyuntiva entre adoptar MySQL 8 / MariaDB 11.4 (motor predominante en proyectos del equipo como MLS Journals v2 o Nutrix) o PostgreSQL 16 para el soporte de persistencia de CTS Academy & Evaluator.
* **Decisión**:
  * **Adopción de PostgreSQL 16**: Se ratifica PostgreSQL 16 como el motor relacional corporativo para la plataforma, fundamentado en:
    1. **Esquemas Lógicos Nativos**: Permite alojar los tres microservicios (`motor_equipos`, `motor_evaluacion`, `motor_formacion`) en una única base de datos física mediante esquemas aislados con control de acceso por roles, evitando la sobrecarga de 3 instancias físicas de BD o la dispersión de prefijos en tablas.
    2. **Tipo Nativo `UUID v4`**: Asignación de identificadores de 16 bytes compactos para claves primarias en toda la plataforma sin penalizaciones de almacenamiento ni funciones de conversión forzada.
    3. **Capacidades Avanzadas de `JSONB` e Índices GIN**: Requeridas para almacenar y consultar de forma ultra-rápida las rúbricas dinámicas de calificación, los resultados de ejecución emitidos por el runner de Docker y los payloads de evaluación práctica.
    4. **Tipos Especializados de Auditoría**: Empleo del tipo `INET` para control de concurrencia e IPs de aspirantes, y `TIMESTAMPTZ` con soporte estricto de UTC para el sincronismo del temporizador de exámenes.
* **Artefactos afectados**: `RUP/03-diseño/modelo-datos/`, diagramas DER (`derGeneral.puml`, `derMotorEquipos.puml`, `derMotorEvaluacion.puml`, `derMotorFormacion.puml`) y `RUP/03-diseño/README.md`.

---

### ADR-013: Simplificación pragmática del modelo de datos DER y alineación con la operativa real de CTS
* **Fecha**: 2026-11-02
* **Contexto**: Tras una auditoría exhaustiva del primer borrador de la Fase 03 (Diseño de Datos), se detectaron elementos heredados de supuestos iniciales o sobre-ingeniería que no reflejaban la realidad operativa del Centro Tecnológico de Desarrollo (CTS) ni del Programa PROFER:
  1. Existía una tabla `programas_profer` a pesar de que PROFER es el único programa activo del sistema.
  2. Se modelaban cupos y cuotas rígidas (`cupo_maximo`, `cupos_equipo_convocatoria`) cuando la asignación real a los 6 squads es flexible y dinámica según demandas de proyectos (desde 1 hasta 12 becarios por equipo).
  3. Se exigía `titulacion_universitaria` en los candidatos, cuando en realidad son estudiantes que postulan para cursar el grado universitario.
  4. Se persistía una nota escalar numérica (`nota_final_bateria`), contradiciendo el acuerdo de [ADR-007](/RUP/BITACORA.md#adr-007-admisi%C3%B3n-continua-por-ciclos-acad%C3%A9micos-bater%C3%ADa-de-3-tests-e-inclusi%C3%B3n-de-entrevista) donde la batería de 3 tests consolida un gráfico de radar de competencias multidimensional.
  5. Se habían introducido tablas para comentarios línea por línea de revisiones de código (`comentarios_revision`, `revisiones_codigo`), cuando los becarios y Tech Leaders operan nativamente sobre Pull Requests reales de GitHub/GitLab.
  6. Se mantenían tablas de perfil 1:1 artificiales para Gestores (`gestores_profer`) y Tech Leaders (`lideres_equipo`) que no aportaban atributos de negocio reales y forzaban JOINs redundantes.
* **Decisión**:
  * **Eliminación de `programas_profer`**: `equipos` pasa a ser entidad raíz de primer nivel en `motor_equipos`.
  * **Eliminación de Tablas de Perfil Redundantes (RBAC Puro)**: Se suprimen `gestores_profer` y `lideres_equipo`. El Gestor se gestiona mediante autorización basada en roles (`usuarios.rol = 'GESTOR'`), y la titularidad de los squads técnicos se modela directamente mediante `equipos.lider_usuario_id -> usuarios.id`. El total de tablas del modelo de persistencia se consolida limpiamente en **23 tablas**.
  * **Flexibilidad de Asignación a Squads**: Se eliminan `cupos_equipo_convocatoria` y los bloqueos restrictivos de cupo.
  * **Eliminación de Titulación Previa**: Retirar el campo de titulación universitaria de `candidatos`.
  * **Radar de Competencias JSONB**: Sustituir la nota escalar por `perfil_competencias: jsonb` en `candidatos`, almacenando los puntajes por dimensión que alimentan el gráfico de radar en el panel del Gestor.
  * **Delegación de Code Review a GitHub**: Eliminar `revisiones_codigo` y `comentarios_revision`. En `entregas_laboratorio` se mantiene la URL del PR, commit hash, estado, feedback general cualitativo y resultado del sandbox CI.
  * **Ratificación de Markdown para Materiales**: Se mantiene `contenido_markdown: text` en `materiales` para guías técnicas vivas y renderizado interactivo sin inyección de HTML.
* **Artefactos afectados**: `RUP/03-diseño/modelo-datos/derGeneral.puml`, `derMotorEquipos.puml`, `derMotorEvaluacion.puml`, `derMotorFormacion.puml`, `RUP/03-diseño/modelo-datos/README.md` y diagramas vectoriales compilados.

---

### ADR-014: Stack tecnológico de desarrollo (Monorepo pnpm + NestJS + Prisma + React/Vite + Docker)
* **Fecha**: 2026-11-02
* **Contexto**: Para iniciar la Fase 04 (Desarrollo), se evaluaron las alternativas de framework de backend (NestJS con TypeScript vs Laravel 11 con PHP) y la organización del código fuente. Se requiere type-safety extremo entre cliente y servidor, gestión eficiente de cronómetros/WebSockets en tiempo real, integración nativa con Docker Engine API para el runner de sandbox y máxima productividad en la gestión de monorepositorio.
* **Decisión**:
  * **Estructura Monorepo con `pnpm` workspaces y Turborepo**: Unificar en un único repositorio el backend (`apps/backend`), frontend (`apps/frontend`), runner de sandboxes (`apps/runner-daemon`) y paquetes compartidos (`packages/shared-types`).
  * **Backend**: Adopción de **NestJS 10 (Node.js 20 LTS)** con TypeScript estricto, estructurado según la arquitectura modular diseñada (bounded contexts: `MotorEquipos`, `MotorEvaluacion`, `MotorFormacion`).
  * **Persistencia y ORM**: **Prisma ORM** con soporte nativo de `multiSchema` para los 3 esquemas relacionales sobre **PostgreSQL 16** ([ADR-012](/RUP/BITACORA.md#adr-012-elecci%C3%B3n-de-postgresql-16-para-persistencia-relacional-y-soporte-de-microservicios)), migraciones declarativas y Prisma Studio.
  * **Seguridad y Caching**: **Redis 7** para rate-limiting distribuido (`@nestjs/throttler`), revocación de tokens JWT mediante lista negra deslizante (sliding blacklist) y procesamiento de colas con **BullMQ**.
  * **Frontend**: **React 18 + Vite + TypeScript**, Tailwind CSS, **Recharts** para el renderizado del radar de competencias JSONB ([ADR-013](/RUP/BITACORA.md#adr-013-simplificaci%C3%B3n-pragm%C3%A1tica-del-modelo-de-datos-der-y-alineaci%C3%B3n-con-la-operativa-real-de-cts)), Monaco Editor para retos prácticos y `react-markdown` para guías técnicas.
  * **Sandbox Runner**: Contenedores efímeros aislados confinados mediante Docker Engine API (`dockerode`, `network_mode: none`, 256MB RAM, timeout 10s).
* **Artefactos afectados**: `RUP/BITACORA.md`, `RUP/04-desarrollo/README.md`, configuración raíz del repositorio (`pnpm-workspace.yaml`, `package.json`, `turbo.json`).






