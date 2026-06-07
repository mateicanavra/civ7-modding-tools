# Phase Record

## Phase

- Project: Swooper recovery
- Phase: feature/resource legality repair planning
- Owner: Product/Development DRA
- Branch/Graphite stack: current recovery drain tip
  `codex/swooper-resource-rejection-assignment-context-rerun-record-drain`,
  stacked above `codex/swooper-resource-rejection-assignment-context-drain`,
  `codex/swooper-resource-rejection-identity-rerun-record-drain`,
  `codex/swooper-resource-rejection-proof-identity-drain`,
  `codex/swooper-resource-rejection-proof-rerun-record-drain`, and the current
  Swooper proof/diagnostic drain branches.
- Started: 2026-06-06
- Status: active. The adjacent-land resource class is classified and repaired
  in the repo-owned adapter/map-policy surface, and the natural-wonder
  projection/materialization class has a bounded repair but remains open for
  subsequent readback/footprint proof. Current exact-authored runtime proof no
  longer blocks on stale config, process restart, map-script loading,
  map-elevation drift, missing `[mapgen-complete]`, or rewritten log offsets.
  Exact feature-apply telemetry is now present and shows `1493` attempted,
  `1491` applied, and `2` `canHaveFeature` rejections. Exact resource
  placement telemetry now includes structured numeric rejection rows. Current
  assignment-context run `studio-run-in-game-mq3v6xr9-4w9` completed exact
  authorship and identifies `RESOURCE_WINE` `resourceType:16` rejected at plot
  `4838` (`x=68`, `y=45`) with `observedResourceType:-1`,
  `assignmentPhase:scarce-floor`, `assignmentOrder:85`,
  `initialResourceType:16`, `preferredResourceType:4`,
  `perTypeCountBefore:1`, `legalPlotCountForResource:313`, and
  `targetMinPerType:7`. Final-surface parity still remains unresolved on
  terrain, biome, feature, resource, and resource-coordinate-proof links.
  Current exact feature telemetry has `1493` attempted, `1491` applied, and
  `2` `canHaveFeature` rejections; current exact natural-wonder telemetry has
  `7` planned, `4` placed, and `3` rejected. Resource, feature,
  natural-wonder, and terrain source-authority classification remains the
  active work; product acceptance is not closed.

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
  Historical saved-wrapper parity rerun at this slice was blocked before
  parity evaluation:
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
  Historical saved-wrapper parity rerun at this slice was blocked before
  parity evaluation:
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
  Historical saved-wrapper parity rerun at this slice was blocked before
  parity evaluation:
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
  Later exact proof shows that this historical class does not close the
  expected-empty readback subcondition: after the projection/materialization
  repair and named telemetry, Civ still reports `readback-mismatch` with
  expected footprint plots `1427` and `2278` empty. The full-grid proof
  simultaneously shows adjacent live feature cells for the same wonders:
  Kilimanjaro live at `(48,13)` while the local expected cell `(49,13)`
  (`1427`) is empty, and Zhangjiajie live at `(51,21)` while the local
  expected cell `(52,21)` (`2278`) is empty. Source authority for that
  narrower readback oracle/materialization semantics gap remains open until
  classified and repaired or dispositioned.
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
  Historical saved-wrapper parity rerun at this slice was blocked before
  parity evaluation:
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
  `placedHash32:84d971d2` / `rejectedHash32:e69d9860`. The previously recorded
  `7/7/0` signal came from local verifier generation, not the exact live log,
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
- Natural-wonder deploy proof-gap instrumentation progress:
  `@civ7/adapter` now exposes `NaturalWonderPlacementOutcome` through
  `placeNaturalWonder`, while the existing `stampNaturalWonder` boolean wrapper
  remains for compatibility. Civ7 and mock adapters distinguish
  `out-of-bounds`, `unsupported-footprint`, `can-have-feature-param-false`,
  `set-feature-false`, and `readback-mismatch`; the Swooper natural-wonder
  materializer records those named reasons in `NATURAL_WONDER_PLACEMENT_V1`
  rejection examples and coordinate proofs. This is proof instrumentation only:
  it does not retroactively strengthen `mq2u6wdg`, whose exact log only carried
  `adapter-rejected`, and it does not prove natural-wonder repair closure.
  Swooper Maps package-local check now resolves both `@civ7/map-policy` and
  `@civ7/adapter` to workspace source entrypoints so unbuilt adapter source
  changes are visible to the package check.
