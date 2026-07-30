# Effect/oRPC Control Service Contract

## Ownership

`@civ7/control-orpc` at `services/civ7-control` is the one public Civ7 control
service. It owns typed contracts, routers, context ports, admission, typed
errors, shared middleware, and multi-step Effect behavior. It consumes
low-level `@civ7/direct-control` wire atoms directly.

`@civ7/direct-control` owns tuner/socket access, state discovery, command
serialization, bounded runtime reads, and direct runtime evidence. It does not
own service procedure descriptors, routers, context composition, middleware,
or a second public operation plane.

## Consumer Boundary

- CLI and tests use the in-process typed service client.
- The controller mod exposes serialized ingress into the same service.
- Studio browser edges may add an explicit RPC adapter over the same router.
- Debug, telemetry, AI ingestion, and normal CLI projections remain distinct
  contracts rather than raw payload aliases.

## Stop Conditions

Stop if a caller bypasses the service for product behavior, if direct-control
grows a descriptor or router registry, if raw JavaScript becomes a normal
procedure input, or if local proof is labeled as live Civ7 evidence.
