<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [Actores y Contexto](/RUP/01-requisitos/01-actores-casos-uso/README.md) | [Catálogo de Casos de Uso](/RUP/01-requisitos/03-detalle-casos-uso/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|
</div>

# Caso de Uso: `admitirAlumnoProfer()`


<div align=center>

| Especificación del Caso de Uso |
| :---: |
| ![](/images/RUP/01-requisitos/03-detalle-casos-uso/admitirAlumnoProfer/especificacion.svg) |
| <sup><i>[Código fuente PlantUML](especificacion.puml)</i></sup> |

| Wireframe de la Interfaz |
| :---: |
| ![](/images/RUP/01-requisitos/03-detalle-casos-uso/admitirAlumnoProfer/wireframes.svg) |
| <sup><i>[Código fuente PlantUML](wireframes.puml)</i></sup> |

</div>

---

## Información del Caso de Uso

<div align=center>

| Atributo | Valor |
| :--- | :--- |
| **Actores** | `Gestor` (`GestorProfer`) |
| **Objetivo** | Formalizar la resolución favorable de admisión de un aspirante, promoviendo la entidad `Candidato` a `Alumno` (`AlumnoProfer`), permitiendo asignarlo de inmediato o diferir su asignación de Squad a la ventana previa a su incorporación física con asistencia del recomendador de afinidad técnica, matriculándolo en el programa y despachando la notificación institucional |
| **Precondición** | El Gestor debe encontrarse autenticado y en el expediente del aspirante (`PERFIL_CANDIDATO_ABIERTO`); la candidatura debe estar en estado `EVALUACION_COMPLETADA` o con entrevista cualitativa realizada |
| **Postcondición Éxito** | Entidad `Candidatura` transiciona a `ADMITIDO`; se crea la instancia `AlumnoProfer` vinculada (con o sin squad asignado según la modalidad seleccionada); se generan credenciales de acceso para rol `Alumno`; se despachan notificaciones transaccionales a candidato y sede; el contexto transiciona a `PANEL_ADMISIONES_ABIERTO` |
| **Postcondición Bloqueo** | Si el expediente ya contaba con dictamen previo cerrado, el sistema emite un aviso de bloqueo y mantiene al Gestor en el perfil sin alterar el estado |

</div>

---

## Reglas de Negocio Asociadas

1. **RN-ADM-01 — Asignación Inmediata o Diferida de Squad (ADR-016)**:
   * Al formalizar el dictamen favorable ("SÍ" al programa), el Gestor puede optar por asignar inmediatamente al aspirante a uno de los 6 Squads tecnológicos de CTS (asistido por el recomendador de afinidad técnica basado en los 3 tests) o bien diferir la asignación a la ventana temporal entre la resolución y la llegada física del estudiante. En caso diferido, el alumno se incorpora a la bandeja prioritaria de "Pendientes de Squad" en el panel del Gestor.
2. **RN-ADM-02 — Flexibilidad Operativa de Plazas y Movilidad Inter-Squads (ADR-013 y ADR-016)**:
   * La asignación a los squads se rige por demandas reales de proyecto sin cupos rígidos artificiales. Asimismo, durante su ciclo formativo en el centro, el Gestor puede reasignar y transferir al alumno entre squads para responder a rotaciones de proyectos sin perder su expediente formativo ni sus entregables.
3. **RN-ADM-03 — Promoción de Rol y Activación de Credenciales**:
   * La admisión ejecuta la transición de rol en el subsistema de acceso (`PK01 - Acceso`). Las credenciales anteriores de `Candidato` quedan revocadas y se generan los permisos operativos de `Alumno`, habilitando el acceso a `INICIO_ALUMNO_ABIERTO` y a los módulos de formación.
4. **RN-ADM-04 — Inmutabilidad del Dictamen Favorable**:
   * Una vez formalizada la admisión, el expediente del candidato queda cerrado permanentemente en la convocatoria, impidiendo reactivaciones o modificaciones directas sin un procedimiento formal de baja.

---

## Referencias

* [Modelo del Dominio: `Candidato`, `Alumno`, `Equipo`, `LiderEquipo`](/RUP/00-modelo-del-dominio/README.md)
* [Diagrama de Estados de Candidatura (`REGISTRADO` → `EN_EVALUACION` → `ADMITIDO`)](/RUP/00-modelo-del-dominio/estados-entidades/candidatura-estados.puml)
* [Diagrama de Contexto Gestor](/RUP/01-requisitos/01-actores-casos-uso/diagramaContextoGestor.puml)
* [Caso de Uso: `abrirPerfilCandidato()`](/RUP/01-requisitos/03-detalle-casos-uso/abrirPerfilCandidato/README.md)
* [ADR-007: Admisión continua y batería de 3 tests diagnósticos](/RUP/BITACORA.md#adr-007-admisi%C3%B3n-continua-por-ciclos-acad%C3%A9micos-bater%C3%ADa-de-3-tests-e-inclusi%C3%B3n-de-entrevista)
* [ADR-013: Simplificación pragmática del modelo de datos DER y operativa real CTS](/RUP/BITACORA.md#adr-013-simplificaci%C3%B3n-pragm%C3%A1tica-del-modelo-de-datos-der-y-alineaci%C3%B3n-con-la-operativa-real-de-cts)
* [ADR-016: Asignación diferida de Squad, recomendador de afinidad técnica y movilidad](/RUP/BITACORA.md#adr-016-asignaci%C3%B3n-diferida-de-squad-recomendador-de-afinidad-t%C3%A9cnica-y-movilidad-inter-equipos)
---

<div align="center">

[Volver al Catálogo de Casos de Uso](/RUP/01-requisitos/03-detalle-casos-uso/README.md) • [Ver Diagramas de Contexto](/RUP/01-requisitos/01-actores-casos-uso/README.md)

</div>
