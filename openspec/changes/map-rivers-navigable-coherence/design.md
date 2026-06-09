## Design

Projection remains a `map-rivers` concern. It consumes Hydrology major-river
intent and produces a Civ-visible navigable terrain subset.

The public projection model is intentionally narrow:

- public knob: `map-rivers.knobs.navigableRiverDensity`
- physical truth knob: `hydrology-hydrography.knobs.riverDensity`
- retired surface: `map-rivers.knobs.riverDensity`
- internal selector defaults: compiled density profiles owned by the consumed
  Hydrology-backed op envelope

This change does not preserve or reintroduce authored `minLength/maxLength`
projection thresholds. Those values are not the product model and do not match
the physically grounded owner split.

Initial acceptance bands:

- For Standard `84x54` normal Earthlike maps where planned major rivers exceed
  100 tiles, require at least 20 live `TERRAIN_NAVIGABLE_RIVER` tiles or at
  least two connected projected chains.
- Require projected navigable terrain to be at least 5 percent of planned major
  river tiles unless the map is an explicit dry/arid no-signal control.
- Require selected chains to avoid mountains, prefer lower slope, and connect
  along river flow through Hydrology-authored major-river continuity.

These values are starting acceptance gates, not hidden tuning constants. Any
change to them needs a recorded benchmark rationale.

## Review Lanes

- Projection policy review.
- Physical hydrology review for no-signal exceptions.
- Product acceptance review for visibility thresholds.
