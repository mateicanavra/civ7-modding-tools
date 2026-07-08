# Studio Run Saved Config Modset Reconciliation

## Why

Run in Game currently generates and deploys the request-local Studio-run mod,
but Civ7 setup readback can still fail to see the generated map row after the
saved Test of Time config is loaded. Deployment is not the launch boundary.
The launch boundary is a generated map row visible in the active Civ7 setup
state after saved-config and mod-set reconciliation.

This packet repairs the saved-config/generated-mod/setup/start sequence so a
browser-originated request can start the generated content the user selected.

## Authority

- Direct user guidance requiring realistic Test of Time basic-mods path.
- `real-user-path-remediation-proposal.md` Unit B.
- `target-vocabulary.md` live verification and loaded-game readback rules.
- Completed packets: `studio-run-generated-map-mod-visibility` and
  `studio-run-setup-failure-taxonomy`.
- Root `AGENTS.md` runtime control ownership in `@civ7/direct-control`.

## Requires

- Generated Studio-run mod visibility established for request-local rows.
- Specific setup failure taxonomy.
- Browser-originated request contract for live checks.

## Enables Parallel Work

- Final matrix closure can run once this packet provides the live setup/start
  launch boundary.

## Affected Owners

- Studio Run in Game server workflow
- saved setup config application for `ToT_BasicModsEnabled.Civ7Cfg`
- generated `mod-swooper-studio-run` metadata and deployment snapshot
- `@civ7/direct-control` setup preparation/start APIs where needed
- setup row readback and pre-Begin setup value readback
- Run in Game workflow evidence types

## Forbidden Owners

- Repeating saved-config loads after row readback in a way that invalidates the
  checked setup state.
- Process restarts as unstated live behavior.
- Raw Civ7 control scripts outside `@civ7/direct-control`.
- Multiple live setup strategies kept as conditional paths.

## Write Set

Likely write set:

- `packages/civ7-direct-control/src/setup/**`
- `packages/civ7-direct-control/test/**`
- `packages/studio-server/src/workflows/RunInGameWorkflow.ts`
- `packages/studio-server/src/ports/workflowTypes.ts`
- `packages/studio-server/test/**`
- `apps/mapgen-studio/src/server/runInGame/**`
- Studio Run in Game workflow tests
- this OpenSpec packet and workstream evidence

## Consumer Impact

Run in Game uses the user's saved Test of Time setup while ensuring the
request-local generated mod remains active and selected. If reconciliation
cannot produce a visible generated row, the operation terminalizes safely with
specific diagnostics.

## Stop Conditions

- Row readback happens before saved-config/mod-set reconciliation.
- Start reloads a different setup state than the checked one.
- Test of Time config cannot be composed with `mod-swooper-studio-run` and no
  specific failure is recorded.
- Huge map, seed, player count, or generated row readback cannot be observed
  before Begin.

## Before And After

Before:

- generated mod deployment can complete while setup catalog readback cannot see
  the generated row;
- saved setup config load can change active target mod state after an earlier
  row check;
- start preparation may reload a different setup state than the one checked.

After:

- the workflow composes the saved setup config with the request-local generated
  mod before row readback;
- the generated map row is read after config/mod-set reconciliation and before
  Begin;
- seed, Huge map size, 10 players, active generated mod, and generated map
  identity are read back from setup before start;
- resources remain verified through the visible UI selection, admitted request,
  generation manifest, and retained evidence row;
- start does not repeat a setup load that invalidates the checked row.

## Behavior Verification

Behavior tests cover setup sequencing with fake direct-control readers and
saved-config fixtures. Live checks reproduce the Test of Time basic-mods path
and show generated row visibility before Begin.

## Structural Enforcement

Permanent positive assertions:

- setup/start consumes a single reconciled setup snapshot for a request;
- generated mod identity is included in the active setup target before row
  readback;
- setup row readback is after saved-config load, not before it.

Use TypeScript state modeling and direct-control contracts first. Use Habitat
structure/rules only for recurring topology, imports, or ownership boundaries.

## Verification Gates

- `bun run openspec -- validate studio-run-saved-config-modset-reconciliation --strict`.
- `bun habitat classify` for the packet write set and every reported command.
- Focused setup sequencing and saved-config composition tests.
- Live Studio endpoint check using `ToT_BasicModsEnabled.Civ7Cfg`, Huge map,
  10 players, and at least one generated map source through the rendered button
  path.
- TypeScript refactoring, code quality/structure, library correctness,
  testing-design, and Habitat/authority review lanes.
