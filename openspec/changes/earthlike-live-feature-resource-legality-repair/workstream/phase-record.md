# Phase Record

## Phase

- Project: Swooper recovery
- Phase: feature/resource legality repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-resource-assignment-evidence-drain`
  stacked above `codex/swooper-feature-resource-legality-drain`
- Started: 2026-06-06
- Status: active. The adjacent-land resource class is classified and repaired
  in the repo-owned adapter/map-policy surface. Remaining feature/resource
  classes are linked but still pending source-authority classification.

## Objective

- Target movement: repair feature/resource parity and legality only where
  classified proof assigns ownership to repo code.
- Non-goals: no guessed tuning, no hand-authored official data.
- Done condition: classified rows are repaired or dispositioned and product
  acceptance rerun passes.

## Current State

- Single-writer handoff:
  - `codex/civ7-map-policy-final-surface-parity` remains the committed proof
    path layer at `70a22c815 docs(openspec): route parity proof deltas`.
  - This branch intentionally takes over only the downstream feature/resource
    legality classification lane from that clean parity state.
  - The branch switch itself is not a parity, acceptance, source-authority, or
    product-quality closure claim.
  - Product/tuning edits remain forbidden until concrete rows are classified to
    a repo-owned source authority.
- Activation evidence:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`
  from request `studio-run-in-game-mq20rbzr-1fhc`, exact-authorship status
  `complete`, live readback `106x66`, seed `138503614`, omitted plots `0`,
  stable turn/game-hash identity, and unresolved links
  `surface.terrain.mismatch`, `surface.feature.mismatch`, and
  `surface.resource.mismatch`.
- Row evidence:
  `openspec/changes/earthlike-live-feature-resource-legality-repair/workstream/delta-classification-ledger.md`
  records the concrete feature rows, resource example rows, and resource pair
  classes extracted from the exact-authored proof artifact. The adjacent-land
  resource class is classified; remaining feature/resource classes stay
  `source-authority: pending`.
- Static surface diagnostics:
  `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts`
  cross-checks feature/resource deltas against local and live terrain/biome/
  feature surfaces using `@civ7/map-policy` static official-derived tables.
  Pre-repair finding: feature rows were all static surface-legal; local
  resource values were static-legal; `26` live resource values failed only
  `resource.adjacent-land`. Current repaired finding: feature and resource
  deltas have no static surface invalid rows under the narrow runtime-observed
  adjacent-land exception.
- Classification progress:
  the `26` live-only adjacent-land rows are now classified to repo-owned
  adapter/map-policy static resource legality, based on exact-authored
  `RESOURCE_PLACEMENT_V1` evidence (`placedCount:252`, `rejectedCount:0`,
  `mismatchCount:0`) and matching live full-grid resource count. This
  authorized and received a narrow policy/mock parity repair only; all other
  resource substitution/local-only classes and all feature rows remain pending.
- Repair progress:
  `@civ7/map-policy` now records the live-observed adjacent-land exception
  narrowly for `RESOURCE_DYES`, `RESOURCE_FISH`, `RESOURCE_PEARLS`,
  `RESOURCE_COWRIE`, and `RESOURCE_TURTLES`; `@civ7/adapter` mock resource
  legality and the Swooper diagnostic helper consume that shared policy.
- Verification progress:
  focused policy/adapter/diagnostic tests, package checks, affected Turbo
  build/check lanes, and strict OpenSpec validation pass for this integration
  slice. This slice also integrates the source-recorded post-repair
  final-surface verifier rerun for `studio-run-in-game-mq20rbzr-1fhc`, which
  used the saved completed exact-authorship packet from the original proof and
  live full-grid readback from that Studio/Civ session:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-after-adjacent-land-policy.json`
  (`sha256:c80b0c9e77abb67bec29f84413a94d12b4aa17e9e2cf6fe788e48dd5fa91630b`,
  `proofHash:cb74141e0c63009ecb086dc73cf6955b457910f751038776c0cbd399f7a77dd3`,
  created `2026-06-06T09:44:55.799Z`). The rerun completed live grid
  readback with stable runtime identity and zero omitted plots, but it remains
  `status:"unresolved"` with `surface.terrain.mismatch`,
  `surface.feature.mismatch`, and `surface.resource.mismatch`.
- Resource source-authority progress:
  the local parity diagnostic now carries the exact local `resourcePlan` and
  typed `resourcePlacementOutcomes` evidence. A rerun with that evidence
  produced
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-assignment-evidence.json`
  (`sha256:e07418f9ab3efbab81beb6d5c6a9b68e1e40460b6d7421b5b1248a1e0578494c`,
  `proofHash:d95d54d2f208436324d7600a0c8a8a35e899ff82c617be4b719dfc954c6897df`)
  and summary
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-assignment-summary.json`
  (`sha256:e8d1917d657654bc0d494457c62b8c84a4613f22e024cd5ca770f7fbbb645d8b`).
  Local and live both contain `252` resource cells; local evidence records
  `252` planned placements, `252` typed placed outcomes, `0` rejections, and
  `0` local readback mismatches. The `106` resource deltas classify as
  `37` local assigned but live empty, `37` live-only with no local assignment,
  and `32` local assigned but live substituted. This narrows the remaining
  resource owner question to placement feasibility/order differences between
  local mock policy and Civ materialization, not static surface legality,
  density/count, or MapGen product tuning.
- Protected paths: generated outputs, official resources, unrelated worktrees.
- Next action: classify the remaining feature/resource rows by source
  authority: official data, adapter/map-policy, MapGen
  planning/materialization, accepted engine materialization, or readback
  limitation. Terrain edge rows may enter this slice only if diagnostics prove
  shared materialization ownership. The unchanged resource mismatch count after
  the adjacent-land repair and the assignment-evidence rerun means the next
  resource authority gap is a bounded Civ `ResourceBuilder.canHaveResource`
  / placement-feasibility readback surface for the delta rows, not resource
  tuning.
- Stop condition: source authority is not known for any row outside the
  classified adjacent-land resource class.
