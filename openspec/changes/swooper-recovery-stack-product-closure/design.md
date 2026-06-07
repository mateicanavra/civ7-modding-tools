## Design

Closure is a reconciliation slice. It changes state records, branch/PR state,
and durable downstream docs only after proof work has actually closed.

## Closure Ledger

The closure packet must list:

- branch, commit, Graphite parent, submit/PR state;
- completed proof changes and proof-class labels;
- targeted repairs opened, closed, or not activated;
- accepted/rejected/deferred findings;
- remote predecessor branches/PRs and disposition;
- dirty worktree audit;
- downstream docs/tests/guards patched or explicitly not patched.

## Promotion Rules

Stable product/architecture learning moves to the correct canonical surface.
Phase-local facts stay in OpenSpec workstream records. Historical handoff docs
remain evidence, not active state.

## Review Lanes

- Proof-ledger audit.
- Graphite/remote branch audit.
- Downstream docs/guards audit.
- Supervisor DRA audit after implementation categories begin.
