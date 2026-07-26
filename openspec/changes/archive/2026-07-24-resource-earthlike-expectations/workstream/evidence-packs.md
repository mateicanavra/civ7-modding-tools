# Evidence Packs

## Aquatic, Coastal, And Navigable-River Resources

Source agent: Kant.

### Group Model

Aquatic resources are nearshore productivity signals rather than generic water
fill. Official Civ7 eligibility starts from marine/coast and adjacent-land
constraints, while `RESOURCE_CRABS` also carries a navigable-river floodplain
lane. Earthlike weighting should narrow by habitat:

- fish and crabs: shelves, estuaries, upwelling, seagrass, reefs, river mouths;
- pearls, cowrie, turtles: warm shallow reef, lagoon, seagrass, island and
  protected coast systems;
- whales: productive cold or temperate shelves, upwelling, banks, and migration
  corridors.

Lotus remains excluded because local official data defines `FEATURE_LOTUS`, not
a `Resources` row.

### Ranges

| Resource | Predicate Summary | Standard Earthlike Range | Multipliers | Scarcity |
|---|---|---:|---|---|
| `RESOURCE_FISH` | broad coastal shelf, estuary, upwelling fishery | 6-12 | scale by eligible coast/shelf; up for upwelling/estuary; down for ice, deep ocean, lakes | common |
| `RESOURCE_PEARLS` | warm shallow protected coast, reef, lagoon, shelf | 2-5 | up for tropical/subtropical reefs and lagoons; down for temperate/cold; zero if no warm coast | scarce |
| `RESOURCE_WHALES` | productive cold/temperate shelf, upwelling, banks | 1-3; Antiquity 0 | up for cold/temperate shelf, upwelling, large oceans; down for tropical abundance; zero lakes | rare/signature |
| `RESOURCE_CRABS` | estuary, delta, brackish bay, shallow coast, navigable river mouth/floodplain | 4-10 | up for estuaries, navigable rivers, seagrass, warm shallows; down for cold/deep/open coast | common-local |
| `RESOURCE_COWRIE` | warm tropical reef, rock, coral coast, protected shallows | 1-4 | up for tropical reef/island chains; down for temperate; zero lakes/cold | scarce/local |
| `RESOURCE_TURTLES` | warm tropical/subtropical coast with nesting beach, seagrass, reef habitat | 1-3; Modern 0 | up for tropical/subtropical shallows, seagrass, reefs, islands; down for cold/open/deep; zero lakes | rare/signature |

### Inference Rules

- Official Civ7 constraints are hard eligibility. External ecology narrows
  priority; it does not widen legality.
- Counts scale by eligible habitat, not raw map area.
- Use soft count gates until seed-matrix telemetry proves variance.
- Age gates are hard: whales are zero in Antiquity, turtles are zero in Modern.
- Map size scaling starts from approximate area multipliers: Tiny `0.5x`,
  Small `0.75x`, Large `1.25x`, Huge `1.55x`, then adjusts for eligible coast
  and ocean share.
- Archipelago or shattered-sea maps bias aquatic expectations upward; low-coast
  or pangaea maps bias them downward.

### Open Proof Needs

- Runtime numeric ids remain unproven; do not join symbolic resource names to
  adapter numeric outcomes until runtime telemetry verifies `GameInfo.Resources`.
- Fish, pearls, and crabs need implementation-time lake policy review because
  official data does not mark them `LakeEligible=false`, while this expectation
  model is marine/coastal.
- Do not hard-code these ranges as strict gates until seed-matrix stats include
  eligible-tile denominators.

## Geological, Mineral, Gemstone, And Industrial Resources

Source agent: Godel.

### Group Model

Geological resources should be geology-first within Civ7 official constraints.
Official `Resource_ValidBiomes` rows are hard eligibility unless a later
OpenSpec explicitly authorizes a synthetic predicate. Earthlike scoring then
ranks eligible plots by geologic province:

- metallic ores and gemstones: orogenic, hydrothermal, epithermal, metamorphic,
  granite, ultramafic, and placer proxies;
