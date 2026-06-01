# Design: Morphology Authoring Surface Alignment

## Problem

Earlier Morphology slices moved the standard recipe away from raw internal
step/op envelopes and into semantic public keys. The corpus ledger now shows a
different defect class: Morphology public fields are mostly semantically placed,
but many descriptions are missing or too implementation-local and many numeric
leaves are only half-bounded.

Leaving those fields unbounded makes Studio and JSON authors guess which values
are meaningful, and it lets private tuning numbers masquerade as safe controls.

## Decision

Keep the current public keys and compile functions. Align the authoring surface
by improving the TypeBox schema artifacts that already own Morphology config:

- object descriptions explain the authoring group and map impact;
- numeric descriptions describe what the control changes, why it exists, and the
  units or semantics;
- every numeric public leaf has both `minimum` and `maximum`;
- semantic knobs describe the gameplay/map posture they control;
- generated Studio schema is regenerated and guarded.

## Behavior Boundary

This slice is schema-contract cleanup. It does not change shipped config values,
stage topology, compile functions, or runtime algorithms.

Because adding bounds can reject inputs that were previously accepted, the
chosen bounds are intentionally broad enough to include all first-party shipped
configs and defaults while still excluding unbounded implementation nonsense.
The slice proves no executable Morphology config changes for first-party maps by
checking stable compiled-config output against a pre-slice golden fixture.

## Deferred Work

Some Morphology controls, especially `geomorphicCycle`, `mountainRanges`, and
`volcanoes`, remain expert controls. This slice does not claim those fields are
the final product-optimal surface. It records a bounded documentation/range
alignment. Future profile-collapse work remains owned by the standard recipe
authoring-surface workstream and should re-enter when product/statistical
evidence shows a field group must be tuned together or cannot be meaningfully
authored as direct controls.
