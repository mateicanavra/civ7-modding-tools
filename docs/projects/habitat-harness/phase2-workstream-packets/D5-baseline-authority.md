# D5 Baseline Authority

## Intent

Separate baseline debt authority from structural enforcement execution and
Patterns admission so baselines remain explicit, shrink-only, and
reviewable.

## Product Scenario

A rule reports existing debt. Habitat must say whether the baseline is explicit
empty, explicit debt, external exception, malformed, missing, or a valid rule
introduction, and it must refuse accidental debt growth.

## Domain Owner

Baseline Authority owner.

Forbidden owners:

- Structural Enforcement consumes baseline states but does not define debt
  authority.
- Patterns consumes baseline contracts but does not bypass them.
- Grit diagnostics reports findings but does not decide baseline growth.

## Consumers

`habitat check`, Patterns, rule introduction workflows, baseline JSON
files, tests, review ledgers.

## Contract

Define baseline state and guard contracts:

- explicit empty baseline,
- explicit debt baseline,
- external exception baseline,
- malformed baseline,
- missing baseline,
- orphan baseline,
- introduced-rule baseline expansion,
- shrink-only failure.

## Dependency Order

Blocked by: D2.

Unblocks: D7 and D8.

Parallelism: can run in parallel with D3 and D6 after D2.

## Current State-Space Problem

`baseline.ts` already contains several useful discriminated states, but
`BaselineExpansionGuardResult` remains `{ ok: boolean; message: string;
reason?: ... }`, and external exception source models use optional projection
and validation paths. Enforcement currently applies baselines inline inside
`createCheckReport`.

The reachable state problem is incomplete baseline authority: baseline state,
rule introduction, external exception validation, and enforcement report
construction can drift.

## Solution Design

1. Tighten baseline guard outputs into discriminated states.
2. Separate baseline state loading/validation from enforcement report assembly.
3. Define external exception source variants so incomplete projection/validation
   combinations cannot exist.
4. Add a baseline contract projection consumed by Patterns.
5. Keep `--expand-baseline` behavior behind a typed introduction guard.

## TypeScript State-Space Reduction

Collapse boolean guard results and optional exception models into unions with
variant-owned fields. The compiler should prevent `ok: true` with a failure
reason or an external exception state missing its projection contract.

The rejected alternative is to leave baseline logic inline and add more tests
around `createCheckReport`; that preserves mixed authority.

## Public Surface Impact

Baseline JSON contract and command failure messages may become more explicit.
D0 must classify whether baseline error JSON is stable. No arbitrary baseline
growth is permitted.

## Receipt Classes

Required design receipt:

- baseline file inventory;
- current baseline contract tests;
- external exception models.

Later implementation receipt:

- baseline contract tests;
- baseline expansion guard tests;
- malformed/orphan/missing baseline tests;
- current-tree baseline integrity check;
- Patterns baseline-consumer tests.

Non-claims:

- D5 does not execute Grit.
- D5 does not prove all structural rules pass.
- D5 does not admit new rules.

## Review Lanes

- Baseline authority review.
- TypeScript state-space review.
- Patterns consumer review.
- Receipt/non-goal review.

## Downstream Realignment

Update:

- baseline contract record;
- `recovery-claim-ledger.md` rows that cite baseline state;
- Patterns docs;
- check command examples that show baseline failures.

## Validation Commands / Receipt Template

- `bun run --cwd tools/habitat test -- test/lib/baseline.test.ts`:
  expected exit 0; baseline state-machine receipt.
- `bun run habitat check --rule baseline-integrity --json`: expected exit 0;
  current-tree baseline-integrity command receipt.
- `git status --short --branch`: expected exit 0; proves baseline edits are
  intentional tracked changes only.
- Cache stance: baseline tests are uncached Vitest receipt; command receipt must
  record whether the Habitat check used any wrapped target cache.
- Injected bad case: include missing, malformed, orphaned, and expanded
  baseline rows; prove additions are rejected unless the rule itself is new.
- Non-claim: this packet does not prove a diagnostic is correct, only how debt
  is represented and allowed to shrink.

## Graphite/OpenSpec Closure

Use OpenSpec if baseline file contract or command output changes. Commit before
D7 and D8 implementation.

## Stop Conditions

Stop if:

- baseline guard can represent contradictory ok/failure states;
- baseline expansion can run without introduction manifest receipt;
- Patterns has a second baseline contract;
- current-tree baseline integrity is unverified or non-goaled incorrectly.
