# Phase Record

## Phase

- Project: Swooper recovery
- Phase: feature/resource legality repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: current recovery drain tip
  `codex/swooper-post-wonder-feature-classification-drain`, stacked above
  `codex/swooper-wonder-proof-record-drain` and
  `codex/swooper-wonder-direction-repair-drain`; this slice carries
  source-recorded post-repair feature-row classification after the
  natural-wonder projection/materialization repair.
- Started: 2026-06-06
- Status: active. The adjacent-land resource class is classified and repaired
  in the repo-owned adapter/map-policy surface. Source-recorded post-repair
  evidence shows a natural-wonder materialization/deploy proof gap: exact live
  telemetry still rejected two anchors, while local verifier generation saw
  `7/7/0`. The remaining natural-wonder feature offsets and cold-reef row are
  evidence-bound pending fresh exact telemetry. Current exact proof still
  blocks on stale config before parity evaluation, and resource classes remain
  pending source-authority classification.

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
  (`sha256:4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`,
  `proofHash:cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`).
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
  `4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`
  and proofHash
  `cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`.
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
  `4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`
  and proofHash
  `cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`.
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
- Assignment-class summary progress:
  the full feasibility artifact now also records `assignmentClassSummary` across
  all local-authored resource delta rows. Of `69` local-authored resource delta
  rows, `64` (`92.75%`) came from the local `scarce-floor` assignment phase with
  `targetMinPerType:7`. This includes all `28` local-feasible/live-empty rows,
  all `9` local-overaccepted/live-empty rows, `26` of `31` both-feasible
  substitutions, and the single both-infeasible substitution row. The remaining
  `5` both-feasible substitutions came from `strict-spacing` after their type
  had already reached the same floor target. This broadens the source-authority
  question from a 9-row legality anomaly to a scarce-floor assignment policy
  divergence across most local-authored resource deltas, while still not
  authorizing a repair without an owner decision.
