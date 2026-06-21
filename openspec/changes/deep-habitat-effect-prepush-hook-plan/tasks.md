# Tasks

## 1. Implementation

- [x] 1.1 Add hook-only source-rule execution selection from registry
  `hookCheck` metadata.
- [x] 1.2 Read pre-push changed paths from `GitProvider` against the resolved
  base.
- [x] 1.3 Run changed hook source paths through the in-process
  `StructuralCheck` service.
- [x] 1.4 Refuse to skip hook source checks when changed-path discovery fails.
- [x] 1.5 Narrow pre-push Nx affected targets to package `check` and explicit
  validation targets while leaving root `check:graph` unchanged.

## 2. Verification

- [x] 2.1 `bun run biome check --write` on touched Habitat files.
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-prepush-hook-plan --strict`
- [x] 2.5 Compare pre-push affected task plan before/after.
- [x] 2.6 `git diff --check`

## 3. Follow-Up Dominoes

- [ ] 3.1 Split docs-local checkout enforcement out of source-check so docs
  hygiene no longer pulls `docs/**` into source-check planning.
- [ ] 3.2 Add source-check derived fact indexes so AST/text traversals are
  computed once per file.
- [ ] 3.3 Model workspace-gate rules as explicit local/CI lanes instead of
  hiding them inside hook target recipes.
