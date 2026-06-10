## 1. Framed objective

Determine the upstream-correct ownership boundary between Morphology and Hydrology for river/lake recovery, with emphasis on the canonical owner for:

- basin precursors,
- pit handling,
- depression filling / spill routing,
- flow directions,
- flow accumulation,
- river-network classification,
- downstream Civ projection inputs.

Frame commitments:

- Foreground the repo's durable authority model, not current container accidents.
- Treat cross-domain truth ownership separately from local helper ownership.
- Be adversarial against "keep it where it is because callers already exist" reasoning.
- Preserve the established product rule that Map stages project truth and do not own upstream truth.

Working hard core:

- There should be one canonical owner for cross-domain hydrology truth.
- `packages/civ7-map-policy` is not a fallback owner for physics or routing.
- If routing remains duplicated, one copy must be demoted to local support rather than left as competing truth.

## 2. Investigation design: questions, exclusions, falsifiers, evidence hierarchy, stop conditions

### Questions

1. What do the active architecture authorities currently say owns routing truth?
2. Which live consumers actually read `artifact:morphology.routing` versus `artifact:hydrology.hydrography` / `artifact:hydrology.lakePlan`?
3. Where does water semantics begin: at raw topographic descent, or at sink / spill / lake / discharge decisions?
4. Which surfaces are terrain precursors that can stay Morphology-local, and which become Hydrology truth once they affect lakes, rivers, ecology, placement, or map projection?
5. Does moving flow routing under Hydrology reduce duplication, or does it just relocate a Morphology-local erosion helper?

### Exclusions

- No visual-quality tuning.
- No engine parity adjudication beyond identifying projection consumers.
- No ocean-basin ownership except as a contrast class; ocean `basinId` is already clearly Hydrology-owned.
- No proposal to put routing logic into policy, adapter, or map projection stages.

### Falsifiers

This framing fails if any of the following turn out to be true:

- the active project baseline explicitly requires Hydrology to consume `artifact:morphology.routing` as a stable cross-domain contract;
- the live consumer graph shows broad non-hydrology consumers depending on Morphology routing as canonical water truth;
- the recommended boundary would require map stages or policy package to inherit upstream truth they are forbidden to own.

### Evidence hierarchy

1. User direction and repo instructions.
2. Root + subtree `AGENTS.md`, plus Graphite/process docs.
3. Active project baseline: `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
4. Canonical architecture/product docs:
   - `docs/system/ADR.md`
   - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
   - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`
   - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
   - `docs/system/mods/swooper-maps/architecture.md`
5. Current recipe, step contracts, op contracts, and direct consumers as implementation evidence.
6. Project spikes/deferrals only as tension detectors, not primary authority.

### Stop conditions

Stop once each listed surface has a clean owner, every live consumer fits that boundary without compatibility theater, and any remaining contradiction is isolated as migration debt rather than architecture ambiguity.

## 3. Current owner/consumer map

### A. Current authoritative owner map

- Current canonical docs and ADRs place `flow routing truth` under Morphology:
  - `docs/system/ADR.md` ADR-006: `morphology-routing` is "flow routing truth".
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` includes `artifact:morphology.routing` and `morphology/compute-flow-routing`.
- Current canonical docs place Hydrology truth downstream of Morphology topography:
  - `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md` says Hydrology requires Morphology topography and owns `hydrography` + `lakePlan`.
- Current product/architecture rules keep map stages projection-only:
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
  - `docs/system/mods/swooper-maps/architecture.md`

### B. Live implementation owner/consumer map

#### Basin precursors

- Current owner in practice: Morphology topography/coastline/substrate artifacts.
- Actual consumers: Hydrology climate/hydrography, Ecology, Placement, map projection stages.
- Assessment: correct as terrain precursor ownership.

#### `artifact:morphology.routing` / `morphology/compute-flow-routing`

- Current owner:
  - domain contract: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-flow-routing/contract.ts`
  - stage owner: `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-routing/**`
- Actual live consumers of the published artifact:
  - `morphology-erosion/steps/geomorphology.contract.ts`
  - `morphology-features/steps/mountains.contract.ts`
