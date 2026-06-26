# deep-habitat-effect-substrate-runtime-runner-drain

## Why

Habitat now has explicit service and provider composition. Keeping
`runHabitatEffect` in the substrate runtime preserves a generic escape hatch:
any internal caller can import one helper, provide the full live substrate, and
run a program outside the service/module boundary.

The substrate runtime should expose assembled live layers. The decision to run
an Effect belongs at an edge: the service implementer runtime, a host command
edge, or a test harness with explicit fake layers. Provider tests should not
enter the full live substrate just to exercise fake providers.

## What Changes

- Delete `src/substrate/runtime/run.ts`.
- Remove `runHabitatEffect` from the substrate runtime barrel.
- Update provider tests to run Effect programs directly at the test edge with
  explicit fake layers.
- Add a public-surface guard ratchet so the removed runner file cannot return.

## Non-Goals

- Do not change `HabitatSubstrateLive`; the service runtime still composes the
  live substrate layer.
- Do not change provider behavior, command materialization, or live command
  execution.
- Do not add a renamed runner, compatibility alias, fallback helper, or another
  generic runtime bridge.
