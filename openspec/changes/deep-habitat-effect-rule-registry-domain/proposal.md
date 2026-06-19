# Change: Deep Habitat Effect Rule Registry Domain

## Why

Rule loading, registry facts, graph facts, and selection currently mix direct
filesystem reads, generic thrown errors, and public barrel leakage. These are
domain decisions, not provider behavior.

## What Changes

- Move rule registry and selection ownership into `src/domains/**`.
- Preserve TypeBox schema validation at registry read edges.
- Route filesystem/config access through Effect services.

## What Does Not Change

- No `.habitat` authored artifact layout change.
- No check rule semantics change.

## Verification

- `bun run openspec -- validate deep-habitat-effect-rule-registry-domain --strict`
- `git diff --check`