- Notably absent:
  - Hydrology does not require `artifact:morphology.routing`.
  - Ecology, Placement, `map-hydrology`, and `map-rivers` do not read it.
- Quality of current artifact:
  - `flowDir` = steepest-descent local receiver.
  - `flowAccum` = simple high-to-low accumulation.
  - `basinId` = allocated then filled entirely with `-1`; no real basin ownership implemented.

#### Hydrology routing/discharge/hydrography path

- Current owner:
  - `hydrology-hydrography/steps/rivers.ts`
  - `hydrology/accumulate-discharge`
  - `hydrology/project-river-network`
  - `hydrology/plan-lakes`
- Actual behavior:
  - `rivers.ts` recomputes `flowDir` from Morphology topography using `selectFlowReceiver(...)` instead of consuming Morphology routing.
  - `hydrology/accumulate-discharge` contract explicitly states `flowDir` is owned within Hydrology and should not be recomputed inside the op.
  - `hydrology/plan-lakes` consumes Hydrology `flowDir`, `discharge`, and `sinkMask`.
  - `hydrology.hydrography` publishes `runoff`, `discharge`, `riverClass`, `flowDir`, `sinkMask`, `outletMask`.

#### Actual downstream consumers of Hydrology truth

- `artifact:hydrology.hydrography` consumers:
  - `hydrology-hydrography/lakes`
  - `hydrology-climate-refine`
  - `map-rivers`
  - ecology feature scoring/planning
  - placement input derivation and starts
  - diagnostics
- `artifact:hydrology.lakePlan` consumers:
  - `map-hydrology`
  - ecology feature planning/scoring
  - placement
  - diagnostics

#### `basinId`

- Morphology `basinId` has no live consumer beyond validation/viz.
- Hydrology `basinId` is only optional in schema/validation and is not published by `hydrology-hydrography/rivers.ts`.
- The only real, functional `basinId` owner in repo today is ocean-basin decomposition under Hydrology (`compute-ocean-geometry`), not land drainage basins.

#### Policy package

- `packages/civ7-map-policy/AGENTS.md` explicitly excludes ownership of MapGen physics, morphology, hydrology strategy, and recipe order.
- No live policy consumer owns any of the questioned surfaces.

### C. Current contradiction

The repo currently has two routing stories:

1. authoritative docs say Morphology owns routing truth; but
2. Hydrology already recomputes its own routing and every real downstream water/ecology/placement/projection consumer reads Hydrology artifacts, not Morphology routing.

That is not a healthy "shared responsibility" boundary. It is duplicated truth with one side mostly serving Morphology-internal terrain consumers.

## 4. Recommended owner boundary with rationale

### Recommended boundary

#### Morphology should own

- topography, sea level, land/water mask, bathymetry;
- substrate and terrain-incision support fields;
- coastline and shelf metrics;
- terrain-only basin precursors:
  - local minima candidates,
  - relief/enclosure signals,
  - outlet opportunity signals,
  - any cheap descent geometry needed only by erosion / mountain planning.

#### Hydrology should own

- pit handling;
- depression resolution policy;
- spill routing versus endorheic retention;
- canonical flow directions for the drainage network;
- canonical flow accumulation / discharge accumulation;
- land drainage basin identity;
- sink/outlet classification as water-system truth;
- river-network classification;
- lake planning;
- any inputs consumed by `map-hydrology`, `map-rivers`, Ecology, Placement, or diagnostics as water truth.

### Rationale

The clean boundary is not "terrain below here, water above there" in an abstract sense. It is where semantics stop being purely geomorphic and start deciding water fate.

Raw topographic descent is still terrain. But the moment the system must decide:

- whether a pit is noise, lake, terminal basin, or spill path;
- whether a closed depression stays endorheic;
- how upstream drainage combines with precipitation/runoff;
- what counts as a river channel versus just low ground;

the owner is Hydrology, because those decisions define hydrology truth consumed across multiple downstream domains.

Actual consumer evidence supports that boundary:

- Morphology routing is only used by Morphology erosion/mountain planning.
- Hydrology hydrography/lakePlan feed every real cross-domain water consumer.
- Hydrology already recomputes routing because its real contract needs water semantics, not just terrain descent.

## 5. Specific move/no-move recommendation for flow routing

