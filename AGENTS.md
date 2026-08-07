# Agent Rules — Economía Casera

This file contains rules and conventions for AI coding assistants working on this repository.

## Repository Context

- Economía Casera is a desktop expenses/income tracker built with Tauri v2, React, TypeScript, SQLite and optional Google Drive sync.
- Public repository: `git@github.com:RoberPombo/Econom-aCasera.git`
- License: MIT

## Branching Rules

- **Never push directly to `main`.** `main` is protected and should only be updated through reviewed pull requests.
- Default development branch is `develop`.
- Create feature branches from `develop` using the naming convention:
  - `feature/<short-description>`
  - `fix/<short-description>`
  - `refactor/<short-description>`
  - `docs/<short-description>`
- Open pull requests targeting `develop`.
- Releases are promoted from `develop` to `main` via a pull request.
- After a release is published, merge `main` back into `develop` so `develop` keeps the updated `package.json`, `CHANGELOG.md` and version tag.

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/) in **English** so `release-please` can calculate versions automatically.

Allowed types:

- `feat:` new feature (minor bump)
- `fix:` bug fix (patch bump)
- `docs:` documentation only
- `style:` formatting, no logic change
- `refactor:` code change that neither fixes a bug nor adds a feature
- `perf:` performance improvement
- `test:` adding or correcting tests
- `chore:` maintenance tasks
- `ci:` CI/CD changes
- `build:` build system changes
- `revert:` reverting a previous commit

For breaking changes use either:

```text
feat!: new auth flow breaks old API
```

or add a footer:

```text
feat: new auth flow

BREAKING CHANGE: old token format is no longer accepted
```

## Architecture Rules

The application follows Clean Architecture.

### Frontend (TypeScript + React)

- `src/domain/` — entities, repository interfaces and use cases
- `src/data/` — Tauri-specific repository implementations (SQLite, filesystem, updater)
- `src/presentation/` — React components, hooks, context and pages
- `src/CompositionRoot.ts` — dependency injection root

Rules:

- Use cases and components must not instantiate API repositories directly.
- Always consume repositories through `CompositionRoot` and the React context (`AppProvider` / `useAppContext`).
- Keep UI components free of business logic; logic belongs in hooks or use cases.
- SQLite access is done through `@tauri-apps/plugin-sql` from the data layer.
- Filesystem operations (Google Drive sync, backups) are done through Tauri commands invoked from the data layer.

### Rust (Tauri backend)

- `src-tauri/src/commands.rs` — Tauri commands exposed to the frontend
- `src-tauri/src/lib.rs` — plugin initialization and command registration
- `src-tauri/Cargo.toml` — Rust dependencies
- `src-tauri/tauri.conf.json` — Tauri configuration

Rules:

- Commands are small adapters that call Rust standard library functions.
- Business logic should stay in the TypeScript domain/use case layers whenever possible.
- File paths are resolved using `app.path().app_data_dir()` and `dirs::home_dir()`.

For detailed frontend guidance invoke the skill `clean-architecture-frontend`.

## Testing Rules

When writing or refactoring frontend tests, invoke the skill `testing-frontend`.

### TDD

- New implementation must be written test-first (Red-Green-Refactor): write a failing test, run it to confirm it fails, then implement the minimal code to make it pass.
- Characterization tests (existing behavior) are the exception and do not need a prior failing run.
- Run the test once after writing it, before and after the implementation change.

### Test writing

- Stack: Vitest, jsdom, React Testing Library, jest-dom.
- Domain tests go in `src/domain/__tests__/`; data-layer tests go in `src/data/__tests__/`; component/hook tests go in `src/presentation/__tests__/`.
- Use the shared in-memory fakes from `src/tests/fakes/repositories.ts`; do not duplicate fake implementations per spec or hit the real backend.
- Structure every test in AAA blocks separated by a blank line: setup → execution → validation (`const result = await useCase.execute(...)`). Tests with no setup or execution may skip those blocks.
- Test names and descriptions in English; `describe`/`test`; prefer `screen.getByRole`, `getByLabelText` and `userEvent` over test IDs.
- Unit tests must stay green and increase (or at least keep) coverage. Check with:

```bash
npm run test
npm run test:coverage
npm run lint
```

Run them before committing.

## Release Rules

- Releases are handled automatically by `release-please`.
- Do not manually edit `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` version or `CHANGELOG.md` except through the release PR.
- Do not create GitHub releases or tags manually.
- The release workflow is:
  1. Merge feature PRs into `develop`.
  2. Open a PR from `develop` to `main`.
  3. `release-please` creates/updates the release PR on `main`.
  4. Review and merge the release PR.
  5. Binaries are built and attached automatically by `.github/workflows/tauri-release.yml`.
  6. Merge `main` back into `develop`.

## Security Rules

- Never commit secrets, API keys, tokens or personal credentials.
- Do not add repository secrets unless explicitly requested.
- Use `GITHUB_TOKEN` only; it is provided automatically with the permissions declared in each workflow.
- Avoid executing untrusted scripts or installing packages outside the workspace.
- The Tauri signing private key (`src-tauri/tauri.key`) must never be committed. It is ignored by `.gitignore`.

## Communication Rules

- Respond to the user in **Spanish** unless asked otherwise.
- Code, comments and commit messages should generally be in **English**.
- Documentation for end users (`README.md`) is in **Spanish**.

## Build and Run Commands

```bash
# Install dependencies
pnpm install

# Development
cargo tauri dev

# Build production bundles
cargo tauri build
```

## Useful Project Files

- `src/CompositionRoot.ts`
- `src/presentation/App.tsx`
- `src/domain/`
- `src/data/`
- `src-tauri/src/commands.rs`
- `src-tauri/tauri.conf.json`
- `.github/workflows/release-please.yml`
- `.github/workflows/tauri-release.yml`
- `.github/workflows/pr-check.yml`
- `.release-please-config.json`
- `.release-please-manifest.json`
