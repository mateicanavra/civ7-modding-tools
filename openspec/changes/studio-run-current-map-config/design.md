## Design

Run in Game is a separate Studio action from browser preview Run. It builds a
structured request from current Studio state, materializes a Civ map row, and
calls direct-control setup/start wrappers.

## Materialization Policy

- `durable`: save/update a repo-backed config through the existing save policy,
  deploy, then launch that map row.
- `disposable`: materialize the current in-memory config as `studio-current`
  for the launch without persisting seed into authored config. If implemented
  through source files initially, it must snapshot/restore source state and
  regenerate canonical artifacts on cleanup.

## Hash Policy

Compute:

- `configHash`: sha256 of stable JSON for the nested recipe config with schema
  metadata stripped.
- `envelopeHash`: sha256 of stable JSON for launch-relevant row identity:
  id, recipe, latitude bounds, and `configHash`.

The Swooper generated map entry embeds hashes and logs them with request id,
map id, seed, dimensions, and map size during map generation.

## Endpoint Contract

`POST /api/civ7/run-in-game` accepts structured JSON:

- `recipeId`
- `seed`
- `mapSize`
- `playerCount`
- `resources`
- `materialization.mode`
- selected config identity and sanitized `pipelineConfig`

The endpoint returns phase results for materialization, deploy, row proof,
setup, start, post-start summary, and log proof.

## Reload Semantics

Reload semantics are an explicit proof field. Exact-current-config claims are
not green until the ledger identifies the minimum proven boundary:
`hot-deploy`, `shell-reload`, or `process-restart`.

## Failure Semantics

Partial failures return structured phase flags: `materialized`, `deployed`,
`rowVerified`, `setupApplied`, `started`, `postStartVerified`, and
`logProofVerified`.
