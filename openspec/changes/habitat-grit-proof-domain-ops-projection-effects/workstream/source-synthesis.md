# Source Synthesis - Domain Ops Projection Effects

## Authority

- `rules.json` registers `grit-domain-ops-projection-effects` as an enforced
  `grit-check` scoped to
  `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.
- `invariant-corpus.md` records the domain-refactor guardrail as a wrapped
  invariant whose boundary profile keeps domain ops separate from map
  projection/effect ownership.
- `architecture-normalization-packet.md` says domain internals should not leak
  engine-facing fields/effects or `artifact:map.*` style handoffs.
- `injected-probes.json` has a positive op probe and non-op path control for
  this row's shared injected-probe API inventory.

## Current Predicate

The native predicate reports string literals matching:

- `artifact:map.<suffix>`;
- `effect:map.<suffix>`;
- the same strings in array elements, property names, import/export sources,
  and dynamic import sources inside Swooper domain-op `.ts` paths.

It does not report:

- domain-owned artifact/effect keys;
- map-key lookalikes without the exact `map.` segment;
- non-op domain paths;
- other mods;
- `.tsx`;
- recipe paths;
- no-substitution template literals.

Template literals are recorded parser-edge non-claims for this checkpoint. The
row proves the current Grit predicate only; it does not prove the full legacy
text-guard profile.

## Live Inventory

The parser inventory over `mods/mod-swooper-maps/src/domain` found:

- 664 scanned TS/TSX/JSON files;
- 574 current-predicate domain-op `.ts` files;
- 547 current-predicate files with string-like literals;
- 5,352 current-predicate string-like literals;
- 0 current `artifact:map.*` candidates;
- 0 current `effect:map.*` candidates;
- 0 current map-key candidates in import, export, dynamic import, property-name,
  array-element, string-literal, or no-substitution-template classes;
- 2 domain-owned artifact controls, both `artifact:resources.groupPlans`;
- 0 current map-key lookalikes;
- 0 out-of-predicate map-key candidates;
- 0 parse diagnostics.

This supports a live zero-candidate checkpoint for the current predicate. It
does not prove Habitat wrapper behavior, raw direct Grit acquisition, injected
cleanup, baseline behavior, classify/generator behavior, apply safety, retired
parity, broader domain-refactor closure, or product/runtime behavior.
