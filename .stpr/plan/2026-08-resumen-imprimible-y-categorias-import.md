# Propuesta de cambio: resumen imprimible y categorías en importación

## Cambio

Resumen en modal con gráfica mensual imprimible/PDF y selector de categorías en la previsualización de importación.

## Objetivo

- El bloque «Resumen» empuja el contenido de la vista principal y descoloca el flujo de trabajo diario. Se traslada a un modal accesible desde un icono nuevo del header (entre Importar y Configuración).
- El modal añade una gráfica de barras agrupadas (INGRESOS / GASTOS / AHORRO por mes + TOTALES) equivalente a la pestaña «Global» de «ECONOMIA CASERA 2016 (1).xlsx», y permite imprimir o exportar a PDF (diálogo nativo `window.print()`, que en Tauri permite «Guardar como PDF»).
- En la previsualización de importación la categoría es texto libre y se escriben claves inconsistentes. Se convierte en un selector con las categorías de configuración, las opciones heredadas de la hoja Global y una opción de «nueva categoría» que se crea automáticamente en la configuración al guardar si no existe.

## Alcance

- Header: nuevo icono «Resumen» entre «Importar» y «Configuración».
- Nuevo modal de resumen anual: gráfica mensual, desglose por categorías, tabla mensual y tabla anual; navegación de año; botón imprimir/PDF.
- `useAppState`: carga bajo demanda del resumen anual (`GetSummaryUseCase.executeByYearAndMonth`).
- Hoja de estilos: reglas `@media print` para imprimir solo el área del resumen con paleta clara.
- `ImportView`: prop `categories` (de configuración); selector de categoría por fila (ingresos/gastos + «Nueva categoría…» con campo de texto); alta automática de categorías nuevas al guardar.

## Clasificación de capacidades

- Resumen anual -> caso de uso existente (`GetSummaryUseCase.executeByYearAndMonth`) -> sin cambios en dominio.
- Gráfica mensual -> componente/hook -> `BalanceChart` como referencia de gráfica SVG con tema.
- Modal de resumen -> componente/hook -> `Modal` + `SummaryBreakdown` como referencia de contenido y maquetación.
- Impresión/PDF -> flujo de UI -> `window.print()` + CSS `@media print` (sin dependencias nuevas).
- Categorías en importación -> componente/hook -> `ImportView` (fila editable existente) y contrato de repositorio `ImportRepository.addCategories` reutilizado.

## Mapeo a template canónico

- Gráfica SVG -> `src/presentation/components/BalanceChart.tsx` -> gráfica SVG existente con variables de tema.
- Modal -> `src/presentation/components/Modal.tsx` -> contenedor modal reutilizable.
- Resumen -> `src/presentation/components/SummaryBreakdown.tsx` -> contenido del resumen ya existente (categorías, mensual, anual).
- Añadir categorías -> `TauriImportRepository.addCategories` -> idempotente por clave normalizada; se reutiliza para las categorías nuevas tecleadas.

## Entradas y salidas

- Entrada: clic en el nuevo icono del header; clic en «Imprimir / PDF».
- Entrada: edición de la fila de previsualización (selector de categoría, texto de nueva categoría).
- Salida: modal de resumen con gráfica y tablas; diálogo de impresión del sistema.
- Salida: al guardar importaciones, las categorías nuevas se insertan en `categories` (label, key, type, active=1) y se informa del número añadido.

## Reglas de negocio

- El resumen del modal corresponde al año seleccionado (por defecto, el año corriente de configuración); meses sin datos aparecen con valor 0 (como en la hoja Global).
- La serie «AHORRO» de la gráfica es el balance mensual (ingresos − gastos), igual que en la hoja Global (INGRESO − GASTO).
- En el selector de categoría, se prefiere la categoría de configuración; si la categoría del archivo no existe, se preselecciona «Nueva categoría…» con el texto original del archivo.
- Al guardar, las categorías nuevas (normalizadas por clave; ingreso → income; gasto/ahorro → expense) se crean antes de insertar movimientos; `addCategories` es idempotente por clave.
- La impresión cubre solo el contenido del resumen: en `@media print` se oculta el resto de la app y se fuerza la paleta clara.

## Estado y mutabilidad

- Nuevo estado local en `useAppState`: `report` (resumen anual cargado bajo demanda) — solo lectura sobre la base de datos.
- Muta datos locales: creación de categorías nuevas durante la confirmación de importación (no toca Google Drive).
- No cambian esquema, validaciones del dominio ni contratos de repositorio; `SummaryBreakdown` y `BalanceChart` permanecen sin cambios.

## Estrategia de tests

- `ImportView.spec.tsx`: selector de categorías existentes, preselección de «Nueva categoría…», auto-alta de categoría nueva al guardar, no auto-alta cuando la categoría ya existe.
- `App.spec.tsx`: apertura/cierre del modal de resumen desde el nuevo icono; botón de impresión llama a `window.print`.
- Test nuevo del gráfico mensual (barras, leyenda, TOTALES).
- `npm run test`, `npm run test:coverage`, `npm run lint` antes de commit.