- carbonate and metamorphic materials: limestone, marble, rubies, and lapis
  through carbonate/metamorphic belts;
- evaporites and nitrates: arid closed basins, playas, and evaporite flats;
- coal, oil, clay, kaolin, and pitch: sedimentary basins, wetlands, weathered
  flats, and hydrocarbon basin edges.

Pure Civ7-biome placement remains a structural fallback candidate for later
implementation only if the map lacks the needed proxies; it is not sufficient
to satisfy the earthlike expectation object by itself.

### Ranges

| Resource | Predicate Summary | Standard Earthlike Range | Multipliers | Scarcity |
|---|---|---:|---|---|
| `RESOURCE_GOLD` | hydrothermal, orogenic, epithermal lodes; placer only with alluvial proxy | 16-20 if active | hills/orogen `1.5-2x`; alluvial `1.2x`; outside official hills `0x` | common/anchored |
| `RESOURCE_GOLD_DISTANT_LANDS` | not independently map-placeable without distant-lands treasure authorization | 0 official; blocked | no active multiplier while corpus-blocked | blocked |
| `RESOURCE_SILVER` | hydrothermal, SEDEX/lithogene, epithermal exposed cold/arid hills | 16-20 if active | tundra/desert hills `1.4x`; orogen `1.5x`; flat `0x` | common/anchored |
| `RESOURCE_SILVER_DISTANT_LANDS` | not independently map-placeable without distant-lands treasure authorization | 0 official; blocked | no active multiplier while corpus-blocked | blocked |
| `RESOURCE_GYPSUM` | evaporite basin, playa, arid or semiarid sedimentary basin | 4-8 | evaporite/sedimentary basin `1.5-2x`; desert `1.4x`; wet `0.5x` | moderate |
| `RESOURCE_JADE` | metamorphic, subduction, serpentinite jade, often drainage-adjacent | 2-5 | ultramafic/orogen `2x`; tropical/tundra drainage `1.2x`; no geology `0.4x` | rare |
| `RESOURCE_KAOLIN` | intense weathering, hydrothermal alteration, wet clay-rich flats | 6-10 | wetlands `2x`; tropical weathering `1.5x`; arid non-oasis `0.5x` | common |
| `RESOURCE_MARBLE` | metamorphosed limestone/carbonate belts near orogeny/contact metamorphism | 4-8 | carbonate plus orogen `2x`; hills `1.3x`; no carbonate `0.4x` | moderate |
| `RESOURCE_IRON` | BIF, skarn, magmatic, or hydrothermal iron in hills, cratons, mountain belts | 8-14 | hills `1.5x`; craton/orogen `1.5x`; flat `0x` | common strategic |
| `RESOURCE_SALT` | halite/evaporite flats, arid closed basins, salt pans | 5-9 | desert/evaporite basin `2x`; coastal land-flat salt pan `1.1x`; humid `0.5x` | moderate |
| `RESOURCE_LAPIS_LAZULI` | rare metamorphic calcite/dolomite/silicate veins in mountains | 0 official; blocked | no active multiplier while corpus-blocked | blocked/very rare |
| `RESOURCE_NITER` | nitrate salts in arid soils/playas; cave or soil nitrate abstracted to flats | 6-10 | desert/closed basin `1.5-2x`; floodplain `1.3x`; humid `0.7x` | moderate |
| `RESOURCE_COAL` | ancient peat-swamp sedimentary basins; buried forest/wetland basins | 6-10 | sedimentary basin `2x`; forest/wetland `1.5x`; desert only with basin `1x` | common modern |
| `RESOURCE_NICKEL` | mafic/ultramafic sulfides or tropical laterite | 0 official; blocked | no active multiplier while corpus-blocked | blocked/rare |
| `RESOURCE_OIL` | petroleum system in sedimentary basin: source, reservoir, seal, trap | 5-9 | sedimentary basin `2.5x`; desert/tundra/wetland basin `1.3x`; offshore `0x` unless authorized | moderate modern |
| `RESOURCE_CLAY` | near-surface clay minerals in soils, sediments, water-contact/weathering zones | 6-10 | wet/alluvial `2x`; tropical weathering `1.5x`; no feature `0x` | common |
| `RESOURCE_LIMESTONE` | marine carbonate sedimentary deposits, karst/carbonate platforms | 6-12 | carbonate basin `2x`; hills/exposure `1.2x`; igneous terrain `0.4x` | common industrial |
| `RESOURCE_TIN` | cassiterite greisen/granite lodes plus river/valley placers | 8-14 | granite/orogen `1.7x`; tropical/alluvial `1.4x`; no granite/placer `0.6x` | moderate gameplay-common |
| `RESOURCE_PITCH` | bitumen/asphaltum seeps, shallow tar sands, hydrocarbon basin edge | 3-6 | hydrocarbon basin `2x`; near oil `1.5x`; no basin `0.4x` | scarce |
| `RESOURCE_RUBIES` | corundum in marble/metamorphic belts; basalt-hosted or placer only with source proxy | 3-6 | marble/metamorphic `2x`; tropical collision belt `1.5x`; flat tropical needs source | rare luxury |

