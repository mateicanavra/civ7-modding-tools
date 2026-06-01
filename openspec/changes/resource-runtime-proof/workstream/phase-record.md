# Phase Record: Resource Runtime Proof

## Objective

Prove the resource distribution stack in a live Civ7 run after deploy, using the
current FireTuner socket/API restart boundary, and record resource-specific
runtime telemetry from the scripting logs.

## Integration Replay State

- Integration worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-civ7-graphite-integration`
- Integration branch: `codex/integrate-resource-runtime-proof`
- Integration parent slice: `codex/integrate-resource-ops-rollup`
- Source behavior/proof branch: `codex/resource-runtime-proof` at
  `a674a2ee62f08cf1e1fce5d958eb52e2aab07dd7`.
- This integration replay preserves the source branch's bounded runtime proof
  as historical source proof. It does not claim a fresh in-game runtime run from
  the integration branch; integration-local proof classes are tests, package
  check, OpenSpec validation, and `git diff --check` unless a new runtime run is
  recorded here.

## Repo State

- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-civ7-graphite-integration`
- Branch: `codex/integrate-resource-runtime-proof`
- Parent slice: `codex/integrate-resource-ops-rollup`
- Source downstack restart branch checked for historical runtime proof:
  `codex/firetuner-socket-studio-restart`
- Source downstack restart commit checked for historical runtime proof:
  `bb39b3cf7 fix: submit Studio restarts through FireTuner socket`
- Source Studio/API pair observed for historical runtime proof:
  `http://127.0.0.1:5175/`

## Verification So Far

- `git show --stat --oneline codex/firetuner-socket-studio-restart -- ...`
  confirmed `bb39b3cf7` and the expected socket restart files.
- Source `gt log --no-interactive` showed `codex/resource-runtime-proof`
  stacked above `codex/firetuner-socket-studio-restart`.
- Initial ancestry check found the resource stack was still a sibling of
  `codex/firetuner-socket-studio-restart`; this slice restacked the resource
  branches on top of `bb39b3cf7` before runtime proof.
- Post-restack `git merge-base --is-ancestor
  codex/firetuner-socket-studio-restart HEAD` returned `0`.
- Source restacked resource branch heads before runtime proof:
  `codex/resource-distribution-planning` at `84f014445c5b`,
  `codex/resource-distribution-root-cause` at `25ea6ea9a440`,
  `codex/resource-stage-architecture` at `c447d4247645`,
  `codex/resource-corpus-contract` at `526e7f7f6572`,
  `codex/resource-earthlike-expectations` at `81c6dba2a010`,
  `codex/resource-earthlike-expectations-artifact` at `3c9628b06313`,
  `codex/resource-aquatic-operation-contract` at `10d683fb2cd9`,
  `codex/resource-cultivated-operation-contract` at `dee212efc405`,
  `codex/resource-terrestrial-operation-contract` at `e4f99d9ef5cc`,
  `codex/resource-geological-operation-contract` at `7864f13bb9b1`,
  `codex/resource-group-plan-rollup` at `d4150abe8106`,
  `codex/resource-placement-diversity` at `bc6c328c1edb`, and
  `codex/resource-diversity-stats-gate` at `3cecdf6b49a1`.
- Framed peer review by Dalton found no P1/P2 blockers and cleared proceeding
  to deploy plus FireTuner runtime proof.
