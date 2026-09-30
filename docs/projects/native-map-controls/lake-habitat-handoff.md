# Certified Lake Habitat Handoff

## Scope And Decision

Supporting design within the existing native-map-controls workstream, adapted
from the project template's scope, deliverables and acceptance sections. This
is one Ecology causal-handoff repair, not another basin solver, native lake
classifier, physical-height calibration or shared substrate framework.

The certified lake footprint is authoritative aquatic habitat over unchanged
physical ground. The existing Lotus scorer instead requires marine land/water,
shelf and coastal masks. All 203/77/140/95 lake cells in the held Huge1018 /
Standard1018 / Standard1 / Standard42 captures have physical `landMask=1` and
therefore score zero before warmth or depth matters. Shelf/coastal masks also
exclude that ground by construction. Changing only the passed land mask would
leave two broken gates and an incorrect depth datum.

## Selected Owner Repair

Keep the existing Lotus operation and strategy. Admit a certified input arm
that forwards `lakePlan.lakeMask`, `bodyId` and binary64 `waterSurface`, unchanged
physical elevation/land mask, dimensions and Hydrology temperature. The domain
rule computes `waterSurface - ground` without integer truncation, and measures
lake shoreline distance using the public wrapped-hex neighbor primitive.
`waterSurface` is already an ordinary readonly number array; forward it directly,
without a typed-array conversion or mutable cast.

A shoreline seed is a lake tile adjacent to actual physical land outside the
lake footprint. Its distance is zero. Propagation stays inside that certified
body, not across another wet body, marine water, polar boundary or dry gap.
An edge touching another water class is not silently called land shoreline.
This is a defined geometric habitat constraint, not a fitted proxy for an
observed Lotus quota. Strictly nonpositive depths do not score.
An unseeded body remains inadmissible independently of the configured maximum
distance; an unreachable sentinel must never become eligible at that maximum.

Retain the existing bathymetry/shelf/coastal/distance law as an explicitly
legacy-compatible input arm. Legacy lake plans do not publish a physical head;
inventing a lake surface would fabricate evidence. Both arms carry the lake
plan's existing explicit model tag. The step selects the appropriate evidence
arm and forwards values; it does not compute depth, shore distance or habitat.
An explicit certified tag with incomplete or malformed evidence fails admission,
never falling back to the legacy arm.

The initial optional legacy tag was rejected by actual operation construction:
Core intentionally supports only explicitly tagged root object unions. A caller
search found only this recipe handoff and owned focused fixtures, not persisted
authored operation inputs. Make their existing legacy evidence explicit rather
than extend shared admission for an unnecessary compatibility envelope. Missing
or unknown tags refuse; the old legacy scoring equation and configuration remain
exact. No Core code, schema factory or binding layer changes.

Keep `shallowDepthM`, `deepDepthM` and `maxDistanceToCoast` authored keys and
numbers. Clarify that the certified arm's depth is lake-surface-relative model
relief and shore distance is body-local. No physical-metre claim is introduced.
Ordinary reefs, cold reefs, atolls, Morphology, Hydrology and native projection
remain unchanged. Real Earth fixtures remain external test references.

## Alternatives Rejected

- Rewriting Morphology masks to mark planned lakes as original water would
  corrupt ground/shelf truth and give unrelated marine scorers inland habitat.
- Passing only the existing terrestrial Ecology mask would not repair shelf,
  coast or lake-depth evidence.
- Reusing native lake classification or renderer height would invert physical
  ownership and make portable habitat dependent on a native maintenance cutoff.
- Creating a new broad aquatic-substrate artifact/operation is unnecessary for
  one scorer; reuse exact existing certified evidence and a private domain rule.

## Acceptance Before Tuning

Prove warm shallow and deep certified lakes over physical land, strict
zero-depth exclusion, fractional heads, joint datum translation, body-local
shore distance, wrapped X and bounded Y, marine-only edges, determinism and
input immutability. Preserve the complete legacy law and marine scorers on
their tagged old-evidence fixtures. A step-owned publication test must demonstrate the actual
certified evidence handoff, not synthesize coincident marine masks.

In held full-recipe captures, topography, climate arrays, lake membership/head,
river network and all non-Lotus suitability layers HOLD exactly. Lotus habitat
may become nonzero only on certified lake members; deep/cold/inland constraints
still apply. Feature intent/occupancy may then change through existing rules,
without a minimum presence target. Type/Habitat/build and independent SDK/
physical review precede acceptance. Native `FEATURE_LOTUS` is declared Coast /
Marine and `IN_LAKE` in installed terrain data; actual placement under bounded
native lake policy remains a separate live gate.

## Evidence And Remaining Boundaries

The independent 16-file causal-boundary investigation corroborates all three
membership failures and the depth mismatch. It found no existing Ecology
water-surface/depth owner to reuse. The certified lake artifact already owns
the required exact head and identity; no physical artifact or publication
mechanism needs changing. Normal native cutoff10 and lake/navigation proof
remain open; neither is fixed by accepting aquatic habitat inputs.
