# Mapa de referencias del template

Este archivo es la puerta de entrada para usar `.stpr/template/` con el mínimo contexto posible.

Úsalo junto con:

- `STPR_INVARIANTS.md`
- los archivos de referencia indicados abajo
- los tests de referencia solo cuando el cambio afecte a comportamiento o cobertura

## Objetivo

Elegir la referencia adecuada rápidamente. El objetivo no es cargar todo el template, sino abrir el conjunto de archivos más pequeño y útil para la tarea.

Orden de lectura por defecto:

1. clasifica la capacidad
2. elige la referencia canónica
3. abre solo el conjunto mínimo
4. abre archivos opcionales solo si la tarea los necesita
5. abre los tests al final, no al principio

## Clasificación canónica

| Referencia | Clasificación | Por qué |
| --- | --- | --- |
| `transaction` | agregado mutable con validación, CRUD y efectos secundarios | Entidad principal: `create()`/`withUpdates()`, value object `Amount`, use case compuesto (repositorio + recibo + sync), adaptador SQLite con queries complejas |
| `category` / `person` | catálogo CRUD simple | Entidad estable con `create()` y métodos inmutable, use cases CRUD sin efectos secundarios, contrato de repositorio y adaptador SQLite simple |
| `sqlite-access` | acceso a datos compartido | Esquema, migraciones y seeds sobre `src/data/db.ts`; singleton `getDatabase()` |
| `composition` | inyección de dependencias | `CompositionRoot` singleton con métodos `provide*`, consumo desde React vía `AppProvider` / `useAppContext` |
| `fakes` | dobles de prueba en memoria | Dobles compartidos de todos los repositorios para tests de dominio y presentación |
| `integration-sql` | verificación de SQL real | Tests de integración con `node:sqlite` en memoria contra `getDatabase()` y los repositorios Tauri |

## Origen de las referencias

Todas las referencias de este template son `template-backed`: las copias están dentro de `.stpr/template/src/`, espejando la estructura del proyecto real.

Reglas:

- Usa `.stpr/template/src/` como referencia de implementación para código nuevo.
- Cuando una capacidad canónica cambie en `src/`, la copia de `.stpr/template/src/` debe actualizarse en el mismo cambio (política de actualización más abajo).
- Algunas copias son extractos marcados con un comentario de cabecera (ver sección «Extractos»). Léelos como referencia del patrón, no como copia exacta del archivo real.

## Nota sobre los imports de las copias

En el código real, `src/` re-exporta sus capas mediante barriles (`src/domain/entities/index.ts`, `src/domain/usecases/index.ts`, etc.) y los archivos suelen importar desde el barril (por ejemplo `import { Category } from "../entities"`).

Las copias del template usan imports a archivos concretos (por ejemplo `from "../entities/Category"`) para ser autocontenidas. Esto NO cambia el patrón estructural: la convención del proyecto es usar barriles en `src/` y cruzarlos libremente dentro de la misma capa o desde `data/`.

## Selección rápida

- Si la capacidad es una entidad con estado mutable, validación y CRUD, y además coordina efectos secundarios (ficheros, sync), replica `transaction`.
- Si la capacidad es datos de referencia estables administrables (etiqueta + tipo), replica `category` (o `person` para el caso sin tipo).
- Si la capacidad afecta al esquema SQLite, migraciones o datos iniciales, replica `sqlite-access`.
- Si la capacidad añade un caso de uso que combina varios repositorios, replica `CreateTransactionUseCase`.
- Si la capacidad añade un repositorio SQLite nuevo, replica `TauriCategoryRepository` (simple) o `TauriTransactionRepository` (con queries y joins).
- Si la capacidad necesita nuevos dobles de prueba, replica `fakes`.
- Si la capacidad toca el cableado de dependencias, replica `composition`.
- Si la capacidad cambia queries sensibles del esquema, replica `integration-sql`.

## Carga mínima de contexto

No empieces leyendo todos los archivos de una referencia.

Abre primero el conjunto más pequeño y útil:

- `STPR_INVARIANTS.md`
- una referencia de este archivo
- un test solo si el comportamiento debe replicarse exactamente

Atajos:

- Nueva entidad + casos de uso CRUD:
  abre `Category.ts`, `CategoryUseCases.ts`, `CategoryRepository.ts`, `TauriCategoryRepository.ts` y el bloque de uso de casos de `CRUDUseCases.spec.ts`
- Nuevo use case compuesto (varios repositorios):
  abre `CreateTransactionUseCase.ts` y el contrato `TransactionRepository.ts`
- Cambio de validación de dominio:
  abre la entidad o value object primero (`Amount.ts`, `Category.ts`, `Transaction.ts`) y solo después los tests afectados
- Nueva tabla o migración:
  abre `db.ts` y el spec de integración `sqlite.integration.spec.ts`
- Nuevo adaptador Tauri (comando `invoke`):
  abre `TauriReceiptRepository.ts` o `TauriDbInfoRepository.ts`
- Consumo desde React:
  abre `AppProvider.tsx`, `useAppContext.ts` y `AppContext.tsx`

## Referencia por tipo

### Agregado mutable con validación, CRUD y efectos secundarios

Referencia canónica:

- `transaction` → `.stpr/template/src/domain/entities/Transaction.ts` (+ `Amount.ts`, `Entity.ts`)
- `.stpr/template/src/domain/usecases/CreateTransactionUseCase.ts`
- `.stpr/template/src/data/TauriTransactionRepository.ts` (+ `buildTransactionFilterQuery.ts`, `computeFingerprint.ts`)

Conjunto mínimo:

- `domain/entities/Transaction.ts`
- `domain/entities/Amount.ts`
- `domain/usecases/CreateTransactionUseCase.ts`
- `domain/repositories/TransactionRepository.ts`
- `data/TauriTransactionRepository.ts`

