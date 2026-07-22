# Gastos e Ingresos

Aplicación de escritorio para llevar el control de gastos e ingresos anuales. Funciona localmente, guarda los datos en SQLite y permite hacer copias de seguridad en Google Drive.

## Características

- **Vista mensual y anual** con selector de año y mes.
- **Datepicker nativo** para seleccionar la fecha del movimiento.
- **Categorías configurables** para ingresos y gastos.
- **Importación desde Excel**: una hoja por mes (Ene., Feb., ...) con la tabla de transacciones.
- **Resumen mensual y anual** con totales por categoría.
- **Backup y restore en Google Drive**.
- **Ejecutable con doble click**: no requiere conocimientos técnicos para usarlo.

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

## Google Drive

Para activar el backup en Google Drive:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un nuevo proyecto.
3. Habilita la **Google Drive API**.
4. Ve a **Credenciales** → **Crear credenciales** → **ID de cliente de OAuth**.
5. Selecciona **Aplicación de escritorio**.
6. Copia el **Client ID** y pégalo en la aplicación, en la sección de Google Drive.
7. Pulsa **Conectar con Google**, autoriza desde tu navegador y ya podrás subir/restaurar copias.

## Datos almacenados

- La base de datos SQLite se guarda en el directorio de datos del usuario:
  - Windows: `%APPDATA%\Gastos\gastos.db`
  - macOS: `~/Library/Application Support/Gastos/gastos.db`
  - Linux: `~/.local/share/Gastos/gastos.db`

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
│   │   ├── DriveSection.tsx
│   │   └── ImportExcel.tsx
│   └── index.html
├── src/               # Backend Bun
│   ├── server.ts      # Servidor HTTP + API + importación Excel
│   ├── db.ts          # SQLite + migraciones
│   ├── drive.ts       # Google Drive OAuth
│   ├── utils.ts       # Rutas de datos
│   └── types.ts       # Tipos compartidos
├── dist/              # Frontend compilado y ejecutables
├── scripts/           # Scripts de compilación
├── iniciar.sh         # Inicio rápido Linux/Mac
├── iniciar.bat        # Inicio rápido Windows
└── README.md
```
