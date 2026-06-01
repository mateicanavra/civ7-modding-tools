## Context

The accepted packet rejects SDK-native persisted `advanced`. The current flat
surface already exists for no-public stages, but some stages still define a
public schema solely to unwrap `advanced`. Studio and presets also encode the
old wrapper as if it were the product contract.

## Goals / Non-Goals

**Goals:**

- Make the flat stage config surface the default public contract.
- Remove wrapper-only compile functions.
- Migrate first-party configs, presets, tests, Studio assumptions, and docs.
- Improve flat surface schema validation where feasible.

**Non-Goals:**

- Redesign stage topology.
- Add broad import enforcement.
- Preserve both old and new persisted config shapes.

## Decisions

### Flat Step IDs Are The Persisted Contract

The persisted shape is `{ knobs?, [stepId]?: stepConfig }`. UI grouping may
display advanced controls, but the saved config key is the step ID.

### Public Compile Remains Valid For Real Transforms

`public + compile` is not removed from the SDK. It remains valid for stages
whose public keys intentionally differ from internal step config. The banned
case is a boilerplate `advanced` wrapper that exists only to repackage step
config.

### Schema Tightening Is Part Of D1, But Not A New Shape

If implementation tightens flat surface validation, it must derive from the
declared stage steps. It must not introduce a second public schema source.

Feasibility means either the SDK can derive concrete step-key schemas from the
declared stage steps, or the implementation records an exception explaining why
that key remains late-validated while still proving flat config behavior at
recipe compile time.

## Risks / Trade-offs

- Removing `advanced` can silently drop overrides if configs are not migrated
  in the same change.
- Studio may contain both static UI types and generated schema consumers; both
  must be updated.
- Compile-time typing may remain weaker than runtime schema validation. The
  change should improve this where feasible without overclaiming type proof.
  Any remaining gap needs an exception ledger entry.

## Review Lanes

- Product/DX review: verifies saved config shape, Studio behavior, and docs.
- SDK review: verifies authoring API semantics and schema derivation.
- Adversarial review: searches for leftover active `advanced` wrappers and
  accidental dual-shape compatibility.
