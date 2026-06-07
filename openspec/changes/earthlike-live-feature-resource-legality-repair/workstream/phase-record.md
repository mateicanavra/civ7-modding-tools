# Phase Record

## Phase

- Project: Swooper recovery
- Phase: feature/resource legality repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: `codex/swooper-resource-builder-policy-context-drain`
  stacked above `codex/swooper-resource-builder-classifier-drain`
- Started: 2026-06-06
- Status: active. The adjacent-land resource class is classified and repaired
  in the repo-owned adapter/map-policy surface, and bounded Civ resource
  feasibility plus row/static-policy/live-plot, assignment-order, and
  ResourceBuilder diagnostic/subclassification/policy context now narrows the
  next resource repair class.
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
  (current sha256:
  `ff4aec0701cbeeb031737b68d93a0a48e9168313ef983cc30a3df91cff6f08ab`,
  current proofHash:
  `e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`)
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
  proof using package-owned direct-control readback. It resolves request id
  from exact-authorship summary, packet, source snapshot, and log fields, and
  blocks if those sources are missing or conflicting. It then reads current
  live map identity through `getCiv7MapSummary` and blocks if width, height,
  plot count, seed, turn, or game hash do not match the saved proof identity.
  The current full feasibility artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
  (`sha256:30e8cf009798e974f733f5bec25fe49baf0bfdd887af10348eca92de88ba233c`,
  `proofHash:e01f679e01db7ce2639b01578cc3b060d5c4f2b5eac8269fcdb4db7564ec44c0`).
  Request identity resolves to `studio-run-in-game-mq20rbzr-1fhc`; runtime
  identity is matched to the saved proof at `106x66`, `6996` plots, seed
  `138503614`, turn `1`, and game hash `0`. The artifact preserves the
  strict-readback caveat, carries local/live surface context, official
  resource policy row/flag evidence, static legality reasons, and
  spacing-neighborhood context for every resource delta row, adds live plot
  runtime context for the same `106` cells, and records the `ignoreWeight:true`
  split: `37` live-feasible/no-local-assignment, `28`
  local-feasible/live-empty, `9` local-overaccepted/live-empty, `31`
  substitution-both-feasible, and `1` substitution-both-infeasible.
- Official-policy and spacing context progress:
  the `9` local-overaccepted/live-empty rows all have exactly one official
  resource placement row matching the local terrain/biome/feature surface, no
  adjacent-land requirement, `lakeEligible:true`, and no local or live resource
  neighbor inside the authored `minSpacingTiles:2` spacing bound. This removes
  simple official row, adjacent-land, and authored spacing explanations for the
  class, but does not yet prove whether the owner is mock/static policy,
  runtime materialization state, placement order, or another Civ
  `ResourceBuilder.canHaveResource` constraint.
- Live plot context progress:
  the verifier now reads package-owned `getCiv7MapGrid` context for the same
  `106` resource delta cells before feasibility probes. For the `9`
  local-overaccepted/live-empty rows, the live runtime facts confirm the cells
  are live-empty, unowned, non-water, untagged, and have no river. Their
  elevations, rainfall, fertility, area ids, region ids, and landmass ids are
  preserved in the artifact for row-level comparison. This removes obvious
  owner/water/tag/river explanations, but still does not expose the internal
  `ResourceBuilder.canHaveResource` rejection reason or authorize mock/static
  policy repair.
- Assignment trace progress:
  local resource placement now records an `assignmentTrace` row for each local
  resource intent, including assignment phase, initial resource type, final
  resource type, preferred resource type, and whether rebalance changed the
  assignment. The regenerated exact-authored resource feasibility artifact
  shows all `9` focused local-overaccepted/live-empty rows came from the local
  `scarce-floor` assignment phase and none were changed by rebalance. This
  removes relaxed-spacing and rebalance as explanations for the focused class,
  but it still does not identify the hidden Civ feasibility constraint that
  rejected those cells.
- ResourceBuilder diagnostics progress:
  `@civ7/direct-control` now exposes a bounded
  `getCiv7ResourceBuilderDiagnostics` read wrapper for the focused rows. The
  current regenerated runtime-bound artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
  has sha256
  `30e8cf009798e974f733f5bec25fe49baf0bfdd887af10348eca92de88ba233c`
  and proofHash
  `e01f679e01db7ce2639b01578cc3b060d5c4f2b5eac8269fcdb4db7564ec44c0`.
  It keeps the exact-authored source proof hash
  `e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`
  and reads ResourceBuilder diagnostics for the `9` focused cells with `0`
  omitted cells. All `9` remain false under both strict and
  `ignoreWeight:true` `canHaveResource`. Civ `getBestMapResourceCuts` excludes
  the local resource for `6` rows and includes it for `3` rows that are still
  rejected, so cut-list exclusion explains part but not all of the class. All
  probed resource types are age-valid, counts are present, and the
  ResourceBuilder landmass probe returns `255` for each local resource type.
  This narrows the next source-authority step to hidden ResourceBuilder cut
  ordering/landmass/count or materialization-state constraints; it still does
  not authorize mock/static-policy repair, resource tuning, parity closure, or
  product acceptance.
