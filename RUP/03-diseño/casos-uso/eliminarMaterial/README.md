<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | [03 Diseño](/RUP/03-diseño/README.md) | [Catálogo Diseño](/RUP/03-diseño/casos-uso/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

<sub>**Fase 03 Diseño** › **Realización de Casos de Uso** › `eliminarMaterial()`</sub>

</div>

# Realización de Diseño: `eliminarMaterial()`

Esta especificación formaliza el diseño técnico y contrato de interfaz para el caso de uso `eliminarMaterial()`. Modela la supresión controlada de un material formativo en `motor_formacion.materiales`, purgando en cascada las lecturas registradas en `motor_formacion.lecturas_material` bajo estricto control de permisos del Tech Leader titular.

---

<div align="center">

| Diagrama de Secuencia de Diseño UML |
| :---: |
| ![](/images/RUP/03-diseño/casos-uso/eliminarMaterial/secuenciaDiseño.svg) |
| <sup><i>[Código fuente PlantUML](secuenciaDiseño.puml)</i></sup> |

</div>

---

## 1. Contrato de Interfaz REST (OpenAPI 3.1)

### 1.1 Definición del Endpoint

* **Ruta HTTP**: `DELETE /api/v1/formacion/materiales/:id`
* **Acceso / Seguridad**: Autenticado mediante `Bearer <accessToken>` con rol `LIDER_EQUIPO` o `GESTOR`.
* **Parámetros de Ruta**:
  * `id` (`uuid`, obligatorio): Identificador del material a eliminar.
* **Cabeceras de Petición**:
  * `Authorization: Bearer <accessToken>`

### 1.2 Respuestas Canónicas (DTOs de Salida)

#### `200 OK` — Material Eliminado

```json
{
  "statusCode": 200,
  "message": "Material didáctico eliminado satisfactoriamente",
  "data": {
    "id": "b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
    "eliminado": true
  }
}
```

---

## 2. Componentes de Software de Diseño (NestJS)

* **`MaterialesController`**: Endpoint `DELETE /materiales/:id`.
* **`MaterialesService.deleteMaterial`**: Transacción de borrado relacional que previene inconsistencias por llaves foráneas.

---

## 3. Trazabilidad con Requisitos y Análisis

| Requisito / Análisis | Realización de Diseño |
| :--- | :--- |
| **Caso de Uso `eliminarMaterial()`** | Endpoint `DELETE /api/v1/formacion/materiales/:id`. |
| **Limpieza de Tracking** | Borrado de dependencias en `motor_formacion.lecturas_material`. |
| **Restricción de Autorización** | Validación de titularidad de squad del solicitante. |

---

<div align="center">

[Ver Análisis previo (Fase 02)](/RUP/02-analisis/casos-uso/eliminarMaterial/README.md) • [Catálogo de Casos de Uso (Diseño)](/RUP/03-diseño/casos-uso/README.md) • [Siguiente: `crearPregunta()`](../crearPregunta/README.md)

</div>
