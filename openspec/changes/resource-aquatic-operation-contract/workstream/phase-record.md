# Phase Record: Resource Aquatic Operation Contract

## Objective

Add the first resource-group operation contract for aquatic/coastal/navigable-
river resources while preserving symbolic identity, proxy visibility, and the
unverified runtime-id boundary.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`
- Branch: `codex/resource-aquatic-operation-contract`
- Parent slice: `codex/resource-earthlike-expectations-artifact`
- Source Studio/API pair observed for this source slice:
  `http://127.0.0.1:5174/`

## Agent Review

- Curie: architecture placement review requested before code completion.
  Outcome: superseded by Darwin's scoped post-implementation review because the
  initial advisory agent did not return before closure.
- Boole: aquatic contract design review requested before code completion.
  Outcome: superseded by Darwin's scoped post-implementation review because the
  initial advisory agent did not return before closure.
- Darwin: post-implementation review found P1 configurable coverage omission.
  Repair: removed configurable aquatic resource set and added regression test
  rejecting omission through config.
- Darwin: repair review. Outcome: P1 repair-cleared; no new P1/P2 findings.

## FireTuner Runtime-Proof Boundary

- Acknowledged runtime-proof boundary:
  `openspec/changes/resource-runtime-proof/workstream/phase-record.md`.
- Current downstack restart branch evidence:
  `codex/firetuner-socket-studio-restart` contains
  `bb39b3cf7 fix: submit Studio restarts through FireTuner socket`.
- Restart integration files at that boundary:
  `apps/mapgen-studio/vite.config.ts`,
  `packages/cli/src/utils/firetunerSocket.ts`, and
  `packages/cli/test/utils/firetunerSocket.test.ts`.
- This aquatic contract slice does not claim runtime proof and does not restart
  the game.
- Before any final resource runtime-proof slice claims completion, verify
  whether the downstack restart branch has advanced, integrate/restack the
  resource stack on top of it, use the FireTuner socket/API restart path, and
  record the exact branch/commit and restart command/path used.
- The runtime-proof phase record owns the final restacked/runtime-proof
  boundary.

## Verification So Far

- `bun run --cwd mods/mod-swooper-maps test -- test/resources/resource-aquatic-op-contract.test.ts test/resources/resource-earthlike-expectations-artifact.test.ts`
  - Passed after P1 repair: 12 tests, 640 assertions.
- `bun run --cwd mods/mod-swooper-maps check`
  - Passed after P1 repair.
- `bun run openspec -- validate resource-aquatic-operation-contract --strict`
  - Passed after P1 repair.
- `bun run openspec:validate`
  - Passed after P1 repair: 23 items.
- `git diff --check`
  - Passed after P1 repair.

## Closure State

- Locally committed clean at
  `10d683fb2cd9` on
  `codex/resource-aquatic-operation-contract`.
- External Graphite submission/PR delivery is not claimed by this local closure
  record.
- This closure-state repair is recorded in follow-up slice
  `codex/resource-cultivated-operation-contract` because the aquatic commit had
  already been created and the workstream had moved onto the cultivated branch
  when the watcher found the stale OpenSpec task/phase state.
