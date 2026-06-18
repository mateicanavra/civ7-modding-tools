# D6 Diagnostic Pattern Catalog

## Intent

Separate Grit diagnostic acquisition and projection from Pattern Governance and
Transformation Transaction so diagnostics are trustworthy without implying rule
admission or apply safety.

## Product Scenario

An agent runs `habitat check --tool grit-check` and receives normalized Grit
findings, scan-root facts, adapter failures, and injected-violation proof
without assuming the pattern is registered for governance or safe to apply.

## Domain Owner

Diagnostic Pattern Catalog owner.

Forbidden owners:

- Pattern Governance owns candidate/registered lifecycle.
- Transformation Transaction owns writes.
- Structural Enforcement owns report assembly after diagnostics are projected.

## Consumers

Structural Enforcement, Pattern Governance, Local Feedback, Transformation
Transaction, Grit tests, DRA proof matrices.

## Contract

Define:

- Grit pattern diagnostic catalog entries;
- scan-root validation;
- native Grit command request;
- adapter failure projection;
- current-tree diagnostic projection;
- injected probe input/result;
- cache/freshness policy where command provenance requires it.

## Dependency Order

Blocked by: D1 and D2.

Unblocks: D7, D8, D9, D11.

Parallelism: can run in parallel with D5 after D2.

## Current State-Space Problem

`grit.ts` owns Grit acquisition, output parsing, scan-root validation, result
projection, and cache observations. Pattern Authority, apply, and hooks also use
Grit terms. The same pattern can be a diagnostic, a governed candidate, a
registered rule, a hook-scoped rule, or an apply candidate.

## Solution Design

1. Define diagnostic catalog states separate from governance and apply states.
2. Make Grit adapter failures a first-class proof class and command output
   projection.
3. Separate scan-root derivation from selected-rule execution.
4. Preserve native sample proof, current-tree wrapper proof, and injected
   violation proof as separate rows.
5. Evaluate D15 only if command cache/freshness/provenance cannot be represented
   locally in the D6 DTOs.

## TypeScript State-Space Reduction

Model Grit diagnostic states as a union:

- unavailable tool,
- parse failure,
- scan-root refusal,
- clean result,
- findings result,
- cache/freshness unobservable,
- injected-probe failure.

Do not use a generic `ok: boolean` plus optional error fields where the variant
can own the necessary fields.

The rejected alternative is to let Pattern Governance own all Grit metadata. It
would make diagnostics depend on human admission workflow.

## Public Surface Impact

May affect Grit failure messages and `CheckReport` diagnostic details. Must
preserve D0-classified JSON fields or version them. Native Grit fixture output
is not Habitat public API.

## Proof Classes

Required design proof:

- current Grit rule inventory;
- scan-root validation scenarios;
- adapter failure scenarios;
- injected probe coverage.

Later implementation proof:

- native Grit sample proof;
- current-tree wrapper proof;
- injected violation tests;
- adapter failure tests;
- command behavior for selected Grit checks;
- hook staged Grit tests after D11 consumes D6.

Non-claims:

- D6 does not admit a pattern.
- D6 does not prove apply safety.
- D6 does not prove full current-tree structural cleanliness.

## Review Lanes

- Grit diagnostic review.
- Proof-class review.
- Pattern Governance boundary review.
- TypeScript state-space review.

## Downstream Realignment

Update:

- Grit proof matrix;
- Pattern Authority ledger references to diagnostic proof;
- hook contract docs;
- `tools/habitat-harness/docs/CAPABILITIES.md`.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts`:
  expected exit 0; adapter, injected-probe, and native Grit sample proof.
- `bun run habitat check --tool grit-check --json`: expected exit 0 after the
  current `GritMalformedJson` projection risk is fixed or explicitly non-claimed.
- `git status --short --branch`: expected exit 0; proves probe cleanup leaves no
  source-tree residue.
- Cache stance: injected probes must run fresh; native Grit sample proof may
  record tool cache only if output includes exact pattern provenance.
- Injected bad case: include one scoped probe that should match exactly one row
  and one malformed wrapper output that must be projected as adapter failure.
- Non-claim: this packet does not admit or govern patterns; D8 owns admission.

## Graphite/OpenSpec Closure

Use a dedicated layer because many downstream packets consume Grit states. Use
OpenSpec if command JSON changes.

## Stop Conditions

Stop if:

- native Grit proof is reported as Habitat wrapper proof;
- a diagnostic rule is treated as an apply pattern;
- scan-root failures become generic command failures;
- D15 broad Effect/provenance migration is introduced without trigger proof.