- Resource distribution context progress:
  `getCiv7ResourceBuilderDiagnostics` now accepts a bounded metadata-only
  resource type list so the verifier can read official rows/counts for all
  locally assigned delta resource types without widening expensive per-cell
  cut/feasibility probes beyond the `9` focused rows. The regenerated
  runtime-bound full artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-resource-delta-feasibility-full.json`
  has sha256
  `4b6534e577c8d337df66ea42fd33a1d3674b8043a73fbc40c481e16c0cd5324e`
  and proofHash
  `cf91a10f32f8a53297058e5712039227869744d8f6354a59ce06b3dc7a8ac259`.
  It records `26` local resource types across `69` local-authored delta rows.
  For all `26`, local assigned count equals current ResourceBuilder count
  (`assignedMinusResourceBuilderCount:0`), while `25/26` still have local
  `targetMinPerType:7` above official `MinimumPerHemisphere` by `4`
  (`RESOURCE_SILVER` is below its official minimum by `1`). This weakens broad
  per-resource count mismatch as the remaining owner and moves the next source
  authority question toward positional cut/order/materialization behavior. The
  ResourceBuilder counts remain current post-materialization readback and do
  not authorize scarce-floor, resource tuning, parity closure, Earthlike
  acceptance, or product-proof claims.
- Resource position context progress:
  the full artifact now also records a same-resource live-delta match for each
  local-authored resource delta row. All `69/69` local-authored delta resources
  have an unmatched live delta row with the same resource type; `0` local rows
  are unmatched. Distances are broad rather than local swaps: min `2`, p50
  `27`, p90 `46`, max `59`, with `53/69` matches at distance `11+`. Match
  targets are `37` live-only/no-local-assignment rows and `32`
  local-assigned/live-substitution rows. This further weakens missing-resource
  or broad resource-count explanations and points the next source-authority
  step at positional cut/order/materialization behavior under the exact-authored
  run. The matching is a classifier over observed local/live delta rows only;
  it does not prove Civ placement authorship, authorize scarce-floor or resource
  tuning repair, close parity, or establish product acceptance.
- Local resource materialization context progress:
  the full artifact now compares typed local resource placement outcomes against
  the local final resource surface. All `252/252` placed outcomes match the
  local final resource surface, and all `69/69` local-authored resource delta
  rows match their typed local placement outcome. This rules out local
  post-resource placement drift inside the local artifact for the resource
  mismatch class. Combined with same-resource live displacement and matching
  per-resource counts, the remaining source-authority question is now bounded
  to live/Civ materialization, live readback timing, or missing immediate
  post-placement live coordinate evidence. This does not itself prove live Civ
  final-surface authorship or authorize product repair.
- Resource placement coordinate proof progress:
  `placement.resourcePlacementOutcomes.summary` now carries a deterministic
  `coordinateProof` block for placed, rejected, and mismatch resource outcomes.
  Runtime `RESOURCE_PLACEMENT_V1` telemetry now emits the compact placed
  coordinate hash/count, plus rejected or mismatch hashes when present, while
  omitting redundant planned-type arrays to stay under the Civ scripting-log
  truncation guard. This creates the missing immediate-placement coordinate
  identity needed by the next exact-authored run. It does not retroactively
  classify request `studio-run-in-game-mq20rbzr-1fhc`, because that saved proof
  predates the coordinate digest.
- Resource placement coordinate proof intake progress:
  Studio exact-authorship log parsing now captures the bounded
  `RESOURCE_PLACEMENT_V1` telemetry line only when it appears between the
  matching `[mapgen-proof]` and `[mapgen-complete]` payloads for the same
  request/config/envelope/seed chain. Final-surface parity proof now compares
  the local `resourcePlacementOutcomes.summary.coordinateProof` digest against
  the exact log coordinate digest when local evidence carries one. Missing or
  mismatched coordinate proof keeps parity unresolved with named
  `resource-placement-coordinate-proof.*` links.
- Feature delta context progress:
  `mods/mod-swooper-maps/src/dev/diagnostics/surface-delta-context.ts` now
  classifies feature mismatch rows into bounded evidence classes. The current
  feature context artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-delta-context.json`
  (`sha256:a4f78cb9987ecf773be2fef9f597c9a1a019292da95f8c70af274c5623c72363`).
  It splits the `5` feature mismatches into one local-only
  `FEATURE_COLD_REEF` row and two same-feature one-tile natural-wonder offsets
  (`FEATURE_KILIMANJARO` and `FEATURE_ZHANGJIAJIE`, each represented by local
  and live anchor rows). This is classification context only: the reef row
  still needs feature-intent/application versus live engine proof, and the
  natural-wonder offsets still need planned anchor/direction/footprint proof
  before repair ownership can be assigned.
