# Resource Earthlike Expectations Design

## Frame

This slice is an expectation contract, not a placement implementation. It turns
the official 55-row corpus into testable obligations that future resource ops
must meet. The hard boundary from the corpus slice remains: static official
symbols are source-backed, but runtime numeric ids remain unverified.

The governing question is:

```text
For each official resource, what should an earthlike map generation operation
attempt to place, under which conditions, and how will later stats prove the
range is being met?
```

## Resource Group Partition

Every official base-standard resource is assigned to exactly one expectation
group. Groups organize research and operation design; they do not imply a
single future implementation file.

| Group | Resources |
|---|---|
| Aquatic, coastal, and navigable-river | `RESOURCE_FISH`, `RESOURCE_PEARLS`, `RESOURCE_WHALES`, `RESOURCE_CRABS`, `RESOURCE_COWRIE`, `RESOURCE_TURTLES` |
| Cultivated, plantation, and medicinal | `RESOURCE_COTTON`, `RESOURCE_DATES`, `RESOURCE_DYES`, `RESOURCE_INCENSE`, `RESOURCE_SILK`, `RESOURCE_WINE`, `RESOURCE_COCOA`, `RESOURCE_SPICES`, `RESOURCE_SUGAR`, `RESOURCE_TEA`, `RESOURCE_COFFEE`, `RESOURCE_TOBACCO`, `RESOURCE_CITRUS`, `RESOURCE_QUININE`, `RESOURCE_MANGOS`, `RESOURCE_RICE`, `RESOURCE_CLOVES`, `RESOURCE_FLAX` |
| Terrestrial animal, forest, and wild | `RESOURCE_CAMELS`, `RESOURCE_HIDES`, `RESOURCE_HORSES`, `RESOURCE_WOOL`, `RESOURCE_IVORY`, `RESOURCE_FURS`, `RESOURCE_TRUFFLES`, `RESOURCE_RUBBER`, `RESOURCE_HARDWOOD`, `RESOURCE_WILD_GAME`, `RESOURCE_LLAMAS` |
| Geological, mineral, gemstone, and industrial | `RESOURCE_GOLD`, `RESOURCE_GOLD_DISTANT_LANDS`, `RESOURCE_SILVER`, `RESOURCE_SILVER_DISTANT_LANDS`, `RESOURCE_GYPSUM`, `RESOURCE_JADE`, `RESOURCE_KAOLIN`, `RESOURCE_MARBLE`, `RESOURCE_IRON`, `RESOURCE_SALT`, `RESOURCE_LAPIS_LAZULI`, `RESOURCE_NITER`, `RESOURCE_COAL`, `RESOURCE_NICKEL`, `RESOURCE_OIL`, `RESOURCE_CLAY`, `RESOURCE_LIMESTONE`, `RESOURCE_TIN`, `RESOURCE_PITCH`, `RESOURCE_RUBIES` |

Coverage invariant: `6 + 18 + 11 + 20 = 55`.

## Expectation Row Shape

Each resource expectation row records:

- `resourceType`
- `groupId`
- `officialCorpusRef` by resource symbol and static row slot
- `status`: `expected`, `conditional`, or `blocked`
- `eligibleAges`
- `officialConstraintSummary`
- `earthlikePredicate`
- `expectedCountRange` for a standard earthlike map baseline, expressed as
  per-resource `min`, `target`, and `max`
- `conditionMultipliers`
- `scarcityClass`
- `operationObligation`
- `statsProof`
- `evidenceStrength`
- `evidenceRefs`
- `caveats`

`expectedCountRange` is a per-resource bounded envelope, not a final tuned constant. It
must be wide enough to tolerate seed variance and map-size differences, but
narrow enough to catch the current failure mode where only a minority of
resources appear.

Groups are non-gating research and implementation rollups. They help organize
evidence packs and future operation files, but they cannot close a stats gate.
Each `resourceType` row owns its own predicate, `min`/`target`/`max`, evidence
strength, gate status, and stats proof.

## Status Mapping

Expectation status is derived from corpus disposition before earthlike
judgment:

- `expected`: allowed only when `strategyRequired.status === "required"` in
  `artifact:resources.corpus`.
- `blocked`: inherited when corpus strategy coverage is blocked; this applies
  to the five no-biome or no-age/no-biome caveat rows until a source-backed
  map-placement disposition exists.
