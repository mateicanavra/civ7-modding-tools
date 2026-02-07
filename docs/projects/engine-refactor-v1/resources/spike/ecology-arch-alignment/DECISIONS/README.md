# Decision Packets (If Needed)

Only add decision packets here when the spike uncovers real “this-or-this” architectural choices that need an explicit accept/reject outcome.

Prefer referencing canonical SPEC/policy docs rather than copying them.

Locked directives (do not open decision packets for these):
- Atomic per-feature ops (maximal modularity)
- Compute substrate (compute ops vs plan ops)

## Packets in this directory

- `DECISION-features-plan-advanced-planners.md`
  - Locks how we model `vegetatedFeaturePlacements` / `wetFeaturePlacements` without bypassing compiler-owned binding/normalization, while still achieving atomic per-feature ops.
- `DECISION-step-topology.md`
  - Locks whether Phase 3 preserves step ids/topology vs splitting steps immediately.
- `DECISION-biomeclassification-mutability.md`
  - Locks the artifact mutability posture for `artifact:ecology.biomeClassification`.
- `DECISION-plot-effects-effect-tag.md`
  - Locks whether/how we introduce an explicit effect tag for the `plot-effects` adapter write boundary.
- `DECISION-map-ecology-split.md`
  - Locks whether we keep `map-ecology` topology stable (recommended) or split projection vs stamping.