- Feature local evidence context progress:
  `runLocalFinalSurfaceSnapshot` now exports local feature intent families,
  feature-apply diagnostics, natural-wonder plan, and natural-wonder placement
  stats from existing artifacts, and the feature delta diagnostic joins that
  evidence when present. The current local-evidence artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-local-evidence-context.json`
  (`sha256:729cc1d2c3b080177b524293991ceff8b7bc312796dac31a8e59053cda7f1c45`).
  It is a local exact-source rerun joined to the saved live grid, not a fresh
  exact-authored live parity proof. It proves local feature apply attempted and
  applied `1501/1501` rows with `0` rejections; local `FEATURE_COLD_REEF`
  applied count is `55`; natural wonders planned/placed/rejected are `7/7/0`.
  The local cold-reef delta row `(48,6)` has a local reef intent; the local
  `FEATURE_KILIMANJARO` and `FEATURE_ZHANGJIAJIE` mismatch anchors are within
  planned local natural-wonder footprints. This narrows, but does not close,
  feature ownership: live `canHaveFeature`/materialization/readback evidence is
  still required before repair authority.
- Feature live feasibility readback progress:
  `@civ7/direct-control` now has a package-owned
  `getCiv7FeaturePlacementFeasibility` wrapper over
  `TerrainBuilder.canHaveFeature`, and
  `scripts/civ7-direct-control/verify-feature-delta-feasibility.ts` binds that
  readback to the saved exact-authored parity proof before probing. The current
  artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-delta-feasibility.json`
  (`sha256:abaff5fe8bcb09fa2e66e95dc640645f4cf59e80d68bddcbba0921e394fbf0a1`,
  `proofHash:ed60244c6ea6548dbf7ff43ea154c38e4276d1ebd5b909860577f6f81c59ea01`).
  It resolves request identity to `studio-run-in-game-mq20rbzr-1fhc` and
  matches current runtime identity to the saved proof at `106x66`, `6996`
  plots, seed `138503614`, turn `1`, and game hash `0`. It probes the `5`
  feature delta cells with `0` omitted cells and joins the prior local
  feature-context artifact (`sourceContextHash:
  945a49133d0493cc37cf28ff805637aaf5fc7032a6b3461b805a65ff8a861657`). All
  probed candidate values return `TerrainBuilder.canHaveFeature=false`: the
  local-only cold-reef row is `local-feature-civ-infeasible-live-empty`, and
  the two natural-wonder one-tile offset pairs split into two
  `natural-wonder-offset-local-civ-infeasible` and two
  `natural-wonder-offset-live-civ-infeasible` rows. Because the readback is
  post-materialization and the live natural-wonder cells also return false, it
  is not a clean pre-placement acceptance oracle. It narrows the feature owner
  question toward runtime materialization state, natural-wonder stamping
  semantics, or readback policy, but it still does not authorize feature,
  natural-wonder, terrain, parity, product, or tuning repair.
- Feature footprint direction context progress:
  `buildFeatureDeltaPlacementContexts` now records all six local
  map-policy footprint direction alternatives for planned natural-wonder rows.
  The current direction-context artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-feature-footprint-direction-context.json`
  (`sha256:bbb9b1ce680af7e6f456cb7fb594b88d892a1fa3a8e1287982fb9a560b918c42`).
  It is derived from the saved exact parity proof plus the prior local feature
  context artifact; it is not a fresh parity proof and does not mutate product
  code. For both affected natural wonders, the current local policy helper's
  normalized declared direction `0` contains the local feature row. The live
  offset row is explained by a different direction alternative: Kilimanjaro's
  live row `(48,13)` is contained by directions `4` and `5`, while direction
  `5` contains both local/live delta cells; Zhangjiajie's live row `(51,21)` is
  contained by direction `5` while direction `0` contains the local row
  `(52,21)`. This narrows the natural-wonder source-owner question toward
  `Direction:-1` / footprint-orientation semantics between local map-policy
  projection and Civ runtime materialization. It still does not authorize a
  natural-wonder repair until the source owner is explicitly accepted and tested
  against broader wonder footprint behavior.
- Planned natural-wonder footprint readback progress:
  `buildNaturalWonderFootprintReadbackContexts` now scores every planned
  natural wonder present in the local context artifact against local and live
  feature grids across local map-policy directions `0..5`. The current
  readback artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-footprint-readback.json`
  (`sha256:50ecdd1bee31c8243dac792b2d8d9fe5faae4d422cf0cae44f95a696d86d16a3`,
  `proofHash:3e0389b5977d997ce40d5888c97e703397b518e5ff034911be70a949afd1d6b4`).
  The artifact covers the `2` planned multi-tile natural wonders represented in
  the current local feature-context artifact. Both have declared direction
  `-1`; local map-policy projection has best direction `0` for both. Live
  readback is not uniformly direction `0`: Kilimanjaro has best live directions
  `0,1,4,5` with partial live coverage (`2/3` cells) while Zhangjiajie has best
  live direction `5` with complete live coverage (`2/2` cells). This confirms
  the direction/footprint semantics gap is real for the readback set, but also
  shows the evidence set is too small and partially ambiguous for a global
  `Direction:-1` repair. The next repair layer must either collect broader
  exact-run footprint evidence or explicitly constrain a repair to the accepted
  owner surface and supported catalog behavior.
