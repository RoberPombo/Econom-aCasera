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
- **Backend nativo:** Rust (Tauri v2)
- **Base de datos:** SQLite a través de `tauri-plugin-sql`
- **Empaquetado:** Tauri genera ejecutables nativos para Linux, Windows y macOS

## Requisitos para desarrollar

- [Node.js](https://nodejs.org/) (LTS)
- [Rust](https://www.rust-lang.org/tools/install)
- Dependencias del sistema para Tauri: https://tauri.app/start/prerequisites/

## Instalación de dependencias

```bash
cd tauri
npm install
```

## Ejecutar en desarrollo

```bash
cd tauri
cargo tauri dev
```

## Compilar ejecutable para distribución

```bash
cd tauri
cargo tauri build
```

El resultado estará en `tauri/src-tauri/target/release/bundle/`:

```
tauri/src-tauri/target/release/bundle/
├── deb/                  # Linux Debian/Ubuntu
├── rpm/                  # Linux Fedora/openSUSE
├── appimage/             # Linux AppImage
├── msi/                  # Windows instalador
├── dmg/                  # macOS imagen de disco
└── ...
```

Para distribuir, usa los archivos `.deb`, `.rpm`, `.AppImage`, `.msi` o `.dmg` generados para cada plataforma.

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
   - Se dispara el workflow `.github/workflows/tauri-release.yml`.
   - Ese workflow compila y adjunta los binarios de Tauri para Linux, Windows y macOS.

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

Edita `tauri/src-tauri/tauri.conf.json` y cambia el campo `version` antes de compilar:

```bash
cd tauri
cargo tauri build
```

Para releases oficiales, la versión se actualiza automáticamente mediante `release-please`.

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
├── tauri/             # Aplicación principal (Tauri v2 + React)
│   ├── src/
│   │   ├── main.tsx
│   │   ├── CompositionRoot.ts
│   │   ├── data/      # Repositorios Tauri (SQLite, filesystem, updater)
│   │   ├── domain/    # Entidades y casos de uso
│   │   └── presentation/  # Componentes React, hooks y contexto
│   ├── src-tauri/     # Rust + configuración Tauri
│   └── index.html
├── frontend/          # Versión anterior (Bun + Vite), conservada como referencia
├── src/               # Backend anterior (Bun), conservado como referencia
├── .github/           # Workflows y configuración del repo
├── LICENSE            # MIT
└── README.md
```

> **Nota:** La versión activa del proyecto es la de `tauri/`. Las carpetas `frontend/` y `src/` contienen la implementación anterior con Bun y se mantienen temporalmente como referencia.

