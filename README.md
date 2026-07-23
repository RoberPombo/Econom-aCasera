# Economía Casera

Aplicación de escritorio para llevar el control de gastos e ingresos anuales. Funciona localmente, guarda los datos en SQLite y se sincroniza automáticamente con Google Drive si está instalado.

## Características

- **Vista mensual y anual** con selector de año y mes.
- **Datepicker nativo** para seleccionar la fecha del movimiento.
- **Categorías configurables** para ingresos y gastos.
- **Importación desde Excel**: una hoja por mes (Ene., Feb., ...) con la tabla de transacciones.
- **Resumen mensual y anual** con totales por categoría.
- **Sincronización automática con Google Drive** si el usuario lo tiene instalado.
- **Detección de conflictos** si los datos cambian en otro dispositivo, con opción de recargar o sobrescribir.
- **Copia de seguridad local** si no hay Google Drive.
- **Ejecutable con doble click**: no requiere conocimientos técnicos para usarlo.

## Cómo funciona el almacenamiento

La app detecta automáticamente si el usuario tiene Google Drive instalado:

### Si tiene Google Drive

- La base de datos se guarda dentro de `Google Drive/EconomiaCasera/economiacasera.db`.
- Cada cambio se persiste directamente en esa carpeta, así que Drive lo sincroniza.
- También se mantiene una copia de seguridad local por si Drive no está disponible temporalmente.
- **Si abres la app en dos PCs con la misma cuenta de Google Drive, los datos se sincronizan.**
  - Si la app detecta que los datos han cambiado en otro dispositivo, muestra un diálogo para elegir entre:
    - **Recargar datos remotos**: usar la versión de Google Drive (pierdes cambios locales no guardados).
    - **Usar mis datos locales**: sobrescribir la versión de Google Drive con tus datos.

### Si no tiene Google Drive

- La base de datos se guarda en el directorio de datos del usuario:
  - Windows: `%APPDATA%\EconomiaCasera\economiacasera.db`
  - macOS: `~/Library/Application Support/EconomiaCasera/economiacasera.db`
  - Linux: `~/.local/share/EconomiaCasera/economiacasera.db`
- Se mantiene una copia de seguridad en `~/EconomiaCasera/backup/economiacasera_backup.db`.

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
├── economiacasera          (Linux/Mac) o economiacasera.exe (Windows)
└── dist/                   (archivos del frontend)
```

Para distribuir, copia toda la carpeta `dist/release/` y el usuario solo tiene que hacer doble click en `economiacasera` o `economiacasera.exe`.

## Compilar para otras plataformas desde tu sistema

Con Bun puedes hacer cross-compilation:

```bash
# Windows desde Linux/Mac
bun build --compile --target=bun-windows-x64 src/server.ts --outfile dist/economiacasera.exe

# Linux
bun build --compile --target=bun-linux-x64 src/server.ts --outfile dist/economiacasera

# macOS Apple Silicon
bun build --compile --target=bun-darwin-arm64 src/server.ts --outfile dist/economiacasera-mac
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

## Versionado y releases

El proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):

- Versiones menores a `1.0.0` durante el desarrollo activo.
- La versión `1.0.0` será la primera estable.
- `feat` → sube la versión menor (ej. `0.1.0` → `0.2.0`).
- `fix` → sube la versión parche (ej. `0.1.0` → `0.1.1`).
- `BREAKING CHANGE` → sube la versión mayor (ej. `0.5.0` → `1.0.0`).

### Cómo se crean las releases

El repositorio usa [`release-please`](https://github.com/googleapis/release-please-action):

1. Cada vez que se hace merge a `main`, `release-please` abre (o actualiza) un PR de release.
2. Ese PR actualiza automáticamente:
   - `package.json` con la nueva versión.
   - `CHANGELOG.md` con los cambios agrupados por tipo.
3. Revisas el PR, y si todo está correcto, lo merges.
4. Al mergear el PR de release:
   - Se crea el tag y la release en GitHub.
   - Se dispara el workflow `.github/workflows/release-binaries.yml`.
   - Ese workflow compila y adjunta los binarios para Linux, Windows y macOS.

### Commits para que release-please calcule bien la versión

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add monthly summary chart
fix: correct category totals in annual view
docs: update README with import examples
refactor: simplify transaction repository
test: add use case tests for import
BREAKING CHANGE: rename API endpoint for transactions
```

### Compilar localmente con una versión concreta

```bash
APP_VERSION=1.2.3 ./scripts/build.sh
```

En Windows:

```batch
set APP_VERSION=1.2.3
scripts\build.bat
```

## Actualizaciones automáticas en la app

La aplicación, al arrancar, consulta la última release pública de GitHub. Si detecta una versión nueva, muestra un diálogo con la opción de descargar e instalar la actualización. El proceso reinicia la aplicación con el nuevo ejecutable.

## Seguridad del repositorio

El repositorio incluye configuración para reducir riesgos:

- `.github/settings.yml`: reglas de protección de `main` (requiere PR, review, status checks). Requiere instalar la app [Probot Settings](https://github.com/apps/settings) en el repo.
- Los workflows usan `permissions` mínimas y `persist-credentials: false`.
- Los workflows no se ejecutan en forks (`if: github.event.repository.fork == false`).

### Configuración manual recomendada en GitHub

Si no usas Probot Settings, configura esto en la web de GitHub:

1. **Settings > Branches > Add rule**
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require status checks to pass: `PR Checks`
   - ✅ Require branches to be up to date before merging
   - ✅ Restrict pushes that create files larger than... (opcional)
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict who can push to matching branches: solo owners/maintainers

2. **Settings > Actions > General**
   - ✅ Require approval for first-time contributors
   - ✅ Require approval for all outside collaborators
   - **Fork pull request workflows**: selecciona *Require approval for first-time contributors* o *Require approval for all outside collaborators*

3. **Settings > Secrets and variables > Actions**
   - No añadir secrets innecesarios. `GITHUB_TOKEN` se genera automáticamente y solo tiene permisos declarados en cada workflow.

4. **Settings > Code security**
   - Habilitar *Dependabot alerts* y *Dependabot security updates*.

## Estructura del proyecto

```
.
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── CompositionRoot.ts
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── index.html
├── src/               # Backend Bun
│   ├── server.ts      # Servidor HTTP + API + importación Excel
│   ├── application/   # Casos de uso y servicios
│   ├── domain/        # Entidades y reglas de negocio
│   ├── infrastructure/# Repositorios SQLite, sincronización Drive/local
│   └── presentation/  # Controladores y rutas HTTP
├── dist/              # Frontend compilado y ejecutables
├── scripts/           # Scripts de compilación
├── .github/           # Workflows y configuración del repo
├── iniciar.sh         # Inicio rápido Linux/Mac
├── iniciar.bat        # Inicio rápido Windows
├── LICENSE            # MIT
└── README.md
```