- Local gates before deploy and final record repair:
  - `bun test mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts`
    passed after compact telemetry repair: 3 tests, 7 assertions.
  - `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
    passed: 2 tests, 1768 assertions.
  - `bun run --cwd mods/mod-swooper-maps check` passed.
  - `bun run openspec -- validate resource-runtime-proof --strict` passed.
  - `bun run openspec:validate` passed: 30 items.
  - `git diff --check` passed.
  - Framed telemetry review found no blocking code/test issue; accepted
    non-blocking requests by asserting exact full-catalog id arrays and the
    full prefixed log-line length.
- `~/Library/Application Support/Civilization VII/Logs/Scripting.log` and
  `Modding.log` are present.
- FireTuner bridge log path is
  `~/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/Comms/civ7-firetuner-bridge.append-only.log`.

## Runtime Proof State

- Direct append-only bridge probe completed with
  `civ7-restart-mptnr7fc-q81`; the Windows bridge submitted
  `Network.restartGame()` at `2026-05-31T06:50:15`, but Civ7 did not produce a
  fresh `Scripting.log` MapGeneration window from that bridge probe.
- Studio socket/API restart path completed with request id
  `studio-socket-mptnttrq-oom`, transport `firetuner-socket`, host
  `127.0.0.1`, port `4318`, state `App UI`, and output `["true"]`.
- The socket path observed a fresh `Scripting.log` MapGeneration window at
  `2026-05-31T10:52:00.549Z`, start offset `24128`, and matched:
  `Creating Context -  MapGeneration`,
  `[SWOOPER_MOD] [recipe:standard] [50/50] ok mod-swooper-maps.standard.placement.placement`,
  and `Destroying Context -  MapGeneration`.
- Failed first resource telemetry proof:
  - `Scripting.log` mtime: `2026-05-31 06:51:59 -0400`.
  - `Modding.log` mtime: `2026-05-31 06:51:54 -0400`.
  - `RESOURCE_PLACEMENT_V1` reported `plannedCount: 141`,
    `placedCount: 24`, `rejectedCount: 117`, `mismatchCount: 0`,
    `uniquePlannedTypes: 55`, `uniquePlacedTypes: 16`,
    `runtimeCatalogCount: 55`, `unmappedPlacedResourceTypes: []`, and placed
    count spread `1..3`.
  - This failed the resource runtime proof because only 16 symbolic resource
    types appeared live despite 55 planned candidate ids.
- The materialization repair assigned resources to engine-legal tiles with
  `canHaveResource` before placement, then reran socket/API runtime proof.
- Socrates review found a P1 after that first repair: rewritten or unassignable
  preferred resource ids disappeared from the proof artifact. The repair adds an
  explicit `assignment` summary to `artifact:placement.resourcePlacementOutcomes`
  so original preferred ids, reassigned counts, unassigned preferred placements,
  legal candidate ids, and unassignable candidate ids remain visible.
- A post-repair Studio socket/API proof attempt deployed the mod but returned
  HTTP 500 with `Timed out waiting for fresh Civ7 MapGeneration completion in
  Scripting.log`; `Scripting.log` and `Modding.log` did not advance beyond the
  `06:51` run.
- A repeat post-repair Studio socket/API proof attempt used
  `POST http://127.0.0.1:5174/api/map-configs` with `verifyRestart: true`,
  started at `2026-05-31T11:08:48.826Z`, deployed successfully from this
  worktree, and returned HTTP 500 with `FireTuner socket restart returned:
  false`.
- After the repeat attempt, log mtimes remained:
  - `Scripting.log`: `2026-05-31 06:51:59 -0400`.
  - `Modding.log`: `2026-05-31 06:51:54 -0400`.
- Continued diagnosis found a second Civ7 process showing
  `AppHost initialized failed in 'WillFinishLaunching' Exit code: 1`; closing
  that alert quit the duplicate failed process and left the original Civ7
  process as the sole FireTuner socket owner.
- The remaining Civ7 process still exposes FireTuner states `App UI` and
  `Tuner`; direct `App UI` probes showed `Network.restartGame` exists, the
  session reports `Network.isInSession === true`, one player, host player `0`,
  local player `0`, map script
  `{swooper-maps}/maps/swooper-earthlike.js`, non-network multiplayer,
  non-saved-game, previous age count `0`, and pause-menu restart conditions
  that appear restartable.
- Despite that restartable-looking session state, direct socket execution of
  `Network.restartGame()` returned `false` and did not advance `Scripting.log`
  or `Modding.log`.
- A bounded proof attempt through the second worktree Studio/API pair
  `POST http://127.0.0.1:5175/api/map-configs` with `verifyRestart: true`
  started at `2026-05-31T11:29:17.936Z`, deployed successfully from this
  worktree, and returned HTTP 500 with `FireTuner socket restart returned:
  false`.
- Runtime telemetry compaction:
  - Full per-symbolic-resource rows in `RESOURCE_PLACEMENT_V1` were too long
    for Civ7 `Scripting.log`; the `08:22:35` post-repair payload proved
    `148/148` placement but was truncated before JSON parse completed.
  - Runtime logging now emits a compact `version: 1` payload with counts,
    placed/planned/rejected resource id lists, unmapped placed ids, compact
    assignment counts, and reason totals. Full per-preferred-resource
    assignment diagnostics remain in the local placement proof artifact.
