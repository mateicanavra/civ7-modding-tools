# Foundation Architecture And Generative Pipeline Packet

Date: 2026-05-31

Status: investigation packet, docs-only. This packet is not an implementation
spec yet. It frames the current Foundation architecture, the generative layers
it builds, the artifacts downstream systems consume, and the hardening slices
that should become OpenSpec changes after review.

## Frame

**Question.** What does Foundation really build today, where are material
history, kinematics, events, provenance, and projection coupled or collapsed,
and which layers should be hardened so Morphology, Hydrology, Ecology,
Placement, resources, and biomes can consume explicit geologic intent instead
of inferring hidden state?

**Hard core.**

- Material history, plate kinematics, tectonic events, provenance, and tile
  projections must remain separately understandable.
- Downstream consumers should read explicit artifacts, not recover meaning
  from sampled or buffer-local state.
- Tuning must follow predeclared expected ranges and causal dumps.
- Map projection stages materialize truth. They do not own truth planning.

**Exterior.**

- No implementation belongs in this packet.
- No threshold-only mountain tuning plan is accepted as the answer.
- No dual path or fallback contract is proposed here.

**Reframe triggers.**

- Reframe toward Morphology if live causal dumps prove Foundation history and
  provenance are healthy while belt drivers or landform planners erase them.
- Reframe toward runtime projection only if planned mountain and hill masks are
  healthy but final terrain or readback loses them.
- Reframe toward product design if Civ7 terrain or gameplay constraints reject
  the physical abstraction.

## Evidence State

The accountable packet worktree is:

```text
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-foundation-architecture-packet
branch: codex/foundation-architecture-packet
opening HEAD: fec2f4c07137c0f8e4ab5da7a3c857cefc69d955
opening status: clean
```

The main checkout was dirty with unrelated Studio, direct-control, SDK, map
config, and OpenSpec work on `codex/studio-run-in-game-workstream`; this packet
does not include those uncommitted files as evidence except as protected
external state. Recent relevant worktrees included:

- `codex/systematic-skill-review-fixes` for the latest systematic workstream
  skill review.
- `codex/systematic-evidence-workstream-skill` for the systematic workstream
  skill framing branch.
- `codex/morphology-terrain-handoff-reference` and follow-on Morphology terrain
  branches in the active Graphite stack.
- `codex/resource-runtime-proof` for the downstream resource proof workstream.

Authority order used here:

1. Current code and tests in the packet worktree.
2. Root and subtree `AGENTS.md` routers.
3. Accepted architecture normalization and truth-vs-projection docs.
4. Current project handoff packets and runbooks.
5. External physical-domain sources as analog constraints only.
6. Older Foundation/Morphology domain references when not contradicted by code.

## Peer Lanes

Six read-only peer agents supplied evidence packs. The owner of this packet
synthesizes and is accountable for conclusions.

| Lane | Agent | Evidence focus |
| --- | --- | --- |
| Code topology | Leibniz | Foundation stage, step, op, artifact, validator, knob, test, and docs drift inventory. |
| Artifact consumers | Hubble | Truth vs projection flow and consumer matrix from Foundation to downstream domains. |
| Physical analogs | Euclid | Crust, cratons, plate motion, boundaries, orogeny, erosion, and polar ice analogs. |
| Mountain/belt path | Euler | Belt-driver, ridge, foothill, projection, and terrain-readback failure hypotheses. |
| Downstream domains | Banach | Hydrology, Ecology, Placement, resources, and biome substrate needs. |
| Red team | Nietzsche | Validation overclaim, live-readback overclaim, docs drift, Graphite/worktree hygiene, and proof gates. |

## Current Pipeline DAG

The live standard recipe runs one `foundation` stage first, followed by
Morphology, Hydrology, Ecology, map projections, and Placement. Foundation
itself has ten ordered steps. The canonical Foundation domain reference still
lists an older six-step order, so source code is authoritative here.

