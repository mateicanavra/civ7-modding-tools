# Tasks

## 1. Implementation

- [x] 1.1 Add candidate-extension exports to source-check rule modules.
- [x] 1.2 Require candidate-extension metadata during rule-module loading.
- [x] 1.3 Use selected rule-module extensions while collecting source paths.
- [x] 1.4 Keep per-rule file matching bounded by its own extension set.

## 2. Verification

- [x] 2.1 Syntax-check source-check runtime and rule modules.
- [x] 2.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.3 `bun run --cwd tools/habitat-harness check`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-rule-extension-plans --strict`
- [x] 2.5 `bun run biome:ci`
- [x] 2.6 `git diff --check`
