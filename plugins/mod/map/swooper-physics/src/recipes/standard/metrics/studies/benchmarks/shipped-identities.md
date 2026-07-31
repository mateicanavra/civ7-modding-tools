# Shipped identity studies

**Executable authority:** [`shipped-identities.study.ts`](shipped-identities.study.ts)
**Target authority:** [`targets/identities.ts`](../../targets/identities.ts)

## Question and design

Do all eight durable catalog configurations retain their exact product
identities? Eight sample studies run `MAPSIZE_HUGE` (106 x 66, 10 players) at
seed `1018`. Their IDs are
`shipped/identity/<configuration-id>`. Each applies `standard/integrity` plus its
configuration-specific identity target. Catalog membership and the target record
share one exhaustive key type; study construction maps every entry directly and
does not presence-filter configurations.

## Expected outcomes

| Configuration target | Product identity budget |
| --- | --- |
| `swooper-earthlike/identity`, `latest-juicy/identity`, `mountain-patch/identity`, `mountains-of-time-earthlike/identity`, `mountains-of-time-original/identity` | Shared Earthlike world identity: largest lake component `>=4`; wetland share `<=0.08`; reef share `<=0.13`; vegetation families `>=5`; deep ocean `>=0.40`; forest, rainforest, taiga, savanna, and sagebrush present; rainforest `<=0.65` of vegetation. |
| `shattered-ring/identity` | Largest lake component `>=4`; wetlands `<=0.12`; reefs `<=0.04`; vegetation families `>=3`; atoll, forest, rainforest, and sagebrush present. |
| `sundered-archipelago/identity` | Largest lake component `>=2`; wetlands `<=0.22`; reefs `<=0.02`; vegetation families `>=2`; atoll, forest, rainforest, and mangrove present. Its climate calibration must preserve that mixed wet-archipelago ecology without lowering feature-admission policy. |
| `swooper-desert-mountains/identity` | Largest lake component `>=4`; wetlands `<=0.08`; reefs `<=0.047`; vegetation families `>=2`; atoll, savanna, and sagebrush present; rainforest tiles `<=20`. |

Every identity target requires exact configuration identity. Each study also
applies `standard/integrity`, which owns habitat fidelity for rotation,
range-floor, and support resource phases.

**Expectation IDs:** `configuration-identity`, `largest-lake-component`,
`wetland-share`, `reef-family-share`, `vegetation-family-variety`, optional `deep-ocean-share`,
`required-feature/<feature>`, `rainforest-vegetation-share`, and
`rainforest-tile-count`.

## Proof

```bash
nx run swooper-physics:metrics:report
nx run swooper-physics:test
```
