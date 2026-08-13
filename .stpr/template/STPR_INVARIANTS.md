# Invariantes STPR

Este archivo es el contrato técnico no negociable del proyecto bajo el método STPR.

Úsalo solo para reglas no negociables. Las decisiones específicas de una feature pertenecen al plan (`/plan/`).

## 1. Invariantes del método STPR

Estas reglas describen la parte portable de STPR. Deben permanecer estables aunque cambie el stack, la herramienta o el mecanismo de persistencia.

### Skeleton

- El proyecto debe tener una base técnica estable antes de solicitar generación no trivial.
- La base técnica debe definir estructura mínima, entorno local y estrategia de verificación para que cada iteración no parta de cero.
- Al existir el proyecto, el propio repositorio actúa como skeleton operativo.
- Las convenciones existentes del skeleton (schemas, seeds, scripts, entorno de test, ayudantes de migración) se preservan salvo que el plan las modifique explícitamente.

### Template

- El template debe contener referencias reales, funcionales y suficientemente representativas para guiar una generación fiel.
- La generación no debe inventar estructura, nomenclatura o patrones cuando ya existe una referencia canónica aplicable.
- Cada capacidad planificada debe declarar su referencia canónica en el plan.
- Cuando un patrón canónico cambia en `src/`, la copia de `.stpr/template/src/` debe actualizarse en el mismo cambio.

### Plan

- El trabajo debe partir de un plan escrito capturado en archivos del proyecto, no solo de contexto de chat.
- El plan debe ser suficiente para ejecutar sin suposiciones ocultas que afecten materialmente a alcance, contrato, mutabilidad, semántica de datos, integración o expectativas de test.
- Si el plan deja ambiguo algo que afecta a alcance, contrato de UI/datos, persistencia, validación o tests, no se implementa todavía: se aclara primero.
- Si los artefactos del plan entran en conflicto con la referencia seleccionada, estas invariantes o la clasificación de capacidades, la planificación debe detenerse y aclararse antes de generar código.
- El plan debe especificar las capas de verificación requeridas para el cambio.

### Ejecución

- La ejecución debe implementar lo aprobado en el plan sin ampliar alcance por criterio propio.
- La ejecución debe respetar la referencia seleccionada y las invariantes activas.
- La implementación no trivial debe avanzar por slices verticales pequeños, revisables y verificables de forma independiente.
- Un slice vertical incluye el contrato de la capacidad, el código mínimo de dominio/data que lo soporta y la verificación de ese slice.
- Antes de crear entidades, value objects, servicios o políticas nuevos, se debe buscar conceptos equivalentes ya existentes en el código y reutilizarlos o extenderlos en lugar de duplicarlos.
- Antes de pasar al siguiente slice, se ejecuta la verificación requerida para el slice actual.
- Si las verificaciones pasan, se continúa automáticamente sin pedir confirmación.
- Si fallan, se arregla el fallo o se registra explícitamente el hueco bloqueante antes de continuar.
- Se interrumpe al humano entre slices solo ante ambigüedad real de alcance, diseño o comportamiento esperado.
- La ejecución se considera completa cuando implementa lo aprobado, respeta la referencia seleccionada, cumple estas invariantes y pasa la verificación requerida.

### Review

- La revisión final debe comprobar arquitectura, semántica de dominio, cobertura relevante y alineamiento con el plan.
- La revisión no valida solo funcionalidad: valida sostenibilidad y fidelidad al patrón correcto.
- Si aparecen desviaciones recurrentes, se evalúa mejorar el skeleton, el template, las invariantes, los planes o el checklist.
- Los tests y la revisión validan el resultado; la IA no sustituye la verificación.

### Casos de parada obligatoria