```mermaid
flowchart TD
  "standard recipe" --> "foundation stage"
  "foundation stage" --> "mesh step"
  "mesh step" --> "mantle-potential step"
  "mantle-potential step" --> "mantle-forcing step"
  "mantle-forcing step" --> "crust step (crustInit)"
  "crust step (crustInit)" --> "plate-graph step"
  "plate-graph step" --> "plate-motion step"
  "plate-motion step" --> "tectonics step"
  "tectonics step" --> "crust-evolution step"
  "crust-evolution step" --> "projection step"
  "projection step" --> "plate-topology step"
  "plate-topology step" --> "morphology-coasts"
  "morphology-coasts" --> "morphology-routing"
  "morphology-routing" --> "morphology-erosion"
  "morphology-erosion" --> "morphology-features"
  "morphology-features" --> "hydrology-climate-baseline"
  "hydrology-climate-baseline" --> "hydrology-hydrography"
  "hydrology-hydrography" --> "hydrology-climate-refine"
  "hydrology-climate-refine" --> "ecology-pedology"
  "ecology-pedology" --> "ecology-biomes"
  "ecology-biomes" --> "ecology-features"
  "ecology-features" --> "map-morphology"
  "map-morphology" --> "map-hydrology"
  "map-hydrology" --> "map-elevation"
  "map-elevation" --> "map-rivers"
  "map-rivers" --> "map-ecology"
  "map-ecology" --> "placement"
```

