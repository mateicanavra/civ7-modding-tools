# Tasks

## 1. Baseline

- [x] 1.1 Confirm pre-push hard-codes `biome:ci`, `boundaries`, `grit:check`,
  and `habitat:check` in the same Nx affected invocation.
- [x] 1.2 Confirm `habitat:check` is the structural harness target and broad
  vendor lanes are implementation details of Habitat rules.
- [x] 1.3 Confirm existing hook tests assert the current affected argv.

## 2. Implementation

- [x] 2.1 Add a provider-owned pre-push target-name function.
- [x] 2.2 Make the hook router consume the provider-owned target plan.
- [x] 2.3 Remove duplicate top-level Biome, boundary, and Grit lanes from
  pre-push.
- [x] 2.4 Update existing hook behavior expectations for the new argv.
- [x] 2.5 Route the pre-push service path through `NxProvider.affected`.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/providers/nx/targets.ts tools/habitat-harness/src/service/modules/hook/router.ts tools/habitat-harness/test/service/hook-service.test.ts tools/habitat-harness/test/lib/hooks.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/service/hook-service.test.ts test/lib/hooks.test.ts`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-fast-check-architecture --strict`
- [x] 3.5 `git diff --check`
- [x] 3.6 `bun run openspec:validate`
- [x] 3.7 `bun run check`

## 4. Follow-Up Dominoes

- [ ] 4.1 Diagnose and repair Nx invocation/project-graph startup overhead.
- [ ] 4.2 Move pre-push Habitat checks fully in-process if the remaining Nx
  shell boundary is still a material hook cost.
- [ ] 4.3 Tighten broad rule metadata so affected owner checks stop treating
  unrelated workspace edits as structural harness changes.
- [ ] 4.4 Delete the legacy synchronous pre-push helper once direct-import tests
  are moved to the provider-backed service path.
