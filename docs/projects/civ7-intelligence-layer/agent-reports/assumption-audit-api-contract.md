# API Contract Assumption Audit

Agent: Codex
Lane: Civ7 intelligence layer API contract audit
Date: 2026-06-03

## Goal

Investigate and challenge the API contract assumptions for the Civ7 in-game
companion API and the external direct-control/tuner caller. Produce a typed,
safe, agent-usable contract shape that does not expose arbitrary JavaScript as
the product API, and determine where oRPC is actually appropriate.

Safety: docs/code inspection only. No live-game mutation was performed in this
lane.

## Executive Conclusion

The current repo evidence supports two different boundaries, not one universal
"RPC everywhere" surface:

1. `@civ7/direct-control` plus its oRPC layer is a good fit for the external
   controlled caller boundary: CLI, local Node services, Studio endpoints, and
   agent runners under repo ownership.
2. The App UI companion bridge should not be an oRPC runtime embedded into
   `globalThis`. It should be a very small, product-specific, allowlisted RPC
   envelope exposed as `globalThis.Civ7IntelligenceBridge.invoke(encodedJson)`.
3. Raw `CMD:<stateId>:<javascript>` execution is a transport and implementation
   escape hatch, not a product API.

The main contract mistake to avoid is collapsing three things into one:

- direct-control transport capability,
- direct-control product contract,
- in-game companion bridge contract.

They have different consumers, different trust boundaries, and different safety
requirements.

## Evidence Inspected

Primary repo/code evidence:

- `packages/civ7-direct-control/README.md:3`
- `packages/civ7-direct-control/README.md:13`
- `packages/civ7-direct-control/README.md:61`
- `packages/civ7-direct-control/src/index.ts:1153`
- `packages/civ7-direct-control/src/index.ts:1183`
- `packages/civ7-direct-control/src/index.ts:1908`
- `packages/civ7-direct-control/src/index.ts:1985`
- `packages/civ7-direct-control/src/index.ts:2031`
- `packages/civ7-direct-control/src/index.ts:2140`
- `packages/civ7-direct-control/src/index.ts:2162`
- `packages/civ7-direct-control/src/index.ts:3936`
- `packages/civ7-direct-control/src/orpc/contracts.ts:54`
- `packages/civ7-direct-control/src/orpc/router.ts:61`
- `packages/civ7-direct-control/src/orpc/router.ts:76`
- `packages/civ7-direct-control/src/orpc/types.ts:7`
- `packages/civ7-direct-control/src/orpc/types.ts:17`
- `packages/civ7-direct-control/src/orpc/errors.ts:10`
- `packages/civ7-direct-control/src/orpc/errors.ts:23`
- `packages/civ7-direct-control/src/orpc/callable.ts:1`
- `packages/civ7-direct-control/test/orpc.test.ts:31`
- `packages/cli/src/commands/game/status.ts:3`

Primary project-doc evidence:

- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md:46`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md:155`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md:11`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md:48`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md:85`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md:111`
- `docs/projects/civ7-intelligence-layer/actuation-path-map.md:28`
- `docs/projects/civ7-intelligence-layer/actuation-path-map.md:46`
- `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md:171`
- `docs/projects/civ7-intelligence-layer/agent-reports/runtime-bridge-live-mutation.md:16`
- `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-action-surface.md:53`
- `docs/projects/civ7-direct-control/workstream/control-surface-expansion/agent-state-role-architecture.md:16`
- `docs/projects/civ7-direct-control/workstream/play-agent/output-contract.md:26`
- `docs/projects/civ7-direct-control/workstream/discovery/app-ui-api-inventory.md:49`
- `docs/projects/civ7-direct-control/workstream/discovery/tuner-api-inventory.md:1`

## What The Repo Already Proves

- `source-backed`: direct-control is the repo-owned runtime authority for Civ7
  control, and it currently executes raw JS over the tuner socket transport
  (`README.md:3-20`, `src/index.ts:1153-1181`).
