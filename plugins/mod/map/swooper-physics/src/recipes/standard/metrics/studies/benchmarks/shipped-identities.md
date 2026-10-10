# Shipped identity studies

**Executable authority:** [`shipped-identities.study.ts`](shipped-identities.study.ts)
**Target authority:** [`targets/identities.ts`](../../targets/identities.ts)

## Question and design

Do all three durable catalog configurations retain their exact product
identities? Three sample studies run `MAPSIZE_HUGE` (106 x 66, 10 players) at
seed `1018`. Their IDs are
`shipped/identity/<configuration-id>`. Each applies `standard/integrity` plus its
configuration-specific identity target. Catalog membership and the target record
share one exhaustive key type; study construction maps every entry directly and
does not presence-filter configurations.

The default `earthlike-core` scope selects only the Earthlike identity study.
Desert Mountains and Archipelago are intentionally biased configurations of the
same recipe and remain explicit configuration-stress studies under `all`, not
core Earthlike calibration or release gates. Catalog and generic test coverage
remain exhaustive.

## Expected outcomes

| Configuration target | Product identity budget |
| --- | --- |
| `swooper-earthlike/identity` | Primary Earthlike world identity: largest lake component `>=4`; wetland share `<=0.08`; reef share `<=0.13`; vegetation families `>=5`; deep ocean `>=0.40`; forest, rainforest, taiga, savanna, and sagebrush present; rainforest `<=0.65` of vegetation. |
| `swooper-desert-mountains/identity` | Largest lake component `>=4`; wetlands `<=0.08`; reefs `<=0.047`; vegetation families `>=2`; atoll, savanna, and sagebrush present. |
| `sundered-archipelago/identity` | No unconditional lake-component floor; wetlands `<=0.22`; reefs `<=0.02`; vegetation families `>=2`; atoll, forest, rainforest, and mangrove present. Its climate calibration must preserve that mixed wet-archipelago ecology without lowering feature-admission policy. |

Every identity target requires exact configuration identity. Each study also
applies `standard/integrity`, which owns habitat fidelity for rotation,
range-floor, and support resource phases.

**Expectation IDs:** `configuration-identity`, optional `largest-lake-component`,
`wetland-share`, `reef-family-share`, `vegetation-family-variety`, optional `deep-ocean-share`,
`required-feature/<feature>`, and optional `rainforest-vegetation-share`.

The former Desert Mountains absolute `rainforest-tile-count <=20` expectation
is removed outright from both Desert consumers. No replacement cap or physical
retune is introduced. The Earthlike `rainforest-vegetation-share <=0.65` guard
remains unchanged; a separate prospective review is required to amend it.

## Proof

```bash
civ7 mapgen metrics report
civ7 mapgen metrics report --scope all
nx run swooper-physics:test
```

The default report and definition study gate qualify Earthlike; only the
explicit `all` report evaluates the biased configuration identities.
