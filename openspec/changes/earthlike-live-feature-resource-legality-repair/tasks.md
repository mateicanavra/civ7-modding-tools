## 1. Activation

- [x] 1.1 Link concrete classified feature/resource delta rows from
  `studio-run-in-game-mq20rbzr-1fhc` for the adjacent-land resource class.
- [ ] 1.2 Link remaining concrete classified feature/resource delta rows from
  `studio-run-in-game-mq20rbzr-1fhc`.
  - Current `studio-run-in-game-mq3pfgbe-1doj` diagnostics now link the current
    unresolved rows at proof-artifact level, but they do not complete
    source-authority classification: terrain rows are `139` unresolved,
    feature rows are `381`, and resource rows are `308`.
- [x] 1.3 Identify source authority for the adjacent-land resource class:
  adapter/map-policy static runtime divergence.
- [ ] 1.4 Identify source authority for each remaining row: official data, adapter/map
  policy, MapGen planning, or accepted engine materialization.
  - Current terrain diagnostic artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-terrain-edge-live-readback-context.json`
    (`sha256:fb3e0e912897253066d53720ca51346c1ac7c6ef940384028e351935a1f176a4`,
    `proofHash:fc2226d188385c50e5163256304971893a94210fe6175d60ba28f4b242769876`)
    preserves `139` terrain rows with matched runtime identity. It leaves all
    rows source-authority `unresolved` (`138` unclassified, `1`
    `local-coast-live-ocean`).
  - Current feature diagnostic artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-feature-delta-feasibility.json`
    (`sha256:a827a0e0c6560950cf8e944ed7a566911c2b16d3fb79b173ccea2d1e29e1f8ae`,
    `proofHash:77e2565802122291e9ec50dfb0752dbdb70fd7bf5cd54185e56172a127acf1d0`)
    preserves `381` feature rows: `166`
    `live-feature-civ-infeasible-local-empty`, `78`
    `local-feature-civ-infeasible-live-empty`, `30`
    `local-feature-civ-feasible-live-empty`, and `107` unclassified swaps.
  - Current resource diagnostic artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-resource-delta-feasibility-full.json`
    (`sha256:05512721dba9cb8a9a63d6a87702d7daf8439a658bb9680827c65bfab73be03a`,
    `proofHash:7eb8a38538bd8c61d7b8cd96f0b01984cd6bb68c4b581c09565e950a78ee9ff9`)
    preserves `308` resource rows with matched runtime identity. Under
    `ignoreWeight:true`, class counts are `114`
    live-feasible/no-local-assignment, `53` local-feasible/live-empty, `62`
    local-overaccepted/live-empty, `51` substitution-both-feasible, `27`
    substitution-mixed-feasibility, and `1` substitution-both-infeasible.
  - Current source-authority synthesis does not close this row. It narrows the
    next proof targets:
    terrain remains a projection/readback-owner question (`139` unresolved
    rows, dominated by coast/flat/hill/navigable-river edge swaps); feature
    repair authority is strongest for the `78` local-only ecology features that
    Civ reports infeasible and the `30` local-only ecology features that Civ
    reports feasible but live omits; resource repair authority is strongest for
    the `62` local-overaccepted/live-empty rows, especially the `56`
    scarce-floor rows at target `7`. Live-only resource additions (`114`) and
    both-feasible substitutions (`51`) remain materialization/projection
    questions, not tuning authority.

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
- [x] 2.41 Produce current exact-authored parity proof after the natural-wonder
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
  - Post-elevation-policy request `studio-run-in-game-mq3nyiss-8oj` used the
    same request body, with post response
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-elevation-drift-policy-post.json`
    (`sha256:4a7736e1688d1c1eca3763f6e34d403830f7bbf5cf690dadb0671d4166565c39`)
    and terminal status
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-elevation-drift-policy-status.json`
    (`sha256:e34125c5b73ce1fbd11b5f67cff51a196d35cfc45700b95338a967ef61de4c67`).
    It passed materialize/deploy, process-restart recovery, setup preparation,
    map-script load, and map generation through all `50/50` recipe steps.
    Scripting.log records `[mapgen-proof]` for the same request/config/envelope
    chain, bounded `WATER_DRIFT_POLICY_V1` at `2/6996` tiles
    (`withinPolicy:true`), `NATURAL_WONDER_PLACEMENT_V1`,
    `RESOURCE_PLACEMENT_V1`, and `Destroying Context -  MapGeneration`. It
    failed in `waiting-for-proof` as `log-timeout` because `[mapgen-complete]`
    was absent. No exact-authorship packet, final-surface parity proof, or
    product acceptance proof was produced.
  - Post-SDK-marker request `studio-run-in-game-mq3omoo3-8oj` used the same
    request body, with post response
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-sdk-completion-marker-post.json`
    (`sha256:b4771cf60933177152524fa6b2b7f8f5ff4ab9f76c2c6fc4f2613235918c4b1f`)
    and terminal status
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-sdk-completion-marker-status.json`
    (`sha256:0e7ce1c2cec43ba6bc482a455af56d620be49e3e0d2d1721fcb3ee7d450e1f7d`).
    It passed materialize/deploy, process-restart recovery, setup preparation,
    map-script load, and map generation through all `50/50` recipe steps.
    Scripting.log records `[mapgen-proof]`, bounded `WATER_DRIFT_POLICY_V1`,
    `NATURAL_WONDER_PLACEMENT_V1`, `RESOURCE_PLACEMENT_V1`, and
    `[mapgen-complete]` for request `studio-run-in-game-mq3omoo3-8oj`.
    Studio still failed in `waiting-for-proof` as `log-timeout` because the
    direct-control fresh-log waiter carried pre-restart offset `31578` into a
    Civ-rewritten log file and sliced past the proof markers. No
    exact-authorship packet, final-surface parity proof, or product acceptance
    proof was produced.
  - Post-log-rewrite-reader request `studio-run-in-game-mq3pfgbe-1doj` used
    the same request body
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
    (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`),
    with post response
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-post.json`
    (`sha256:e2640bf851b30bfe54f95a96a24867c65068c0cb30d8dbdf89528a2f4e9e1f8d`)
    and terminal status
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-status.json`
    (`sha256:381e25d77639fcf3fe1660524ba7ead72cabb7c60f7dadb53062ca684bbd9ed6`).
    It completed materialize/deploy, process-restart recovery, setup
    preparation, map-script load, all recipe steps, and `waiting-for-proof`.
    `exactAuthorshipProof.status` is `complete` with no unresolved links, and
    Scripting.log matched `[mapgen-proof]` and `[mapgen-complete]` for request
    `studio-run-in-game-mq3pfgbe-1doj`. This proves the current runtime/log
    completion blocker is cleared and produces current exact-authorship
    evidence. It does not itself run the final-surface parity verifier or
    product acceptance rows, so this task and 3.8 remain open until that
    verifier artifact exists.
  - Current exact-authored final-surface verifier artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-current-final-surface-parity.json`
    (`sha256:24743163cf07f2741e9b7e4b3ae3f018811788f9beb77550748f214ea977c035`,
    `proofHash:fb1edeedbf479b446190d895e9137dc023e36223d6cb0bdeca8c0a60ee481c2d`,
    created `2026-06-07T11:50:17.262Z`) completed with live identity stable:
    seed `138503614`, dimensions `106x66`, plot count `6996`, turn `1`,
    game hash `0`, and `0` omitted plots across `17` chunks. Parity remains
    `unresolved`, with links `surface.terrain.mismatch`,
    `surface.biome.mismatch`, `surface.feature.mismatch`,
    `surface.resource.mismatch`, `resource-placement-coordinate-proof.placed`,
    and `resource-placement-coordinate-proof.rejected`. The verifier log is
    `/tmp/civ7-recovery-proof/final-surface-parity/verify-final-surface-parity-current-mq3pfgbe.log`
    (`sha256:6f1167800a46975af0dd1d1ba8bbbbfe99d7bcf657ac63060e217341f909c28e`).
- [ ] 2.42 Repair remaining proven package or MapGen owners.
  - Current branch `codex/swooper-map-elevation-drift-policy-drain` repairs the
    locally proven map-elevation owner mismatch: `buildElevation` now applies
    the accepted bounded water-drift policy instead of the strict no-drift
    assert. Focused local tests/checks pass, but runtime proof is still pending.
  - Current branch `codex/swooper-sdk-mapgen-completion-marker-drain` repairs
    the locally proven SDK marker gap: `createMap` now emits
    `[mapgen-complete]` after successful recipe execution. Focused SDK
    tests/checks pass, and runtime logs prove the marker is emitted, but Studio
    proof closure is still pending the log-rewrite reader repair.
  - Current follow-on slice repairs the locally proven direct-control/Studio
    log reader gap: `snapshotFile` now preserves a log prefix, and fresh-log
    readers use byte `0` when Civ rewrites `Scripting.log` beyond the old
    offset. Focused direct-control and Studio tests/checks pass, and current
    request `studio-run-in-game-mq3pfgbe-1doj` proves the committed repair in
    Studio/Civ by reaching `status:"complete"` with exact-authorship and
    `[mapgen-complete]` evidence. Keep this row open only as the remaining
    bucket for any future package or MapGen owners proven by the open
    source-authority rows.
  - Current diagnostics do not yet prove a new owner repair. The candidate
    proof queue is: resource scarce-floor/local-overaccepted authority first,
    local-only ecology-feature materialization authority second, terrain
    projection/readback authority third. Do not tune or repair broader
    live-only/substitution classes until a source owner is proven.
- [ ] 2.43 Preserve resource spacing, age legality, and diversity expectations.
  - Current exact log proves `251` planned resources, `250` placed, `1`
    rejected, `0` mismatched, `34` unique planned/placed types, min/max placed
    count by type `7/8`, and runtime catalog count `55`.
  - Current resource diagnostics preserve the broader class context but do not
    yet authorize repair: `194` local-assigned delta rows, `183` from
    `scarce-floor`, and `62` local-overaccepted/live-empty rows subclassified
    as `39` scarce-floor cut-excluded, `17` scarce-floor cut-included rejected,
    and `6` non-scarce-floor local overaccepted.
  - Any accepted resource repair must preserve the current proof-class
    separation: exact runtime distribution breadth (`34` placed resource types,
    min/max placed count by type `7/8`) is a product-health guard, while
    unresolved coordinate parity is still not product acceptance.
- [x] 2.44 Expose local-vs-exact resource coordinate proof comparison in
  final-surface parity artifacts.
  - This is proof instrumentation only. It makes the existing
    `resource-placement-coordinate-proof.*` gate self-describing by preserving
    local and exact coordinate digests plus mismatched links in the parity
    artifact. It does not change final-surface parity status, resource tuning,
    scarce-floor assignment, or product acceptance.
  - Refreshed artifact
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-current-final-surface-parity-with-resource-coordinate-summary.json`
    (`sha256:44dee661491ee3d013a9326745fb30825c6155cdbb45af633f57ebb87fda23df`,
    `proofHash:ce8a5a568bb91678ceb9f108b525d557cbd6b9820f10ebaad0639800cce6d091`)
    preserves the current mismatch: local placed `251`/`98393a08`, exact
    placed `250`/`9c5eaad8`; local rejected `0`/`811c9dc5`, exact rejected
    `1`/`af57eb7b`.