### Inference Rules

- Official `Resource_ValidBiomes` rows are hard eligibility. Earthlike geology
  ranks within those rows unless a later OpenSpec creates a synthetic placement
  rule.
- No-biome rows do not place by default.
- Distant-lands, lapis lazuli, and nickel ranges above are active blocked
  states only. Any future nonzero ranges require a later source-backed
  disposition change and must be recorded outside the current active range.
- Official `MinimumPerHemisphere` anchors gold and silver. Other ranges derive
  from official weight, class, valid-row breadth, and geologic rarity.
- Era gates are hard unless a later slice defines a persistence rule.

### Open Proof Needs

- If official XML adds valid biomes for lapis lazuli, nickel, or distant-lands
  variants, revise blocked status.
- If runtime proves `MinimumPerHemisphere` semantics differ from the field name,
  revise gold and silver ranges.
- If MapGen lacks proxies for sedimentary basin, carbonate belt, evaporite
  basin, ultramafic belt, or orogeny, implementation must define proxies or
  fall back to official biome/terrain with an explicit proof gap.

## Cultivated, Plantation, And Medicinal Resources

Source agent: Hooke.

### Group Model

Cultivated expectations use official Civ7 constraints as hard legality and
external crop ecology only to rank and target eligible tiles. This group is not
one ecology: it includes irrigated/alluvial crops, humid tropical plantation
crops, temperate cultivated crops, arid resin/incense, medicinal bark, and one
official marine dye lane. `RESOURCE_CLOVES` remains blocked because local
official data has no `Resource_ValidBiomes` rows.

Baseline ranges are standard-map, eligible-age guidance. Non-eligible ages are
zero. Ranges are inference-backed unless an official `MinimumPerHemisphere=8`
floor anchors them.

### Ranges

