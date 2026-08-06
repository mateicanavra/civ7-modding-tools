# Game Module Router

Scope: `services/civ7-control/src/service/modules/game/**`

This module owns foundational Civ7 setup/start and current-game facts. It
composes explicit native city, diplomacy, notification, player, progression,
turn, and unit subdomains without promoting them to peer control modules.

Native leaves use `observe`, `check`, and `send`. A `send` performs one fresh
native check and at most one invocation, then returns exact dispatch evidence
and optional same-evaluation `immediateAfter` readback. Do not admit a generic
operation name, argument bag, or discriminated family union.

The progression native kernel is closed to this grammar:

```text
progression.dashboard.observe
progression.traditions.observe
progression.{technology,culture}.choice.{observe,check,send}
progression.{technology,culture}.target.{check,send}
progression.{technology,culture}.target.clear.send
progression.attribute.node.observe
progression.attribute.{purchase,review}.{check,send}
progression.tradition.assignments.observe
progression.tradition.{activation,deactivation,review}.{check,send}
progression.government.choice.{check,send}
progression.government.celebration.choice.{check,send}
progression.narrative.choice.{check,send}
```

Each leaf fixes its native constant privately. Public inputs contain only the
leaf's operands; a tree kind, action discriminator, native operation name, or
generic argument bag falsifies the kind. Candidate observations expose native
facts, not ranking or a selected choice. Target clearing resolves Civ7's
runtime `NO_NODE` constant privately and has no synthetic public check.

Map observation belongs to `control.map`; current-application readiness belongs
to `control.app`. Native action leaves do not own polling, gameplay
postconditions, actor-facing goals, `request`, reconciliation, retry/no-repeat
policy, recommendations, or next-action meaning. A separately named
foundational operation may perform bounded observation required by its own
explicit contract, but never replay a mutation or decide actor meaning. Play
must consume the public control client rather than this private module.
