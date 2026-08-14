# Plantilla de propuesta de proyecto

Usa este archivo para definir el `Plan` de un proyecto nuevo que parta de economica-casera como skeleton base.

Es la ruta directa de planificación de STPR para un proyecto nuevo: defines tú el plan y la IA trabaja desde él.

Esta plantilla solo aplica si se va a crear una aplicación nueva reutilizando esta base. Para cambios sobre el producto existente usa `proposal-change-template.md`.

Antes de rellenarla:

- lee `.stpr/template/README.md` y `.stpr/template/STPR_INVARIANTS.md`
- lee `AGENTS.md` para las reglas del repositorio
- decide qué parte de este repositorio es base estable y qué parte NO debe usarse como referencia del proyecto nuevo

## Nombre del proyecto

<Nombre>

## Descripción del proyecto

<Una o dos líneas de qué hace>

## Objetivo

<Qué problema resuelve y por qué importa ahora>

## Alcance inicial

- <Capacidad nueva 1>
- <Capacidad nueva 2>

## Conceptos principales

- <Concepto de dominio 1>
- <Concepto de dominio 2>

## Clasificación de capacidades

- <Capacidad> -> <entidad | value object | caso de uso | contrato de repositorio | adaptador | componente/hook | flujo de UI | integración externa> -> <ruta de referencia del template>
- <Capacidad> -> <tipo> -> <ruta de referencia del template>

## Mapeo a skeleton y template

- Parte del skeleton que se conserva: (estructura de carpetas, scripts, Biome, esquema SQLite, fakes, patrón de composición…)
- Parte del skeleton que NO se copia: (por ejemplo contenido de negocio de finanzas personales, migraciones específicas, commands Tauri concretos)
- Referencias canónicas del template que se aplican: (por ejemplo `transaction` como agregado mutable, `category` como catálogo CRUD, `composition` como cableado)

## Entradas y salidas

- <Inputs de usuario afectados>
- <Salida o comportamiento observable>

## Reglas de negocio

- <Regla 1>
- <Regla 2>

## Estado y mutabilidad

- <Qué estado muta y qué es de solo lectura>
- <Persistencia local / sincronización / red>

## Estrategia de rama

- <Rama de trabajo; los cambios de rama requieren confirmación>

## Dependencias externas

- <Sistema de archivos / SQLite / plugin Tauri / red / dependencias npm>

## Modelo de errores

- <Errores esperados y mensajes visibles al usuario>

## Impacto en documentación

- <README y docs del proyecto nuevo>

## Disciplina de implementación

- Define el primer slice vertical antes de empezar.
- Para cada capacidad no trivial, escribe o actualiza los tests de comportamiento observable y de lógica de dominio pura antes o junto a la implementación (TDD).
- Implementa solo el mínimo del slice actual antes de pasar al siguiente y ejecuta su verificación antes de continuar.
- No implementes múltiples capacidades no relacionadas en una sola pasada.

## Verificación mínima

- <Tests de dominio / data / presentación>
- <`pnpm test` / `pnpm test:coverage` / `pnpm lint` y cualquier verificación adicional>

## Fuera de alcance

- <Lo que el proyecto nuevo NO incluye>

## Notas

- <Documenta cualquier desviación permitida de las referencias mapeadas; si no hay ninguna, indícalo explícitamente>