| Resource | Predicate Summary | Standard Earthlike Range | Multipliers | Scarcity |
|---|---|---:|---|---|
| `RESOURCE_COTTON` | warm frost-free alluvial or irrigated cotton belt | 6/8/12 | floodplain/river up; warm grass/plains up; cold down; desert only with water | common |
| `RESOURCE_DATES` | hot arid oasis or groundwater-fed desert palm | 2/3/5 | oasis/desert water up; humid/cold zero | scarce-local |
| `RESOURCE_DYES` | coastal biological dye source under official marine/coast rules | 2/3/5 | warm coast/islands up; inland zero | scarce/coastal |
| `RESOURCE_INCENSE` | arid dry woodland or desert-edge incense resin habitat | 2/3/5 | savanna/desert dry woodland up; humid/cold down | scarce |
| `RESOURCE_SILK` | warm temperate/subtropical sericulture or mulberry alluvial zone | 4/6/8 | river/floodplain up; humid grass/plains up; arid/cold down | moderate |
| `RESOURCE_WINE` | sunny temperate to subtropical dry-season viticulture | 4/6/8 | grass/plains up; dry-summer up; humid tropics down; frost down | moderate |
| `RESOURCE_COCOA` | humid tropical shaded forest plantation | 8/10/12 if active | rainforest/wet tropics up; arid/cold zero | regional abundant |
| `RESOURCE_SPICES` | humid forest spice belt, tropical/subtropical | 8/10/12 if active | rainforest/forest up; wet tropics up; dry plains down | regional abundant |
| `RESOURCE_SUGAR` | warm wet alluvial tropics/subtropics | 8/10/12 if active | floodplain/river/wet tropics up; arid without irrigation zero; cold zero | regional abundant |
| `RESOURCE_TEA` | humid acidic upland or cool subtropical tea zone | 8/10/12 if active | hills up; wet/cool up; arid/desert zero | regional abundant |
| `RESOURCE_COFFEE` | humid tropical/subtropical highland or shaded tropical coffee belt | 16/18/20 if active | tropical/hills/forest up; arid/cold zero | common anchored |
| `RESOURCE_TOBACCO` | frost-free warm drained soils with drier ripening window | 16/18/20 if active | grass/plains up; savanna/forest up; waterlogging/excess rain down | common anchored |
| `RESOURCE_CITRUS` | subtropical/tropical sunny orchard, frost-limited, well-drained | 16/18/20 if active | warm grass/plains up; alluvial up; frost zero; severe arid down unless irrigated | common anchored |
| `RESOURCE_QUININE` | humid tropical montane medicinal bark, constrained to official forest/savanna lanes | 16/18/20 if active | wet forest/highland proxy up; arid/desert zero | common anchored, ecology-constrained |
| `RESOURCE_MANGOS` | tropical/subtropical frost-free fruit belt, often monsoonal | 3/5/7 | tropical up; rainforest up; cold zero; excessive wet at flowering slightly down | moderate tropical |
| `RESOURCE_RICE` | wetland, paddy, delta, marsh, monsoon lowland | 4/6/8 | marsh/mangrove/river/floodplain up; arid without water zero | moderate-common |
| `RESOURCE_CLOVES` | external predicate would be humid tropical island/rainforest spice tree | 0 official; blocked | no active multiplier while corpus-blocked | blocked/rare |
| `RESOURCE_FLAX` | cool-temperate to mild subtropical flax on well-drained loam | 5/7/9 | grass/plains up; cool/mild up; tropical wet/heat down | moderate |

### Inference Rules

- Official `Resource_ValidBiomes`, ages, class, weight, and flags are hard
  constraints.
- External crop ecology narrows priority within official legality; it does not
  create new legal tiles.
- `MinimumPerHemisphere=8` starts floor-backed resources at eight plus official
  map-size modifiers; non-hemisphere-unique resources can use roughly
  two-hemisphere standard totals until runtime proves otherwise.
- Non-floor ranges use weight, class, eligible-tile breadth, and ecological
  rarity: broad common `6-12`, moderate `4-8`, scarce `2-5`, blocked `0`.
- If eligible tile supply cannot support a floor without illegal placement,
  record a proof gap instead of force-placing.
- Cloves remains an active blocked row. Any future nonzero range requires a
  later source-backed disposition change and must be recorded outside the
  current active range.

### Open Proof Needs

- If local official XML adds valid biomes for `RESOURCE_CLOVES`, revise blocked
  status.
- Runtime proof is needed for exact `MinimumPerHemisphere` semantics.
- Seed-matrix stats need eligible-tile denominators before these become hard
  gates.
- `RESOURCE_DYES` must stay marine/coastal unless official data changes.
- `RESOURCE_QUININE`, `RESOURCE_TEA`, and `RESOURCE_COFFEE` need concrete
  highland/relief proxies or must degrade to official biome/terrain only.
- `FEATURE_LOTUS` remains excluded.

## Terrestrial Animal, Forest, And Wild Biological Resources

Source agent: Noether.

### Group Model

Terrestrial biological expectations use a legality-first habitat and land-use
model. Official age, class, and `Resource_ValidBiomes` rows are hard
constraints; earthlike ecology ranks legal candidates and sets provisional
ranges. The group has four habitat families:

