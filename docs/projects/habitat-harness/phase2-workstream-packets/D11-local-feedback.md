# D11 Local Feedback

## Intent

Refactor hooks as local feedback consumers of published Habitat contracts,
without letting pre-commit or pre-push become proof authority.

## Product Scenario

A developer commits or pushes. Habitat hooks quickly catch staged generated-zone
edits, formatting drift, staged Grit findings, resource submodule issues, and
affected-target failures while clearly stating that hook success is local
feedback only.

## Domain Owner

Local Feedback owner.

Forbidden owners:

- Structural Enforcement owns check truth.
- Generated/Protected Zone Authority owns staged generated-zone rules.
- Diagnostic Pattern Catalog owns staged Grit diagnostics.
- Transformation Transaction owns apply/write safety.
- Workspace Graph Integration owns affected target truth.

## Consumers

Husky hooks, local developers, agents preparing commits, Graphite handoff
records.

## Contract

Define:

- `habitat hook pre-commit`;
- `habitat hook pre-push`;
- `HookTrace`;
- resource state variants;
- staged path policy;
- partial staging refusal;
- local-feedback non-claims;
- Graphite-aware pre-push base resolution.

## Dependency Order

Blocked by: D1, D6, D7, D9, D10.

Unblocks: clean local ergonomics and Phase 3 handoff reliability.

Parallelism: cannot close before consumers are stable. Can design against
contracts while D7/D9/D10 are in review.

## Current State-Space Problem

`hooks.ts` orchestrates resource state, staged paths, file-layer checks, Biome,
Grit, restaging, Graphite base resolution, affected targets, reporting, and
trace capture. `ResourceState.kind` and `allowPreCommit` can contradict if not
constructed centrally.

## Solution Design

1. Define hook orchestration as a pipeline of local-feedback stages.
2. Consume published command contracts from D7, D10, and D6 rather than
   duplicating proof semantics.
3. Model resource state as a union where allowed/disallowed is derived from
   variant.
4. Keep partial staging refusal explicit.
5. Label every hook result as local feedback, not verification/CI/product proof.
6. Evaluate D15 only if hook command provenance cannot be represented locally.

## TypeScript State-Space Reduction

Replace `ResourceState` boolean correlation with constructors or discriminated
states:

- clean,
- not configured,
- staged gitlink allowed,
- dirty submodule refused,
- unstaged gitlink refused,
- inspection failure refused.

The rejected alternative is to add comments around `allowPreCommit`; the
compiler should derive the allowed state.

## Public Surface Impact

Hook human output may change. JSON trace compatibility depends on D0. Husky
delegator command path should remain stable.

## Proof Classes

Required design proof:

- current hook stage inventory;
- resource state scenarios;
- staged path and partial staging scenarios.

Later implementation proof:

- hook trace tests;
- resource state tests;
- staged mutation tests;
- partial staging refusal tests;
- pre-push base tests;
- command behavior for pre-commit/pre-push representative cases.

Non-claims:

- hook pass is not CI.
- hook pass is not review proof.
- hook pass is not runtime/product proof.
- hook pass is not full apply safety proof.

## Review Lanes

- Local feedback product review.
- Proof-class review.
- Generated-zone/Grit/check consumer review.
- Graphite operations review.

## Downstream Realignment

Update:

- hook contract doc;
- AGENTS hook guidance if behavior changes;
- Graphite handoff docs;
- command examples.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/hooks.test.ts`:
  expected exit 0; hook orchestration and staged-path proof.
- `bun run habitat hook pre-commit --dry-run`: expected exit 0 for clean staged
  state after D7/D9/D10 contracts are stable.
- `bun run habitat hook pre-push --dry-run`: expected exit 0 and must record
  Graphite base detection.
- Cache stance: hook dry-runs must run fresh because they depend on Git state.
- Injected bad case: include a staged generated-zone mutation and a failing
  wrapped check; prove hooks report local feedback without claiming CI proof.
- Non-claim: hooks are not authoritative verification and do not replace D12.

## Graphite/OpenSpec Closure

Use OpenSpec if hook behavior or trace schema changes. Commit after dependent
consumers are stable and tests prove local-feedback boundaries.

## Stop Conditions

Stop if:

- hook code owns proof semantics instead of consuming published contracts;
- resource state can contradict allowed commit behavior;
- hooks restage or rewrite outside explicit policy;
- hook success is described as CI or product proof.
