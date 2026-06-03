# Supervisor Notice: Controller Bridge Substrate Correction

Date: 2026-06-03
Priority: urgent/P1
Workstream: `direct-control-game-controller-bridge`

## Message

The controller bridge solution materially changed and should be propagated to
any active OpenSpec or implementation workstream that is designing the Civ7
intelligence control surface.

The active design is no longer "oRPC outside, small custom JSON RPC inside the
game." The in-game controller mod API should be an in-process oRPC/Effect
callable router loaded through Civ7 native `scope="game"` `UIScripts`.
`globalThis.Civ7IntelligenceBridge.invoke(...)` remains necessary, but only as
the serialized ingress adapter used by `@civ7/direct-control` to cross the
existing tuner socket/App UI command boundary into that router.

This makes oRPC/Effect the shared substrate for three surfaces:

- the internal game controller mod API;
- the external direct-control bridge API;
- future internal AI intelligence services that may need pub/sub, queues,
  schedules, build-queue helpers, strategy/tactics invocations, or other
  in-game orchestration.

Do not implement the controller as a hand-maintained App UI method table or an
ad hoc JSON-envelope product API. The envelope is still needed for transport
encoding and bounds, but procedure definitions, schemas, policy context,
approval checks, proof sinks, and future controller internals should live in the
oRPC/Effect router/runtime substrate.

## Updated Artifacts

- `openspec/changes/direct-control-game-controller-bridge/proposal.md`
- `openspec/changes/direct-control-game-controller-bridge/design.md`
- `openspec/changes/direct-control-game-controller-bridge/specs/civ7-direct-control/spec.md`
- `openspec/changes/direct-control-game-controller-bridge/tasks.md`
- `docs/system/ADR.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-intelligence-layer/workstream/direct-control-game-controller-bridge/`
- `.agents/skills/civ7-orpc-control-architecture/SKILL.md`

## Required Response

Any active supervisor/OpenSpec workstream should re-check its solution frame for:

- stale "external-only oRPC" assumptions;
- stale "tiny App UI JSON RPC" controller implementation assumptions;
- direct-control/OpenSpec tasks that omit shared controller contracts, in-process
  router/runtime modules, or Effect service context;
- AI intelligence designs that introduce a separate substrate instead of
  extending the oRPC/Effect service model.
