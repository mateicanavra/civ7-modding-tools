# Adversarial Agent Synthesis

Date: 2026-06-09
Worktree: `wt-agent-mapgen-physical-rivers`
Active branch during synthesis: `codex/map-rivers-navigable-coherence`
Controlling execution authority:
`openspec/changes/river-lake-adversarial-workstream-design/workstream/execution-redesign-plan.md`

## Why This Packet Exists

The prior river/lake work repeatedly confused partial technical proof with
product closure. This packet records the six-agent adversarial pass that
reframed the work against:

- the repo's actual owner boundaries,
- the physical behavior of Earth drainage systems,
- the actual Civ runtime/materialization surfaces,
- and the proof ladder required to say "rivers work" without lying.

## Skills And Control Artifacts Used Up Front

- `framing-design`
- `investigation-design`
- local `create-goal`
- `civ7-architecture-authority`
- `civ7-product-authority`
- `civ7-systematic-workstream`
- `civ7-open-spec-workstream`
- `civ7-operational-debugging`

Authority order for this pass matched the execution redesign plan:

1. current thread decisions
2. root and subtree `AGENTS.md`
3. architecture normalization packet
4. `TRUTH-VS-PROJECTION.md`
5. Hydrology reference
6. Swooper architecture docs
7. `ADR-008`
8. active OpenSpec execution records
9. code, tests, runtime probes, and official resources as evidence only

## Six Adversarial Lanes

### 1. Hydrology Root-Cause Prosecutor

Verdict:

- The deeper failure is upstream, not primarily in downstream river stamping.
- Canonical drainage truth belongs in Hydrology.
- Morphology may still need routing-like helpers for erosion or terrain
  planning, but those are not the same thing as canonical water-routing truth.

Load-bearing findings:

- The active execution plan already rejects projection-only fallback corridors
  and public `minLength/maxLength`.
- The current broken behavior came from fragmented upstream drainage truth
  forcing downstream compensation layers.
- Hydrology truth must own conditioned routing, terminal typing, basin ids,
  discharge, and river hierarchy before `map-rivers` selects the Civ-visible
  subset.

### 2. Architecture Boundary Prosecutor

Verdict:

- The repo already has a decided architecture; previous wrong-owner moves were
  drift, not unresolved design.
- The policy package is the owner for Civ facts and constants only.
- MapGen domains own domain logic and policies.
- Stages sequence ops and publish artifacts.

Wrong-owner findings:

- `projection-policies/` was an invented owner for river selector logic.
- Public `map-rivers.riverProjection.minLength/maxLength` was a wrong product
  surface.
- Step-local routing logic hidden inside `hydrology-hydrography/steps/rivers.ts`
  is structurally suspicious whenever it stands in for a Hydrology-owned op.
- The river-type constant fix in `@civ7/map-policy` is correct and should stay.

### 3. Civ Runtime / Materialization Prosecutor

Verdict:

- We do directly stamp navigable-river terrain ourselves in the current MapGen
  path.
- Official Civ scripts also expose `TerrainBuilder.modelRivers(...)`, which is a
  different runtime path.
- Terrain-readback, river metadata, and rendered visibility are separate proof
  surfaces, and they can diverge.

Load-bearing findings:

- `TERRAIN_NAVIGABLE_RIVER` is a terrain row, not equivalent to `GameplayMap`
  river metadata.
- Official gameplay/tooltips read river metadata separately.
- Current evidence already allows the bad state: navigable-river terrain exists
  while `riverType` remains `NO_RIVER`.
- Minor-river stamping remains unproven. It must stay unclaimed until a real
  writer is discovered and verified.

### 4. Earth Hydrology Benchmark Prosecutor

Verdict:

- Representative Earthlike thresholds must come from external Earth evidence,
  never from current generator output.
- Some expectations can be numeric bands; others must remain typed or
  qualitative because they are scale-sensitive.

Externally anchored constraints:

- Non-perennial channels are globally common, not exceptional.
- Endorheic basins are a normal Earth surface mode, on the order of one-fifth
  of global land area.
- Drainage density varies strongly by climate, terrain, and network definition;
  there is no single universal Earth number to hard-code as a target.
- Lakes occupy a small minority of land area globally, and closed-basin
  termini can be lakes, seasonal lakes, or dry depressions.

Testing implications:

- Minor/headwater channels should dominate full truth-network length.
- Navigable trunks should be a coherent minority.
- Arid or endorheic maps need typed low/no-signal outcomes rather than being
  forced to show visible rivers.

### 5. Verification, DX, and Closure Prosecutor

