# D10 Protected Zones

## Intent

Move generated/protected zone protection behind generic declarations and staged
mutation guards so Habitat prevents hand edits without owning host-specific
regeneration semantics.

## Product Scenario

An agent stages a generated file edit. Habitat must refuse the hand edit, name
the owning generated/protected zone, provide the next safe regeneration action,
and avoid claiming runtime or product receipt.

## Domain Owner

Protected Zones owner.

Forbidden owners:

- Host Policy Boundary owns host-specific zone data.
- Hook Runtime invokes staged guards but does not own zone authority.
- Pattern Apply may consume zone approvals but does not define
  generated state.

## Consumers

Structural Enforcement, hooks, apply transaction, agents avoiding hand edits,
generated drift scripts.

## Contract

Define:

- generated zone declarations;
- protected zone declarations;
- staged mutation guard;
- drift check surface;
- regeneration/remediation hint;
- host-policy missing refusal.

## Dependency Order

Blocked by: D1, D2, and G-HOST.

Unblocks: D7, D9, and D11.

Parallelism: can proceed after G-HOST contract and D2 metadata facets stabilize.

## Current State-Space Problem

`generated-zones.ts` contains generated zones for Swooper map entrypoints, Civ7
types, Civ7 map policy tables, and pnpm artifacts in one generic library. The
rule registry also has generated-zone references. Hooks invoke staged checks but
do not own zone truth.

## Solution Design

1. Consume host declarations from G-HOST instead of inline host-specific arrays.
2. Define zone states: generated, protected, forbidden artifact, missing host
   declaration.
3. Build staged guard output as a command-facing refusal with next safe action.
4. Keep generated drift check separate from staged guard.
5. Align rule metadata generated-zone facet with zone declarations.

## TypeScript State-Space Reduction

Replace generic `GeneratedZone[]` constants with typed declarations where each
zone variant owns required fields. Prevent a zone from lacking remediation or
host owner when command output needs them.

The rejected alternative is moving current constants to another file without
changing ownership.

## Public Surface Impact

Command messages for file-layer rules and hooks may change. D0 must classify
stable fields and examples. Root command names should not change.

## Receipt Classes

Required design receipt:

- current zone inventory;
- host declaration mapping;
- staged mutation scenarios.

Later implementation receipt:

- generated-zone schema tests;
- staged file-layer tests;
- missing host declaration refusal tests;
- generated-check command receipt;
- hook pre-commit staged mutation tests.

Non-claims:

- generated-zone receipt does not regenerate files.
- generated-zone receipt does not prove runtime/product behavior.

## Review Lanes

- Host boundary review.
- Generated-zone authority review.
- Hook consumer review.
- Apply consumer review.

## Downstream Realignment

Update:

- protected-zone decisions record;
- AGENTS generated-output guidance if command examples change;
- `docs/process/resources-submodule.md` references if Civ7 resources remain host
  declarations;
- rule metadata generated-zone facets.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat-harness test -- test/lib/generated-zones.test.ts test/lib/hooks.test.ts`:
  expected exit 0 after the packet creates or updates generated-zone fixtures.
- `nx run @internal/habitat-harness:generated:check`: expected exit 0; current
  generated-zone freshness receipt.
- `bun run habitat check --staged --tool file-layer --json`: expected exit 0
  for clean staged state and nonzero for injected protected-zone mutation.
- Cache stance: staged file-layer receipt must run fresh; generated-check must
  record whether dependency targets were cached.
- Injected bad case: stage one protected generated file mutation and prove it is
  refused with the owning remediation.
- Non-claim: this packet does not define host policy; it consumes G-HOST.

## Graphite/OpenSpec Closure

Use OpenSpec if command output or host declaration surface is public. Commit
before D11 hook closure.

## Stop Conditions

Stop if:

- host paths remain embedded as generic Habitat truth;
- staged guard omits next safe action;
- protected/generated/refused states are represented by optional fields;
- hook success is used as generated-zone receipt beyond staged hook runtime.