Primary code references:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*`
- `mods/mod-swooper-maps/src/domain/foundation/ops/index.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/contracts.ts`

## Stage, Step, Op, Artifact Boundaries

| Boundary | Current responsibility | Current Foundation example | Finding |
| --- | --- | --- | --- |
| Recipe | Global stage order. | `standardRecipe` places `foundation` before Morphology. | Recipe ownership is clear. |
| Stage | Authoring/config surface and local step composition. | `foundation` exposes `plateCount`, `plateActivity`, and step overrides; compile injects internal `projection`. | Stage is still one broad Foundation stage, which is acceptable if outputs remain explicit. |
| Step | Executable boundary: read artifacts, bind ops, publish bounded artifacts. | `tectonics` orchestrates current segments, era membership, per-era motion, events, fields, rollups, current tectonics, tracer advection, and provenance. | `tectonics` is a large orchestration step. Ops are decomposed, but step-level layers are collapsed for review and validation. |
| Op | Pure domain algorithm with contract. | `computeMantleForcing`, `computeTectonicSegments`, `computeCrustEvolution`. | Op inventory is mostly aligned. `plate-topology` still lacks an op boundary. |
| Truth artifact | Canonical domain product, usually mesh-space for Foundation. | `artifact:foundation.mesh`, `crustInit`, `crust`, `plateMotion`, `tectonicHistory`, `tectonicProvenance`, `tectonics`. | Foundation truth is clearer than older docs suggest, but material evolution lacks per-era truth. |
| Projection artifact | Recomputable map-facing surface. | `artifact:map.foundationCrustTiles`, `foundationTectonicHistoryTiles`, `foundationTectonicProvenanceTiles`, `foundationPlates`. | Projection is still inside Foundation stage and derives some gameplay-facing tensors. |
| Buffer | Mutable runtime array handle. | `morphology.topography`, `climateField` buffers. | Downstream can observe execution-order state; packet treats these as mutable truth handles, not immutable snapshots. |
| Effect | Engine mutation or adapter materialization. | `map-morphology/plotMountains`, `map-elevation/buildElevation`. | Projection appears simple for mountains; runtime erasure still needs live proof before being ruled out. |

## Generative Layers Over Time

| Layer | Current builder | Output today | What the layer means | Coupling or missing surface |
| --- | --- | --- | --- | --- |
| 0. Seed and dimensions | Recipe/config | Run inputs. | The map envelope and deterministic seed. | Expected ranges are not fully attached to Foundation/mountain outcomes. |
| 1. Mesh geometry | `mesh` step, `computeMesh` | `foundation.mesh` | Mesh-space substrate for Foundation truth. | Tile consumers do not use mesh directly. |
| 2. Mantle potential | `mantle-potential` | `foundation.mantlePotential` | Low-frequency thermal/driver potential. | Treated as deterministic gameplay proxy, not unitful mantle physics. |
| 3. Mantle forcing | `mantle-forcing`, `computeMantleForcing` | `foundation.mantleForcing` | Velocity, stress, melt, and forcing fields. | Per-run normalization must not be mistaken for physical comparability. |
| 4. Initial crust | `crust`, `computeCrust` | `foundation.crustInit` | Initial basaltic lid and material strength/maturity priors. | This is a useful layer but is mostly internal after projection. |
| 5. Plate partition | `plate-graph`, `computePlateGraph` | `foundation.plateGraph` | Plate ownership, boundaries, adjacency, and resistance. | Topology is later rederived in tile space for `plateTopology`. |
| 6. Plate kinematics | `plate-motion`, `computePlateMotion` | `foundation.plateMotion` | Plate vectors/rotation and fit/residual fields. | Public `plateActivity` mostly affects projection kinematics, not truth motion/history. |
| 7. Current boundary segments | `tectonics`, `computeTectonicSegments` | `foundation.tectonicSegments` | Regime, polarity, compression, extension, shear, volcanism, fracture. | Current and historical segment lanes are inside one broad step. |
| 8. Era events and fields | `tectonics` era loop | Per-era fields in `tectonicHistory` | Historical boundary type, uplift, collision, subduction, rift, shear, volcanism, fracture. | Events exist but do not publish material deltas or per-era crust states. |
| 9. History rollups | `computeTectonicHistoryRollups` | `tectonicHistory.rollups` | Cumulative and recent tectonic intensity. | Strong bridge to Morphology, but compresses history into scalar rollups. |
| 10. Tracer/provenance | `computeTracerAdvection`, `computeTectonicProvenance` | `foundation.tectonicProvenance` | Origin era, plate lineage, last boundary encounter, age. | Good conceptually; projected `driftDistance` is currently placeholder/default in projection output. |
| 11. Crust evolution | `crust-evolution`, `computeCrustEvolution` | final `foundation.crust` | Material state after tectonic history integration. | Major collapse: final-only material state, no per-era crust snapshots or mutation artifact. |
| 12. Foundation tile projection | `projection`, `computePlates` | `map.foundation*` artifacts | Samples mesh truth into tile tensors and plate driver fields. | Nearest-cell sampling can make coarse/blocky drivers; projection also derives boundary/stress/shield fields. |
| 13. Belt/topography bridge | Morphology `landmassPlates`, `computeBeltDrivers` | `morphology.beltDrivers`, `topography`, `substrate` | Converts Foundation history/provenance into tile landform substrate. | Main downstream choke point. It selects sparse active belt seeds and diffuses outward. |
| 14. Landforms | Morphology features | `morphology.mountains`, `volcanoes` | Terrain intent masks and feature drivers. | Missing broad rough-land/upland/plateau/escarpment family. Hills are mostly foothills. |
| 15. Hydrology/ecology/resources | Hydrology, Ecology, Placement | Climate, hydrography, lakes, pedology, biomes, score layers, placement inputs. | Downstream game affordances. | Mostly consume Morphology/Hydrology/Ecology truth, not Foundation directly. |

## Truth And Projection Artifact Map

| Artifact | Kind | Publisher | Consumers | Notes |
| --- | --- | --- | --- | --- |
| `artifact:foundation.mesh` | Mesh truth | `mesh` | Foundation steps and projection. | Canonical Foundation geometry. |
| `artifact:foundation.mantlePotential` | Mesh truth proxy | `mantle-potential` | `mantle-forcing`. | Deterministic source field. |
| `artifact:foundation.mantleForcing` | Mesh truth proxy | `mantle-forcing` | `crust`, `plate-motion`, `tectonics`. | Useful driver layer; no physical units guarantee. |
| `artifact:foundation.crustInit` | Mesh truth | `crust` | `plate-graph`, `tectonics`, `crust-evolution`. | Initial basaltic lid and material priors. |
| `artifact:foundation.plateGraph` | Mesh truth | `plate-graph` | `plate-motion`, `tectonics`, projection. | Plate partition/adjoining graph. |
| `artifact:foundation.plateMotion` | Mesh truth | `plate-motion` | `tectonics`, projection. | Kinematic truth. |
| `artifact:foundation.tectonicSegments` | Mesh/edge truth | `tectonics` | Validators/viz; current tectonics. | Current boundary segment surface. |
| `artifact:foundation.tectonicHistory` | Mesh truth | `tectonics` | `crust-evolution`, projection. | 5 to 8 eras in current validation, not old fixed-three-era docs. |
| `artifact:foundation.tectonicProvenance` | Mesh truth | `tectonics` | projection. | Lineage and last-boundary provenance. |
| `artifact:foundation.tectonics` | Mesh truth | `tectonics` | `crust-evolution`, projection. | Current uplift/rift/stress-style tensors. |
| `artifact:foundation.crust` | Mesh truth | `crust-evolution` | projection. | Final material state. Missing history/delta trace. |
| `artifact:map.foundationTileToCellIndex` | Projection crosswalk | `projection` | Mostly validation/viz. | Published but not heavily consumed. |
| `artifact:map.foundationCrustTiles` | Projection | `projection` | Morphology `landmassPlates`. | Tile material state. |
| `artifact:map.foundationTectonicHistoryTiles` | Projection | `projection` | Morphology `landmassPlates`. | Main history bridge to belts/topography. |
| `artifact:map.foundationTectonicProvenanceTiles` | Projection | `projection` | Morphology `landmassPlates`. | Main provenance bridge. |
| `artifact:map.foundationPlates` | Projection | `projection` | `plateTopology`, islands, volcanoes. | Tile plate fields and boundary/proxy tensors. |
| `artifact:foundation.plateTopology` | Derived/projection-adjacent | `plate-topology` | Diagnostics/downstream topology users. | Named as Foundation but derived from tile plates. Needs op and ownership cleanup. |

## Downstream Consumer Matrix

| Consumer | Foundation path today | Stronger substrate likely needed |
| --- | --- | --- |
| Morphology coasts | Directly reads `map.foundationCrustTiles`, `map.foundationTectonicHistoryTiles`, and `map.foundationTectonicProvenanceTiles`; islands/volcanoes also read `map.foundationPlates`. | Geologic province, parent material, crust age/stability, rift basin, sedimentary basin, fracture/permeability, relief age, volcanic arc/ash, mesh-to-tile provenance confidence. |
| Morphology features | Reads `morphology.beltDrivers` plus topography for mountains and foothills. | Separate landform intents: ridge mountains, foothills, rolling uplands, old orogens, plateaus, escarpments, rift shoulders, craton/shield relief. |
| Hydrology | No direct Foundation read found. Consumes Morphology topography/coastline plus climate and hydrography truth. | Hydrogeomorphic substrate from Morphology: endorheic/rift basin likelihood, drainage divide persistence, permeability/fracture, sediment depth, shelf/passive margin geometry. |
| Ecology/Pedology | No direct Foundation read found. Pedology consumes topography, substrate, and climate. | Parent material, volcanic ash/fertility, soil maturity, sedimentary basin/depositional history, shield/craton vs young orogen signal. |
| Biomes/features | Consume climate indices, cryosphere, topography, pedology, hydrography, lakes, mountains, volcanoes. | Old vs young mountain identity, volcanic island maturity, reef/atoll lineage, disturbance/succession, ecotone provenance. |
| Placement/starts/wonders | Consume derived placement inputs from topography, hydrography, lakes, biomes, and pedology. | Explicit habitability and hazard affordances: flood risk, navigable river value, terrain hazard, landmass role, natural-wonder geologic reason/provenance. |
| Resources | Placement resource planning uses land mask, fertility, biome moisture/temp/aridity, river class, lake mask, and adapter candidates. It does not currently consume `ecology.resourceBasins`. | Connect resource basin truth to resources and enrich basins with cratons/ore belts, volcanic arcs, sedimentary basins, rifts, shelves, and evaporite/arid basins. |

## Control Surface

| Layer | Current control | Gap |
| --- | --- | --- |
| Foundation stage | `plateCount`, `plateActivity`. | Only broad plate discretization/activity. No semantic control for craton maturity, polar crust, crust growth, mountain belt age, rift basin prevalence, or material-history granularity. |
| Mesh/plate graph | Op-level configs for cells per plate, reference area, polar caps, resistance, seed quality. | Useful but low-level; not exposed as product/geologic intent. |
| Plate motion | Op-level residual and kinematic controls. | `plateActivity` affects projection posture more than truth history, which can mislead users expecting more active tectonics. |
| Tectonic history | Era count, event/field weights, rollup thresholds in ops/config. | No first-class "historical foundation" contract for material mutation over time. |
| Crust evolution | Maturity/thickness/damage integration in `computeCrustEvolution`. | Final-only output. Downstream cannot distinguish young arc crust, old shield, rifted passive margin, accreted terrane, or reworked orogen except through compressed rollups/provenance. |
| Projection | Boundary influence distance, movement/rotation scale. | Projection controls can look like truth controls. Sampling quality/confidence is not exposed to consumers. |
| Morphology mountains | Orogeny, ridge/foothill thresholds, caps, dilation, noise. | Thresholds help quantity, but do not create missing landform families. |
| Validation | Shape/range validators and focused tests. | Need semantic cross-artifact gates, deterministic fingerprints, causal dumps, and terrain share ranges. |

## Current Validators And Tests

| Surface | Current evidence | What it proves | What remains weak |
| --- | --- | --- | --- |
| Foundation artifact validators | `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` validates mesh, crust, mantle potential/forcing, plate motion, tile projections, plate graph, segments, history, provenance, plate topology, and tectonics. | Shape, finite/range, length, and enum compatibility. | Does not by itself prove physical causality, cross-artifact semantics, or product terrain quality. |
| Foundation topology and contract tests | Foundation tests cover topology lock, contract guards, no op-calls-op, mantle forcing, plate graph resistance, plate motion, polar plates policy, projection boundary band, tectonic events, segment/history behavior, mesh-first ops, and tile projection materials. | Stage/step/op boundaries and core Foundation invariants have regression coverage. | Coverage is mostly code-architecture and tensor-shape oriented. |
| Morphology mountain/belt tests | Morphology tests include belt-driver boundary closeness, physics-anchored mountains, nonzero mountain probes, and mountain presence checks. | The pipeline can produce nonzero mountain intent and guard specific belt-driver regressions. | Nonzero is not enough. Tests do not fully gate broad relief, old uplands, plateau fields, rough-land coverage, or acceptable terrain-share ranges. |
| World-balance stats | `mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts` gates several user-visible balance families. | Product-visible balance tests exist and can be extended. | Mountain/hill/flat ranges are not yet strong enough to catch the user-described sparse/blocky relief failure. |
| Runtime readback | `@civ7/direct-control` has bounded map/plot/grid read APIs, and newer direct-control workstreams define live proof surfaces. | Runtime proof is now feasible. | This packet did not run live Civ7. Runtime claims still require named seed/config/build readback. |

## Physical Analog Compression

These sources are constraints for game-scale design, not a claim that the
current model is physically unitful.

| Physical fact | Source | Game-scale translation |
| --- | --- | --- |
| Oceanic crust is thin and relatively uniform in deep basins, while old continental lithosphere can be much thicker. | [USGS global crustal structure](https://www.usgs.gov/publications/crust-and-lithospheric-structure-global-crustal-structure), [USGS tectonic plates](https://pubs.usgs.gov/gip/dynamic/tectonic.html) | Foundation should model crust class/material state separately from land/water. |
| New seafloor forms at divergent boundaries; very little seafloor is older than 150 million years because old seafloor is subducted. | [NOAA seafloor age](https://sos.noaa.gov/catalog/datasets/age-of-the-seafloor-contour-lines/) | Oceanic lid wants age bands away from ridges and old lithosphere near trenches. |
| Plate boundaries include divergent, convergent, transform, and broad boundary zones; plate motion rates vary from very slow ridges to more than 15 cm/yr. | [USGS plate motions](https://pubs.usgs.gov/gip/dynamic/understanding.html), [NPS plate boundaries](https://www.nps.gov/subjects/geology/plate-tectonics-types-of-plate-boundaries.htm) | Store vectors and boundary regimes separately; do not reduce all collision to "mountain". |
| Cratonic keels can be very thick and stable, and stability varies with size, velocity, basal drag, and reworking. | [USGS cratonic lithosphere](https://www.usgs.gov/publications/relations-between-cratonic-lithosphere-thickness-plate-motions-and-basal-drag) | Continents should have old stable cores, younger margins, and reworked belts. |
| Active collision can form broad uplifted plateaus, not only narrow ridge lines. | [USGS Himalaya seismicity](https://pubs.usgs.gov/of/2010/1083/j/) | Collision belts should produce ridge spine, deformation apron, plateau/foreland, and age surfaces. |
| Old orogens preserve long residual belts after active collision and erosion. | [USGS Appalachians](https://www.usgs.gov/publications/a-geologic-history-north-central-appalachians-part-3-alleghany-orogeny), [USGS Great Smoky geology](https://www.usgs.gov/geology-and-ecology-of-national-parks/geology-great-smoky-mountains-national-park) | Landform age should decay relief but leave old uplands and resistant belts. |
| Ice sheets flow outward from thick centers; bedrock topography and basal material influence flow; marine margins and shelves behave differently. | [NSIDC ice sheets](https://nsidc.org/learn/parts-cryosphere/ice-sheets) | Polar regions need bedrock plus ice-surface layers. Ice can hide relief and affect fjords, shelves, and cryosphere. |
| Glacial isostatic adjustment moves land after ice loading/unloading, including forebulge collapse. | [NOAA NGS isostatic adjustment](https://geodesy.noaa.gov/INFO/facts/ice-age.shtml), [NSIDC isostatic rebound](https://nsidc.org/learn/cryosphere-glossary/isostatic-rebound) | Full isostasy may be out of scope, but polar crust/ice should be separated so later Hydrology/Ecology can reason about bedrock vs ice. |

## Structural Problems

1. **Docs/code drift is now material.** `FOUNDATION.md` and `MORPHOLOGY.md`
   still describe older surfaces. Current code has mantle, plate motion,
   crust evolution, 5 to 8 era history, and Morphology history/provenance
   consumers that older docs omit or contradict.

2. **`tectonics` is a broad layer aggregator.** The underlying ops are split,
   but the step owns current segments, per-era kinematics, per-era events,
   fields, rollups, current tectonics, tracer advection, and provenance. That
   makes review, validation, and control-surface design harder.

3. **Material evolution is collapsed into final crust.** `crustInit`,
   `tectonicHistory`, and `tectonicProvenance` are valuable, but
   `crust-evolution` publishes only final `foundation.crust`. Downstream cannot
   directly read per-era material deltas such as accretion, rifting, thickening,
   erosion exposure, shield preservation, or passive-margin maturation.

4. **Projection is still inside Foundation.** The projection step is practical,
   but it publishes `map.foundation*` artifacts from Foundation and derives
   map-facing boundary/stress/shield fields. This is transitionally acceptable
   only if labeled as projection and validated as recomputable from truth.

5. **`plateTopology` is projection-adjacent but named as Foundation.** It is
   computed from `map.foundationPlates`, has no op boundary, and can look like
   mesh-native Foundation truth.

6. **Mesh-to-tile sampling can shape downstream artifacts.** Foundation tile
   projections use nearest-cell sampling. With coarse mesh settings this can
   contribute to blocky belt fields, even when mesh-space truth is internally
   coherent.

7. **Morphology is the real downstream adapter.** Hydrology, Ecology,
   Placement, resources, and biomes mostly consume Morphology/Hydrology/Ecology
   truth. Adding direct Foundation reads everywhere would spread coupling; the
   better move is stable Morphology-facing derived substrates.

8. **Mountains and hills lack a full landform family.** Current ridges and
   foothills are boundary/belt-driven. There is no dedicated rough-land,
   rolling upland, old orogen, plateau, craton relief, rift shoulder, basin rim,
   or escarpment operation.

9. **Validation can prove shape without proving geologic causality.** Current
   validators mostly cover tensor shapes, ranges, and artifact presence. The
   next gates need cross-artifact semantics, deterministic fingerprints,
   predeclared terrain ranges, and live readback proof when runtime claims are
   made.

## Docs Drift Audit

| Area | Older doc claim | Current source evidence | Packet disposition |
| --- | --- | --- | --- |
| Foundation step order | Foundation reference still describes an older six-step shape. | Live `foundation/index.ts` runs `mesh`, `mantle-potential`, `mantle-forcing`, `crust`, `plate-graph`, `plate-motion`, `tectonics`, `crust-evolution`, `projection`, and `plate-topology`. | Treat current code and topology tests as authority; align docs in a follow-on slice. |
| Era count | Older notes refer to fixed three-era history. | Current schemas/validators accept 5 to 8 eras for history/provenance surfaces. | Treat old era-count text as stale. |
| Cross-domain history consumption | Older Foundation/Morphology references understate history/provenance use. | Morphology `landmassPlates` reads `map.foundationTectonicHistoryTiles` and `map.foundationTectonicProvenanceTiles`. | Treat Morphology as the Foundation adapter. |
| Projection lane ownership | Normalization policy wants truth/projection separation. | Foundation still owns the projection step that publishes `map.foundation*`. | Classify as transitional projection, not mesh truth. |
| Plate topology | The name looks like Foundation truth. | `plate-topology` is derived from `map.foundationPlates` and lacks a domain op. | Mark projection-adjacent until ownership is clarified. |

## Mountain Sparsity And Blockiness Diagnosis

| Hypothesis | Assessment | Evidence shape | Required proof before action |
| --- | --- | --- | --- |
| Foundation layer collapse causes mountain failures. | Partly supported. More likely contributes to blockiness and missing old/material intent than total mountain absence. | Final-only crust evolution and nearest-cell projection sampling reduce historical/material nuance. | Causal dump from mesh truth to tile history/provenance, belt drivers, topography, mountain masks. |
| Morphology belt synthesis causes sparse/blocky mountains. | Strongly supported. | Belt drivers select sparse high-intensity seeds, gap fill, filter components, diffuse fields; `planRidges` gates mountains by boundary/driver strength and caps. | Compare history/provenance dynamic range against belt driver output and ridge score maps for suspect seeds. |
| Projection/runtime erases mountains. | Low confidence as primary cause. | `plotMountains` stamps planned masks directly; `buildElevation` runs afterward. | Only investigate as primary if planned masks are healthy but final terrain/readback counts drop. |
| Config thresholds and caps are too tight. | Medium-high confidence for quantity, but not sufficient. | Ridge/foothill thresholds, max fractions, spine caps, dilation, and hill gates limit terrain shares. | Predeclare expected ranges, then tune with causal stats. No threshold-only plan. |
| Missing landform operations create flatness. | Strongly supported. | Hills are mostly foothills or strong near-boundary deformation; no broad rough-land/upland/plateau family exists. | Add landform-family proposal with expected range gates and artifact masks before implementation. |

Conclusion: Foundation should be hardened to expose material history and better
projection provenance, but the terrain outcome should be fixed as a Foundation
plus Morphology contract problem. The strongest immediate product gap is a
Morphology landform-intent layer that consumes better Foundation history rather
than trying to turn ridge thresholds into all relief.

## Candidate Hardening Slices

These are OpenSpec-ready candidates, not implementation instructions.

| Slice | Scope | Why it exists | First proof gate |
| --- | --- | --- | --- |
| `foundation-doc-authority-alignment` | Update or explicitly demote stale Foundation/Morphology domain references. | Current docs contradict live step order, era count, and consumers. | Source scan proves docs match live contracts or are labeled transitional. |
| `foundation-material-history-contract` | Add a mesh truth artifact for material history or per-era crust mutation. | Downstream needs historical layers, not only final crust. | Static validator checks era agreement with history/provenance and final crust reconstruction. |
| `foundation-tectonics-lane-split` | Split or at least contractually separate current segments, era events/fields, rollups, provenance, and current tectonics. | Reduces step-level collapse without prematurely promoting stages. | Contract tests prove each lane publishes bounded artifacts and ops do not call ops. |
| `foundation-projection-provenance-confidence` | Expose tile sampling provenance/confidence and clarify projection-derived fields. | Nearest-cell sampling can affect belt shape; consumers need confidence. | Tile-to-cell cross-artifact checks and sampled-field drift diagnostics. |
| `foundation-plate-topology-op` | Extract `plate-topology` compute into a domain op and classify it as projection-derived or mesh-native. | Current artifact name and derivation are ambiguous. | Topology-lock and consumer-contract tests prove ownership. |
| `morphology-landform-intents` | Add landform family layer: ridges, foothills, old uplands, plateaus, craton relief, rift shoulders, escarpments, basin rims. | Current mountains/hills cannot represent broad relief. | Terrain share, adjacency, and causal score ranges over accepted seeds. |
| `terrain-causal-dump-and-readback-gates` | Add debug dump from Foundation history/provenance to belt drivers, topography, mountain masks, projected terrain, and live readback. | Prevents overclaim and makes failures localizable. | Deterministic double-run fingerprints plus live direct-control proof for named seeds when runtime claims are made. |
| `polar-crust-cryosphere-contract` | Separate polar bedrock, crust/material, and ice/cryosphere layers. | Polar crust and ice should not be represented as a single terrain decision. | Cryosphere consumes bedrock/ice layers explicitly and polar terrain readback is audited. |
| `resource-geologic-province-bridge` | Connect Ecology resource basins and Placement resource planning to Foundation-backed geologic provinces. | Resource systems need craton, arc, rift, sedimentary basin, shelf, and evaporite intent. | Resource plan reasons cite basin/province evidence, not only biome/fertility heuristics. |

## Validation And Readback Surface

Required validation posture for follow-on work:

| Gate | Evidence required | Scope |
| --- | --- | --- |
| Shape gate | Tensor length, finite values, IDs, enum values, and schema compatibility. | Every truth/projection artifact. |
| Cross-artifact gate | Era count agreement among history, provenance, material history, crust evolution, and projection tiles; segment endpoints match mesh neighbors; plate IDs are legal in graph, motion, segments, and projections. | Foundation and Foundation-to-Morphology handoff. |
| Determinism gate | Double-run fingerprints across the accepted seed/dimension/config matrix. | Static pipeline outputs. |
| Product range gate | Mountain, hill/rough-land, flat, water, lake, biome, feature, and resource shares have predeclared expected ranges. | User-visible map quality. |
| Causal dump gate | Suspect seeds dump Foundation history/provenance, belt drivers, topography before/after relaxation, landform scores, masks, projected terrain, and omitted sample accounting. | Diagnosis before tuning. |
| Runtime proof gate | `@civ7/direct-control` bounded reads, including `getCiv7MapSummary` and map/grid snapshots, compared to emitted truth. | Any claim that depends on Civ7 engine materialization. |

## Open Questions

- Should Foundation publish per-era crust snapshots, per-era material deltas,
  or a compact "material history" tensor that reconstructs final crust?
- Should `plateActivity` become a truth-history control, stay projection-only,
  or split into explicit truth and visualization controls?
- Should `plateTopology` be mesh-native truth or remain a tile projection
  summary with a clearer name?
- What is the product-level rough-land envelope for Civ7 terrain: more
  `TERRAIN_HILL`, a separate non-authorable diagnostic layer, or both?
- How much polar behavior is product-relevant now: biome-only cryosphere,
  sea-level/fjord shaping, or full bedrock/ice/isostasy semantics?

## Source Register

Code and repo evidence:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crustEvolution.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust/index.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts`
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/compute-belt-drivers/deriveFromHistory.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-ridges/strategies/default.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/plan-foothills/strategies/default.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/mountains.ts`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- `docs/projects/pipeline-realism/resources/runbooks/HANDOFF-MORPHOLOGY-TERRAIN-AUTHORSHIP.md`
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`

