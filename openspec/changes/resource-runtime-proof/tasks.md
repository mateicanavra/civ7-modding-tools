## 1. Runtime Telemetry

- [x] 1.1 Add bounded `RESOURCE_PLACEMENT_V1` runtime telemetry after typed
  resource placement outcomes are available.
- [x] 1.2 Include GameInfo symbolic resource rows, per-resource counts, unique
  placed type count, and placed-count spread.
- [x] 1.3 Add focused formatter coverage without requiring GameInfo in local
  tests.
- [x] 1.4 Assign resource ids to engine-legal tiles during product
  materialization so runtime legality does not collapse local numeric
  diversity.
- [x] 1.5 Preserve original preferred ids, reassignment counts, unassigned
  preferred placements, legal candidate ids, and unassignable candidate ids in
  the placement proof artifact.

## 2. Stack And Watcher Boundary

- [x] 2.1 Verify the resource stack is above
  `codex/firetuner-socket-studio-restart` at `bb39b3cf7`.
- [x] 2.2 Repair the stale stats-gate local commit-state record at
  `3cecdf6b49a1`.
- [x] 2.3 Re-check whether downstack FireTuner restart work advanced before
  final runtime proof and restack/integrate successor work if needed.

## 3. Runtime Proof

These runtime tasks are historical source-branch proof from
`codex/resource-runtime-proof@a674a2ee62f08cf1e1fce5d958eb52e2aab07dd7`.
The integration branch replays the behavior and does not claim a fresh in-game
run unless new bounded logs are added to the phase record.

- [x] 3.1 Deploy the mod from the source resource worktree.
- [x] 3.2 Restart Civ7 through the Studio FireTuner socket/API path with
  agent `DRA-map-config-generation`.
- [x] 3.3 Record the exact restart request id, command/path, branch/commit
  boundary, and bridge response.
- [x] 3.4 Inspect bounded `Scripting.log` and `Modding.log` windows after the
  restart.
- [x] 3.5 Confirm source `RESOURCE_PLACEMENT_V1` shows expected runtime resource
  diversity, no mismatches, and near-even placed counts.
- [x] 3.6 Record the failed first runtime proof attempt where live Civ7 placed
  only 16 symbolic resource types from 55 planned candidate ids.
- [x] 3.7 Record post-repair socket/API attempts that deployed successfully but
  did not produce a fresh Civ7 MapGeneration window.
- [x] 3.8 Record the current FireTuner/Civ7 runtime-state diagnosis for the
  repeated `Network.restartGame()` false return.
- [x] 3.9 Compact runtime telemetry so Civ7 `Scripting.log` preserves a
  parseable full-catalog payload.

## 4. Review And Closure

- [x] 4.1 Run framed peer review and disposition accepted P1/P2 findings.
- [x] 4.2 Run focused tests, package check, OpenSpec validation, and
  `git diff --check`.
- [x] 4.3 Commit the Graphite slice locally while keeping external Graphite
  submission/PR delivery unclaimed until submitted.
