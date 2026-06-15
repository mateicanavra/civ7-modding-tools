# D4 Downstream Realignment Ledger

Status: accepted
Date: 2026-06-14

| Downstream surface | D4 impact | Required disposition |
| --- | --- | --- |
| D5 `mapgen-studio-pipeline-effect-services` | D5 consumes runtime admission, scoped worker ownership, and D3 failure unions. | D5 ports workflow bodies without reintroducing lifecycle state, queues, or registries. |
| D6 `mapgen-studio-operations-current` | Runtime truth/current projection mechanics become runtime-owned. | D6 consumes D4 projection as baseline and owns public adoption/read-model cleanup; it must not reconstruct truth from browser persistence or app stores. |
| D8/D9 operation events/push | Operation transition events originate from runtime state transitions. | Event payloads reuse D4 projections and D2.5/D3 TypeBox schemas. |
| App host `createStudioEngines` | App host loses lifecycle ownership. | Remaining app code is bounded leaf adapter ports/environment plumbing only; it cannot own phase transitions, workflow failure classification, request fingerprints, operation conflict checks, registry callbacks, or background workers. |
| Dev runtime/Nx packets | D4 does not solve process orchestration. | Dev task runner work remains in its own packet; no supervisor workaround is added here. |
| D10 live watcher | Existing live-game watcher timer is outside operation runtime scope. | D10 owns live watcher lifetime/disposal; D4 only forbids operation runtime from adding unscoped operation workers. |