- `source-backed`: the existing oRPC layer is already operation-centric and
  typed for controlled callers. It groups lifecycle, live reads, setup,
  actions, and capabilities, each with explicit input/output schemas
  (`src/orpc/contracts.ts:54-191`).
- `source-backed`: oRPC is currently used as an in-process typed client over
  the same router graph, not as a browser/App UI transport
  (`src/orpc/callable.ts:1-23`, `test/orpc.test.ts:139-164`,
  `packages/cli/src/commands/game/status.ts:35-45`).
- `source-backed`: mutating procedures already require approval context and do
  not run when approval is missing (`src/orpc/router.ts:61-68`,
  `src/orpc/router.ts:187-257`, `src/orpc/errors.ts:55-78`,
  `test/orpc.test.ts:67-120`).
- `source-backed`: the current envelope is minimal: `ok`, `observedAt`,
  optional `correlationId`, `result`, optional `evidencePolicy`
  (`src/orpc/types.ts:17-36`).
- `source-backed`: capability discovery exists today, but runtime method risk
  classification is heuristic: methods starting with `get`/`is`/`has` are
  marked `read`; everything else is only `medium` risk
  (`src/index.ts:2162-2197`, `src/index.ts:3936-3970`).
- `source-backed`: the project docs already reject companion-owned mutation and
  raw external JS as the desired product shape, but they still leave contract
  details underspecified (`SOLUTION-FRAME.md:155-161`,
  `runtime-bridge-and-probes.md:78-109`,
  `runtime-bridge-live-mutation.md:22-27`).

## API-Design Positioning

Using the `api-design` frame:

- Consumer:
  - primary external consumer: repo-owned agent runner / CLI / local service
  - primary in-game consumer: companion `UIScripts` bridge reached through
    direct-control
- Task:
  - observe current Civ7 state
  - request bounded companion observations/annotations
  - execute approved live actions only through direct-control
- Relationship:
  - controlled and known today, but high-stakes because stateful game mutation
    is irreversible or ambiguous once transport certainty is lost

Axis positions:

- Consumer relationship: known/controlled, but still needs strict contracts
  because prompt/tool learning will depend on observable fields.
- Contract formality: strict/schema-first. This is already where the oRPC layer
  is heading, and the risk profile justifies it.
- Interaction style: operation-centric RPC, not CRUD. The domain is verbs:
  `validate`, `request`, `start`, `stop`, `complete`, `snapshot`, `catalog`.
- Substrate:
  - external boundary: local Node/service boundary, where typed oRPC is useful
  - App UI boundary: in-game JS global surface, where a tiny JSON envelope is
    more appropriate than importing the external RPC substrate wholesale
- Domain shape: workflow-heavy, approval-heavy, postcondition-heavy.
- Maturity: early, but the mutation surface is risky enough that "early" does
  not justify loose contracts.

## Challenged Assumptions

### 1. "Because `globalThis` is proven, oRPC is the right bridge substrate there"

Status: `eliminated`

Why it fails:

- The repo evidence only proves that App UI `UIScripts` can attach a callable
  object to `globalThis`, not that an oRPC runtime buys anything in that
  context (`runtime-bridge-and-probes.md:23-28`, `:52-55`, `:139-153`).
- The existing oRPC usage is in-process Node-side router/client composition,
  not an App UI/browser mod transport (`src/orpc/callable.ts:1-23`,
  `test/orpc.test.ts:139-164`, `packages/cli/src/commands/game/status.ts:35-45`).
- The actual direct-control transport into Civ7 remains
  `CMD:<stateId>:<javascript>` (`README.md:13`, `src/index.ts:1153-1181`), so
  embedding oRPC in App UI would still need a custom string-call shim around
  `invoke(...)`.

Conclusion:

oRPC is suitable at the external service boundary. It is not the right product
substrate for the App UI global bridge itself.

### 2. "A generic `invoke(encodedEnvelope)` is already a sufficient contract"

Status: `eliminated`

Why it fails:

- Current bridge docs show a shape, not a full contract. The sample only gives
  `version`, `ping`, `invoke`, and `snapshot`, with no typed method taxonomy,
  error model, TTL, idempotency, or capability negotiation
  (`runtime-bridge-and-probes.md:111-129`).
