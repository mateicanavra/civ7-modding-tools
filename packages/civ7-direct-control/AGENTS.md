# Civ7 Direct Control — Agent Router

Scope: `packages/civ7-direct-control/**`

- Owns developer-process control of a running Civ7 instance through the tuner
  socket protocol.
- Keep CLI, Studio, and future callers above this package; they should not
  implement raw socket framing, state discovery, or reconnect polling locally.
- Keep generated outputs, Civ7 logs, and deployed Mods folders as evidence
  only.
- Do not add fallback transports or caller-local socket implementations.

Validate with:

- `nx run control-direct:test`
- `nx run control-direct:check`
- `nx run control-direct:build`
