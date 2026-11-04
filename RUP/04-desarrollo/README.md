<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [Bitácora ADR](/RUP/BITACORA.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | [03 Diseño](/RUP/03-diseño/README.md) | **04 Desarrollo** |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

# Fase 04: Desarrollo — CTS Academy & Evaluator

Esta fase vincula el diseño arquitectónico de **CTS Academy & Evaluator** con la base de código real: backend modular en microservicios lógicos, frontend reactivo SPA, persistencia multi-esquema y trazabilidad rigurosa de los 35 Casos de Uso especificados en RUP.

---

## 1. Topología del Monorepositorio

El proyecto está organizado como un monorepositorio basado en **pnpm workspaces** y orquestación con **Turborepo** ([ADR-014](/RUP/BITACORA.md#adr-014-stack-tecnol%C3%B3gico-de-desarrollo-monorepo-pnpm--nestjs--prisma--reactvite--docker)):

```text
cts-academy/
├── apps/
│   ├── backend/                 # API NestJS 10 (TypeScript estricto, Prisma ORM, Swagger)
│   │   ├── prisma/              # schema.prisma con multiSchema nativo
│   │   └── src/modules/
│   │       ├── auth/            # PK01: Acceso, JWT, guards y sliding blacklist
│   │       ├── equipos/         # PK04: MotorEquipos (Squads, Tech Leaders, Alumnos)
│   │       ├── evaluacion/      # PK02: MotorEvaluacion (Admisiones, Batería 3 Tests, Meet)
│   │       └── formacion/       # PK03: MotorFormacion (LMS, Módulos, Markdown, Reactivos)
│   ├── frontend/                # SPA React 18 + Vite + Tailwind CSS + Lucide Icons
│   │   └── src/
│   │       ├── components/      # Modales de admisión, importación y cronómetros
│   │       └── pages/           # Vistas especializadas por rol y flujos RUP
│   └── runner-daemon/           # Ejecutor efímero Docker en sandbox aislado
├── packages/
│   └── shared-types/            # Contratos de tipos, enums y DTOs comunes TS
└── RUP/                         # Documentación viva y especificaciones formales RUP
```

---

## 2. Arquitectura de Persistencia Multi-Esquema (PostgreSQL 16)

Tal como se acordó en [ADR-012](/RUP/BITACORA.md#adr-012-elecci%C3%B3n-de-postgresql-16-para-persistencia-relacional-y-soporte-de-microservicios) y [ADR-013](/RUP/BITACORA.md#adr-013-simplificaci%C3%B3n-pragm%C3%A1tica-del-modelo-de-datos-der-y-alineaci%C3%B3n-con-la-operativa-real-de-cts), la persistencia está dividida en **3 esquemas lógicos nativos** con 23 tablas:

| Esquema PostgreSQL | Bounded Context | Entidades Principales | Responsabilidad de Negocio |
| :--- | :--- | :--- | :--- |
| **`motor_equipos`** | Gobernanza de Equipos | `usuarios`, `equipos`, `alumnos_profer`, `sesiones` | Control de usuarios, RBAC, liderazgo de los 6 Squads CTS y matrícula PROFER. Relación `alumnos_profer.equipo_id` es nullable para soporte de asignación diferida ([ADR-016](/RUP/BITACORA.md#adr-016-asignaci%C3%B3n-diferida-de-squad-recomendador-de-afinidad-t%C3%A9cnica-y-movilidad-inter-equipos)). |
| **`motor_evaluacion`** | Admisión y Batería | `convocatorias`, `candidatos`, `tests`, `sesiones_evaluacion`, `respuestas_evaluacion`, `entrevistas`, `anotaciones_entrevista`, `informes_corte` | Proceso continuo de admisiones 365 días, batería de 3 tests (16PF, aptitud 43 habilidades, test técnico), cronómetro Wall-Clock en servidor ([ADR-017](/RUP/BITACORA.md#adr-017-mec%C3%A1nica-de-ejecuci%C3%B3n-inmutable-con-cron%C3%B3metro-wall-clock-en-servidor-y-bloqueo-de-respuestas)) y agenda Meet. |
| **`motor_formacion`** | Formación On-Site | `capacitaciones`, `modulos`, `materiales`, `entregables`, `preguntas`, `opciones_pregunta`, `entregas_laboratorio`, `lecturas_material`, `evaluaciones_sumativas` | LMS interno, contenidos técnicos en Markdown, banco de reactivos para nivelación y revisiones de código de PRs. |

---

## 3. Matriz de Trazabilidad: Casos de Uso implementados vs Código Fuente

### PK01 — Acceso (Completado 2/2 - 100%)

| Caso de Uso | Controlador / Servicio Backend | Interfaz Frontend | Estado |
| :--- | :--- | :--- | :---: |
| `iniciarSesion()` | `auth.controller.ts -> login()` | `LoginPage.tsx` | Validado |
| `cerrarSesion()` | `auth.controller.ts -> logout()` | Navbar / AuthContext | Validado |

---

### PK02 — MotorEvaluacion (Completado 12/12 - 100%)

El subsistema de candidaturas y admisión técnica se encuentra implementado y verificado al 100%:

| Caso de Uso | Controlador / Servicio Backend | Componente / Vista Frontend | Decisiones Clave RUP |
| :--- | :--- | :--- | :--- |
| `abrirPanelPostulacion()` | `evaluacion.controller.ts -> getMiPostulacion()` | `PostulacionPanelPage.tsx` | Tarjetas de 3 tests con estado y acceso condicional. |
| `iniciarTest()` | `evaluacion.service.ts -> iniciarTest()` | `TestRunnerPage.tsx` | Cronómetro Wall-Clock server-side no pausatorio ([ADR-017](/RUP/BITACORA.md#adr-017-mec%C3%A1nica-de-ejecuci%C3%B3n-inmutable-con-cron%C3%B3metro-wall-clock-en-servidor-y-bloqueo-de-respuestas)). |
| `responderPreguntaTeorica()` | `evaluacion.service.ts -> responderPreguntaTeorica()` | `TestRunnerPage.tsx` | Bloqueo inmutable permanente tras responder; no permite alteración ([ADR-017](/RUP/BITACORA.md#adr-017-mec%C3%A1nica-de-ejecuci%C3%B3n-inmutable-con-cron%C3%B3metro-wall-clock-en-servidor-y-bloqueo-de-respuestas)). |
| `entregarPreguntaPractica()` | `evaluacion.service.ts -> entregarPreguntaPractica()` | `TestRunnerPage.tsx` | Monaco Editor con entrega de código estructurado. |
| `finalizarTest()` | `evaluacion.service.ts -> finalizarTest()` | `TestRunnerPage.tsx` | Consolidación espectral inmediata y cierre de sesión de examen. |
| `abrirPerfilCandidato()` | `evaluacion.service.ts -> getPerfilCandidatoDetallado()` | `CandidatoPerfilPage.tsx` | Informe cualitativo 16PF de Cattell, matriz de 43 aptitudes, gráfico radar y motor de recomendación de Squad ([ADR-015](/RUP/BITACORA.md#adr-015-baremaci%C3%B3n-cualitativa-espectral-16pf-y-matriz-de-43-competencias-sin-notas-de-corte), [ADR-016](/RUP/BITACORA.md#adr-016-asignaci%C3%B3n-diferida-de-squad-recomendador-de-afinidad-t%C3%A9cnica-y-movilidad-inter-equipos)). |
| `agendarEntrevistaGoogleMeet()` | `evaluacion.service.ts -> agendarEntrevista()` | `CandidatoPerfilPage.tsx` | Admite `fechaProgramada` / `fechaHoraProgramada` y link de Google Meet. |
| `registrarAnotacionesEntrevista()`| `evaluacion.service.ts -> registrarAnotaciones()` | `CandidatoPerfilPage.tsx` | Bitácora confidencial de competencias blandas observadas. |
| `admitirAlumnoProfer()` | `evaluacion.service.ts -> admitirAlumnoProfer()` | `CandidatoPerfilPage.tsx` | Promoción a `AlumnoProfer` con asignación inmediata o **diferida de Squad** ([ADR-016](/RUP/BITACORA.md#adr-016-asignaci%C3%B3n-diferida-de-squad-recomendador-de-afinidad-t%C3%A9cnica-y-movilidad-inter-equipos)). Modal de confirmación irreversible. |
| `rechazarCandidatura()` | `evaluacion.service.ts -> rechazarCandidato()` | `CandidatoPerfilPage.tsx` | Veredicto desfavorable formal con motivo registrado y advertencia modal. |
| `registrarCandidato()` | `evaluacion.service.ts -> registrarCandidato()` | `AdmisionesPanelPage.tsx` | Registro individual con despacho de credenciales. |
| `importarCandidatosSede()` | `evaluacion.service.ts -> importarCandidatosSede()` | `ImportarSedeModal.tsx` | Carga masiva por sede, análisis pre-commit no destructivo, deduplicación y credenciales ([ADR-018](/RUP/BITACORA.md#adr-018-ingesta-masiva-por-n%C3%B3mina-de-sede-universitaria-y-navegaci%C3%B3n-ejecutiva-por-sidebar)). |

---

### PK04 — MotorEquipos (Completado 4/4 - 100%)

| Caso de Uso | Controlador / Servicio Backend | Componente / Vista Frontend | Estado |
| :--- | :--- | :--- | :---: |
| `abrirPanelAdmisiones()` | `evaluacion.service.ts -> getResumenConvocatoria()` | `AdmisionesPanelPage.tsx` | Validado (Nuevo diseño Sidebar con 4 vistas) |
| `abrirPanelLider()` | `equipos.controller.ts -> getMiEquipo()` | `LiderPanelPage.tsx` | Validado |
| `abrirPeriodoIngreso()` | `evaluacion.controller.ts` | `AdmisionesPanelPage.tsx` | Validado |
| `cerrarCorteSemestral()` | `evaluacion.service.ts -> cerrarCorteSemestral()` | `AdmisionesPanelPage.tsx` | Validado (Acta oficial y hash criptográfico) |

---

## 4. Estado de los Servicios y Verificación en Ejecución

* **Backend NestJS**: Corriendo en `http://localhost:4000/api` (Swagger: `http://localhost:4000/api/docs`).
* **Frontend Vite**: Corriendo en `http://localhost:3000`.
* **Base de Datos**: PostgreSQL 16 en contenedor `cts-academy-postgres` con soporte de 3 esquemas independientes.
* **Compilación**: Monorepo verificado con `pnpm build` sin errores TypeScript en ninguno de los 3 paquetes.

---

<div align="center">

[Fase 03: Diseño](/RUP/03-diseño/README.md) • [Volver a Inicio](/README.md)

</div>
