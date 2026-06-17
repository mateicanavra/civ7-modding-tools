# Source Synthesis - Domain Ops Boundary Imports

## Authority

- `rules.json` registers `grit-domain-ops-boundary-imports` as an enforced
  `grit-check` scoped to
  `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.
- `lint-domain-refactor-guardrails.sh` boundary profile scans domain ops for
  adapter/context crossing text: `ExtendedMapContext`, `context.adapter`, and
  `@civ7/adapter`.
- `invariant-corpus.md` records the domain-refactor guardrail as a wrapped
  invariant whose boundary profile keeps domain ops pure.
- `taxonomy.md` records `@civ7/adapter` as the adapter owner layer.
- `injected-probes.json` already has a positive op probe and non-op path
  control for this row's shared injected-probe API inventory.

## Current Predicate

The repaired native predicate reports:

- imports from source strings matching `@civ7/adapter` but not adapter-name
  lookalikes;
- side-effect imports from adapter sources;
- named and star re-exports from adapter sources;
- `ExtendedMapContext` identifiers;
- `.adapter` property accesses in Swooper domain-op `.ts` paths.

It does not report:

- non-op domain paths;
- other mods;
- `.tsx`;
- source strings;
- `@civ7/adapterish` lookalikes;
- `["adapter"]` element access;
- dynamic imports.

Dynamic import and element access are recorded parser-edge non-claims for this
checkpoint. The broader legacy text guard would see `@civ7/adapter` in any text
form, but this row proves the current Grit predicate only.

## Live Inventory

The parser inventory over `mods/mod-swooper-maps/src/domain` found:

- 664 scanned TS/TSX/JSON files;
- 574 current-predicate domain-op `.ts` files;
- 1,255 current-predicate import declarations;
- 295 current-predicate export-from declarations;
- 136 current-predicate export-star declarations;
- 0 current-predicate dynamic imports;
- 0 current adapter import/re-export/dynamic candidates;
- 0 current `ExtendedMapContext` identifiers;
- 0 current `.adapter` property accesses;
- 0 current `["adapter"]` element accesses;
- 0 current adapter source lookalikes;
- 48 out-of-predicate `ExtendedMapContext` identifiers and 29 out-of-predicate
  `.adapter` property accesses, all in non-op narrative source;
- 0 parse diagnostics.

This supports a live zero-candidate checkpoint for the current predicate. It
does not prove Habitat wrapper behavior, raw direct Grit acquisition, injected
cleanup, baseline behavior, apply safety, retired parity, broader
domain-refactor closure, or product/runtime behavior.
