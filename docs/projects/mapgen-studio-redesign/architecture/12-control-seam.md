# 12 — Studio ↔ Control-oRPC Seam (designed-toward stack-top, not yet on main)

> **Status:** designed-toward the **tip of the live-control `codex/*` stack**, **not
> yet on `main`**. This document captures the *target* control-oRPC contract
> surface the studio will consume and the **thin adapter seam** the studio binds
> through. It is normative for studio design intent (FRAME §6); it is **not** a
> description of code on `main`. We design toward it, stage behind a seam, and
> bind the real client when the live-control stack lands.
>
> **Authority order:** [`FRAME.md`](../FRAME.md) → [`00-GOAL.md`](../00-GOAL.md) →
> this doc + [`10-target-architecture.md`](10-target-architecture.md) →
> [`audit/05-server-contracts.md`](../audit/05-server-contracts.md).
> **Hard core (unchanged):** behavior parity for map-gen, Deck.gl, recipes, the
> live-runtime poll's staleness/backoff gating, localStorage schema, browserRunner
> gating. The seam **moves** where live reads come from; it does not rewrite their
> semantics. **No FireTuner reads** from the studio (canary/diagnostic only). Never
> re-implement live reads in the studio.

## 0. Stack-top provenance (capture this before binding)

The contract surface below was captured from the **tip of the live-control stack**.
The consolidation playbook
([`LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md`](../../graphite-stack-integration/LIVE-CONTROL-STACK-CONSOLIDATION-PLAYBOOK.md))
names the leaf as `codex/live-control-source-route-docs-adoption`; that branch was
**not present in the local Graphite topology** at capture time (the stack has been
partially consolidated). The observed tip is:

| Field | Value (capture: 2026-06-08) |
| --- | --- |
| Observed leaf branch | `codex/live-control-hotseat-source-route-adoption` |
| Tip commit | `7ea1cbd5` `docs(civ7): update controller bridge handoff metadata` |
| Target package | `packages/civ7-control-orpc` (**absent from `main`; empty placeholder on our branch**) |
| Bridge mod | `mods/mod-civ7-intelligence-bridge` (`Civ7IntelligenceBridge` host install) |

**Re-verify the tip before binding.** Per the playbook, the 570→≤50 consolidation
is in flight; the exact leaf name, survivor names, and even a few schema field
names may shift under fold/rename. Treat the **shapes** below as the durable
contract and re-pin the branch + commit at bind time. If the package landing on
`main` diverges structurally from this capture, the FRAME §3 falsifier fires
(“the designed seam is incompatible with what lands on `main`”) — stop and
re-baseline, do not paper over it.

## 1. What the package exports (target consumable surface)

`@civ7/control-orpc` (`packages/civ7-control-orpc/src/index.ts`) is a
**contract-first oRPC package** built on `effect-orpc` + TypeBox standard schemas.
Three layers are relevant to the studio, in increasing order of coupling:

1. **The contract** (`Civ7ControlOrpcContract`) — a pure typed router contract,
   no logic. The single source of truth for procedure shapes and error maps.
2. **The router + server client** (`Civ7ControlOrpcRouter`,
   `createCiv7ControlOrpcServerClient(context)`) — an in-process oRPC router
   client. Requires a `Civ7ControlOrpcContext` carrying a **direct-control
   facade** (i.e. it runs where direct-control can reach the game). **The studio
   does not construct this** — it lives game-side / server-side.
3. **The intelligence-bridge ingress** (`createCiv7IntelligenceBridge`,
   `installCiv7IntelligenceBridge`, `Civ7IntelligenceBridge`) — the **envelope
   ingress** that validates an untyped request envelope, builds context, enforces
   the mutation-proof boundary, and dispatches to the router client. **This is the
   seam the studio talks to**, indirectly, through transport.

### 1.1 Contract namespaces (the procedure corpus)

`Civ7ControlOrpcContract` (`src/contract.ts`) is a router of twelve domain
modules. Each module owns a `contract.ts` (TypeBox I/O) + `router.ts` (effect
implementation). The procedure-key strings (used by the bridge envelope) follow
the contract path.

