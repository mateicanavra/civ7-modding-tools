# Tasks

## 1. Implementation

- [x] 1.1 Move shared source-check helper logic into a source-owned runtime module.
- [x] 1.2 Move each source-check rule implementation into its own source-owned rule module.
- [x] 1.3 Replace global policy loading with selected rule-module loading.
- [x] 1.4 Scope Nx direct source-check rule inputs to the rule module and shared runtime.
- [x] 1.5 Remove the old monolithic source-check policy file.
- [x] 1.6 Register `.habitat` as the Habitat authority project in the inferred Nx graph.

## 2. Verification

- [x] 2.1 Syntax-check all source-check runtime/rule modules.
- [x] 2.2 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.3 `bun run openspec -- validate deep-habitat-effect-source-check-rule-modules --strict`
- [x] 2.4 `bun run --cwd tools/habitat-harness check`
- [x] 2.5 Focused Habitat rule/hook tests.
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 Inferred Nx target input probe shows `habitat:rule:rng-authority-static`
  depends on
  `tools/habitat-harness/src/domains/source-check/rules/rng-authority-static.mjs`
  and `tools/habitat-harness/src/domains/source-check/rule-runtime.mjs`, not
  unrelated source-check rule modules.
- [x] 2.8 `git diff --check`

## 3. Follow-Up Dominoes

- [ ] 3.1 Narrow generic `check` target expansion for Habitat authority edits so
  source-check rule module changes do not fan into ordinary product builds.
