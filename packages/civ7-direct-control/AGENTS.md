# Civ7 Direct Control — Agent Router

Scope: `packages/civ7-direct-control/**`

- Currently contains the mixed low-level Tuner/socket access, state discovery
  and reconnect behavior, and one-wire Civ7-side command nodes pending ADR-007
  extraction.
- The public control-service contract, router, admission, and multi-step Effect
  orchestration belong in `@civ7/control-orpc`. Keep CLI, Studio, and future
  callers above both packages.
- Keep generated outputs, Civ7 logs, and deployed Mods folders as evidence
  only.
- Do not add fallback transports or caller-local socket implementations.

Validate with:

- `nx run control-direct:test`
- `nx run control-direct:check`
- `nx run control-direct:build`
