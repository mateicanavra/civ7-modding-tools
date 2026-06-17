## 1. Source And Contract

- [x] 1.1 Inspect the accepted hook-hardening and pattern-generator contracts.
- [x] 1.2 Identify the hook-owned selection boundary for staged Grit execution.
- [x] 1.3 Preserve non-claims for generator promotion, HG row semantics,
  baseline mutation, CI authority, and product/runtime behavior.

## 2. Implementation

- [x] 2.1 Route pre-commit staged Grit execution through Habitat check instead
  of hook-local raw Grit parsing.
- [x] 2.2 Filter staged Grit execution to rule-pack entries with
  `hookScope: "pre-commit"`.
- [x] 2.3 Preserve exact staged path scan roots inside approved Grit adapter
  roots.
- [x] 2.4 Exclude staged JavaScript/TypeScript paths outside approved Grit roots
  from Grit hook scans while leaving Biome behavior intact.
- [x] 2.5 Preserve fail-closed hook outcomes for adapter parser failures,
  malformed Grit output, and normalized Grit findings.

## 3. Tests And Proof

- [x] 3.1 Add focused hook tests for Habitat check delegation and parse/finding
  handling.
- [x] 3.2 Add focused rule-selection tests for hook-scope filtering and exact
  staged scan roots.
- [x] 3.3 Run focused hook/check-engine tests.
- [x] 3.4 Run package typecheck.
- [x] 3.5 Run controlled staged current-tree proof for a hook-scoped Grit rule.
- [x] 3.6 Run strict OpenSpec validation and aggregate OpenSpec validation.
- [x] 3.7 Run diff hygiene and deleted-file/status guards.

## 4. Closure

- [x] 4.1 Record final verification and proof boundary in the phase record.
- [x] 4.2 Commit through local Graphite with a clean worktree.