| Module | Risk | Studio-relevant procedures (procedureKey) |
| --- | --- | --- |
| `world` | read-only | `world.current`, `world.plot.read`, `world.grid.read` |
| `readiness` | read-only | `readiness.current` |
| `attention` | read-only | `attention.current`, `attention.priorities` |
| `strategy` | read-only | `strategy.frontSummary`, `strategy.tacticalReads`, `strategy.formationSnapshot`, `strategy.civilianRouteTriage` |
| `notifications` | read / runtime | `notifications.queue`, `notifications.dismiss.request`, `notifications.advisorWarning.request` |
| `turn` | mutation | `turn.complete.request` |
| `city` | mutation | `city.production.choice.request`, `city.population.place.request`, `city.townFocus.change.request`, `city.townFocus.review.request` |
| `unit` | mutation | `unit.target.action.request`, `unit.upgrade.request`, `unit.resettle.request` |
| `diplomacy` | mutation | `diplomacy.response.request`, `diplomacy.firstMeet.response.request` |
| `government` | mutation | `government.choice.request`, `government.celebration.choice.request` |
| `narrative` | mutation | `narrative.choice.request` |
| `progression` | mutation | `progression.{technology,culture}.{choice,target}.request`, `progression.attribute.{purchase,review}.request`, `progression.tradition.{change,review}.request`, `progression.dashboard.current`, `progression.traditions.current` |

Each procedure carries `Civ7ControlOrpcProcedureMeta` (`src/metadata.ts`):
`{ family, procedureKey, proofBoundary, risk }`, where `risk ∈
read-only | runtime-support | mutation` and
`proofBoundary ∈ local-package-test | pending-runtime-proof | runtime-proof`.
**This `risk`/`proofBoundary` metadata is the studio's authoritative read-vs-mutation
classifier** — the studio MUST NOT hardcode its own list.

### 1.2 What the studio actually needs (read surface)

The studio's live-state needs map to the **read-only** procedures, primarily:

- **`world.current`** → replaces the aggregated live-status read. Output shape
  (`src/modules/world/contract.ts`) carries `playable`, `readiness` (string),
  `sourceStatus` (per-source `read | skipped-not-playable | skipped-unavailable`),
  nullable `turn`/`map`/`players`/`localPlayer`, and a `nextStep` hint
  (`read-attention | restore-readiness | enter-game | inspect-world`).
- **`world.grid.read`** / **`world.plot.read`** → replace the map-grid tile-window
  snapshot read (today `GET /api/civ7/live/snapshot`). Bounds/fields semantics are
  owned by the contract input schemas — port the studio's clamp/default logic
  *into the request the studio sends*, not into a re-implemented reader.
- **`readiness.current`** → the readiness level
  (`tuner-ready | app-ui-game | begin-ready | loading | shell | unavailable`) +
  capability (`canObserve`, `canMutate`, `reason`). This is the **gating signal**
  the studio's adaptive poll and the run-in-game flow should consult.
- **`attention.current` / `attention.priorities`** and **`strategy.*`** are
  available read surfaces the redesigned studio may surface later; out of scope to
  wire in the first bind.

Map-gen authoring, save/deploy, and Run-in-Game (the `runInGame.*` / `mapConfigs.*`
endpoints in [`audit/05`](../audit/05-server-contracts.md)) are **NOT** part of
control-oRPC. They remain studio-server concerns (see §5).

## 2. The ingress contract (how requests cross the seam)

The studio never calls `createCiv7ControlOrpcServerClient` (no direct-control
facade exists studio-side, and must not). It speaks the **intelligence-bridge
envelope**, which is the package's public ingress.

### 2.1 Request envelope

`Civ7ControllerBridgeRequestSchema` (`src/bridge/controller-ingress.ts`) is a
discriminated union keyed on `procedureKey`. Each member:

```ts
{
  procedureKey: "<contract.path.string>",   // literal discriminant
  input: <typebox input for that procedure>,
  correlationId?: Civ7ControlOrpcCorrelationId,  // optional, validated
}
```

### 2.2 Response envelope

`Civ7ControllerBridgeResponse = Success | Failure`:

```ts
// success (per-procedure, discriminated on procedureKey)
{ ok: true, procedureKey: "<key>", output: <typebox output>, correlationId?: ... }

// failure (uniform)
{ ok: false, error: { code, message, reason }, correlationId?: ... }
```

The ingress **never throws across the seam** — every failure is a
`{ ok: false, error }` envelope. Failure `reason` is drawn from a closed set
including `procedure-not-allowed`, `procedure-not-supported`, `invalid-envelope`,
and the domain `*UnavailableError` cases. Failure `code` values observed:
`BRIDGE_PROCEDURE_NOT_ALLOWED`, `BRIDGE_BAD_REQUEST`,
`BRIDGE_CONTROLLER_PROOF_REQUIRED`, `BRIDGE_PROCEDURE_NOT_SUPPORTED`.

