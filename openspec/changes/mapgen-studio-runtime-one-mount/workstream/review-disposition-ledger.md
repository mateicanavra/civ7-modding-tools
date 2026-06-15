# D0 Review Disposition Ledger

Status: accepted; no open P1/P2
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D0-R1 | Dev-platform/Nx scout | Scout report found H1-H3 Nx facts are usable but H4+ Biome/Grit tail is stale relative to current runtime history, so direct restack now is not suitable. | P1 | accepted, repaired | Added `nx-habitat-scout-report.md`; D0 now pulls migrated facts forward and blocks Nx-dependent implementation until the accepted migrated baseline is selected/drained. |
| D0-R2 | Testing/toolchain | OpenSpec CLI initially failed before dependencies were installed in this worktree. | P2 | accepted, repaired | Ran `bun install --frozen-lockfile`; OpenSpec list and strict D0 validation now pass. Packet policy now requires install before trusting validation. |
| D0-R3 | Generated-output hygiene | Root build rewrote tracked generated intelligence-bridge bundle. | P2 | accepted, repaired | Reverted generated build churn; D0 records the side effect and keeps generated output out of packet write set. |
| D0-R4 | Baseline policy | Pre-Nx classification was phrased as a possible implementation path via D11. That creates a hidden legacy lane after the migrated Nx/Habitat stack lands. | P1 | accepted, repaired | Packet train and D0 records now treat pre-Nx as stop/reroute condition for execution, and D11 assumes accepted Nx/Habitat baseline. |
| D0-R5 | Graphite mechanics | D0 evidence omitted the required `gt status` gate. | P2 | accepted, repaired | Ran `gt status`; this CLI falls through to `git status`, so D0 records that caveat and keeps `gt log --no-interactive` as Graphite stack proof. |
| D0-R6 | Authority caveat | Root `AGENTS.md` contains Turbo-era tooling guidance on this authoring branch while D0 cites it as authority. | P3 | accepted, repaired | D0 now states that the root tooling-default line is historical baseline evidence and does not override the accepted Nx/Habitat implementation baseline. |
| D0-R7 | Baseline oracles | D0 recorded OpenSpec/build evidence but not direct one-mount runtime oracles. | P1 | accepted, repaired | Added `baseline-oracle-ledger.md`, ran focused one-mount/daemon tests, recorded retired satellite negative searches and adequacy criteria. |
| D0-R8 | Runtime artifact classification | D0 classified D0-D12 but omitted retained/superseded disposition for preexisting runtime changes such as `mapgen-studio-bun-server` and `mapgen-studio-tuner-session`. | P1 | accepted, repaired | Expanded `artifact-classification-ledger.md` with retained/superseded requirements and owner/re-entry rows. |
| D0-R9 | Generated-output guard | D0 noted generated bundle churn but did not add a closure guard. | P2 | accepted, repaired | `baseline-oracle-ledger.md` now records generated-output disposition; closure checklist requires no tracked generated output in the D0 write set. |
| D0-R10 | One-mount residue | Dedupe/BatchLink and bare 500 deferrals needed explicit downstream ownership. | P2 | accepted, repaired | Added `residue-ledger.md` mapping residue to D3, D9, D11, D12 owners and blocking status. |

## Required Fresh Reviews

- Architecture/baseline review accepted.
- Dev-platform/Nx/Biome/GritQL scout review dispositioned.
- Testing-design review accepted.
- Adversarial orphan/complexity review accepted.
