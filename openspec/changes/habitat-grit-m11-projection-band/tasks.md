## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm M11 projection-band authority from `rules.json`, Swooper
  package target metadata, AGENTS routers, and the package architecture test.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-m11-projection-band` is registered as an enforced
  Habitat wrapped-test rule.
- [x] 2.2 Confirm the rule detect command is the package-owned Nx target
  `mod-swooper-maps:test:architecture-m11-projection-band`.
- [x] 2.3 Confirm the package target runs
  `test/foundation/m11-projection-boundary-band.test.ts`.
- [x] 2.4 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.5 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for M11 projection band.

## 3. Verification

- [x] 3.1 `nx run mod-swooper-maps:test:architecture-m11-projection-band --outputStyle=static --skip-nx-cache`
- [x] 3.2 `bun run habitat:check -- --json --rule arch-test-m11-projection-band`
- [x] 3.3 `bun run habitat:check -- --json --tool wrapped-test` records all
  seven wrapped-test rules plus `baseline-integrity` passing from the corrected
  current HG head.
- [x] 3.4 Deterministic test inventory records M11 package-test source counts
  and no parse diagnostics.
- [x] 3.5 Deterministic wrapped-test baseline inventory includes the M11
  projection-band baseline.
- [x] 3.6 `bun run openspec -- validate habitat-grit-m11-projection-band --strict`
- [x] 3.7 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
- [x] 3.10 `git ls-files --deleted`
- [x] 3.11 Commit via local Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No source remediation is claimed.
- [x] 4.3 No generated-output freshness ownership, full Foundation topology
  closure, model-wide tectonic correctness, or product/runtime proof is
  claimed.
- [x] 4.4 No apply safety, classify/generator behavior, hook/CI proof, or
  retired parity proof is claimed.
