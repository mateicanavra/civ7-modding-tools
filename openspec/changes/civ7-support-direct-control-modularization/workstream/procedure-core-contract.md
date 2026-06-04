# Effect/oRPC Procedure-Core Contract

This is a planning contract for future Effect/oRPC procedure cores over stable
direct-control atoms. It is not a source implementation, accepted schema,
transport adapter, in-game controller router implementation, App UI bridge
implementation, telemetry persistence layer, AI-ingestion contract, runtime
proof, or Task 2.9.4 row acceptance.

Current owner seed: `packages/civ7-direct-control/src/procedure-core.ts`
records a direct-control-local descriptor owner for procedure keys, stable atom
owners, projection policy, proof boundary, player scope, consumer class, and
mutation gate metadata. The descriptor factory now performs TypeBox runtime
shape validation before semantic procedure guards and reports descriptor
failures as `Civ7DirectControlError` instances with the
`procedure-descriptor-invalid` code plus structured reason/details. Focused
proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` rejects generic raw
command tunnel descriptors, rejects repo-local raw command-source/session
execution descriptors such as `runtime/command-serialization` / `jsLiteral`
and `session/execute` / `executeCiv7Command`, requires mutation descriptors to
carry approval, validator-first, postcondition, and no-repeat-after-unverified
gates, rejects malformed descriptor shapes before procedure promotion, and
snapshots schema-mismatch, raw-command-tunnel, and mutation-gates-missing error
details while keeping telemetry as an Effect/oRPC middleware hook rather than a
separate transport surface. This is local package proof only; it does not add
Effect/oRPC dependencies, create `packages/civ7-control-orpc`, implement
router/procedure behavior, choose a broader schema migration, claim runtime
proof, or accept the matrix row.

The procedure-core target exists to compose repo-owned direct-control
capabilities through typed procedures, context, middleware, error shaping,
correlation IDs, approval gates, and telemetry hooks. It must serve the
in-game controller router, external direct-control bridge, and future AI
services without turning any transport boundary into product authority.

## Core Boundary

Future procedure cores should be shared behavior modules. Callers may cross
different edges, but the core procedure/router contract should stay stable:

- CLI and no-network tests can call the router in-process.
- The game-scoped controller mod can call an in-process oRPC/Effect router
  behind serialized App UI ingress.
- `globalThis.Civ7IntelligenceBridge.invoke(...)` is serialized ingress through
  the existing Tuner/App UI boundary into that in-process router, not the
  product API.
- Studio browser clients may use HTTP `RPCHandler`/`RPCLink` after the core is
  coherent.
- OpenAPI or other external transports are edge adapters after procedure cores
  and tests exist.

No procedure core may expose arbitrary raw JavaScript command strings, raw
`game exec`, caller-owned socket/session state, raw SQL authority, or a generic
`control.call` tunnel.

## Future Procedure Atom Slots

Future implementation should converge on procedure atoms with these properties
or direct equivalents:

| Slot | Purpose |
|---|---|
| `procedureKey` | Stable router/procedure identity by capability, risk, and proof boundary. |
| `inputSchema` | Type-owned input contract with bounded values, player scope, approval reason when needed, and no raw JS literals. |
| `outputSchema` | Type-owned output contract with semantic result, debug/proof references, and evidence labels as appropriate. |
| `context` | Typed direct-control facade, controller facade if available, endpoint defaults, risk policy, approval, logger, clock, evidence sink, and live-session policy. |
| `middleware` | Reusable readiness, approval, validator-first, postcondition, relationship-authority, evidence-recording, error-normalization, and bounded polling policy. |
| `errorShape` | Typed errors that preserve direct-control parser labels, proof boundaries, and player-safe failure reasons without dumping raw internals by default. |
| `correlation` | Request/correlation identifiers for debug/proof/telemetry surfaces without leaking into normal CLI by default. |
| `projectionPolicy` | Explicit normal CLI, debug/internal service, AI-ingestion, telemetry, and procedure-core projection separation. |
| `proofBoundary` | Labels whether proof is local test, CLI verified, live-read, live-mutated, pending runtime proof, or planning evidence only. |

## Router Families

Procedure families should be named by operational surface, not transport:

- `health`;
- `runtime`;
- `controller`;
- `notifications`;
- `choices`;
- `city`;
- `unit`;
- `map`;
- `strategy`;
- `intelligence`;
- `session`.

The family list is a starting taxonomy, not an instruction to expose every
direct-control function.

## Schema Ownership

Current TypeBox public contracts stay in place until a consumer-backed schema
slice proves replacement value. Effect Schema is a candidate for new or
refactored Effect-native procedure-core, telemetry, and AI-ingestion contracts
where encode/decode, transformations, typed parse errors, Effect integration,
or machine-ingestion ergonomics materially help.

If oRPC requires Zod as an adapter layer, that boundary must be documented as
adapter-only. Zod must not become a third durable schema authority by drift.

Before schema migration or procedure-core row acceptance, the schema owner must
record:

- TypeBox ownership retained, replaced, or wrapped;
- Effect Schema ownership for new/refactored contracts if adopted;
- any Zod/oRPC adapter role;
- encode/decode behavior;
- typed error shape;
- runtime validation behavior;
- test ergonomics;
- migration blast radius;
- duplication cost;
- compatibility with normal CLI, debug/internal service, AI-ingestion,
  telemetry, and procedure-core projections.

## Middleware Boundaries

Middleware may centralize repeated policy only after procedure atoms make that
policy real. It may validate and record approval, but it must not invent
approval. Mutating procedures require approval-first, validator-first behavior,
postcondition classification, stale/unknown handling, and no-repeat guidance
where applicable.

Relationship authority remains structural: owner mismatch, contact, proximity,
visibility, or operation legality is not enough for hostile, enemy,
non-friendly, opponent, threat, war, ally, or suzerain labels without official
relationship/team/war/suzerain evidence.

## Acceptance Gaps

This contract plus the descriptor owner seed reduce the `contractArtifact`,
source-owner, descriptor runtime-validation, descriptor typed-error, and
no-raw-tunnel proof gaps for the current TypeBox descriptor shape, generic raw
fields, and repo-local command-source/session-execute owners in the Effect/oRPC
Procedure Cores row, but they do not accept the row. Acceptance still needs:

- final concrete procedure schema and proof owners;
- concrete procedure input/output owners over stable direct-control atoms;
- context/middleware/error/correlation owners;
- explicit boundaries for in-game controller router, external direct-control
  bridge, and future AI services;
- oRPC schema/procedure validation tests;
- final router/procedure error-shape snapshots;
- encode/decode round-trip tests;
- Bun runtime checks;
- CLI semantic projection tests;
- AI-ingestion contract fixture tests;
- middleware approval/correlation/error tests;
- no-raw-command-tunnel tests over stable direct-control atoms;
- proof-label guards preventing oRPC/local tests from being described as
  live-game proof.

## Stop Conditions

Stop and reframe if future procedure-core work:

- adds transport adapters before no-network procedure cores over stable atoms;
- adds `packages/civ7-control-orpc` behavior before procedure-core
  contracts/tests are accepted;
- exposes raw command strings, raw JavaScript literals, or generic control
  tunneling as procedure architecture;
- treats the App UI bridge or `Civ7IntelligenceBridge.invoke` as the product
  API instead of serialized ingress into the in-process router;
- lets handlers own tuner sockets, session reconnects, App UI/Tuner state
  discovery, or generated command strings outside `@civ7/direct-control`;
- starts schema migration without TypeBox / Effect Schema / Zod adapter
  disposition and tests;
- collapses normal CLI, debug/internal service, AI-ingestion, telemetry, and
  procedure-core outputs into one raw JSON shape;
- claims live/runtime proof from oRPC tests, type checks, local package tests,
  docs, target-thread evidence, or peer reports.
