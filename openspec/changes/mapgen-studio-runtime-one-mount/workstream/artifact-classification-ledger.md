# D0 Artifact Classification Ledger

Date: 2026-06-14
Scope: Runtime-simplification OpenSpec and workstream artifacts that affect D0-D12 packet authoring.

## Classification Vocabulary

- `accepted baseline`: completed artifact used as source state for later packets.
- `active packet`: artifact being repaired or authored by this packet train.
- `pending domino`: required by the runtime refactor frame but not yet implementation-ready.
- `superseded/raw material`: older plan text or completed slice that must not control new implementation without frame alignment.
- `external stack scout`: fact source pending review from a different Graphite stack.

## Runtime Domino Artifacts

| Domino | Artifact | Classification | Notes |
| --- | --- | --- | --- |
| D0 | `openspec/changes/mapgen-studio-runtime-one-mount/` | active packet over accepted baseline | Existing change validates strict; D0 adds baseline classification and workstream packet records. |
| D1 | `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/` | pending domino | Existing complete-looking artifact must be reviewed against the Effect-refactor frame and Nx/Biome/GritQL scout output. |
| D2 | `openspec/changes/mapgen-studio-engine-effect-corpus/` | pending domino | Not present on this baseline; must be created unless migrated stack already has an accepted equivalent. |
| D2.5 | `openspec/changes/mapgen-studio-contract-typebox-spine/` | pending domino | Not present on this baseline; must be created unless migrated stack already has an accepted equivalent. |
| D3 | `openspec/changes/mapgen-studio-error-spine/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D4 | `openspec/changes/mapgen-studio-engine-runtime-services/` | pending domino | Not present on this baseline; must be created. |
| D5 | `openspec/changes/mapgen-studio-pipeline-effect-services/` | pending domino | Not present on this baseline; must be created. |
| D6 | `openspec/changes/mapgen-studio-operations-current/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D7 | `openspec/changes/mapgen-studio-stream-spike/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D8 | `openspec/changes/mapgen-studio-event-hub/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D9 | `openspec/changes/mapgen-studio-operations-push/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D10 | `openspec/changes/mapgen-studio-live-game-watch/` | pending domino | Existing artifact requires frame-standard review and likely repair. |
| D11 | `openspec/changes/mapgen-studio-nx-dev-runner/` | pending domino | Not present on this baseline; create on accepted Nx/Habitat baseline or repair after restack. It must not own a pre-Nx migration fallback. |
| D12 | `openspec/changes/mapgen-studio-game-door-invariant/` | pending domino | Existing artifact requires closeout-invariant repair. |

## Project Documents

| Artifact | Classification | Notes |
| --- | --- | --- |
| `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` | accepted frame | Controls D0-D12 packet authoring. |
| `docs/projects/studio-runtime-simplification/PLAN.md` | superseded/raw material with accepted historical evidence | Useful for original S1-S4 sequence and test disposition history; frame supersedes it where scope expanded. |
| `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` | active packet control | Records goal, acceptance policy, baseline, and domino ledger for this packet train. |

## Toolchain And Stack Artifacts

| Artifact | Classification | Notes |
| --- | --- | --- |
| `package.json` | baseline evidence | Current packet branch uses Turbo-era root scripts; this is historical evidence only if the accepted implementation base is the migrated Nx/Habitat stack. |
| `bun.lock` | baseline evidence | Contains `@fission-ai/openspec`; dependency install must use `--frozen-lockfile`. |
| `nx.json` | absent on current baseline | If absent on selected implementation base, D0/D11 cannot close implementation-ready for Nx-dependent packets. |
| Biome/GritQL configs | external stack scout | Scout lane will identify accepted files/commands from Habitat migration stack; runtime packets consume gates, they do not author Habitat enforcement rules. |
| Graphite stack | active packet | `codex/runtime-effect-openspec-packets` is stacked above `codex/runtime-effect-refactor-frame`. |

## Runtime Authority And Residue Changes

| OpenSpec change | Classification | Retained requirements | Superseded requirements | Owner / re-entry |
| --- | --- | --- | --- | --- |
| `mapgen-studio-runtime-one-mount` | accepted transport baseline with D0 packet overlay | One `/rpc` mount, unified `@civ7/studio-server` runtime handler, structural session injection for control procedures, single app oRPC client. | None inside this change; D0 adds proof and residue records without reopening transport implementation. | D0 records baseline; later dominoes must not reintroduce satellite mounts. |
| `mapgen-studio-bun-server` | superseded in part, retained in part | Standalone daemon ownership, Vite frontend-only posture, extracted engine host seams, retired hand-rolled legacy REST. | Its three-mount topology is superseded by one `/rpc` mount; dev-live process shape is not final after D11. | D11 owns dev-runner cleanup; D12 negative-searches stale active text. |
| `mapgen-studio-tuner-session` | accepted baseline with unresolved game-door residue | Shared `Civ7TunerSession`, scoped acquisition/release, runtime disposal, health/backoff semantics. | Host session patch/extraction port is superseded by one-mount structural injection. The original "Run-in-game untouched" carveout is not a final runtime policy. | D5 resolves workflow session routing; D12 closes the game-door invariant. |
| `mapgen-studio-dev-watch-deploy-isolation` | pending domino | Must protect Play and Save/Deploy from daemon watch/import graph rebuilds. | Any Turbo-era gate text becomes historical once accepted Nx/Habitat baseline is selected. | D1 packet repair. |
| `mapgen-studio-error-spine` | pending domino | Typed expected failures and exhaustive oRPC mapping. | `RunInGameHttpError` bridge and generic known-failure 500s. | D3 packet repair. |
| `mapgen-studio-operations-current` | pending domino | Daemon-owned operation truth and current-operation read. | Browser operation recovery localStorage bridge. | D6 packet repair. |
| `mapgen-studio-stream-spike` | pending domino | Stream transport decision and cleanup semantics. | Any unowned alternate watch transport. | D7 packet repair. |
| `mapgen-studio-event-hub` | pending domino | Daemon-owned event hub and watch procedure. | Polling remains only until D9 deletion target. | D8 packet repair. |
| `mapgen-studio-operations-push` | pending domino | Operation transition push and deletion of polling/watchdog authority. | Operation status polling, hidden Save/Deploy completion loop, daemon identity watchdog. | D9 packet repair. |
| `mapgen-studio-live-game-watch` | pending domino | Daemon-owned live-game watcher. | Browser live-status cadence. | D10 packet repair. |
| `mapgen-studio-game-door-invariant` | pending closeout domino | Evergreen game-door invariant and final negative searches. | All orphaned runtime bridges and stale active docs. | D12 packet repair. |

## Migrated Baseline Evidence

| Source | Classification | Notes |
| --- | --- | --- |
| `agent-F-habitat-nx-adoption` at `a0703cb1e` | expected migrated baseline | Provides current-main Nx adoption facts for root scripts and inferred targets. |
| `agent-F-habitat-harness-scaffold` at `5c2ee7c9c` | expected migrated baseline | Provides Habitat harness scaffold facts. |
| `agent-F-habitat-boundary-tags` at `2b849d67d` | expected migrated baseline | Provides boundary-tag enforcement facts. |
| `agent-F-habitat-biome-hygiene` top `d646640d0` | stale future baseline evidence | Contains Biome facts, but branch needs restack before it can be an implementation base. |
| `agent-F-habitat-grit-catalog` at `8b2a4d0b8` | stale future baseline evidence | Contains Grit facts, but branch needs restack before it can be an implementation base. |
