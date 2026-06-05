# Project: Resource Distribution Policy
**Status:** Active
**Timeline:** 2026-06-05 -> open
**Teams:** MapGen / Swooper Maps

## Frame

Resource bunching is a product failure when it is accidental, opaque, or caused
by fallback mechanics. Physical clustering is valid and often desirable:
resources should concentrate around geology, climate, ecology, rivers, coasts,
and landform history when those systems make it plausible. The product failure
is unintelligible clustering: polar bands, a few land sectors, row-major fallback
corridors, illegal-resource rescue, or hidden coupled inputs that authors cannot
reason about. The controlling outcome is an earthlike, gameplay-useful
distribution: resources should remain tied to physical habitats and official Civ
legality while staying spatially legible, locally varied, and available across
landmasses, coasts, starts, and climate zones.

## Evidence So Far

- Existing world-balance diagnostics count resource totals and type variety, but
  they do not measure nearest-neighbor spacing, local hot spots, latitude-band
  concentration, habitat share, landmass/sector entropy, or placement drift
  between authored plans and final materialized resources.
- `placement/plan-resources` currently uses one generic land desirability score
  from fertility, moisture, aridity, temperature, and rivers. It does not consume
  the resource-domain aquatic, cultivated, terrestrial, geological expectation
  lanes.
- `place-resources/materialize` can recover from illegal preferred resource types
  by assigning any least-used legal candidate. That preserves count/type spread,
  but can erase habitat intent and spacing.
- A Civ-like probe using official `Resource_ValidBiomes` rows against generated
  terrain/biome/feature surfaces showed high reassignment and adjacent
  placements, which points at legality recovery as one bunching source.
- Rainforest and grassland reports must separate density from feature coverage:
  sampled vegetation density was healthy in tropical rainforest/temperate humid
  biomes, while visible vegetation feature coverage was low in temperate forest
  areas.

## Success Criteria

- Resource diagnostics expose planned, assigned, and final spatial quality:
  nearest-neighbor spacing, local-density hot spots, sector concentration,
  latitude-band overrepresentation, reassignment rate, and preferred-legality
  rate. Diagnostics should distinguish physical habitat clustering from fallback
  or ordering artifacts.
- Physical clustering strength is represented by an explicit author input or
  coupled internally behind one coherent knob, not scattered magic constants.
- Materialization never silently violates spacing while rescuing illegal resource
  intents.
- Final resource placement is eventually owned by resource-domain habitat lanes
  generated from official Civ resource policy plus our physical fields, not a
  generic placement score.
- Regression tests catch bunching even when total placed count and type variety
  still look acceptable.

## Implementation Strategy

1. Add metrics before broader tuning: prove where bunching enters the pipeline.
2. Preserve authored spacing during resource assignment fallback immediately.
3. Add a Civ-policy-like test harness using official valid biome rows or an
   equivalent strict mock to catch legality-driven clustering.
4. Promote resource-domain lane planners into the standard recipe so aquatic,
   cultivated, terrestrial, and geological resources produce per-resource intent
   candidates.
5. Replace generic resource placement with lane-aware blue-noise selection that
   balances local habitat quality, scarcity, landmass/sector spread, start
   support, and spacing.

## Out Of Scope

- Delegating resource generation back to Civ's aggregate generator.
- Treating raw resource count, type variety, or lower density as sufficient.
- Hard-coding visual output patches that bypass habitat and legality policy.