- Supported natural-wonder catalog context progress:
  `buildNaturalWonderFootprintCatalogContexts` now exposes the supported
  natural-wonder catalog direction classes and joins the exact-run footprint
  readback rows by feature type. The current catalog context artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-footprint-catalog-context.json`
  (`sha256:34211c105979d84b780278e76e838102cea47c7c45e3fb9c24499cf5e34046ab`,
  `proofHash:6ace44be42fc7b2a87d4a393d1ecb2c52af7bcb58dd90acdcc6e553e6338c009`).
  It records `10` supported natural-wonder catalog entries: `3`
  single-tile entries where direction is irrelevant, `2` fixed-direction
  multi-tile entries, and `5` multi-tile entries with official
  `naturalWonderDirection:-1` that the local projection currently materializes
  as direction `0`. The exact run observes `FEATURE_KILIMANJARO` as ambiguous
  or partial and `FEATURE_ZHANGJIAJIE` as live direction drift. This strengthens
  the source-owner focus toward local map-policy/mock natural-wonder
  projection versus Civ runtime materialization semantics, but it still does
  not authorize a global repair because only `2/5` unspecified multi-tile
  catalog entries have exact-run readback evidence in this proof.
- Natural-wonder live proof boundary progress:
  `buildNaturalWonderLiveProofBoundaryContext` now compares local
  natural-wonder placement stats with the exact-authorship proof and completion
  log payloads. The current boundary artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-natural-wonder-live-proof-boundary.json`
  (`sha256:1cd7da84ac26417f46c851b51e9abe4e146c0b4150c3a5ca104d577f1647ea4a`,
  `proofHash:156386737ebde2b38fee76a3a8d716291acefb285be19a2a226129139ec81557`).
  It preserves the local exact-source placement stats (`plannedCount:7`,
  `targetCount:7`, `placedCount:7`, `rejectedCount:0`, `shortfallCount:0`) and
  records that both exact live proof payloads lack `naturalWonderPlacement`
  stats. The boundary class is `local-placement-stats-only` with unresolved
  link `natural-wonder.live-placement-stats`. This blocks natural-wonder repair
  authority from relying on local placement counts alone; the next accepted
  movement must either instrument exact live natural-wonder placement evidence
  or explicitly classify ownership from a stronger exact-run source.
- Natural-wonder materialization outcome repair progress:
  `codex/swooper-wonder-materialization-repair-drain` synthetically adopts only
  the natural-wonder materialization behavior from stale source commit
  `b9a3e9d50` and excludes its unrelated Studio, package, config, generated,
  and build-surface churn. The materializer now projects generated
  feature-valid terrain across supported natural-wonder footprints, stamps
  multi-tile footprints through the mock adapter, preserves hard failures for
  corrupt plan metadata, and records planner shortfall/out-of-bounds/adapter
  rejection/readback mismatch as measured placement outcomes in
  `artifact:placement.naturalWonderPlacement`. This is a repo-owned
  materialization repair, not an exact live parity or product-acceptance claim.
  Validation passed:
  `bun test mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`;
  `bun test packages/civ7-adapter/test/mock-terrain-policy.test.ts`;
  `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`;
  `bun test mods/mod-swooper-maps/test/placement/placement-contracts.test.ts`;
  `bun run --cwd packages/civ7-adapter check`;
  `bun run --cwd packages/civ7-adapter build`;
  `bun run --cwd mods/mod-swooper-maps check`;
  `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`.
  Current exact parity rerun remains blocked before parity evaluation:
  `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-natural-wonder-materialization-repair.json`
  returned
  `Recipe compile failed: /config/ecology-features/floodplainPlanning: Unknown key`.