## 3. Verification

- [x] 3.1 Re-run final-surface feature/resource parity proof.
- [ ] 3.2 Re-run product acceptance rows for resources/wonders/ecology.
- [x] 3.3 Run focused package tests/checks for touched owners.
- [x] 3.4 Run `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`.
- [x] 3.5 Run `bun run openspec:validate`.
- [x] 3.6 Re-run exact-authored final-surface parity after natural-wonder telemetry.
- [x] 3.7 Preserve source-recorded exact-authored final-surface parity after
  natural-wonder projection/materialization repair.
- [x] 3.8 Re-run current exact-authored final-surface parity after natural-wonder
  projection/materialization repair.
  - No longer blocked on the Studio/Civ runtime start/reload boundary above:
    current request `studio-run-in-game-mq3pfgbe-1doj` completed
    exact-authorship and mapgen-completion proof on committed head
    `5537f2a829f8dd1452fec81d002c4afc1f0826a6`.
  - Latest current verifier artifact is
    `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-status.json`
    (`sha256:381e25d77639fcf3fe1660524ba7ead72cabb7c60f7dadb53062ca684bbd9ed6`)
    as the exact-authorship input plus
    `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-current-final-surface-parity.json`
    (`sha256:24743163cf07f2741e9b7e4b3ae3f018811788f9beb77550748f214ea977c035`,
    `proofHash:fb1edeedbf479b446190d895e9137dc023e36223d6cb0bdeca8c0a60ee481c2d`)
    as the final-surface parity output.
    It proves restart retry/status classification, map-script load,
    map-elevation bounded-drift handling, SDK completion-marker emission, and
    direct-control/Studio rewritten-log proof reading, then preserves the
    current final-surface parity result. The result is `unresolved`, not
    acceptance proof: terrain mismatches `139/6996`, biome mismatches
    `874/6996`, feature mismatches `381/6996`, and resource mismatches
    `308/6996`, with resource coordinate proof placed/rejected links still
    unresolved.
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
- [x] 3.15 Run focused final-surface parity proof regression for resource
  coordinate proof comparison.
  - Runtime-bound verifier rerun used
    `current-drain-after-log-rewrite-reader-status.json` as exact-authorship
    input and wrote the refreshed artifact above. Exit code `2` is expected
    because parity remains `unresolved`.
