# Change: Deep Habitat Effect Source Check Derived Cache

## Why

Source-check now plans files before reading and avoids docs hygiene, but the
policy module still recomputes common AST-derived facts per rule. A single file
can be checked by many rules, so imports, identifiers, calls, property accesses,
string literals, and object properties should be derived once per file.

## What Changes

- Add a per-file derived fact cache inside the source-check policy module.
- Cache import/export refs, call expressions, property accesses, identifiers,
  string literals, object property facts, and exported const names.
- Keep rule diagnostics and selected rule behavior unchanged.

## Non-Goals

- Do not regenerate the source-check policy module.
- Do not add structural topology tests.
- Do not change rule metadata or baselines.

## Validation

- `node --check .habitat/source-check/source-rules.mjs`
- `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- `bun run openspec -- validate deep-habitat-effect-source-check-derived-cache --strict`