- Detenerse y aclarar si una capacidad parece de solo lectura pero algún comportamiento del sistema muta su estado.
- Detenerse y aclarar si dos value objects o entidades son estructuralmente idénticos y el plan no explica por qué la separación semántica importa.
- Detenerse y aclarar si se propone un servicio de dominio como vertedero de lógica que pertenece a una entidad, value object, use case o adaptador.
- Detenerse y aclarar si un concepto compartido reutilizable ocultaría comportamiento específico de una feature o crearía un ciclo de dependencias.
- Detenerse y aclarar antes de añadir una propiedad, método de repositorio, caso de uso o componente cuya única justificación es anticipar una capacidad futura no aprobada en el plan.

## 2. Invariantes de arquitectura

La arquitectura de referencia es Clean Architecture con capas planas (no feature-first). Estas reglas permanecen mientras esa filosofía siga siendo la base del proyecto.

- `src/domain/` contiene entidades, value objects, contratos de repositorio y casos de uso. No debe depender de `src/data/`, `src/presentation/`, Tauri, React ni del plugin SQLite.
- `src/data/` contiene adaptadores Tauri (SQLite, filesystem) e implementaciones concretas de los contratos de `src/domain/repositories/`.
- `src/presentation/` contiene componentes, hooks, contexto y páginas React. Los componentes se mantienen libres de lógica de negocio; la lógica vive en hooks o casos de uso.
- `src/CompositionRoot.ts` es la raíz de composición: singleton que instancia repositorios y expone un método `provide<UseCase>()` por caso de uso.
- Los casos de uso y componentes no instancian repositorios directamente: consumen el `CompositionRoot` a través de `AppProvider` / `useAppContext`.
- Los contratos entre capas expresan capacidades de negocio: entidades `src/domain/entities/*.ts`, contratos `src/domain/repositories/*.ts`, casos de uso `src/domain/usecases/*.ts`.
- La validación estructural pertenece a la entrada/presentación; la validación de negocio pertenece al dominio (entidades y value objects).
- Si una mutación depende de una entrada significativa, se valida a nivel de dominio antes de mutar.
- El acceso a SQLite se realiza solo desde `src/data/` a través de `getDatabase()` (plugin SQL de Tauri) o de los commands Tauri para filesystem.
- El código Rust de `src-tauri/` son adaptadores pequeños; la lógica de negocio vive en TypeScript.
- Los shared tests fakes de `src/tests/fakes/` no forman parte del dominio de producción.

### Convenciones de entidades y value objects

- Las entidades extienden `Entity` (con identidad `id: string | number` y `equals()`).
- Las entidades tienen constructor privado, fábrica estática `create()` con validaciones que lanzan error (`throw new Error(...)` o subclase) y métodos inmutable tipo `withUpdates()` / `withLabel()` / `toggleActive()` que devuelven una nueva instancia.
- Los value objects (por ejemplo `Amount`) encapsulan estado, semántica y validación intrínseca con fábrica estática `create()`.
- Los mensajes de validación de dominio están en español y son los que llegan al usuario (los tests de dominio los verifican textualmente).
- Los identificadores que faltan se generan con `crypto.randomUUID()` dentro de la entidad; los de base de datos llegan como `lastInsertId` desde el adaptador.
- Las claves de etiquetas se normalizan con `normalizeKey` / `isValidKey` (`src/domain/entities/Key.ts`); no se reimplementa esa lógica por feature.
- Los importes se modelan siempre con `Amount` (redondeo a 2 decimales, mayor que cero); no se validan importes con primitivos fuera del value object.

## 3. Invariantes de testing y verificación

