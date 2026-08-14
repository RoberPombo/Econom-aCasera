# Plantilla de propuesta de cambio

Usa este archivo para definir el `Plan` de un cambio sobre economica-casera (producto existente).

Es la ruta directa de planificación de STPR:

- defines tú el plan del cambio
- la IA trabaja desde un plan más ajustado y explícito

La propuesta debe ser compacta y funcional-primero.
Mantén el detalle técnico solo cuando cambie arquitectura, contratos, mutabilidad, validación o estrategia de test.
No decidas de antemano tipos o carpetas de implementación (por ejemplo «value object en `domain/entities/`») salvo que esa decisión de modelado sea parte del contrato del cambio.

Antes de rellenarla:

- lee `.stpr/template/README.md` para elegir la referencia canónica de cada capacidad afectada
- lee `.stpr/template/STPR_INVARIANTS.md` para confirmar límites y reglas de modelado
- lee `AGENTS.md` para las reglas del repositorio

## Cambio

<Nombre corto o descripción en una línea del cambio>

## Objetivo

<Qué problema resuelve este cambio y por qué importa ahora>

## Alcance

- <Capacidad, pantalla, componente, contrato o caso de uso nuevo/cambiado 1>
- <Capacidad, pantalla, componente, contrato o caso de uso nuevo/cambiado 2>

## Clasificación de capacidades

- <Capacidad afectada> -> <entidad | value object | caso de uso | contrato de repositorio | adaptador Tauri/sqlite | componente/hook | flujo de UI | integración externa> -> <ruta de referencia del template>
- <Capacidad afectada> -> <tipo> -> <ruta de referencia del template>

Clasifica en el nivel de límite de comportamiento/arquitectura. Prefiere entradas como «validación de importe -> value object» o «lectura de recibos -> adaptador Tauri» frente a suposiciones de implementación concreta.

## Mapeo a template canónico

- <Capacidad afectada> -> <ruta de referencia canónica> -> <motivo por el que es la referencia más cercana>
- <Capacidad afectada> -> <ruta de referencia canónica> -> <motivo por el que es la referencia más cercana>

## Entradas y salidas

- <Inputs afectados (formularios, archivos, comandos Tauri, parámetros de use case)>
- <Salida o comportamiento observable afectado (UI, mensajes, persistencia)>

## Reglas de negocio

- <Regla 1>
- <Regla 2>
- <Regla 3>

## Estado y mutabilidad

- <Qué estado cambia por este cambio>
- <Si el cambio es de solo lectura o muta datos locales, ficheros o sistemas remotos (Google Drive, updater)>

## Estrategia de rama

- <Continuar la rama actual o crear una nueva; los cambios de rama requieren confirmación del mantenedor>

## Dependencias externas

- <Sistema de archivos / SQLite / plugin Tauri / red / dependencias npm afectadas>

## Modelo de errores

- <Errores esperados introducidos o cambiados>
- <Mensajes de error visibles al usuario y si ya existen en el dominio (entidades lanzan Error con mensaje en español)>

## Impacto en documentación

- <README / CHANGELOG / docs afectadas>
- <Si no se necesita actualización de documentación, explica por qué>

## Disciplina de implementación

- Define el primer slice vertical antes de empezar.
- Para cada capacidad no trivial, escribe o actualiza los tests de comportamiento observable y de lógica de dominio pura antes o junto a la implementación (TDD).
- Implementa solo el código mínimo del slice actual antes de pasar al siguiente.
- Ejecuta la verificación requerida del slice actual antes de empezar el siguiente, o registra explícitamente el hueco.
- No implementes múltiples capacidades no relacionadas en una sola pasada de generación cuando el trabajo se pueda dividir en tareas por capacidad.

## Verificación mínima

- <Tests de dominio / data / presentación afectados>
- <`pnpm test` / `pnpm test:coverage` / `pnpm lint` y cualquier verificación adicional>

## Fuera de alcance

- <Lo que este cambio NO incluye>

## Notas

- <Aclaraciones de implementación opcionales>
- <Resume terminología o invariantes de dominio solo cuando afecten materialmente a este cambio>
- <Documenta cualquier desviación permitida de la referencia canónica mapeada; si no hay ninguna, indícalo explícitamente>