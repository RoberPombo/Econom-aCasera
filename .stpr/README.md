# STPR en este repositorio

Esta carpeta contiene los artefactos del método STPR (Skeleton + Template + Plan + Review) adaptados a Economía Casera.

STPR no es un prompt.
STPR no es una herramienta concreta.
STPR no es OpenSpec.

Es una forma de controlar el desarrollo asistido por IA sin delegar la arquitectura, la planificación ni la validación.

## Principio central

Usar la IA para replicar patrones ya validados, no para inventar arquitectura desde cero.

- el humano decide
- la IA ejecuta
- los tests y la revisión validan

Regla de ejecución:

- en slices verticales planificados, la IA debe ejecutar por sí misma las verificaciones requeridas
- si las verificaciones pasan, debe continuar automáticamente
- debe interrumpir al humano solo ante ambigüedad real o un fallo bloqueante

## Estructura

`template/`

- referencias de código real (copias de los patrones canónicos del proyecto)
- mapa de referencias canónicas
- invariantes técnicas no negociables

`plan/`

- plantillas para cerrar decisiones antes de generar código
- sin dependencia de OpenSpec: ruta directa con control manual

`review/`

- checklist de revisión reutilizable
- prompts de revisión de ejecución y de pull request

## Skeleton

El skeleton es la base técnica estable desde la que se parte.

En este repositorio el propio proyecto actúa como skeleton operativo:

- estructura de carpetas (`src/domain/`, `src/data/`, `src/presentation/`, `src-tauri/`)
- dependencias y configuración (pnpm, Vite, Vitest, Biome, Tauri)
- scripts obligatorios (`pnpm dev`, `pnpm test`, `pnpm test:coverage`, `pnpm lint`)
- esquema SQLite, migraciones y seeds (`src/data/db.ts`)
- composición de dependencias (`src/CompositionRoot.ts`)

Regla por defecto:

- las convenciones existentes del skeleton (runtime, tests, esquema, seeds, ayudantes) deben preservarse salvo que el plan de un cambio las modifique explícitamente.

## Template

El template es el contexto de mayor valor para la IA porque contiene código real que puede replicar.

Rutas:

- [`.stpr/template/README.md`](template/README.md) — mapa de referencias canónicas
- [`.stpr/template/STPR_INVARIANTS.md`](template/STPR_INVARIANTS.md) — contrato técnico no negociable
- [`.stpr/template/src/`](template/src/) — copias de los patrones canónicos

Las copias del template son un espejo del código real del proyecto. Cuando un patrón canónico cambie en `src/`, la copia correspondiente debe actualizarse en el mismo cambio (ver política en `template/README.md`).

## Plan

El plan es obligatorio antes de generar cambios no triviales.

Rutas:

- [`.stpr/plan/proposal-change-template.md`](plan/proposal-change-template.md) — para cambios sobre el producto existente
- [`.stpr/plan/proposal-project-template.md`](plan/proposal-project-template.md) — para un proyecto hipotético que parta de esta base

Cuándo usarlo:

- al definir un cambio no trivial (nueva feature, contrato, validación, persistencia o tests)
- cuando haya ambigüedad que pueda afectar a estructura, contrato, datos, validación o tests

Regla práctica del método: si la respuesta puede cambiar la estructura, el contrato, la persistencia, la validación o los tests, no debe quedar implícita.

## Review

Review es la capa de control final.

Debe verificar:

- fidelidad al template
- respeto de las invariantes
- cobertura y verificación relevantes
- ausencia de deriva innecesaria

Recursos:

- [`.stpr/review/CHECKLIST_REVISION.md`](review/CHECKLIST_REVISION.md) — checklist manual antes de cerrar trabajo no trivial
- [`.stpr/review/execution-review.md`](review/execution-review.md) — prompt de auditoría de ejecución (pre-PR, orientado a mejorar el sistema STPR)
- [`.stpr/review/pull-request-review.md`](review/pull-request-review.md) — prompt de revisión de PR (merge readiness)

## Flujo cuando trabajas con IA

1. **Plan**: para un cambio no trivial, rellena la plantilla de cambio y ajústala con la IA hasta cerrar alcance, reglas, mutabilidad, errores y verificación mínima.
2. **Ejecución**: la IA implementa por slices verticales siguiendo `template/README.md` y `STPR_INVARIANTS.md`, sin ampliar alcance y ejecutando la verificación de cada slice antes de pasar al siguiente.
3. **Verificación**: se ejecutan los checks del proyecto (`pnpm test`, `pnpm test:coverage`, `pnpm lint`) y cualquier verificación adicional declarada en el plan.
4. **Review**: se pasa el checklist de revisión y, para trabajo no trivial, los prompts de revisión de ejecución y de PR.

## Regla de oro

Si una herramienta cambia, desaparece o se vuelve demasiado cara, la forma de trabajar no debe romperse.

Por eso el núcleo del método vive en archivos propios del repositorio:

- skeleton (el propio proyecto)
- template
- plan
- review