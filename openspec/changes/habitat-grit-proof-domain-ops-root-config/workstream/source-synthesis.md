# Source Synthesis - Domain Ops Root Config

## Authority

- `rules.json` registers `grit-domain-ops-root-config` as an enforced
  `grit-check` scoped to
  `mods/mod-swooper-maps/src/domain/**/ops/**/*.ts`.
- `lint-domain-refactor-guardrails.sh` records the legacy boundary-profile
  root-config import check for domain ops.
- `invariant-corpus.md` records the domain-refactor guardrail as a wrapped
  invariant whose boundary profile keeps domain ops separate from adapter,
  context, map projection, and root config ownership.
- `architecture-normalization-packet.md` says normalized domains should produce
  typed domain truth and receive normalized config instead of reaching into
  composition surfaces.
- `injected-probes.json` has a positive dynamic import op probe and non-op
  path control for this row's injected proof.

## Current Predicate

The native predicate reports module edges from Swooper domain-op `.ts` paths
whose source is `config.js` through two-or-more parent traversal.

It reports default, named, namespace, type-only, side-effect, and single-quoted
import spellings, plus named re-exports, star re-exports, and dynamic
string-literal imports in those supported source classes.

It does not report:

- local `./config.js`;
- one-parent `../config.js`;
- non-op domain paths;
- other mods;
- `.tsx`;
- recipe paths;
- extensionless or JSON config paths;
- one-parent re-export forms;
- one-parent or JSON dynamic imports;
- source strings.

## Live Inventory

The parser inventory over `mods/mod-swooper-maps/src/domain` found:

- 664 scanned TS/TSX/JSON files;
- 574 current-predicate domain-op `.ts` files;
- 1,258 current-predicate import declarations;
- 0 upward root-config imports at any depth;
- 276 current export-from declarations;
- 0 upward root-config export-froms;
- 0 dynamic imports;
- 0 upward root-config dynamic imports;
- 5,355 source strings;
- 0 upward root-config source strings;
- 0 parse diagnostics.

This supports a live zero-candidate checkpoint for the current predicate. It
does not prove raw direct Grit acquisition, source remediation, baseline
mutation, classify/generator behavior, apply safety, retired parity,
non-string dynamic import closure, broader domain-refactor closure, or
product/runtime behavior.
