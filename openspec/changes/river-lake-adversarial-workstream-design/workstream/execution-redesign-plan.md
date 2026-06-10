# River/Lake Recovery Execution Redesign

Date: 2026-06-09
Owner: Codex / river-lake recovery workstream
Status: active design authority for the remaining execution train

Second-wave authority addendum:

- `workstream/2026-06-09-second-wave-synthesis.md`
- `workstream/agent-notes/2026-06-09-agent-*-second-wave.md`

## Objective

Finish the river/lake recovery as a physically grounded, architecture-correct,
execution-ready workstream. The target is not "some terrain rows exist." The
target is:

- Hydrology truth that produces coherent drainage basins, rivers, and lakes.
- Projection/materialization that makes the right subset legible in Civ.
- Same-run Studio/Civ parity and rendered in-game river visibility.
- Closure records that cannot mistake a narrow technical pass for product
  completion.

## Controlling Authority

Use these sources in this order for the remaining work:

1. Current user decisions in this thread.
2. Root and subtree `AGENTS.md`.
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
4. `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
5. `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
6. `docs/system/mods/swooper-maps/architecture.md`
7. `docs/system/ADR.md`, especially ADR-008
8. Current OpenSpec changes as downstream execution-control artifacts
9. Source, tests, runtime proofs, and official resources as evidence only

## Current Runtime And Resource Evidence

- Official Civ7 resources were refreshed and audited at snapshot `fbc38ef`,
  which remains the current authoritative game-data evidence for this train.
- Current runtime evidence on 2026-06-09 records
  `RiverTypes.NO_RIVER=-1`, `RIVER_MINOR=0`, and `RIVER_NAVIGABLE=1`; those
  values are now shared through `@civ7/map-policy` and generated
  `@civ7/types`.
- Current same-run terrain proof shows that `TERRAIN_NAVIGABLE_RIVER` can be
  present while live river metadata remains zero. This keeps terrain-readback
  and metadata-readback as separate proof classes.
- Fresh live read-only probe on 2026-06-09 observed `terrainNavigableRiver=69`
  with `river=0`, `navigableRiver=0`, and `minorRiver=0` across `6996` plots.
  This remains the clearest live evidence that terrain rows do not yet prove
  runtime river behavior or rendered visibility.
- Official scripts still expose `TerrainBuilder.modelRivers(...)`,
  `defineNamedRivers()`, and `storeWaterData()`; no stable public per-tile minor
  river writer has yet been proven.
- Current `map-rivers` code directly stamps selected navigable-river terrain,
  but that remains narrower than full Civ river semantics. Minor-river Civ
  materialization is still the highest-risk unproven gap in this train.

## Physical Grounding

The physical model for this workstream is:

- Morphology shapes the earth surface and land/water form.
- Hydrology routes water over that terrain after conditioning depressions and
  terminals into an acyclic drainage graph.
- Lakes are not arbitrary decorations; they are sink/spill outcomes within that
  routing model.
- Rivers have hierarchy:
  - hidden drainage network,
  - minor/headwater channel intent,
  - major/projectable channel intent,
  - a smaller Civ-visible navigable trunk subset.
- Minor channels should dominate network length. Navigable trunks should be a
  coherent minority selected from major-river intent, not from projection-only
  invented corridors.
- Arid, endorheic, or otherwise no-signal maps may legitimately produce few or
  no visible navigable rivers. That outcome must be typed, not silently treated
  as either a pass or a failure.

Representative earthlike thresholds are not allowed to come from current
generator behavior. They must be derived from external Earth evidence first and
then used to judge local seed matrices. Current benchmark authority for this
train starts from:

- HydroRIVERS / HydroATLAS channel inclusion floors (`>=10 km^2` upstream area
  or `>=0.1 m^3/s` average discharge) and routed-network coverage.
- Lin et al. 2021 variable-drainage-density global hydrography, which makes
  explicit that Earth drainage density varies strongly with climate and
  physiography rather than following one universal threshold.
- Recent global non-perennial stream work, which treats headwater and
  intermittent channels as the majority of total network length, so minor rivers
  must not be modeled as a rare edge case.
- Global endorheic-basin datasets, which place internally drained basins at
  about one-fifth of global land area, so closed-basin/lake termini are normal
  rather than failure by default.
- Global lake inventories, which constrain plausible lake abundance and area.

Benchmark usage rule from the adversarial pass:

- do not collapse Earth hydrology to one scalar river-density target;
- use benchmark families by proof surface (`hydrology-truth`,
  `projectedVisibleRivers`, `lakeMaterialization`, `renderedCivVisibility`);