### 2.3 The `invoke` boundary

`createCiv7IntelligenceBridge({ createContext })` →
`{ invoke(request: unknown): Promise<Civ7ControllerBridgeResponse> }`.

`invokeCiv7ControllerBridgeRequest` enforces, in order:
1. **allowlist** — unsupported procedureKey → `BRIDGE_PROCEDURE_NOT_ALLOWED`;
2. **envelope validation** (`Value.Check`) → `BRIDGE_BAD_REQUEST`;
3. **context build** via `createContext(request)`;
4. **mutation-proof gate** — mutation requests with no controller proof →
   `BRIDGE_CONTROLLER_PROOF_REQUIRED`;
5. **controller support** — `context.controller.supported{Read,Mutation}Procedures`
   must include the key → `BRIDGE_PROCEDURE_NOT_SUPPORTED`;
6. dispatch to `createCiv7ControlOrpcServerClient(context)[module][proc](input)`.

The bridge is installed on a global host key
(`CIV7_INTELLIGENCE_BRIDGE_GLOBAL_KEY = "Civ7IntelligenceBridge"`) by the
game-side mod (`mods/mod-civ7-intelligence-bridge`). **The studio is on the other
side of a transport from that host** — it does not install the bridge and does not
hold the direct-control facade.

## 3. The studio-side seam (thin adapter — what we build)

The studio binds to control-oRPC through **one thin port** with **two
implementations**, so today's behavior is preserved and the real client drops in
later without touching consumers.

```
src/lib/control/
  port.ts        # LiveControlPort interface — the ONLY thing UI/query code imports
  envelope.ts    # request/response envelope types mirrored from the bridge contract
  client.ts      # createControlOrpcClient(): RPCLink → createORPCClient
                 #   → createTanstackQueryUtils  (binds when the package lands)
  legacyAdapter  # current @civ7/direct-control-backed impl behind the SAME port
  index.ts       # selects impl by a single flag/env; default = legacy until bind
```

### 3.1 The port (stable consumer contract)

```ts
export interface LiveControlPort {
  // reads — the studio's live-state surface
  worldCurrent(): Promise<WorldCurrent>;
  readinessCurrent(): Promise<ReadinessCurrent>;
  worldGrid(bounds: GridBounds): Promise<WorldGrid>;
  // future: attention, strategy reads
}
```

- **UI, TanStack Query options, and Zustand selections import only `LiveControlPort`.**
  They never import `@civ7/control-orpc`, `@civ7/direct-control`, RPCLink, or
  FireTuner.
- The port's method names mirror procedureKeys; its types mirror the contract
  outputs (re-derived from the package types once it lands, hand-mirrored until
  then).

### 3.2 Bound implementation (target)

When `@civ7/control-orpc` is reachable over transport:

```ts
// mirrors gt-stack-inspect/src/router/client.ts prior art
const link = new RPCLink({ url: "/api/control" });  // studio-server proxies to the bridge host
const rpc = createORPCClient<typeof Civ7ControlOrpcContract>(link);
const utils = createTanstackQueryUtils(rpc);         // oRPC-native TanStack Query
```

The bound adapter calls procedures **directly** through the typed client (the
RPC transport serializes them as bridge envelopes server-side). It does **not**
hand-assemble envelopes — the envelope is the bridge's *internal* ingress shape;
the studio's client speaks the contract via RPCLink. The envelope types in
`envelope.ts` exist only for the legacy/fallback path and for tests that assert
seam shape.

The transport terminates at the **studio-server** (§5), which forwards to the
`Civ7IntelligenceBridge` host (or, in-process, calls the ingress). The studio
**never** reaches the game directly.

### 3.3 Legacy implementation (today, behind the same port)

