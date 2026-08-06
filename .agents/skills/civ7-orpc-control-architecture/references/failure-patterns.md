# Civ7 oRPC Failure Patterns

## Control And Play Collapse

**Symptom:** actor-facing city, diplomacy, planning, or turn policy is placed
beside foundational app/game/map/UI operations in one service.

**Why it fails:** sharing live prerequisites does not make the facts, writers,
or correction laws identical.

**Repair:** keep control at exactly `{app,game,map,ui}`. Place gameplay meaning
under the finite play inventory and depend only on the public control client.

## Provider Leakage

**Symptom:** a service, API projection, or command selects or acquires Tuner or
window-capture providers, or accepts provider configuration from an ordinary
caller.

**Why it fails:** foreign capability acquisition and process scope belong to
qualified app composition.

**Repair:** let the app acquire providers, construct ready typed values, bind
service clients, and give consumers only the capability they declare.

## Parallel Method Vocabulary

**Symptom:** a caller invents a look-alike service interface, extracts method
types from another surface, or imports private contract/router leaves.

**Why it fails:** one service now has competing descriptions and private
implementation becomes caller authority.

**Repair:** expose the service-owned contract through its public client face.
Qualified composition constructs the bound client; consumers call it directly.

## Service Internals At The API Boundary

**Symptom:** an API copies a whole service contract subtree, registers a
private service router, or treats transport exposure as making the service a
caller contract.

**Why it fails:** caller policy and product authority collapse, and service
internals become externally coupled.

**Repair:** author API-owned contract leaves, a public API client, and a public
registration face. Keep API implementation private and delegate each leaf to
the matching bound public client.

## App Becomes Product Policy

**Symptom:** composition code decides gameplay outcomes, MapGen operation
meaning, or API caller semantics because it already owns provider and host
lifecycle.

**Why it fails:** constructing and running the graph does not transfer semantic
write authority.

**Repair:** apps select, acquire, bind, mount, observe, and dispose. Services
and projections retain their own policy and facts.

## Generic Router Escape Hatch

**Symptom:** a public operation accepts arbitrary script text, raw command
strings, or an unbounded `call` payload.

**Why it fails:** procedure identity, admission, uncertainty, and meaningful
semantics proof disappear.

**Repair:** expose only closed typed operations owned by a selected service
module. Keep raw diagnostics explicit and owner-qualified.

## Vendor Mechanism By Memory

**Symptom:** implementation chooses a builder chain, adapter, error tunnel,
runtime/scoping strategy, or initialization side effect because it appeared in
another prerelease or example.

**Why it fails:** prerelease APIs and lifecycle behavior can differ across the
installed lane.

**Repair:** load the global vendor skills, inspect the exact installed source
and declarations, and select the mechanism only after a discriminating type or
lifecycle fixture passes. Keep the choice localized to qualified composition
or the private procedure boundary.

## Transport-First Design

**Symptom:** route aesthetics or frontend convenience determine service
operations before semantic ownership is settled.

**Why it fails:** a caller surface starts defining product meaning.

**Repair:** stabilize the owning service contract and public client first.
Then define the API-owned caller contract and explicit delegations.

## Workflow By Analogy

**Symptom:** a multi-step or background-capable operation becomes a durable
workflow despite having only request-local or retained-process state.

**Why it fails:** orchestration topology expands without a process-independent
resume or replay requirement.

**Repair:** keep the operation service-owned until it must survive request or
process loss with stable intent, idempotency, and reconciliation owners.

## Uncertainty Laundering

**Symptom:** dispatch, a stale observation, or a timeout is returned as
accepted gameplay success, and retry can repeat an ambiguous mutation.

**Why it fails:** callers lose the distinction between intent, dispatch,
observation, acceptance, and final outcome.

**Repair:** preserve refused, partial, stale, unavailable, and uncertain
states. Retain a no-repeat identity and reconcile through fresh control facts.

## Relationship Label Regression

**Symptom:** output says hostile, enemy, opponent, threat, or non-friendly only
because owners differ, units are near each other, or an attack is legal.

**Why it fails:** those facts show contact or validator possibility, not a
relationship.

**Repair:** require official relationship, team, war, suzerain, or equivalent
validator evidence; otherwise keep labels neutral.

## Proof Inflation

**Symptom:** a typecheck, service test, API projection test, generated artifact,
or installation receipt is reported as live Civ7 behavior.

**Why it fails:** each evidence class proves a different stage.

**Repair:** label contract, semantics, execution, projection, assembly,
generated, installed, loader, and live evidence separately. Make no stronger
claim than the evidence supports.