Verdict:

- The proof taxonomy is now structurally correct in the active redesign plan,
  but product closure still depends on proof classes that are not yet complete.
- No amount of unit tests, OpenSpec validation, or terrain parity can stand in
  for rendered same-run Civ visibility.

Load-bearing findings:

- The correct ladder is:
  `hydrology-truth` -> `projection-plan` -> `terrain-readback` ->
  `metadata-readback` -> `studio-visible` -> `civ-rendered` ->
  `product-acceptance`.
- Rivers are not "done" because terrain rows exist.
- Users need a same-run ladder in Studio explaining:
  planned physical rivers, planned major rivers, projected navigable trunks,
  engine terrain readback, metadata divergence, and typed no-signal reasons.

### 6. Semantic Git / Spec Archaeology Prosecutor

Verdict:

- The active worktree direction is already much closer to the correct design
  than the stale main-checkout topology.
- Several past confusions were already explicitly rejected in the current
  execution plan and ADRs; they must not be revived under the excuse of history.

Load-bearing findings:

- The accepted owner split now exists in `ADR-008` and the active execution
  redesign plan.
- Old assumptions that `map-rivers` should preserve public selector internals,
  or that terrain-readback can close the product, are now stale and should be
  treated as rejected history.
- `TerrainBuilder.modelRivers(...)` remains official runtime evidence, but not
  authored truth or a license to blur boundaries.

## Consolidated Verdict

### Root Cause

The missing visible-river outcome is not just a downstream stamping bug. The
deeper issue is that river visibility cannot be trustworthy until Hydrology
publishes coherent canonical drainage truth:

- conditioned routes,
- typed terminals,
- coherent major/minor hierarchy,
- basin-aware lake intent,
- and explicit no-signal cases.

Downstream river projection is allowed to choose a Civ-visible subset from that
truth. It is not allowed to repair broken hydrology by inventing corridors or
by exposing selector internals as the public model.

### Owner Map

| Concern | Owner | Explicit non-owners |
| --- | --- | --- |
| terrain, land/water form, depressions as terrain precursors | Morphology | Hydrology projection, policy package |
| canonical drainage graph, basin ids, terminal typing, discharge, river class, lake intent | Hydrology | Morphology glue, `map-rivers`, `@civ7/map-policy` |
| Civ constants, enums, runtime identifiers | `@civ7/map-policy` + generated `@civ7/types` | Hydrology algorithms, projection rules |
| navigable terrain subset selection from Hydrology truth | `map-rivers` consuming a Hydrology op contract | projection-policy dumping grounds, policy package |
| runtime writes/readback, camera proof | adapter + direct-control + Studio proof tooling | Hydrology truth logic |

### Runtime Reality

- Lakes have a stronger direct authored path today.
- Navigable rivers are currently stamped as terrain in MapGen.
- Civ river metadata can still remain zero after that stamping.
- Minor-river runtime stamping is not yet proven.

### Product Reality

The product goal is not "terrain rows exist." The product goal is:

- physically grounded hydrology truth,
- coherent Civ-visible river projection,
- same-run Studio/Civ parity,
- rendered in-game visible rivers,
- and closure records that cannot overclaim.

## Workstream Implications

The active execution redesign plan remains the correct full-scope train. This
adversarial pass sharpens, rather than replaces, that train:

1. `upstream-drainage-routing-repair`
2. `hydrology-river-network-metrics`
3. `map-rivers-navigable-coherence`
4. `river-runtime-visible-proof`
5. `studio-river-lake-inspector-dx`
6. `river-catalog-adapter-contract-hardening`
7. `lake-floodplain-product-proof-gates`
8. `swooper-earthlike-product-acceptance-proof`

Additional rule from this synthesis:

- generic `projection-policies` is not a lawful owner. Any surviving helper in
  that area must either be deleted or moved under a real owner as the execution
  slices land.

## Closure Rules Reaffirmed

The workstream stays open until same-run evidence proves all of the following:

1. Hydrology routing truth is canonical, acyclic, and physically benchmarked.
2. Normal Earthlike maps produce coherent visible navigable trunks without
   fallback corridor repair.
3. Terrain-readback matches projected navigable terrain.
4. River metadata is either proven or explicitly scoped out as unsupported.
5. Studio exposes same-run river/lake/floodplain state and mismatch reasons.
6. Camera-targeted Civ screenshots show visible rivers on sampled live tiles.
7. Lakes and floodplains have exact active proof rows.
8. Product-acceptance rows and peer review disposition agree with the proof
   labels.

If any one of those is missing, the work is not complete.
