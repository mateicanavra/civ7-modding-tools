# Prohibit RNG Callback State In Ops

Subject ID: `prohibit_rng_callback_state_in_ops`

Title: Prohibit RNG Callback State In Ops

Blueprint: `_self`

Primary category: `execution`

Secondary categories: `boundary`

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/mapgen/domain/blueprints/_self/execution/check/prohibit_rng_callback_state_in_ops`

Files:
- `prohibit_rng_callback_state_in_ops.baseline.json`
- `prohibit_rng_callback_state_in_ops.pattern.md`
- `prohibit_rng_callback_state_in_ops.rule.json`

Evidence: The pattern forbids RngFunction, options.rng, and ctx.rng in domain ops. Domain ops should receive deterministic authored inputs instead of ambient RNG callbacks or state.

Notes:
- Moved from `boundary` to `execution` because the pattern protects runtime operation purity from ambient RNG callback/state access.
