# Change: Deep Habitat Effect Docs Check Owner Split

## Why

`docs-local-checkout-paths` is documentation hygiene, not source architecture.
Keeping it in `source-check` forced Markdown files and `docs/**` traversal into
the source architecture catalog, slowing local checks and making source-check
own a rule outside its domain.

## What Changes

- Move `docs-local-checkout-paths` from `source-check` to `command-check`.
- Add a docs lint script that emits path/line diagnostics for local checkout
  docs references.
- Preserve the docs rewrite Grit apply pattern while deleting the stale
  duplicate check pattern.
- Remove Markdown from source-check candidate extensions.
- Preserve advisory behavior and per-file diagnostics for the docs rule.

## Non-Goals

- Do not remove the existing advisory docs findings in this slice.
- Do not remove the docs rewrite apply pattern.
- Do not rewrite the whole source-check indexing engine.

## Validation

- `bun run --cwd tools/habitat-harness test -- test/rules/registry/contract.test.ts test/rules/registry/facts.test.ts`
- `bun run --cwd tools/habitat-harness validate:grit-patterns`
- `bun tools/habitat-harness/bin/dev.ts check --rule docs-local-checkout-paths --json`
- `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
