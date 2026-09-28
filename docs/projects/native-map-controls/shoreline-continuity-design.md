# Lake Shoreline Continuity

## Scope And Objective

Repair the visible lake/channel joins at the five-tile body 42 in the user's
photo, without changing physical drainage, lake geometry, erosion, or dry river
classification. This is a bounded, test-only realization experiment, not a
production fix. The [retained investigation](network-coherence-investigation.md)
establishes the physical edges. The user's B photo and subsequent visual review
show promising continuous joins at singleton bodies 56/59; repetition is still
needed and navigation remains unqualified. Temporary ocean/cache flags are not
the oracle for visual success. Directions below come from the physical graph,
not the image.

The diagnostic revision is **V8**. Every built arm records the canonical
configuration and envelope hashes, exact fixture-source SHA-256, final bundle
SHA-256, and explicit edge descriptors in `proof.json`. Installed-bundle identity
and native game/controller correlation remain separate live-proof gates.

## Alternatives

| Model | Intervention | Decision |
| --- | --- | --- |
| Outlet admission alone | Write the omitted wet outlet into its existing dry NAV receiver | First causal candidate |
| Connected wet spine | Add the inlet-side wet continuation as well as the outlet | Second candidate; distinguishes internal wet-path needs |
| Terrain or water-surface integration | Change lake leveling or shoreline realization | Separate next design only if both bounded candidates fail |
| Erosion or minimum lake area | Change physical generation to disguise the join | Excluded: five-tile witness and no demonstrated physical defect |

No broad wet-cell writes, cliff suppression, second finalization, or altered
cache schedule belongs in this comparison. It does not tune the one-era young,
low-erosion Earthlike configuration.

## Exact Controls

All arms use canonical `swooper-earthlike`, Huge **106x66**, map/game seeds
**1018/1018**, ten players, the same **656 dry writes**, one **6,996-cell**
elevation input, and one finalization with **`false,25,2,2`**. Hash and compare
complete inputs, not sampled cells. Production lake assertions stay enabled.

| Arm | Extra NAV writes, in call order |
| --- | --- |
| `full-map-observe` | None |
| `full-map-body42-outlet` | `(85,9) WEST -> (84,9)`; receiver kind `dry-nav` |
| `full-map-body42-spine` | Same outlet, then `(86,10) SOUTHWEST -> (85,9)`; receiver kind `wet-lake` |

The existing `full-map-wet-outlets` atlas remains available unchanged in scope:
only `(86,32) NORTHWEST -> (85,33)` and `(87,28) NORTHWEST -> (86,29)` for bodies
56/59. Neither write occurs in either body-42 arm. The legacy, terrain-admission,
and lake-navigation atlases retain their existing setup and behavior.

Observe all five body-42 wet cells `(85,9)`, `(86,9)`, `(86,10)`, `(87,10)`,
`(86,11)`; NAV inlet `(85,10)` and outlet `(84,9)`; and MINOR inlets `(88,10)`
and `(87,9)`. Retain both singleton outlet/receiver pairs and minor `(87,31)`
as untreated controls. The physical dry inlet edges are `(85,10) -> (86,10)`,
`(88,10) -> (87,10)`, and `(87,9) -> (87,10)`.

Before **any** extra write, require exact setup/count/tuple admission, all
selected native direction enums, and native `getAdjacentPlotLocation` agreement
with each descriptor. Require wet sources and wet receivers to be both water
and lake; dry receivers/controls must be nonwater, nonlake, and retain their
specified NAV or MINOR class. Admit all five wet cells and all four dry controls
for each body-42 arm. Check both retained singleton pairs too. Any failed guard
refuses the whole extra-write batch and finalization; it never partly admits an
intervention. A native setter failure after dispatch cannot promise rollback.

## Metrics And Falsifier

| Measurement | Predeclared expectation |
| --- | --- |
| Visible broad joins | Both inlet and outlet meet the lake continuously: 2/2 on matched, fully revealed close views |
| Native persistence | Record finalization, existing cache passes, and fresh completed-game readbacks separately |
| Dry river classes | HOLD: all 656 source classes match the no-write arm |
| Physical/native collateral | HOLD: complete elevation inputs and retained native elevations, lake footprint, terrain, and sampled directional cliffs agree |
| Untreated joins | HOLD: both MINOR inlets and the 56/59 controls do not visibly regress |

Use the same camera target, zoom and game setup for matched views; retain raw
images alongside game/controller identity and readback receipts. A screenshot
alone does not identify a physical flow direction. A temporary cache-only
change is not a lasting repair. Lake class **-1 is not failure**: a lake need not
become NAV terrain. `getRiverPlots` membership and ocean/cache flags are neither
directed-edge observations nor visual proof, and shared river membership is not
an admission or success requirement. Native numeric lake heights are not yet a
qualified water-surface measurement. Ship traversal remains a separate claim.

The omitted-wet-path explanation is falsified for this witness if both admitted
candidate arms leave the same visible discontinuity, or if any apparent benefit
does not persist in completed-game evidence and a repeat. Any changed input or
broken HOLD guard invalidates the comparison instead of supporting the theory.

## Decision And Stop Rule

Compare the three V8 arms once. Repeat the apparent winning arm and its matched
no-write control in fresh games before promotion, because the prior singleton
comparison showed uncontrolled mesh variation. Prefer outlet-only if it meets
the same visual and collateral gates as the spine. Require repeatable 2/2 joins,
no collateral regression, and complete identity correlation before proposing a
general production policy with broader lake/seed coverage.

If neither candidate wins, stop wet-write variants. Carry the retained receipts
into a separate water-surface/shoreline-integration design, rather than adding
arbitrary wet paths, changing the finalizer, or reshaping the lake. This bounded
experiment does not itself establish a repeatable repair or justify production
promotion. Verified generalization remains within the user's authorized design
and implementation scope, not behind a new permission gate.
