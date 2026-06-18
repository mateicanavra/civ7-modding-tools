# Tasks

## 1. Source And Contract Inventory

- [x] 1.1 Re-check repo state, Graphite stack, and live watcher/control artifacts.
- [x] 1.2 Inventory CLI verbs, flags, output modes, and invocation examples.
- [x] 1.3 Inventory command JSON/receipt DTOs.
- [x] 1.4 Inventory `package.json` exports and `src/index.ts` exports.
- [x] 1.5 Inventory root scripts, inferred Nx targets, generator schemas, and Husky hook delegators.

## 2. D0 Artifacts

- [x] 2.1 Add the D0 public contract matrix.
- [x] 2.2 Add OpenSpec proposal, design, spec delta, tasks, phase record, review ledger, and downstream realignment ledger.
- [x] 2.3 Link the matrix from Habitat implemented-surface docs.
- [x] 2.4 Record the `--` forwarding ambiguity as a product contract issue.

## 3. Review

- [x] 3.1 Run API/CLI contract review.
- [x] 3.2 Run TypeScript public-surface review.
- [x] 3.3 Run product scenario review.
- [x] 3.4 Run stale docs/downstream review.
- [x] 3.5 Disposition every accepted P1/P2 finding.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate deep-habitat-d0-public-contract-inventory --strict`
- [x] 4.2 `bun run openspec:validate`
- [x] 4.3 `bun run --cwd tools/habitat-harness test -- test/commands/habitat-entrypoints.test.ts`
  - Result after dependency/build grounding: exit 0.
- [x] 4.4 `bun run habitat classify tools/habitat-harness/src/plugin.js`
- [x] 4.5 Unsupported generator refusal receipt:
  `bun run nx g @internal/habitat-harness:project unsupported-d0-probe --kind=mod --dry-run`
- [x] 4.6 `bun run lint`
- [x] 4.7 `git diff --check`

## 5. Closure

- [x] 5.1 Update verification results in `workstream/phase-record.md`.
- [x] 5.2 Ensure review ledger has no unresolved accepted P1/P2 findings.
- [x] 5.3 Ensure downstream realignment ledger is accurate.
- [x] 5.4 Commit through Graphite with clean worktree.
- [x] 5.5 Submit the D0 Graphite branch.
- [x] 5.6 Ask supervisor/product authority for D0 approval before starting D1.
