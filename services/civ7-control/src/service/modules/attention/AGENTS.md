# Attention Module Migration Router

Scope: `services/civ7-control/src/service/modules/attention/**`

Attention is actor-facing gameplay meaning and therefore belongs to the exact
`services/civ7-play` module inventory, not foundational control. This current
directory is migration corpus only.

- Do not add new operations, exports, policy, or cross-module dependencies here.
- Preserve current attention evidence and behavior until the matching
  `services/civ7-play` contract, semantics, and execution proof exists.
- Move priority ordering, blockers, ready actors, turn-completion advice,
  uncertainty, and next-action meaning to Play.
- Consume foundational application/game/map/UI facts only through the public
  `civ7-control` client. Play never receives a Tuner, provider, raw resource,
  or control-private port.
- Delete this directory from control once consumer and proof closure passes.
