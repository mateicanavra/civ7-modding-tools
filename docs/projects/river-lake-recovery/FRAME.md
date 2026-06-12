# River/Lake Recovery Frame

Status: active session frame
Date: 2026-06-10
Owner: Codex river/lake recovery workstream

## Purpose

This frame keeps the river/lake recovery workstream pointed at the product
outcome instead of another narrow proof slice. The target is not "some river
terrain rows exist." The target is physically grounded Hydrology truth, coherent
Civ materialization, clear Studio explanation, and same-run rendered in-game
proof that users can see the rivers that the pipeline authored.

## Authority Order

Use these sources in order:

1. Current user decisions in this session.
2. Root and subtree `AGENTS.md`.
3. `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
4. `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`.
5. `docs/system/libs/mapgen/reference/domains/HYDROLOGY.md`.
6. Active OpenSpec changes under `openspec/changes/`.
7. Source, tests, runtime probes, official Civ resources, and external Earth
   hydrology sources as evidence only.

Current code and historical docs are not target architecture by themselves.
Generated output is proof of generation, not policy.

## Selection And Salience

In scope:

- drainage routing, discharge, river class, lakes, floodplains, and the
  terrain/substrate data needed to make them physically coherent;
- Civ-native river/lake/floodplain materialization and readback;
- Studio hydrology naming, grouping, config, layers, proof labels, and user
  diagnostics;
- external Earth benchmark contracts used before local tuning;
- same-run runtime/product proof and closure criteria.

Foreground:

- why rivers do not currently show up for users;
- whether the native Civ river writer can be constrained to authored Hydrology
  truth;
- stale config/docs/layers that still teach legacy selectors or wrong owners;
- proof inflation, especially terrain-row readback being treated as rendered
  river success.

Exterior:

- resource, wonder, start, or broader ecology recovery unless a verified
  dependency on river/lake/floodplain truth is found;
- preserving old public selectors because they exist;
- projection-only corridors that compensate for upstream hydrology defects.

## Hard Core

- Morphology owns earth matter: topography, land/water form, depressions,
  basin precursors, and geomorphic proxies.
- Hydrology owns water truth: drainage routing, basin ids, terminal typing,
  runoff/discharge, river classes, lake intent, floodplain-relevant hydrology,
  and physical diagnostics.
- `@civ7/map-policy` and generated `@civ7/types` own pure Civ facts and
  compliance tables only.
- `map-*` stages own projection, materialization, effects, and readback. They
  do not define upstream truth.
- Studio owns explanation, inspection, and proof presentation. It does not
  define truth.
- Product closure requires same-run evidence that crosses the full ladder:
  truth -> projection -> materialization -> readback -> Studio display ->
  rendered Civ visibility -> reviewer disposition.

## Falsifier

This frame is wrong if a later slice still needs projection/readback surfaces to
define Hydrology truth, if a product-complete claim can pass without rendered
same-run Civ river visibility, or if user-facing config still exposes stale
length thresholds/raw internals as the river model.

## Structural Alternative Rejected

A plausible alternative is to delegate rivers back to Civ's official
`TerrainBuilder.modelRivers(...)` generator and treat Hydrology as advisory.
That is rejected as the product frame because it gives the engine hidden
authority over authored truth. The remaining native-Civ question is narrower:
can a bounded materialization path use the official writer while preserving and
proving parity to Hydrology-authored truth?

## Physical Grounding

Earth does not have a single universal river-density constant. Drainage density,
permanence, lake area, and closed-basin share vary by climate, relief,
lithology, and feature-size threshold. Benchmarks must therefore be families,
not one scalar.

Benchmark contract before tuning:

- declare tile-to-kilometer and minimum visible-feature assumptions for every
  acceptance row;
- separate hidden drainage network, minor/headwater channels, major routed
  trunks, and Civ-visible navigable trunks;
- keep headwaters/minor channels as the majority of truth-network length on wet
  earthlike maps;
- treat non-perennial channels as common, not an edge case;
- allow endorheic/closed drainage as normal in arid/interior worlds, with typed
  terminal outcomes;
- constrain lakes to low-single-digit land-area shares unless a specific map
  archetype is intentionally lake-rich;
- record a stylization ledger whenever Civ tile scale forces visible rivers to
  exaggerate, merge, or omit real-world channel classes.

External benchmark anchors:

- HydroRIVERS includes 8.5 million reaches, averaging 4.2 km each, for about
  35.9 million km of rivers globally, using a catchment/discharge inclusion
  floor.
- GRWL/Allen and Pavelsky estimate global river and stream surface area at
  773,000 +/- 79,000 square km, about 0.58 +/- 0.06 percent of nonglaciated
  land.
- Global non-perennial river work estimates that flow stops at least one day
  per year along roughly 51-60 percent of the world's river length; newer
  headwater-inclusive work pushes the non-perennial share higher when small
  channels are counted.
- Hydrography90m emphasizes that headwaters account for more than 70 percent of
  stream length and uses a 0.05 square km initiation floor to capture them.
- HydroLAKES reports about 1.4 million lakes/reservoirs covering 2.67 million
  square km, about 1.8 percent of global land area in the associated study.
- Global endorheic references place internally drained basins around one-fifth
  of land area, concentrated in arid and interior settings.

Sources:

- https://www.hydrosheds.org/products/hydrorivers
- https://pubmed.ncbi.nlm.nih.gov/29954985/
- https://www.hydrosheds.org/applications/intermittent-rivers
- https://essd.copernicus.org/articles/14/4525/2022/essd-14-4525-2022.html
- https://www.hydrosheds.org/products/hydrolakes
- https://www.nature.com/articles/ncomms13603
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6267997/

## Ownership Boundary

| Concern | Owner | Forbidden owners |
| --- | --- | --- |
| Landform, elevation, depressions, basin precursors | Morphology | Hydrology projection, map-rivers, policy package |
| Drainage routing, terminal typing, discharge, river class, lake truth | Hydrology | Morphology recipe glue, map-rivers, Studio |
| Pure Civ facts and runtime semantic tables | `@civ7/map-policy`, generated `@civ7/types` | Hydrology algorithms, projection selectors |
| Civ-visible river subset selection | `map-rivers` projection consuming Hydrology truth and Hydrology-owned selection ops | Morphology, policy package, invented policy folders |
| Lake/water projection and river terrain/materialization | `map-hydrology`, `map-rivers`, adapter/direct-control proof tooling | Hydrology truth |
| Studio hydrology visualization and status ladder | Studio / DX layer | Hydrology truth, projection logic |
| Product acceptance | OpenSpec/product proof records plus reviewer disposition | unit tests or code slices self-closing |

## System Dynamics

Dominant reinforcing loop:

- stale names/configs/layers imply wrong ownership;
- implementers preserve the old surface;
- proof rows validate the narrow behavior;
- the product still has no visible rivers;
- later agents trust the stale proof and repeat the mistake.

Balancing loop to install:

- explicit owner map and proof ladder;
- external benchmark contract before tuning;
- same-run readback and rendered evidence;
- Studio surfaces the exact failure class;
- closure is blocked until the product row, not just the code row, passes.

## Investigation Policy

For each slice, use this evidence hierarchy:

1. official Civ resources and installed app/runtime probes for Civ facts;
2. external Earth hydrology literature for physical benchmark ranges;
3. Hydrology artifacts and seed metrics for local truth behavior;
4. adapter/direct-control readback for materialization;
5. Studio/browser screenshots for user-facing explanation;
6. rendered in-game screenshots with branch/commit/run/config identity for
   product visibility.

Stop or reframe if any investigation finds:

- native Civ behavior contradicts the assumed materialization path;
- a user-facing knob is just a raw internal threshold;
- a map-rivers patch is compensating for a Hydrology truth defect;
- Studio can show a layer while Civ has no same-run visible product evidence.

## Team Model

Use fresh agents for fresh tasks. Do not recycle old agents unless they are
compacted first and explicitly reused.

Default adversarial lanes:

1. Earth hydrology prosecutor: attacks benchmark definitions and physical
   plausibility.
2. Pipeline boundary prosecutor: attacks owner placement and import/config
   drift.
3. Civ runtime prosecutor: attacks writer/readback/materialization assumptions.
4. Studio UX prosecutor: attacks naming, layer grouping, statuses, and
   user-facing proof clarity.
5. Implementation archaeologist: attacks semantic-history claims and stale
   docs/config.
6. Verification closure prosecutor: attacks proof labels, same-run identity,
   and product-complete claims.

Each agent must keep written notes with goal, inquiry design, findings, risks,
and blocking questions. The owner remains responsible for synthesis.

## Domino Chain

1. Ground Earth benchmarks and tile-scale assumptions.
2. Repair Hydrology truth and metrics if the benchmark/root-cause evidence
   requires it.
3. Decide and prove the native Civ writer/materialization boundary.
4. Make map-rivers projection coherent from Hydrology truth only.
5. Clean config/knobs/names so public surfaces match owners.
6. Build Studio river/lake/floodplain proof ladder.
7. Add live same-run rendered proof.
8. Close lake/floodplain exact proof rows.
9. Run earthlike/holdout product acceptance and disposition every row.
10. Promote durable lessons; remove this session notice from `AGENTS.md`.

## Closure Matrix

The workstream cannot complete until all rows are pass or explicitly
dispositioned:

| Row | Required evidence |
| --- | --- |
| Hydrology truth | acyclic routing, typed terminals, discharge monotonicity, benchmarked river/lake metrics |
| Major/navigable projection | selected chains are coherent subsets of Hydrology major truth and meet declared earthlike visibility bands |
| Minor rivers | minor/headwater truth exists, is visible or intentionally non-materialized with a proven Civ limitation |
| Lake materialization | exact accepted/rejected/final drift counters |
| Floodplains | active nonzero local/exact/live proof tied to Hydrology/final-surface inputs |
| Civ metadata | native writer/readback proof or explicit unsupported disposition |
| Studio display | same-run inspector explains planned/projected/live/mismatch states |
| Civ rendered visibility | camera-targeted screenshot packet tied to exact branch/commit/run/config |
| Product acceptance | reviewer-dispositioned earthlike, holdout, contrast, and no-signal rows |

Skills used: framing-design, inquiry-design, investigation-design,
domain-design, system-design, team-design, civ7-systematic-workstream,
civ7-open-spec-workstream, civ7-architecture-authority,
civ7-product-authority.
