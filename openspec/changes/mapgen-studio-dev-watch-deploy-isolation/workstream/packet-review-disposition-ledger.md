# D1 Packet Review Disposition Ledger

Status: accepted; no open P1/P2
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D1-R1 | Dev-platform baseline | Existing S1.1a packet used Turbo-era gates and deploy command wording. | P1 | accepted, repaired | Proposal/design/tasks now make Nx/Habitat baseline the final command path; Turbo `--only` is historical evidence only. |
| D1-R2 | Testing/oracle | Existing packet mixed completed proof with target packet readiness and did not state D1 oracles independently. | P2 | accepted, repaired | Added `packet-phase-record.md` with static, build-command, watch, regression, and live state-machine oracles. |
| D1-R3 | Residue/shortcut scan | Historical S1.1a files still contain Turbo-era proof text that could be mistaken for active implementation authority. | P2 | accepted, repaired | Added `packet-residue-ledger.md`; active target files own D1, historical workstream files are evidence only. |
| D1-R4 | Dev-platform/Nx/Habitat review | D1 future implementation gates omitted worktree/Habitat/Graphite gates. | P2 | accepted, repaired | Added Habitat classify, reported Habitat/Nx/Biome/GritQL gates, Git/Graphite stack inspection, and clean/quarantined worktree proof to proposal/tasks/closure checklist. |
| D1-R5 | Dev-platform/Nx/Habitat review | Active proposal used vague `bun x nx` command example instead of repo-local pinned Nx command and verified mod target. | P2 | accepted, repaired | Replaced with `bun run nx run mod-swooper-maps:build --outputStyle=static` and required `bun run nx show project mod-swooper-maps --json`. |
| D1-R6 | Runtime/watch-graph architecture review | Import-graph oracle was too shallow: direct string checks could pass while a transitive daemon import still reached deploy-written outputs. | P1 | accepted, repaired | Added transitive daemon import-graph/write-set disjointness requirement across `dist/**`, `mod/**`, and `src/maps/generated/**`; updated proposal/design/spec/tasks/phase record. |
| D1-R7 | Runtime/watch-graph architecture review | "Source recipe stage contracts" were path-scoped and allowed importing full recipe runtime modules. | P2 | accepted, repaired | Defined a contract-only Studio recipe surface under `mods/mod-swooper-maps/src/recipes/studio-contracts/**`, with allowed exports and forbidden runtime/default/generated outputs. |
| D1-R8 | Runtime/watch-graph/testing review | Live proof did not require same-operation phase samples or explicitly exclude restart/browser recovery. | P2 | accepted, repaired | Added `/rpc` same-operation samples across accepted, deploy-entered, deploy-exited, and terminal phases with stable daemon identity, deploy command, log pointer, and restart-recovery exclusion. |
| D1-R9 | Testing/adversarial review | Watch guard oracle targeted frontend watch churn while the historical defect was daemon watcher restart. | P2 | accepted, repaired | Added daemon watch/import trigger oracle; frontend watcher ignores are secondary guards only. |

## Required Fresh Reviews

- Dev-platform/Nx/Habitat review accepted after D1-R4/D1-R5 repairs.
- Runtime/watch-graph architecture review accepted after D1-R6/D1-R7/D1-R8/D1-R9 repairs.
- Testing/adversarial review accepted after D1-R5/D1-R6/D1-R8/D1-R9 repairs.