- Final Studio socket/API runtime boundary:
  - Downstack restart branch/commit used:
    `codex/firetuner-socket-studio-restart` at
    `bb39b3cf7 fix: submit Studio restarts through FireTuner socket`.
  - Source Studio API endpoint used for historical proof:
    `POST http://127.0.0.1:5175/api/map-configs`.
  - Deploy/restart request without internal log verification started at
    `2026-05-31T13:41:42.384Z` and finished at
    `2026-05-31T13:42:42.355Z` with HTTP `200`.
  - Deploy command/path:
    `bun run --cwd mods/mod-swooper-maps deploy`, deploying to
    `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps`.
  - Restart response:
    request id `studio-socket-mpttxk5i-x53`, agent
    `DRA-map-config-generation`, command `Network.restartGame()`, transport
    `firetuner-socket`, host `127.0.0.1`, port `4318`, state `App UI`
    (`65535`), output `["true"]`.
  - Civ7 then stopped at the front-end `Begin Game` confirmation boundary.
    FireTuner socket-side DOM `click()` found the button but did not advance
    generation; FireTuner socket focus followed by a local Return keypress did
    advance the same restarted setup into map generation.
  - Fresh bounded log evidence after that restart boundary:
    - `Scripting.log` mtime: `2026-05-31 09:45:59 -0400`.
    - `Modding.log` mtime: `2026-05-31 09:45:56 -0400`.
    - `Scripting.log` lines `828`, `922`, and `987` show
      `Creating Context -  MapGeneration`, compact
      `RESOURCE_PLACEMENT_V1`, and `Destroying Context -  MapGeneration`.
  - Final compact runtime payload length was `838` characters and parsed
    successfully:
    `plannedCount: 155`, `placedCount: 155`, `rejectedCount: 0`,
    `mismatchCount: 0`, `uniquePlannedTypes: 49`,
    `uniquePlacedTypes: 49`, placed count spread `1..8`,
    `runtimeCatalogCount: 55`, `unmappedPlacedResourceTypes: []`,
    `assignment.requestedPlannedCount: 155`,
    `assignment.assignedCount: 155`, `assignment.reassignedCount: 134`,
    `assignment.unassignedPreferredCount: 20`,
    `assignment.candidateResourceTypeCount: 55`,
    `assignment.legalCandidateResourceTypeCount: 49`, and
    `assignment.unassignableResourceTypes: [5, 14, 15, 23, 31, 37]`.
  - The placed resource id set was
    `[0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22,
    24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 38, 39, 40, 41, 42, 43,
    44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54]`.
  - This satisfies the resource-distribution runtime proof for engine-legal
    runtime ids: all requested placements were placed, no rejections or
    mismatches remained, no placed runtime resource id was unmapped, and the
    only absent catalog ids were recorded as unassignable for that map run.

## Integration Replay Verification

- On `2026-06-01`, `codex/integrate-resource-runtime-proof` replayed the source
  behavior above `codex/integrate-resource-ops-rollup` and verified:
  - `bun test mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts mods/mod-swooper-maps/test/placement/plan-ops.test.ts mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts`
  - `bun test mods/mod-swooper-maps/test/resources/resource-corpus-contract.test.ts mods/mod-swooper-maps/test/resources/resource-corpus-artifact.test.ts mods/mod-swooper-maps/test/resources/resource-earthlike-expectations-artifact.test.ts mods/mod-swooper-maps/test/resources/resource-aquatic-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-cultivated-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-terrestrial-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-geological-op-contract.test.ts mods/mod-swooper-maps/test/resources/resource-group-rollup-op-contract.test.ts`
  - `bun test mods/mod-swooper-maps/test/config/standard-authoring-surface-guards.test.ts apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`
  - `bun run --cwd mods/mod-swooper-maps check`
  - strict OpenSpec validation for `resource-distribution-root-cause`,
    `resource-placement-diversity`, `resource-diversity-stats-gate`,
    `resource-runtime-proof`, `resource-aquatic-operation-contract`,
    `resource-cultivated-operation-contract`,
    `resource-terrestrial-operation-contract`,
    `resource-geological-operation-contract`, and
    `resource-group-plan-rollup`
  - `bun run openspec:validate`
  - `git diff --check`
- No fresh in-game runtime run was performed from the integration branch.

## Closure State

- Source runtime behavior was locally committed via Graphite on
  `codex/resource-runtime-proof` at
  `a674a2ee62f08cf1e1fce5d958eb52e2aab07dd7`; external Graphite
  submission/PR delivery remains unclaimed until `gt submit` / PR evidence
  exists.
- Historical runtime proof is satisfied on the source resource stack above
  `bb39b3cf7` using the Studio FireTuner socket/API path plus the observed
  Civ7 `Begin Game` confirmation step. The integration branch replays that
  behavior above the Studio stack and keeps fresh in-game proof unclaimed.
