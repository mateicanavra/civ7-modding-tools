# MapGen Studio game door invariant

## Why

D12 closes the Studio runtime Effect refactor packet train. D0-D11 assign the
runtime surfaces: one `/rpc` mount, TypeBox contracts, Effect error and
operation services, Effect workflow services, current operation projection,
event stream, EventHub, operation push, live-game watch, and Nx dev
orchestration. The final domino turns that ownership into guardrails and
deletes or classifies every leftover bridge.

This packet is not another feature slice. It is the closeout invariant: after
D12, future agents should be able to prove where game-wire calls enter, which
runtime truths are daemon-owned, which public/manual status reads remain, and
which legacy paths are gone.

## Target Authority Refs

- `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md`
  D12: final game-door invariant, direct-control session guard, tuner-session
  dispositions, TypeBox/Zod closeout, control-oRPC classification, final
  residue ledger, and stack drain.
- `docs/projects/studio-runtime-simplification/OPENSPEC-PACKET-TRAIN.md`:
  D12 is the closeout invariant packet.
- D9, D10, and D11 downstream ledgers: D12 owns retained public/manual status
  endpoint classification, final dev-process residue classification, and final
  no-orphan proof.
- `openspec/changes/mapgen-studio-tuner-session/`: D12 consumes and closes its
  deferred session/recovery promises by name.
- Direct user rule: no "for now", fallback, shim, or bridge exit without a
  strong rationale or closeout plan invoked in the current workflow.

## What Changes

- Add or update an evergreen game-door invariant doc under
  `docs/system/direct-control/GAME-DOOR-INVARIANT.md`.
- Add guard tests for sanctioned `new Civ7DirectControlSession(...)` owners:
  the daemon's shared `Civ7TunerSession` owner and the direct-control package's
  bounded session wrapper only.
- Delete `RunInGameHttpError` production residue and delete, replace, or
  classify `StudioEngineError` status-code bridge residue so no transport or
  status-code bridge remains live and unowned.
- Prove `@civ7/studio-server` public contracts use TypeBox/Standard Schema and
  have no direct Zod contract residue.
- Classify retained public/manual operation status endpoints as diagnostic
  request/response reads, mutation-state reads/projections, or identity reads,
  or delete them. They cannot remain background freshness authority.
- Add a `@civ7/control-orpc` runtime surface classification ledger proving no
  unclassified game-action/effect surface remains. The ledger is keyed by
  `procedureKey` and separates read-only, runtime-support, and mutation
  families.
- Close `mapgen-studio-tuner-session` deferred tasks by name:
  - per-flow Run in Game sessions are either converged onto `Civ7TunerSession`
    or permanently assigned to a sanctioned `@civ7/direct-control` scoped
    wrapper with guard tests;
  - Restart Civ7 recovery is implemented, explicitly rejected by product
    authority, or moved to a canonical deferral with owner, risk, and re-entry
    trigger.
- Run final negative searches across browser recovery, operation polling,
  live-status cadence, dev supervision, old satellite clients, status-code
  bridge residue, generic mutation DTOs, direct-control aliases, schema residue,
  and stale docs that claim convergence is still out of scope.
- Record a final residue ledger and Graphite stack-drain plan/proof.

## Non-Goals

- No new runtime transport.
- No new browser recovery path.
- No new game-control protocol or alternate direct-control client.
- No broad product redesign of Restart Civ7. D12 either implements it, rejects
  it with product authority, or tracks it durably with trigger and owner.
- No live-proof inflation. D12 consumes D9-D11 live proof labels and requires new
  live proof only if D12 implementation changes runtime behavior or the final
  closeout claim depends on missing live evidence.

## Impact

- `docs/system/direct-control/GAME-DOOR-INVARIANT.md`
- `docs/system/DEFERRALS.md`
- `openspec/changes/mapgen-studio-game-door-invariant/**`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/status-endpoint-corpus.md`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/control-orpc-surface-corpus.md`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/final-proof-ledger.md`
- `openspec/changes/mapgen-studio-tuner-session/**`
- `packages/studio-server/src/contract/**`
- `packages/studio-server/src/services/**`
- `packages/studio-server/src/router/**`
- `packages/studio-server/test/**`
- `packages/civ7-direct-control/src/**`
- `packages/civ7-control-orpc/**`
- active runtime docs/specs that reference deleted paths or deferred
  convergence

## Verification Gates

- `bun install --frozen-lockfile` and baseline build/check on the selected
  implementation base.
- `bun run openspec -- validate mapgen-studio-game-door-invariant --strict`.
- `bun run openspec -- validate mapgen-studio-tuner-session --strict`.
- `bun run openspec:validate`.
- Habitat classify for the D12 write set and all reported package/app gates.
- Repo-local Nx package/app check, test, and build targets for touched code;
  direct package scripts may be focused additional evidence only.
- Guard tests for sanctioned direct-control session constructors.
- Final negative search set:
  - `RunInGameHttpError`;
  - `StudioEngineError`;
  - Zod imports in `packages/studio-server/src/contract`;
  - browser operation recovery keys;
  - `useOperationStatusPolls`;
  - `useDaemonInstanceWatchdog`;
  - `nextLiveRuntimePollDelayMs`;
  - `devLive.ts`, package scripts that route to `devLive.ts`, active local-dev
    Turbo route, and daemon `bun --watch`;
  - `bunx nx`, `bun x nx`, `["x", "nx"]` / `['x', 'nx']` deploy-plan residue,
    global/on-the-fly Nx, direct `node_modules/.bin/nx`, and shimmed Nx command
    paths;
  - unsanctioned `new Civ7DirectControlSession(`;
  - old satellite client/path symbols;
  - public `operationType + args` generic mutation routes;
  - public `Record<string, number>` mutation arg DTOs where runtime schema is a
    closed semantic union;
  - direct-control runtime-port aliases exported from public root packages;
  - case-insensitive active runtime docs/OpenSpec text matching
    `run[- ]in[- ]game` plus `convergence`, `session`, `out of scope`, or
    `deferred` without accepted D12 disposition.
- Final proof ledger separates OpenSpec validation, source guards, package/app
  tests, negative searches, consumed live proof, new live proof if required,
  Graphite submit/merge/drain, and residual risks.
