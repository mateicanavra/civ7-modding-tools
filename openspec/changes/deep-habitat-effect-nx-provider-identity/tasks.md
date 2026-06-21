# Tasks

## 1. Baseline

- [x] 1.1 Confirm `NxProvider.affected` requests `nx`.
- [x] 1.2 Confirm `NxProvider.graph`, `runMany`, and `runTarget` request
  `target-check`.
- [x] 1.3 Confirm `target-check` is only a materialized alias to Nx.

## 2. Implementation

- [x] 2.1 Add `nx` to workspace tool policy.
- [x] 2.2 Update Nx provider graph/run-many/run-target executables to `nx`.
- [x] 2.3 Update Nx provider argv helpers to emit `nx`.
- [x] 2.4 Update provider, graph service, and workspace-tool expectations.

## 3. Verification

- [x] 3.1 `bun run biome check --write tools/habitat-harness/src/config/habitat-config.ts tools/habitat-harness/src/providers/nx/index.ts tools/habitat-harness/test/lib/vendor-providers.test.ts tools/habitat-harness/test/service/graph-service.test.ts tools/habitat-harness/test/lib/workspace-tools.test.ts`
- [x] 3.2 `bun run --cwd tools/habitat-harness test -- test/lib/vendor-providers.test.ts test/service/graph-service.test.ts test/lib/workspace-tools.test.ts`
- [x] 3.3 `bun run --cwd tools/habitat-harness check`
- [x] 3.4 `bun run openspec -- validate deep-habitat-effect-nx-provider-identity --strict`
- [x] 3.5 `bun run check`
- [x] 3.6 `git diff --check`
- [x] 3.7 `bun run openspec:validate`

## 4. Follow-Up Dominoes

- [x] 4.1 Rename or drain `target-check` rule ownership separately.
- [x] 4.2 Remove the `target-check` workspace-tool alias when no metadata or
  caller needs it.
