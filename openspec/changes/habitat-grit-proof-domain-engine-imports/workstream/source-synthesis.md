# Source Synthesis - Domain Engine Imports Active Check

## Row Obligation

Domain ops should not import MapGen engine entrypoints as runtime values. The
active row is limited to domain-op `.ts` files under
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts` and exact sources
`@swooper/mapgen-core/engine` and `@mapgen/engine`.

## Normative And Proving Sources

- `scripts/lint/lint-domain-refactor-guardrails.sh` is the proving source for
  the retired full-profile checks: all engine imports and non-type engine
  imports in domain ops.
- `grit-pattern-corpus-ledger.md` identifies the active row and requires
  non-type positives, type-only controls if allowed, parser-edge import forms,
  current scan, and non-apply disposition.
- `taxonomy.md` and `invariant-corpus.md` support the domain/runtime owner
  boundary.

## Predicate Repair

The product distinction is value-bearing static import versus pure type-only
import. The prior checkpoint could not prove that distinction safely, but the
current predicate repairs the active subset with AST
`import_statement(source=$source)` binding and full-statement type-only guards:

- value/default, namespace, side-effect, and value-first mixed value/type static
  imports from exact engine sources report;
- pure `import type` declarations do not report;
- proven single-line inline type-only `import { type ... }` declarations do not
  report.

This row does not claim export-from, dynamic import, source-string, or broader
inline type-only formatting closure.

## Current Corpus

The parser inventory found 574 current-predicate domain-op `.ts` files, 1,258
current-predicate import declarations, and 0 exact engine import/export/dynamic
or source-lookalike candidates.

## Non-Claims

This checkpoint does not claim export-from closure, dynamic import closure,
source-string closure, multiline/alternate-whitespace inline type-only closure,
raw Grit acquisition, source remediation, apply safety, classify/generator
behavior, retired parity, broader domain-refactor closure, or product/runtime
proof.
