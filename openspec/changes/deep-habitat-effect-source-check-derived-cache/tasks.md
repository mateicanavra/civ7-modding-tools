# Tasks

## 1. Implementation

- [x] 1.1 Add a per-file cache for source-check derived facts.
- [x] 1.2 Route import/export refs through the cache.
- [x] 1.3 Route call expressions, property accesses, identifiers, string
  literals, object properties, and exported const names through the cache.
- [x] 1.4 Remove duplicate uncached helper implementations.

## 2. Verification

- [x] 2.1 `bun run biome check --write .habitat/source-check/source-rules.mjs`
- [x] 2.2 `node --check .habitat/source-check/source-rules.mjs`
- [x] 2.3 `bun tools/habitat-harness/bin/dev.ts check --tool source-check --json`
- [x] 2.4 `bun run openspec -- validate deep-habitat-effect-source-check-derived-cache --strict`
- [x] 2.5 `bun run --cwd tools/habitat-harness check`
- [x] 2.6 `bun run biome:ci`
- [x] 2.7 `git diff --check`

## 3. Follow-Up Dominoes

- [ ] 3.1 Split source-check candidate extensions by rule family.
- [ ] 3.2 Add source-check profile spans for policy load, root traversal, file
  reads, AST parse count, and rule dispatch count.
- [ ] 3.3 Move source-check policy authoring toward generated predicate tables.