- open rangeland livestock and herbivores;
- forest and woodland wildlife;
- tropical forest products;
- regional highland pastoral resources.

All resources in this group are placeable and required in the current corpus.
Count bands are provisional active-age guidance and must stay soft until
seed-matrix telemetry calibrates candidate and placement counts.

### Ranges

| Resource | Predicate Summary | Standard Earthlike Range | Multipliers | Scarcity |
|---|---|---:|---|---|
| `RESOURCE_CAMELS` | legal arid plains/desert rangeland, sparse vegetation, dryland corridors | 2-5 | arid/desert/plains `1.5-2x`; humid/forest/cold `0.3x` | uncommon regional |
| `RESOURCE_HIDES` | broad grazing/wild-herbivore byproduct on open rangeland and cold-edge habitat | 8-14 | grass/plains/tundra `1.2-1.5x`; dense tropical/closed forest `0.7x` | common |
| `RESOURCE_HORSES` | open temperate grassland/plains, steppe-like pasture, low tree cover | 4-8 | grass/plains `1.3x`; high forest/desert/tundra `0.5x` | standard strategic |
| `RESOURCE_WOOL` | hill/highland pastoral terrain with sheep/goat-compatible grazing | 4-8 | hills/highlands/arid/tundra `1.4x`; flat wet lowlands `0.6x` | standard |
| `RESOURCE_IVORY` | savanna, wooded savanna, tropical forest edge, watering-hole/desert-edge megafauna habitat | 2-5 | savanna/tropical/watering-hole `1.4x`; cold/highland `0.4x` | rare regional |
| `RESOURCE_FURS` | cold/boreal forest, taiga, woodland edge, small patchy pockets | 2-5 | taiga/tundra `1.5x`; savanna woodland `1.2x`; open tropical/grass `0.5x` | rare/patchy |
| `RESOURCE_TRUFFLES` | moist woodland-edge/host-tree proxy on legal grass/plains/tundra wet soils | 2-5 | moist wooded edge/grass hills `1.4x`; arid/cold `0.6x` | uncommon patchy |
| `RESOURCE_RUBBER` | humid tropical forest/rainforest, lowland high-rainfall forest product | 2-4 | tropical rainforest/forest `1.5x`; arid/cold/no tropics `0.3x` | rare modern |
| `RESOURCE_HARDWOOD` | legal productive forest: tropical/mangrove hardwood or official tundra/taiga-bog forest analog | 4-8 | tropical forest/mangrove and tundra forest analog `1.4x`; open plains/grass `0.6x` | standard forest |
| `RESOURCE_WILD_GAME` | diverse natural habitat, forest/grassland/tundra/marsh edge, low cultivation pressure | 6-10 | high habitat diversity `1.4-1.6x`; monoclimatic/cultivated `0.6x` | common-natural |
| `RESOURCE_LLAMAS` | legal tropical hill/highland pastoral candidates, preferring hill/highland over rainforest lowland | 1-4 | tropical hills/highlands `1.4x`; lowland tropical `0.5x`; no tropical legal tiles zero | rare regional |

### Inference Rules

- Start from `standardLandFactor = actualLandTiles / ~1678`, then multiply by
  legal habitat availability and condition multipliers.
- Outside official valid ages, expected count is zero.
- Never place outside official `Resource_ValidBiomes` unless later
  official/runtime proof changes legality.
- Commodity resources such as hides, furs, and wild game infer from habitat
  family and land-use opportunity, not a single species.
- Rarity combines official weight, habitat breadth, age availability, and
  real-world geographic specialization.

### Open Proof Needs

- Runtime `ResourceBuilder.canHaveResource` legality should be audited against
  static XML rows before hard gates.
- Runtime name-to-index dump is required before numeric strategy constants can
  be symbolic.
- `RESOURCE_LLAMAS` needs a tropical hill/highland candidate histogram because
  real-world Andean habitat and official tropical-only legality are misaligned.
- `RESOURCE_HARDWOOD` must not broaden to temperate forests without official or
  runtime proof.
- `RESOURCE_TRUFFLES` needs a woodland/host proxy before its range becomes a
  hard assertion.
