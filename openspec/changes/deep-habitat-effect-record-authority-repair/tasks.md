# Tasks

## 1. Reconcile Current Authority

- [ ] 1.1 Capture `gt log short --stack`, branch, and worktree cleanliness in
  the D14A phase record.
- [ ] 1.2 Reconcile D14A packet-index and D0/public-surface matrix rows against
  stack-tip source.
- [ ] 1.3 Mark historical worktree/session paths as provenance-only wherever
  they could be read as current execution authority.

## 2. Add Missing Workstream Bundle

- [ ] 2.1 Add D14A `workstream/phase-record.md`.
- [ ] 2.2 Add D14A `workstream/review-disposition-ledger.md`.
- [ ] 2.3 Add D14A `workstream/downstream-realignment-ledger.md`.
- [ ] 2.4 Add D14A `workstream/closure-checklist.md`.

## 3. Verify

- [ ] 3.1 `bun run openspec -- validate deep-habitat-effect-record-authority-repair --strict`
- [ ] 3.2 `bun run openspec:validate`
- [ ] 3.3 `git diff --check`
- [ ] 3.4 `git status --short --branch`
