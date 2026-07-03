# D14 Authoring Topology Fence

## Intent

Make future Authoring Topology an explicit product boundary and refusal/future
trigger, preventing Phase 3 from implementing MapGen domain/op/stage/step/recipe
generation as part of the structural substrate refactor.

## Product Scenario

An agent asks Habitat to create MapGen authoring topology. Habitat refuses or
routes to future investigation because current Habitat owns structural
orientation, enforcement, receipt, guarded repair, and narrow scaffolding, not
domain-specific authoring workflows.

## Domain Owner

Future Authoring Topology owner.

Forbidden owners:

- Scaffolding cannot absorb domain authoring because it can create generic
  project shells.
- Orientation cannot imply authoring support because it can classify paths.
- Patterns cannot imply full authoring because it admits structural
  rules.

## Consumers

DRA owners, future product investigators, agents requesting generators, docs.

## Contract

Define:

- explicit unsupported authoring actions;
- future acceptance criteria;
- required investigation/receipt for authoring;
- refusal output;
- downstream deferral record.

## Dependency Order

Blocked by: D4, D12, and D13.

Unblocks: future investigation only. It does not unblock Phase 3 structural
implementation except by keeping scope clean.

Parallelism: design after classify, verify, and scaffolding contracts are known.

## Current State-Space Problem

Current docs identify Authoring Topology as a gap, but without a command-facing
fence agents can conflate supported project/pattern scaffolding with domain
authoring. The invalid state is "Habitat can scaffold generic structures, so it
can also invent MapGen domain topology."

## Solution Design

1. List unsupported authoring actions explicitly.
2. Define future acceptance criteria: product convention, target topology,
   generator receipt, classify/check receipt, compile receipt, and product acceptance.
3. Connect unsupported requests to D13 refusal shape.
4. Record deferral with trigger rather than implementation tasks.
5. Ensure no Phase 3 packet adds authoring generators.

## TypeScript State-Space Reduction

No direct implementation refactor is planned unless D13 needs an unsupported
request variant. The state-space reduction is product-level: unsupported
authoring requests become a closed refusal state instead of falling into generic
scaffolding options.

The rejected alternative is to leave authoring as a prose gap in docs only.

## Public Surface Impact

May affect generator refusal output and docs. No authoring command is added.

## Receipt Classes

Required design receipt:

- unsupported action inventory;
- future acceptance criteria;
- refusal examples.

Later implementation receipt:

- refusal tests through D13;
- docs/deferral record truth receipt;
- classify/verify examples that state non-support.

Non-claims:

- D14 does not implement Authoring Topology.
- D14 does not prove MapGen product behavior.
- D14 does not create generators.

## Review Lanes

- Product boundary review.
- Scope-control review.
- Refusal review.
- Stale-record review.

## Downstream Realignment

Update:

- Authoring Topology deferral row with trigger;
- `tools/habitat-harness/docs/AUTHORING-NEXT.md`;
- scenario corpus if future criteria change;
- AGENTS guidance only if durable generic guidance changes.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat-harness test -- test/generators/project-generator.test.ts test/lib/classify.test.ts`:
  expected exit 0; refusal and orientation receipt for out-of-scope authoring
  topology requests.
- `bun run habitat classify docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`:
  expected exit 0; docs orientation receipt for future-trigger records.
- `git status --short --branch`: expected exit 0; fence records must be docs or
  explicit OpenSpec changes only.
- Cache stance: refusal tests must run fresh.
- Injected bad case: include a MapGen Authoring Topology implementation request
  and prove Habitat answers with a future-work boundary, not a scaffold.
- Non-claim: this packet does not implement Authoring Topology.

## Graphite/OpenSpec Closure

Docs/refusal-only closure unless D13 command behavior changes. No
implementation packet for authoring topology in Phase 3.

## Stop Conditions

Stop if:

- any packet adds MapGen domain/op/stage/step/recipe generator implementation;
- future acceptance criteria are vague;
- unsupported authoring request has no command-facing refusal path;
- Civ7/MapGen specifics become generic Habitat authority.
