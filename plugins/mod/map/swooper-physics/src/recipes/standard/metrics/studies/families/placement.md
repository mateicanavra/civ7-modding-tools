# Placement measurements

**Executable authority:** [`families/placement.ts`](../../families/placement.ts)

This family measures exact player seating, legal start surfaces, modeled/headless
freshwater opportunity, fertility, pair spacing, score fairness, fallback and
region relaxation, climate-tail exposure, homeland and landmass distribution,
global/regional dispersion, and realized resource support around starts.

Fertility uses radius two. Freshwater combines modeled rivers with observed
headless lakes on or adjacent to a start. Climate tails use the driest or outer
temperature deciles. Those definitions are measurements, not live-engine claims;
acceptable shares and gaps belong to targets.

Natural-wonder planning keeps physical normalized elevation for suitability and
admits a separate exact engine-elevation surface for native minimum-height
constraints. An unavailable native observation refuses planning; physical
relief is never a substitute. The V3 planning-input evidence retains both
surfaces independently, including whether engine values came from native or
mock state. Mock observations are not native execution proof.

Planned anchor elevations record admission evidence, not write intent. Feature
materialization reads the current engine height again, matching the shipped
`natural-wonder-generator.js` use of `FeatureData.Elevation`. Placement evidence
and exact logs preserve fractional values. Correct native floors may change
wonder selection without changing physical generation or suitability scoring.
