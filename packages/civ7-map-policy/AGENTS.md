# Civ7 Map Policy - Agent Router

Scope: `packages/civ7-map-policy/**`

- Owns pure, deterministic Civ7 map policy facts and compliance helpers derived from adapter-extracted official resources or live-engine evidence.
- Does not own MapGen physics, morphology, ecology, placement strategy, recipe order, generated output, or direct Civ7 runtime calls.
- Keep this package small: add policies only when at least one operation or verifier needs the same Civ policy outside a single local helper.

Tooling: use `nx run civ7-map-policy:build` and `nx run civ7-map-policy:check`.
