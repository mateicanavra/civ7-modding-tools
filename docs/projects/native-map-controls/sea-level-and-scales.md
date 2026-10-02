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

A confirmed declaration mismatch was present downstream: Ecology `score-layers`
passes `topography.elevation` and `topography.seaLevel` directly to
`compute-feature-substrate`. The contract says metres; the rule subtracts the
two unchanged values and compares them with `lowlandMaxElevationAboveSeaM`
and `intertidalMaxElevationAboveSeaM`. Those are model-unit comparisons in
the current pipeline, regardless of their names. There is no metre conversion
at that boundary. This establishes inaccurate unit declarations, not a
validated physical threshold or a proved unwanted wetland extent.

The owner-local declaration repair below removes the proved false labels. It
does not retroactively validate those numerical thresholds.

Targeted source search also found metre/engine-unit labels in precipitation,
climate diagnostics, pedology, reef/ice/snow and shelf contracts. Admit each
consumer's actual input vintage, datum, coefficient and output sensitivity
before a behavioral change. In particular, a sea-relative difference is not
the same as an absolute model elevation; a percentile is scale-independent
but deliberately discards absolute magnitude. Do not repair this with a
universal per-map quantile remap, type-brand migration or step-side fallback.

## Owner-Local Unit Repair

The accepted repair changes only descriptions/comments in 27 production
files. Existing authored keys, defaults, constraints, imports, types and
equations remain unchanged. In particular, legacy `M` suffixes are retained
for authored-config compatibility and explicitly documented as model-unit
controls, not covertly multiplied or renamed. No operation, artifact, step,
schema envelope or publication mechanism is added.

Tracing the actual Standard call sites distinguishes these laws:

| Owner / law | Actual height meaning | Calibration obligation |
| --- | --- | --- |
| Wetland substrate | `elevation - seaLevel`; joint-datum invariant | Sea-relative model thresholds, not metres |
| Precipitation and barrier diagnostics | Absolute elevation gates and neighbor differences | Absolute gates are datum-sensitive; uplift also needs horizontal support |
| Refinement | Absolute lowland gates; a relative closure margin | Do not assume every lowland gate already subtracts sea level |
| Pedology and floodplain | Neighbor relief; model-calibrated normalizers | Pedology's map-max relief ratio is dimensionless; sediment is a model proxy |
| Reef family / shelf | Negative sea-relative Morphology bathymetry | Model depth windows and relief per tile hop, not physical depths/slopes |
| Ice / snow | Absolute relief, or the existing percentile snow range | Distinguish absolute altitude policy from relative land ranking |

Lotus consumes the same Morphology bathymetry with a separate lake-membership
gate. That does **not** make its depth the difference between physical lake
surface and submerged ground. This additional datum relationship needs its
own lake-cohort discriminator; relabeling it cannot repair it.

The substrate regression retains defaults `160/40`, admits custom legacy keys,
tests exact threshold boundaries and below-datum exclusion, and compares all
output masks under a joint elevation/sea-level translation. These controls
prove this sea-relative law's existing meaning, not universal datum invariance
of absolute policies elsewhere. The separate parsed-source comparison ignores
only documentation and formatting and holds all remaining production syntax.
Both checks stay outside normal generation's scientific acceptance path.

## Numerical Reach Is Not Physical Calibration

On the frozen Huge1018 / Standard1018 / Standard1 / Standard42 cohort, the
captured terrestrial absolute relief ranges are `12..90`, `22..94`, `-42..92`
and `12..82`; sea levels are `11`, `21`, `-43` and `11`. The authored lowland
limit `150` admits every terrestrial cell's **height gate** in these cases.
That does not imply every cell becomes wetland: hydrology, coastal adjacency,
climate, scoring and occupancy still gate actual feature intent.

The authored absolute alpine-ice minimum `2200` has no support in those ranges.
This proves the land-ice height ramp is inactive in the held cohort, not what
a calibrated glacier distribution should be. Blindly lowering it would also
confuse physical glacier evidence with native feature capability. The actual
installed `1.5.0.43` `Base/modules/base-standard/data/terrain.xml:192,247-248,288`
declares `FEATURE_ICE` as non-lake, Coast/Ocean and Marine. Its land suitability
cannot be claimed as native alpine ice without a different qualified projection.
Existing percentile snow effects are a separate representational path.

