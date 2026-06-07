## 1. Activation

- [x] 1.1 Link concrete classified feature/resource delta rows from
  `studio-run-in-game-mq20rbzr-1fhc` for the adjacent-land resource class.
- [ ] 1.2 Link remaining concrete classified feature/resource delta rows from
  `studio-run-in-game-mq20rbzr-1fhc`.
- [x] 1.3 Identify source authority for the adjacent-land resource class:
  adapter/map-policy static runtime divergence.
- [ ] 1.4 Identify source authority for each remaining row: official data, adapter/map
  policy, MapGen planning, or accepted engine materialization.

## 2. Repair

- [x] 2.1 Add focused failing-row tests or diagnostics.
- [x] 2.2 Repair the proven adapter/map-policy owner for the adjacent-land
  resource class.
- [x] 2.3 Add local resource assignment evidence for remaining resource deltas.
- [x] 2.4 Add bounded Civ resource feasibility readback for resource deltas.
- [x] 2.5 Add row-level feasibility classification diagnostics for remaining
  resource deltas.
- [x] 2.6 Produce full row-level feasibility artifact for remaining resource
  deltas.
- [x] 2.7 Add official resource policy row/flag and spacing-neighborhood
  context for the focused local-overaccepted rows.
- [x] 2.8 Add live plot runtime context for resource delta feasibility rows.
- [x] 2.9 Add local resource assignment-phase trace for resource delta rows.
- [x] 2.10 Add local assignment-order context for the focused
  local-overaccepted rows.
- [x] 2.11 Add bounded ResourceBuilder cut/count diagnostics for the focused
  local-overaccepted rows.
- [x] 2.12 Add structured ResourceBuilder subclassification for the focused
  local-overaccepted rows.
- [x] 2.13 Add official ResourceBuilder row policy context for the focused
  local-overaccepted rows.
- [x] 2.14 Add assignment-class summary for local-authored resource delta rows.
- [x] 2.15 Add resource distribution count context for local-authored resource
  delta rows.
- [x] 2.16 Add same-resource position displacement context for local-authored
  resource delta rows.
- [x] 2.17 Add local resource materialization consistency context.
- [x] 2.18 Add immediate resource placement coordinate proof instrumentation for
  the next exact-authored run.
- [x] 2.19 Bind immediate resource placement coordinate proof into exact/parity
  proof intake.
- [x] 2.20 Add feature delta context for ecology-feature and natural-wonder
  offset classes.
- [x] 2.21 Add local feature/natural-wonder evidence context for feature delta
  classes.
- [x] 2.22 Add runtime-bound feature feasibility readback for feature delta
  classes.
- [x] 2.23 Add natural-wonder footprint direction context for feature offset
  rows.
- [x] 2.24 Add planned natural-wonder footprint readback context across local
  and live grids.
- [x] 2.25 Add supported-catalog direction context for natural-wonder footprint
  readback rows.
- [x] 2.26 Add natural-wonder live proof boundary context for local-only
  placement stats.
- [x] 2.27 Repair natural-wonder materialization outcome recording and
  footprint terrain projection without claiming exact live parity.
- [x] 2.28 Add exact log telemetry binding for natural-wonder placement stats.
- [x] 2.29 Preserve source-recorded fresh exact-authored natural-wonder
  telemetry proof artifact.
- [x] 2.30 Add row-level natural-wonder placement/rejection coordinate proof
  contract.
- [x] 2.31 Preserve source-recorded fresh exact-authored natural-wonder
  coordinate proof artifact.
- [x] 2.32 Classify natural-wonder rejected-placement source ownership from
  fresh coordinate proof.
- [x] 2.33 Repair the proven natural-wonder footprint projection/materialization
  owner without widening to product tuning.
- [x] 2.34 Preserve source-recorded exact-authored parity proof after the natural-wonder
  projection/materialization repair.
- [x] 2.35 Add named adapter rejection telemetry for natural-wonder placement
  proof-gap classification.
- [x] 2.36 Preserve source-recorded exact-authored natural-wonder named
  rejection proof.
- [x] 2.37 Add natural-wonder readback-mismatch observed-context telemetry.
- [x] 2.38 Preserve source-recorded exact-authored natural-wonder
  readback-context proof.
- [x] 2.39 Add complete expected-footprint post-write readback telemetry for
  natural-wonder `readback-mismatch` classification.
- [x] 2.40 Preserve source-recorded exact-authored natural-wonder post-write
  footprint proof artifact.
