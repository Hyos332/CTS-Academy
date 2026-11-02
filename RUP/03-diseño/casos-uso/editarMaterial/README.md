<div align="center">

| [Inicio](/README.md) | [RUP Hub](/RUP/README.md) | [00 Dominio](/RUP/00-modelo-del-dominio/README.md) | [01 Requisitos](/RUP/01-requisitos/README.md) | [02 Análisis](/RUP/02-analisis/README.md) | [03 Diseño](/RUP/03-diseño/README.md) | [Catálogo Diseño](/RUP/03-diseño/casos-uso/README.md) |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|

<sub>**Fase 03 Diseño** › **Realización de Casos de Uso** › `editarMaterial()`</sub>

</div>

# Realización de Diseño: `editarMaterial()`

Esta especificación formaliza el diseño técnico y contrato de interfaz para el caso de uso `editarMaterial()`. Modela la actualización en caliente de guías técnicas en Markdown ([ADR-013](/RUP/BITACORA.md#adr-013-simplificaci%C3%B3n-pragm%C3%A1tica-del-modelo-de-datos-der-y-alineaci%C3%B3n-con-la-operativa-real-de-cts)) garantizando que únicamente el Tech Leader responsable del Squad propietario pueda realizar modificaciones ([RN-LEAD-01](/RUP/01-requisitos/03-detalle-casos-uso/abrirPanelLider/README.md)).

---

<div align="center">

| Diagrama de Secuencia de Diseño UML |
| :---: |
| ![](/images/RUP/03-diseño/casos-uso/editarMaterial/secuenciaDiseño.svg) |
| <sup><i>[Código fuente PlantUML](secuenciaDiseño.puml)</i></sup> |

</div>

---

## 1. Contrato de Interfaz REST (OpenAPI 3.1)

### 1.1 Definición del Endpoint

* **Ruta HTTP**: `PUT /api/v1/formacion/materiales/:id`
* **Acceso / Seguridad**: Autenticado mediante `Bearer <accessToken>` con rol `LIDER_EQUIPO` o `GESTOR`.
* **Parámetros de Ruta**:
  * `id` (`uuid`, obligatorio): Identificador del material a modificar.
* **Cabeceras de Petición**:
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

### 1.2 DTO de Entrada (`EditarMaterialDto`)

```typescript
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class EditarMaterialDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  contenidoMarkdown?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  estimadoMinutos?: number;
}
```

### 1.3 Respuestas Canónicas (DTOs de Salida)

#### `200 OK` — Material Actualizado

```json
{
  "statusCode": 200,
  "message": "Material formativo actualizado exitosamente",
  "data": {
    "id": "b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
    "titulo": "Guía Avanzada de Inversión de Dependencias (DIP)",
    "actualizadoEn": "2026-11-02T14:50:00.000Z"
  }
}
```

---

## 2. Componentes de Software de Diseño (NestJS)

* **`MaterialesController`**: Endpoint `PUT /materiales/:id`.
* **`MaterialesService.updateMaterial`**: Verificación de pertenencia y actualización en `motor_formacion.materiales`.

---

## 3. Trazabilidad con Requisitos y Análisis

| Requisito / Análisis | Realización de Diseño |
| :--- | :--- |
| **Caso de Uso `editarMaterial()`** | Endpoint `PUT /api/v1/formacion/materiales/:id`. |
| **Propiedad Técnica (RN-LEAD-01)** | Restricción por squad titular en `motor_equipos.equipos.lider_usuario_id`. |
| **Actualización en Caliente** | Modificación inmediata de `contenido_markdown` en PostgreSQL. |

---

<div align="center">

[Ver Análisis previo (Fase 02)](/RUP/02-analisis/casos-uso/editarMaterial/README.md) • [Catálogo de Casos de Uso (Diseño)](/RUP/03-diseño/casos-uso/README.md) • [Siguiente: `eliminarMaterial()`](../eliminarMaterial/README.md)

</div>
