# D13 Scaffolding and Refusal Contracts

## Intent

Separate supported generic scaffolding from unsupported domain authoring so
Habitat creates uniform structures only when it owns the shape and otherwise
returns designed refusals.

## Product Scenario

An agent asks Habitat to scaffold a project or pattern. Habitat creates
supported plugin projects and candidate patterns, while refusing unsupported
kinds with next safe action.

## Domain Owner

Scaffolding owner.

Forbidden owners:

- Patterns owns registration, not candidate file writing.
- Host Policy Boundary owns future host-specific scaffold inputs.
- Authoring Topology owns future domain/op/stage/step/recipe generation.

## Consumers

Nx generators, agents creating structures, pattern authors, future Authoring
Topology investigators.

## Contract

Define:

- supported plugin project kind;
- project generator preflight/refusal states;
- candidate pattern generator output state;
- active pattern registration refusal through Patterns;
- unsupported-kind refusal;

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
3. Define refusal DTO/message with blocked action, reason, next safe action, and
   retry condition.
4. Keep host/domain authoring scaffolding outside this packet.
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

## Validation Classes

Required design validation:

- generator schema inventory;
- supported/unsupported scenario inventory;
- Patterns handoff contract.

Implementation validation:

- generator tests for supported plugin scaffolding;
- refusal tests for unsupported kinds;
- candidate pattern generation tests;
- active registration refusal tests;
- classify/check after generated supported project when feasible.

Scope limits:

- candidate pattern generation does not register a rule.
- scaffold refusal does not implement Authoring Topology.

## Review Lanes

- Product/scenario review.
- Refusal contract review.
- Patterns review.
- Host boundary review.
- API/generator compatibility review.

## Downstream Realignment

Update:

- scaffolding matrix;
- `tools/habitat/docs/SCENARIOS.md`;
- `tools/habitat/docs/AUTHORING-NEXT.md`;
- AGENTS scaffold guidance if command examples change.

## Validation Commands

- `bun run --cwd tools/habitat test -- test/generators/project-generator.test.ts test/generators/pattern-generator.test.ts`:
  expected exit 0; supported scaffold and pattern candidate behavior.
- `nx g @habitat/cli:project habitat-scratch --kind=plugin --dry-run`:
  expected exit 0; supported project dry-run behavior.
- `nx g @habitat/cli:project unsupported-scratch --kind=host-specific --dry-run`:
  expected nonzero; unsupported-kind refusal.
- Cache stance: generator dry-runs must run fresh and must not rely on Nx cache.
- Injected bad case: include unsupported kind, registered-pattern-without-manifest,
  and host-specific scaffold request; all must refuse before writes.
- Scope limit: this packet does not implement unsupported project kinds.

## Graphite/OpenSpec Closure

Use OpenSpec for generator schema/behavior changes. Commit after D8 and G-HOST
are stable.

## Stop Conditions

Stop if:

- unsupported kinds fall through to generic generation;
- candidate pattern output is described as registered enforcement;
- Authoring Topology implementation enters scope;
- refusal lacks next safe action.
