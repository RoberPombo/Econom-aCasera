# Agent Rules — Economía Casera

This file contains rules and conventions for AI coding assistants working on this repository.

## Repository Context

- Economía Casera is a desktop expenses/income tracker built with Bun, React, TypeScript, SQLite and optional Google Drive sync.
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

### Backend

Follow Clean Architecture layers:

- `src/domain/` — entities and repository interfaces (no external dependencies)
- `src/application/` — use cases and domain services
- `src/infrastructure/` — SQLite repositories, Drive/local sync, file system
- `src/presentation/` — HTTP controllers/routes
- Dependencies point inward only.

### Frontend

Follow Clean Architecture layers:

- `frontend/src/domain/` — entities, repository interfaces, use cases
- `frontend/src/data/` — API repository implementations
- `frontend/src/presentation/` — React components, hooks, context, pages
- `frontend/src/CompositionRoot.ts` — dependency injection root

Rules:

- Use cases and components must not instantiate API repositories directly.
- Always consume repositories through `CompositionRoot` and the React context (`AppProvider` / `useAppContext`).
- Keep UI components free of business logic; logic belongs in hooks or use cases.

For detailed guidance invoke the skill `clean-architecture-frontend`.

## Testing Rules

### Backend

- Unit-test domain entities and use cases.
- Use in-memory repository implementations for use-case tests.
- Avoid real database or network calls in unit tests.

### Frontend

When writing or refactoring frontend tests, invoke the skill `testing-frontend`.

- Stack: Vitest, jsdom, React Testing Library, jest-dom.
- Domain tests go in `frontend/src/domain/__tests__/`.
- Component/hook tests go in `frontend/src/presentation/__tests__/`.
- Use in-memory fakes for repositories; do not hit the real backend in unit tests.
- Prefer `screen.getByRole`, `getByLabelText` and `userEvent` over test IDs.

Run tests before committing:

```bash
cd frontend && bun run test
```

## Release Rules

- Releases are handled automatically by `release-please`.
- Do not manually edit `package.json` version or `CHANGELOG.md` except through the release PR.
- Do not create GitHub releases or tags manually.
- The release workflow is:
  1. Merge feature PRs into `develop`.
  2. Open a PR from `develop` to `main`.
  3. `release-please` creates/updates the release PR on `main`.
  4. Review and merge the release PR.
  5. Binaries are built and attached automatically by `.github/workflows/release-binaries.yml`.
  6. Merge `main` back into `develop`.

## Security Rules

- Never commit secrets, API keys, tokens or personal credentials.
- Do not add repository secrets unless explicitly requested.
- Use `GITHUB_TOKEN` only; it is provided automatically with the permissions declared in each workflow.
- Avoid executing untrusted scripts or installing packages outside the workspace.

## Communication Rules

- Respond to the user in **Spanish** unless asked otherwise.
- Code, comments and commit messages should generally be in **English**.
- Documentation for end users (`README.md`) is in **Spanish**.

## Build and Run Commands

```bash
# Install dependencies
bun install
cd frontend && bun install

# Development
bun run dev

# Build frontend
cd frontend && bun run build

# Compile desktop executable
bun run package        # uses scripts/build.sh
```

## Useful Project Files

- `frontend/src/CompositionRoot.ts`
- `frontend/src/presentation/App.tsx`
- `frontend/src/domain/`
- `frontend/src/data/`
- `frontend/vitest.config.ts`
- `.github/workflows/release-please.yml`
- `.github/workflows/release-binaries.yml`
- `.github/workflows/pr-check.yml`
- `.release-please-config.json`
- `.release-please-manifest.json`
