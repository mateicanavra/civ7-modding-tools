# deep-habitat-effect-grit-resource-provider-consolidation

## Why

Habitat should model external tools as explicit Effect capabilities. Before
this change, Grit was the outlier: its implementation lived under
`src/adapters/grit`, Nx projected it as a special `habitat:adapter` layer, and
the package export map preserved `./adapters/*` as an architectural root.

That keeps the old ontology alive. Grit is not a separate kind of Habitat
module. It is a substrate capability: the service/resource contract describes
what Habitat can ask Grit to do, and the provider layer provisions the live or
fake implementation.

## What Changes

- Move the Grit implementation under
  `tools/habitat-harness/src/substrate/providers/grit/**`.
- Flatten the nested Grit provider implementation so the provider root owns the
  Effect tag, live layer, fake layer, request builders, parsing helpers, and
  scan-root helper modules.
- Replace the Habitat-internal `adapter` project with a `provider` project in
  inferred Nx topology and boundary taxonomy.
- Remove the `./adapters/*` package export.
- Update Habitat's GritQL rule metadata so the Grit provider, not a Grit
  adapter, owns the "no product scan roots in tool implementation" invariant.

## Non-Goals

- Do not change the external behavior of `habitat check`, `habitat fix`, hooks,
  transactions, or Grit diagnostics.
- Do not add structure/surface tests. Structure belongs to Nx boundaries,
  Habitat rules, GritQL patterns, Biome, and the public-surface guard.