- Fresh natural-wonder named rejection proof:
  fresh request `studio-run-in-game-mq2vqhg6-1z4g` completed exact authorship
  and produced parity artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2vqhg6-1z4g-after-natural-wonder-named-rejection-proof.json`
  (`sha256:631a2120ffaf70e54fdcad8ab3a5b1d0b62ff44b3be1a2f65c8674deb6f46bb3`,
  `proofHash:75f01f4d92d3b053df9337febea5cc0e266d1f603a024217a7be29e2b0407193`).
  The request body was
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-named-rejection-run-request.json`
  (`sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2`)
  and the completed Studio status was
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-named-rejection-run-status.json`
  (`sha256:e1ef7a6449ac7489383d4696f0130a1cba8699e7f8b4b24ab71d53608b145869`).
  Exact-authorship status is `complete` with no unresolved links, runtime
  identity is `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash
  `0`, source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
  The exact live `log.naturalWonderPlacement` reports `plannedCount:7`,
  `placedCount:5`, `rejectedCount:2`, with rejected examples
  `feature=35 plot=1320 reason=readback-mismatch` and
  `feature=36 plot=2171 reason=readback-mismatch`; coordinate proof is
  `placedHash32:84d971d2` / `rejectedHash32:ebd22c48`. Local verifier
  generation still emits `7/7/0`, so the exact live log remains authoritative.
  The final-surface proof remains `unresolved`: terrain has `1` mismatch,
  biome has `0`, feature has `5`, and resource has `61`, with unresolved links
  `surface.terrain.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `resource-placement-coordinate-proof.placed`.
  This proof resolves the aggregate `adapter-rejected` label into named
  readback-mismatch evidence only; it does not close natural-wonder repair,
  feature parity, final-surface parity, Earthlike acceptance, product
  acceptance, generated-output ownership, or mountain quality.
- Natural-wonder readback-mismatch context progress:
  the Swooper natural-wonder materializer now preserves adapter-provided
  readback context in `NATURAL_WONDER_PLACEMENT_V1` rejection examples and
  coordinate digests. For `readback-mismatch` outcomes, future exact logs can
  carry `observedPlot` and `observedFeature` beside the authored feature,
  anchor plot, and named reason. Existing placed/rejected coordinate digests
  remain stable unless observed readback facts are present. This is proof
  instrumentation only: it does not change natural-wonder planning,
  materialization direction, feature placement policy, config, tuning, or
  generated output ownership. A fresh exact-authored Studio Run in Game and
  final-surface parity proof are required before using these observed fields
  for source-authority classification of the Kilimanjaro/Zhangjiajie
  readback-mismatch rows.
- Fresh natural-wonder readback-context proof:
  fresh request `studio-run-in-game-mq2w5548-1z4g` completed exact authorship
  and produced parity artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2w5548-1z4g-after-natural-wonder-readback-context.json`
  (`sha256:5f947ae855dbafd870dedf982c438529e16c27e673a1a0bacdbd34b75a088093`,
  `proofHash:d6148b66043fa26b791029653a375edce945fc6175a1896f0ae6162f8388a1be`).
  The request body was
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-readback-context-run-request.json`
  (`sha256:a68947c89abca086ca380ee035600b9e7c38a8278a5d895de4fcb64eb398efc2`)
  and the completed Studio status was
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-readback-context-run-status.json`
  (`sha256:b2ad7154db1ab429a7dd35b5d6017b040dfdfdf4e1da0a679706d54dc65dedb9`).
  Exact-authorship status is `complete` with no unresolved links, runtime
  identity is `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash
  `0`, source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
  The exact live `log.naturalWonderPlacement` reports `plannedCount:7`,
  `placedCount:5`, `rejectedCount:2`, with rejected examples
  `feature=35 plot=1320 reason=readback-mismatch observedPlot=1427 observedFeature=-1`
  and
  `feature=36 plot=2171 reason=readback-mismatch observedPlot=2278 observedFeature=-1`;
  coordinate proof is `placedHash32:84d971d2` /
  `rejectedHash32:523bec4f`. The full-grid verifier's local generation still
  emits `7/7/0`, so the exact live log remains authoritative. The
  final-surface proof remains `unresolved`: terrain has `1` mismatch, biome
  has `0`, feature has `5`, and resource has `61`, with unresolved links
  `surface.terrain.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `resource-placement-coordinate-proof.placed`.
  The full-grid feature rows line up with the exact observed-empty cells:
  Kilimanjaro is present at `(48,13)` while the local expected plot `1427`
  (`49,13`) is empty, and Zhangjiajie is present at `(51,21)` while the local
  expected plot `2278` (`52,21`) is empty. Earlier footprint-direction context
  shows those live cells are supported by alternate footprint orientations, but
  the current proof records only the first expected-empty post-write readback
  cell, not a complete immediate post-write footprint. Therefore the evidence
  supports an expected-footprint/readback semantics hypothesis but does not yet
  assign repair authority to placement policy, materialization direction, or
  adapter readback.
  This proof sharpens the natural-wonder failure from a coarse readback mismatch
  to expected footprint cells that are empty after the Civ write call. It does
  not close natural-wonder repair, feature parity, final-surface parity,
  Earthlike acceptance, product acceptance, generated-output ownership, or
  mountain quality.
- Natural-wonder post-write footprint proof-contract progress:
  the active proof-instrumentation layer now extends the adapter
  `NaturalWonderPlacementOutcome` and Swooper `NATURAL_WONDER_PLACEMENT_V1`
  telemetry so `readback-mismatch` outcomes can carry the complete expected
  footprint readback vector (`plotIndex:observedFeatureType`) plus an
  `empty-expected-footprint` or `partial-expected-footprint` label. The visible
  rejection example also includes the requested direction and resolved
  elevation, so a fresh exact log can bind the write call to the footprint
  readback facts without relying on hidden digest inputs. This is
  instrumentation only. It does not change `Direction` resolution, placement
  policy, natural-wonder config, generated output, materialization behavior, or
  parity status. The follow-up exact proof below consumes this contract, but
  the expected-empty Kilimanjaro/Zhangjiajie subcondition still needs explicit
  source-authority classification before any adapter readback, local footprint
  projection, Civ materialization residual, or evidence-insufficiency
  disposition can authorize repair/closure movement.
