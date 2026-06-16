## 1. Design And Authority

- [x] 1.1 Open the per-row packet before closure claims.
- [x] 1.2 Confirm generated-bundle authority from Intelligence Bridge package
  router, existing Swooper map bundle test, Habitat rule registry, Grit
  generated-root validation, and corpus ledger.
- [x] 1.3 Select wrapped-test owner layer rather than Grit generated-root scan.

## 2. Executable Test Surface

- [x] 2.1 Harden the Intelligence Bridge package test for Node builtin source
  forms and direct-control/runtime transport tokens.
- [x] 2.2 Add a package-owned Nx target for the bundle runtime test that
  depends on this package's build chain.
- [x] 2.3 Make the package bundle build depend on upstream workspace builds so
  generated bundle proof does not read stale workspace exports.
- [x] 2.4 Register
  `arch-test-intelligence-bridge-bundle-runtime-imports` as an enforced
  Habitat wrapped-test rule through that target.
- [x] 2.5 Add explicit empty Habitat baseline for the new wrapped-test rule.
- [x] 2.6 Do not register a `grit-check` rule, Grit baseline, or injected
  probe for generated output.

## 3. Current Bundle Inventory

- [x] 3.1 Run deterministic inventory over the tracked Intelligence Bridge UI
  bundle and present Swooper generated map bundles.
- [x] 3.2 Record zero current Node builtin/runtime token matches in scanned
  present bundles.
- [x] 3.3 Record the Swooper manifest/output mismatch as historical
  generated-output freshness evidence, now superseded by accepted
  map-bundle/downstack freshness repair and never owned by this row.

## 4. Verification

- [x] 4.1 `nx run mod-civ7-intelligence-bridge:test:architecture-bundle-runtime-imports --outputStyle=static`
- [x] 4.2 `bun run habitat:check -- --json --rule arch-test-intelligence-bridge-bundle-runtime-imports`
- [x] 4.3 `bun run habitat:check -- --json --tool wrapped-test` originally
  recorded the separate Swooper generated-output freshness blocker; current
  aggregate wrapped-test health is superseded by the accepted
  map-bundle/downstack freshness repair.
- [x] 4.4 Deterministic baseline inventory includes the new wrapped-test
  baseline.
- [x] 4.5 `bun run openspec -- validate habitat-grit-proof-generated-bundle-node-builtins --strict`
- [x] 4.6 `bun run openspec -- validate habitat-grit-proof-repair --strict`
- [x] 4.7 `bun run openspec:validate`
- [x] 4.8 `git diff --check`
- [x] 4.9 `git ls-files --deleted`
- [x] 4.10 Commit via Graphite with clean worktree.

## 5. Non-Claims

- [x] 5.1 No generated output is hand-edited.
- [x] 5.2 No active Grit check, Grit baseline, or injected Grit probe is
  claimed.
- [x] 5.3 No Swooper map bundle freshness repair ownership is claimed by this
  Intelligence Bridge row.
- [x] 5.4 No apply safety, classify/generator behavior, or product/runtime
  proof is claimed.
