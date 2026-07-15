# Studio Run Real User Matrix Closure

## Why

The initiative closes on the real product path: a visible Studio Run in Game
click carries one complete canonical config through generation, deployment,
Civ7 setup/start, and request-correlated loaded-game observation.

P19 and P20 established the stable generated mod and saved-config lifecycle.
P21 owns the final three-row acceptance matrix after A.2 and A.3 reconverge on
one frozen runtime-relevant tree.

## Authority

- The current `@civ7/studio-contract` Run in Game schema owns public input,
  phases, status, and safe failure categories.
- The parsed generation manifest owns request, artifact, canonical-config,
  launch-envelope, and manifest identity; `RunCorrelation` is its derived
  comparison contract.
- `target-vocabulary.md` owns the accepted P21 rows and evidence class.
- Existing behavior tests own controlled failure, recovery, freshness, and
  redaction cases.

## Required Live Rows

Each row uses `ToT_BasicModsEnabled.Civ7Cfg`, seed `1538316415`,
`MAPSIZE_HUGE`, 10 players, and balanced resources:

1. `swooper-earthlike`
2. `latest-juicy`
3. `swooper-desert-mountains`

Rows originate from the rendered control, run serially, and use the existing
Studio operation and diagnostics records. They do not require a new harness.

## Requires

- P19 generated-map-mod visibility: closed.
- P20 saved-config reconciliation: closed.
- A.2 domain-operation work integrated.
- A.3 static ownership closed for the integrated tree.
- One frozen runtime-relevant Graphite tree and reachable Studio/Civ7 runtime.

## Scope

- Correct P21 authority to the complete canonical-config boundary.
- Require the stable `maps/studio-run.js` setup row while retaining
  `runArtifactId` only as correlation identity.
- Separate the three live success rows from deterministic behavior gates.
- Retain exact public/private, generation/deployment, setup, runtime, and process
  correlation for each live row.
- Require recipe-owned nondegenerate/playability proof and stable Studio daemon
  identity without adding another live mutation.

## Exclusions

- Catalog or Editor launch-source variants.
- Request-specific map script filenames.
- Live failure injection, cancellation, ownership conflict, or repeat-run
  ceremony.
- Independent Tuner probes, automatic mutation replay, whole-app restart during
  a normal row, or a new evidence framework.
- Runtime redesign inside matrix execution.

## Consumer Impact

P21 decides whether the rendered Run in Game product is closed. Endpoint-only
starts, mocked transports, generated files alone, screenshots alone, or direct
Tuner reads cannot substitute for the rendered-to-in-game chain.

## Stop Conditions

- A.2/A.3 have not reconverged on the candidate tree.
- A required config cannot complete through the rendered control.
- Public status and explicit diagnostics cannot be tied to one request.
- Stable setup-row, generated/deployed, log, or loaded-game evidence disagrees.
- Civ7 process identity changes during an ordinary row.
- A material reviewer finding remains open.

## Verification Gates

- Strict P21 and full OpenSpec validation.
- One Nx-owned check/test/build graph for the integrated product owners.
- Habitat boundaries and current policy gates.
- Existing deterministic recovery/failure/freshness/redaction tests.
- Three serial rendered+Civ7 rows at the frozen runtime-relevant tree.
- Fresh TypeScript/state-space, architecture/authority, and
  product/runtime/library review roles.