The next numerical discriminator therefore classifies a gate's intended
physical meaning and projection before choosing a scale or removing a proxy.
No glacier quota, physical-height multiplier, gate retuning or lake-depth
conversion is accepted by this metadata repair.

## October 2 Marine Feature Retirement

The earlier metadata-only repair deliberately retained legacy alpine keys.
The subsequent [marine ice eligibility decision](marine-ice-eligibility.md)
now strictly removes that unsupported feature capability, rather than retaining
an inactive-looking height option or guessing a metre conversion. The existing
scorer's sole `marine-temperature` strategy consumes physical external-water
membership and current climate temperature. Its planner independently checks
that membership before confidence and occupancy. The three retained configs
migrate only this ice envelope; old alpine keys and old operation shapes refuse
canonical admission. Physical cryosphere and percentile snow remain separate
owners and are unchanged. The historical unit-repair receipts above retain
their original scope, not a current compatibility promise for retired keys.

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

The subsequent [Foundation support attribution](constitutive-support-attribution.md)
reconstructs all eight retained local histories and continental support bytes
exactly. It locates actual post-history thickness clamping and cooling gates,
not an admitted material law or metre mapping. The retained `-0.0065 C` per
model-unit thermal lapse therefore remains numerically uncalibrated despite
its corrected description. The separate flat thermal boundary discriminator
must not compensate for that unknown height scale.

## Review Boundary

An independent source auditor confirmed the setup/native distinctions and
searched-source limits. The coordinator confirmed the actual Ecology input
handoff and threshold comparison. No sea-level API, physical scale migration,
new computational artifact, renderer patch or live probe was implemented by
this audit.

The declaration follow-through received independent SDK review: no production
simplification or behavioral change was established. The first owning policy
run correctly rejected two private imports in the new metadata test. Those
were replaced with existing public router operation metadata; the independent
follow-up accepted that correction. Pinned types then exposed that TypeBox's
static schema types do not declare descriptive metadata. The coordinator's
final test-only correction observes the literal metadata with native
`Reflect.get`, without casts, new schema types or export widening. That final
reflection spelling was coordinator-reviewed, not covered by another
independent run. All production declarations remain independently reviewed.

## Repair Proof

Evidence root: `~/Library/Application Support/Civ7Tools/VisualAtlas/huge-1018/earth-calibration/`.
Retained research and checks remain outside the repository; normal generation
does not gain these assertions or fixture inputs.

- Final owning graph: `relief-unit-accepted-owning-proof-20260930.log`.
  Definition types and Habitat pass. Definition tests: 1040 pass, one aggregate
  failure containing the same eleven unresolved calibration expectations.
  App tests: 187 pass, 31847 assertions. Build/deploy pass, 13 installed files.
  Earlier policy/type failures are retained separately rather than called passes.
- Coordinator's nine-file focused replay: 27 pass, 784 assertions; final
  substrate test: 6 pass, 27 assertions. The author's separate nine-file set
  passed 31 tests / 1172 assertions; those are different selections, not totals
  to combine. Pinned test typecheck passes after the metadata correction.
- `land-thermal-variance-20260930/relief-unit-source-identity.json` verifies
  all 27 changed production files against `b0b1d2c491`: parsed AST kinds,
  literal/identifier text, operators and child structure match after removing
  documentation-only differences. Source syntax and numerical laws hold.
- `land-thermal-variance-20260930/relief-unit-comparison.json` verifies a fresh
  actual full-recipe capture against the sealed periodic-biome baseline: all
  48 captured product field arrays, 20 climate-index arrays, plan nodes,
  configs, metric observations and actual thermal replay are exact. This is
  not a claim that every unretained world field or native tile was observed.
- New capture receipt SHA256:
  `f45f2f055273cd7976c928483d57064b1069e063163f849a09575940c0cbd31e`.
  Source closure SHA256:
  `da5d8262035d45c1ccbdc30c5ca69b2785e9ed3278478bed9aef33018758ef68`.
  The coordinator rechecked every retained source hash after the final proof;
  none changed. Reference/config identities are not relabeled as current Earth
  calibration acceptance.
- Built and installed normal Earthlike script SHA256:
  `be36b3f0ae196bed94348b6a013a751d76f2d0c0ca36db3ad9df6356b87d3fc9`.
  Installation is verified; this metadata repair does not claim a new live
  generation, lake-height policy or navigation proof.
