# Change: Deep Habitat Effect Record Authority Repair

## Why

The Effect-first refactor cannot safely continue while D14A/D14/D15 and
downstack preparation records can be mistaken for current stack truth. The
controlling backlog identifies stale phase evidence, missing D14A workstream
records, and provenance paths that still read like executable authority.

## What Changes

- Reconcile stack-tip status across packet index rows, D0/public-surface rows,
  D14A workstream records, and the Effect-first repair backlog.
- Add missing D14A adjacent workstream artifacts: phase record, review
  disposition ledger, downstream realignment ledger, and closure checklist.
- Mark historical checkout/worktree paths as provenance-only.
- Record exact Graphite stack, command status, cache/freshness stance, and
  non-claims for the repaired records.

## What Does Not Change

- No Habitat source behavior changes.
- No historical OpenSpec records are rewritten to pretend old work happened in
  the new order.
- No D15 trigger is opened by this records packet.

## Affected Owners

- `docs/projects/habitat-harness/**`
- `openspec/changes/deep-habitat-d14a-authored-artifact-authority/workstream/**`
- This change's OpenSpec packet.

## Stop Conditions

- Stack state cannot be reconciled from `gt log short --stack`.
- A D14A closure claim lacks exact command evidence or non-claim boundaries.
- A record update would conflict with source status on the stack tip.

## Verification

- `gt log short --stack`
- `git status --short --branch`
- `bun run openspec -- validate deep-habitat-effect-record-authority-repair --strict`
- `bun run openspec:validate`
- `git diff --check`
