# D9 Transformation Transaction

## Intent

Refactor guarded structural writes so `habitat fix` can apply only approved
patterns with dry-run inventory, isolated-copy proof, path approval, rollback,
formatter handoff, and per-pattern gates.

## Product Scenario

An agent wants Habitat to apply a known structural repair. Habitat must show
what would change, refuse unsafe or unapproved writes, apply only inside approved
paths, run handoff gates, and leave rollback/non-claim proof.

## Domain Owner

Apply transaction owner.

Forbidden owners:

- Diagnostic Pattern Catalog owns findings, not writes.
- Pattern Governance owns apply admission decisions.
- Host Policy Boundary owns host-specific gates.
- Biome owns formatting, not transaction safety.

## Consumers

`habitat fix`, future approved apply packets, DRA owners, Pattern Governance,
Local Feedback.

## Contract

Define transaction states:

- dry-run inventory clean/no matches;
- dry-run inventory with approved changes;
- dry-run parse failure;
- dirty worktree refusal;
- unapproved path refusal;
- live apply success;
- live apply mismatch/refusal;
- formatter handoff success/failure;
- gate success/failure;
- rollback success/failure.

## Dependency Order

Blocked by: D1, D6, D8, and D10.

Unblocks: D11 and future apply packets.

Parallelism: no implementation until D8 and D10 are stable. G-HOST is consumed
through D10 for generated/protected-zone policy and directly for host-specific
pattern gates.

## Current State-Space Problem

`grit-apply.ts` combines generic transaction mechanics, one approved pattern,
inventory parsing, copy proof, changed path approval, MapGen-specific public ops
validation, Biome handoff, optional gates, and rollback. `GritApplyTransactionOptions`
can combine modes that do not represent user scenarios unless construction is
centralized.

## Solution Design

1. Separate transaction lifecycle from pattern-specific gates.
2. Consume Pattern Governance apply approval and Host Policy gate declarations.
3. Model transaction state as a union rather than `ok: boolean` plus optional
   proof fields.
4. Preserve dry-run before live apply as a public product path.
5. Keep Biome and other gates as handoffs with proof/non-claim labels.
6. Evaluate D15 only if command provenance/cwd/env/cache fields cannot be
   represented inside D9 transaction states.

## TypeScript State-Space Reduction

Introduce typed constructors for apply request modes:

- dry-run only,
- live approved transaction,
- rollback-capable transaction,
- gate handoff.

Prevent invalid combinations such as live apply without approved pattern,
MapGen-specific gate without host declaration, or success proof with failed
formatter handoff.

The rejected alternative is to generalize `runGritApplyTransaction` while
leaving pattern-specific validation inline.

## Public Surface Impact

`habitat fix` JSON/human output may change. D0 must version or preserve stable
fields. The command must remain narrow; this packet must not turn fix into a
general auto-repair engine.

## Proof Classes

Required design proof:

- current apply transaction flow inventory;
- current approved pattern inventory;
- host-specific gate inventory;
- safe-write proof shape.

Later implementation proof:

- dry-run tests;
- isolated-copy tests;
- unapproved path injected tests;
- dirty worktree refusal tests;
- rollback tests;
- formatter handoff tests;
- host gate tests;
- command behavior for `habitat fix --dry-run`.

Non-claims:

- apply success does not prove current-tree diagnostics are clean unless check
  runs separately.
- apply success does not prove product/runtime behavior.
- dry-run inventory does not prove live apply success.

## Review Lanes

- Apply safety review.
- Pattern Governance admission review.
- Host boundary review.
- Operations proof review.
- TypeScript state-space review.

## Downstream Realignment

Update:

- apply safety matrix;
- Pattern Authority ledger rows for apply-approved patterns;
- command docs;
- hook docs if hooks consume apply recovery guidance.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-apply.test.ts`:
  expected exit 0; isolated-copy, rollback, and safe-write proof.
- `bun run habitat fix --dry-run --json`: expected exit 0 after approved apply
  patterns have stable dry-run inventory output.
- `git status --short --branch`: expected exit 0 before and after dry-run; for
  write-mode fixture proof, only expected fixture files may change.
- Cache stance: dry-run and isolated-copy proof must run fresh, not from Nx cache.
- Injected bad case: include one apply pattern that would write outside approved
  roots and one generated-zone write blocked by D10.
- Non-claim: this packet does not admit apply patterns or prove host semantics;
  D8 and G-HOST own those inputs.

## Graphite/OpenSpec Closure

Use OpenSpec for any command output, transaction contract, or apply behavior
change. Commit only with clean worktree and rollback proof.

## Stop Conditions

Stop if:

- `habitat fix` can apply an unapproved diagnostic pattern;
- host-specific gates remain in generic transaction code;
- rollback failure is not represented distinctly;
- Biome/gate success is reported as apply safety or product proof.
