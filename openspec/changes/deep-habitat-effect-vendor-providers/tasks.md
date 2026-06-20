# Tasks

## 1. Provider Contracts

- [ ] 1.1 Define shared provider command and failure contract under `src/providers/command/**`.
- [ ] 1.2 Add Git provider.
- [ ] 1.3 Define Grit provider contracts, fake/live Layers, and pure command/output parsing seams; defer adapter draining to `deep-habitat-effect-grit-apply-cutover`.
- [ ] 1.4 Add Biome provider.
- [ ] 1.5 Add Nx provider.
- [ ] 1.6 Add Husky delegator provider.
- [ ] 1.7 Remove the temporary `HabitatProcess` migration bridge from
  `src/lib/habitat-process.ts`; Grit, Biome, Nx, Git, and Husky callsites must
  consume provider services directly before this train is done.

## 2. Migration

- [ ] 2.1 Replace raw Git calls in baseline/check/hook/verify write sets through follow-on domain packets; this packet only creates provider contracts and first callsites required for parity tests.
- [ ] 2.2 Replace `WorkspaceToolProvider` command-name map with provider command builders.
- [ ] 2.3 Keep provider outputs mapped to existing public command/report shapes.
- [ ] 2.4 Reject any new shim, fallback, or duplicate process path; bridges may
  exist only between adjacent dominos and must be deleted by their assigned
  cutover packet.

## 3. Proof

- [ ] 3.1 Provider fake-layer unit tests.
- [ ] 3.2 Grit parser/scan-root/projection matrix.
- [ ] 3.3 Biome read-only/write command construction tests.
- [ ] 3.4 Nx graph/target/affected tests with fake and resolved metadata.
- [ ] 3.5 Git staged/status/merge-base tests.
- [ ] 3.6 `bun run --cwd tools/habitat-harness test`
- [ ] 3.7 `bun run habitat:check -- --json`
- [ ] 3.8 `bun run openspec -- validate deep-habitat-effect-vendor-providers --strict`
- [ ] 3.9 `bun run openspec:validate`
- [ ] 3.10 `git diff --check`
