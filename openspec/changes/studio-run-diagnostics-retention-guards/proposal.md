# Studio Run Diagnostics Retention And Structural Closure

## Why

The architecture closes when diagnostics retention is deliberate and permanent
structural assertions protect the new runtime/materialization topology. This
packet does not carry primary deletion work. Each prior packet already replaced
and removed the old owner it touched. This packet records retention and installs
the positive authority rules that make the new shape durable.

## System Context

Affected owners:

- request workspace cleanup
- diagnostics lookup and copy-diagnostics
- structural authority rows SA-01 through SA-14
- final OpenSpec/workstream closure ledgers

## Before And After

Before:

- diagnostics/workspace retention is not one explicit policy;
- structural recurrence risk depends on reviewer memory or behavior tests.

After:

- request workspaces, diagnostics, and attribution are retained for 72 hours and
  at least the latest 100 terminal operations;
- cleanup runs at daemon startup and terminalization;
- cleanup never deletes active operations;
- permanent topology is enforced by structural authority rows SA-01 through
  SA-14;
- temporary packet-local patterns are promoted or removed.

## Behavior Verification

Behavior tests verify retention cleanup behavior: active workspaces are kept,
old terminal workspaces are removed after policy limits, latest 100 terminal
operations are retained by terminal timestamp with request-id tie-breaker, and
diagnostics lookup behaves correctly before and after cleanup.

## Structural Enforcement

Permanent positive assertions are exactly the structural authority rows in
`structural-authority-matrix.md`.

Temporary Grit patterns used during migration must have an explicit removal or
promotion decision before this packet closes.

## Verification Gates

- Retention behavior tests.
- Copy-diagnostics behavior tests after cleanup.
- SA-14 `habitat-studio-run-runtime-authority-closure` verifies SA-01 through
  SA-13 and temporary pattern disposition.
- `bun run openspec:validate`.
- Live Run in Game verification from `target-vocabulary.md`.
- Final packet-set review has no unresolved P1/P2 findings.
