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
`procedure-descriptor-invalid` code plus structured reason/details. The
descriptor also records a correlation policy: request IDs are generated per
call or caller-provided-and-validated, normal CLI omits them by default,
debug/proof diagnostics may include them, and telemetry attaches them only when
procedure telemetry is enabled. The descriptor now binds procedures to explicit
direct-control schema references through `inputSchema` and `outputSchema`
owner/export slots, with local guards that keep schema owners in
`@civ7/direct-control`, require simple exported schema identifiers, and reject
raw command-source/session schema references. The descriptor now also records
context requirements for direct-control facade access, endpoint defaults,
state selection, logger, evidence sink, and live-session policy where relevant,
and rejects host/port/state procedure input fields when those responsibilities
are declared context-owned. The procedure-core owner also validates local input
and output payloads against explicitly resolved TypeBox schema artifacts and
reports schema mismatches through structured direct-control errors without
executing atoms, registering a router, or owning transport behavior. The
procedure-core owner also has a no-network call primitive over injected
handlers that validates input before handler execution, validates output after
handler execution, returns procedure output separately from debug/telemetry
diagnostics, resolves correlation IDs according to descriptor policy, and
normalizes handler failures with typed direct-control error details. The first
concrete descriptor
artifact is `packages/civ7-direct-control/src/play/ready/unit-procedure.ts`,
which owns the `unit.ready.view` descriptor adjacent to the ready-unit atom and
schema exports. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` rejects generic raw
command tunnel descriptors, rejects repo-local raw command-source/session
execution descriptors such as `runtime/command-serialization` / `jsLiteral`
and `session/execute` / `executeCiv7Command`, requires mutation descriptors to
carry approval, validator-first, postcondition, and no-repeat-after-unverified
gates, rejects malformed descriptor shapes before procedure promotion, and
snapshots schema-mismatch, raw-command-tunnel, and mutation-gates-missing error
details while rejecting `live-runtime-proof` claims from the local descriptor
owner, proving ready-unit descriptor schema references point to the
ready-unit schema exports, resolving those references against explicit
caller-provided TypeBox schema artifacts, rejecting descriptor field lists that
name fields missing from the resolved schema root properties, proving
correlation stays omitted from normal CLI by default, and proving telemetry
correlation is tied to the Effect/oRPC middleware hook rather than a separate
transport surface, and proving endpoint/state context ownership keeps
host/port/state selectors out of procedure input while raw command/session
fields remain blocked by the no-raw-command-tunnel guard. The second adjacent
read-atom descriptor artifact is
`packages/civ7-direct-control/src/play/ready/city-procedure.ts`, which owns the
`city.ready.view` descriptor adjacent to the ready-city atom and schema
exports. The third adjacent read-atom descriptor artifact is
`packages/civ7-direct-control/src/play/ready/move-preview-procedure.ts`, which
owns the `unit.move.preview` descriptor adjacent to the unit move-preview atom
and schema exports. The first adjacent runtime-support descriptor artifact is
`packages/civ7-direct-control/src/runtime/playable-status-procedure.ts`, which
owns the `runtime.playable.status` descriptor adjacent to the composed
playable-status atom and schema exports. This is local package proof only; it
does not collect
runtime evidence, add Effect/oRPC dependencies, create
`packages/civ7-control-orpc`, implement router/procedure behavior, choose a
broader schema migration, claim runtime proof, or accept the matrix row.

Concrete read-atom schema seeds:
`packages/civ7-direct-control/src/play/ready/unit.ts` now owns TypeBox schemas
for `getCiv7ReadyUnitView` input, output, operation candidates, nearby plots,
and promotion readiness. Focused proof in
`packages/civ7-direct-control/test/ready-unit-view.test.ts` validates the
existing fake-runtime ready-unit result against the output schema and rejects
out-of-bound input plus root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. This is one read atom's
schema-owner seed only; it does not choose Effect Schema, migrate existing
contracts, implement a router/procedure, claim runtime proof, or accept the
matrix row.

`packages/civ7-direct-control/src/play/ready/city.ts` now owns TypeBox schemas
for `getCiv7ReadyCityView` input, output, city operation candidates,
production candidates, town-focus options, and population-placement slots.
Focused proof in
`packages/civ7-direct-control/test/ready-city-view.test.ts` validates the
existing fake-runtime ready-city result against the output schema and rejects
out-of-bound input plus root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. Complex nested runtime values
remain `unknown` within named TypeBox owner fields until a later schema slice
accepts narrower nested contracts.

`packages/civ7-direct-control/src/play/ready/move-preview.ts` now owns TypeBox
schemas for `getCiv7UnitMovePreview` input, output, neutral relationship
policy, and read-only movement preview slots. The shared
`packages/civ7-direct-control/src/play/map/types.ts` owner now exports
`Civ7MapLocationSchema` with the same bounded-integer `0..1_000_000`
`x`/`y` boundary as `validateMapLocation`. Focused proof in
`packages/civ7-direct-control/test/unit-move-preview.test.ts` validates the
existing fake-runtime unit move-preview result against the output schema,
rejects out-of-bound preview limits, rejects fractional/negative/over-bound
map locations through both TypeBox and the existing atom validation path, and
rejects root-level raw command fields. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the schemas are
exported for future procedure-core consumers. Complex engine-derived movement
and path values remain `unknown` within named TypeBox owner fields until a
later schema slice accepts narrower nested contracts.

`packages/civ7-direct-control/src/runtime/playable-status.ts` now owns TypeBox
schemas for `getCiv7PlayableStatus` input, readiness labels, and output. The
supporting runtime owners
`packages/civ7-direct-control/src/runtime/{app-ui-snapshot,tuner-health}.ts`
now own TypeBox schemas for the App UI snapshot and Tuner health result shapes
that `getCiv7PlayableStatus` composes. The playable-status input schema is
empty with `additionalProperties: false`; endpoint/session selection remains a
procedure context concern, not host/port/state/raw-command input. Focused proof
in `packages/civ7-direct-control/test/runtime-and-catalog.test.ts` validates
the existing fake App UI/Tuner results against the schemas, validates non-ready
shell and unavailable/error shapes including failed probes, omitted optional
`tuner`, and `errors` evidence, and rejects root-level raw command fields.
Public facade proof in `packages/civ7-direct-control/test/public-api.test.ts`
verifies the schemas are exported for future procedure-core consumers.

The adjacent ready-unit descriptor artifact reuses those schema exports and
records root input/output field names from the actual TypeBox schemas,
including `legalOperations` for the ready-unit operation candidates. Focused
proof in `packages/civ7-direct-control/test/ready-unit-procedure.test.ts`
checks the descriptor's input/output field lists against resolved schema root
properties so stale fixture names do not become procedure contract fields. The
generic resolver guard in `packages/civ7-direct-control/src/procedure-core.ts`
now owns that field-list check for any descriptor resolved against explicit
schema artifacts.

The adjacent ready-city descriptor artifact reuses the ready-city schema exports
and records `city.ready.view` beside `getCiv7ReadyCityView`. Focused proof in
`packages/civ7-direct-control/test/ready-city-procedure.test.ts` checks the
descriptor's input/output field lists against resolved schema root properties,
including `legalOperations`, `productionCandidates`, `townFocusOptions`, and
`populationPlacement`, without registering a router or transport adapter.

The adjacent unit move-preview descriptor artifact reuses the unit move-preview
schema exports and records `unit.move.preview` beside
`getCiv7UnitMovePreview`. Focused proof in
`packages/civ7-direct-control/test/unit-move-preview-procedure.test.ts` checks
the descriptor's input/output field lists against resolved schema root
properties, including reachability, queued/requested destination/path, and
neutral `relationshipPolicy`, without registering a router or transport
adapter.

The adjacent playable-status descriptor artifact reuses the playable-status
schema exports and records `runtime.playable.status` beside
`getCiv7PlayableStatus`. Focused proof in
`packages/civ7-direct-control/test/playable-status-procedure.test.ts` checks
the descriptor's empty input schema rejects endpoint/session/raw-command fields
and its output field list resolves against the composed playable-status schema
root properties, including non-ready unavailable output without a `tuner`
property, without registering a router or transport adapter.

Local procedure-core payload validation now lives in
`packages/civ7-direct-control/src/procedure-core.ts`. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` validates ready-unit
input/output payloads and unit move-preview destination payloads against the
resolved descriptor schema artifacts, including ready-unit bounded input,
unit move-preview validator-equivalent map-location bounds, ready-unit output
shape, and raw root-field rejection. Public facade proof in
`packages/civ7-direct-control/test/public-api.test.ts` verifies the helpers are
exported. This is schema-payload proof only; it does not execute direct-control
atoms, add a router, add Effect/oRPC dependencies, choose Effect Schema, claim
runtime proof, or accept the matrix row.