- Assignment-order context progress:
  the typed local `resourcePlacementOutcomes.assignmentTrace` now records
  assignment order, per-type count before assignment, legal local plot count for
  the resource, and the scarce-floor target. The regenerated local assignment
  evidence artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-assignment-evidence.json`
  has sha256
  `ff4aec0701cbeeb031737b68d93a0a48e9168313ef983cc30a3df91cff6f08ab`
  and proofHash
  `e448cad8023b1478aff5fe40d30f23a23f4a71eed47ce614464db88ac01586df`.
  The regenerated resource feasibility artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
  has sha256
  `30e8cf009798e974f733f5bec25fe49baf0bfdd887af10348eca92de88ba233c`
  and proofHash
  `e01f679e01db7ce2639b01578cc3b060d5c4f2b5eac8269fcdb4db7564ec44c0`.
  The `9` focused rows are all scarce-floor assignments made before their local
  resource type reached the floor target (`targetMinPerType:7`), with local
  legal plot counts between `66` and `554`. This proves the local reason those
  cells were selected: the assignment pass was filling per-type floor quota
  against local adapter/static legality. It does not yet prove whether repair
  belongs in the local scarce-floor candidate/cut ordering policy, in an
  adapter/mock approximation of hidden Civ constraints, or in an accepted
  materialization-state disposition.
- ResourceBuilder subclassification progress:
  the full feasibility artifact now carries a structured
  `resourceBuilderSubclassification` block for the `9` focused rows. It records
  `6` `scarce-floor-cut-excluded` rows and `3`
  `scarce-floor-cut-included-rejected` rows, preserving assignment order,
  per-type floor progress, local legal plot count, cut membership, and
  `canHaveResource` results per row. This makes the next owner decision
  auditable without treating either subclass as repair authority.
- ResourceBuilder policy context progress:
  the subclassification now also preserves each focused resource's official
  ResourceBuilder row policy. All `9` rows have local `targetMinPerType:7`
  while the official `MinimumPerHemisphere` is `3`, so the local scarce-floor
  target exceeds the official minimum by `4` for every focused row. The `3`
  cut-included-but-rejected rows are all non-required resources with current
  ResourceBuilder count `8`; the `6` cut-excluded rows mix required and
  non-required resources. This sharpens the owner question toward local
  scarce-floor quota policy versus post-materialization Civ count/cut state, but
  the readback still occurs after map materialization and therefore is not, by
  itself, pre-materialization repair authority.
- Protected paths: generated outputs, official resources, unrelated worktrees.
- Next action: classify the remaining feature/resource rows by source
  authority: official data, adapter/map-policy, MapGen
  planning/materialization, accepted engine materialization, or readback
  limitation. Terrain edge rows may enter this slice only if diagnostics prove
  shared materialization ownership. The unchanged resource mismatch count after
  the adjacent-land repair and the assignment-evidence rerun means the next
  resource authority gap is broad assignment ordering diagnostics for the
  feasible live-only/local-empty/substitution classes plus hidden runtime
  feasibility classification for the `9` local-assigned/live-empty rows where
  Civ rejects the local value with `ignoreWeight:true`. For those `9` rows,
  assignment trace rules out relaxed spacing and rebalance, and ResourceBuilder
  diagnostics and the structured subclassification show `6` local resources
  absent from Civ cut lists while `3` local resources are present in cut lists
  but still rejected. Assignment-order and policy context show every focused
  local value came from the scarce-floor quota pass and that the local floor
  target exceeds the official minimum-per-hemisphere, but the current
  ResourceBuilder rejection facts are still post-materialization readback. No
  resource tuning, static-policy repair, scarce-floor repair, or
  assignment-order repair is authorized until those subclasses are assigned to a
  concrete source owner. The single substitution row where both probed values
  are infeasible remains an individual evidence row with no repair authority
  until row-level context assigns source ownership.
- Stop condition: source authority is not known for any row outside the
  classified adjacent-land resource class.
