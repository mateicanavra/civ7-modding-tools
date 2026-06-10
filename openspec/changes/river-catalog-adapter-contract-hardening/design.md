## Design

Hardening targets:

- Mock adapter should support `TERRAIN_NAVIGABLE_RIVER` terrain with
  `NO_RIVER` metadata so consumers see the live divergence.
- Generated catalog headers should distinguish official resource evidence from
  repo-owned policy contracts.
- `modelRivers()` remains a Civ-native materialization surface invoked from
  `map-rivers` only after Hydrology truth and projection have selected river
  terrain. It is not an upstream Hydrology generator, public selector contract,
  or replacement for same-run terrain/metadata/native-object readback.
- `riverClass` is either closed to `0/1/2` or documented as
  `0 none`, `1 minor`, `>=2 major/projectable`, with validation.

## Review Lanes

- Adapter boundary review.
- Catalog/type generation review.
- Hydrology contract review.
- Guardrail review.
