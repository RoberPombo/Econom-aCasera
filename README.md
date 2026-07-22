# Gastos e Ingresos

Aplicación de escritorio para llevar el control de gastos e ingresos anuales. Funciona localmente, guarda los datos en SQLite y se sincroniza automáticamente con Google Drive si está instalado.

## Características

- **Vista mensual y anual** con selector de año y mes.
- **Datepicker nativo** para seleccionar la fecha del movimiento.
- **Categorías configurables** para ingresos y gastos.
- **Importación desde Excel**: una hoja por mes (Ene., Feb., ...) con la tabla de transacciones.
- **Resumen mensual y anual** con totales por categoría.
- **Sincronización automática con Google Drive** si el usuario lo tiene instalado.
- **Copia de seguridad local** si no hay Google Drive.
- **Ejecutable con doble click**: no requiere conocimientos técnicos para usarlo.

## Cómo funciona el almacenamiento

La app detecta automáticamente si el usuario tiene Google Drive instalado:

### Si tiene Google Drive
- La base de datos se guarda dentro de `Google Drive/Gastos/gastos.db`.
- Cada cambio se persiste directamente en esa carpeta, así que Drive lo sincroniza.
- También se mantiene una copia de seguridad local por si Drive no está disponible temporalmente.
- **Si abres la app en dos PCs con la misma cuenta de Google Drive, los datos se sincronizan.**
  - Importante: no edites al mismo tiempo en los dos PCs, porque podrían generarse conflictos en Drive.

### Si no tiene Google Drive
- La base de datos se guarda en el directorio de datos del usuario:
  - Windows: `%APPDATA%\Gastos\gastos.db`
  - macOS: `~/Library/Application Support/Gastos/gastos.db`
  - Linux: `~/.local/share/Gastos/gastos.db`
- Se mantiene una copia de seguridad en `~/Gastos/backup/gastos_backup.db`.

## Tecnología

- **Frontend:** React + TypeScript + Vite
- **Backend:** Bun (TypeScript) + API REST + `bun:sqlite`
- **Empaquetado:** `bun build --compile` para generar un ejecutable con doble click

## Requisitos para desarrollar

- [Bun](https://bun.sh/) instalado

## Instalación de dependencias

```bash
bun install
cd frontend
bun install
```

## Ejecutar en desarrollo

```bash
bun run dev
```

O hacer doble click en:

- Linux/Mac: `iniciar.sh`
- Windows: `iniciar.bat`

## Compilar ejecutable para distribución

### Linux/Mac

```bash
./scripts/build.sh
```

### Windows

```batch
scripts\build.bat
```

El resultado estará en `dist/release/`:

```
dist/release/
├── gastos          (Linux/Mac) o gastos.exe (Windows)
└── dist/           (archivos del frontend)
```

Para distribuir, copia toda la carpeta `dist/release/` y el usuario solo tiene que hacer doble click en `gastos` o `gastos.exe`.

## Compilar para otras plataformas desde tu sistema

Con Bun puedes hacer cross-compilation:

```bash
# Windows desde Linux/Mac
bun build --compile --target=bun-windows-x64 src/server.ts --outfile dist/gastos.exe

# Linux
bun build --compile --target=bun-linux-x64 src/server.ts --outfile dist/gastos

# macOS Apple Silicon
bun build --compile --target=bun-darwin-arm64 src/server.ts --outfile dist/gastos-mac
```

No olvides copiar la carpeta `dist/` (frontend) junto al ejecutable.

## Importar desde Excel

La app espera un archivo `.xlsx` con:

- Una hoja por mes, llamada `Ene.`, `Feb.`, `Mar.`, `Abr.`, `May.`, `Jun.`, `Jul.`, `Ago.`, `Sep.`, `Oct.`, `Nov.`, `Dic.`.
- En cada hoja, una tabla de transacciones con las columnas:
  - **INGRESO / GASTO**: categoría del movimiento.
  - **TIPO**: indica si es ingreso o gasto (opcional, se infiere de la categoría).
  - **DIA**: día del mes.
  - **MES**: mes (opcional, se toma de la hoja).
  - **AÑO**: año (por defecto 2016 si no se indica).
  - **EUROS**: importe.
  - **DESCRIPCIÓN**: concepto del movimiento.

## Estructura del proyecto

```
.
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── MonthlyView.tsx
│   │   ├── AnnualView.tsx
│   │   ├── CategoriesConfig.tsx
│   │   ├── ImportExcel.tsx
│   │   └── ...
│   └── index.html
├── src/               # Backend Bun
│   ├── server.ts      # Servidor HTTP + API + importación Excel
│   ├── db.ts          # SQLite + sincronización Drive/local
│   ├── utils.ts       # Detección de Google Drive y rutas
│   └── types.ts       # Tipos compartidos
├── dist/              # Frontend compilado y ejecutables
├── scripts/           # Scripts de compilación
├── iniciar.sh         # Inicio rápido Linux/Mac
├── iniciar.bat        # Inicio rápido Windows
└── README.md
```
