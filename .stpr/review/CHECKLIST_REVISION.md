# Checklist de revisión manual

Usa este checklist en la fase `Review`, después de la implementación y la ejecución de tests, para verificar manualmente que el trabajo generado sigue alineado con STPR y el template.

Es una guía para la revisión humana. La IA puede ayudar a inspeccionar el código, comparar archivos y resumir hallazgos, pero la validación final es manual.

**Referencia:** comparar contra **`.stpr/template/`** como fuente de verdad. También se revisan los ejemplos disponibles en `.stpr/template/src/`.

---

## Alineación con el plan

- [ ] El alcance implementado coincide con la propuesta aprobada (`.stpr/plan/`).
- [ ] Los elementos fuera de alcance no se implementaron por accidente.
- [ ] Cualquier desviación de diseño está documentada y justificada.
- [ ] La clasificación de capacidades es explícita y sigue siendo correcta.

## Disciplina de ejecución

- [ ] El trabajo no trivial se implementó en slices verticales revisables.
- [ ] Cada slice completado incluye el contrato de la capacidad, la implementación mínima y su verificación.
- [ ] Cada slice pasó su verificación automática antes de empezar el siguiente, o el hueco bloqueante quedó registrado explícitamente.
- [ ] Se reutilizaron conceptos existentes (entidades, value objects, `Key`, `Amount`, fakes) en lugar de duplicarlos.
- [ ] No se añadieron múltiples capacidades no relacionadas en una sola pasada de generación cuando el plan permitía dividirlas.
- [ ] El progreso entre slices solo se bloqueó por fallos de checks o ambigüedad real, no por pausas de confirmación innecesarias.

## Estructura y límites

- [ ] Las entidades viven en `src/domain/entities/`, los contratos en `src/domain/repositories/`, los casos de uso en `src/domain/usecases/`.
- [ ] Los adaptadores Tauri/SQLite viven en `src/data/` e implementan contratos de `src/domain/`.
- [ ] Los componentes y hooks viven en `src/presentation/` y no contienen lógica de negocio.
- [ ] `src/domain/` no importa desde `src/data/` ni `src/presentation/`, ni usa Tauri/React/plugin SQL.
- [ ] Los componentes no instancian repositorios: consumen el `CompositionRoot` vía `AppProvider` / `useAppContext`.
- [ ] Las dependencias se componen en `src/CompositionRoot.ts` con métodos `provide<UseCase>()`.
- [ ] No se crearon estructuras nuevas de carpetas sin necesidad.
- [ ] La copia del patrón canónico en `.stpr/template/src/` se actualizó si el patrón cambió.

## Dominio

- [ ] Las entidades extienden `Entity` y usan constructor privado + fábrica `create()` + métodos inmutable (`withUpdates` / `withLabel` / `toggleActive`).
- [ ] Los value objects encapsulan validación intrínseca (por ejemplo `Amount`); el caso de fallo directo tiene test.
- [ ] Los mensajes de error de dominio están en español y los verifican los tests.
- [ ] Los importes se modelan con `Amount`; las claves con `normalizeKey` / `isValidKey`.
- [ ] Solo los gastos (`expense`) pueden tener ticket.
- [ ] Los resúmenes excluyen `savings` de totales y desgloses cuando corresponde.
- [ ] Las entradas significativas se validan a nivel de dominio antes de mutar estado.

## Datos (SQLite / Tauri)

- [ ] El acceso a SQLite se hace desde `src/data/` con `getDatabase()`; los commands Tauri se invocan desde `src/data/` con `invoke`.
- [ ] Los cambios de esquema/migraciones/seeds están en `src/data/db.ts` y cubiertos por `sqlite.integration.spec.ts` (SQL real).
- [ ] El `fingerprint` se calcula en `src/data/computeFingerprint.ts`, no en el dominio.
- [ ] El SQL de filtrado no se reescribe ad hoc: usa `buildTransactionFilterQuery` cuando aplica.
- [ ] Las filas se mapean a entidades con su fábrica `create()` (patrón de `TauriCategoryRepository` / `TauriTransactionRepository`).

## Tests

- [ ] Las reglas de dominio tienen tests en `src/domain/__tests__/` con fakes compartidos (`src/tests/fakes/repositories.ts`).
- [ ] Las queries y el esquema sensibles están cubiertos por `src/data/__tests__/sqlite.integration.spec.ts`.
- [ ] Los tests de componentes/hooks usan React Testing Library y respetan AAA.
- [ ] Los tests usan `screen.getByRole` / `getByLabelText` / `userEvent` en lugar de test IDs.
- [ ] Si el cambio afecta a comportamiento observable, la cobertura cambió o se añadió.
- [ ] La verificación listada en el plan se ejecutó.
- [ ] Pasan: `pnpm test`, `pnpm test:coverage` (umbrales 85%) y `pnpm lint`.

## Documentación

- [ ] README o docs relevantes se actualizaron si cambió configuración, comandos o comportamiento.
- [ ] Los artefactos del plan y review son consistentes con `STPR_INVARIANTS.md`.
- [ ] Las lecciones reutilizables se capturaron en el template solo cuando son genéricas.
- [ ] Los artefactos de review viven en `.stpr/review/` y se mantienen reutilizables.

## Verificación final

- [ ] La implementación no repite deuda técnica del proyecto cuando existe una referencia buena en el template.
- [ ] No se introdujeron reglas específicas de otra feature no relacionada.
- [ ] El resultado sigue siendo un código coherente con Clean Architecture + Tauri v2 + React.

---

**Recursos:** `AGENTS.md`, `.stpr/README.md`, `.stpr/template/README.md`, `.stpr/template/STPR_INVARIANTS.md`.