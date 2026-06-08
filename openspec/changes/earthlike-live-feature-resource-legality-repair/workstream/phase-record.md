# Phase Record

## Phase

- Project: Swooper recovery
- Phase: feature/resource legality repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-resource-feasibility-classification-drain`
  stacked above `codex/swooper-resource-feasibility-readback-drain`
- Started: 2026-06-06
- Status: active. The adjacent-land resource class is classified and repaired
  in the repo-owned adapter/map-policy surface, and bounded Civ resource
  feasibility classification now narrows the next resource repair class.
  Remaining feature/resource classes still need source-authority classification
  before repair.

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
- Civ feasibility readback progress:
  `@civ7/direct-control` now has a package-owned
  `getCiv7ResourcePlacementFeasibility` read wrapper over
  `ResourceBuilder.canHaveResource`. Live readback for the `106` resource
  delta rows is recorded at
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-feasibility-readback.json`
  (`sha256:139c8e52c2acd91b01415f8daee6b5dd27ee28e2db26857627118d993cc2e96c`).
  Strict `ignoreWeight:false` is not a clean post-materialization acceptance
  oracle because all `69` live non-empty delta probes returned false on the
  already-materialized map. With `ignoreWeight:true`, `68/69` live values and
  `59/69` local values are Civ-feasible; `37` live-only rows are feasible but
  were not locally assigned, `28` local-assigned/live-empty rows are feasible,
  `31` substitution rows have both local and live values feasible, `9`
  local-assigned/live-empty rows are local-overaccepted by the mock/static
  surface, and `1` substitution row remains feasibility-negative for both
  probed values. This points the next repair investigation at assignment
  ordering/rebalance and a smaller mock feasibility over-acceptance class.
- Row-level feasibility classification progress:
  `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts` now
  joins local resource delta plan/outcome context to a provided Civ resource
  feasibility readback. The diagnostic keeps `live-feasible-no-local-assignment`,
  `local-feasible-live-empty`, `local-overaccepted-live-empty`,
  `substitution-both-feasible`, and `substitution-both-infeasible` as separate
  proof classes. This preserves the `9` local-overacceptance investigation
  class and prevents the single both-infeasible substitution row from being
  swept into mock/static-policy repair authority.
- Full feasibility artifact progress:
  `scripts/civ7-direct-control/verify-resource-delta-feasibility.ts` now emits
  a complete row-level resource feasibility proof from a saved final-surface
  proof using package-owned direct-control readback. It first reads current
  live map identity through `getCiv7MapSummary` and blocks if width, height,
  plot count, seed, turn, or game hash do not match the saved proof identity.
  The current artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
  (`sha256:8ea0fcbf898c4cacd7bf1a19f8955e846e4c18631af4a7673ffc7cf058d8c35d`,
  `proofHash:b066b90c41d89e5be0cec575218b0e14351a18f8a1c416f5948249c5acfbd2b2`).
  Runtime identity is matched to the saved proof at `106x66`, `6996` plots,
  seed `138503614`, turn `1`, and game hash `0`. The artifact preserves the
  strict-readback caveat and records the `ignoreWeight:true` split: `37`
  live-feasible/no-local-assignment, `28` local-feasible/live-empty, `9`
  local-overaccepted/live-empty, `31` substitution-both-feasible, and `1`
  substitution-both-infeasible.
- Protected paths: generated outputs, official resources, unrelated worktrees.
- Next action: classify the remaining feature/resource rows by source
  authority: official data, adapter/map-policy, MapGen
  planning/materialization, accepted engine materialization, or readback
  limitation. Terrain edge rows may enter this slice only if diagnostics prove
  shared materialization ownership. The unchanged resource mismatch count after
  the adjacent-land repair and the assignment-evidence rerun means the next
  resource authority gap is assignment ordering/rebalance diagnostics plus
  focused mock feasibility classification for the `9` local-assigned/live-empty
  rows where Civ rejects the local value with `ignoreWeight:true`, not resource
  tuning. The single substitution row where both probed values are infeasible
  remains an individual evidence row with no repair authority until row-level
  context assigns source ownership.
- Stop condition: source authority is not known for any row outside the
  classified adjacent-land resource class.
