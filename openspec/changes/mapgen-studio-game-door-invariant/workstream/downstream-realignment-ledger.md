# D12 Final Residue And Realignment Ledger

Status: accepted packet ledger
Date: 2026-06-14

## Final Outputs D12 Must Produce

| Output | Purpose | Required evidence |
| --- | --- | --- |
| Game-door invariant doc | evergreen ownership rule | doc path and review |
| Direct-control constructor guard | prevent unsanctioned session owners | guard test command and allowlist |
| Control-oRPC runtime surface ledger | no unclassified game-action/effect surface | ledger path and classifications |
| Public/manual status endpoint ledger | retained endpoints split by authority: diagnostic read, mutation-state read/projection, identity read | endpoint list, consumer, deletion/classification |
| TypeBox/Zod closeout proof | contract schema substrate uniform | negative search and changed files |
| Tuner-session disposition | no unchecked promises remain | task diff, deferral/product decision |
| Final residue ledger | no orphaned bridge/path remains | negative-search output and classifications |
| Graphite drain proof | stack is closed cleanly | submit/merge/sync commands and branch/worktree state |

## Residue Classification Vocabulary

- `deleted`: symbol/path no longer exists in live code or active target docs.
- `guarded`: symbol/path exists only in guard tests or allowlist docs.
- `diagnostic-read`: retained public/manual request/response read with named
  consumer and no freshness authority.
- `historical-evidence`: old workstream/archival text only.
- `durable-deferral`: canonical deferral with owner, risk, trigger, and re-entry
  action.
- `blocker`: active unclassified residue that prevents D12 closure.

## Surfaces D12 Hands Forward

D12 should leave no downstream OpenSpec packet in this train. Any remaining work
must be one of:

- canonical deferral in `docs/system/DEFERRALS.md`;
- deployment-specific follow-up outside local runtime dev orchestration;
- historical external review/merge state for the Graphite stack, if an audit
  needs to reconstruct how the stack landed;
- a follow-up handoff only if a future repo-state audit contradicts the current
  `origin/main` drain evidence.

Current implementation note: D10 and D11 both handed off live Civ7 proof gaps.
D12 ran those live checks and records the results in the testing and
final-proof ledgers. The final Graphite drain is now reconciled from current
`origin/main` evidence through `#1748`; no downstream runtime-stack work remains
in D12 by default.

## Public/Manual Status Endpoint Rule

Retained status endpoints are not automatically residue. They become blockers
only when they own background freshness, browser recovery, watchdog behavior, or
operation truth. D12 must name every retained status endpoint and classify its
consumer.

The packet corpus lives in `workstream/status-endpoint-corpus.md`.

## Control-oRPC Surface Rule

Control-oRPC procedure keys are package-owned typed read/runtime-support/mutation
surfaces. They are not Studio operation-runtime owners and do not own the daemon
session. The packet corpus lives in
`workstream/control-orpc-surface-corpus.md`.

## D11 Deployment Residue

If Railway or other deployment-only Turbo commands remain after D11, D12 must
classify them as deployment-owned residue or schedule a deployment follow-up.
They cannot be confused with local runtime dev orchestration.

The active local Studio runbook is updated to Nx-native local dev/build
commands. Remaining Turbo mentions under older project issues, resource plans,
and Railway deployment handoff are classified as historical planning or
deployment-owned residue unless a current local-dev command path uses them.
