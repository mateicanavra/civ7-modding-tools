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
- `injected-probes.json` has a positive op probe and non-op path control for
  this row's shared injected-probe API inventory.

## Current Predicate

The native predicate reports import declarations from Swooper domain-op `.ts`
paths whose source is `config.js` through two-or-more parent traversal.

It reports default, named, namespace, type-only, side-effect, and single-quoted
import spellings in those supported source classes.

It does not report:

- local `./config.js`;
- one-parent `../config.js`;
- non-op domain paths;
- other mods;
- `.tsx`;
- recipe paths;
- extensionless or JSON config paths;
- re-export forms;
- dynamic imports;
- source strings.

Export-from and dynamic-import shapes are current native non-matches in this
checkpoint.

## Live Inventory

The parser inventory over `mods/mod-swooper-maps/src/domain` found:

- 664 scanned TS/TSX/JSON files;
- 574 current-predicate domain-op `.ts` files;
- 1,255 current-predicate import declarations;
- 150 type-only imports;
- 1,105 value imports;
- 0 side-effect imports;
- 6 current local `./config.js` imports;
- 0 one-parent `../config.js` imports;
- 0 extensionless or JSON parent config imports;
- 0 upward root-config imports at any depth;
- 276 current export-from declarations;
- 0 upward root-config export-froms;
- 0 dynamic imports;
- 0 upward root-config dynamic imports;
- 0 source-string lookalikes;
- 0 outside-predicate upward root-config imports;
- 0 parse diagnostics.

This supports a live zero-candidate checkpoint for the current predicate. It
does not prove Habitat wrapper behavior, raw direct Grit acquisition, injected
cleanup, baseline behavior, classify/generator behavior, apply safety, retired
parity, export-from closure, dynamic import closure, broader domain-refactor
closure, or product/runtime behavior.
