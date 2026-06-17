# Studio Effect State-Machine Recovery Workstream Record

Date: 2026-06-16

This record applies `civ7-systematic-workstream` gates 1-8 to prework only. It does not claim implementation, runtime closure, or product proof.

## Gate 1 - Frame

Frame: Studio Effect state-machine recovery.

Normative frame: `FRAME.md`.

The workstream is a second-order objective reframe. The object is not one endpoint. The object is the whole Studio state machine across server RPCs, browser UI, operation lifecycle, dev startup, and live Civ7 proof labels.

## Gate 2 - Repo Isolation And Census

Primary worktree:

`/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`

Current branch:

`codex/studio-effect-error-boundaries`

Current HEAD:

`a3541bd66468 fix(studio): preserve Effect promise failures`

Dirty state observed before writing this package:

- Pre-existing untracked `docs/projects/mapgen-workstream-skill/`.
- This package is a separate docs/control slice and must not stage or claim that directory.

Formatter-only validation hygiene performed after `bun run lint` exposed workspace Biome failures:

- `mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json`
- `nx.json`
- `packages/studio-server/test/workflowSessionGraph.test.ts`

These changes were applied with Biome to satisfy the habitat-returned `bun run lint` target. They are not runtime behavior changes.

Relevant worktrees:

| Worktree | State |
|---|---|
| `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools` | `codex/studio-effect-error-boundaries` |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-prework` | `codex/studio-tuner-session-serialization`, duplicate downstack Studio worktree |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-S-studio-runtime-effect-refactor` | detached at `654f58d8f`, ancestor already contained by current runtime branches |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HG-habitat-grit-pattern-chain` | unrelated habitat stack |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-HR-habitat-repair-chain` | unrelated habitat repair stack |

Graphite render risk:

- `gt log --no-interactive` renders the Studio/runtime stack under `agent-HR-habitat-repair-chain (needs restack)`.
- Git ancestry review indicates that habitat branch is not actual Git ancestry for the Studio stack path.
- Do not run broad `gt restack`, `gt sync`, or `gt submit --stack` from this lane until stack parent metadata is intentionally resolved.

Relevant routers and authority:

- Root `AGENTS.md`: docs layout, generated artifact hygiene, Graphite workflow, root Nx/Bun entrypoints.
- `packages/civ7-direct-control/AGENTS.md`: runtime Civ7 control belongs in direct-control.
- `packages/civ7-control-orpc/AGENTS.md`: control RPC surfaces are shared contract boundaries.
- `mods/mod-swooper-maps/AGENTS.md`: generated mod outputs are regenerated, not hand-edited.

## Gate 3 - Diagnosis

The strongest diagnosis is proof-boundary collapse plus incomplete state-machine coverage.

Known current signals:

- Earlier focused verification did not cover all user scenarios and did not prove browser or in-game behavior.
- `setupConfig` was not enough: read RPCs, live RPCs, operations, events, UI adoption, dev startup, and operational proof each have separate failure modes.
- Read-only review found likely code-path risks around Run in Game phase classification, browser typed-error projection, event-stream stale local errors, and silent busy gates.
- Direct tuner unavailability must block live proof only, not source-level investigation.

## Gate 4 - Corpus

Corpus artifacts:

- `SCENARIO-CORPUS-LEDGER.md` for scenario and proof rows.
- `ERROR-BOUNDARY-LEDGER.md` for Effect/oRPC/browser/operation boundaries.

Required coverage includes read RPCs, live RPCs, stateful operations, event streams, UI surfaces, dev startup, generated/deploy proof, direct tuner proof, bounded logs, and in-game observation.

## Gate 5 - Grouping

Problem groups:

- Untested user flows.
- Proof overclaims.
- Router-boundary mistakes.
- Operation lifecycle classification gaps.
- Browser typed-error projection gaps.
- Event-stream and daemon restart adoption gaps.
- Dev-port and Nx/process-state risks.
- Generated-output handling risks.
- Graphite/worktree handoff risks.
- Stale doc/code divergence.
- Live verification gaps.

## Gate 6 - Expected Behavior

The next workstream should make each user scenario have:

- Admission behavior.
- Progress behavior.
- Terminal behavior.
- Retry/restart behavior.
- Browser-visible status and diagnostics.
- Server logging behavior.
- Proof labels that are earned independently.

Expected runtime proof labels remain separate:

- `tested`
- `built`
- `generated`
- `deployed`
- `tuner-exercised`
- `logged`
- `in-game observed`
- `Graphite submitted`
- `product proof`

## Gate 7 - Architecture Translation

Future packet design must translate the scenario corpus into changes across these boundaries:

- `packages/studio-server/src/router/**`: effect-oRPC declared error projection.
- `packages/studio-server/src/services/**`: tuner/session/direct-control cause preservation.
- `packages/studio-server/src/workflows/**`: phase-aware operation failure classification.
- `packages/studio-server/src/operationRuntime/**`: DTO/status/event truth.
- `apps/mapgen-studio/src/features/**`: browser typed-error handling and user diagnostics.
- `apps/mapgen-studio/src/app/**`: UI operation adoption, event-stream recovery, retry/restart affordance.
- `apps/mapgen-studio/src/server/**`: daemon identity, app-side runtime engines, dev startup surfaces.
- `mods/mod-swooper-maps/**`: generated/deploy proof surfaces, read-only unless regenerated by commands.

## Gate 8 - Future Slice Plan

The next objective must first design the full packet train, then implement only after the packet set is reviewed.

Expected packet families:

1. Server/runtime error-boundary packet.
2. Operation lifecycle classification packet.
3. Browser typed-error projection packet.
4. Event-stream and daemon restart adoption packet.
5. Dev startup and port/process proof packet.
6. Live Civ7 proof and proof-ledger packet.
7. Documentation and closeout packet.

Each packet needs explicit write set, tests, proof labels, review lane, and stop condition before implementation begins.

## Dev Startup Probe

Command attempted with isolated ports:

```bash
STUDIO_DAEMON_PORT=5294 STUDIO_DEV_PORT=5293 STUDIO_DEV_RPC_TARGET=http://127.0.0.1:5294 bun run dev:mapgen-studio
```

Observed result:

- Dependency build work began.
- Nx reported `Running in another Nx process...`.
- The command was interrupted before daemon/Vite startup proof.

Classification:

- Environment/Nx concurrency gate for this probe.
- Not evidence that the Studio daemon, Vite, ORPC handler, direct-control, or generated-output paths are healthy.
- Not evidence that they are broken.

Dev port support to preserve:

- Frontend `STUDIO_DEV_PORT`, default `5173`.
- Frontend `STUDIO_DEV_RPC_TARGET`, default `http://127.0.0.1:5174`.
- Daemon `STUDIO_DAEMON_PORT`, default `5174`.
- Daemon CLI overrides: `--host`, `--port`, `--repo-root`, `--assets-root`.
