# Tasks

## 1. Provider Contracts

- [x] 1.1 Define shared provider command and failure contract under `src/providers/command/**`.
- [x] 1.2 Add Git provider.
- [x] 1.3 Define Grit provider contracts, fake/live Layers, and pure command/output parsing seams; defer adapter draining to `deep-habitat-effect-grit-apply-cutover`.
- [x] 1.4 Add Biome provider.
- [x] 1.5 Add Nx provider.
- [x] 1.6 Add Husky delegator provider.
- [ ] 1.7 Remove the temporary `HabitatProcess` migration bridge from
  `src/lib/habitat-process.ts`; Grit, Biome, Nx, Git, and Husky callsites must
  consume provider services directly before this train is done.
  Remaining bridge owner: follow-on cutover packets. Current branch keeps the
  bridge only where older callsites still need adjacent-domino migration.

## 2. Migration

- [ ] 2.1 Replace raw Git calls in baseline/check/hook/verify write sets through follow-on domain packets; this packet only creates provider contracts and first callsites required for parity tests.
  Current branch moves verify base/status and affected execution to
  `GitProvider`/`NxProvider`; baseline/check/hook remain with their owning
  cutover packets.
- [ ] 2.2 Replace `WorkspaceToolProvider` command-name map with provider command builders.
- [x] 2.3 Keep provider outputs mapped to existing public command/report shapes.
- [x] 2.4 Reject any new shim, fallback, or duplicate process path; bridges may
  exist only between adjacent dominos and must be deleted by their assigned
  cutover packet.
  Current branch removes provider exports from the root public surface and
  restores the bounded Grit live-source batch refusal until provider-owned
  scheduling exists.

## 3. Proof

- [x] 3.1 Provider fake-layer unit tests.
- [x] 3.2 Grit parser/scan-root/projection matrix.
- [x] 3.3 Biome read-only/write command construction tests.
- [x] 3.4 Nx affected tests with fake provider metadata.
- [x] 3.5 Git status/merge-base tests.
- [x] 3.6 `bun run --cwd tools/habitat-harness test`
- [ ] 3.7 `bun run habitat:check -- --json`
  Boundary: `bun run habitat:check` was run on 2026-06-20 and still fails on
  existing locked source-pattern findings plus docs-local advisory debt. The
  prior 120s Grit timeout failure mode no longer reproduces; source patterns
  fail in a bounded batch.
- [x] 3.8 `bun run openspec -- validate deep-habitat-effect-vendor-providers --strict`
- [x] 3.9 `bun run openspec:validate`
- [x] 3.10 `git diff --check`
