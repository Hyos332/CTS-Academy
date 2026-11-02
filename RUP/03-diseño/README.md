<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [Bitácora ADR](/RUP/BITACORA.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | **03 Diseño** | [04 Desarrollo](/RUP/04-desarrollo/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

</div>

# Fase 03: Diseño — CTS Academy & Evaluator

Esta fase concreta las realizaciones de análisis en especificaciones técnicas de diseño: diagramas de secuencia, modelo relacional (PostgreSQL), contratos OpenAPI/REST y despliegue físico en contenedores Docker.

---

## Propósito del Modelo de Diseño

El modelo de diseño refina el análisis adaptándolo a la infraestructura, plataformas y limitaciones técnicas reales de **CTS Academy & Evaluator**. 

En esta fase se formalizan:
1. **Diseño de Datos (DER Relacional)**: Esquema de base de datos relacional (PostgreSQL), definición de tablas, llaves foráneas, índices de rendimiento y políticas de inmutabilidad (auditoría append-only y soft-delete).
2. **Diagramas de Secuencia de Diseño**: Interacciones temporales detalladas entre controladores, servicios de aplicación, repositorios, cache Redis y servicios externos (Google Calendar API, GitHub webhooks, runners Docker).
3. **Contratos de Interfaces de API (OpenAPI / REST)**: Definición formal de endpoints HTTP, payloads JSON, códigos de estado canónicos y encabezados de autenticación JWT.
4. **Arquitectura de Despliegue**: Especificación de contenedores Docker, redes internas, volúmenes de persistencia y balanceo de carga.

---

## Catálogo de Artefactos de Diseño

<div align=center>

| Artefacto de Diseño | Alcance / Componentes | Especificación Técnica | Estado |
| :--- | :--- | :---: | :---: |
| **Modelo de Datos Relacional (DER)** | 25 tablas, 3 esquemas PostgreSQL (`equipos`, `evaluacion`, `formacion`), UUID v4, radar JSONB, auditoría e índices | [Ver DER y Diccionario](modelo-datos/README.md) | Completado |
| **Arquitectura de Despliegue Físico** | Topología Docker Compose multi-stage, 4 redes aisladas, PostgreSQL 16, Redis 7 y sandbox CI | [Ver Despliegue](despliegue/README.md) | Completado |
| **Contratos de Interfaces OpenAPI / REST** | Especificación formal de endpoints HTTP, payloads JSON, DTOs y cabeceras JWT | [Ver Contratos API](casos-uso/README.md) | Siguiente |
| **Diagramas de Secuencia de Diseño** | Interacción detallada controladores NestJS/Express, repositorios Prisma y APIs externas | [Ver Secuencias](casos-uso/README.md) | En cola |

</div>

---

## Estado de la Fase

> [!NOTE]
> **Infraestructura Base de Diseño Formalizada**:
> 1. **Modelo de Datos Relacional (DER)**: 25 tablas en PostgreSQL 16 con esquemas lógicos nativos ([ADR-012](/RUP/BITACORA.md#adr-012-elecci%C3%B3n-de-postgresql-16-para-persistencia-relacional-y-soporte-de-microservicios)), adaptado a la operativa real de CTS ([ADR-013](/RUP/BITACORA.md#adr-013-simplificaci%C3%B3n-pragm%C3%A1tica-del-modelo-de-datos-der-y-alineaci%C3%B3n-con-la-operativa-real-de-cts)).
> 2. **Arquitectura y Despliegue Físico**: Diagrama de despliegue UML, topología de 4 redes virtuales independientes (`public`, `app`, `data`, `sandbox`) y especificación `docker-compose.yml` multi-contenedor con sandbox no privilegiado.
> Los artefactos se encuentran compilados vectorialmente en `/images/RUP/03-diseño/`. Siguiente objetivo: formalización de Contratos OpenAPI / REST y Diagramas de Secuencia de Diseño.

---

<div align="center">

[Fase 02: Análisis](/RUP/02-analisis/README.md) • [Fase 04: Desarrollo](/RUP/04-desarrollo/README.md)

</div>
