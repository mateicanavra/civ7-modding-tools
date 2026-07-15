# Studio Run Saved Config Reconciliation

## Why

A saved configuration selected in Studio must remain the configuration that
Run in Game loads. The discovery record contains file metadata and parsed setup
values in addition to its identity; passing that enriched record into the
closed launch identity silently normalized the selection away.

## Product Contract

- A selected saved configuration crosses the launch boundary as exactly
  `id`, `displayName`, `fileName`, and `path`.
- Parsed setup and player values remain sibling authored state. They never
  widen the saved-config identity.
- The package-owned control-oRPC lifecycle loads the selected file once, then
  reconciles the stable generated mod, reads the stable map row, applies and
  reads back setup, starts once, and attests the loaded game.
- Freshness belongs to generated/deployed bytes, digests, and request
  correlation. The map row remains
  `{mod-swooper-studio-run}/maps/studio-run.js`.
- Mutation is never retried and Civilization VII is never restarted to make
  the saved configuration visible.

## Ownership

Studio owns saved-config selection and the correlated product operation.
Control-oRPC owns the exact-once stateful lifecycle. Direct-control owns only
the one-wire commands and observations used by that lifecycle.

## Boundaries

Do not add another setup strategy, direct-control aggregate, oRPC procedure,
Studio-local control sequence, saved-file patcher, broad mod inventory, retry,
or process restart. Enrichment fields must not enter the closed saved-config
identity or cause a selected config to become no selection.

## Verification

Static tests prove exact projection, preserved file-derived options, strict
normalization, selection/drift behavior, lifecycle ordering, and no replay. A
rendered request selects one currently enumerated `.Civ7Cfg`, retains that
identity through the request, and completes against the stable generated row
in the same Civ7 process.
