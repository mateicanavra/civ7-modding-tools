# Direct-Control Game Controller Bridge Phase Record

## Phase

- Project: Civ7 Intelligence Layer
- Phase: direct-control-game-controller-bridge
- Owner: Codex workstream lead
- Branch/Graphite stack: `codex/investigate-civ7-intelligence-threads`
- Started: 2026-06-03
- Status: realignment implemented and validated; implementation pending

## Objective

- Target movement: promote the deployed game-scoped App UI controller from
  future/companion wording to the primary direct-control implementation
  candidate for current read/action wrapper logic.
- Substrate correction: implement the controller mod API as an in-process
  oRPC/Effect callable router. Treat
  `globalThis.Civ7IntelligenceBridge.invoke(...)` as the serialized ingress
  adapter, not the product API. Keep oRPC/Effect as the shared substrate for the
  in-game controller, external direct-control bridge API, and future internal AI
  intelligence service.
- Non-goals: literal Tuner-resident mod deployment, independent controller-owned
  action choice, raw LLM JavaScript, native AI live row mutation, map scripts as
  live control, or a model runtime inside Civ7.
- Done condition: OpenSpec, solution docs, ADR, project records, downstream
  specs, proof gates, and agent findings all agree on the controller baseline
  and leave an implementation-ready next packet.

## Authority

- Root/subtree `AGENTS.md`: root router; `packages/civ7-direct-control/AGENTS.md`
  for direct-control ownership.
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
  - completed historical `direct-control-read-surface` and
    `direct-control-action-surface` changes.
- Excluded/stale inputs:
  - "Tuner owns gameplay reads" as a hard limitation;
  - "full in-game controller is only a future direction" as the current target;
  - "companion endpoint is only display/acknowledgement" as the first product
    slice.

## Current State

- Repo/Graphite state: current branch
  `codex/investigate-civ7-intelligence-threads`; Graphite branch exists in the
  stack; pre-existing dirty file `docs/projects/mapgen-studio/VIZ-SDK-V1.md`
  belongs outside this phase.
- Dirty files and owner:
  - phase-owned docs and OpenSpec files are owned by this workstream while
    substrate corrections are being validated and committed;
  - unrelated pre-existing MapGen Studio doc remains untouched.
- Current code evidence:
  - `packages/civ7-direct-control/src/index.ts` still builds raw JS command
    strings for map, plot, player, unit, city, visibility, GameInfo, operation
    validation, and operation requests.
  - These wrappers are now migration sources for controller methods, not proof
    that Tuner must remain the gameplay execution state.
- Current substrate evidence:
  - `packages/civ7-direct-control/src/orpc/**` already uses Effect-backed oRPC
    procedures, managed runtime, typed context, approval policy, and server-side
    callable router/client patterns.
  - The controller implementation should reuse that architectural substrate in
    game context while keeping the Civ command/global boundary as a transport
    adapter.
- Generated outputs affected: none in this realignment pass.
- Tests/guards affected: OpenSpec validation, markdown/link sanity,
  `git diff --check`; source tests begin with the implementation slice.

## Runtime Evidence

- Live read-only probe found current Civ7 reachable at `127.0.0.1:4318` with
  App UI and Tuner states.
- App UI game context exposed the major gameplay roots checked in Tuner:
  `Game`, `GameplayMap`, `Players`, `Units`, `MapUnits`, `Cities`, `MapCities`,
  `Districts`, `MapConstructibles`, `Database`, and `GameInfo`.
- App UI additionally exposed `WorldBuilder`, `GameContext`, `Automation`,
  `Network`, `UI`, `WorldUI`, and `localStorage`.
- Tuner exposed the major gameplay roots checked here but lacked those App
  UI-only controller/lifecycle roots in the current session.
- App UI and Tuner returned matching values for representative read calls:
  map dimensions, seed, plot terrain/resource/revealed state at `0,0`, alive
  players, human player, first unit id/location/type, and
  `GameInfo.Resources.length`.
- Both states exposed `canStart` and `sendRequest` on the checked player, unit,
  and city operation/command routers.
- Official `tuner-input.js` is loaded as a game-scoped UI script and proves a
  native game-side controller pattern: browser/input events enter game App UI
  code, which then calls WorldBuilder, MapConstructibles, and game operation
  routers.

## Scope

- Write set:
  - `openspec/changes/direct-control-game-controller-bridge/**`;
  - `docs/projects/civ7-intelligence-layer/**`;
  - targeted `docs/system/ADR.md`;
  - targeted historical OpenSpec note updates for completed read/action specs.
- Protected files:
  - generated `dist/` and `mod/` outputs;
  - official `.civ7/outputs/resources/**`;
  - unrelated `docs/projects/mapgen-studio/VIZ-SDK-V1.md`.
- Owners:
  - controller mod package owns deployed game/shell script source;
  - `@civ7/direct-control` owns external transport, controller invocation,
    approvals, no-replay policy, and proof records;
  - shared oRPC/Effect contracts own typed procedure atoms across the controller,
    external bridge API, and future internal AI intelligence service;
  - CLI/Studio remain callers above direct-control.
