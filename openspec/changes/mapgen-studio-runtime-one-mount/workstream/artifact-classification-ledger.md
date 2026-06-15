# D0 Artifact Classification Ledger

Date: 2026-06-14
Scope: Runtime-simplification OpenSpec and workstream artifacts that affect D0-D12 packet authoring.

## Classification Vocabulary

- `accepted baseline`: completed artifact used as source state for later packets.
- `active packet`: artifact being repaired or authored by this packet train.
- `accepted packet; implementation pending`: packet authority is accepted, but code/proof tasks remain future implementation closure gates.
- `pending domino`: required by the runtime refactor frame but not yet packet-accepted.
- `superseded/raw material`: older plan text or completed slice that must not control new implementation without frame alignment.
- `external stack scout`: fact source pending review from a different Graphite stack.

## Runtime Domino Artifacts

| Domino | Artifact | Classification | Notes |
| --- | --- | --- | --- |
| D0 | `openspec/changes/mapgen-studio-runtime-one-mount/` | active packet over accepted baseline | Existing change validates strict; D0 adds baseline classification and workstream packet records. |
| D1 | `openspec/changes/mapgen-studio-dev-watch-deploy-isolation/` | accepted packet; implementation pending | Deploy command shape is partially integrated on the restacked baseline, but recipe-DAG still imports full source recipe modules; contract-only import graph and live proof remain implementation gates. |
| D2 | `openspec/changes/mapgen-studio-engine-effect-corpus/` | accepted packet; implementation pending | Packet accepted; runtime corpus must be rechecked against the partially integrated app-hosted engine/event code before implementation closure. |
| D2.5 | `openspec/changes/mapgen-studio-contract-typebox-spine/` | accepted packet; implementation pending | Packet accepted; Studio Standard Schema adapter still needs recoverable TypeBox-origin parity and no Zod residue before implementation closure. |
| D3 | `openspec/changes/mapgen-studio-error-spine/` | accepted packet; implementation pending | Packet accepted; permissive error detail and status-code bridge residue remain implementation gates. |
| D4 | `openspec/changes/mapgen-studio-engine-runtime-services/` | accepted packet; implementation pending | Packet accepted; app-local mutable engine state/queues still require Effect service ownership. |
| D5 | `openspec/changes/mapgen-studio-pipeline-effect-services/` | accepted packet; implementation pending | Packet accepted; direct-control game-wire calls still need workflow ports over the shared Studio session. |
| D6 | `openspec/changes/mapgen-studio-operations-current/` | accepted packet; implementation pending | Packet accepted; daemon-owned operation truth remains an implementation/proof gate. |
| D7 | `openspec/changes/mapgen-studio-stream-spike/` | accepted packet; implementation pending | Packet accepted; production stream bridge and cleanup proofs remain future implementation gates. |
| D8 | `openspec/changes/mapgen-studio-event-hub/` | accepted packet; implementation pending | Packet accepted; EventHub exists but daemon construction/manual injection must still be reconciled with Effect-owned lifecycle. |
| D9 | `openspec/changes/mapgen-studio-operations-push/` | accepted packet; implementation pending | Packet accepted; operation push and polling/watchdog deletion remain implementation gates. |
| D10 | `openspec/changes/mapgen-studio-live-game-watch/` | accepted packet; implementation pending | Packet accepted; live watcher exists as manual timer code and must become a scoped Effect service. |
| D11 | `openspec/changes/mapgen-studio-nx-dev-runner/` | accepted packet; implementation pending | Packet accepted; Nx exists, but current `mapgen-studio:dev` still delegates to `devLive.ts` and daemon `bun --watch`. |
| D12 | `openspec/changes/mapgen-studio-game-door-invariant/` | accepted packet; implementation pending | Packet accepted; final bridge/schema/status/mutation residue and Graphite stack-drain proof remain implementation closure gates. |

## Project Documents

| Artifact | Classification | Notes |
| --- | --- | --- |
| `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` | accepted frame | Controls D0-D12 packet authoring. |
| `docs/projects/studio-runtime-simplification/PLAN.md` | superseded/raw material with accepted historical evidence | Useful for original S1-S4 sequence and test disposition history; frame supersedes it where scope expanded. |
| `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md` | active packet control | Records goal, acceptance policy, baseline, and domino ledger for this packet train. |

## Toolchain And Stack Artifacts

