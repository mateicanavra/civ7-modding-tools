# Civ7 Map Policy - Agent Router

Scope: `packages/civ7-map-policy/**`

- Owns pure, deterministic Civ7 map and initial-setup policy facts derived from official resources, plus compliance helpers derived from those facts or live-engine evidence.
- Does not own MapGen physics, morphology, ecology, placement strategy, recipe
  order, generated mod output, or direct Civ7 runtime calls.
- Keep this package small: add policies only when at least one operation or verifier needs the same Civ policy outside a single local helper.

Tooling:

- Use `nx run civ7-map-policy:build` and `nx run civ7-map-policy:check`.
- `nx run civ7-map-policy:generate` is the sole materializer for the tracked
  policy tables, setup parameters, and ambient river declaration. Normal
  package build/check invokes its exact `generated:check` owner.
