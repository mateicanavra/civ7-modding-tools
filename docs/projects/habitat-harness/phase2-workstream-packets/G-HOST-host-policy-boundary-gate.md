# G-HOST Host Policy Boundary Gate

## Intent

Create a generic host-policy boundary so Habitat can remain repo-agnostic while
still consuming host-specific generated zones, protected paths, and
pattern-specific validation gates.

## Product Scenario

Habitat protects generated/protected zones and apply gates in this repository
without turning Civ7 or MapGen policy into generic Habitat core behavior.

## Domain Owner

Host Policy Boundary owner.

Forbidden owners:

- Generated/Protected Zone Authority may consume host declarations but not bake
  Civ7/MapGen paths into generic code.
- Transformation Transaction may run pattern-specific gates but not own host
  policy.
- Scaffolding may refuse unsupported host shapes but not infer host semantics.

## Consumers

D9 Transformation Transaction, D10 Generated/Protected Zone Authority, D13
Scaffolding and Refusal Contracts, D14 Authoring Topology Fence.

## Contract

Define host declaration/refusal contract for:

- generated/protected zones;
- host-specific regeneration commands;
- pattern-specific apply gates;
- unsupported host-owned project, generator, or authoring kinds;
- future authoring topology triggers;
- non-claims when host policy is missing.

## Dependency Order

Blocked by: D0 and D1.

Unblocks: D10, D13, and D9 host-policy consumption. D9 still depends on D10
for generated/protected-zone authority before generic apply closure.

Parallelism: can run after D0/D1 while D2-D6 proceed, but D10/D9/D13 cannot
claim generic closure until this gate is satisfied.

## Current State-Space Problem

`generated-zones.ts` embeds Swooper/Civ7 generated paths. `grit-apply.ts`
contains MapGen-specific public ops target validation inside a generic
transaction. Generator docs and AGENTS guidance mention MapGen authoring gaps
inside generic Habitat usage.

The reachable state problem is host coupling: generic Habitat can represent
host-specific checks as universal toolkit behavior.

## Solution Design

1. Define the complete host declaration contract for the bounded current
   host-policy surface: generated/protected zones and apply gates.
2. Move host-specific path/gate data behind declarations consumed by generic
   Habitat modules.
3. Add explicit refusal when required host policy is absent.
4. Keep generic modules responsible for enforcing declarations, not knowing
   host semantics.
5. Record where Civ7/MapGen remains current-repo host data rather than generic
   Habitat model.

## TypeScript State-Space Reduction

Replace host-specific inline constants with typed host-policy variants:

- declared generated zone,
- declared protected zone,
- declared apply gate,
- unsupported/missing declaration refusal,
- host policy unavailable.

The rejected alternative is "rename generated-zones to make it look generic."
Without declarations, the generic core still carries host-specific state.

## Public Surface Impact

May affect command messages for generated-zone and apply refusals. Should not
change generic command verbs. The first implementation declaration source is an
internal Habitat TypeScript module at
`$HABITAT_TOOL/src/lib/host-policy.ts`, not a user-authored config file. D0 must
classify any command output, exported type, documented location, or later public
configuration surface before source work touches it.

## Proof Classes

Required design proof:

- current host-specific path/gate inventory;
- declaration/refusal shape;
- D9/D10/D13 consumer matrix.

Later implementation proof:

- host declaration module schema tests;
- missing declaration refusal tests;
- generated-zone command behavior;
- apply gate behavior;
- non-claim tests for unsupported host shapes.

Non-claims:

- G-HOST does not prove generated files are current.
- G-HOST does not prove MapGen runtime/product behavior.
- G-HOST does not implement Authoring Topology.

## Review Lanes

- Generic Habitat boundary review.
- Product refusal review.
- Generated-zone consumer review.
- Apply transaction consumer review.

## Downstream Realignment

Update:

- host policy boundary record;
- generated-zone docs;
- apply safety matrix;
- D13 host-policy consumer matrix;
- Authoring Topology deferral.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/host-policy.test.ts test/lib/grit-apply.test.ts`:
  expected exit 0 after the implementation creates the internal host-policy
  module fixtures and apply-gate consumer fixtures.
- `bun run habitat classify $REPO_ROOT/mods/mod-swooper-maps/src/maps/generated/swooper-earthlike.ts`:
  expected exit 0; representative host-owned generated path classification.
- `git status --short --branch`: expected exit 0; proves host declarations are
  tracked data, not hidden generated state.
- Cache stance: host declaration/refusal tests must run fresh.
- Injected bad case: include one unregistered host policy and prove generic
  Habitat refuses to interpret it as built-in truth.
- Non-claim: this packet does not prove generated files are current, MapGen
  runtime behavior, or Authoring Topology.

## Graphite/OpenSpec Closure

Use OpenSpec if a later packet makes host declaration location, exported types,
or command behavior public. Commit before D9/D10/D13 claim closure.

## Stop Conditions

Stop if:

- Civ7/MapGen path literals remain generic source truth after D10/D9;
- apply gates cannot identify host-specific ownership;
- missing host policy silently disables protection;
- host policy is over-generalized beyond observed product need.
