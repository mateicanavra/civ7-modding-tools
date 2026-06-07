## Why

Feature and resource placement can diverge between local prediction and Civ live
materialization because of engine policy, official data, adapter policy, or
MapGen legality mistakes. Repairs must be driven by classified final-surface
proof, not by guessed resource tuning.

## Activation Gate

This change is evidence-gated. Do not implement it until final-surface parity
records feature/resource deltas that belong to repo-owned policy or MapGen
truth.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/civ7-map-policy-final-surface-parity/**`
- `openspec/changes/resource-*/**`
- `openspec/changes/swooper-world-balance-recovery/**`

## What Changes

- Classify feature/resource deltas by official data, map policy, adapter
  emulation, MapGen planning, or accepted engine materialization.
- Repair repo-owned legality or distribution behavior in the correct owner.
- Preserve natural-wonder materialization as a measured placement outcome:
  corrupt plans still fail, while planner shortfall, terrain projection, and
  adapter legality rejection are recorded in the placement artifact instead of
  aborting map generation.
- Preserve age/resource legality and measured spacing/diversity.

## Requires

- Observed feature/resource mismatch rows from exact-authored final-surface
  parity proof, followed by source-authority classification before repair.
- Routing evidence from `civ7-map-policy-final-surface-parity`: request
  `studio-run-in-game-mq20rbzr-1fhc` produced exact-authorship-complete,
  identity-stable full-grid proof with feature mismatches `5/6996` and resource
  mismatches `106/6996`.
- Feature hypotheses:
  one `FEATURE_COLD_REEF` local-only row may indicate Civ feature legality
  beyond mock/static policy; Kilimanjaro and Zhangjiajie one-tile offsets may
  indicate natural-wonder footprint anchor/direction semantics drift. Current
  supported-catalog context shows `5` multi-tile natural wonders have official
  `naturalWonderDirection:-1` while local projection materializes that as
  direction `0`; exact-run readback observes only Kilimanjaro and Zhangjiajie,
  so the class is narrowed but not yet a global repair authority. Current
  natural-wonder placement counts are local diagnostic evidence only; the
  exact live proof/completion payloads for the request do not yet carry
  `naturalWonderPlacement` stats. Natural-wonder materialization can still
  repair repo-owned outcome recording independently of exact live telemetry:
  it must not claim parity or product acceptance until a later exact proof
  carries those stats or otherwise classifies the remaining source authority.
- Resource hypotheses:
  the `106/6996` mismatch class includes relocation/substitution patterns that
  may come from mock/static resource legality, assignment-order divergence from
  Civ `ResourceBuilder.canHaveResource`, source data differences, or MapGen
  placement assumptions. This remains observed evidence, not a completed owner
  classification.
- Terrain edge mismatches `2/6996` are routed to terrain-policy diagnostics and
  may enter this slice only if investigation proves shared materialization
  ownership.

## Enables Parallel Work

- Product acceptance rerun for resources, wonders, ecology, and live parity.

## Affected Owners

- `packages/civ7-adapter/**`
- `packages/civ7-map-policy/**`
- `mods/mod-swooper-maps/**` resource/ecology/placement owners when proven

## Forbidden Owners

- No hand-authored official data lists.
- No resource rescue that silently violates authored spacing or age legality.
- No generated-output hand edits.

## Stop Conditions

- Official resource/feature facts are missing or stale.
- Deltas cannot be classified by source authority.

## Verification Gates

- Focused legality/distribution tests.
- Fresh full-grid feature/resource parity proof or classified residual deltas.
- OpenSpec strict validation.
