# Change: Deep Habitat Effect Diagnostic Pattern Governance

## Why

Diagnostic catalog logic and pattern governance currently sit between rule
metadata, Grit pattern files, command outcomes, and authored artifact policy.
Without a named domain split, provider migration can accidentally make Grit the
owner of Habitat diagnostic identity or make Habitat reimplement Grit semantics.

## What Changes

- Move diagnostic catalog ownership to
  `src/domains/diagnostic-pattern-catalog/**`.
- Move pattern authority, validation, and admissions to
  `src/domains/pattern-governance/**`.
- Preserve Grit as the provider for pattern execution semantics.

## What Does Not Change

- No D14A authored artifact schema changes.
- No Grit pattern semantics are reimplemented.

## Verification

- `bun run openspec -- validate deep-habitat-effect-diagnostic-pattern-governance --strict`
- `git diff --check`
