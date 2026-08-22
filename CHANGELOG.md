# Changelog

## [1.1.0](https://github.com/RoberPombo/Econom-aCasera/compare/v1.0.0...v1.1.0) (2026-08-14)


### Features

* resumen anual imprimible y selector de categorías condicionado al tipo en la importación ([#40](https://github.com/RoberPombo/Econom-aCasera/issues/40)) ([fca756b](https://github.com/RoberPombo/Econom-aCasera/commit/fca756bc184c6667e476d2feca7f0ac1da80468e))


### Bug Fixes

* blindar sanitización de tickets y resetear resumen al cambiar de año ([#42](https://github.com/RoberPombo/Econom-aCasera/issues/42)) ([646f9c5](https://github.com/RoberPombo/Econom-aCasera/commit/646f9c58764ccf2084bd2e7751adca3f0268f425))
* rename tauri package to silence Dependabot false positives ([0cd2fee](https://github.com/RoberPombo/Econom-aCasera/commit/0cd2fee66463c3cd267394013a7d2b958e7d2d4a))
* sanitize receipt image sources for CodeQL ([9d5821e](https://github.com/RoberPombo/Econom-aCasera/commit/9d5821e31a3326bf171c6d9296cb66808a0e57b0))


### Documentation

* **stpr:** add STPR method workflow artifacts ([#35](https://github.com/RoberPombo/Econom-aCasera/issues/35)) ([d2ce409](https://github.com/RoberPombo/Econom-aCasera/commit/d2ce4093632ac69eb859444e57999edb39b66ec2))


### Continuous Integration

* auto-open sync PR from main into develop after release ([#36](https://github.com/RoberPombo/Econom-aCasera/issues/36)) ([cf2c476](https://github.com/RoberPombo/Econom-aCasera/commit/cf2c47622b11bcbe2fec03428124d43197cb1765))


### Chores

* sync main into develop after release v1.0.0 ([c7bee95](https://github.com/RoberPombo/Econom-aCasera/commit/c7bee957ee24696e1188247295ab732d24db3690))
* sync main into develop after release v1.0.0 ([f6a4886](https://github.com/RoberPombo/Econom-aCasera/commit/f6a4886e13d3cf4ac314d6ed4e9ad4ffa640db75))

## [1.0.0](https://github.com/RoberPombo/Econom-aCasera/compare/v0.1.0...v1.0.0) (2026-08-09)


### ⚠ BREAKING CHANGES

* the application is now a Tauri desktop app instead of a Bun compiled executable
* release numbering switches from 1.0.run_number to SemVer

### Features

* auto-sync database with Google Drive folder or local backup ([78af0e1](https://github.com/RoberPombo/Econom-aCasera/commit/78af0e10133fe185d46e58c5da71d2d58949c859))
* **backend:** add persons support with migration, repository and endpoints ([d343ccf](https://github.com/RoberPombo/Econom-aCasera/commit/d343ccf8581ec527cb0f46a1afa97c0713c0d8e3))
* **backend:** add theme setting support with migration and endpoints ([6352cd6](https://github.com/RoberPombo/Econom-aCasera/commit/6352cd6bdc29be8290fdb7a460a7d7af331bdfa8))
* **backend:** add update service, controller and routes ([99b7ef1](https://github.com/RoberPombo/Econom-aCasera/commit/99b7ef1d168a73ce9a09ea2ffcf6b233c1a5fde2))
* Bun backend with SQLite REST API, Google Drive and Excel import ([5465631](https://github.com/RoberPombo/Econom-aCasera/commit/5465631eb96fe31d0b76aae2731759929c0357d2))
* **data:** add API repositories and CompositionRoot for clean architecture ([7400a13](https://github.com/RoberPombo/Econom-aCasera/commit/7400a13c75ec4afa056acaea2b0bb74cf85d6805))
* detect external changes and let user reload or overwrite database ([79e75c2](https://github.com/RoberPombo/Econom-aCasera/commit/79e75c288be51f5e9bcecea291fb9f842c24c9fb))
* **frontend:** add persons domain, data layer and composition root ([866faa3](https://github.com/RoberPombo/Econom-aCasera/commit/866faa3a0ba7a183b555860a9171c3ec6b7aa1d9))
* **frontend:** add theme setting domain, API and composition root ([fa92556](https://github.com/RoberPombo/Econom-aCasera/commit/fa92556df8ac785c919eea13d49cd0bb72b5011f))
* **frontend:** add update notification dialog and repository ([c0510a9](https://github.com/RoberPombo/Econom-aCasera/commit/c0510a921723bc61e9524c930cd6dc213190d373))
* **presentation:** add AppContext, AppProvider, useAppState and migrate components ([a79a03d](https://github.com/RoberPombo/Econom-aCasera/commit/a79a03d96a3b48d7ab5e6b96cc67b30125bff453))
* React UI with transactions, configurable categories, monthly/annual views and datepicker ([81b0b62](https://github.com/RoberPombo/Econom-aCasera/commit/81b0b62c1455b3da4f9fbbfa29e6e5ae4dc92f3c))
* **ui:** add dark mode toggle, system preference detection and theme-aware CSS ([8802fa7](https://github.com/RoberPombo/Econom-aCasera/commit/8802fa73d77bd0d32d064649de0bd3f0e56fb9b5))
* **ui:** add persons config tab and person field to transactions ([dd268aa](https://github.com/RoberPombo/Econom-aCasera/commit/dd268aab8b7164b50dfd32dd2a83eb5e37427c02))


### Bug Fixes

* **backend:** align summary and db-info endpoints with frontend contracts ([6dbba05](https://github.com/RoberPombo/Econom-aCasera/commit/6dbba05429958bd17d3809c7b439839e31b0d5e1))


### Code Refactoring

* add repository interfaces and use cases with tests ([87887a3](https://github.com/RoberPombo/Econom-aCasera/commit/87887a36f9e64b81d0e8a0178e8dd1f3cbab576a))
* **app:** wire App.tsx and main.tsx to clean architecture ([d98f32c](https://github.com/RoberPombo/Econom-aCasera/commit/d98f32c48981242a8ef8f5f057f0d274e9e1e829))
* **domain:** simplify Transaction amount, add summary result and db-info/excel contracts ([a0c01d8](https://github.com/RoberPombo/Econom-aCasera/commit/a0c01d89d150b3f6ab8ab38e0af662149e4fabbb))
* **frontend:** complete clean architecture for update feature and move App to presentation ([964dfdc](https://github.com/RoberPombo/Econom-aCasera/commit/964dfdc2b3bf11a22b06f78285351a9051c9b610))


### Tests

* **frontend:** include theme field in Settings entity test ([e570f29](https://github.com/RoberPombo/Econom-aCasera/commit/e570f29132a5634638f9f14c42b09488bd00b343))
* setup vitest and add domain entity tests ([be4bde1](https://github.com/RoberPombo/Econom-aCasera/commit/be4bde1dce32892ab7d3fead3629122f13742b80))


### Continuous Integration

* adopt release-please for semantic versioning ([d915aae](https://github.com/RoberPombo/Econom-aCasera/commit/d915aae79b3ebddedf1b524af6acff3c00e2e241))


### Chores

* base project with Bun, React, Vite and startup scripts ([715b26d](https://github.com/RoberPombo/Econom-aCasera/commit/715b26de143222fed4927827913576b74cfa309c))
* **build:** add APP_VERSION to build scripts and document releases/security ([3a57610](https://github.com/RoberPombo/Econom-aCasera/commit/3a576104f4bcb269beb72d4b1d4616d1a025e37d))
* **cleanup:** remove old api module and unused root-level components ([ce3bcf8](https://github.com/RoberPombo/Econom-aCasera/commit/ce3bcf8cc47370480d139ddb9a10d09a1b13f15e))
* promote develop to main ([#9](https://github.com/RoberPombo/Econom-aCasera/issues/9)) ([79263db](https://github.com/RoberPombo/Econom-aCasera/commit/79263db0f686554a63186a3fca1d8206289b913e))
* **rebrand:** rename project from Gastos to EconomiaCasera ([ff6f0bd](https://github.com/RoberPombo/Econom-aCasera/commit/ff6f0bd6d92bb51af8cef7d9988e1ef5b586dd76))
* **repo:** add MIT license, gitignore and GitHub workflows ([5d30ec4](https://github.com/RoberPombo/Econom-aCasera/commit/5d30ec4813e59fee13c3f04c6f5860e0c743be7a))