- El plan debe especificar las capas de verificación requeridas para el cambio; la verificación requerida faltante invalida la finalización.
- Los tests validan comportamiento, no detalles accidentales de implementación.
- TDD para implementación nueva: escribir el test primero, confirmar que falla, implementar el mínimo para que pase (Red-Green-Refactor). Los tests de caracterización son la excepción y no requieren carrera fallida previa.
- Los tests de dominio van en `src/domain/__tests__/`, los de data en `src/data/__tests__/`, los de componentes/hooks en `src/presentation/__tests__/`.
- Los tests usan los fakes compartidos de `src/tests/fakes/repositories.ts`; no se duplican fakes por spec ni se toca el backend real.
- Todo spec sigue bloques AAA separados por línea en blanco; nombres de test y `describe` en inglés; se prefieren `screen.getByRole`, `getByLabelText` y `userEvent` sobre test IDs.
- Todo value object/entidad con validación debe tener cobertura del caso de fallo directo (rama de error), no solo el camino feliz vía consumidores.
- `src/data/__tests__/sqlite.integration.spec.ts` ejecuta SQL real contra `node:sqlite` en memoria (producción usa el plugin Tauri): el esquema y las queries más sensibles deben mantenerse cubiertos ahí.
- Los tests de dominio no dependen de la infraestructura ni del framework; los tests de integración no sustituyen a los de dominio.
- Si un cambio afecta a comportamiento observable, debe añadirse o ajustarse cobertura de ese comportamiento.
- La cobertura no debe bajar de los umbrales del proyecto (85% en statements, branches, functions y lines), verificado con `pnpm test:coverage`.
- Verificación mínima antes de aceptar un cambio: `pnpm test`, `pnpm test:coverage` y `pnpm lint` en verde.
- Los hooks de Husky (`pre-commit`, `pre-push`) no se saltan salvo petición explícita; `pnpm lint:fix` se ejecuta antes de commitear para que Biome aplique orden de imports y formato.

## 4. Invariantes de stack y proyecto

Estas reglas son específicas de Economía Casera (Tauri v2 + React 19 + TypeScript + SQLite + Biome + pnpm).

### Stack

- El gestor de paquetes es pnpm (`pnpm install`, `pnpm dev` vía `cargo tauri dev`, `pnpm build`).
- El formateador y linter es Biome; la configuración vive en `biome.json` y valida también `.stpr/` (incluye `**`).
- El proyecto usa TypeScript estricto (`tsconfig.json` incluye solo `src`; `.stpr/` no se compila, solo se lint).
- React usa contexto (`AppProvider` / `useAppContext`) para exponer el `CompositionRoot`; no se usa estado global fuera de hooks propios.
- El cliente SQLite es `@tauri-apps/plugin-sql`; el esquema, migraciones y seeds viven en `src/data/db.ts`.
- Los commands Tauri (`src-tauri/src/commands.rs`) solo exponen operaciones de filesystem/sistema; se invocan desde `src/data/` con `@tauri-apps/api/core` `invoke`.

### Reglas de dominio específicas

- Tipos de transacción: `income | expense | savings`.
- Solo las transacciones `expense` pueden tener ticket (`receiptPath`); el adaptador de recibos se invoca solo para gastos.
- `Transaction.create()` deriva `year` y `month` de `date` si no vienen dados.
- El `fingerprint` (deduplicación de importaciones) se calcula en la capa de datos (`computeFingerprint`), no en el dominio.
- Los resúmenes (`getSummary*`) excluyen siempre el tipo `savings` de los totales de ingresos/gastos y del desglose por categorías.
- El filtrado combinado de transacciones se construye con `buildTransactionFilterQuery` (cláusulas + `FILTER_FROM`); no se reescribe SQL ad hoc por feature.
- Un nuevo repositorio SQLite implementa su contrato desde `src/domain/repositories/` mapeando filas a entidades con la fábrica `create()` (patrón de `TauriCategoryRepository` o `TauriTransactionRepository`).
- El nombre y el tipo de una categoría/persona derivan su `key` normalizada; la unicidad de `key` es invariante de datos.

### Versionado y lanzamientos

- `main` está protegido y solo se actualiza por pull requests revisadas; ramas `feature/*`, `fix/*`, `refactor/*`, `docs/*` desde `develop`.
- Commits en inglés con Conventional Commits (`feat:`, `fix:`, `docs:`, ...) para que `release-please` calcule versiones.
- No se editan manualmente versiones en `package.json`, `Cargo.toml`, `tauri.conf.json` ni `CHANGELOG.md`.
- No se commitean secretos; `src-tauri/tauri.key` está ignorado y nunca se sube.