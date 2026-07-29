# Failure Patterns

## Generic Router Wrapper

**Symptom:** a router exposes `control.call`, `operation.any`, or raw command
strings.

**Why It Fails:** it preserves the current command/transport tangle and removes
procedure identity. Policy and tests cannot attach to meaningful atoms.

**Fix:** name stable procedure keys by capability, risk, and proof boundary.

## Runtime Authority Leak

**Symptom:** oRPC handlers open sockets, select tuner states, or build raw
App UI/Tuner scripts outside `@civ7/direct-control`.

**Why It Fails:** callers become runtime transport owners and the repo loses the
central package boundary.

**Fix:** use the typed `context.directControl` port for low-level access while
keeping the service router leaf responsible for the offered behavior,
composition, and proof boundary.

## Pass-Through Service Leaf

**Symptom:** a new public procedure only renames one direct-control method and
passes its input and output through unchanged.

**Why It Fails:** the service adds no contract, policy, composition, or proof
value while expanding a second public surface over the same runtime atom.

**Fix:** keep the operation on the direct-control port until the service owns a
complete behavior around it. A service leaf should earn its place through
composition, stable service semantics, or shared policy.

## Orchestration In The Atom Layer

**Symptom:** a direct-control function grows a multi-step async flow — a
suspend/resume lifecycle, a drain/poll loop, retries, a hand-rolled
try/finally state machine over several execs.

**Why It Fails:** it bypasses the Effect layer the repo standardized on, so
cleanup guarantees, schedules, typed errors, and procedure-level tests are
reimplemented ad hoc — and CLI callers end up importing orchestration from
the wrong package (live lesson: the explore orchestrator was first built in
direct-control and had to be migrated; D10 in the cli-command-taxonomy
workstream record).

**Fix:** keep direct-control functions one-exec wire atoms; home the flow in
`@civ7/control-orpc` as an Effect procedure (`Effect.acquireUseRelease` for
guaranteed cleanup, `Effect.iterate`/`Schedule` for loops) and route the CLI
through the typed server client.

## Deleted Runtime Provider Surface

**Symptom:** a caller imports a live facade from
`@civ7/control-orpc/runtime`, or asks the control service to construct its own
direct-control provider.

**Why It Fails:** provider construction belongs to the qualified host. The
runtime subpath was deleted when the service became a closed service plane.

**Fix:** create the in-process server client with `liveCiv7DirectControl` from
`@civ7/direct-control/live`; add `liveCiv7LifecycleControl` only for setup
lifecycle calls.

## Middleware As Admission Laundering

**Symptom:** middleware invents controller support/proof or turns a host
admission refusal into a default success.

**Why It Fails:** mutation risk becomes invisible at the call site.

**Fix:** middleware validates controller capabilities/proof and honors the
optional admission function supplied by the qualified host; it must not
manufacture proof or swallow a refusal.

## Transport-First Drift

**Symptom:** REST path aesthetics, RPC URL shape, or frontend route convenience
drive procedure shape before the shared behavior is stable.

**Why It Fails:** the external transport becomes product authority.

**Fix:** design the shared router/procedure core first; then expose it through
the caller boundary that fits the caller. CLI/tests can call in-process. Studio
browser clients should use HTTP `RPCHandler`/`RPCLink`. OpenAPI should be a
separate external/documented edge.

## Relationship Label Regression

**Symptom:** a planning or battlefield procedure emits hostile/enemy/opponent/
threat/non-friendly because owner ids differ, units are near us, or an attack
operation appears legal.

**Why It Fails:** those facts are contact/validator evidence, not relationship
proof.

**Fix:** enforce neutral labels in procedure output or middleware until official
relationship, team, war, suzerain, or equivalent validator evidence exists.

## Proof Inflation

**Symptom:** a passing ORPC test or CLI test is described as in-game verified.

**Why It Fails:** procedure tests prove local behavior, not Civ7 runtime state.

**Fix:** close with evidence-scoped labels and require live smoke for live-game
claims.
