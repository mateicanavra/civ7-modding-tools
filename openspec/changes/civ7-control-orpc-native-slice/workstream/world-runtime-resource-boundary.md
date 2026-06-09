# World Runtime Resource Boundary

Status: rebaselined before source commit.
Date: 2026-06-04.

## Correction

The attempted `world.current` source slice was stopped before commit because it
would have treated direct-control summary functions as low-level runtime ports.
That is not an honest split when those functions already build semantic
summary envelopes.

The correct split is runtime-resource versus service behavior:

- `@civ7/direct-control` may own tuner/Civ bridge mechanics: socket/session
  lifecycle, state selection, command serialization, raw probe execution,
  validators, postcondition/proof owners, and relationship evidence policy.
- `packages/civ7-control-orpc` owns native service contracts, routers, typed
  context, tagged errors, middleware, semantic composition, normal output, and
  in-process procedure behavior.

## World Service Implication

A valid `world.current` slice should not call
`getCiv7MapSummary`, `getCiv7PlayerSummary`, `getCiv7UnitSummary`, and
`getCiv7CitySummary` as if those were final runtime resources. It should either
decompose lower-level Tuner/probe resource access first, or move/consolidate
the semantic summary/world behavior into the control-oRPC service owner.

The burned-down public summary wrappers remain retired. This correction does
not revive `map.summary.read`, `player.summary.read`, `unit.summary.read`, or
`city.summary.read` as public procedure leaves.

## Boundaries

This is an OpenSpec authority correction only. It adds no transport, CLI,
Studio, in-game bridge, custom oRPC/effect-orpc plumbing, runtime proof claim,
play-thread action, or Task 5.x/6.x parent acceptance.
