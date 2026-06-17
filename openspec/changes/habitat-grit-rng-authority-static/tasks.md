## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm RNG authority from `rules.json`, Swooper Maps package
  targets, invariant corpus, taxonomy, and RNG authority tests.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-rng-authority` is registered as an enforced
  Habitat wrapped-test rule.
- [x] 2.2 Confirm the rule detect command is the package-owned Nx target
  `mod-swooper-maps:test:architecture-rng-authority`.
- [x] 2.3 Confirm the boundary test scans standard recipe/domain authored
  generation for engine RNG, ambient random, official generator calls, and
  internal RNG imports.
- [x] 2.4 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.5 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for RNG authority.

## 3. Verification

- [x] 3.1 `nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`
- [x] 3.2 `bun run habitat:check -- --json --rule arch-test-rng-authority`
- [x] 3.3 `bun run habitat:check -- --json --tool wrapped-test` originally
  recorded RNG authority passing with a separate Swooper map bundle freshness
  blocker; current aggregate wrapped-test health is superseded by the accepted
  map-bundle/downstack freshness repair.
- [x] 3.4 Deterministic wrapped-test baseline inventory includes the RNG
  authority baseline.
- [x] 3.5 `bun run openspec -- validate habitat-grit-rng-authority-static --strict`
- [x] 3.6 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.7 `bun run openspec:validate`
- [x] 3.8 `git diff --check`
- [x] 3.9 `git ls-files --deleted`
- [x] 3.10 Commit via Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No source remediation is claimed.
- [x] 4.3 No Swooper map bundle freshness repair ownership is claimed by this
  RNG row.
- [x] 4.4 No apply safety, classify/generator behavior, retired parity, or
  product/runtime proof is claimed.