- accepted numeric anchors are low-band and definition-aware:
  - non-perennial channels must remain the majority globally;
  - headwaters should dominate total network length;
  - lake area should stay in the low single digits of land area, not near-zero
    and not tens of percent;
  - endorheic / closed drainage must remain materially present.

## Locked Ownership Boundary

| Concern | Owner | Forbidden owners |
| --- | --- | --- |
| Topography, land/water mask, terrain basins/depressions, geomorphic proxies | Morphology domain | Hydrology projection, map-rivers, policy package |
| Canonical drainage routing, basin ids, terminal typing, contributing area, discharge, river class, lake intent | Hydrology domain | Morphology recipe glue, map-rivers, `@civ7/map-policy` |
| Civ facts and compliance tables such as river type enums and cataloged runtime identifiers | `@civ7/map-policy` and generated `@civ7/types` | Hydrology routing, river selection rules, projection policy |
| Navigable river terrain subset selection from Hydrology truth | `map-rivers` stage consuming a Hydrology-owned op contract | morphology, policy package, invented projection-policy folders |
| Engine terrain/materialization and readback | map projection stages + adapter/runtime tools | Hydrology truth, policy package |
| Camera/screenshot/runtime visible proof | direct-control and Studio/server proof tooling | map-rivers step logic, caller-local transports |
| Product acceptance and reviewer disposition | product acceptance OpenSpec changes | technical proof slices closing themselves as product-complete |

## Rejected Contracts And Wrong Directions

These are explicitly out:

- `map-rivers.riverProjection.minLength/maxLength` as a public product model.
- Stage-owned river selector semantics hidden behind `projection-policies/`.
- Projection-only fallback corridors that repair broken upstream drainage.
- Treating `TERRAIN_NAVIGABLE_RIVER` terrain readback as proof of Civ river
  metadata, gameplay semantics, or rendered visibility.
- Treating the current categorical `modelRivers(...)` ban as settled product
  truth before the minor-river runtime-authoring question is explicitly
  dispositioned.
- Moving Hydrology selection logic into `@civ7/map-policy`.
- Preserving broken legacy config because it already exists.
- Claiming minor-river stamping until a real runtime writer is discovered and
  proven.

## User-Facing Knobs

Knobs stay where the product model is real and decoupled:

| Surface | Knob | Meaning | Notes |
| --- | --- | --- | --- |
| `hydrology-hydrography.knobs` | `riverDensity` | physical river-network classification density | affects Hydrology truth only |
| `hydrology-hydrography.knobs` | `lakeiness` | sink-derived lake expansion/posture | physical hydrology truth |
| `map-rivers.knobs` | `navigableRiverDensity` | Civ-visible navigable trunk projection density | projection-only; legacy alias `riverDensity` is debt to retire, not a contract to preserve |

Not public knobs:

- raw route-conditioning internals,
- legacy visibility aliases,
- selector length bounds,
- endpoint discharge percentiles,
- target major-tile fractions,
- fallback thresholds.

Those remain op defaults or compiled profiles until product authority proves a
user-facing need and a physically coherent abstraction.

## Proof Classes

The remaining train must keep these labels separate:

| Proof class | What it proves | What it does not prove |
| --- | --- | --- |
| `hydrology-truth` | generated routing/discharge/river/lake artifacts | engine projection or rendered visibility |
| `projection-plan` | selected navigable masks and projection metrics | runtime materialization |
| `terrain-readback` | live `TERRAIN_NAVIGABLE_RIVER` / lake terrain rows | Civ river metadata or visible camera output |
| `metadata-readback` | live `GameplayMap` river metadata | terrain visibility or rendered camera output |
| `studio-visible` | Studio layers/inspector show the same-run state coherently | Civ rendered visibility |
| `civ-rendered` | sampled camera-targeted screenshots show visible rivers | broad product acceptance |
| `product-acceptance` | reviewer-dispositioned same-run evidence meets row criteria | unrelated domains or future runs |

## Execution Change Train

### 1. `upstream-drainage-routing-repair`

- Purpose: keep canonical drainage routing in Hydrology and remove downstream
  compensation.
- Owner: Hydrology truth.
- Public knobs: none beyond existing Hydrology stage knobs.
- Required proof: routing fixtures, generated-map route metrics,
  discharge/lake/river truth integrity.
- Must not claim: rendered visibility or product closure.

### 2. `hydrology-river-network-metrics`