- A single generic `invoke` without a first-class method allowlist recreates
  the same ambiguity as raw JS transport, only one layer higher.

Conclusion:

`invoke` can be the entrypoint, but not the contract. The contract must define
typed methods, their payloads, and their guarantees.

### 3. "Runtime capability catalog can become the product API surface"

Status: `eliminated`

Why it fails:

- The current catalog is discovery-oriented and partly heuristic. It enumerates
  runtime roots/methods and classifies read-risk by method-name prefixes
  (`src/index.ts:2162-2197`, `src/index.ts:3936-3970`).
- That is useful for operator discovery and internal research, but not strong
  enough to become the agent-facing callable contract.
- Exposing runtime-discovered methods as callable API would smuggle arbitrary
  engine internals into the product promise and destroy evolution freedom.

Conclusion:

Capability discovery should advertise curated product capabilities, not mirror
arbitrary runtime methods.

### 4. "Approval alone is enough for mutating safety"

Status: `eliminated`

Why it fails:

- Approval exists today (`src/orpc/errors.ts:55-78`, `router.ts:61-68`), but
  the current procedure context has no idempotency key, TTL, causation chain,
  or stale-request guard (`src/orpc/types.ts:9-15`).
- In a live Civ7 session, delayed or duplicated helper actions are a product
  bug even when "approved" in principle.

Conclusion:

Mutating or quasi-mutating helper methods need approval plus freshness and
deduplication semantics.

### 5. "Error wrapping is already a complete product error contract"

Status: `eliminated`

Why it fails:

- The current oRPC errors cleanly wrap direct-control and approval-required
  cases (`src/orpc/errors.ts:10-53`), but they are still transport/service
  errors, not a full agent-usable action contract.
- Missing pieces include retriable classification, stale/expired request
  classification, capability mismatch, state-role mismatch, and helper-method
  denial versus transport failure.

Conclusion:

The current error model is a good base for the external boundary, but it is not
yet complete for the companion bridge contract.

## Recommended Contract Shape

Use two explicit contracts.

### Contract A: External Direct-Control Contract

Audience: CLI, local service, agent runner, Studio backend.

Substrate: oRPC is appropriate here.

Why:

- Typed inputs/outputs already exist.
- Approval/context already exist.
- The consumer is Node-side and repo-controlled.
- This is where transport and session ownership already live.

Recommended shape:

- keep the operation-centric grouping already present:
  - `lifecycle.*`
  - `live.*`
  - `setup.*`
  - `actions.*`
  - `capabilities.*`
- keep raw `executeCiv7Command` and inspection helpers internal/expert-only;
  do not promote them as the primary product API
- add missing cross-cutting fields to the external procedure context/envelope

Recommended external envelope additions:

```ts
type DirectControlEnvelope<T> = {
  ok: true;
  contractVersion: "direct-control.v1alpha2";
  observedAt: string;
  correlationId?: string;
  requestId: string;
  causationId?: string;
  result: T;
  evidencePolicy?: Civ7RelationshipLabelEvidencePolicy;
};
```

Recommended external mutation context additions:

```ts
type DirectControlMutationContext = {
  mutationPolicy: "read-only" | "send-approved";
  approval: Civ7ActionApproval;
  requestId: string;
  correlationId?: string;
  idempotencyKey?: string;
  expiresAt?: string;
};
```

Notes:

- `requestId` should be required on all procedures, not only optional through
  `correlationId`.
- `idempotencyKey` only matters for effectful procedures.
- `expiresAt` is needed for delayed/retried helper flows and future queue-based
  interactions.

### Contract B: App UI Companion Bridge Contract

Audience: direct-control calling into a companion-owned `UIScripts` API inside
App UI.

Substrate: tiny custom JSON envelope over `globalThis.Civ7IntelligenceBridge`.

Why:

- The actual call path is JS-string execution into App UI.
- The bridge needs a narrow allowlist and a simple, inspectable contract.
- Importing the full external RPC substrate into the mod does not improve
  safety or clarity.

