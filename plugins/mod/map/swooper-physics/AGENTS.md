# Swooper Physics Definition - Agent Router

Scope: `plugins/mod/map/swooper-physics/**`

- This `kind:mod` project owns the reusable Swooper product definition: its six
  domains, Standard recipe, authored map configs and catalog, metrics,
  visualization authorship, diagnostics, and stable mod identity.
- Keep Civ7 file rendering, generated map entrypoints, deployment, request-local
  Studio materialization, and live execution in the realization app at
  `apps/mods/map/swooper-physics`.
- Keep definition-internal imports relative so the source graph remains
  self-contained under ordinary TypeScript and Nx resolution. Consumers use
  only the finite package exports in `package.json`.
- Verify changes with `nx run swooper-physics:check` and the nearest focused
  `swooper-physics` test or build target.

Canonical authority:
- `docs/system/ADR.md` (ADR-016)
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/libs/mapgen/MAPGEN.md`
