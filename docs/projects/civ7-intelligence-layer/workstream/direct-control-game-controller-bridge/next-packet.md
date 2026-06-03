# Direct-Control Game Controller Bridge Next Packet

## Workstream State

- Project: Civ7 Intelligence Layer
- Phase: direct-control-game-controller-bridge
- Branch/Graphite stack: `codex/investigate-civ7-intelligence-threads`
- Last commit: `89e1e17af docs(civ7): repair intelligence actuation frame`
- Repo state: one unrelated pre-existing dirty file,
  `docs/projects/mapgen-studio/VIZ-SDK-V1.md`; phase-owned docs/specs validated
  and ready to commit.

## Authority

- Product refs:
  - direct user correction on 2026-06-03;
  - `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`;
  - `docs/projects/civ7-intelligence-layer/actuation-path-map.md`.
- Architecture refs:
  - `docs/system/ADR.md`;
  - `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`;
  - `packages/civ7-direct-control/AGENTS.md`.
- Project refs:
  - `openspec/changes/direct-control-game-controller-bridge/`;
  - `docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/`.
- Excluded/stale inputs:
  - hard Tuner-first gameplay-read limitation;
  - literal Tuner-loaded mod success criterion;
  - independent controller action authority.

## What Is Done

- Completed tasks:
  - live App UI/Tuner parity evidence collected;
  - official/local native rail evidence collected;
  - OpenSpec change opened;
  - phase/proof/realignment/review/next-packet artifacts opened;
  - current solution, ADR, project, path map, historical OpenSpec records,
    capability inventory, Studio readiness, and historical reports realigned.
- Verified evidence:
  - source-backed native rails;
  - current live read-only App UI/Tuner parity for representative gameplay roots
    and values.
  - `bun run openspec -- validate direct-control-game-controller-bridge --strict`
    passed.
  - `bun run openspec:validate` passed: 57 items, 0 failed.
  - `git diff --check` passed.
- Closed findings:
  - GCR-001 through GCR-003 accepted and in repair.

## What Is Open

- Remaining tasks:
  - choose whether to start code implementation now or on a follow-up branch;
  - implement `mods/mod-civ7-intelligence-controller` and the direct-control
    controller client;
  - run project-owned lifecycle, read parity, validator parity, and disposable
    approved-action proof.
- Open findings:
  - none for realignment.
- Blockers:
  - none for realignment;
  - live deployment/mutation proof requires implementation and, for mutation, a
    disposable session.
- Dirty/uncommitted files:
  - phase-owned docs/specs;
  - unrelated `docs/projects/mapgen-studio/VIZ-SDK-V1.md`.
- Failing gates:
  - none for realignment.
- Deferred items:
  - source controller mod and direct-control client implementation;
  - disposable approved-action proof.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - `019e8f2f-34ac-7a30-9ad0-fcd03951ead0`
  - `019e8f2f-4d91-7dc0-948d-1397f25839a4`
  - `019e8f2f-67e1-7ac2-81d0-c464ed69fbe0`
  - `019e8f49-788e-7f12-b608-38040294d5b8`
  - `019e8f49-7a2b-7772-bd72-735794cb5fd5`
  - `019e8f49-7b97-7a13-abc7-defb3fd0eaa8`
- Assigned write sets: active agents are read-only.
- Latest evidence: completed agents support native game/shell UIScripts, App UI
  game-context parity, exact implementation paths, and proof ladder promotion.
- Open findings: none.
- Running/stale status: none.
- Integration owner: Codex workstream lead.
- Continue/stop instruction: continue until realignment is validated; do not
  close with agents running.

## Downstream State

- Changes enabled:
  - controller mod package;
  - direct-control controller client;
  - controller-backed read/action migration.
- Changes blocked:
  - production action execution until disposable approved-action proof.
- Artifacts realigned:
  - solution frame, actuation map, project frame, ADR, historical direct-control
    OpenSpec records, capability inventory, Studio readiness, historical reports.
- Artifacts still needing realignment:
  - package README after the controller client exists.
- Downstream realignment ledger:
  - `docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/downstream-realignment-ledger.md`

## Resume Instructions

1. First inspect `git status --short --branch` and this packet.
2. Then inspect `openspec/changes/direct-control-game-controller-bridge/`.
3. Then implement the source controller mod and direct-control client following
   `design.md` and `tasks.md`.
4. Stop if evidence invalidates App UI game context as the primary controller
   runtime or if direct-control approval/proof ownership cannot be preserved.
