## Design

Hardening targets:

- Mock adapter should support `TERRAIN_NAVIGABLE_RIVER` terrain with
  `NO_RIVER` metadata so consumers see the live divergence.
- Generated catalog headers should distinguish official resource evidence from
  repo-owned policy contracts.
- `modelRivers()` remains available only for compatibility/official generator
  evidence and is not used by standard authored river projection.
- `riverClass` is either closed to `0/1/2` or documented as
  `0 none`, `1 minor`, `>=2 major/projectable`, with validation.

## Review Lanes

- Adapter boundary review.
- Catalog/type generation review.
- Hydrology contract review.
- Guardrail review.
