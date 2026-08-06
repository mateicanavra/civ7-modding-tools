# Civ7 Control Service Agent Router

Scope: `services/civ7-control/**`

- This local service kind owns foundational Civ7 control only, with the exact
  public module inventory `{app,game,map,ui}`.
- `app` owns readiness and current-application interpretation; `game` owns
  setup/start and current-game facts plus explicit native city, diplomacy,
  notification, player, progression, turn, and unit subdomains; `map` owns observation,
  visibility, plot, grid, and surface facts; `ui` owns display, camera, and
  Civ7 appshot meaning. Those game subdomains never become peer root modules.
- Native leaves use `observe`, `check`, and `send`. A `send` performs one fresh
  native check and at most one invocation, then returns exact dispatch evidence
  and optional same-evaluation `immediateAfter` readback. Generic operation
  unions and caller-authored native operation names are forbidden.
- Gameplay goals, priorities, city/diplomacy decisions, no-repeat policy, and
  next-action meaning belong to `services/civ7-play`, which consumes only this
  service's public client.
- Ready Tuner and window-capture capabilities are supplied by qualified app
  composition through the service's typed dependency/Effect Context channel.
  This service never imports providers, acquires resources, selects endpoints,
  mounts transport, or owns process lifetime.
- `src/client.ts` is the complete public caller and qualified construction face.
  It may re-export the service-owned contract. `src/service/**` is private;
  callers and API plugins never import its router, implementation, context, or
  contract leaves.
- Every module requires `AGENTS.md`, `contract/index.ts`, direct contract
  leaves, `module.ts`, named `*.router.ts` operation leaves, and module-root
  `router.ts`. There is no `router/index.ts`, module-owned context, loose source,
  or unselected module.
- Each public procedure owns a complete foundational semantic outcome. Private
  module ports own the smallest native lowering needed for that outcome without
  becoming public capabilities or a replacement facade.
- Polling, gameplay postconditions, no-repeat policy, actor-facing `request`,
  reconciliation, and next-action meaning are forbidden from native action
  leaves and belong to `services/civ7-play`. A separately named foundational
  operation may perform bounded observation required by its own explicit
  contract, but never replay a mutation or decide actor meaning.
- API plugins project the bound public client through API-owned caller
  contracts. The service router is never exposed directly over the wire.

Vendor authority:

- Load global `dev:orpc`, `dev:effect-orpc`, and `dev:effect-ts` before changing
  procedure implementation. They own generic builders, context, handler,
  interruption, error, Layer, and runtime guidance.
- The installed oRPC/Effect-oRPC beta.23 tuple is prerelease authority. Exact
  builder names, chaining syntax, Cause translation, extension use, Layer, or
  runtime construction require installed declarations/source and a
  discriminating type or lifecycle fixture.
- One direct Effect-to-procedure adaptation belongs at the private owning
  implementation/router boundary. Extension-free adaptation is the portable
  default. If an extension is proven necessary, one qualified bootstrap owns
  its physical mutation.

Proof is closed to:

- `test/contract/client.typecheck.ts`
- `test/semantics/modules/<module>/<operation>.test.ts`
- selected `test/semantics/<component>.test.ts` cross-module invariants
- `test/execution/root.test.ts`

Colocate `*.fixture.ts` with its owning proof. Do not add generic `support`,
`behavior`, `mechanics`, `integration`, or database proof cabinets.

Validate with:

- `bunx nx run control-orpc:check`
- `bunx nx run control-orpc:build`
