## Design

Exact authorship is a proof slice. It does not tune map output. It creates the
identity chain future tuning and product acceptance must stand on.

## Proof Chain

The proof packet must bind:

1. visible Studio config id, label/source path, seed, map size, player count,
   selected setup, request id, and request fingerprint;
2. the Studio-authored `RunInGameSourceSnapshot` or equivalent visible-state
   snapshot that created the request;
3. stable `configHash` and `envelopeHash`;
4. source config/script path, mtime, and content hash;
5. generated/materialized script path, mtime, and content hash;
6. deployed mod script path, mtime, and content hash;
7. Civ setup row and setup parameter readback;
8. setup seed, game seed, map size, player count, and setup option readback;
9. fresh `Scripting.log` request id, config hash, envelope hash, seed,
   dimensions, and recipe completion marker;
10. live map summary after start: seed, dimensions, turn, plot count, Civ
    `Game.getHash()`, and the predecessor live runtime snapshot identity.

Any missing link keeps product proof unresolved.

The predecessor `studio-live-runtime-snapshot-completion` provides the runtime
observation identity boundary. Exact-authorship proof may consume that boundary,
including `Game.getHash()` when present, but must not turn live runtime evidence
into authored Studio config.

## Existing Change Relationship

This change closes the remaining proof tasks in
`studio-run-current-map-config`; it does not duplicate the endpoint or launch
implementation already present there.

## Review Lanes

- Studio proof assembly review.
- Direct-control setup/readback review.
- Swooper generated map/log marker review.
- Product proof-boundary review.
