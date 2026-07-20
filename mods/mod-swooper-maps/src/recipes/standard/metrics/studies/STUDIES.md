# Standard metric studies

This is the Standard recipe's product study bank. It answers which shipped
products are studied, on which Civ7 dimensions and seeds, against which benchmark
targets. The executable authority is TypeScript; these sheets make that authority
reviewable and reproducible.

The generic subsystem contract lives in [Map product benchmarks](../../../../../../../docs/system/libs/mapgen/benchmarks/BENCHMARKS.md).

## Authority map

```text
metrics/
  capture.ts              completed Standard recipe evidence
  sample.ts               composition of all neutral metric families
  families/*.ts           measurements only
  targets/*.ts            MetricTarget benchmark policy
  studies/
    index.ts               stable study-module surface
    scenarios.ts           shipped configs, Civ7 presets, semantic identity
    model.ts               sample/cohort study and result shapes
    define.ts              shared study constructors and cohort helpers
    catalog.ts             assembly-only STANDARD_METRIC_STUDIES bank
    evaluate.ts            reconcile, capture once, evaluate atomically
    families/*.md          compact measurement-family sheets
    benchmarks/*.study.ts  executable scenario and target bindings
    benchmarks/*.md        colocated protocols and expected outcomes
```

`MetricTarget` remains the benchmark-policy unit. `StandardMetricStudy` is the
recipe execution unit that binds scenarios to one or more targets. No Markdown
field configures either one.

## Civ7 dimension authority

| Preset | Grid | Default players |
| --- | --- | --- |
| `MAPSIZE_TINY` | 60 x 38 | 4 |
| `MAPSIZE_SMALL` | 74 x 46 | 6 |
| `MAPSIZE_STANDARD` | 84 x 54 | 8 |
| `MAPSIZE_LARGE` | 96 x 60 | 10 |
| `MAPSIZE_HUGE` | 106 x 66 | 10 |

The executable study bank resolves these values from canonical Civ7 preset
metadata. Product studies reject custom dimensions even though focused metric
fixtures may construct them.

## Study index

Parameterized entries that share one hypothesis and target protocol share one
sheet. Every runtime study ID emitted by `STANDARD_METRIC_STUDIES` maps below.

| Runtime study ID | Shape | Protocol |
| --- | --- | --- |
| `shipped/identity/{swooper-earthlike,shattered-ring,sundered-archipelago,swooper-desert-mountains}` | Four Huge sample studies, seed 1018 | [Shipped identities](benchmarks/shipped-identities.md) |
| `shipped/arid-climate/MAPSIZE_HUGE/seed-{123,1337,1538316415,1538316523}` | Four Huge sample studies | [Desert Mountains arid climate](benchmarks/shipped-arid-climate.md) |
| `shipped/geography` | 16-map cohort across four shipped configs | [Shipped geography](benchmarks/shipped-geography.md) |
| `earthlike/geography` | Standard sample, seed 1337 | [Earthlike geography](benchmarks/earthlike-geography.md) |
| `earthlike/biome-structure` | Huge sample, seed 1337 | [Earthlike biome structure](benchmarks/earthlike-biome-structure.md) |
| `earthlike/deep-ocean` | Nine-map cross-size cohort | [Earthlike deep ocean](benchmarks/earthlike-deep-ocean.md) |
| `earthlike/river-network` | Three-seed Standard cohort | [Earthlike river network](benchmarks/earthlike-river-network.md) |
| `earthlike/ecology` | Eight-seed Standard cohort | [Earthlike ecology](benchmarks/earthlike-ecology.md) |
| `earthlike/cold-reef` | Eight-seed Huge cohort | [Earthlike cold reef](benchmarks/earthlike-cold-reef.md) |
| `earthlike/floodplain` | Standard sample, seed 1018 | [Earthlike floodplain](benchmarks/earthlike-floodplain.md) |
| `earthlike/orogeny` | Three-seed Huge cohort | [Earthlike orogeny](benchmarks/earthlike-orogeny.md) |
| `earthlike/relief-representative` | Huge sample, seed 1018 | [Earthlike representative relief](benchmarks/earthlike-relief-representative.md) |
| `earthlike/huge-relief-cohort` | Four-seed Huge cohort | [Earthlike Huge relief cohort](benchmarks/earthlike-huge-relief-cohort.md) |
| `earthlike/placement` | Twenty-seed Standard cohort | [Earthlike placement and resources](benchmarks/earthlike-placement.md) |

All studies that include `STANDARD_INTEGRITY_TARGET` also use the [Standard integrity](benchmarks/standard-integrity.md) benchmark protocol.

## Measurement families

- [Geography](families/geography.md)
- [Hydrology](families/hydrology.md)
- [Relief](families/relief.md)
- [Ecology](families/ecology.md)
- [Placement](families/placement.md)
- [Resources](families/resources.md)

## Proof commands

```bash
# Complete machine-readable evaluation of the closed study bank.
nx run mod-swooper-maps:metrics:report

# Behavioral gate that asserts the declared studies.
nx run mod-swooper-maps:test
```

The report is headless completed-map evidence, not live-engine closure.
