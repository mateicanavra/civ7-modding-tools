## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm cutover authority from `rules.json`, Swooper Maps package
  target, invariant corpus, and the four cutover tests.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-cutover` is registered as an enforced Habitat
  wrapped-test rule.
- [x] 2.2 Confirm the rule detect command is the package-owned Nx target
  `mod-swooper-maps:test:architecture-cutover`.
- [x] 2.3 Confirm the target runs the no-shim, no-dual-contract-path,
  foundation-topology, and no-op-calls-op tectonics checks.
- [x] 2.4 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.5 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for shim/cutover terms.

## 3. Verification

- [x] 3.1 `nx run mod-swooper-maps:test:architecture-cutover --outputStyle=static`
- [x] 3.2 `bun run habitat:check -- --json --rule arch-test-cutover`
- [x] 3.3 `bun run habitat:check -- --json --tool wrapped-test` originally
  recorded cutover passing with a separate Swooper map bundle freshness
  blocker; current aggregate wrapped-test health is superseded by the accepted
  map-bundle/downstack freshness repair.
- [x] 3.4 Deterministic no-shim runtime source inventory records zero current
  term hits over the owning roots.
- [x] 3.5 Deterministic wrapped-test baseline inventory includes the cutover
  baseline.
- [x] 3.6 `bun run openspec -- validate habitat-grit-shim-cutover-terms --strict`
- [x] 3.7 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
- [x] 3.10 `git ls-files --deleted`
- [x] 3.11 Commit via Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No source remediation or natural-language documentation keyword rule
  is claimed.
- [x] 4.3 No Swooper map bundle freshness repair ownership is claimed by this
  cutover row.
- [x] 4.4 No apply safety, classify/generator behavior, retired parity, or
  product/runtime proof is claimed.
