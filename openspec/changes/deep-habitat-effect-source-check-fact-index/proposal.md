# Change: Deep Habitat Effect Source Check Fact Index

## Why

Habitat source-check is now the fast local rule lane for AI-native repository
structure. Its current runtime still lets each helper own separate AST walks,
so a single checked file can be re-traversed for imports, identifiers, calls,
properties, strings, exports, and specialized rule helpers. That keeps the
rule modules small, but it makes the substrate do repeated work.

## What Changes

- Build one source-check fact index per parsed file.
- Route common runtime helpers through the shared per-file fact index.
- Preserve the source-check rule module contract and diagnostic output.
- Keep text-only rules text-only; parsing remains lazy for TypeScript-like
  files.

## Non-Goals

- Do not change source-check rule registry metadata.
- Do not rewrite generated rule modules.
- Do not add topology tests for runtime structure.
- Do not change Grit, Biome, Nx, or hook policy in this slice.

## Validation

- Focused source-check runtime tests must pass.
- Live `habitat check --tool source-check --json` must stay green and should
  report a lower source-check shared duration than the pre-change baseline.
- Habitat package check, OpenSpec validation, Biome, and whitespace checks must
  pass.