Local no-network procedure-core calls now live in
`packages/civ7-direct-control/src/procedure-core.ts`. Focused proof in
`packages/civ7-direct-control/test/procedure-core.test.ts` calls an injected
ready-unit handler through the procedure-core owner, proves validated input
reaches the handler, invalid input prevents handler execution, invalid output
fails after handler execution, caller-provided correlation ID policy is enforced,
and handler failures are normalized with procedure and correlation details.
Public facade proof in `packages/civ7-direct-control/test/public-api.test.ts`
verifies the call result/diagnostic schemas and call helper are exported. This
is local injected-handler proof only; it does not execute live direct-control
atoms, add a router, add Effect/oRPC dependencies, choose Effect Schema, claim
runtime proof, or accept the matrix row.

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
source-owner, descriptor runtime-validation, descriptor typed-error,
descriptor correlation-policy, descriptor live-runtime-proof guard, and
descriptor context-policy, and no-raw-tunnel proof gaps for the current TypeBox
descriptor shape, generic raw fields, repo-local command-source/session-execute
owners, context-owned endpoint/state input fields, and adjacent ready-unit,
ready-city, unit move-preview, and playable-status descriptor artifacts with
schema-root field-list validation plus local payload validation against
resolved schema artifacts plus a local injected-handler call primitive in the
Effect/oRPC Procedure Cores row, but they do not accept the row. Acceptance
still needs:

- final concrete procedure schema and proof owners;
- concrete procedure input/output owners over stable direct-control atoms
  beyond the ready-unit, ready-city, unit move-preview, and playable-status
  schema seeds;
- final middleware/error/correlation owners and runtime context construction
  beyond descriptor context-policy metadata and the local injected-handler call
  helper;
- final schema reference registration in the runtime router/procedure owner;
- explicit boundaries for in-game controller router, external direct-control
  bridge, and future AI services;
- final oRPC schema/procedure validation tests beyond the local TypeBox
  payload/call helper;
- final router/procedure error-shape snapshots;
- encode/decode round-trip tests;
- Bun runtime checks;
- CLI semantic projection tests;
- AI-ingestion contract fixture tests;
- final middleware approval/correlation/error tests;
- no-raw-command-tunnel tests over stable direct-control atoms;
- final proof-label guards in the procedure/router/runtime-proof owner.

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
