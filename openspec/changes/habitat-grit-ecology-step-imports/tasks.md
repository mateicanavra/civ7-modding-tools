## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm ecology step import/topology authority from `rules.json`,
  Swooper package targets, AGENTS routers, the package test, and ecology
  architecture records.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-ecology-step-imports` is registered as an enforced
  Habitat wrapped-test rule.
- [x] 2.2 Confirm the rule detect command is the package-owned Nx target
  `mod-swooper-maps:test:architecture-ecology-step-imports`.
- [x] 2.3 Repair the test so static import and re-export forms from
  `@mapgen/domain/ecology/ops` and `@mapgen/domain/ecology/rules` report.
- [x] 2.4 Preserve the retired ecology topology directory proof.
- [x] 2.5 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.6 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for ecology step imports.

## 3. Verification

- [x] 3.1 `nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`
- [x] 3.2 `bun run habitat:check -- --json --rule arch-test-ecology-step-imports`
- [x] 3.3 `bun run habitat:check -- --json --tool wrapped-test` records ecology
  step imports, map-bundle runtime imports, all wrapped-test rules, and
  `baseline-integrity` passing from the corrected current HG head.
- [x] 3.4 Deterministic source inventory records current ecology stage counts
  and zero forbidden static import/re-export findings.
- [x] 3.5 Deterministic wrapped-test baseline inventory includes the ecology
  step imports baseline.
- [x] 3.6 `bun run openspec -- validate habitat-grit-ecology-step-imports --strict`
- [x] 3.7 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.8 `bun run openspec:validate`
- [x] 3.9 `git diff --check`
- [x] 3.10 `git ls-files --deleted`
- [x] 3.11 Commit via Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No source remediation is claimed.
- [x] 4.3 No dynamic import, source-string, broad domain import normalization,
  or product/runtime proof is claimed.
- [x] 4.4 No ecology-owned generated-output freshness repair is claimed;
  aggregate wrapped-test success is inherited from accepted downstack repair.
- [x] 4.5 No apply safety, classify/generator behavior, or retired parity proof
  is claimed.