External physical-domain sources:

- [USGS: Understanding plate motions](https://pubs.usgs.gov/gip/dynamic/understanding.html)
- [USGS: What is a tectonic plate?](https://pubs.usgs.gov/gip/dynamic/tectonic.html)
- [NPS: Types of plate boundaries](https://www.nps.gov/subjects/geology/plate-tectonics-types-of-plate-boundaries.htm)
- [NOAA Science On a Sphere: Age of the seafloor](https://sos.noaa.gov/catalog/datasets/age-of-the-seafloor-contour-lines/)
- [USGS: Global crustal structure](https://www.usgs.gov/publications/crust-and-lithospheric-structure-global-crustal-structure)
- [USGS: Cratonic lithosphere thickness, plate motions, and basal drag](https://www.usgs.gov/publications/relations-between-cratonic-lithosphere-thickness-plate-motions-and-basal-drag)
- [USGS: Himalaya and vicinity seismicity](https://pubs.usgs.gov/of/2010/1083/j/)
- [USGS: Alleghany orogeny](https://www.usgs.gov/publications/a-geologic-history-north-central-appalachians-part-3-alleghany-orogeny)
- [USGS: Great Smoky Mountains geology](https://www.usgs.gov/geology-and-ecology-of-national-parks/geology-great-smoky-mountains-national-park)
- [NSIDC: Ice sheets](https://nsidc.org/learn/parts-cryosphere/ice-sheets)
- [NOAA NGS: Isostatic adjustment](https://geodesy.noaa.gov/INFO/facts/ice-age.shtml)
- [NSIDC: Isostatic rebound](https://nsidc.org/learn/cryosphere-glossary/isostatic-rebound)

## Completion Standard For This Packet

This packet is complete when it has been reviewed as a planning artifact, not
when implementation starts. The next workstream should turn selected slices
into OpenSpec changes, predeclare proof gates, and then implement one logical
layer at a time through Graphite.