- `conditional`: reserved for source-backed placement rows whose expectation
  depends on age, map shape, or environmental supply. It is not a way to
  include blocked corpus rows in later placement operations.

## Evidence Policy

Authority order for expectation rows:

1. Official Civ7 corpus rows for ages, valid biome count, flags, resource class,
   weight, and blocked/no-biome caveats.
2. Repo-local mapgen field semantics for available map conditions: coast,
   ocean, river, biome, aridity, forest, hills, mountains, wetland, floodplain,
   and latitude when present.
3. External earthlike evidence for real-world distribution and habitat/geologic
   association.
4. Explicit inference rules when exact source-backed ranges are unavailable.

Earthlike predicates that depend on derived geologic or ecological concepts
must name the concrete map field or proxy that later implementation will use.
Examples include sedimentary basin, carbonate belt, evaporite basin, ultramafic
belt, orogeny, upwelling, estuary, reef, and navigable-river mouth. If no proxy
exists, the expectation row records the proxy gap rather than pretending the
operation can test the condition.

Claim strength:

- `source-backed`: official or external evidence directly supports the
  placement predicate or relative rarity.
- `inference-backed`: evidence supports the physical/ecological model, but the
  count range is derived from Civ7 map size, resource class, weight, and
  eligible-tile prevalence.
- `runtime-calibrated`: seed-matrix or in-game telemetry has confirmed the
  range against generated-map eligible-tile denominators.
- `blocked`: official Civ7 rows do not currently expose enough map-placement
  constraints for a responsible operation obligation.

Rows also carry evidence strength by concern:

- `official`: official Civ7 data controls legality, age, class, flags, or
  distribution facts.
- `external`: real-world evidence controls habitat or geologic association.
- `inferred`: count ranges or multipliers are derived from official and
  external evidence but are not yet telemetry-calibrated.
- `runtime-calibrated`: generated-map or in-game telemetry has verified the
  claim.

## Range Derivation Model

Later operation slices shall derive resource count ranges from:

```text
eligible tile supply
  * resource class pressure
  * official weight/flags
  * age availability
  * earthlike rarity class
  * group-specific distribution model used only as a non-gating rollup
```

The expectation artifact records the result as per-resource ranges and named
multipliers, not as an opaque formula. Stats gates can then compare actual
generated resource counts against expected envelopes without knowing
implementation internals.

Expectation ranges are provisional until seed-matrix telemetry records
eligible-tile denominators and actual placement outcomes. A later operation
slice may use these ranges as warning thresholds before calibration, but it
must not promote them to hard closure gates until the range is
`runtime-calibrated`. Official evidence can justify legality, visibility,
blocked status, and warning thresholds, but hard count closure requires
eligible-tile denominator and placement telemetry.

## Blocked Rows

The following rows remain blocked until a source-backed map-placement
disposition exists:

- `RESOURCE_GOLD_DISTANT_LANDS`
- `RESOURCE_SILVER_DISTANT_LANDS`
- `RESOURCE_LAPIS_LAZULI`
- `RESOURCE_CLOVES`
- `RESOURCE_NICKEL`

Blocked expectation rows still appear in the artifact so coverage is complete,
but later placement operations must not silently pretend they are implemented.

## Official Constraint Preservation

Per-resource rows must carry official tags and placement flags from the corpus
into expectation design. `RESOURCE_CRABS` specifically keeps its
`NAVIGABLE_RIVERS_ELIGIBLE` lane visible; a future coastal scorer cannot
silently drop navigable-river eligibility by treating the whole group as
coast-only.

## Write Set

- `openspec/changes/resource-earthlike-expectations/**`
- Optional, after review only:
  `mods/mod-swooper-maps/src/domain/resources/earthlike-expectations/**`
- Optional, after review only:
  `mods/mod-swooper-maps/src/recipes/standard/stages/resources/artifacts.ts`
- Optional, after review only:
  `mods/mod-swooper-maps/test/resources/**`

## Review Gates

Before implementation, peer review must confirm:

- the partition covers all 55 resources exactly once;
- the evidence policy does not overclaim precision;
- blocked/no-biome rows remain blocked;
- no runtime numeric id claim enters the expectation contract;
- the artifact can support future resource-owned operation slices.