- [ ] 2.41 Produce current exact-authored parity proof after the natural-wonder
  projection/materialization repair.
  - Current checked-in config attempts `studio-run-in-game-mq3koapx-1qxe` and
    `studio-run-in-game-mq3kvvfs-1qxe` passed materialize/deploy/setup
    preparation but failed in `starting-game` with `setup-start-timeout` before
    `begin` was attempted; restart-backed attempt
    `studio-run-in-game-mq3l0b8p-1qxe` failed in `restarting-civ` because setup
    shell was not ready within `180000ms`. This supersedes the old stale
    `floodplainPlanning` schema blocker but does not produce current exact
    authorship or parity proof.
  - Current post-restart-hardening request
    `studio-run-in-game-mq3mojsw-1d0x` passed materialize/deploy,
    process-restart recovery, direct-control availability, and setup
    preparation. Restart telemetry recorded two Steam launch attempts
    (`started:false`, then `started:true`). It still failed in `starting-game`
    as `map-script-load-failed` with matched fresh Scripting log line
    `Failed to load file into script system - fs://game/swooper-maps/maps/studio-current.js`.
    No current `[mapgen-proof]`, `[mapgen-complete]`, exact-authorship packet,
    final-surface parity proof, or product acceptance proof was produced.
  - Current post-map-policy-bundling request
    `studio-run-in-game-mq3n8vkc-1qjg` used the same request body
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
    (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`),
    with post response
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-map-policy-bundle-post.json`
    (`sha256:855671f1291ead7c4ed2d8b2addbf784b761a30ac1104c0f71b3aff55b34749c`)
    and terminal status
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-map-policy-bundle-status.json`
    (`sha256:6b2997225b0dc872a12ba306fec47c5ad7b1a7767692758b6426b8104ee8ae4c`).
    It passed materialize/deploy, process-restart recovery, direct-control
    availability, setup-row visibility, setup preparation, and map-script load.
    It failed in `starting-game` as `map-generation-script-failed` with fresh
    Scripting log line:
    `[2026-06-07 06:34:54] [SWOOPER_MOD] Map generation failed: StepExecutionError: Step "mod-swooper-maps.standard.map-elevation.build-elevation" failed: [map-elevation/build-elevation] drift: expected land but adapter reports water at (34,17).`
    The deployed script identity was
    `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`
    (`sha256:ac3d7a05a4972cb8d264022bbffc4c220f0526e2ff322093bb8da2e0dfa6acdc`,
    `mtimeIso:2026-06-07T10:33:26.425Z`). No current `[mapgen-proof]`,
    `[mapgen-complete]`, exact-authorship packet, final-surface parity proof,
    or product acceptance proof was produced.
- [ ] 2.42 Repair remaining proven package or MapGen owners.
- [ ] 2.43 Preserve resource spacing, age legality, and diversity expectations.

## 3. Verification

- [x] 3.1 Re-run final-surface feature/resource parity proof.
- [ ] 3.2 Re-run product acceptance rows for resources/wonders/ecology.
- [x] 3.3 Run focused package tests/checks for touched owners.
- [x] 3.4 Run `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Re-run exact-authored final-surface parity after natural-wonder telemetry.
- [x] 3.7 Preserve source-recorded exact-authored final-surface parity after
  natural-wonder projection/materialization repair.
- [ ] 3.8 Re-run current exact-authored final-surface parity after natural-wonder
  projection/materialization repair.
  - Blocked on the current Studio/Civ runtime start/reload boundary above; no
    current `[mapgen-proof]`, `[mapgen-complete]`, exact-authorship packet, or
    final-surface parity artifact exists for the current branch.
  - Latest bounded retry is
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-map-policy-bundle-status.json`
    (`sha256:6b2997225b0dc872a12ba306fec47c5ad7b1a7767692758b6426b8104ee8ae4c`).
    It proves restart retry/status classification behavior and proves the
    generated map-script load blocker is cleared, but remains a runtime map
    generation blocker rather than final-surface parity proof.
- [x] 3.9 Run focused adapter/Swooper checks and tests for natural-wonder
  rejection telemetry.
- [x] 3.10 Preserve source-recorded exact-authored final-surface parity after
  named natural-wonder rejection telemetry.
- [x] 3.11 Run focused natural-wonder telemetry regression for readback context.
- [x] 3.12 Preserve source-recorded exact-authored final-surface parity after
  readback-context telemetry.
- [x] 3.13 Run focused adapter/Swooper expected-footprint telemetry
  regressions.
- [x] 3.14 Preserve source-recorded exact-authored final-surface parity after
  post-write footprint telemetry.
