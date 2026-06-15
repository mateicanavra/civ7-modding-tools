# D0 Review Disposition Ledger

Status: accepted; no open P1/P2; restack adoption reviewed
Date: 2026-06-14; restack adoption update 2026-06-15

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
| D0-R11 | Restack adoption | D0 workstream records still described the current implementation base as a pre-Nx authoring branch after the runtime stack was restacked onto Habitat/Nx `main`. | P1 | accepted, repaired | Updated phase record, closure checklist, artifact classification, and baseline oracle text to preserve June 14 evidence as historical and record the June 15 adopted Nx/Habitat baseline proof. |
| D0-R12 | Graphite accounting | Several packet branch names currently point at the same packet-authority commit and the runtime stack has no remote upstream refs in this clone. | P2 | accepted, tracked | No branch rename, fold, combine, or unusual topology rewrite is allowed here. Recheck Graphite state before submit/handoff and use Graphite-native stack submission; treat shared commit pointers as an accounting caveat, not an implementation blocker. |
| D0-R13 | Habitat/Nx gate | Habitat classify for the D0 workstream reports root `bun run lint`; the full lint gate is non-green on the adopted baseline. | P2 | accepted, tracked | Record non-green lint honestly. `@mateicanavra/civ7-sdk:habitat:check` fails `grit-sdk-mapgen-entrypoint`; `@internal/habitat-harness:habitat:check` fails `workspace-entrypoints`. The committed `deploy.ts` Biome formatting failure was repaired in this alignment slice. |

## Required Fresh Reviews

- Architecture/baseline review accepted.
- Dev-platform/Nx/Biome/GritQL scout review dispositioned.
- Testing-design review accepted.
- Adversarial orphan/complexity review accepted.
- Restack adoption review: accepted after current worktree, Graphite stack, local Nx, project metadata, and strict D0 OpenSpec validation were rechecked on 2026-06-15.
- Graphite topology sidecar review: accepted with no P1; D0-R12 remains a submit/handoff accounting caveat.
- Habitat/Nx gate review: accepted with D0-R13 tracked as non-green root lint, while affected OpenSpec validation, `mapgen-studio:check`, build, and direct Biome checks pass.
