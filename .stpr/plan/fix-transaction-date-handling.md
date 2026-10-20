# Fix transaction date handling

## Cambio

Corregir la fecha inicial y la fecha efectiva de los gastos.

## Objetivo

Al crear un gasto, mostrar hoy como fecha inicial y conservar la fecha elegida en su periodo correcto.

## Alcance

- Inicialización de fecha en `TransactionForm`.
- Derivación de año/mes en `Transaction` al crear o cambiar la fecha.
- Tests de formulario y entidad.

## Clasificación de capacidades

- Fecha inicial -> componente de presentación -> `src/presentation/components/TransactionForm.tsx`.
- Periodo de transacción -> entidad -> `src/domain/entities/Transaction.ts`.

## Mapeo a template canónico

- Transacción -> `.stpr/template/src/domain/entities/Transaction.ts` -> referencia de entidad existente.
- Formulario -> implementación y tests existentes de `TransactionForm` -> referencia local más cercana; el template no incluye componentes de formulario.

## Entradas y salidas

- El formulario usa la fecha local actual al crear; al editar conserva la fecha existente.
- Crear o cambiar una fecha ISO mantiene su año/mes y día en vez de desplazarlos por zona horaria o conservar un periodo anterior.

## Reglas de negocio

- La fecha inicial de una nueva transacción es hoy en hora local.
- Al cambiar la fecha, año y mes derivados corresponden a esa fecha salvo que se proporcionen explícitamente.

## Estado y mutabilidad

- No cambia esquema ni persistencia; modifica estado del formulario y datos de transacción antes de persistir.

## Estrategia de rama

- Continuar en la rama actual, sin cambiar de rama.

## Dependencias externas

- Ninguna.

## Modelo de errores

- Se mantienen los errores de validación existentes.

## Impacto en documentación

- No requiere documentación de usuario.

## Disciplina de implementación

- Slice único: pruebas de fecha inicial y periodo; después implementación mínima y verificación.

## Verificación mínima

- Specs de `TransactionForm` y `Transaction`.
- `pnpm test`, `pnpm test:coverage` y `pnpm lint`.

## Fuera de alcance

- Cambios de esquema, importación y presentación de fechas fuera del formulario/listado existente.

## Notas

- No cambia el patrón canónico de entidad; no requiere sincronizar copias del template.