- Natural-wonder exact telemetry progress:
  natural-wonder materialization now emits compact
  `NATURAL_WONDER_PLACEMENT_V1` stats between the exact-authored
  `[mapgen-proof]` and `[mapgen-complete]` markers, and Studio exact authorship
  parses the bounded marker into `log.naturalWonderPlacement` only inside the
  matching request/config/envelope/seed chain. The feature/resource diagnostic
  boundary now accepts those telemetry stats as live placement evidence for a
  future fresh exact-authored run. This does not retroactively repair
  `studio-run-in-game-mq20rbzr-1fhc`, whose saved proof still lacks the marker;
  it only removes the instrumentation gap for the next proof packet. No
  natural-wonder repair, parity closure, product acceptance, Earthlike tuning,
  or mountain-quality claim is authorized from this instrumentation layer.
  Current drain validation passed:
  `bun test apps/mapgen-studio/test/runInGame/proofIdentity.test.ts`;
  `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`;
  `bun run --cwd mods/mod-swooper-maps check`;
  `bun run --cwd apps/mapgen-studio check`;
  `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`;
  `bun run openspec:validate`;
  `git diff --check && git diff --cached --check`.
  Current exact parity rerun remains blocked before parity evaluation:
  `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-natural-wonder-telemetry.json`
  returned
  `Recipe compile failed: /config/ecology-features/floodplainPlanning: Unknown key`.
- Source-recorded fresh natural-wonder telemetry proof progress:
  the source telemetry branch recorded a fresh Studio Run in Game launched from
  the saved exact source snapshot for `studio-run-in-game-mq20rbzr-1fhc`,
  producing request
  `studio-run-in-game-mq2spmz0-1z4g`. The request body is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-telemetry-run-request.json`
  (`sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2`)
  and the completed Studio status is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-telemetry-run-status.json`
  (`sha256:286e037b8ac2bdb9511dc23fa2649309d874949a76c8004c9a6327df79b7d608`).
  Exact authorship is `complete` with no unresolved links, runtime identity is
  `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash `0`,
  source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
  The exact log now carries `NATURAL_WONDER_PLACEMENT_V1` with
  `plannedCount:7`, `targetCount:7`, `placedCount:5`, `rejectedCount:2`,
  and `shortfallCount:0`; it also carries resource coordinate proof
  `placed.count:252`, `placed.hash32:231726d6`.
  The fresh full-grid parity proof is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2spmz0-1z4g-after-natural-wonder-telemetry.json`
  (`sha256:abb84c44b7b30221f49333983e8a650f0e0d0981be9a5d0e2b9a4c3018c07006`,
  `proofHash:1a28ab8c22902d274bff83be1efccbe376b0fbe5f4596d039c7e756e9eb9e24e`).
  It remains `status:"unresolved"` with `surface.terrain.mismatch`,
  `surface.feature.mismatch`, `surface.resource.mismatch`, and
  `resource-placement-coordinate-proof.placed`; diffs are terrain `1/6996`,
  biome `0/6996`, feature `5/6996`, and resource `61/6996`.
  The natural-wonder telemetry boundary artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2spmz0-1z4g-natural-wonder-telemetry-boundary.json`
  (`sha256:5b08c941493df87d4ab99c83092aba829e347a5add2be078f8c6443cc88b67d8`,
  `proofHash:7fb4c1eff15f36d0e69f8d762b7d6a0019f1c465023ba7e66e2e7bf5dab8d67c`).
  It shows the old missing-live-stats blocker is resolved for this fresh run:
  local placement stats are `7/7/0`, exact live telemetry is `7 planned`,
  `5 placed`, `2 rejected`, and the boundary class is
  `local-and-live-placement-stats-present` with no live-placement unresolved
  link. This is still source-authority evidence, not repair authority; the next
  natural-wonder diagnostic must identify which planned placements were
  rejected or otherwise bind row-level placement/rejection coordinate identity
  before assigning a repair owner.
- Natural-wonder coordinate proof contract progress:
  `NATURAL_WONDER_PLACEMENT_V1` now carries bounded `rejectionExamples` plus a
  compact coordinate proof with deterministic placed/rejected counts and
  hashes. Studio exact-authorship parsing exposes that coordinate proof on
  `log.naturalWonderPlacement.coordinateProof`, and the feature/resource
  diagnostic boundary preserves it alongside local/live placement stats. This
  is the proof contract needed to move from count-level evidence
  (`5 placed`, `2 rejected`) to row-level placement/rejection identity.
  Current drain validation passed:
  `bun test apps/mapgen-studio/test/runInGame/proofIdentity.test.ts`;
  `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`;
  `bun run --cwd mods/mod-swooper-maps check`;
  `bun run --cwd apps/mapgen-studio check`;
  `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`;
  `bun run openspec:validate`;
  `git diff --check && git diff --cached --check`.
  Current exact parity rerun remains blocked before parity evaluation:
  `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-natural-wonder-coordinate-proof.json`
  returned
  `Recipe compile failed: /config/ecology-features/floodplainPlanning: Unknown key`.
- Source-recorded fresh natural-wonder coordinate proof progress:
  the source coordinate branch recorded a fresh Studio Run in Game launched
  from the same saved exact source snapshot, producing request
  `studio-run-in-game-mq2t7nqs-1z4g`. The request
  body is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-coordinate-run-request.json`
  (`sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2`)
  and the completed Studio status is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-coordinate-run-status.json`
  (`sha256:e68a938d32cc919f3886cfec7c057348ee41c8b8c309eee812220100a43ba297`).
  Exact authorship is `complete` with no unresolved links, runtime identity is
  `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash `0`,
  source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
  The fresh full-grid parity proof is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2t7nqs-1z4g-after-natural-wonder-coordinate-proof.json`
  (`sha256:1f042bf887453e3c0ee49b417d7da4b4eb1381820b849f00c92a8ca40d24c3ed`,
  `proofHash:ac28cced60b84d1d6f3e8cde90055fd20e5d8ffcb1382ae26740d90e57f70d35`).
  It remains `status:"unresolved"` with `surface.terrain.mismatch`,
  `surface.feature.mismatch`, `surface.resource.mismatch`, and
  `resource-placement-coordinate-proof.placed`. The natural-wonder coordinate
  boundary artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2t7nqs-1z4g-natural-wonder-coordinate-boundary.json`
  (`sha256:28c0ea7a0e4534181350c5122decf4f4daae763940baa96ccd784009edbf53f0`,
  `proofHash:6cdde0f4f0143bd6e1adad12ea4de75e999a8dcc94bd751569f95edaeff490bb`).
  Exact live telemetry now identifies the rejected planned placements as
  `feature=35 plot=1320 reason=adapter-rejected` and
  `feature=36 plot=2171 reason=adapter-rejected`, with coordinate proof
  `placed.count:5`, `placed.hash32:537c7a40`, `rejected.count:2`, and
  `rejected.hash32:a6747920`; local diagnostics still predict
  `placed.count:7` and `rejected.count:0`. This resolves the missing
  coordinate-proof artifact gate and proves row-level rejection identity for
  the fresh exact run. It does not, by itself, assign source ownership or
  authorize natural-wonder footprint repair, parity closure, product
  acceptance, Earthlike tuning, or mountain-quality claims.
