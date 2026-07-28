# Swooper Physics Civ7 App - Agent Router

Scope: `apps/mods/map/swooper-physics/**`

## Ownership

- This `kind:app` project owns the Civ7 realization of the reusable Swooper
  Physics definition: generated map entrypoints, mod files, bundling,
  deployment, request-local Studio mod generation, and live proof.
- Import Swooper product behavior only through finite
  `@swooper/swooper-physics/*` entrypoints. Do not reach into the definition's
  source tree or add a compatibility facade.
- Preserve the external `swooper-maps` mod identity and serialized `standard`
  recipe identity when repository paths change.

## Generated Output

- Treat `src/maps/generated/**` and `mod/**` as generated output. Regenerate
  them with `nx run swooper-physics-mod:gen:maps`; do not edit them by hand.

## Authority

- Architecture split: `docs/system/ADR.md` (ADR-016).
- Active normalization frame:
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`.
- Definition owner: `plugins/mod/map/swooper-physics`.