Recommended entrypoint:

```ts
globalThis.Civ7IntelligenceBridge.invoke(encodedJson: string): string
```

Recommended request envelope:

```ts
type CompanionBridgeRequest<TPayload = unknown> = {
  contractVersion: "civ7-companion.v1alpha1";
  requestId: string;
  correlationId?: string;
  idempotencyKey?: string;
  method: CompanionBridgeMethod;
  sentAt: string;
  expiresAt?: string;
  caller: "direct-control";
  stateRole: "app-ui";
  payload: TPayload;
  approval?: {
    token: string;
    hash: string;
    mode: "read-only" | "display-only" | "helper-approved";
  };
};
```

Recommended response envelope:

```ts
type CompanionBridgeResponse<TResult = unknown> =
  | {
      ok: true;
      contractVersion: "civ7-companion.v1alpha1";
      requestId: string;
      correlationId?: string;
      handledAt: string;
      result: TResult;
      capabilityVersion: string;
    }
  | {
      ok: false;
      contractVersion: "civ7-companion.v1alpha1";
      requestId: string;
      correlationId?: string;
      handledAt: string;
      error: {
        code: CompanionBridgeErrorCode;
        message: string;
        retriable: boolean;
        stale: boolean;
        details?: unknown;
      };
      capabilityVersion: string;
    };
```

Recommended initial allowlisted methods:

- `bridge.ping`
- `bridge.snapshot`
- `intent.enqueue`
- `intent.ack`
- `overlay.upsert`
- `overlay.clear`
- `probe.receipt`

Optional later read-only additions after proof:

- `hint.can-start`
- `hint.current-player`
- `hint.notification-head`

Deferred helper namespace:

- `helper.*` only after disposable proof, and only when each helper is mapped to
  a direct-control-owned approved action record.

## Method Allowlist Rules

These should be explicit product rules, not just implementation habits.

1. No product method may accept arbitrary JS source.
2. No product method may accept `{ root, method, args }` or dotted-path
   reflection.
3. No product method may expose raw `Game.*Operations.sendRequest` or
   `Game.*Commands.sendRequest`.
4. No product method may expose raw `Database.query`.
5. Every method must declare:
   - required state role
   - visibility scope
   - whether it is read-only, display-only, or helper-approved
   - whether idempotency is required
   - whether TTL is required

## Versioning Recommendation

Recommended version policy:

- separate versions per boundary:
  - `direct-control.v1alphaN`
  - `civ7-companion.v1alphaN`
- version in the envelope, not only in docs
- capability response also returns `capabilityVersion`
- changes are additive within the same alpha version line
- breaking method or payload changes require a new contract version, not silent
  mutation of existing `invoke` behavior

Why:

- The current static capability catalog version (`direct-control-v1`) is useful
  but too coarse to version both discovery and execution semantics
  (`src/index.ts:2144`, `src/index.ts:2195`).
- The bridge docs currently use a sample object `version: "0.1.0"`; that is
  too implementation-flavored and not enough as a contract regime
  (`runtime-bridge-and-probes.md:114-123`).

## Error Contract Recommendation

For the external oRPC boundary:

- keep the existing typed error classes
- add explicit data fields for:
  - `retriable`
  - `stale`
  - `phase` (`transport`, `approval`, `validation`, `postcondition`,
    `capability`, `bridge`)
  - `requestId`

For the App UI bridge boundary:

Recommended error codes:

- `unsupported-contract-version`
- `unknown-method`
- `capability-disabled`
- `approval-required`
- `approval-invalid`
- `expired-request`
- `duplicate-request`
- `state-role-mismatch`
- `visibility-denied`
- `bridge-internal-error`

This keeps agent behavior sane: it can distinguish "retry later" from "you
asked for something forbidden" from "your request is stale".

## Correlation, Idempotency, And TTL

Recommended policy:

- `requestId`: required for every call
- `correlationId`: optional trace across a full tactical episode or turn plan
- `idempotencyKey`: required for any helper-approved bridge method; optional
  for display-only methods
