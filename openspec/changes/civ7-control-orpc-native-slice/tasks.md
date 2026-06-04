## 1. Authority And Intake

- [x] 1.1 Re-check official oRPC docs for procedure, router, context,
  middleware, contract-first, server-side clients, testing, and ecosystem
  guidance.
- [x] 1.2 Record older Effect/oRPC branch evidence as mined input, not source
  authority to merge wholesale.
- [x] 1.3 Define the staged native control-oRPC approach and direct-control
  prework boundary.

## 2. Atom/Policy Separation

- [x] 2.1 Inventory current direct-control atoms by router family, risk,
  schema owner, validator owner, postcondition owner, and proof boundary.
- [x] 2.2 Extract a policy map for approval, validator-first, no-repeat,
  relationship authority, projection, proof labels, telemetry, and command
  serialization.
- [x] 2.3 Extract a dependency map for direct-control facade, endpoint
  defaults, state selection, logger, evidence sink, clock, approval, risk
  policy, and optional controller facade.
- [x] 2.4 Identify repository/read-port style owners where data-layer access
  exists, without constructing runtime providers in direct-control atoms.

## 3. Contract And Context Slice

- [x] 3.1 Create tracked `packages/civ7-control-orpc` source with package
  manifest, exports, and no runtime transport edge.
- [x] 3.2 Define contract/context/error/procedure base files using
  oRPC/effect-orpc primitives.
- [x] 3.3 Add no-network tests that call procedures in process with fake
  context and fake direct-control facade.
- [x] 3.4 Prove endpoint/session/state/raw command fields remain
  context/debug-owned, not normal procedure input.

## 4. Read-Only Procedure Modules

- [x] 4.1 Implement the first read-only module over `runtime.playable.status`.
- [x] 4.2 Implement one notification read module over `notifications.view`.
- [ ] 4.3 Implement one unit read module over `unit.ready.view` or
  `unit.move.preview`.
- [x] 4.4 Prove server-side client calls over the same router graph.

## 5. Middleware Promotion

- [ ] 5.1 Promote shared middleware only after at least two procedure modules
  use the same policy.
- [ ] 5.2 Add approval middleware before mutation procedures.
- [ ] 5.3 Add validator-first and postcondition/proof middleware before
  mutation sends.
- [ ] 5.4 Add safe error projection and correlation through oRPC/effect-orpc
  context/error primitives, not direct-control-local framework wiring.

## 6. Edge Adapters

- [ ] 6.1 Route one CLI caller through the in-process procedure client only
  after read-only procedure proof passes.
- [ ] 6.2 Add Studio `RPCHandler`/`RPCLink` only after the shared router shape
  is stable.
- [ ] 6.3 Add in-game controller bridge only as serialized ingress into the
  in-process router.
- [ ] 6.4 Keep OpenAPI/external REST deferred until there is a documented
  external consumer.

## 7. Verification

- [x] 7.1 Run `bun run openspec -- validate civ7-control-orpc-native-slice
  --strict`.
- [x] 7.2 Run `git diff --check`.
- [x] 7.3 Run focused package tests/check/build when source implementation is
  added.
- [ ] 7.4 Run CLI play tests/check when CLI callers change.
