# Economía Casera

Aplicación de escritorio para llevar el control de gastos e ingresos anuales. Funciona localmente, guarda los datos en SQLite y se sincroniza automáticamente con Google Drive si está instalado.

## Características

- **Vista por mes o por rango de fechas**, con filtros por tipo, categoría, persona e importe.
- **Buscador global** de movimientos (concepto, categoría y persona).
- **Gráficas** que respetan los filtros activos.
- **Foto del ticket** en gastos (archivo, arrastrar o pegar), con copia en backup y Drive.
- **Selector de fechas**: input nativo para la fecha del movimiento y datepicker de rango en los filtros.
- **Categorías y personas configurables**.
- **Importación de movimientos**: Excel histórico, ING (`.xls`) y Abanca (CSV).
- **Resumen mensual y anual** con totales filtrados.
- **Sincronización con Google Drive** si el usuario lo tiene instalado.
- **Detección de conflictos** si los datos cambian en otro dispositivo, con opción de recargar o sobrescribir.
- **Copia de seguridad local** de la base de datos y de las fotos de tickets.
- **Instaladores nativos** para Linux, Windows y macOS (menú de aplicaciones).

## Instalación (usuario final)

Descarga el instalador de la [última release](https://github.com/RoberPombo/Econom-aCasera/releases/latest) según tu sistema:

| Sistema | Archivo recomendado | Dónde queda instalada | Menú de aplicaciones |
|---------|---------------------|------------------------|----------------------|
| **Linux (Debian/Ubuntu)** | `.deb` | `/usr/bin` + datos de app del usuario | Sí (entrada `.desktop`) |
| **Linux (Fedora/openSUSE)** | `.rpm` | rutas del paquete del sistema | Sí |
| **Linux (portable)** | `.AppImage` | donde la dejes | No automático |
| **Windows** | instalador NSIS (`.exe`) o `.msi` | carpeta de usuario / Program Files | Sí (menú Inicio) |
| **macOS (Apple Silicon)** | `.dmg` | arrastra a `/Applications` | Sí (Launchpad) |

### Linux

```bash
# Debian / Ubuntu
sudo dpkg -i EconomiaCasera_*.deb

# Fedora / openSUSE
sudo rpm -i EconomiaCasera-*.rpm
```

Después busca **EconomiaCasera** en el menú de aplicaciones.

### Windows

Ejecuta el instalador `.exe` (NSIS) o `.msi` y sigue el asistente. La app aparecerá en el menú Inicio.

### macOS

Abre el `.dmg`, arrastra **EconomiaCasera** a **Aplicaciones** y ábrela desde Launchpad o `/Applications`.

> **Nota:** las builds de CI de macOS se generan para Apple Silicon (`aarch64`). macOS Intel puede requerir build local.

## Cómo funciona el almacenamiento

La base de datos activa vive siempre en el directorio de datos de la aplicación. Si hay Google Drive, se copia allí (junto con las fotos de tickets) para sincronizar entre equipos.

### Rutas locales (base de datos y tickets)

- **Windows:** `%APPDATA%\com.economiacasera.app\` (o el `app_data_dir` de Tauri)
- **macOS:** `~/Library/Application Support/com.economiacasera.app\`
- **Linux:** `~/.local/share/com.economiacasera.app\`

Ficheros relevantes:

- `economiacasera.db` — base de datos SQLite
- `receipts/` — fotos de tickets de gastos

### Copia de seguridad local

- `~/EconomiaCasera/backup/economiacasera_backup.db`
- `~/EconomiaCasera/backup/receipts/`

### Si tiene Google Drive

- Copia en `Google Drive/EconomiaCasera/economiacasera.db`
- Fotos en `Google Drive/EconomiaCasera/receipts/`
- Tras cada cambio se sincroniza la DB y la carpeta de tickets.
- Al sobrescribir los datos remotos con los locales se escribe `Google Drive/EconomiaCasera/sync.json` como marcador de sincronización.
- **Si abres la app en dos PCs con la misma cuenta de Google Drive, los datos se sincronizan.**
  - Si la app detecta que los datos han cambiado en otro dispositivo, muestra un diálogo para elegir entre:
    - **Recargar datos remotos**: usar la versión de Google Drive.
    - **Usar mis datos locales**: sobrescribir la versión de Google Drive con tus datos.

## Tecnología

- **Frontend:** React + TypeScript + Vite
- **Backend nativo:** Rust (Tauri v2)
- **Base de datos:** SQLite a través de `tauri-plugin-sql`
- **Empaquetado:** Tauri genera ejecutables nativos para Linux, Windows y macOS

## Requisitos para desarrollar

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install)
- Dependencias del sistema para Tauri: https://tauri.app/start/prerequisites/

## Instalación de dependencias

```bash
pnpm install
```

## Ejecutar en desarrollo

```bash
cargo tauri dev
```

## Compilar ejecutable para distribución

```bash
cargo tauri build
```

El resultado estará en `src-tauri/target/release/bundle/`:

```
src-tauri/target/release/bundle/
├── deb/                  # Linux Debian/Ubuntu
├── rpm/                  # Linux Fedora/openSUSE
├── appimage/             # Linux AppImage
├── msi/                  # Windows instalador
├── dmg/                  # macOS imagen de disco
└── ...
```

Para distribuir, usa los instaladores generados:

- **Linux:** preferir `.deb` / `.rpm` (menú de apps). `.AppImage` es portable.
- **Windows:** NSIS (`.exe`) o `.msi` (acceso directo en menú Inicio).
- **macOS:** `.dmg` → copiar a `/Applications`.

Los artefactos de actualización (`createUpdaterArtifacts`) se firman en CI cuando está configurada `TAURI_SIGNING_PRIVATE_KEY`.

## Importar movimientos

La app ofrece tres fuentes de importación. En todas ellas se muestra una vista previa editable para revisar y corregir los movimientos antes de guardarlos, y se detectan duplicados automáticamente.

### Excel histórico

Espera un archivo `.xlsx` con:

- Una hoja por mes, llamada `Ene.`, `Feb.`, ..., `Dic.` (opcionalmente también una hoja `Global` con las categorías de ingresos y gastos).
- En cada hoja, una tabla de transacciones con las columnas:
  - **INGRESO / GASTO**: indica si el movimiento es ingreso o gasto.
  - **CATEGORÍA**: categoría del movimiento.
  - **DIA**: día del mes.
  - **MES**: mes (opcional, se toma de la hoja).
  - **AÑO**: año (por defecto 2016 si no se indica).
  - **EUROS** (columnas K-M): importe.
  - **DESCRIPCIÓN**: concepto del movimiento.

### ING (Excel)

Importa la hoja de movimientos exportada desde la banca online de ING (`.xls` con columnas `F VALOR` / `FECHA VALOR` e `IMPORTE`).

### Abanca (CSV)

Importa el CSV de movimientos de Abanca: separador `;`, fechas con formato `DD-MM-YYYY` y cabecera con las columnas `FECHA`, `CONCEPTO`, `SALDO` e `IMPORTE`. Las categorías se asignan automáticamente según el concepto y se pueden corregir en la vista previa.

## Versionado y releases

El proyecto sigue [Semantic Versioning](https://semver.org/lang/es/):

- La versión `1.0.0` (agosto 2026) es la primera versión estable.
- `feat` → sube la versión menor (ej. `1.0.0` → `1.1.0`).
- `fix` → sube la versión parche (ej. `1.0.0` → `1.0.1`).
- `BREAKING CHANGE` → sube la versión mayor (ej. `1.0.0` → `2.0.0`).

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

Edita `src-tauri/tauri.conf.json` y cambia el campo `version` antes de compilar:

```bash
cargo tauri build
```

Para releases oficiales, la versión se actualiza automáticamente mediante `release-please`.

## Actualizaciones automáticas en la app

La aplicación, al arrancar, consulta la última release pública de GitHub. Si detecta una versión nueva, muestra un diálogo con la opción de descargar e instalar la actualización. El proceso reinicia la aplicación con el nuevo ejecutable.

## Seguridad del repositorio

El repositorio incluye configuración para reducir riesgos:

- **Rulesets de GitHub** (`Settings > Rules`): protección de `main` y `develop` (requiere PR, 1 review, status check `PR Checks`, sin force-push).
- **Dependabot** (`.github/dependabot.yml`) para dependencias de npm, cargo y GitHub Actions, y **CodeQL** (`.github/workflows/codeql.yml`) para escaneo estático.
- Los workflows usan `permissions` mínimas y `persist-credentials: false`; las actions están fijadas por SHA.
- Los workflows no se ejecutan en forks (`if: github.event.repository.fork == false`).
- `.github/settings.yml` es opcional y solo aplica si se instala la app [Probot Settings](https://github.com/apps/settings); los rulesets nativos no la requieren.

### Configuración manual recomendada en GitHub

1. **Settings > Rules > Rulesets**
   - `main` y `develop`: *Require a pull request before merging* con 1 approval, *Dismiss stale pull request approvals when new commits are pushed*, *Require status checks to pass* con `PR Checks` (para `main`) y bloquear force-push y eliminación de ramas.
   - Estado deseado de los checkboxes: ✅ Require a pull request · ✅ Require approvals: 1 · ✅ Dismiss stale approvals · ✅ Require status checks (`PR Checks`) · ✅ No force-pushes ni deletions.

2. **Settings > Actions > General**
   - ✅ Require approval for first-time contributors
   - ✅ Require approval for all outside collaborators
   - **Fork pull request workflows**: selecciona *Require approval for first-time contributors* o *Require approval for all outside collaborators*

3. **Settings > Secrets and variables > Actions**
   - No añadir secrets innecesarios. `GITHUB_TOKEN` se genera automáticamente y solo tiene permisos declarados en cada workflow. Para firmar actualizaciones se usan `TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

4. **Settings > Code security**
   - Habilitar *Dependabot alerts* y *Dependabot security updates*.

## Estructura del proyecto

```
.
├── src/               # Frontend React + TypeScript
│   ├── main.tsx
│   ├── CompositionRoot.ts
│   ├── data/          # Repositorios Tauri (SQLite, filesystem, updater)
│   ├── domain/        # Entidades y casos de uso
│   └── presentation/  # Componentes React, hooks y contexto
├── src-tauri/         # Rust + configuración Tauri
├── index.html
├── package.json
├── vite.config.ts
├── .github/           # Workflows y configuración del repo
├── LICENSE            # MIT
└── README.md
```

