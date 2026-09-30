# Sea-Level Datum And Scale Qualification

## Scope And Decision

Supporting design note for the existing calibration workstream, adapted from
the project template's scope, acceptance and reference sections. The user's
question joins three different interfaces: authored land/water coverage,
physical model height, and native/rendered elevation. Keep those distinct;
neither a setup label nor successful native readback establishes metres.

Retain the existing sea-relative native projection for now. Do not add an
unverified sea-level setter, infer a renderer scale from a database column,
or multiply physical heights to meet the thermal variance target. Normalized
units remain legitimate for dimensionless laws and authoring. A dimensional
law needs a qualified conversion and coefficient at its domain owner, not
another conversion in the composing step.

## Current Installed Source

Audit date: 2026-09-30. Install: `1.5.0.43 (1311346)` at
`~/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VII/CivilizationVII.app/Contents/Resources`.
The resource mirror receipt still identifies `1.5.0.40 (1306154)`. Six relevant
files are byte-identical between install and mirror: `SetupParameters.xml`,
`continents-voronoi.js`, `continents.mapconfig.js`,
`elevation-terrain-generator.js`, `feature-biome-generator.js`, and
`01_GameplaySchema.sql`. That supports their current source interpretation,
not equivalence of the two native binaries or fresh runtime qualification.

Installed source distinguishes the following:

- `Base/modules/core/config/SetupParameters.xml:69-75` defines `MapSeaLevel`
  with `ConfigurationKey="SeaLevel"` and domain `SeaLevels` for specific
  stock map scripts.
- `Base/modules/base-standard/maps/continents-voronoi.js:31-38` reads that
  string and selects the generator's Low/High variant.
- `Base/modules/base-standard/scripts/voronoi_data/continents.mapconfig.js:235-266`
  changes island size, erosion and `totalLandmassSize` for High. This is
  geography-generation policy, not an observed ocean-height call.
- The gameplay schema declares `MapSeaLevels.Scale REAL`, but the searched
  Base/DLC sources provide no rows or consumer establishing a height unit.
- Stock `common-generation.js` delegates to native `buildElevation()` without
  a sea-level argument. Our app adapter delegates whole-map `setElevation`
  and per-cell `getElevation`; its public contract has no sea-datum operation.

No numeric sea-level setter/getter, renderer height conversion, or metre-based
elevation definition was found in the searched installed JS/XML/SQL/TS/header/
Lua/INI/CFG/JSONC source families or current adapter/types. This is bounded
source absence, not a claim that undocumented engine reflection is impossible.

## Scale Ledger

| Surface | Current representation and meaning | Qualification |
| --- | --- | --- |
| Morphology relief | Normalized relief quantized by 100 into signed Int16 | Model units, not metres or native engine units |
| Physical sea level | Scalar in the same datum as relief; selected from hypsometry under water-coverage constraints | Land/water threshold, not a renderer setting |
| Physical bathymetry | Quantized submerged relief relative to physical sea level | Preserved model truth; not rendered by the ocean-zero projection |
| Lake physical surface | Certified basin surface/spill in the physical relief datum | Distinct from submerged ground and native lake category |
| Native dry-land request | `128 + round(max(0, relief - seaLevel) * 10)` | Fixed Swooper display calibration; observed native land floor, not metres |
| Native marine request | Zero | Explicit representational collapse of bathymetry, not loss from physical artifacts |
| Native lake observation | Tested open bodies equal `round((spill - seaLevel) * 10)` without dry-land offset 128 | Qualified tested cohort only; not rendered world Z or closed/below-sea proof |
| Scientific Earth height | Pinned geopotential metres with explicit test encoding | Reference-only conversion, never a generated-height metre calibration |

Source owners: Morphology's `model/atoms/topography-fields.schema.ts` and
`model/policy/elevation-scale.ts`; `compute-base-topography` quantization;
`compute-sea-level` hypsometric rule; Standard `elevation-projection.ts`;
[native elevation qualification](elevation.md) and
[water-surface cross-check](water-height-maintenance.md#physical-surface-cross-check).

## Fidelity And Consumer Risks

Base relief quantization rounds to integer model units and bounds Int16. It
cannot preserve subunit relief. With a fixed sea datum, the dry-land projection
is monotone, but clips below-datum heights and rounds to native integers.
For integer model relief, x10 is not an additional loss of relief distinctions;
it cannot recover distinctions already quantized upstream. Fractional datums
still incur up to half a native integer of rounding. Overflow is refused,
not silently saturated. Native water leveling can replace submerged-ground
variation with a common water level; preserving that surface is a separate
classification/maintenance question. Native Float64 readback avoids an extra
Int16 truncation, but is not proof of physical metres or renderer coordinates.

A confirmed declaration mismatch remains downstream: Ecology `score-layers`
passes `topography.elevation` and `topography.seaLevel` directly to
`compute-feature-substrate`. The contract says metres; the rule subtracts the
two unchanged values and compares them with `lowlandMaxElevationAboveSeaM`
and `intertidalMaxElevationAboveSeaM`. Those are model-unit comparisons in
the current pipeline, regardless of their names. There is no metre conversion
at that boundary. This establishes inaccurate unit declarations, not a
validated physical threshold or a proved unwanted wetland extent.

Targeted source search also finds metre/engine-unit labels in precipitation,
climate diagnostics, pedology, reef/ice/snow and shelf contracts. Admit each
consumer's actual input vintage, datum, coefficient and output sensitivity
before a behavioral change. In particular, a sea-relative difference is not
the same as an absolute model elevation; a percentile is scale-independent
but deliberately discards absolute magnitude. Do not repair this with a
universal per-map quantile remap, type-brand migration or step-side fallback.

## Acceptance And Next Discriminator

1. Trace physical artifact to operation input and classify each height law as
   dimensionless, model-calibrated or dimensional. Correct false unit labels
   at their owners without changing numerical behavior; record compatibility
   for existing authored keys before any rename.
2. For dimensional candidates, declare physical support, horizontal tile
   scale and time scale as relevant, not just a vertical multiplier. Compare
   the known-height Earth arm and generated-relief shape independently.
3. Predeclare datum-translation and scale/coefficient covariance controls
   where the actual law requires them. Do not require invariance from an
   intentionally absolute policy or claim one fitted quantile calibrates all
   domains. Retain signed below-sea and lake-surface cases separately.
4. Qualify any changed physical law on held Earth identities and generated
   seed/size cohorts before updating its authored coefficients. Native
   shoreline/height and era-qualified movement remain separate gates.

The [land-geographic thermal investigation](land-geography-investigation.md)
can use already-qualified reference heights without waiting for a generated
metre mapping. It must not hide these scale questions behind a maritime gain.

## Review Boundary

An independent source auditor confirmed the setup/native distinctions and
searched-source limits. The coordinator confirmed the actual Ecology input
handoff and threshold comparison. No sea-level API, physical scale migration,
new computational artifact, renderer patch or live probe was implemented by
this audit.
