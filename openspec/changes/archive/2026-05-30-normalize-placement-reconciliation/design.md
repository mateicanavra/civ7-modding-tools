## Context

Resources and discoveries currently depend on official generator feasibility.
The accepted target is not to pretend the pipeline has ported every legality
rule. The target is typed intent plus typed reconciliation of what the engine
could place.

## Goals / Non-Goals

**Goals:**

- Represent planned resource/discovery intent explicitly.
- Capture per-tile placement outcomes.
- Type rejection reasons.
- Fail only on unexplained or mismatched drift.

**Non-Goals:**

- Gate on count equality.
- Port every official generator rule.
- Rewrite unrelated placement products.

## Decisions

### Intent Is Authoritative, Feasibility Is Reconciled

The pipeline owns the planned item type and location intent. Projection reports
whether the engine accepted it, rejected it for a typed reason, or produced
unexplained drift.

### Rejection Reasons Are Part Of The Contract

An engine rejection is acceptable only when it is represented by a typed reason
that downstream diagnostics and tests understand.

## Risks / Trade-offs

- Adapter surfaces may not expose enough data for typed outcomes; that blocks
  fail-hard gates.
- Untyped rejection buckets can become a silent fallback if allowed into the
  implementation.
- Docs may still describe official generator output as accepted truth.

## Review Lanes

- Product review: verifies resource/discovery intent semantics.
- Projection/proof review: verifies typed outcomes and proof claims.
- Adversarial review: checks for equality gates, silent rejection buckets, and
  hidden full-legality port scope.