Until the package lands, `LiveControlPort` is satisfied by an adapter over the
**existing** `@civ7/direct-control`-backed studio-server endpoints
([`audit/05`](../audit/05-server-contracts.md) #4/#5). This is a **move, not a
rewrite**: the studio's live-runtime poll keeps its current staleness/backoff
gating; only the *source* of the read is abstracted behind the port. This
preserves the hard-core poll semantics while making the cutover a one-line impl
swap.

## 4. Data flow & boundaries

```
┌────────────────────────────┐        ┌──────────────────────────────────────┐
│ mapgen-studio (browser)    │        │ studio-server (Bun / dev middleware)   │
│                            │        │                                        │
│ UI / TanStack Query        │        │  /api/control  ── proxies/forwards ──┐ │
│   └─ LiveControlPort  ─────┼─HTTP──▶│  /api/civ7/*   (studio-server own)    │ │
│        ├ bound: RPCLink     │  RPC   │                                       │ │
│        └ legacy: /api/civ7  │        └───────────────────────────────────┐  │ │
└────────────────────────────┘                                            │  │ │
                                                                          ▼  ▼ │
                                              ┌──────────────────────────────────┐
                                              │ Civ7IntelligenceBridge (host)      │
                                              │  invoke(envelope) → ingress        │
                                              │   → createCiv7ControlOrpcServerClient
                                              │      (Civ7ControlOrpcContext w/     │
                                              │       direct-control facade)        │
                                              │   → game (direct-control)           │
                                              └──────────────────────────────────┘
```

Boundary rules (normative):

- **Studio → port → transport → bridge → game.** No studio code on the right of
  the port may import direct-control or FireTuner.
- **Reads vs mutations.** The studio's live-state seam is **read-only**
  (`risk: "read-only"`). Mutation procedures exist in the contract but are
  **out of scope** for the mapgen studio redesign and are guarded by the bridge's
  controller-proof boundary regardless. The studio MUST NOT send mutation
  envelopes as part of this workstream.
- **Correlation.** `correlationId` is optional and validated; when the studio
  supplies one it flows through context into the router client. The studio may
  mint one per logical operation (not per HTTP request) to mirror the
  operation-identity pattern already used by run-in-game.
- **Error envelope.** Consumers handle `{ ok: false, error }` as data, not as a
  thrown transport error — the same posture as the existing live-status
  `allSettled` per-field error model. The port surfaces failures as typed results,
  not exceptions, so the adaptive poll's cross-failure backoff is preserved.

## 5. Relationship to the studio-server (P5) and the seam

The two server surfaces are **distinct** and must not be conflated:

| Surface | Owner | Studio consumes via | Status |
| --- | --- | --- | --- |
| `runInGame.*`, `mapConfigs.*`, setup-catalog, saved-configs | **studio-server** (P5, [`10`](10-target-architecture.md) §1) | direct typed oRPC client | studio builds this |
| `world.*`, `readiness.*`, `attention.*`, `strategy.*` (live reads) | **`@civ7/control-orpc`** + `Civ7IntelligenceBridge` | `LiveControlPort` (this seam) | live-control stack builds this |

The studio-server **mounts the control transport** (`/api/control`) as a thin
forward to the bridge host; it does **not** re-implement control reads. P5's
effect-oRPC studio-server and this control seam meet at that mount point. The
studio-server owns map authoring + deploy + run-in-game; control-oRPC owns live
game reads/mutations. The seam keeps these blast radii separate: a breaking change
in `@civ7/control-orpc` touches `src/lib/control/*` only.

## 6. Binding checklist (when the package lands on `main`)

1. Re-pin the tip (branch + commit) and diff the captured contract namespaces /
   procedure keys / output shapes against §1–§2. If they match → proceed; if they
   diverge structurally → FRAME §3 falsifier, stop and re-baseline.
2. Add `@civ7/control-orpc` as a studio dependency (`workspace:*`).
3. Implement `createControlOrpcClient()` (RPCLink → `createORPCClient` →
   `createTanstackQueryUtils`) per §3.2, mirroring
   `tools/gt-stack-inspect/src/router/client.ts`.
4. Mount `/api/control` in the studio-server as a forward to the bridge host.
5. Flip the `LiveControlPort` selector from legacy to bound; delete the legacy
   adapter only after parity is proven on the live-runtime poll surface.
6. Re-run the live-runtime poll parity harness — staleness/backoff gating
   unchanged is the acceptance bar.

## 7. Do-not-do (seam guardrails)

- Do **not** read FireTuner from the studio (canary/diagnostic only, server-side).
- Do **not** re-implement live reads — the studio holds no direct-control facade.
- Do **not** import `@civ7/control-orpc` or `@civ7/direct-control` outside
  `src/lib/control/*`.
- Do **not** hand-assemble bridge mutation envelopes from the studio in this
  workstream.
- Do **not** treat this capture as `main` truth — re-verify the tip before binding.
