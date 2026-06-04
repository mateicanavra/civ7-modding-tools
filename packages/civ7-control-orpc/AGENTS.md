# Civ7 Control oRPC - Agent Router

Scope: `packages/civ7-control-orpc/**`

- Owns native oRPC/Effect procedure contracts, routers, typed context,
  typed errors, middleware, and in-process server-side clients over
  `@civ7/direct-control` atoms.
- Keep Civ7 runtime access in `@civ7/direct-control`; do not implement raw
  tuner socket framing, state discovery, command serialization, or caller-local
  direct-control scripts here.
- Context receives ready dependencies such as the direct-control facade,
  endpoint defaults, approval, logger, evidence sink, clock, and caller policy;
  provider construction belongs to caller/runtime adapters.
- Add transports only at explicit edge-adapter slices. This package's core
  router should remain callable in process.

Validate with:

- `bun run --cwd packages/civ7-control-orpc test`
- `bun run --cwd packages/civ7-control-orpc check`
- `bun run --cwd packages/civ7-control-orpc build`
