## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm map-bundle runtime-import authority from `rules.json`,
  Swooper package metadata, AGENTS routers, accepted generated-output
  freshness/enforcement context, and the package architecture test.
- [x] 1.3 Select `wrapped-test` owner layer rather than registering a new Grit
  check.

## 2. Executable Surface

- [x] 2.1 Confirm `arch-test-map-bundle-runtime-imports` is registered as an
  enforced Habitat wrapped-test rule.
- [x] 2.2 Add and prove the package-owned Nx target
  `mod-swooper-maps:test:architecture-map-bundle-runtime-imports`.
- [x] 2.3 Route the Habitat rule detect command through the package-owned Nx
  target with `nxTarget` metadata, not a raw `bun test` file command.
- [x] 2.4 Confirm the package target runs
  `test/build/map-bundle-runtime-imports.test.ts` after `build`.
- [x] 2.5 Confirm explicit empty Habitat baseline exists for the wrapped-test
  rule.
- [x] 2.6 Do not register a `grit-check` rule, Grit baseline, or injected Grit
  probe for map bundle runtime imports.

## 3. Verification

- [x] 3.1 `nx run mod-swooper-maps:test:architecture-map-bundle-runtime-imports --outputStyle=static --skip-nx-cache`
- [x] 3.2 `bun run nx run @internal/habitat-harness:build --outputStyle=static --skipNxCache`
- [x] 3.3 `bun run habitat:check -- --json --rule arch-test-map-bundle-runtime-imports`
- [x] 3.4 `bun run habitat:check -- --json --tool wrapped-test` records all
  seven wrapped-test rules plus `baseline-integrity` passing from the corrected
  current HG head.
- [x] 3.5 Deterministic map-bundle test/source inventory records test source
  counts, present generated map bundle envelope, and no parse diagnostics.
- [x] 3.6 Deterministic wrapped-test baseline inventory includes the
  map-bundle runtime-import baseline.
- [x] 3.7 `bun run openspec -- validate habitat-grit-map-bundle-runtime-imports --strict`
- [x] 3.8 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 3.9 `bun run openspec:validate`
- [x] 3.10 `git diff --check`
- [x] 3.11 `git ls-files --deleted`
- [x] 3.12 Commit via local Graphite with clean worktree.

## 4. Non-Claims

- [x] 4.1 No active Grit check, Grit baseline, native Grit fixture, or injected
  Grit probe is claimed.
- [x] 4.2 No generated-output hand edits or source remediation are claimed.
- [x] 4.3 No row-owned broad generated-output freshness repair or
  product/runtime proof is claimed.
- [x] 4.4 No apply safety, classify/generator behavior, hook/CI proof, or
  retired parity proof is claimed.
