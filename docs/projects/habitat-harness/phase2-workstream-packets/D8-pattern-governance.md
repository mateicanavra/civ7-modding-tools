# D8 Pattern Governance

## Intent

Separate Pattern Authority lifecycle from Grit diagnostics, baselines, and apply
transactions so candidate and registered patterns cannot be confused.

## Product Scenario

A human or DRA creates a candidate structural pattern and later registers it
only after manifest, fixture, baseline, hook-scope, false-positive, and proof
decisions are explicit.

## Domain Owner

Pattern Authority owner.

Forbidden owners:

- Diagnostic Pattern Catalog does not admit patterns.
- Baseline Authority does not decide pattern lifecycle.
- Scaffolding may create candidates but not register enforced rules by
  implication.
- Transformation Transaction may only consume approved apply patterns.

## Consumers

Pattern generator, pattern registration script, Structural Enforcement,
Diagnostic Pattern Catalog, Transformation Transaction, Local Feedback,
recovery ledgers.

## Contract

Define lifecycle states:

- candidate draft,
- manifest-invalid candidate,
- registered diagnostic pattern,
- registered hook-scoped pattern,
- registered apply-approved pattern,
- refused pattern,
- retired pattern.

Each state names required sources, fixtures, proof classes, baseline contract,
hook-scope decision, and apply-safety decision.

## Dependency Order

Blocked by: D1, D2, D5, D6.

Unblocks: D9 and D13.

Parallelism: after D5/D6 contracts stabilize, can proceed before D7 finishes if
it does not modify enforcement execution.

## Current State-Space Problem

Pattern candidate generation, manifest validation, rule registration, Grit rows,
baseline files, and hook scope currently combine to define admission. Candidate
output can be mistaken for an active rule, baseline authority, or hook-scoped
check.

## Solution Design

1. Model Pattern Authority lifecycle as discriminated states.
2. Make candidate generation produce an explicit non-registered state.
3. Make registration consume D2 metadata facets, D5 baseline contract, and D6
   diagnostic proof.
4. Add refusal states for missing manifest, missing fixtures, missing baseline
   contract, missing hook-scope decision, and apply-safety absence.
5. Ensure apply approval is a separate decision, not implied by Grit diagnostic
   registration.

## TypeScript State-Space Reduction

Replace implicit lifecycle through file presence with a typed lifecycle union.
The compiler and tests should prevent a candidate pattern from being treated as
registered and prevent a registered diagnostic from being treated as apply-safe.

The rejected alternative is to document candidate/registered differences only in
README text. The product requires refusals and proof gates.

## Public Surface Impact

Pattern generator output and registration messages may change. Any generator
schema or output behavior change must be handled with D0 and D13 compatibility.

## Proof Classes

Required design proof:

- candidate/registered lifecycle inventory;
- manifest schema inventory;
- baseline and Grit dependencies.

Later implementation proof:

- manifest validation tests;
- candidate generator tests;
- registration tests;
- baseline contract proof;
- diagnostic proof linkage tests;
- refusal tests for missing gates.

Non-claims:

- registered diagnostic pattern is not apply-safe.
- candidate output is not an active rule.
- manifest validation does not prove current-tree wrapper behavior.

## Review Lanes

- Product lifecycle review.
- Proof-class review.
- Baseline/Grit dependency review.
- Scaffolding handoff review.

## Downstream Realignment

Update:

- Pattern Authority ledger;
- `grit-pattern-corpus-ledger.md`;
- pattern generator docs;
- command examples and AGENTS guidance if candidate semantics change.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/generators/pattern-generator.test.ts test/rules/pattern-authority-manifest.test.ts`:
  expected exit 0; candidate generation and manifest proof.
- `bun run habitat check --rule baseline-integrity --json`: expected exit 0;
  baseline contract proof for registered patterns.
- `git status --short --branch`: expected exit 0; proves candidate generation
  and manifest updates are tracked intentionally.
- Cache stance: generator/manifest tests must run fresh; baseline command may
  use normal command execution if exact output is recorded.
- Injected bad case: include a candidate without accepted manifest, fixture
  proof, or hook-scope decision and prove it cannot become registered.
- Non-claim: this packet does not own Grit acquisition or apply transactions.

## Graphite/OpenSpec Closure

Use OpenSpec if generator or registration behavior changes. Commit after D5 and
D6 proof contracts are available.

## Stop Conditions

Stop if:

- file presence still implies lifecycle;
- candidate and registered states share one unconstrained type;
- apply approval is implied by diagnostic registration;
- baseline or hook-scope decisions are optional prose only.
