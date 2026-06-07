## 1. Closure Inputs

- [ ] 1.1 Verify exact-authorship, final-surface parity, product acceptance, and
  activated targeted repairs are closed or explicitly out of scope.
- [ ] 1.2 Audit accepted P1/P2 review findings across recovery changes.
- [ ] 1.3 Audit repo, Graphite, PR, and remote predecessor state.

## 2. Reconciliation

- [ ] 2.1 Update stale OpenSpec tasks, phase records, proof ledgers, and review
  disposition ledgers.
- [ ] 2.2 Patch downstream docs/tests/guards only where stable facts changed.
- [ ] 2.3 Record remote predecessor branch/PR disposition after replacement
  durability is explicit.

## 3. Verification And Closure

- [ ] 3.1 Run `git status --short --branch`.
- [ ] 3.2 Inspect Graphite branch/stack state.
- [ ] 3.3 Run `git diff --check`.
- [ ] 3.4 Run `bun run openspec -- validate swooper-recovery-stack-product-closure --strict`.
- [ ] 3.5 Run `bun run openspec:validate`.
- [ ] 3.6 Commit/submit according to Graphite workflow.
