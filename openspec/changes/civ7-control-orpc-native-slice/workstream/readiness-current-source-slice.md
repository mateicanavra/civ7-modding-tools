# Readiness Current Source Slice

Status: implemented local source slice.
Date: 2026-06-04.

## Scope

This slice replaces the transitional `runtime.playable.status` facade leaf with
the service-owned native procedure `readiness.current`.

The write set is:

- `packages/civ7-control-orpc/src/modules/readiness/**` for the contract-first
  readiness service leaf and Effect/oRPC handler;
- root control-oRPC contract/router exports to compose the new `readiness`
  router family;
- a procedure-specific `ORPCTaggedError` named
  `Civ7ReadinessCurrentUnavailableError`;
- removal of the public `runtime.playable.status` wrapper contract, router,
  procedure, error export, and wrapper-specific tests;
- focused local no-network tests for direct `call` and in-process server-side
  router client behavior.

No direct-control procedure-core implementation, custom middleware/context
pipeline, transport edge, CLI caller, Studio caller, in-game bridge, OpenAPI
surface, Task 2.9.4/5.x/6.x acceptance, runtime proof, or play-thread action
is part of this slice.

## Service Shape

`readiness.current` consumes the direct-control `getCiv7PlayableStatus` runtime
port through typed context and projects it into normal service output:

- readiness and playable status;
- support capability booleans for observation and approved mutation;
- bounded game UI/runtime-control source summaries;
- an error count instead of raw runtime error messages;
- semantic next steps.

It deliberately omits host, port, raw App UI/Tuner state objects, Tuner
snapshots, session details, raw command text, and runtime error messages from
normal output.

## Proof Captured

Focused tests prove:

- `readiness.current` calls a fake direct-control playable-status runtime port
  through the oRPC router without network transport;
- the server-side router client calls the same router graph;
- `host`, `port`, `state`, `stateName`, `session`, `command`, and
  `rawCommand` remain rejected procedure input and do not touch the fake
  runtime facade;
- direct-control facade failures become `READINESS_CURRENT_UNAVAILABLE` with
  safe structured data only;
- raw command-looking failure messages such as `CMD:1:Game.turn` are not
  serialized into public errors;
- normal readiness output does not serialize host, port, state, Tuner/App UI
  raw names, or raw runtime error text.

Verification run belongs to the closing commit body for the slice.

## Remaining Boundaries

This is local package proof only. It does not prove Civ7 runtime readiness,
runtime availability, CLI/Studio caller behavior, transport behavior, or
in-game controller behavior.

Shared readiness middleware remains pending until repeated service procedures
need the same readiness gate through native oRPC/effect-orpc primitives.