- Purpose: publish seed-matrix physical metrics and benchmarks before tuning.
- Owner: Hydrology truth diagnostics.
- Benchmark rule: adopt representative earthlike thresholds only from external
  Earth hydrology evidence, never from current Swooper output.
- Required expectations:
  - acyclic routes,
  - typed terminals,
  - coherent basin coverage,
  - major/minor hierarchy,
  - explicit no-signal cases.
- Must not own: projection/materialization or runtime camera proof.

### 3. `map-rivers-navigable-coherence`

- Purpose: select a coherent navigable subset from Hydrology major-river truth.
- Owner: `map-rivers` projection consuming a Hydrology-owned op contract.
- Public knob: `navigableRiverDensity`.
- Internal defaults: compiled density profiles, not public threshold fields.
- Required expectations:
  - normal `84x54` Earthlike maps with strong major-river signal must produce
    player-obvious navigable trunks,
  - arid/no-signal controls must emit typed exceptions,
  - same-run live terrain readback must match projected navigable terrain.
- Must not own: Hydrology truth semantics or minor-river metadata.

### 4. `river-runtime-visible-proof`

- Purpose: prove rendered visibility on the exact live run, not just terrain
  readback.
- Owner: direct-control / Studio proof tooling.
- Required proof:
  - exact-authorship proof must already be pass for the same run,
  - sampled live river coordinates,
  - camera target + zoom + visibility state,
  - screenshot paths + hashes tied to the same run,
  - explicit visual verdict.
- Closure policy:
  - manual screenshots and manual verdicts may support debugging, but they do
    not satisfy closure-capable `civ-rendered` proof by themselves;
  - the verifier must not report closure-capable success without
    `exact-authorship=pass`.
- Must not claim: whole-product acceptance by itself.

### 5. `studio-river-lake-inspector-dx`

- Purpose: give users a same-run status ladder for why rivers/lakes do or do
  not appear.
- Owner: Studio DX and projection diagnostics.
- Required surfaces:
  - planned minor,
  - planned major,
  - projected navigable,
  - engine terrain readback,
  - metadata divergence,
  - mismatch/no-signal explanations,
  - whether the current run is eligible for visual/product acceptance.

### 6. `river-catalog-adapter-contract-hardening`

- Purpose: keep runtime constants/compliance tables correct without leaking
  algorithm ownership into catalog or adapter layers.
- Owner: `@civ7/map-policy`, generated types, adapter contract tests.
- Required proof:
  - runtime/table parity for river-type values,
  - mock/live contract alignment,
  - explicit evidence wording.

### 7. `lake-floodplain-product-proof-gates`

- Purpose: close lake/floodplain rows only from active exact evidence.
- Owner: proof tooling + product acceptance ledgers.
- Required proof:
  - exact lake counters,
  - active floodplain-producing seed,
  - scenario matrix rows with dispositions.

### 8. `swooper-earthlike-product-acceptance-proof`

- Purpose: hold the full product closure boundary across Earthlike worlds.
- Owner: product acceptance workstream.
- Required rows:
  - mountain regions,
  - rivers/floodplains,
  - resources/wonders,
  - starts,
  - ecology/vegetation,
  - coasts/shelves/archipelagos,
  - Studio visualization.
- Closure rule: every row must be pass, fail, blocked, or reclassified with
  same-run evidence and review disposition.

## Sequence

1. Finish and validate Hydrology routing truth.
2. Publish Hydrology metrics and physical expectations.
3. Repair navigable projection coherence using the corrected Hydrology truth.
4. Tighten stale owner wording and retire legacy public alias debt that still
   teaches the wrong model.
5. Add runtime rendered-visibility proof.
6. Add Studio inspector/status ladder.
7. Harden catalog/adapter/runtime evidence boundaries.
8. Close lake/floodplain gates with active exact rows.
9. Run Earthlike product acceptance and open only targeted repair rows from
   failing evidence.

## Non-Negotiable Closure Boundary

The river/lake recovery is not complete until current evidence proves all of
these:

1. Hydrology routing truth is canonical, acyclic, and physically benchmarked.
2. Normal Earthlike maps produce coherent visible navigable trunks without
   downstream fallback corridors.
3. Same-run live terrain readback matches projected navigable terrain.
4. River metadata is either proven or explicitly scoped out as an unsupported
   writer capability.
5. Studio exposes the relevant same-run river/lake/floodplain layers and
   mismatch states.
6. Civ screenshots centered on sampled live river tiles show visible rivers.
7. Lakes and floodplains have exact active proof rows.
8. Product acceptance rows and reviewer dispositions agree with the proof
   labels.

Until all eight are proven, the workstream remains open.