Archivos opcionales:

- `data/buildTransactionFilterQuery.ts`
- `data/computeFingerprint.ts`
- `domain/entities/Entity.ts`
- `data/__tests__/sqlite.integration.spec.ts`

Abre esta referencia cuando:

- la entidad es el centro del dominio y se valida en `create()`
- un use case coordina varios repositorios (crear + efectos secundarios + sync)
- el adaptador ejecuta SQL con joins y agregaciones

### Catálogo CRUD simple

Referencia canónica:

- `category` → `.stpr/template/src/domain/entities/Category.ts` (+ `Key.ts`, `Entity.ts`)
- `.stpr/template/src/domain/usecases/CategoryUseCases.ts`
- `.stpr/template/src/domain/repositories/CategoryRepository.ts`
- `.stpr/template/src/data/TauriCategoryRepository.ts`
- `person` → análogo con `Person.ts`, `PersonUseCases.ts`, `PersonRepository.ts`, `TauriPersonRepository.ts`

Conjunto mínimo:

- `domain/entities/Category.ts` (o `Person.ts`)
- `domain/usecases/CategoryUseCases.ts` (o `PersonUseCases.ts`)
- `domain/repositories/CategoryRepository.ts` (o `PersonRepository.ts`)
- `data/TauriCategoryRepository.ts` (o `TauriPersonRepository.ts`)

Archivos opcionales:

- `domain/entities/Key.ts` (normalización de claves)
- `domain/entities/Entity.ts`
- `domain/__tests__/CRUDUseCases.spec.ts`

Abre esta referencia cuando:

- la capacidad es datos de referencia administrables
- el CRUD no tiene efectos secundarios
- la validación vive en la entidad (`create()`), no en el use case

### Acceso a datos compartido

Referencia canónica:

- `sqlite-access` → `.stpr/template/src/data/db.ts`

Conjunto mínimo:

- `data/db.ts`

Archivos opcionales:

- `data/__tests__/sqlite.integration.spec.ts`

Abre esta referencia cuando:

- cambia el esquema, una migración o los datos semilla
- se añaden índices o columnas sensibles a consultas existentes

Regla: el esquema y las consultas más sensibles deben seguir cubiertas por `sqlite.integration.spec.ts` (SQL real en memoria).

### Composición de dependencias

Referencia canónica:

- `composition` → `.stpr/template/src/CompositionRoot.ts`
- `.stpr/template/src/presentation/context/AppProvider.tsx`
- `.stpr/template/src/presentation/context/AppContext.tsx`
- `.stpr/template/src/presentation/context/useAppContext.ts`

Conjunto mínimo:

- `CompositionRoot.ts`
- `presentation/context/AppProvider.tsx`
- `presentation/context/useAppContext.ts`

Archivos opcionales:

- `presentation/context/AppContext.tsx`
- `presentation/__tests__/useAppContext.spec.tsx`

Abre esta referencia cuando:

- se añade un caso de uso nuevo y hay que exponerlo con un método `provide*`
- se necesita consumir repositorios desde React
- se cambia el cableado de dependencias

Regla: los componentes no instancian repositorios; consumen el contexto (`AppProvider` / `useAppContext`).

### Dobles de prueba en memoria

Referencia canónica:

- `fakes` → `.stpr/template/src/tests/fakes/repositories.ts`

Conjunto mínimo:

- `tests/fakes/repositories.ts`

Archivos opcionales:

- `domain/__tests__/CRUDUseCases.spec.ts` (uso de los fakes desde un spec)

Abre esta referencia cuando:

- un test de dominio o presentación necesita un repositorio falso
- hay que ampliar los fakes porque un contrato de repositorio cambió

Regla: no se duplican fakes por spec; los fakes compartidos viven en `src/tests/fakes/repositories.ts`.

### Tests con SQL real

Referencia canónica:

- `integration-sql` → `.stpr/template/src/data/__tests__/sqlite.integration.spec.ts`

Conjunto mínimo:

- `data/__tests__/sqlite.integration.spec.ts`

Abre esta referencia cuando:

- se cambia el esquema, una migración o una query sensible
- se quiere verificar comportamiento de un adaptador Tauri contra SQL real

## Reglas de lectura de tests

Los tests son material de referencia. Cárgalos de forma intencionada.

Abre tests primero solo si:

- la tarea es explícitamente sobre cobertura faltante
- el contrato observable debe replicarse exactamente
- la estructura AAA y el uso de fakes del spec son lo que se quiere copiar

En cualquier otro caso:

1. lee primero los archivos de implementación
2. abre un test que coincida con el patrón
3. abre más tests solo si es necesario

## Política de actualización del template

Las copias de `.stpr/template/src/` son referencias congeladas de los patrones canónicos. Para que el espejo no mienta:

- Si un cambio en `src/` altera un patrón canónico (estructura, nomenclatura, límites, validación, patrón de adaptador o de test), la copia correspondiente se actualiza en el mismo cambio.
- Si un cambio introduce un patrón nuevo y maduro, la copia se añade al template en ese cambio.
- Si un cambio es puntual y no altera el patrón, la copia no se toca.
- Los extractos (marcados con comentario de cabecera) se re-sincronizan cuando cambia la parte del archivo real que representan.

## Trucos y avisos

- No uses `.stpr/template/` como fuente de verdad de datos de runtime: los tests y el build solo leen `src/` y `src-tauri/`.
- El orden de imports de las copias lo mantiene Biome (`pnpm lint:fix`); modifica las copias y pasa el linter.
- El build (`tsc -b`) no compila `.stpr/` (el `tsconfig` solo incluye `src`), pero Biome sí lo revisa (incluye `**`).