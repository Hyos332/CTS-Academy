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
├── PK02 - MotorEvaluacion (12 CUs)     ──► En cola (0/12)
│   ├── abrirPanelPostulacion/
│   ├── iniciarTest/
│   ├── responderPreguntaTeorica/
│   ├── entregarPreguntaPractica/
│   ├── finalizarTest/
│   ├── abrirPerfilCandidato/
│   ├── agendarEntrevistaGoogleMeet/
│   ├── registrarAnotacionesEntrevista/
│   ├── admitirAlumnoProfer/
│   ├── rechazarCandidatura/
│   ├── registrarCandidato/
│   └── importarCandidatosSede/
├── PK03 - MotorFormacion (17 CUs)      ──► En cola (0/17)
│   ├── abrirPanelAlumno/
│   ├── consultarCapacitacion/
│   ├── consultarModulo/
│   ├── consultarMaterial/
│   ├── enviarEntregable/
│   ├── consultarFeedbackEntregable/
│   ├── abrirEntregablesPendientes/
│   ├── revisarEntregable/
│   ├── aprobarEntregable/
│   ├── solicitarCambiosEntregable/
│   ├── evaluarCapacitacionAlumno/
│   ├── crearMaterial/
│   ├── editarMaterial/
│   ├── eliminarMaterial/
│   ├── crearPregunta/
│   ├── editarPregunta/
│   └── eliminarPregunta/
└── PK04 - MotorEquipos (4 CUs)         ──► En cola (0/4)
    ├── abrirPanelLider/
    ├── abrirPanelAdmisiones/
    ├── abrirPeriodoIngreso/
    └── cerrarCorteSemestral/
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

| Caso de Uso | Método & Endpoint REST Previsto | Módulo Responsable | Estado |
| :--- | :--- | :--- | :---: |
| **`abrirPanelPostulacion()`** | `GET /api/v1/evaluacion/candidatos/me/dashboard` | `CandidatoController` | Pendiente |
| **`iniciarTest()`** | `POST /api/v1/evaluacion/tests/:id/iniciar` | `TestController` | Pendiente |
| **`responderPreguntaTeorica()`** | `POST /api/v1/evaluacion/tests/:id/respuestas/teorica` | `TestController` | Pendiente |
| **`entregarPreguntaPractica()`** | `POST /api/v1/evaluacion/tests/:id/respuestas/practica` | `TestController` / Sandbox Daemon | Pendiente |
| **`finalizarTest()`** | `POST /api/v1/evaluacion/tests/:id/finalizar` | `TestController` | Pendiente |
| **`abrirPerfilCandidato()`** | `GET /api/v1/evaluacion/gestor/candidatos/:id` | `AdmisionesController` | Pendiente |
| **`agendarEntrevistaGoogleMeet()`** | `POST /api/v1/evaluacion/entrevistas` | `EntrevistasController` / Google Calendar | Pendiente |
| **`registrarAnotacionesEntrevista()`** | `POST /api/v1/evaluacion/entrevistas/:id/anotaciones` | `EntrevistasController` | Pendiente |
| **`admitirAlumnoProfer()`** | `POST /api/v1/evaluacion/candidatos/:id/admitir` | `AdmisionesController` | Pendiente |
| **`rechazarCandidatura()`** | `POST /api/v1/evaluacion/candidatos/:id/rechazar` | `AdmisionesController` | Pendiente |
| **`registrarCandidato()`** | `POST /api/v1/evaluacion/candidatos` | `AdmisionesController` | Pendiente |
| **`importarCandidatosSede()`** | `POST /api/v1/evaluacion/candidatos/importar-sede` | `AdmisionesController` / BullMQ Queue | Pendiente |

</div>

---

## PK03 — MotorFormacion (17 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST Previsto | Módulo Responsable | Estado |
| :--- | :--- | :--- | :---: |
| **`abrirPanelAlumno()`** | `GET /api/v1/formacion/alumnos/me/dashboard` | `FormacionController` | Pendiente |
| **`consultarCapacitacion()`** | `GET /api/v1/formacion/capacitaciones/:id` | `CapacitacionesController` | Pendiente |
| **`consultarModulo()`** | `GET /api/v1/formacion/modulos/:id` | `ModulosController` | Pendiente |
| **`consultarMaterial()`** | `GET /api/v1/formacion/materiales/:id` | `MaterialesController` | Pendiente |
| **`enviarEntregable()`** | `POST /api/v1/formacion/laboratorios/:id/entregas` | `EntregablesController` | Pendiente |
| **`consultarFeedbackEntregable()`** | `GET /api/v1/formacion/entregas/:id/feedback` | `EntregablesController` | Pendiente |
| **`abrirEntregablesPendientes()`** | `GET /api/v1/formacion/tech-lead/entregables-pendientes` | `TechLeaderController` | Pendiente |
| **`revisarEntregable()`** | `GET /api/v1/formacion/tech-lead/entregas/:id` | `TechLeaderController` | Pendiente |
| **`aprobarEntregable()`** | `POST /api/v1/formacion/tech-lead/entregas/:id/aprobar` | `TechLeaderController` | Pendiente |
| **`solicitarCambiosEntregable()`** | `POST /api/v1/formacion/tech-lead/entregas/:id/solicitar-cambios` | `TechLeaderController` | Pendiente |
| **`evaluarCapacitacionAlumno()`** | `POST /api/v1/formacion/tech-lead/alumnos/:id/evaluacion-sumativa` | `TechLeaderController` | Pendiente |
| **`crearMaterial()`** | `POST /api/v1/formacion/modulos/:id/materiales` | `MaterialesController` | Pendiente |
| **`editarMaterial()`** | `PUT /api/v1/formacion/materiales/:id` | `MaterialesController` | Pendiente |
| **`eliminarMaterial()`** | `DELETE /api/v1/formacion/materiales/:id` | `MaterialesController` | Pendiente |
| **`crearPregunta()`** | `POST /api/v1/formacion/modulos/:id/preguntas` | `BancoPreguntasController` | Pendiente |
| **`editarPregunta()`** | `PUT /api/v1/formacion/preguntas/:id` | `BancoPreguntasController` | Pendiente |
| **`eliminarPregunta()`** | `DELETE /api/v1/formacion/preguntas/:id` | `BancoPreguntasController` | Pendiente |

</div>

---

## PK04 — MotorEquipos (4 Casos de Uso)

<div align=center>

| Caso de Uso | Método & Endpoint REST Previsto | Módulo Responsable | Estado |
| :--- | :--- | :--- | :---: |
| **`abrirPanelLider()`** | `GET /api/v1/equipos/tech-lead/dashboard` | `EquiposController` | Pendiente |
| **`abrirPanelAdmisiones()`** | `GET /api/v1/equipos/gestor/dashboard` | `GobernanzaController` | Pendiente |
| **`abrirPeriodoIngreso()`** | `POST /api/v1/equipos/convocatorias` | `GobernanzaController` | Pendiente |
| **`cerrarCorteSemestral()`** | `POST /api/v1/equipos/cortes/cerrar` | `GobernanzaController` | Pendiente |

</div>

---

<div align="center">

[Fase 02: Análisis](/RUP/02-analisis/README.md) • [Fase 03: Diseño Hub](/RUP/03-diseño/README.md) • [Fase 04: Desarrollo](/RUP/04-desarrollo/README.md)

</div>
