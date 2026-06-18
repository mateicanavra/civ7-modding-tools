# Phase 2 Packet Suite Review Disposition Ledger

This ledger records review findings against the packet suite itself. Accepted
P1/P2 findings block Phase 3 execution until repaired, source-rejected, or moved
outside the closure claim with owner and trigger.

## Fresh Review Findings

Reviewer:
`019ed800-7f16-7d72-a5d4-41bf7dec88b5`

Worktree:
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`

Branch:
`codex/deep-habitat-phase2-prep`

| ID | Severity | Finding | Disposition | Repair Evidence |
| --- | --- | --- | --- | --- |
| PH2-REV-001 | P1 | Preparation provenance named `codex/habitat-fast-lint-checks` while packet drafting is on `codex/deep-habitat-phase2-prep`. | Accepted and repaired. Prep validation is now labeled as preparation evidence only; packet closure must record current-state validation from the packet branch. | `source-authority.md`; this ledger; current-state validation to be recorded before closure. |
| PH2-REV-002 | P1 | G-HOST/D10/D7/D9 ordering was contradictory: D10 appeared as an unblocker for D7/D9 while D7/D9 did not consistently block on D10. | Accepted and repaired. The authoritative DAG is now G-HOST -> D10 -> D7/D9 for generated/protected-zone claims; only evidence investigation may happen before the blocker is satisfied. | `domain-refactor-prep/domino-candidate-ledger.md`; `README.md`; `D7-structural-enforcement-pipeline.md`; `D9-transformation-transaction.md`; `D10-generated-protected-zone-authority.md`; `G-HOST-host-policy-boundary-gate.md`. |
| PH2-REV-003 | P1 | Export policy was dispositioned as "Tracked" despite review rules requiring a real disposition. | Accepted and repaired. R0-006 is now a Phase 2 stop condition; D0 requires an export matrix before internal movement. | `domain-refactor-prep/review-disposition-ledger.md`; `D0-scenario-public-contract-inventory.md`. |
| PH2-REV-004 | P2 | Automatic packetization conflicts with packet minimization, especially D14 and D15. | Accepted and repaired. The suite now has a packetization decision table and D15 is explicitly trigger-only. | `README.md`; `D15-execution-provenance-substrate-trigger.md`. |
| PH2-REV-005 | P2 | CLI proof commands are easy to misuse because `-- --json` fails while direct `--json` is accepted. | Accepted and repaired in packet requirements. D0 requires root-script vs direct-Oclif invocation matrix; shared closure requires exact commands and expected exits. | `D0-scenario-public-contract-inventory.md`; `README.md`. |
| PH2-REV-006 | P2 | Packet proof cells need sharper command/proof templates, including exact commands, expected exit status, fixture or injected-bad-case shape, cache/freshness stance, proof labels, and non-claims. | Accepted and repaired. Every packet now has a `Validation Commands / Proof Template` section and the shared closure requirement remains in the suite index. | `D0-scenario-public-contract-inventory.md` through `D15-execution-provenance-substrate-trigger.md`; `G-HOST-host-policy-boundary-gate.md`; `README.md`. |
| PH2-REV-007 | P1 | G-HOST's D2 dependency was inconsistent: some records implied G-HOST starts after D0-D2 while G-HOST itself was blocked only by D0/D1. | Accepted and repaired. G-HOST consistently starts after D0/D1 while D2 proceeds in parallel; D10 is the packet that waits for both G-HOST and D2. | `domain-refactor-prep/domino-candidate-ledger.md`; `README.md`; `G-HOST-host-policy-boundary-gate.md`. |
| PH2-REV-008 | P2 | D0 lacked a packet-level cache/freshness stance covering every command in its proof template. | Accepted and repaired. D0 now states fresh execution requirements for git status, entrypoint tests, and classify, with Nx cache allowed only for lint when matching inputs are recorded. | `D0-scenario-public-contract-inventory.md`. |
| PH2-REV-009 | P2 | D15 used a placeholder consuming-packet command instead of exact commands and expected statuses. | Accepted and repaired. D15 now names the D6/D7/D9/D11 trigger commands and makes consuming-packet ownership a note rather than a command row. | `D15-execution-provenance-substrate-trigger.md`. |
