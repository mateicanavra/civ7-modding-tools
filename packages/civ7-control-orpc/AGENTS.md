# Civ7 Control oRPC - Agent Router

Scope: `packages/civ7-control-orpc/**`

- Owns native oRPC/Effect procedure contracts, routers, typed context,
  typed errors, middleware, in-process server-side clients, and service
  behavior/composition over low-level `@civ7/direct-control` runtime ports.
- Keep Civ7 runtime access in `@civ7/direct-control`; do not implement raw
  tuner socket framing, state discovery, command serialization, or caller-local
  direct-control scripts here.
- Context receives ready dependencies such as the direct-control facade,
  endpoint defaults, approval, logger, evidence sink, clock, and caller policy;
  provider construction belongs to caller/runtime adapters.
- Add transports only at explicit edge-adapter slices. This package's core
  router should remain callable in process.
- Do not add procedure handlers that only delegate input to a direct-control
  facade method. Direct-control is the runtime port; new control-oRPC
  procedures should own the offered service behavior/composition and use
  direct-control only for low-level runtime access.

Validate with:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