- Forbidden owners:
  - caller-local control scripts;
  - map scripts as live control;
  - native AI data rows as live mutation authority.
- Consumer impact: future CLI/Studio/agent callers move from raw JS wrapper
  assumptions to typed direct-control controller methods.
- Downstream assumptions:
  - old direct-control read/action OpenSpec records need a realignment note;
  - solution docs need the controller as implementation baseline candidate;
  - proof records need separate source-backed, live-read, lifecycle, and
    disposable-mutation labels.

## Spec/Tasks

- Spec/proposal:
  - `openspec/changes/direct-control-game-controller-bridge/proposal.md`
  - `openspec/changes/direct-control-game-controller-bridge/design.md`
- Tasks:
  - `openspec/changes/direct-control-game-controller-bridge/tasks.md`
- Validation status: passed for OpenSpec and whitespace.

## Review

- Review lanes:
  - architecture/product/direct-control boundary;
  - implementation slice;
  - proof gates;
  - downstream stale assumption audit.
- Blocking findings: none open after integration.
- Accepted findings repaired: GCR-001 through GCR-006 repaired by opening the
  workstream, OpenSpec change, proof ledger, downstream ledger, exact source
  shape, and realigning current solution/OpenSpec records.
- Substrate finding repaired: GCR-007 accepted; OpenSpec, ADR, solution docs,
  workstream records, and oRPC architecture skill now treat oRPC/Effect as the
  controller substrate rather than an external-only boundary.
- Rejected/invalidated/waived/deferred findings: pending.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - `019e8f2f-34ac-7a30-9ad0-fcd03951ead0`: official native rails.
  - `019e8f2f-4d91-7dc0-948d-1397f25839a4`: installed/local mod patterns.
  - `019e8f2f-67e1-7ac2-81d0-c464ed69fbe0`: direct-control surface parity.
  - `019e8f49-788e-7f12-b608-38040294d5b8`: downstream stale assumption audit.
  - `019e8f49-7a2b-7772-bd72-735794cb5fd5`: implementation slice audit.
  - `019e8f49-7b97-7a13-abc7-defb3fd0eaa8`: proof-gate audit.
- Assigned write sets: active agents are read-only.
- Latest evidence by agent: all lanes support game/shell UIScripts as native
  controller rails, App UI game context as read/action parity surface, a
  direct-control-owned bridge implementation slice, and proof ladder promotion.
- Open findings by agent: none.
- Running/stale status: none.
- Integration owner: Codex workstream lead.

## Implementation

- Completed tasks:
  - opened OpenSpec change;
  - recorded corrected runtime evidence and native rail direction;
  - realigned solution, ADR, path map, project, historical OpenSpec records,
    capability inventory, Studio readiness, and historical reports.
  - corrected controller API substrate from custom JSON envelope to in-process
    oRPC/Effect router behind a serialized App UI ingress adapter.
- Remaining tasks:
  - decide whether to start code implementation on this branch or hand off with
    a next packet.
- Stop conditions triggered: none.

## Verification

- Commands run:
  - `git status --short --branch`
  - `gt log --no-interactive`
  - targeted `rg`, `sed`, and live read-only direct-control probes earlier in
    the phase.
  - `bun run openspec -- validate direct-control-game-controller-bridge --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - reran those three gates after the oRPC/Effect substrate correction.
- Results:
  - worktree had one unrelated pre-existing dirty file;
  - live read-only probes support the controller baseline candidate.
  - OpenSpec validation passed for `direct-control-game-controller-bridge`.
  - Full OpenSpec validation passed: 57 items, 0 failed.
  - `git diff --check` passed.
  - Substrate correction validation passed: focused OpenSpec valid, full
    OpenSpec 57 passed/0 failed, and `git diff --check` passed.
- Skipped gates and rationale:
  - no deploy/restart/mutation proof in this realignment pass; those require a
    source-owned controller and, for mutation, a disposable session.
- Evidence boundary: source-backed plus current live read-only proof; not yet
  project-owned deployed lifecycle proof or mutation proof.

## Realignment

- Downstream docs/specs/issues updated: current docs/specs realigned; package
  README deferred until a controller client exists.
- Tests/guards updated: not yet; code slice not started.
- Deferrals/triage updated: pending.
- Downstream realignment ledger:
  - `docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/downstream-realignment-ledger.md`
- Supervisor notice:
  - `docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/supervisor-notice.md`

## Next Action

- Exact next step: commit the validated realignment, then implement the
  controller mod/direct-control client slice on a follow-up branch or continue
  this branch if selected. Implementation starts with shared controller
  contract/envelope modules, game router/runtime/effect services, and the
  direct-control invocation adapter.
- First files to inspect:
  - `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
  - `docs/projects/civ7-intelligence-layer/actuation-path-map.md`
  - `docs/system/ADR.md`
  - `openspec/changes/direct-control-read-surface/design.md`
  - `openspec/changes/direct-control-action-surface/design.md`
- Stop condition: an agent or validation finding shows the controller rail is
  not source-backed, not owned by direct-control, or cannot preserve approval
  and proof boundaries.
