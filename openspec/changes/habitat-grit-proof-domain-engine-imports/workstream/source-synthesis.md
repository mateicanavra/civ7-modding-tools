# Source Synthesis - Domain Engine Imports Candidate

## Row Obligation

Domain ops should not import MapGen engine entrypoints as runtime values. The
candidate is limited to domain-op `.ts` files under
`mods/mod-swooper-maps/src/domain/**/ops/**/*.ts` and exact sources
`@swooper/mapgen-core/engine` and `@mapgen/engine`.

## Normative And Proving Sources

- `scripts/lint/lint-domain-refactor-guardrails.sh` is the proving source for
  the retired full-profile checks: all engine imports and non-type engine
  imports in domain ops.
- `grit-pattern-corpus-ledger.md` identifies the candidate row and requires
  non-type positives, type-only controls if allowed, parser-edge import forms,
  current scan, and non-apply disposition.
- `taxonomy.md` and `invariant-corpus.md` support the domain/runtime owner
  boundary.

## Current Predicate Blocker

The product distinction is value import versus type-only import. Current Grit
attempts could not prove that distinction safely:

- structural import patterns reported pure type-only controls;
- text guards on the import node did not eliminate those false positives;
- PCRE-style lookahead needed for the retired shell check is unsupported in
  native Grit regex;
- regex alternatives without lookahead did not match the positive samples.

The row therefore records a blocker and leaves the candidate unregistered.

## Current Corpus

The parser inventory found 574 current-predicate domain-op `.ts` files and 0
exact engine import/export/dynamic/source-lookalike candidates. That is a
current-source inventory fact only. It does not prove native Grit enforcement
and does not create a baseline or injected probe for an unregistered candidate.

## Non-Claims

This checkpoint does not claim native positive fixture proof,
Habitat wrapper/current-tree proof, raw Grit acquisition, baseline behavior,
injected cleanup/path-control, apply safety, classify/generator behavior,
retired parity, broader domain-refactor closure, or product/runtime proof.
