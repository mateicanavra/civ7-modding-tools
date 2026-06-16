## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm core purity authority from `rules.json`, MapGen core package
  targets, AGENTS routers, invariant corpus, and the owning package test.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-core-purity` is registered as an enforced Habitat
  wrapped-test rule.
- [x] 2.2 Confirm the rule detect command is the package-owned Nx target
  `@swooper/mapgen-core:test:architecture-core-purity`.
- [x] 2.3 Confirm the boundary test scans production MapGen core source for
  Civ7 runtime value references and excludes `src/dev`.
- [x] 2.4 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.5 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for core purity.

## 3. Verification

- [x] 3.1 `nx run @swooper/mapgen-core:test:architecture-core-purity --outputStyle=static`
- [x] 3.2 `bun run habitat:check -- --json --rule arch-test-core-purity`
- [x] 3.3 `bun run habitat:check -- --json --tool wrapped-test` originally
  recorded core purity passing with a separate Swooper map bundle freshness
  blocker; current aggregate wrapped-test health is superseded by the accepted
  map-bundle/downstack freshness repair.
- [x] 3.4 Deterministic source inventory records current production core source
  counts and zero runtime-value candidates.
- [x] 3.5 Deterministic wrapped-test baseline inventory includes the core
  purity baseline.
- [x] 3.6 `bun run openspec -- validate habitat-grit-core-purity-wrapped-test --strict`
- [x] 3.7 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
- [x] 3.10 `git ls-files --deleted`
- [x] 3.11 Commit via Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No source remediation is claimed.
- [x] 4.3 No MapGen core Grit import-predicate repair or adapter type-import
  policy closure is claimed.
- [x] 4.4 No Swooper map bundle freshness repair ownership is claimed by this
  core-purity row.
- [x] 4.5 No apply safety, classify/generator behavior, retired parity, or
  product/runtime proof is claimed.