- Natural-wonder source-owner classification progress:
  the fresh coordinate proof, feature delta context, footprint direction
  alternatives, catalog context, and adapter behavior now assign the
  Kilimanjaro/Zhangjiajie offset class to repo-owned natural-wonder footprint
  projection/materialization emulation. The local mock/map-policy path projects
  `naturalWonderDirection:-1` as direction `0` and predicts all `7` wonders
  placed; the live Civ adapter path calls `TerrainBuilder.setFeatureType` for
  the same exact-authored anchors but rejects the placement because the
  direction-`0` readback footprint does not match Civ's runtime materialized
  feature cells. The final live grid still contains Kilimanjaro and
  Zhangjiajie on alternate supported footprint cells, so this is not a missing
  natural-wonder planning count, density, or product tuning issue. Repair
  authority is limited to the projection/materialization owner surface that
  reconciles unspecified-direction natural-wonder footprints between local
  mock/map-policy prediction and live Civ materialization. It does not
  authorize a global `Direction:-1` rewrite, generated output changes, parity
  closure, product acceptance, Earthlike tuning, or mountain-quality closure.
- Natural-wonder projection/materialization repair progress:
  `@civ7/map-policy` now separates official placement direction from
  materialization direction. `resolveNaturalWonderPlacementDirection` still
  preserves official `naturalWonderDirection:-1` for catalog/evidence records,
  while `resolveNaturalWonderMaterializationDirection` resolves that
  unspecified value to the explicit footprint projection used by local policy.
  The Swooper placement input derivation now passes the explicit materialization
  direction and matching offsets into `planNaturalWonders`, so the planner,
  local mock placement, and live Civ write path share the same deterministic
  direction instead of validating direction `0` locally and then sending
  `Direction:-1` to Civ. This is a projection/materialization boundary repair,
  not a natural-wonder density/tuning change. Exact-authored final-surface
  parity must be rerun before claiming the Kilimanjaro/Zhangjiajie feature rows
  are resolved.
  Current drain validation passed:
  `bun test packages/civ7-map-policy/test/map-policy.test.ts`;
  `bun test mods/mod-swooper-maps/test/placement/derive-placement-inputs.test.ts mods/mod-swooper-maps/test/placement/natural-wonder-placement.test.ts`;
  `bun test mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts`;
  `bun run --cwd packages/civ7-map-policy check`;
  `bun run --cwd packages/civ7-map-policy build`;
  `bun run --cwd mods/mod-swooper-maps check`;
  `bun run openspec -- validate earthlike-live-feature-resource-legality-repair --strict`;
  `bun run openspec:validate`;
  `git diff --check && git diff --cached --check`.
  Current exact parity rerun remains blocked before parity evaluation:
  `bun run verify:final-surface-parity -- --proof-file /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc-exact-proof-wrapper.json --output /tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-natural-wonder-direction-repair.json`
  returned
  `Recipe compile failed: /config/ecology-features/floodplainPlanning: Unknown key`.
