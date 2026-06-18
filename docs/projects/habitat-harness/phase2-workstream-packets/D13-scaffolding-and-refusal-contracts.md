# D13 Scaffolding and Refusal Contracts

## Intent

Separate supported generic scaffolding from unsupported domain authoring so
Habitat creates uniform structures only when it owns the shape and otherwise
returns designed refusals.

## Product Scenario

An agent asks Habitat to scaffold a project or pattern. Habitat creates
supported app/foundation/plugin projects and candidate patterns, while refusing
unsupported kinds and MapGen Authoring Topology requests with next safe action.

## Domain Owner

Scaffolding owner.

Forbidden owners:

- Pattern Governance owns registration, not candidate file writing.
- Host Policy Boundary owns host-specific unsupported kinds.
- Authoring Topology owns future MapGen domain/op/stage/step/recipe generation.

## Consumers

Nx generators, agents creating structures, pattern authors, future Authoring
Topology investigators.

## Contract

Define:

- supported project kinds;
- project generator preflight/refusal states;
- candidate pattern generator output state;
- registered pattern handoff to D8;
- unsupported-kind refusal;
- Authoring Topology refusal/future trigger;
- host-policy missing refusal.

## Dependency Order

Blocked by: D0, D2, D8, and G-HOST.

Unblocks: D14.

Parallelism: project generator refusal design can proceed after D0/D2; pattern
candidate semantics wait for D8.

## Current State-Space Problem

Project and pattern generators share Nx mechanics but answer different product
questions. Candidate pattern output can be mistaken for registered enforcement.
Unsupported Authoring Topology has doc-level warnings but needs command-facing
refusal semantics.

## Solution Design

1. Model project generator supported kinds as a closed union.
2. Model pattern generator output as candidate-only until D8 registration.
3. Define refusal DTO/message with blocked action, reason, owner, next safe
   action, proof class, and non-claims.
4. Add unsupported host/domain authoring refusals, including MapGen topology.
5. Keep generator tests scenario-based rather than implementation-folder based.

## TypeScript State-Space Reduction

Replace stringly kind/options handling with discriminated scaffolding requests:

- supported project request,
- candidate pattern request,
- unsupported kind refusal,
- authoring topology refusal,
- preflight conflict refusal.

The rejected alternative is merging project and pattern generators because they
both use Nx. That preserves product ambiguity.

## Public Surface Impact

Generator schema and error messages may change. D0 must classify whether
generator options are stable. Unsupported kinds should fail deliberately.

## Proof Classes

Required design proof:

- generator schema inventory;
- supported/unsupported scenario inventory;
- Pattern Governance handoff contract.

Later implementation proof:

- generator tests for supported kinds;
- refusal tests for unsupported kinds;
- candidate pattern generation tests;
- registration handoff tests;
- classify/check after generated supported project when feasible.

Non-claims:

- project scaffolding does not prove app/product behavior.
- candidate pattern generation does not register a rule.
- scaffold refusal does not implement Authoring Topology.

## Review Lanes

- Product/scenario review.
- Refusal contract review.
- Pattern Governance review.
- Host boundary review.
- API/generator compatibility review.

## Downstream Realignment

Update:

- scaffolding matrix;
- `tools/habitat-harness/docs/SCENARIOS.md`;
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`;
- AGENTS scaffold guidance if command examples change.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts`:
  expected exit 0; supported scaffold and pattern candidate proof.
- `nx g @internal/habitat-harness:project habitat-scratch --kind=plugin --dry-run`:
  expected exit 0; supported project dry-run proof.
- `nx g @internal/habitat-harness:project unsupported-scratch --kind=host-specific --dry-run`:
  expected nonzero; unsupported-kind refusal proof.
- Cache stance: generator dry-runs must run fresh and must not rely on Nx cache.
- Injected bad case: include unsupported kind, registered-pattern-without-manifest,
  and host-specific scaffold request; all must refuse before writes.
- Non-claim: this packet does not implement unsupported project kinds.

## Graphite/OpenSpec Closure

Use OpenSpec for generator schema/behavior changes. Commit after D8 and G-HOST
are stable.

## Stop Conditions

Stop if:

- unsupported kinds fall through to generic generation;
- candidate pattern output is described as registered enforcement;
- Authoring Topology implementation enters scope;
- refusal lacks next safe action or non-claim.
