# D1 Packet Residue Ledger

Status: active packet residue classified
Date: 2026-06-14

This ledger classifies terms that appear in D1 packet scans but are not active target surfaces. D1 is a forward packet for the accepted Nx/Habitat baseline. Historical S1.1a artifacts remain as evidence of the original failure and proof, not as implementation authority.

## Active Target Authority

- `proposal.md`, `design.md`, `tasks.md`, and `specs/mapgen-studio/spec.md` define the implementation target.
- `packet-phase-record.md`, `packet-review-disposition-ledger.md`, `packet-closure-checklist.md`, and this ledger define packet governance.
- The final deploy command owner is the accepted Nx/Habitat baseline, routed through the mod package's dedicated `build:studio-deploy` target.
- Turbo-era `--only` commands are not an active D1 target.
- Watch ignores are guardrails only; daemon import graph isolation is the system invariant.

## Historical Evidence

These files predate the D1 packet rewrite and record S1.1a closure evidence:

- `workstream/phase-record.md`
- `workstream/review-disposition-ledger.md`
- `workstream/closure-checklist.md`

They may mention Turbo-era commands, historical live proof values, or completed hotfix gates. Those entries explain the failure mode and previous proof. They do not override the active packet target.

## Shortcut Scan Disposition

| Signal | Classification | Disposition |
| --- | --- | --- |
| `Turbo`, `turbo`, `--only` in active packet files | Historical/pre-Nx evidence only | Accept only when wording explicitly says it is not the final command path. |
| `Turbo`, `turbo`, `--only` in historical workstream files | Historical closure record | Accept as evidence; do not use as implementation authority. |
| `fallback`, `shim`, `temporary`, `dual path`, `support both`, `support-both`, `optional target shape`, `only if needed`, `only-if-needed`, `for now` | Forbidden target pattern | Any active target use is a packet blocker unless it appears inside a negative policy statement. |
| `watch-ignore-only` | Forbidden target pattern | Accept only as rejected design language. |

## Reviewer Instruction

Reviewers should judge D1 by active target authority, then verify that historical residue is clearly quarantined. If an implementer could reasonably copy a historical command as the target command, this packet is not accepted.