| Artifact | Classification | Notes |
| --- | --- | --- |
| `package.json` | accepted implementation baseline evidence | Current adopted worktree uses root Nx scripts; pre-restack Turbo-era package evidence is historical only. |
| `bun.lock` | baseline evidence | Contains `@fission-ai/openspec`; dependency install must use `--frozen-lockfile`. |
| `nx.json` | accepted implementation baseline evidence | Present on the adopted worktree; root target defaults and Habitat plugin are active. |
| Biome/GritQL configs | accepted implementation baseline evidence | Present through the Habitat/Nx baseline; runtime packets consume reported gates when `habitat classify` or Nx affected analysis says they apply. |
| Graphite stack | active packet stack | Runtime Effect packet stack is based on `main` `db4a0ea68` and topped by `codex/runtime-effect-nx-doc-alignment`. |

## Runtime Authority And Residue Changes

| OpenSpec change | Classification | Retained requirements | Superseded requirements | Owner / re-entry |
| --- | --- | --- | --- | --- |
| `mapgen-studio-runtime-one-mount` | accepted transport baseline with D0 packet overlay | One `/rpc` mount, unified `@civ7/studio-server` runtime handler, structural session injection for control procedures, single app oRPC client. | None inside this change; D0 adds proof and residue records without reopening transport implementation. | D0 records baseline; later dominoes must not reintroduce satellite mounts. |
| `mapgen-studio-bun-server` | superseded in part, retained in part | Standalone daemon ownership, Vite frontend-only posture, extracted engine host seams, retired hand-rolled legacy REST. | Its three-mount topology is superseded by one `/rpc` mount; dev-live process shape is not final after D11. | D11 owns dev-runner cleanup; D12 negative-searches stale active text. |
| `mapgen-studio-tuner-session` | accepted baseline with unresolved game-door residue | Shared `Civ7TunerSession`, scoped acquisition/release, runtime disposal, health/backoff semantics. | Host session patch/extraction port is superseded by one-mount structural injection. The original "Run-in-game untouched" carveout is not a final runtime policy. | D5 resolves workflow session routing; D12 closes the game-door invariant. |
| `mapgen-studio-dev-watch-deploy-isolation` | accepted packet; implementation pending | Must protect Play and Save/Deploy from daemon watch/import graph rebuilds. | Any Turbo-era gate text becomes historical once accepted Nx/Habitat baseline is selected. | D1 implementation. |
| `mapgen-studio-error-spine` | accepted packet; implementation pending | Typed expected failures and exhaustive oRPC mapping. | `RunInGameHttpError` bridge and generic known-failure 500s. | D3 implementation. |
| `mapgen-studio-operations-current` | accepted packet; implementation pending | Daemon-owned operation truth and current-operation read. | Browser operation recovery localStorage bridge. | D6 implementation. |
| `mapgen-studio-stream-spike` | accepted packet; implementation pending | Stream transport decision and cleanup semantics. | Any unowned alternate watch transport. | D7 implementation. |
| `mapgen-studio-event-hub` | accepted packet; implementation pending | Daemon-owned event hub and watch procedure. | Polling remains only until D9 deletion target. | D8 implementation. |
| `mapgen-studio-operations-push` | accepted packet; implementation pending | Operation transition push and deletion of polling/watchdog authority. | Operation status polling, hidden Save/Deploy completion loop, daemon identity watchdog. | D9 implementation. |
| `mapgen-studio-live-game-watch` | accepted packet; implementation pending | Daemon-owned live-game watcher. | Browser live-status cadence. | D10 implementation. |
| `mapgen-studio-game-door-invariant` | pending closeout domino | Evergreen game-door invariant and final negative searches. | All orphaned runtime bridges and stale active docs. | D12 packet repair. |

## Migrated Baseline Evidence

| Source | Classification | Notes |
| --- | --- | --- |
| `main` at `db4a0ea68` | accepted implementation baseline | Settled Habitat/Nx workflow graph; runtime Effect stack is now restacked on this baseline. |
| `codex/runtime-effect-nx-doc-alignment` at `f79d94069` | active top alignment slice | Aligns packet gates and active deploy surfaces with the settled Habitat/Nx baseline. |
| `agent-F-habitat-nx-adoption` at `a0703cb1e` | expected migrated baseline | Provides current-main Nx adoption facts for root scripts and inferred targets. |
| `agent-F-habitat-harness-scaffold` at `5c2ee7c9c` | expected migrated baseline | Provides Habitat harness scaffold facts. |
| `agent-F-habitat-boundary-tags` at `2b849d67d` | expected migrated baseline | Provides boundary-tag enforcement facts. |
| `agent-F-habitat-biome-hygiene` top `d646640d0` | stale future baseline evidence | Contains Biome facts, but branch needs restack before it can be an implementation base. |
| `agent-F-habitat-grit-catalog` at `8b2a4d0b8` | stale future baseline evidence | Contains Grit facts, but branch needs restack before it can be an implementation base. |