- Fresh natural-wonder post-write footprint proof:
  fresh request `studio-run-in-game-mq2x1ugm-1z4g` completed exact authorship
  after the post-write footprint telemetry contract landed. The completed
  Studio status artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-postwrite-footprint-v2-run-status.json`
  (`sha256:e112342126773ebaba7719f5e92539a814a71d6b79207ba2ddc63e96b48779a7`);
  the request post response is
  `/tmp/civ7-recovery-proof/final-surface-parity/fresh-natural-wonder-postwrite-footprint-v2-run-post.json`
  (`sha256:22688520ef3e61b39ee23ff56744de719ecaef748e9ed5e0d0a850b4a9a21a5e`);
  and the exact-authored full-grid parity proof is
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq2x1ugm-1z4g-after-postwrite-footprint-proof-v2.json`
  (`sha256:527973a4a5ed0b23b506dd780accb3fec777dbeea1dde610161c605beed80294`,
  `proofHash:3c47392d308a071cc128f6dc3d35567adf6b2bdd11249e2c34275dbe7d6402a3`).
  Exact-authorship status is `complete` with no unresolved links. Runtime
  identity is `106x66`, `6996` plots, seed `138503614`, turn `1`, game hash
  `0`, source snapshot id `status:1:c153eb72`, and snapshot hash `c153eb72`.
  Exact live `log.naturalWonderPlacement` reports `plannedCount:7`,
  `placedCount:5`, `rejectedCount:2`, with rejection examples
  `feature=35 plot=1320 direction=0 elevation=21 reason=readback-mismatch observedPlot=1427 observedFeature=-1 footprint=1320:35,1427:-1,1321:35 readback=partial-expected-footprint`
  and
  `feature=36 plot=2171 direction=0 elevation=32 reason=readback-mismatch observedPlot=2278 observedFeature=-1 footprint=2171:36,2278:-1 readback=partial-expected-footprint`.
  Coordinate proof remains `placedHash32:84d971d2` /
  `rejectedHash32:f78a9fb9`. The full-grid verifier's local generation still
  emits `7/7/0`, so the exact live log remains authoritative.
  Final-surface parity remains `unresolved`: terrain has `1` mismatch, biome
  has `0`, feature has `5`, and resource has `61`, with unresolved links
  `surface.terrain.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `resource-placement-coordinate-proof.placed`.
  This proves the exact Civ post-write readback observed one expected
  footprint cell empty while sibling expected footprint cells already carried
  the requested feature. It narrows the owner question to Civ natural-wonder
  footprint/materialization semantics versus the local/adapter post-write
  readback oracle, but it does not yet classify repair authority.
- Current exact-authored proof attempt after post-write footprint telemetry:
  the current drain launched the checked-in Swooper Earthlike config through the
  worktree-local Studio endpoint on branch
  `codex/swooper-wonder-footprint-proof-record-drain` /
  `codex/swooper-current-runtime-proof-blocker-drain` using request body
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-run-request.json`
  (`sha256:13f93c6b30f0ed3d41f83854c6e08de39fb501aab9c86c92207f2cb5990fffa3`).
  This proves the current config surface no longer fails the old
  `/config/ecology-features/floodplainPlanning` schema gate. The first request
  `studio-run-in-game-mq3koapx-1qxe` and normal retry
  `studio-run-in-game-mq3kvvfs-1qxe` both completed materialization, deploy,
  direct-control availability, setup-row visibility, and setup preparation,
  then failed in `starting-game` with direct-control code
  `setup-start-timeout`. Their status artifacts are
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-run-status.json`
  (`sha256:50d01a5ac3fa6fc2f882c8e6f3661ab3d19e447a44d5c76835117065087fc72d`)
  and
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-retry-status.json`
  (`sha256:0eeae66d995be2f07cf5b1017e78364cdb33103ffa870af87aa3a9ce426c6d51`).
  Both captured `beginAttempted:false`; Civ briefly entered loading states
  `WaitingForGameplayData` and `WaitingForConfiguration` and then returned to
  shell. Fresh `Scripting.log` lines for the same window reported
  `Failed to load file into script system - fs://game/swooper-maps/maps/studio-current.js`
  even though the local and deployed `studio-current.js` hashes matched the
  Studio materialization record. A restart-backed request
  `studio-run-in-game-mq3l0b8p-1qxe` then completed materialization and deploy
  but failed in `restarting-civ` with
  `Civ7 process restarted but setup shell was not ready within 180000ms`; its
  status artifact is
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-status.json`
  (`sha256:cd2a8ab4df93292819f75f1b81de64cbc5c522dcbda79afef5405ff99dc869f7`).
  Follow-up Studio hardening slices then added start-phase map-script load
  classification, bounded restart-launch retries, process-restart telemetry
  persistence, a delayed fatal-log grace window, and same-size `Scripting.log`
  rewrite handling. Current request
  `studio-run-in-game-mq3mojsw-1d0x` used the same restart request body
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
  (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`),
  with post response
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-same-size-log-fix-post.json`
  (`sha256:eab97153c22465c1a304ea1aa69099c09e4474f4ee5bef5e28e12a36fa97d7ac`)
  and terminal status
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-same-size-log-fix-status.json`
  (`sha256:e43e9c2b93575562f5429919f47ddafa033cd305191d12053bfd1cdacc8e3966`).
  It completed materialization, deploy, process restart, direct-control
  availability, setup-row visibility, and setup preparation. Restart telemetry
  recorded command
  `osascript -e 'tell application id "com.2k.civ7" to quit' && open steam://rungameid/1295660 (2 attempts)`;
  launch attempt `1` had `started:false`, `polls:10`, `elapsedMs:20354`, and
  launch attempt `2` had `started:true`, `polls:2`, `elapsedMs:2061`.
  The terminal failure is now classified as `map-script-load-failed` with
  recovery boundary `civ-notification-dismiss`; matched fresh log line:
  `[2026-06-07 06:19:28] Failed to load file into script system - fs://game/swooper-maps/maps/studio-current.js`.
  The deployed script identity in that status is
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`
  (`sha256:862baf3441a7f98b7a5e38d183a0e64c47890fb1f70385b68e36599e16844a03`,
  `mtimeIso:2026-06-07T10:18:01.268Z`).
  This is a current runtime/control blocker, not a source parity result: no
  current `[mapgen-proof]`, `[mapgen-complete]`, exact-authorship packet,
  final-surface parity proof, or product acceptance proof was produced.
  A follow-up map-policy bundling slice added `@civ7/map-policy` to the
  Swooper map-script bundle so Civ does not need to resolve a repo-owned bare
  package import at map-script load time. Current request
  `studio-run-in-game-mq3n8vkc-1qjg` used the same restart request body
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
  (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`),
  with post response
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-map-policy-bundle-post.json`
  (`sha256:855671f1291ead7c4ed2d8b2addbf784b761a30ac1104c0f71b3aff55b34749c`)
  and terminal status
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-map-policy-bundle-status.json`
  (`sha256:6b2997225b0dc872a12ba306fec47c5ad7b1a7767692758b6426b8104ee8ae4c`).
  It completed materialization, deploy, process restart, direct-control
  availability, setup-row visibility, setup preparation, and map-script load.
  The deployed script identity in that status is
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/studio-current.js`
  (`sha256:ac3d7a05a4972cb8d264022bbffc4c220f0526e2ff322093bb8da2e0dfa6acdc`,
  `mtimeIso:2026-06-07T10:33:26.425Z`). The terminal failure moved to
  `map-generation-script-failed` with recovery boundary
  `civ-notification-dismiss`; matched fresh log line:
  `[2026-06-07 06:34:54] [SWOOPER_MOD] Map generation failed: StepExecutionError: Step "mod-swooper-maps.standard.map-elevation.build-elevation" failed: [map-elevation/build-elevation] drift: expected land but adapter reports water at (34,17).`
  This is a source/runtime map-generation blocker, not a parity result: no
  current `[mapgen-proof]`, `[mapgen-complete]`, exact-authorship packet,
  final-surface parity proof, or product acceptance proof was produced.
  The map-elevation bounded drift, SDK completion-marker, and
  direct-control/Studio rewritten-log reader repairs then cleared the current
  runtime proof blocker. Current committed request
  `studio-run-in-game-mq3pfgbe-1doj` used the same restart request body
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-postwrite-footprint-restart-request.json`
  (`sha256:0e23b919efba651b49d36bd967218414ace31620dee1c375a13a2c245decf914`),
  with post response
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-post.json`
  (`sha256:e2640bf851b30bfe54f95a96a24867c65068c0cb30d8dbdf89528a2f4e9e1f8d`)
  and terminal status
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-status.json`
  (`sha256:381e25d77639fcf3fe1660524ba7ead72cabb7c60f7dadb53062ca684bbd9ed6`).
  It completed materialization, deploy, process restart, setup preparation,
  map-script load, all recipe steps, and `waiting-for-proof`. The status is
  `complete`; `exactAuthorshipProof.status` is `complete` with no unresolved
  links; and the exact log proof matches `[mapgen-proof]` and
  `[mapgen-complete]` for request `studio-run-in-game-mq3pfgbe-1doj`, config
  hash `ceae9601ee0b856483d0874ee3dfdff4a189eb226d01f8ab9dc8b7484475765f`,
  envelope hash
  `f8d81ad1446301c516b4c894ef0142ed4fa5c8c666dd37c49022d2830d4b375f`,
  seed `138503614`, and dimensions `106x66`. Runtime placement telemetry
  records `RESOURCE_PLACEMENT_V1` at `251` planned, `250` placed, `1`
  rejected, `0` mismatched, with placed/rejected coordinate hashes
  `9c5eaad8`/`af57eb7b`; and `NATURAL_WONDER_PLACEMENT_V1` at `7` planned,
  `4` placed, `3` rejected, with placed/rejected coordinate hashes
  `b623433b`/`d6bab8b6`. This is current exact-authorship and runtime
  completion proof only. The follow-up final-surface verifier artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-current-final-surface-parity.json`
  (`sha256:24743163cf07f2741e9b7e4b3ae3f018811788f9beb77550748f214ea977c035`,
  `proofHash:fb1edeedbf479b446190d895e9137dc023e36223d6cb0bdeca8c0a60ee481c2d`,
  created `2026-06-07T11:50:17.262Z`) was generated from that status. Live
  identity remained stable against the exact runtime: seed `138503614`,
  dimensions `106x66`, plot count `6996`, turn `1`, game hash `0`, and `0`
  omitted plots across `17` chunks. The result remains `unresolved`: terrain
  mismatches `139/6996`, biome mismatches `874/6996`, feature mismatches
  `381/6996`, resource mismatches `308/6996`, with unresolved links
  `surface.terrain.mismatch`, `surface.biome.mismatch`,
  `surface.feature.mismatch`, `surface.resource.mismatch`,
  `resource-placement-coordinate-proof.placed`, and
  `resource-placement-coordinate-proof.rejected`. This does not close resource
  legality/source-authority rows, feature rows, product acceptance, or final
  product closure.
  Current diagnostic follow-ups preserve row context for those unresolved
  links without authorizing repair. Terrain context artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-terrain-edge-live-readback-context.json`
  (`sha256:fb3e0e912897253066d53720ca51346c1ac7c6ef940384028e351935a1f176a4`,
  `proofHash:fc2226d188385c50e5163256304971893a94210fe6175d60ba28f4b242769876`)
  records `139` terrain rows with matched runtime identity and leaves all
  source-authority statuses unresolved. Feature context artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-feature-delta-feasibility.json`
  (`sha256:a827a0e0c6560950cf8e944ed7a566911c2b16d3fb79b173ccea2d1e29e1f8ae`,
  `proofHash:77e2565802122291e9ec50dfb0752dbdb70fd7bf5cd54185e56172a127acf1d0`)
  records `381` feature rows with Civ feasibility classes: `166`
  live-feature Civ-infeasible/local-empty, `78` local-feature
  Civ-infeasible/live-empty, `30` local-feature Civ-feasible/live-empty, and
  `107` unclassified swaps. Resource context artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-resource-delta-feasibility-full.json`
  (`sha256:05512721dba9cb8a9a63d6a87702d7daf8439a658bb9680827c65bfab73be03a`,
  `proofHash:7eb8a38538bd8c61d7b8cd96f0b01984cd6bb68c4b581c09565e950a78ee9ff9`)
  records `308` resource rows. Its `ignoreWeight:true` classes are `114`
  live-feasible/no-local-assignment, `53` local-feasible/live-empty, `62`
  local-overaccepted/live-empty, `51` substitution-both-feasible, `27`
  substitution-mixed-feasibility, and `1` substitution-both-infeasible. The
  focused `62` local-overaccepted/live-empty rows subclassify as `39`
  scarce-floor cut-excluded, `17` scarce-floor cut-included rejected, and `6`
  non-scarce-floor local overaccepted. The verifier script now batches
  ResourceBuilder diagnostics in groups of `8`; the unbatched `62`-cell read
  timed out at `180000ms`.
  Slice verification on `codex/swooper-current-final-surface-parity-record-drain`
  before committing the diagnostic record: `bun run --cwd mods/mod-swooper-maps
  check`; `bun test
  mods/mod-swooper-maps/test/diagnostics/live-parity.test.ts
  mods/mod-swooper-maps/test/diagnostics/surface-delta-context.test.ts
  scripts/civ7-direct-control/verify-final-surface-parity.test.ts
  scripts/civ7-direct-control/verify-terrain-edge-live-context.test.ts` (`26`
  pass); `bun scripts/civ7-direct-control/verify-resource-delta-feasibility.ts
  --help`; `bun run openspec -- validate
  earthlike-live-feature-resource-legality-repair --strict`; `bun run
  openspec:validate` (`76` passed, `0` failed); and `git diff --check`.
  Source-authority synthesis after these diagnostics: current final-surface
  parity remains open, but the next proof queue is narrowed. Resource
  local-overaccepted/live-empty rows are first because `62` rows have concrete
  assignment and ResourceBuilder context, including `56` scarce-floor target
  `7` rows. Local-only ecology-feature materialization is second because `78`
  local-only rows are Civ-infeasible and `30` are Civ-feasible but live-omitted.
  Terrain projection/readback is third because all `139` terrain rows still
  have unresolved ownership and are dominated by coast/flat/hill/navigable-river
  projection swaps. Live-only resource additions, both-feasible resource
  substitutions, live-feature Civ-infeasible rows, and unclassified feature
  swaps do not authorize tuning or direct repair yet.
  Follow-up implementation on
  `codex/swooper-current-source-authority-queue-drain` exposes that first
  resource proof boundary directly in final-surface parity artifacts:
  `resourcePlacementCoordinateProof` now summarizes local coordinate proof,
  exact runtime log coordinate proof, and mismatched
  `resource-placement-coordinate-proof.*` links. This is proof instrumentation
  only. It does not alter parity status, resource assignment, scarce-floor
  behavior, runtime materialization, or product acceptance.
  Runtime-bound verifier rerun on committed head
  `codex/swooper-resource-coordinate-proof-summary-drain` used exact-authorship
  input
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-log-rewrite-reader-status.json`
  and wrote
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3pfgbe-1doj-current-final-surface-parity-with-resource-coordinate-summary.json`
  (`sha256:44dee661491ee3d013a9326745fb30825c6155cdbb45af633f57ebb87fda23df`,
  `proofHash:ce8a5a568bb91678ceb9f108b525d557cbd6b9820f10ebaad0639800cce6d091`,
  created `2026-06-07T12:25:56.936Z`). The verifier exited `2` as expected
  for unresolved parity. The refreshed artifact preserves the same surface
  mismatch counts (`139` terrain, `874` biome, `381` feature, `308` resource)
  and makes the resource coordinate split explicit: local placed
  `251`/`98393a08` versus exact placed `250`/`9c5eaad8`; local rejected
  `0`/`811c9dc5` versus exact rejected `1`/`af57eb7b`.
  Follow-up implementation on
  `codex/swooper-product-closure-audit-record-drain` adds bounded
  `FEATURE_APPLY_V1` parsing to Studio exact-authorship proof packets for future
  runs. The parser only accepts telemetry between the matched `[mapgen-proof]`
  and `[mapgen-complete]` markers and preserves attempted/applied/rejected
  counts plus per-feature count maps when present. This does not change the
  current `mq3pfgbe` proof because the saved status artifact does not include
  raw log text to reparse; it prepares the next exact run to classify
  local-only ecology-feature materialization without relying on local-only
  diagnostics.
  Current exact run `studio-run-in-game-mq3ryaop-1p7l` on
  `codex/swooper-feature-apply-proof-telemetry-drain`
  (`a992eb243c407f33676de208ee11a8358ea3c3c1`) now consumes that parser from a
  current-worktree Studio server. Exact-authorship completed with no unresolved
  links. The status artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-feature-apply-parser-status.json`
  has `sha256:23e53771a6ce7d8eabf102ce24997f67c87c2c2f1927fc08c05256299daa37fe`
  and records `FEATURE_APPLY_V1` stats: `1493` attempted, `1491` applied, `2`
  `canHaveFeature` rejections (`FEATURE_COLD_REEF:1`, `FEATURE_TAIGA:1`).
  Resource telemetry remains stable at `251` planned, `250` placed, `1`
  rejected, coordinate hashes `9c5eaad8`/`af57eb7b`. The current final-surface
  verifier artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3ryaop-1p7l-current-final-surface-parity-with-feature-apply.json`
  has `sha256:7d3225aec82c5596a6dd8e58ca1a44aebbdc4b79c5fa6117ca43ad89568dc34b`
  and
  `proofHash:89d48831dd981e5144c89e14842b1052d989d3748b011fc7590070075236ba02`.
  It remains `unresolved` with the same terrain `139`, biome `874`, feature
  `381`, resource `308`, and resource coordinate proof placed/rejected links.
  This is proof narrowing only: exact feature-apply legality is no longer a
  broad blocker, but final-surface parity and product acceptance remain open.
  Current implementation now extends `RESOURCE_PLACEMENT_V1` with bounded
  resource rejection examples and parses them into Studio exact-authorship
  resource placement stats. This is the resource equivalent of the
  natural-wonder proof-contract repairs: it should let the next exact run name
  the one currently rejected resource row instead of carrying only count/hash
  evidence. It does not change resource placement behavior, scarce-floor
  assignment, ResourceBuilder policy, final-surface parity, or product
  acceptance.
  Current exact run `studio-run-in-game-mq3sk0ck-1vl` on
  `codex/swooper-resource-rejection-proof-telemetry-drain`
  (`96b94a13e4b7b7665b38c8b7c0701e253cfc8b38`) consumes that resource
  telemetry contract. Exact-authorship completed with no unresolved links. The
  status artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-resource-rejection-telemetry-status.json`
  has `sha256:beb4b23053dcbee73ce2b5bf0c191e44525f60a9592a92efaa42fbaefa5fe166`
  and records `RESOURCE_PLACEMENT_V1` stats: `251` planned, `250` placed, `1`
  rejected, `0` mismatches. The rejected row is
  `status=rejected resource=RESOURCE_WINE plot=4838 x=68 y=45 reason=cannot-have-resource observed=-1`.
  The refreshed final-surface verifier artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3sk0ck-1vl-current-final-surface-parity-with-resource-rejection-example.json`
  has `sha256:3d06cd54ec86875ddd1ac5fd25bdae4b0a1ba25919ea0046070104f76b23fdcc`
  and
  `proofHash:4184a136601dbc3768fe175ab9f4f896bdd3754f2fcaf9e65c249d0d79f6a5f1`.
  It remains `unresolved` with unchanged terrain `139`, biome `874`, feature
  `381`, resource `308`, and resource coordinate proof placed/rejected links.
  This narrows the resource boundary to a concrete exact rejection coordinate
  but does not yet make the resource symbol source-authoritative: the run
  predates structured numeric rejection rows, and local evidence for plot
  `4838` records numeric resource type `46`, which the repo-generated table
  maps to `RESOURCE_LIMESTONE`. Current branch
  `codex/swooper-resource-rejection-proof-identity-drain` adds bounded
  structured `rejectionRows` to `RESOURCE_PLACEMENT_V1` and Studio proof
  parsing, preserving numeric `resourceType`, runtime symbol, plot, x/y,
  reason, and observed resource identity in future exact-authorship packets.
  This is proof instrumentation only and does not authorize resource tuning,
  scarce-floor repair, parity closure, or product acceptance.
  The first post-contract exact run `studio-run-in-game-mq3tkdui-ygx`
  completed exact authorship but showed the proof line was still too large for
  reliable Studio parsing; that run is recorded as a proof-contract failure,
  not resource proof. After compacting the proof payload, exact request
  `studio-run-in-game-mq3twjd7-18mg` completed with no unresolved
  exact-authorship links. Status artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-resource-rejection-identity-compact-status.json`
  has
  `sha256:da06bc02e50773044af13a1f9bcdf62abbe419b4bc1ef081f57f9cc006841461`;
  post artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-resource-rejection-identity-compact-post.json`
  has
  `sha256:3dc98df92afce28192c19bd2b2315d5388282a7e1dc3e24483d0025ac28e503b`.
  Exact `RESOURCE_PLACEMENT_V1` now records `251` planned, `250` placed, `1`
  rejected, `0` mismatches, `34` unique planned/placed resource types, min/max
  placed count by type `7/8`, and the structured rejected row:
  `resourceType:16`, `resource:"RESOURCE_WINE"`, plot `4838`, `x=68`, `y=45`,
  reason `cannot-have-resource`, observed resource type `-1`.
  The current final-surface verifier then wrote
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3twjd7-18mg-current-final-surface-parity-with-resource-rejection-identity.json`
  (`sha256:a8d0c18f155cd60dd13dd80c52961fc3d24bdabe172edf45d8677764c116b115`,
  `proofHash:b7a32c172ce1e7cf0b26812c551e789a2f246e0e5598f92d5388adc8c116b68c`,
  created `2026-06-07T13:42:38.215Z`). It exits `2` as expected because
  parity is still `unresolved`; remaining links are
  `resource-placement-coordinate-proof.placed`,
  `resource-placement-coordinate-proof.rejected`,
  `surface.biome.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `surface.terrain.mismatch`.
  Resource coordinate proof remains mismatched: local placed
  `251`/`98393a08`, exact placed `250`/`9c5eaad8`; local rejected
  `0`/`811c9dc5`, exact rejected `1`/`af57eb7b`.
  Current branch
  `codex/swooper-resource-rejection-assignment-context-rerun-record-drain`
  records fresh exact request `studio-run-in-game-mq3v6xr9-4w9` after the
  assignment-context proof contract. Status artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-resource-rejection-assignment-context-status.json`
  has
  `sha256:feeb442bb095ce0094faea1fb38695798db5e2034c8486812e10ba8e77c212d7`;
  post artifact
  `/tmp/civ7-recovery-proof/final-surface-parity/current-drain-after-resource-rejection-assignment-context-post.json`
  has
  `sha256:1126b02788b522f3790976a8b4139f4c757d0b8c522fd0aa9a9cd930a38a7839`.
  Exact `RESOURCE_PLACEMENT_V1` still records `251` planned, `250` placed, `1`
  rejected, and `0` mismatches. The rejected row is `RESOURCE_WINE`
  `resourceType:16` at plot `4838` (`x=68`, `y=45`), rejected with
  `reason:cannot-have-resource`, `observedResourceType:-1`,
  `assignmentPhase:scarce-floor`, `assignmentOrder:85`,
  `initialResourceType:16`, `preferredResourceType:4`,
  `perTypeCountBefore:1`, `legalPlotCountForResource:313`, and
  `targetMinPerType:7`.
  The current final-surface verifier wrote
  `/tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq3v6xr9-4w9-current-final-surface-parity-with-resource-rejection-assignment-context.json`
  (`sha256:d77c9c4d495be9ea048faa6a6f2f0ce667c933a74cc86b7697b5e1fe094043a9`,
  `proofHash:0ba7fe430c77b99aae8d6b3c514a9a7fc5136990deb763e89f7203cb11568ca7`,
  created `2026-06-07T14:18:32.698Z`). It exits `2` as expected because
  parity remains `unresolved`; remaining links are
  `resource-placement-coordinate-proof.placed`,
  `resource-placement-coordinate-proof.rejected`,
  `surface.biome.mismatch`, `surface.feature.mismatch`,
  `surface.resource.mismatch`, and `surface.terrain.mismatch`.
  Resource coordinate proof remains mismatched: local placed
  `251`/`98393a08`, exact placed `250`/`9c5eaad8`; local rejected
  `0`/`811c9dc5`, exact rejected `1`/`af57eb7b`. Verifier log:
  `/tmp/civ7-recovery-proof/final-surface-parity/verify-final-surface-parity-current-mq3v6xr9.log`
  (`sha256:9479c3028e5e59f3c5d33afdf33d05c2e46e6aca31d0de4cef4a1a985c110d44`).
  This classifies the exact runtime rejected resource as a scarce-floor Wine
  assignment selected before materialization. It does not authorize tuning,
  scarce-floor policy repair, ResourceBuilder policy changes, final-surface
  parity, or product acceptance.
- Protected paths: generated outputs, official resources, unrelated worktrees.
- Next action: classify the current unresolved links from
  `studio-run-in-game-mq3v6xr9-4w9-current-final-surface-parity-with-resource-rejection-assignment-context.json`
  by proving or rejecting the narrowed repair-owner candidates in order:
  resource local-overacceptance/scarce-floor materialization using the exact
  plot `4838` `RESOURCE_WINE` scarce-floor assignment row plus the local
  assignment/resource-builder context, current exact natural-wonder
  unsupported-footprint/readback ownership, exact feature-materialization/
  readback ownership for the two rejected feature applications and remaining
  feature mismatches, then terrain projection/readback. Do this before any
  final-surface parity or product acceptance claim. The older
  source-recorded context remains useful: for the prior `9` local-assigned
  live-empty rows, assignment trace ruled out relaxed spacing and rebalance,
  and ResourceBuilder diagnostics and structured subclassification showed `6`
  local resources absent from Civ cut lists while `3` local resources were
  present in cut lists but still rejected. Assignment-order and policy context
  showed every focused local value came from the scarce-floor quota pass and
  that the local floor target exceeded the official minimum-per-hemisphere. The
  assignment-class summary also showed scarce-floor accounted for `64/69`
  local-authored resource delta rows overall, while resource distribution
  context showed local assigned counts matched current ResourceBuilder counts
  for all `26` local resource types represented by those deltas. The position
  context now also
  matches all `69` local-authored delta resources to same-resource live delta
  rows, mostly at long distance. Local materialization context proves the local
  final resource surface still matches every typed local placement outcome.
  Current code now emits and parses immediate placement coordinate digests for
  future exact runs, but the current `mq20rbzr` artifact still lacks that digest.
  No resource tuning, static-policy repair, scarce-floor repair, or
  assignment-order repair is authorized until the exact plot `4838` rejection
  row and local assignment/resource-builder context are source-classified to a
  concrete owner. Older source-recorded feature
  rows were split into a reef absence and two natural-wonder one-tile offsets,
  with local intent, application, footprint evidence, runtime-bound
  `canHaveFeature` probes, footprint-direction alternatives, and planned-wonder
  readback context attached. Supported-catalog context showed `5` unspecified
  multi-tile entries where local projection fixed direction `-1` to direction
  `0`, with exact-run readback for Kilimanjaro and Zhangjiajie only. That
  direction context pointed at a natural-wonder footprint orientation semantics
  gap in the older readback set. The fresh `mq2spmz0` exact run now carries live
  natural-wonder placement telemetry and proves Civ placed `5/7` planned
  natural wonders while rejecting `2`, whereas local source diagnostics still
  predict `7/7/0`. This removes the old missing-telemetry blocker. Current code
  now adds the coordinate-proof contract, and fresh request
  `studio-run-in-game-mq2t7nqs-1z4g` supplies row-level rejected-placement
  identity for Kilimanjaro plot `1320` and Zhangjiajie plot `2171`. That row
  evidence is now classified to repo-owned natural-wonder footprint
  projection/materialization emulation, and the repair now makes the
  materialization direction explicit before the plan/write path. That prior
  classification/repair did not close the subsequent expected-empty readback
  subcondition proven by `mq2w5548`; it remains a separate source-authority
  question. Fresh request
  `studio-run-in-game-mq2u6wdg-1z4g` does not verify the old rejected-placement
  class is repaired: exact live telemetry still reports `5/7` placed and `2`
  rejected. Fresh request `studio-run-in-game-mq2vqhg6-1z4g` then proves the
  rejection subcondition is `readback-mismatch` for the same Kilimanjaro and
  Zhangjiajie anchors. Fresh request `studio-run-in-game-mq2w5548-1z4g` then
  proves those readback mismatches are empty expected footprint plots
  (`1427`, `2278`) after the write call, while full-grid parity still shows
  adjacent live natural-wonder cells (`1426`, `2277`). The remaining
  natural-wonder offset rows stay tied to the rejected live placement class
  until the expected-empty footprint/readback owner is source-classified and
  repaired or dispositioned from exact-bound evidence that explains the
  adapter's post-write readback oracle versus Civ's materialized footprint.
  Fresh request `studio-run-in-game-mq2x1ugm-1z4g` now records the full
  expected-footprint readback vector for both rejected anchors:
  Kilimanjaro has `1320:35,1427:-1,1321:35`, and Zhangjiajie has
  `2171:36,2278:-1`. That exact-bound vector proves partial expected-footprint
  readback after the write call, but it still does not classify whether the
  repo should change its local footprint projection/readback oracle or accept
  a Civ engine footprint/materialization semantic as residual.
  The cold-reef local-only row is no longer blocked on missing exact
  feature-apply telemetry: the current exact run proves one cold-reef
  `canHaveFeature` rejection and one taiga rejection, while the full feature
  surface still has `381` mismatches. Current exact natural-wonder telemetry
  also regressed from the source-recorded post-repair expectation to `4`
  placed and `3` rejected (`unsupported-footprint` for two features and one
  partial expected-footprint readback mismatch), so natural-wonder source
  ownership remains in the active queue. Final-surface parity remains open on
  terrain, feature, resource, natural-wonder proof, and any future
  owner-classified residual links.
  The single
  substitution row where both probed values are infeasible remains an individual
  evidence row with no repair authority until row-level context assigns source
  ownership.
- Stop condition: source authority is not known for any row outside the
  classified adjacent-land resource class and the classified natural-wonder
  projection/materialization class.
