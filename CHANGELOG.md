# Changelog

## [2.0.0](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.0...v2.0.0) (2026-08-22)


### ⚠ BREAKING CHANGES

* the application is now a Tauri desktop app instead of a Bun compiled executable
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
* filtros, búsqueda, tickets de compra e instaladores ([#5](https://github.com/RoberPombo/Econom-aCasera/issues/5)) ([62c3669](https://github.com/RoberPombo/Econom-aCasera/commit/62c366959cdddd571539942133dd437e5e8f3e32))
* **frontend:** add persons domain, data layer and composition root ([866faa3](https://github.com/RoberPombo/Econom-aCasera/commit/866faa3a0ba7a183b555860a9171c3ec6b7aa1d9))
* **frontend:** add theme setting domain, API and composition root ([fa92556](https://github.com/RoberPombo/Econom-aCasera/commit/fa92556df8ac785c919eea13d49cd0bb72b5011f))
* **frontend:** add update notification dialog and repository ([c0510a9](https://github.com/RoberPombo/Econom-aCasera/commit/c0510a921723bc61e9524c930cd6dc213190d373))
* import de movimientos de Abanca (CSV) ([#8](https://github.com/RoberPombo/Econom-aCasera/issues/8)) ([0146c23](https://github.com/RoberPombo/Econom-aCasera/commit/0146c23d85cb86926d6d1298c34139afa4dfb202))
* migrate application to Tauri v2 ([#1](https://github.com/RoberPombo/Econom-aCasera/issues/1)) ([3a22498](https://github.com/RoberPombo/Econom-aCasera/commit/3a224984bf92adde1461e2adc1383d666969e259))
* **presentation:** add AppContext, AppProvider, useAppState and migrate components ([a79a03d](https://github.com/RoberPombo/Econom-aCasera/commit/a79a03d96a3b48d7ab5e6b96cc67b30125bff453))
* React UI with transactions, configurable categories, monthly/annual views and datepicker ([81b0b62](https://github.com/RoberPombo/Econom-aCasera/commit/81b0b62c1455b3da4f9fbbfa29e6e5ae4dc92f3c))
* rediseño de la vista principal y sistema label/key ([#3](https://github.com/RoberPombo/Econom-aCasera/issues/3)) ([471aa8b](https://github.com/RoberPombo/Econom-aCasera/commit/471aa8bbff5b6da39b9616b97cc09c13bf580a4b))
* resumen anual imprimible y selector de categorías condicionado al tipo en la importación ([#40](https://github.com/RoberPombo/Econom-aCasera/issues/40)) ([fca756b](https://github.com/RoberPombo/Econom-aCasera/commit/fca756bc184c6667e476d2feca7f0ac1da80468e))
* tipo de movimiento 'savings' en el import ([#7](https://github.com/RoberPombo/Econom-aCasera/issues/7)) ([2357c37](https://github.com/RoberPombo/Econom-aCasera/commit/2357c370ebc12eda16c03da1226aaf6cdeff51a8))
* **ui:** add dark mode toggle, system preference detection and theme-aware CSS ([8802fa7](https://github.com/RoberPombo/Econom-aCasera/commit/8802fa73d77bd0d32d064649de0bd3f0e56fb9b5))
* **ui:** add persons config tab and person field to transactions ([dd268aa](https://github.com/RoberPombo/Econom-aCasera/commit/dd268aab8b7164b50dfd32dd2a83eb5e37427c02))


### Bug Fixes

* **backend:** align summary and db-info endpoints with frontend contracts ([6dbba05](https://github.com/RoberPombo/Econom-aCasera/commit/6dbba05429958bd17d3809c7b439839e31b0d5e1))
* blindar sanitización de tickets y resetear resumen al cambiar de año ([#42](https://github.com/RoberPombo/Econom-aCasera/issues/42)) ([646f9c5](https://github.com/RoberPombo/Econom-aCasera/commit/646f9c58764ccf2084bd2e7751adca3f0268f425))
* build and attach Tauri binaries before publishing the release ([d87a7e1](https://github.com/RoberPombo/Econom-aCasera/commit/d87a7e1728fc3c2b5c6b533afab55db6971daa62))
* default new transactions to today's date and always show current month/year ([c8992d8](https://github.com/RoberPombo/Econom-aCasera/commit/c8992d8a9190cbd7a256e334ee23e3d6c893abee))
* rename tauri package to silence Dependabot false positives ([0cd2fee](https://github.com/RoberPombo/Econom-aCasera/commit/0cd2fee66463c3cd267394013a7d2b958e7d2d4a))
* repair stale vite@8.2.0 reference in pnpm-lock.yaml ([#60](https://github.com/RoberPombo/Econom-aCasera/issues/60)) ([7762ce3](https://github.com/RoberPombo/Econom-aCasera/commit/7762ce30c87a57cbd97fb35cf3433f5d7603ffa2))
* sanitize receipt image sources for CodeQL ([9d5821e](https://github.com/RoberPombo/Econom-aCasera/commit/9d5821e31a3326bf171c6d9296cb66808a0e57b0))


### Documentation

* add AGENTS.md with repository rules for agents ([277e66c](https://github.com/RoberPombo/Econom-aCasera/commit/277e66c1a76152eae4ce0d636276025ee99490e1))
* **stpr:** add STPR method workflow artifacts ([#35](https://github.com/RoberPombo/Econom-aCasera/issues/35)) ([d2ce409](https://github.com/RoberPombo/Econom-aCasera/commit/d2ce4093632ac69eb859444e57999edb39b66ec2))


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
* auto-open sync PR from main into develop after release ([#36](https://github.com/RoberPombo/Econom-aCasera/issues/36)) ([cf2c476](https://github.com/RoberPombo/Econom-aCasera/commit/cf2c47622b11bcbe2fec03428124d43197cb1765))
* bump actions/checkout from 4.2.1 to 7.0.1 ([42ef688](https://github.com/RoberPombo/Econom-aCasera/commit/42ef688ecb95c4fee90707538d6be81fcc451691))
* bump googleapis/release-please-action from 4.1.4 to 5.0.0 ([e26af86](https://github.com/RoberPombo/Econom-aCasera/commit/e26af86180ff067400617dacb81c6ff34d48197b))
* bump pnpm/action-setup ([#44](https://github.com/RoberPombo/Econom-aCasera/issues/44)) ([fe24aed](https://github.com/RoberPombo/Econom-aCasera/commit/fe24aed3b22e600c21d7a5d43a87754c10604c58))
* bump swatinem/rust-cache ([#45](https://github.com/RoberPombo/Econom-aCasera/issues/45)) ([f274d27](https://github.com/RoberPombo/Econom-aCasera/commit/f274d27d348d0f654d47460450c4288e474b2906))
* bump tauri-apps/tauri-action ([a87e382](https://github.com/RoberPombo/Econom-aCasera/commit/a87e382d8d5fc5834d7ea890778380cbfef31225))
* use manifest config for release-please ([#10](https://github.com/RoberPombo/Econom-aCasera/issues/10)) ([f340680](https://github.com/RoberPombo/Econom-aCasera/commit/f34068038477a521eea493237414bd34a929cade))
* use PAT for release-please so release events trigger downstream workflows ([#57](https://github.com/RoberPombo/Econom-aCasera/issues/57)) ([827404e](https://github.com/RoberPombo/Econom-aCasera/commit/827404ed920e589f33a88f6463e157912e643f48))


### Chores

* base project with Bun, React, Vite and startup scripts ([715b26d](https://github.com/RoberPombo/Econom-aCasera/commit/715b26de143222fed4927827913576b74cfa309c))
* **build:** add APP_VERSION to build scripts and document releases/security ([3a57610](https://github.com/RoberPombo/Econom-aCasera/commit/3a576104f4bcb269beb72d4b1d4616d1a025e37d))
* bump biome schema version to match installed CLI (2.5.8) ([09bedf6](https://github.com/RoberPombo/Econom-aCasera/commit/09bedf62b9b8520073f40a4898ebaa3680dba12a))
* **cleanup:** remove old api module and unused root-level components ([ce3bcf8](https://github.com/RoberPombo/Econom-aCasera/commit/ce3bcf8cc47370480d139ddb9a10d09a1b13f15e))
* **deps-dev:** bump @biomejs/biome from 2.5.7 to 2.5.8 ([#52](https://github.com/RoberPombo/Econom-aCasera/issues/52)) ([ddb9e45](https://github.com/RoberPombo/Econom-aCasera/commit/ddb9e45d98ed0da61dd2465591a233832c378cdf))
* **deps-dev:** bump @types/node from 26.1.2 to 26.2.0 ([2a90791](https://github.com/RoberPombo/Econom-aCasera/commit/2a907916d703fd823e193d27dea8753e3b4bdcb4))
* **deps-dev:** bump the testing group across 1 directory with 2 updates ([#54](https://github.com/RoberPombo/Econom-aCasera/issues/54)) ([b467a73](https://github.com/RoberPombo/Econom-aCasera/commit/b467a73f3707e43bbf566998cb291c90e226a582))
* **deps-dev:** bump vite from 8.2.0 to 8.2.1 ([#51](https://github.com/RoberPombo/Econom-aCasera/issues/51)) ([d2a915c](https://github.com/RoberPombo/Econom-aCasera/commit/d2a915c8fb7b2609c53ca5d2ab22c69efa7529a7))
* **deps:** bump read-excel-file from 9.3.5 to 9.3.10 ([#50](https://github.com/RoberPombo/Econom-aCasera/issues/50)) ([6a67113](https://github.com/RoberPombo/Econom-aCasera/commit/6a671130b86b23998c323fa46b64e66122600881))
* promote develop to main ([950bea5](https://github.com/RoberPombo/Econom-aCasera/commit/950bea5d51e9ee8a1750cf5f2ddb4f9182aedece))
* promote develop to main ([54a6ece](https://github.com/RoberPombo/Econom-aCasera/commit/54a6ece7e55a9f69e3a2c3bf976bab1c28c5f72b))
* promote develop to main ([#9](https://github.com/RoberPombo/Econom-aCasera/issues/9)) ([79263db](https://github.com/RoberPombo/Econom-aCasera/commit/79263db0f686554a63186a3fca1d8206289b913e))
* **rebrand:** rename project from Gastos to EconomiaCasera ([ff6f0bd](https://github.com/RoberPombo/Econom-aCasera/commit/ff6f0bd6d92bb51af8cef7d9988e1ef5b586dd76))
* release main ([#30](https://github.com/RoberPombo/Econom-aCasera/issues/30)) ([5df09b9](https://github.com/RoberPombo/Econom-aCasera/commit/5df09b9dbe93b8838acb0d1395d94eca6019ebb5))
* release main ([#43](https://github.com/RoberPombo/Econom-aCasera/issues/43)) ([18e6a00](https://github.com/RoberPombo/Econom-aCasera/commit/18e6a00bc64e0e72d9aaa1645ec3ba09c1f33c21))
* release main ([#56](https://github.com/RoberPombo/Econom-aCasera/issues/56)) ([caa52ed](https://github.com/RoberPombo/Econom-aCasera/commit/caa52edaf7ca124040d423d41f9bdee5412cb9b1))
* **repo:** add MIT license, gitignore and GitHub workflows ([5d30ec4](https://github.com/RoberPombo/Econom-aCasera/commit/5d30ec4813e59fee13c3f04c6f5860e0c743be7a))
* sync main into develop after release ([d8fce27](https://github.com/RoberPombo/Econom-aCasera/commit/d8fce27c64e39b6624fe59c289c88b89d79ad029))
* sync main into develop after release ([7cbb53a](https://github.com/RoberPombo/Econom-aCasera/commit/7cbb53afcb87b9bcdc09fa3537eed77bb744c9d3))
* sync main into develop after release v1.0.0 ([c7bee95](https://github.com/RoberPombo/Econom-aCasera/commit/c7bee957ee24696e1188247295ab732d24db3690))
* sync main into develop after release v1.0.0 ([f6a4886](https://github.com/RoberPombo/Econom-aCasera/commit/f6a4886e13d3cf4ac314d6ed4e9ad4ffa640db75))

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
