# D5 Downstream Realignment Ledger

Status: draft
Date: 2026-06-14

| Downstream surface | D5 impact | Required disposition |
| --- | --- | --- |
| D6 `mapgen-studio-operations-current` | Workflow transitions and failures become package-owned projections through D4. | D6 consumes runtime/workflow truth and deletes browser recovery ownership without recreating workflow state. |
| D8/D9 operation events/push | Workflow transition events carry richer proof/failure payloads. | Event payloads reuse D2.5/D3/D4 projections; transport shape remains D8/D9. |
| D10 live watcher | Workflow game-wire calls use shared `Civ7TunerSession`; watcher still owns live read cadence. | D10 must not introduce alternate session constructors or duplicate workflow read state. |
| D11 dev runner | D5 live proof uses the current packet-authoring baseline but implementation closure must use accepted Nx/Habitat gates when available. | D11 owns dev process simplification, not workflow orchestration. |
| D12 game-door invariant | D5 chooses shared-session Studio workflows and forbids Studio `withCiv7DirectControlSession`. | D12 final allowlist must preserve this stricter Studio workflow rule unless a later accepted packet changes it explicitly. |
| App host | App host loses workflow authority. | Remaining app code is bounded port implementation/composition only. |
| Habitat/Nx deploy baseline | D5 ports deploy execution into `DeployRunner`. | Implementation closure uses accepted repo-local Nx/Habitat deploy/build targets when present; Turbo-era deploy command strings are current-code evidence only. |