- Source-recorded post-repair exact proof:
  request `studio-run-in-game-mq2u6wdg-1z4g` completed exact authorship and
  produced parity artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-after-natural-wonder-materialization-repair.json`
  (`sha256:2ab1115b4ed48614180d1982801149164c9fc1841360b3babacd817a43ebf171`,
  `proofHash:8870e330478cb442496c10a45e2935787b317aee06625b8aab5d3831ea11d366`).
  Exact-authorship status is `complete`; the final-surface proof remains
  `unresolved` with links `surface.terrain.mismatch`,
  `surface.feature.mismatch`, `surface.resource.mismatch`, and
  `resource-placement-coordinate-proof.placed`. The exact live
  `log.naturalWonderPlacement` still reports `plannedCount:7`,
  `placedCount:5`, `rejectedCount:2`, rejected examples
  `feature=35 plot=1320 reason=adapter-rejected` and
  `feature=36 plot=2171 reason=adapter-rejected`, and coordinate proof
  `placedHash32:84d971d2` / `rejectedHash32:e69d9860`. The apparent `7/7/0`
  placement signal came from local verifier generation, not the exact live log,
  so the rejected-anchor class is not live-proven repaired.
  Remaining parity rows are `terrain:1`, `feature:5`, `resource:61`; these are
  not product acceptance, Earthlike quality, mountain-quality, final parity
  closure, or current-drain exact proof closure.
- Source-recorded post-repair feature-row context:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-feature-delta-context.json`
  (`sha256:8e4de756eac7f159d5e30b03025672e2fb2551d85386ba87c4230a4f01ee7bfe`,
  `proofHash:4393fe8e068b855d10ea9838e89e1e2dd32c55921cbbfb6a69c8c527453dbe21`)
  and
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-feature-delta-feasibility.json`
  (`sha256:b3b71d0c07b60c98ef251273ab8eefa3dbfcd69f1ffad446d79d6b2f42943acb`,
  `proofHash:7a1ac36288ade82d60aaa66ea56cf1ad9aea694405c0605ab00df468aa594920`)
  bind the `5` feature rows to the source-recorded exact runtime (`106x66`, seed
  `138503614`, turn `1`, game hash `0`, omitted plot reads `0`). The row set is
  one local-only `FEATURE_COLD_REEF` row and two paired natural-wonder offset
  classes. `TerrainBuilder.canHaveFeature` returns `false` for the cold-reef
  row and for both local and live natural-wonder offset cells; because the live
  natural-wonder cells already contain those features, this readback is not a
  clean natural-wonder pre-placement oracle. It is not sufficient to classify
  the natural-wonder rows as accepted residuals because exact live telemetry
  still reports the two rejected anchors, and it is not sufficient to authorize
  cold-reef repair because exact live feature-apply telemetry/readback is
  absent from the packet.
- Post-repair natural-wonder footprint readback:
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2u6wdg-1z4g-natural-wonder-footprint-readback.json`
  (`sha256:690c80e7172d5cc3cc2a2c77f279a6c24436a4cc8e0773c8924455a5cb6c82ac`,
  `proofHash:d102c79f6bda3f22681ebcdc818e83223fa82e67cc468918d93807ea87bf64cb`)
  confirms local verifier generation can produce complete natural-wonder
  placement while final-grid footprint readback can still differ from the local
  projection. Kilimanjaro is
  partial/ambiguous (`3/3` local direction `0`, `2/3` live under directions
  `0,1,4,5`), while Zhangjiajie is complete under live direction `5` versus
  local direction `0`. Because exact live telemetry for the same request still
  reports `5` placed / `2` rejected, this artifact is a falsifier for the
  prior accepted-residual wording, not closure evidence.
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
  target exceeds the official minimum-per-hemisphere. The assignment-class
  summary also shows scarce-floor accounts for `64/69` local-authored resource
  delta rows overall, while the resource distribution context shows local
  assigned counts match current ResourceBuilder counts for all `26` local
  resource types represented by those deltas. The position context now also
  matches all `69` local-authored delta resources to same-resource live delta
  rows, mostly at long distance. Local materialization context proves the local
  final resource surface still matches every typed local placement outcome.
  Current code now emits and parses immediate placement coordinate digests for
  future exact runs, but the current `mq20rbzr` artifact still lacks that digest.
  No resource tuning, static-policy repair, scarce-floor repair, or
  assignment-order repair is authorized until a fresh exact-authored run binds
  local and live immediate placement coordinate identity or otherwise assigns
  those subclasses to a concrete source owner. Feature rows are now split into
  a reef absence and two natural-wonder one-tile offsets, with local intent,
  application, footprint evidence, runtime-bound `canHaveFeature` probes,
  footprint-direction alternatives, and planned-wonder readback context now
  attached. Supported-catalog context now shows `5` unspecified multi-tile
  entries where local projection fixes direction `-1` to direction `0`, with
  exact-run readback for Kilimanjaro and Zhangjiajie only. The direction
  context points at a real natural-wonder footprint orientation semantics gap
  in the current readback set. The fresh `mq2spmz0` exact run now carries live
  natural-wonder placement telemetry and proves Civ placed `5/7` planned
  natural wonders while rejecting `2`, whereas local source diagnostics still
  predict `7/7/0`. This removes the old missing-telemetry blocker. Current code
  now adds the coordinate-proof contract, and fresh request
  `studio-run-in-game-mq2t7nqs-1z4g` supplies row-level rejected-placement
  identity for Kilimanjaro plot `1320` and Zhangjiajie plot `2171`. That row
  evidence is now classified to repo-owned natural-wonder footprint
  projection/materialization emulation, and the repair now makes the
  materialization direction explicit before the plan/write path. Fresh request
  `studio-run-in-game-mq2u6wdg-1z4g` verifies the old rejected-placement class
  no longer occurs (`7/7` planned natural wonders placed, `0` rejected). The
  remaining natural-wonder offset rows are now classified as final-grid
  materialization/readback residuals, not an additional natural-wonder repair
  authorization. The remaining repo-owned feature repair candidate is the
  cold-reef local-only row, and final-surface parity remains open on terrain,
  cold-reef feature, resource, and any explicitly accepted residual links.
  The single
  substitution row where both probed values are infeasible remains an individual
  evidence row with no repair authority until row-level context assigns source
  ownership.
- Stop condition: source authority is not known for any row outside the
  classified adjacent-land resource class and the classified natural-wonder
  projection/materialization class.