- `expiresAt`: required for helper-approved methods; optional for read-only
  methods; short TTL preferred for UI-state-sensitive requests

Why this matters here:

- The current direct-control procedures only carry optional `correlationId`
  (`src/orpc/types.ts:9-15`, `:17-36`).
- The project already expects direct-control to own no-replay and
  postcondition-backed mutation discipline (`runtime-bridge-live-mutation.md:16-27`,
  `agent-action-surface.md:35-39`).
- Without TTL and idempotency, queued or repeated bridge calls can become
  semantically wrong even if the transport succeeds.

## Capability Discovery Recommendation

Split discovery into two products:

1. Internal/operator discovery:
   - current runtime inspection and runtime capability catalog can stay for
     research and authoring
2. Product capability discovery:
   - expose only curated callable methods
   - include per-method metadata:
     - `method`
     - `sinceVersion`
     - `requiredApprovalMode`
     - `requiresIdempotencyKey`
     - `requiresExpiry`
     - `visibility`
     - `stateRole`
     - `stability` (`alpha`, `stable`, `deprecated`)

Do not make runtime-discovered methods directly invocable from the product API.

## Eliminated API Shapes

- `execute(command: string)` as the product contract
- `invoke({ js })`
- `invoke({ root, method, args })`
- exposing runtime catalog entries as directly callable
- CRUD-by-game-object API like `/units/:id`, `/cities/:id`, `/players/:id`
- companion-owned `sendRequest`
- raw SQL or raw `Database.query` as strategy-agent API
- embedding oRPC as the first-class App UI bridge substrate

## Residual Unknowns

- `source-backed`: a project-owned `Civ7IntelligenceBridge` still needs
  lifecycle proof across UI reload, load/save, and turn changes
  (`runtime-bridge-and-probes.md:190-196`).
- `source-backed`: `localStorage` is plausible but collision-prone; the repo
  already has evidence of key-sharing workarounds in local mods
  (`runtime-bridge-live-mutation.md:179-183`).
- `source-backed`: safe read-only helper methods beyond `ping/snapshot/receipt`
  are not yet formally proven as a stable contract.
- `source-backed`: helper-approved actions remain deferred until disposable
  proof with token, allowlist, visible ack, and postcondition readback
  (`runtime-bridge-and-probes.md:62`, `:107-109`, `:192`,
  `actuation-path-map.md:49`).
- `hypothesis`: a future HTTP/WebSocket oRPC service may be useful for external
  multi-client orchestration, but the repo does not yet need daemon/service
  ownership to justify that move (`agent-state-role-architecture.md:78-99`).

## Recommended Next Step

Build the contract in this order:

1. tighten the external oRPC envelope/context with `requestId`,
   `contractVersion`, and mutation freshness fields
2. define a curated companion bridge method enum and JSON schemas
3. implement only `bridge.ping`, `bridge.snapshot`, and `probe.receipt`
4. add capability discovery for curated bridge methods
5. defer all `helper.*` methods until disposable proof

That sequence preserves the current repo architecture, avoids exposing
arbitrary JS as product API, and keeps oRPC where it is strong: the external
controlled boundary.

## Product Implication

Strategy agents should reason in terms of typed operations and typed companion
intents, not JavaScript strings. The product API should present:

- direct-control as the only live action authority
- companion bridge as a narrow observation/display/ack channel
- runtime introspection and raw JS as internal implementation tools

## Doc Edits

Made:

- Added this report:
  `docs/projects/civ7-intelligence-layer/agent-reports/assumption-audit-api-contract.md`

Deferred follow-up docs, if later edits are allowed:

- tighten `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
  so `invoke` is described as an entrypoint over a typed method allowlist, not
  as the contract by itself
- tighten `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md` to state
  explicitly that oRPC is recommended for the external direct-control boundary,
  while App UI `globalThis` stays a custom bounded bridge contract
- tighten `docs/projects/civ7-intelligence-layer/actuation-path-map.md` to
  distinguish "primary bridge ingress" from "shared transport/protocol choice"
