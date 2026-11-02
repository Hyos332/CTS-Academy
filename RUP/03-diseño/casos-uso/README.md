<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [Bitácora ADR](/RUP/BITACORA.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | **03 Diseño** | [04 Desarrollo](/RUP/04-desarrollo/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

<sub>**Fase 03: Diseño** › **Catálogo de Realizaciones de Casos de Uso (OpenAPI & Secuencia)**</sub>

</div>

# Catálogo de Realizaciones de Diseño de Casos de Uso

Este directorio centraliza las realizaciones técnicas de diseño para los **35 casos de uso** de **CTS Academy & Evaluator**. Cada especificación define el contrato de interfaz canónico (**OpenAPI 3.1 / REST**), los esquemas de transferencia de datos (**DTOs** con validaciones `class-validator`), la arquitectura de componentes (**NestJS Controllers, Services, Guards y Repositorios**) y el diagrama formal de **Secuencia de Diseño UML**.

---

## Estructura por Paquetes Arquitectónicos

```text
03-diseño/casos-uso/
├── PK01 - Acceso (2 CUs)               ──► Completado (2/2)
│   ├── iniciarSesion/                  ──► POST /api/v1/auth/login
│   └── cerrarSesion/                   ──► POST /api/v1/auth/logout
├── PK02 - MotorEvaluacion (12 CUs)     ──► Completado (12/12)
│   ├── abrirPanelPostulacion/          ──► GET  /api/v1/evaluacion/candidatos/me/dashboard
│   ├── iniciarTest/                    ──► POST /api/v1/evaluacion/tests/:id/iniciar
│   ├── responderPreguntaTeorica/       ──► POST /api/v1/evaluacion/tests/:id/respuestas/teorica
│   ├── entregarPreguntaPractica/       ──► POST /api/v1/evaluacion/tests/:id/respuestas/practica
│   ├── finalizarTest/                  ──► POST /api/v1/evaluacion/tests/:id/finalizar
│   ├── abrirPerfilCandidato/           ──► GET  /api/v1/evaluacion/gestor/candidatos/:id
│   ├── agendarEntrevistaGoogleMeet/    ──► POST /api/v1/evaluacion/candidatos/:id/entrevista
│   ├── registrarAnotacionesEntrevista/ ──► POST /api/v1/evaluacion/entrevistas/:id/anotaciones
│   ├── admitirAlumnoProfer/            ──► POST /api/v1/evaluacion/candidatos/:id/admitir
│   ├── rechazarCandidatura/            ──► POST /api/v1/evaluacion/candidatos/:id/rechazar
│   ├── registrarCandidato/             ──► POST /api/v1/evaluacion/candidatos
│   └── importarCandidatosSede/         ──► POST /api/v1/evaluacion/candidatos/importar-sede
├── PK03 - MotorFormacion (17 CUs)      ──► Completado (17/17)
│   ├── abrirPanelAlumno/               ──► GET    /api/v1/formacion/alumnos/me/dashboard
│   ├── consultarCapacitacion/          ──► GET    /api/v1/formacion/capacitaciones/:id
│   ├── consultarModulo/                ──► GET    /api/v1/formacion/modulos/:id
│   ├── consultarMaterial/              ──► GET    /api/v1/formacion/materiales/:id
│   ├── enviarEntregable/               ──► POST   /api/v1/formacion/laboratorios/:id/entregas
│   ├── consultarFeedbackEntregable/    ──► GET    /api/v1/formacion/entregas/:id/feedback
│   ├── abrirEntregablesPendientes/     ──► GET    /api/v1/formacion/tech-lead/entregables-pendientes
│   ├── revisarEntregable/              ──► GET    /api/v1/formacion/tech-lead/entregas/:id
│   ├── aprobarEntregable/              ──► POST   /api/v1/formacion/tech-lead/entregas/:id/aprobar
│   ├── solicitarCambiosEntregable/     ──► POST   /api/v1/formacion/tech-lead/entregas/:id/solicitar-cambios
│   ├── evaluarCapacitacionAlumno/      ──► POST   /api/v1/formacion/tech-lead/alumnos/:id/evaluacion-sumativa
│   ├── crearMaterial/                  ──► POST   /api/v1/formacion/modulos/:id/materiales
│   ├── editarMaterial/                 ──► PUT    /api/v1/formacion/materiales/:id
│   ├── eliminarMaterial/               ──► DELETE /api/v1/formacion/materiales/:id
│   ├── crearPregunta/                  ──► POST   /api/v1/formacion/modulos/:id/preguntas
│   ├── editarPregunta/                 ──► PUT    /api/v1/formacion/preguntas/:id
│   └── eliminarPregunta/               ──► DELETE /api/v1/formacion/preguntas/:id
└── PK04 - MotorEquipos (4 CUs)         ──► Completado (4/4)
    ├── abrirPanelLider/                ──► GET  /api/v1/equipos/tech-lead/dashboard
    ├── abrirPanelAdmisiones/           ──► GET  /api/v1/equipos/gestor/dashboard
    ├── abrirPeriodoIngreso/            ──► POST /api/v1/equipos/convocatorias
    └── cerrarCorteSemestral/           ──► POST /api/v1/equipos/cortes/cerrar
```

---

## PK01 — Acceso (2 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST | Controlador / Guard | Persistencia & Cache | Realización de Diseño | Estado |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **`iniciarSesion()`** | `POST /api/v1/auth/login` | `AuthController`<br>`ThrottlerGuard` | `motor_equipos.usuarios`<br>`motor_equipos.sesiones`<br>Redis (Rate Limit) | [Ver Diseño](iniciarSesion/README.md) | **Completado** |
| **`cerrarSesion()`** | `POST /api/v1/auth/logout`<br>`GET /active-evaluations` | `AuthController`<br>`JwtAuthGuard` | `motor_equipos.sesiones`<br>Redis (Token Blacklist) | [Ver Diseño](cerrarSesion/README.md) | **Completado** |

</div>

---

## PK02 — MotorEvaluacion (12 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST | Módulo Responsable | Realización de Diseño | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **`abrirPanelPostulacion()`** | `GET /api/v1/evaluacion/candidatos/me/dashboard` | `CandidatosController` | [Ver Diseño](abrirPanelPostulacion/README.md) | **Completado** |
| **`iniciarTest()`** | `POST /api/v1/evaluacion/tests/:id/iniciar` | `TestsController` | [Ver Diseño](iniciarTest/README.md) | **Completado** |
| **`responderPreguntaTeorica()`** | `POST /api/v1/evaluacion/tests/:id/respuestas/teorica` | `TestsController` | [Ver Diseño](responderPreguntaTeorica/README.md) | **Completado** |
| **`entregarPreguntaPractica()`** | `POST /api/v1/evaluacion/tests/:id/respuestas/practica` | `TestsController` / Sandbox | [Ver Diseño](entregarPreguntaPractica/README.md) | **Completado** |
| **`finalizarTest()`** | `POST /api/v1/evaluacion/tests/:id/finalizar` | `TestsController` / Radar | [Ver Diseño](finalizarTest/README.md) | **Completado** |
| **`abrirPerfilCandidato()`** | `GET /api/v1/evaluacion/gestor/candidatos/:id` | `AdmisionesController` | [Ver Diseño](abrirPerfilCandidato/README.md) | **Completado** |
| **`agendarEntrevistaGoogleMeet()`** | `POST /api/v1/evaluacion/candidatos/:id/entrevista` | `EntrevistasController` / Meet | [Ver Diseño](agendarEntrevistaGoogleMeet/README.md) | **Completado** |
| **`registrarAnotacionesEntrevista()`** | `POST /api/v1/evaluacion/entrevistas/:id/anotaciones` | `EntrevistasController` | [Ver Diseño](registrarAnotacionesEntrevista/README.md) | **Completado** |
| **`admitirAlumnoProfer()`** | `POST /api/v1/evaluacion/candidatos/:id/admitir` | `AdmisionesController` | [Ver Diseño](admitirAlumnoProfer/README.md) | **Completado** |
| **`rechazarCandidatura()`** | `POST /api/v1/evaluacion/candidatos/:id/rechazar` | `AdmisionesController` | [Ver Diseño](rechazarCandidatura/README.md) | **Completado** |
| **`registrarCandidato()`** | `POST /api/v1/evaluacion/candidatos` | `AdmisionesController` | [Ver Diseño](registrarCandidato/README.md) | **Completado** |
| **`importarCandidatosSede()`** | `POST /api/v1/evaluacion/candidatos/importar-sede` | `AdmisionesController` / BullMQ | [Ver Diseño](importarCandidatosSede/README.md) | **Completado** |

</div>

---

## PK03 — MotorFormacion (17 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST | Módulo Responsable | Realización de Diseño | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **`abrirPanelAlumno()`** | `GET /api/v1/formacion/alumnos/me/dashboard` | `FormacionController` | [Ver Diseño](abrirPanelAlumno/README.md) | **Completado** |
| **`consultarCapacitacion()`** | `GET /api/v1/formacion/capacitaciones/:id` | `CapacitacionesController` | [Ver Diseño](consultarCapacitacion/README.md) | **Completado** |
| **`consultarModulo()`** | `GET /api/v1/formacion/modulos/:id` | `ModulosController` | [Ver Diseño](consultarModulo/README.md) | **Completado** |
| **`consultarMaterial()`** | `GET /api/v1/formacion/materiales/:id` | `MaterialesController` | [Ver Diseño](consultarMaterial/README.md) | **Completado** |
| **`enviarEntregable()`** | `POST /api/v1/formacion/laboratorios/:id/entregas` | `EntregablesController` | [Ver Diseño](enviarEntregable/README.md) | **Completado** |
| **`consultarFeedbackEntregable()`** | `GET /api/v1/formacion/entregas/:id/feedback` | `EntregablesController` | [Ver Diseño](consultarFeedbackEntregable/README.md) | **Completado** |
| **`abrirEntregablesPendientes()`** | `GET /api/v1/formacion/tech-lead/entregables-pendientes` | `TechLeaderController` | [Ver Diseño](abrirEntregablesPendientes/README.md) | **Completado** |
| **`revisarEntregable()`** | `GET /api/v1/formacion/tech-lead/entregas/:id` | `TechLeaderController` | [Ver Diseño](revisarEntregable/README.md) | **Completado** |
| **`aprobarEntregable()`** | `POST /api/v1/formacion/tech-lead/entregas/:id/aprobar` | `TechLeaderController` | [Ver Diseño](aprobarEntregable/README.md) | **Completado** |
| **`solicitarCambiosEntregable()`** | `POST /api/v1/formacion/tech-lead/entregas/:id/solicitar-cambios` | `TechLeaderController` | [Ver Diseño](solicitarCambiosEntregable/README.md) | **Completado** |
| **`evaluarCapacitacionAlumno()`** | `POST /api/v1/formacion/tech-lead/alumnos/:id/evaluacion-sumativa` | `TechLeaderController` | [Ver Diseño](evaluarCapacitacionAlumno/README.md) | **Completado** |
| **`crearMaterial()`** | `POST /api/v1/formacion/modulos/:id/materiales` | `MaterialesController` | [Ver Diseño](crearMaterial/README.md) | **Completado** |
| **`editarMaterial()`** | `PUT /api/v1/formacion/materiales/:id` | `MaterialesController` | [Ver Diseño](editarMaterial/README.md) | **Completado** |
| **`eliminarMaterial()`** | `DELETE /api/v1/formacion/materiales/:id` | `MaterialesController` | [Ver Diseño](eliminarMaterial/README.md) | **Completado** |
| **`crearPregunta()`** | `POST /api/v1/formacion/modulos/:id/preguntas` | `BancoPreguntasController` | [Ver Diseño](crearPregunta/README.md) | **Completado** |
| **`editarPregunta()`** | `PUT /api/v1/formacion/preguntas/:id` | `BancoPreguntasController` | [Ver Diseño](editarPregunta/README.md) | **Completado** |
| **`eliminarPregunta()`** | `DELETE /api/v1/formacion/preguntas/:id` | `BancoPreguntasController` | [Ver Diseño](eliminarPregunta/README.md) | **Completado** |

</div>

---

## PK04 — MotorEquipos (4 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST | Módulo Responsable | Realización de Diseño | Estado |
| :--- | :--- | :--- | :---: | :---: |
| **`abrirPanelLider()`** | `GET /api/v1/equipos/tech-lead/dashboard` | `EquiposController` | [Ver Diseño](abrirPanelLider/README.md) | **Completado** |
| **`abrirPanelAdmisiones()`** | `GET /api/v1/equipos/gestor/dashboard` | `GobernanzaController` | [Ver Diseño](abrirPanelAdmisiones/README.md) | **Completado** |
| **`abrirPeriodoIngreso()`** | `POST /api/v1/equipos/convocatorias` | `GobernanzaController` | [Ver Diseño](abrirPeriodoIngreso/README.md) | **Completado** |
| **`cerrarCorteSemestral()`** | `POST /api/v1/equipos/cortes/cerrar` | `GobernanzaController` | [Ver Diseño](cerrarCorteSemestral/README.md) | **Completado** |

</div>

---

<div align="center">

[Fase 02: Análisis](/RUP/02-analisis/README.md) • [Fase 03: Diseño Hub](/RUP/03-diseño/README.md) • [Fase 04: Desarrollo](/RUP/04-desarrollo/README.md)

</div>
