# deep-habitat-effect-service-helper-surface-drain

## Why

Habitat service modules now use the intended Effect-oRPC shape: service
context defines requirements, service impl binds the contract to the runtime,
module context decorates the owning implementer branch, and routers author
procedures directly.

Several router files still exported `runXService` helpers. Those helpers made a
second invocation surface beside the oRPC procedure surface, and tests used that
surface to bypass module context and effect-oRPC request execution. That keeps
the old "call a function and provide a layer manually" mental model alive even
after modules have real procedure implementers.

## What Changes

- Make router-local `runXService` functions private implementation details.
- Move tests to call decorated service procedures or the in-process service
  client.
- Preserve fake-layer testing by using `effect-orpc/node` `withFiberContext`,
  so procedure calls inherit test-provided Effect services instead of importing
  helper functions.
- Route `fix` to the transaction module through the transaction procedure
  surface instead of importing the transaction helper.
- Extend the Habitat service architecture guard so exported `runXService`
  helpers cannot return to service router files.

## Non-Goals

- Do not move procedure bodies out of router files.
- Do not add service factories, operation bags, module clients, compatibility
  aliases, or fallback runners.
- Do not change command behavior, CLI output, service contracts, or provider
  semantics.
