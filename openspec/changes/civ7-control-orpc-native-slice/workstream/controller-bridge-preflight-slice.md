# Controller Bridge Preflight Slice

Status: planned controller edge boundary, no source implementation.
Date: 2026-06-05.

## Purpose

Make the in-game controller bridge implementation-ready without creating an
ad hoc bridge API, raw App UI command surface, or transport-first product
contract.

The accepted architecture is unchanged: Civ7 loads a game-scoped UIScript from
a mod `ActionGroup` with `scope="game"` and `<UIScripts>`. That script installs
`globalThis.Civ7IntelligenceBridge.invoke(...)` only as serialized ingress into
an in-process oRPC/Effect router. The router is the product/service boundary;
the global bridge is not.

## Authority Evidence

- `openspec/changes/civ7-control-orpc-native-slice/proposal.md` records the
  game-scoped UIScript router and serialized ingress model.
- `openspec/changes/civ7-control-orpc-native-slice/design.md` keeps edge
  adapters after shared in-process router proof.
- `openspec/changes/civ7-support-direct-control-modularization/design.md` and
  `workstream/workstream-record.md` reject a hand-maintained App UI method
  table or ad hoc JSON-envelope product API.
- Official modinfo docs show `scope="game"` action groups and `<UIScripts>` as
  the Civ7 mechanism for loading JavaScript UI scripts.

## Target Ingress Shape

The future serialized ingress envelope should be intentionally small:

```ts
type Civ7IntelligenceBridgeRequest = Readonly<{
  procedureKey: string;
  input: unknown;
  controllerProof?: unknown;
  correlationId?: string;
}>;

type Civ7IntelligenceBridgeResponse = Readonly<
  | { ok: true; procedureKey: string; output: unknown; correlationId?: string }
  | { ok: false; procedureKey: string; error: unknown; correlationId?: string }
>;
```

This is a planning shape, not a public exported schema in this slice. The source
implementation must replace `string`/`unknown` with accepted TypeBox or Effect
Schema contracts before commit.

## Router And Allowlist Boundary

The controller must call the existing shared in-process
`Civ7ControlOrpcRouter` or a controller-owned router composed from the same
native oRPC/effect-orpc primitives. It must not implement a second dispatcher.

Initial source implementation should allowlist a small set of procedures by
stable `procedureKey`, starting with read-only capability proof such as
`readiness.current` or `attention.current`. Mutations require a separate
accepted slice with explicit mutation evidence, local-player/hotseat identity,
and postcondition/no-repeat proof handling.

Forbidden ingress keys and payloads:

- raw JavaScript, `game exec`, command text, `rawCommand`, `jsLiteral`;
- tuner socket host/port/session/state selectors as normal input;
- direct App UI method names as product procedure keys;
- generic `control.call`, `runtime.execute`, or bridge-local operation
  dispatch.

## Context Ownership

Controller runtime assembly owns context construction:

- controller-local access to game globals and lifecycle certification;
- local-player and hotseat identity evidence;
- explicit controller proof for mutation procedures;
- proof/evidence sinks and bounded logging;
- correlation IDs passed through existing control-oRPC context;
- any direct-control runtime/proof port adapters needed by the selected
  procedure.

Procedure modules must still receive dependencies through typed oRPC context.
They must not read bridge globals directly.

## Source Implementation Stop Conditions

Do not implement source until the slice names:

- file/package owner for the controller UIScript/mod artifact;
- contract schemas for ingress request and response;
- procedure allowlist and risk class for each allowed procedure;
- context construction owner and test doubles;
- lifecycle/local-player/hotseat proof owner for any mutation procedure;
- local package tests and, if runtime behavior is claimed, real-game proof plan.

Stop if an implementation:

- exposes raw command/session/tuner payloads in normal ingress;
- creates a hand-maintained App UI method table;
- duplicates oRPC router/middleware/error handling;
- treats `Civ7IntelligenceBridge.invoke(...)` as the product API;
- marks local tests as runtime/live-game proof;
- accepts parent Task 5.x/6.x or `7.3` implementation by implication.

## Verification

This preflight slice closes only on OpenSpec validation and diff hygiene:

- `bun run openspec -- validate civ7-control-orpc-native-slice --strict`
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- `git diff --check`

No source implementation, runtime/live-game proof, play-thread action, bridge
packaging, transport adapter, CLI/Studio change, or OpenAPI work is included.
