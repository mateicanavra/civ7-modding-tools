## Why

The prior balance gates prove lakes are stable and aggregate vegetation exists,
but fresh shipped-map stats still show ecology balance is not finished:
rainforest can dominate earthlike rolls while savanna/steppe are marginal, and
some shipped identities pass with only two or three visible vegetation
families.

This change finishes the product-visible balancing slice by making map-identity
vegetation expectations explicit, tuning configs/policies to meet those
expectations, and keeping hydrology lake projection gates green as the
regression boundary.

## Target Authority Refs

- `openspec/specs/mapgen-normalization-workstreams/spec.md`: world-balance
  proof must cover feature families and map identity.
- `mods/mod-swooper-maps/AGENTS.md`: Ecology feature planning owns split
  feature intents before `map-ecology` projection.
- `docs/system/mods/swooper-maps/architecture.md`: hydrology lake plans and
  ecology feature intents are pipeline truth; map stages project them.

## What Changes

- Tighten world-balance assertions so map identities cannot pass on aggregate
  vegetation alone.
- Tune shipped ecology configs and/or owner-local feature-family policies to
  improve forest/rainforest/taiga/savanna/steppe distribution without fallback
  quotas.
- Preserve lake projection and visual-scatter gates while changing ecology.
- Record focused before/after stats and close with build/deploy evidence.

## Forbidden Non-Goals

- No quota-based or fallback feature placement.
- No exact tile-count snapshots as acceptance proof.
- No generated-output hand edits.
- No weakening lake projection, drift, or scatter assertions to make ecology
  tuning pass.

## Verification Gates

- focused world-balance stats tests;
- config/preset schema and identity tests;
- focused ecology planner/policy tests where changed;
- `bun run --cwd mods/mod-swooper-maps check`;
- `bun run openspec -- validate finish-mapgen-world-balancing --strict`;
- `bun run openspec:validate`;
- `bun run build`;
- `bun run --cwd mods/mod-swooper-maps deploy`;
- FireTuner `Network.restartGame()` runtime map-generation proof from the
  deployed final tree;
- `git diff --check`.
