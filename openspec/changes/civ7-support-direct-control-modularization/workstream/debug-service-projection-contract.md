# Debug/Internal Service Projection Contract

This is a planning contract for debug/internal service output. It is not a
source implementation, accepted schema, normal CLI semantic envelope,
AI-ingestion contract, telemetry contract, runtime proof, or Effect/oRPC
procedure-core contract.

The debug/internal projection exists so support operators, future procedure
middleware, and diagnostics can inspect raw direct-control state without
turning those internals into normal player-agent output or AI training input.
It is allowed to be richer and rougher than normal CLI output, but only when
the surface is explicitly debug/internal.

## Scope

The projection covers raw diagnostic output from direct-control and CLI support
surfaces such as:

- `packages/cli/src/commands/game/exec.ts`;
- `packages/cli/src/commands/game/health.ts`;
- `packages/cli/src/commands/game/inspect.ts`;
- `packages/cli/src/commands/game/status.ts`;
- `packages/cli/src/commands/game/catalog.ts`;
- `packages/cli/src/commands/game/visibility.ts`;
- direct-control runtime, session, catalog, map visibility, and root-inspection
  atom owners.

This contract does not authorize new command hierarchy, flags, telemetry
persistence, transport adapters, AI-ingestion artifacts, or procedure-core
implementation. It defines the boundary future implementation must preserve.

## Debug/Internal Fields

Debug/internal service projection may include these field classes when a
debug-owned command, flag, or procedure explicitly requests them:

| Field class | Examples | Boundary |
|---|---|---|
| Transport/session state | host, port, selected state role/name, socket status, reconnect attempt details | Debug/internal only; normal CLI may summarize readiness without raw transport details. |
| Raw probes | App UI snapshot, Tuner health snapshot, bounded root inspection, runtime API inspection, raw capability catalog provenance | Debug/internal only; not normal play output and not AI-ingestion input by default. |
| Route selection | which direct-control atom, state role, or command path was used | Debug/internal only unless summarized as a player-facing action family. |
| Closeout/postcondition internals | validator payloads, closeout traces, raw notification/postcondition evidence, stale/unknown details | Debug/internal or telemetry only; normal CLI gets semantic classification and reread guidance. |
| Correlation/diagnostics | request ids, correlation ids, timing details, parser labels, error details, retry counts | Debug/internal or telemetry only; normal CLI may show concise failure reason. |
| Resource/log/database proof | log markers, loaded resources, local debug DB rows, official-resource provenance | Debug/internal or explicitly source-labeled ingestion/telemetry contracts only. |

## Normal Projection Summaries

Normal CLI surfaces may consume debug/internal evidence only after summarizing it
into player-agent semantics. Allowed summary classes include:

- ready/unready status without raw transport/socket internals;
- player-agent blockers and decisions without raw probe trees;
- safe/unsafe next steps without raw command strings;
- postcondition classifications such as stale, unknown, no-state-change, or
  verified with concise player-facing reasons;
- relationship/proof caveats that avoid unsupported hostile/enemy/suzerain
  labels.

The summary must not expose raw service payloads by default.

## AI-Ingestion Boundary

AI-intelligence ingestion may not consume debug/internal projection as an
unlabeled product API. If a future ingestion row wants to use logs, local debug
databases, resource rows, runtime snapshots, or service diagnostics, it must
wrap them in an accepted ingestion contract with source, freshness, evidence
class, scope, and proof labels. Debug output alone is not an action diary and
does not replace direct-control traces.

## Procedure-Core Boundary

Future Effect/oRPC procedure cores may expose debug/internal diagnostics only
through typed debug/service procedures over stable direct-control atoms. They
must not tunnel raw JavaScript commands, caller-owned socket state, or App UI
bridge payloads as product authority. Procedure diagnostics must keep normal
CLI, AI ingestion, telemetry, and debug/service projections distinct.

## Current Owner Seed

`packages/cli/src/game-debug/debug-service-projection.ts` is the current source
owner seed for debug/internal projection field classes, owner metadata, and
payload path expectation helpers. Its focused proof owner is
`packages/cli/test/commands/game/debug-service-projection.test.ts`, and
command-integrated proof is in `packages/cli/test/commands/game.control.test.ts`.

The owner seed is wired to current debug-owned command payloads for `game exec`
dry-run routing, `game health` readiness/unavailability diagnostics,
`game inspect` runtime/App UI snapshots, `game status` composed playable status,
`game catalog --static`, and `game visibility`. That proof checks raw
transport/session state, route selection, runtime/App UI/map probes,
correlation diagnostics, and catalog provenance as debug/internal field
classes.

This is a TypeScript structural owner seed only. It does not implement a debug
service hierarchy, add flags, choose TypeBox or Effect Schema, define AI
ingestion inputs, add telemetry persistence, implement procedure diagnostics,
prove runtime/live-game behavior, or accept the matrix row.

## Acceptance Gaps

This contract reduces the `contractArtifact` gap for the Debug/Internal Service
Output row, and the owner seed reduces the source/proof ownership gap, but it
does not accept the row. Acceptance still needs:

- a final debug/internal service hierarchy owner and concrete schema/test owner;
- tests proving raw transport, session, probe, closeout, correlation, and
  diagnostic details are reachable only through debug-owned commands, flags, or
  future debug procedures;
- tests proving normal `game play` output and accepted AI-ingestion contracts do
  not emit or depend on this raw projection;
- stop-condition coverage for debug output becoming product action authority or
  a substitute for live runtime proof.

## Stop Conditions

Stop and reframe if future debug/service work:

- exposes raw diagnostic payloads as normal player-agent CLI output;
- lets AI consumers depend on raw debug output without source/freshness/evidence
  labels;
- treats debug probes, runtime reflection, raw SQL, or `game exec` as product
  action authority;
- claims live/runtime proof from local fake-runtime tests or debug snapshots
  alone;
- collapses debug/internal service output, telemetry, AI ingestion, procedure
  cores, and normal CLI projection into one shared raw JSON shape.
