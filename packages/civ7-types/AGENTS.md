# Civ7 Runtime Types — Agent Router

Scope: `packages/civ7-types/**`

- Type definitions for the Civ7 scripting/runtime environment.
- No runtime code here; keep exports type‑only.
- `generated/river-types.gen.d.ts` is materialized from the admitted river
  metadata by `nx run civ7-map-policy:generate`; `civ7-types:check` delegates
  exact currentness to that single owner.
- Validate with `nx run civ7-types:check` after changes.

Docs:
- `docs/system/sdk/overview.md`