### Recommendation

Canonical flow routing should live under Hydrology.

### But not as a naive file move

Do not simply move `morphology/compute-flow-routing` into the Hydrology folder and declare victory. The current Morphology implementation is not a full hydrology owner:

- it does no pit resolution;
- it does no depression fill / spill solve;
- it assigns no meaningful land `basinId`;
- it computes only steepest descent + simple accumulation.

That means a wholesale move would preserve the wrong abstraction, just in a different directory.

### Concrete call

- **Move:** the canonical, published cross-domain routing contract used for rivers/lakes/ecology/placement/map projection.
- **Do not preserve:** `artifact:morphology.routing` as the public owner of drainage truth.
- **Allow temporarily:** a Morphology-local terrain-routing helper if erosion/mountain planning still need a cheap descent/accumulation proxy before Hydrology runs.

If the repo wants one public routing truth artifact, Hydrology should own it.

If Morphology still needs its own local descent support, that support should be treated as Morphology-internal compute, not as the canonical river/lake routing product.

## 6. Implications for policy package, domain ops, stages, and artifacts

### Policy package

- No ownership expansion into `packages/civ7-map-policy`.
- Policy may inform Civ legality or projection constraints later, but it must not own drainage physics or routing semantics.

### Domain ops

- Hydrology should gain the canonical routing/depression solver layer, either as:
  - a new routing/depression op family, or
  - a widened hydrography op spine before `accumulateDischarge`.
- `hydrology/accumulate-discharge` already points in this direction by expecting Hydrology-owned `flowDir`.
- Morphology should retain only terrain-local consumers if they truly need pre-hydrology routing proxies.

### Stages

- Do not create a new stage just to mirror the old folder split.
- Preferred target: fold canonical routing ownership into `hydrology-hydrography`, because that stage already owns river density / lakeiness semantics and publishes `hydrography` + `lakePlan`.
- Only promote a separate Hydrology routing stage if it earns a real stage surface:
  - independent authoring knobs,
  - separate handoff artifact,
  - separate recipe placement,
  - or trace/review identity that matters product-wise.
- If Morphology keeps a local routing helper for erosion/mountains, that helper can remain under Morphology without claiming cross-domain truth.

### Artifacts

- `artifact:morphology.routing` should be demoted to Morphology-local support or eventually removed from the cross-domain contract surface.
- Hydrology should own the published drainage truth artifact surface:
  - either by extending `artifact:hydrology.hydrography`,
  - or by introducing an upstream Hydrology routing artifact consumed by `hydrography`, `lakePlan`, `map-rivers`, Ecology, and Placement.
- Downstream Civ projection inputs belong under Hydrology:
  - `lakePlan` for `map-hydrology`,
  - `riverClass` / discharge / canonical routing fields for `map-rivers`,
  - water truth inputs for Ecology and Placement.

## 7. Risks / migration constraints

1. **Authority update required.**
   Current canonical docs and ADR-006 explicitly place routing truth in Morphology. Accepting this recommendation requires durable authority updates, not just code movement.

2. **Recipe-order constraint.**
   Morphology erosion and mountains currently consume `artifact:morphology.routing` before Hydrology stages run. That blocks a trivial deletion or stage swap.

3. **Temporary duplication risk.**
   During migration, the repo may need both:
   - a Morphology-local terrain-routing helper, and
   - a Hydrology-owned canonical routing solver.
   That is acceptable only as an explicitly temporary split with different meanings, not as two competing truth surfaces.

4. **Behavior shift risk.**
   Once Hydrology owns depression fill / spill routing, lake counts, sink masks, discharge structure, and river classification will change. Existing thresholds and parity expectations will need recalibration.

5. **Artifact/viz churn.**
   Current viz/data keys (`morphology.routing.*`) and step traces will need migration if cross-domain ownership moves.

6. **`basinId` is currently fake authority.**
   No meaningful land basin product exists yet. Any migration plan that talks about basin ownership as already implemented is overstating the current system.

7. **Do not solve this by compatibility shims.**
   Keeping Morphology as the public owner while Hydrology silently recomputes its own routing would preserve the exact ambiguity this investigation is supposed to remove.
