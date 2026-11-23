# Changelog

## [1.1.7](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.6...v1.1.7) (2026-11-23)


### Bug Fixes

* patch open security advisories in lockfiles ([#172](https://github.com/RoberPombo/Econom-aCasera/issues/172)) ([5e5dde2](https://github.com/RoberPombo/Econom-aCasera/commit/5e5dde2933b890f50d23576bde44e85c9813cf56))
* rotate the updater signing key ([#173](https://github.com/RoberPombo/Econom-aCasera/issues/173)) ([8fbf2f1](https://github.com/RoberPombo/Econom-aCasera/commit/8fbf2f171ba5b9dc6fb8fa14a6513885548edfaa))


### Continuous Integration

* open the sync PR with the release PAT ([#171](https://github.com/RoberPombo/Econom-aCasera/issues/171)) ([3ee5962](https://github.com/RoberPombo/Econom-aCasera/commit/3ee59627a0ed944e3ff8998b4772b4dfd92f8356))


### Chores

* promote develop to main ([5ee9b23](https://github.com/RoberPombo/Econom-aCasera/commit/5ee9b234d9acc723aaa36dc52ca7ee60ad413426))
* sync main into develop after release v1.1.6 ([b97809e](https://github.com/RoberPombo/Econom-aCasera/commit/b97809efa662bdbee777258fe5050986cada8a8b))

## [1.1.6](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.5...v1.1.6) (2026-11-22)


### Documentation

* close P-001 review considerations and point dependabot at develop ([#157](https://github.com/RoberPombo/Econom-aCasera/issues/157)) ([3790e1c](https://github.com/RoberPombo/Econom-aCasera/commit/3790e1cbef5839d090a750a5ce566d1977ffdcd3))


### Continuous Integration

* add 2-day dependabot cooldown and ignore vitest major updates ([be57404](https://github.com/RoberPombo/Econom-aCasera/commit/be574046e1bd0587456bd183751640bcb3dfd323))
* add 2-day dependabot cooldown and ignore vitest major updates ([0c4d4b7](https://github.com/RoberPombo/Econom-aCasera/commit/0c4d4b70b9f6089230d2dc1cb31e3aeb51e62fc3))
* bump actions/setup-node from 7.0.0 to 7.1.0 ([4009fbf](https://github.com/RoberPombo/Econom-aCasera/commit/4009fbf5cc23be4a24e27190c6733ae8dddfe4e5))
* bump dtolnay/rust-toolchain pin ([e765c75](https://github.com/RoberPombo/Econom-aCasera/commit/e765c75175cb3ed309224ca7ef4c9584be0b530a))
* bump GitHub Actions pins (rust-cache, pnpm, setup-node, rust-toolchain) ([c4ed9ad](https://github.com/RoberPombo/Econom-aCasera/commit/c4ed9adc1d20c5441034b8953767e1b49969aef1))
* bump pnpm/action-setup from 6.0.10 to 6.1.0 ([e0e4ded](https://github.com/RoberPombo/Econom-aCasera/commit/e0e4ded665eec109f51e4af0224bbac0b587cfda))
* bump swatinem/rust-cache from 2.9.0 to 2.9.2 ([c67cb04](https://github.com/RoberPombo/Econom-aCasera/commit/c67cb04e2e56248ffcb129fb9892bc990e2bc644))
* harden workflow triggers, tokens and release secrets ([#156](https://github.com/RoberPombo/Econom-aCasera/issues/156)) ([7053e09](https://github.com/RoberPombo/Econom-aCasera/commit/7053e096f472c37437f433389d3d8f8abb05c84c))
* raise dependabot cooldown to 7 days ([#155](https://github.com/RoberPombo/Econom-aCasera/issues/155)) ([48217b8](https://github.com/RoberPombo/Econom-aCasera/commit/48217b8db8e4473ae6341a08027338a02c4bdc66))


### Chores

* **deps-dev:** bump @biomejs/biome from 2.5.8 to 2.5.15 ([a0bdc5e](https://github.com/RoberPombo/Econom-aCasera/commit/a0bdc5edcd84b796f227b87362c60ddfedacdc66))
* **deps-dev:** bump @types/node from 26.2.0 to 26.6.5 ([7ab3b44](https://github.com/RoberPombo/Econom-aCasera/commit/7ab3b44392a05cf3bd9d93ad24aa78eb5f8632c9))
* **deps-dev:** bump @vitejs/plugin-react from 6.0.5 to 6.1.2 ([b1712d2](https://github.com/RoberPombo/Econom-aCasera/commit/b1712d2e26d5f87780d8a90acd31daffe97d9444))
* **deps-dev:** bump vite from 8.2.1 to 8.3.4 ([b06c100](https://github.com/RoberPombo/Econom-aCasera/commit/b06c10065b61e20ccea1340051c3d1200860eb83))
* **deps-dev:** bump vitest from 4.1.10 to 4.1.11 ([ba42321](https://github.com/RoberPombo/Econom-aCasera/commit/ba42321b8c2766ea3364d6c146c10816979a688c))
* **deps:** bump dirs from 6.0.0 to 7.0.0 ([dc56ab5](https://github.com/RoberPombo/Econom-aCasera/commit/dc56ab55f223c8563a150021d731972da67e3833))
* **deps:** bump npm dependencies and the tauri stack (npm + Rust) ([e83d40d](https://github.com/RoberPombo/Econom-aCasera/commit/e83d40d5e031a55ebb8347920c2bb86231f58887))
* **deps:** bump pending npm, cargo and action dependencies ([#158](https://github.com/RoberPombo/Econom-aCasera/issues/158)) ([a68d551](https://github.com/RoberPombo/Econom-aCasera/commit/a68d551c0bdcc5266c35bbf6bd08052625f53deb))
* **deps:** bump read-excel-file from 9.3.10 to 9.3.12 ([e412011](https://github.com/RoberPombo/Econom-aCasera/commit/e4120114aef0d2bb87cc6d69c1576eb3043fb95f))
* **deps:** bump serde_json from 1.0.151 to 1.0.154 ([a7f4126](https://github.com/RoberPombo/Econom-aCasera/commit/a7f412608d7af6a8116d21a7469abd491a5ebcb1))
* **deps:** bump the react group with 4 updates ([9086cb5](https://github.com/RoberPombo/Econom-aCasera/commit/9086cb5fb17b86367d9f978a1095f9f46f781f87))
* **deps:** bump the tauri group with 5 updates ([86bf53d](https://github.com/RoberPombo/Econom-aCasera/commit/86bf53d4745fe0aab5dcb19c20501f02e1cd77e5))
* **deps:** bump the tauri-crate group with 5 updates ([34c9d04](https://github.com/RoberPombo/Econom-aCasera/commit/34c9d04fb86b3121d5143ea9a34bc1cd916ff35e))
* promote develop to main ([858e6f4](https://github.com/RoberPombo/Econom-aCasera/commit/858e6f431564ed889234dafcb4dcbae09c37529f))
* stop tracking .stpr and .opencode ([#154](https://github.com/RoberPombo/Econom-aCasera/issues/154)) ([4554ec4](https://github.com/RoberPombo/Econom-aCasera/commit/4554ec4be693b509b8a3dad4609788cefd972d19))
* sync main into develop after release ([69fd1f2](https://github.com/RoberPombo/Econom-aCasera/commit/69fd1f25437f3b67806da2f88dc6892c7c3aa722))
* update biome config schema to 2.5.15 ([15e5d5c](https://github.com/RoberPombo/Econom-aCasera/commit/15e5d5c708ab6c3a3d5681326ba46cdf139a45cd))

## [1.1.5](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.4...v1.1.5) (2026-08-23)


### Continuous Integration

* bump actions/setup-node and pnpm/action-setup to silence Node 20 deprecation warning ([0afd52e](https://github.com/RoberPombo/Econom-aCasera/commit/0afd52eedd3a4134104accab4d36e955b7570b64))


### Chores

* promote develop to main ([9aaf0ae](https://github.com/RoberPombo/Econom-aCasera/commit/9aaf0aea7483a634c2c2daebebb0405abe9d26c6))
* sync main into develop after release ([61c28eb](https://github.com/RoberPombo/Econom-aCasera/commit/61c28eb31378caef7a1361bf6a1efb41fe3375f0))

## [1.1.4](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.3...v1.1.4) (2026-08-22)


### Chores

* promote develop to main ([dff4b36](https://github.com/RoberPombo/Econom-aCasera/commit/dff4b36160b140a642d0b2b277ac63e96fa6b0c1))
* sync main into develop after release ([23e16a4](https://github.com/RoberPombo/Econom-aCasera/commit/23e16a4b2869787978dbf8cec49773631bf1c941))
* trim Tauri bundle targets to one installer per platform ([52049b8](https://github.com/RoberPombo/Econom-aCasera/commit/52049b8323e59fa1f9bc77ac7cf270414397f4b8))

## [1.1.3](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.2...v1.1.3) (2026-08-22)


### Bug Fixes

* avoid duplicate draft releases from concurrent tauri-action matrix jobs ([93517a1](https://github.com/RoberPombo/Econom-aCasera/commit/93517a17bd327117d1acacae07ae5206066783f2))
* unify app and Tauri crate under a single tracked version ([#74](https://github.com/RoberPombo/Econom-aCasera/issues/74)) ([3cc8d06](https://github.com/RoberPombo/Econom-aCasera/commit/3cc8d06d8a394bfcaab3ced341818c6c6aa56ea0))


### Chores

* promote develop to main ([acbf8a3](https://github.com/RoberPombo/Econom-aCasera/commit/acbf8a371f5e662c5f632950e6b7aaad15a08d00))
* release main ([#69](https://github.com/RoberPombo/Econom-aCasera/issues/69)) ([de1ab01](https://github.com/RoberPombo/Econom-aCasera/commit/de1ab013c4d7c942c899e04a74b590f00d9196fe))
* sync main into develop (version unification) ([46ec4e8](https://github.com/RoberPombo/Econom-aCasera/commit/46ec4e8c6fcba96fec8aedee1b459323a1b71da9))
* sync release-please manifest with recreated v1.1.1 release ([34976c5](https://github.com/RoberPombo/Econom-aCasera/commit/34976c5ab84bcc46aac838dd7d617a3468a1f104))

## [1.1.2](https://github.com/RoberPombo/Econom-aCasera/compare/v1.1.1...v1.1.2) (2026-08-22)


### Chores

* sync release-please manifest with recreated v1.1.1 release ([#67](https://github.com/RoberPombo/Econom-aCasera/issues/67)) ([77d5106](https://github.com/RoberPombo/Econom-aCasera/commit/77d510607be2be6e630e2141f53fdfe3e8c41f3e))

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
