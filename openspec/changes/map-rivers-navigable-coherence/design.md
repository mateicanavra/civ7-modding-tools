## Design

Projection remains a `map-rivers` concern. It consumes Hydrology major-river
intent and produces a Civ-visible navigable terrain subset.

Initial acceptance bands:

- For Standard `84x54` normal Earthlike maps where planned major rivers exceed
  100 tiles, require at least 20 live `TERRAIN_NAVIGABLE_RIVER` tiles or at
  least two connected projected chains.
- Require projected navigable terrain to be at least 5 percent of planned major
  river tiles unless the map is an explicit dry/arid no-signal control.
- Require selected chains to avoid mountains, prefer lower slope, and connect
  along river flow or contiguous eligible corridors.

These values are starting acceptance gates, not hidden tuning constants. Any
change to them needs a recorded benchmark rationale.

## Review Lanes

- Projection policy review.
- Physical hydrology review for no-signal exceptions.
- Product acceptance review for visibility thresholds.
