<div align="center">

| [Inicio](/README.md) | **RUP Hub** | [Bitácora ADR](/RUP/BITACORA.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | [03 Diseño](/RUP/03-diseño/README.md) | [04 Desarrollo](/RUP/04-desarrollo/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

# RUP — CTS Academy & Evaluator

Página concentradora de artefactos de ingeniería de software bajo la metodología RUP (Rational Unified Process) para la plataforma **CTS Academy & Evaluator**.

Desde aquí se accede a cada una de las fases del ciclo de desarrollo, al registro de decisiones arquitectónicas y a la matriz de trazabilidad integral caso por caso.

---

## Artefactos Concentradores

<div align=center>

| Seguimiento y Decisiones | Modelo del Dominio | Requisitos | Análisis | Diseño |
| :---: | :---: | :---: | :---: | :---: |
| **[Bitácora RUP (ADR)](/RUP/BITACORA.md)** | [Modelo del Dominio](/RUP/00-modelo-del-dominio/README.md) | [Hub de Requisitos](/RUP/01-requisitos/README.md) | [Fase 02: Análisis](/RUP/02-analisis/README.md) | [Fase 03: Diseño](/RUP/03-diseño/README.md) |
| Historial de refinamientos | [Glosario de entidades](/RUP/00-modelo-del-dominio/README.md#glosario-de-entidades-por-microservicio) | [Actores y Contexto](/RUP/01-requisitos/01-actores-casos-uso/README.md) | Clases de análisis (BCE) | Diagrama Entidad-Relación (DER) |
| Registro de acuerdos RUP | [3 Microservicios](/RUP/00-modelo-del-dominio/README.md#microservicios-del-sistema) | [Detalle Casos de Uso (35)](/RUP/01-requisitos/03-detalle-casos-uso/README.md) | Colaboraciones de análisis | OpenAPI REST & Secuencias (35/35) |

</div>

---

## Fases del Proceso Unificado

<div align=center>

| Fase | Directorio / Enlace | Propósito y Contenido Principal |
| :--- | :--- | :--- |
| **00 - Dominio** | [Modelo del dominio](/RUP/00-modelo-del-dominio/README.md) | Vocabulario del negocio, modelo conceptual de entidades, estados del ciclo de vida y reglas invariantes. |
| **01 - Requisitos** | [Requisitos](/RUP/01-requisitos/README.md) | Catálogo de actores, diagramas de contexto, diagramas de casos de uso por paquete funcional, especificaciones formales con máquinas de estados y wireframes. |
| **02 - Análisis** | [Análisis](/RUP/02-analisis/README.md) | Clases de análisis (Frontera, Control, Entidad) y realizaciones de casos de uso independientes de la tecnología concreta. |
| **03 - Diseño** | [Diseño](/RUP/03-diseño/README.md) | Diagramas de secuencia de diseño, contratos de API REST/GraphQL, diseño relacional (DER), clases del stack tecnológico y despliegue físico con Docker. |
| **04 - Desarrollo** | [Desarrollo](/RUP/04-desarrollo/README.md) | Trazabilidad hacia el código fuente de backend y frontend, componentes y pruebas automatizadas. |

</div>

---

## Matriz de Cobertura por Subsistemas

La especificación detallada de los 35 casos de uso, sus diagramas de estados (Statecharts) y maquetas de interfaz (Salt) se encuentra centralizada por paquetes funcionales:

<div align=center>

| Paquete Funcional | Casos de Uso | Actores Involucrados | Acceso al Detalle |
| :--- | :---: | :--- | :---: |
| **PK01 — Acceso** | 2 | `Candidato`, `Alumno`, `LiderEquipo`, `Gestor` | [Ver Casos (2)](/RUP/01-requisitos/03-detalle-casos-uso/README.md#pk01--acceso-2-casos-de-uso) |
| **PK02 — MotorEvaluacion** | 12 | `Candidato`, `Alumno`, `Gestor` | [Ver Casos (12)](/RUP/01-requisitos/03-detalle-casos-uso/README.md#pk02--motorevaluacion-12-casos-de-uso) |
| **PK03 — MotorFormacion** | 17 | `Alumno`, `LiderEquipo` | [Ver Casos (17)](/RUP/01-requisitos/03-detalle-casos-uso/README.md#pk03--motorformacion-17-casos-de-uso) |
| **PK04 — MotorEquipos** | 4 | `LiderEquipo`, `Gestor` | [Ver Casos (4)](/RUP/01-requisitos/03-detalle-casos-uso/README.md#pk04--motorequipos-4-casos-de-uso) |
| **Total Sistema** | **35** | **4 Roles Autenticados** | **[Ver Catálogo Completo](/RUP/01-requisitos/03-detalle-casos-uso/README.md)** |

</div>
