# Review Protocol

Status: active working protocol

This protocol exists because the first scopes reorganization preserved the
mechanical structure but dropped useful rationale and evidence. That was a
review failure. Future reviewers must check preservation of intent and evidence,
not only separation of files. Scope governance lives with the scope that owns
it; reviews verify that local rationale stays local instead of drifting into a
central catch-all.

## Reviewer Jobs

Reviewers are read-only unless explicitly assigned an implementation lane. They
must return findings, not rewrite the work.

Every reviewer prompt must be specific about:

- the absolute checkout path to inspect;
- the one job the reviewer owns;
- the source material to compare against;
- the destination files to inspect;
- the exact failure modes to hunt;
- the output shape.

Reviewer prompts name a defect class and a pass/fail contract instead of asking
for a generic "look it over" pass.

## Required Preservation Check

Any reorganization, split, consolidation, or migration review must include this
check:

```text
Compare the source material against the target material. Identify every
architecture-relevant idea that was dropped, weakened, duplicated, or moved to
the wrong layer. Pay special attention to rationale, why-not alternatives,
historical discoveries, metrics, source evidence, Narsil/tooling findings,
review outcomes, reframe conditions, and process lessons. Directory split
success requires preserving the reason the structure exists.
```

This is a blocking check. A reviewer who only validates file separation has not
reviewed the workstream.

For source-moving slices, preservation review must go below file paths. For
each reorganized source path, enumerate exported symbols and non-exported
behavior-bearing definitions, then mark each item:

- `Preserved`: exact destination named;
- `Intentional loss`: deletion backed by consumer proof and authority rationale;
- `Unresolved loss`: blocks closure.

For destinations outside the current scope, the reviewer must verify local owner
evidence from the destination's own docs, router guidance, existing exports, and
checks. Central slice rationale is not enough.

## Reviewer Prompt Template

Use this shape for fresh reviewers:

```text
You are reviewing a documentation/authority reorganization for the Habitat
closed-structure workstream.

Working checkout:
<absolute path>

Job:
<one bounded review job>

Read source evidence:
- <source file or commit source>

Read target files:
- <target file>

Read-only review.

Return findings only, ordered by severity. For each finding include:
- severity: P1 blocks closure, P2 should fix before closure, P3 polish;
- source location or source idea;
- target location or missing target;
- what was lost, distorted, duplicated, or misplaced;
- exact correction.

Mandatory checks:
- preservation of rationale and why-not alternatives in the scope, file, or
  pattern that owns the rule;
- preservation of metrics, tooling evidence, and review outcomes in the scope,
  file, or pattern they justify;
- no per-slice inventory leaking into scopes or decision book;
- no scope/file law hidden in overview prose;
- no scope governance hidden in a central context dump;
- no fake bucket, generic destination, or implementation improvisation;
- no source-material loss caused by making the tree look cleaner.
- for source-moving slices, no exported symbol or behavior-bearing definition
  remains `Unresolved loss`;
- for scope-crossing destinations, local owner evidence is verified.
```

## Process Lesson

Prompt design for reviewers is part of stewardship. A reviewer must be aimed at
the actual risk in the change. For a reorganization, the risk is not only
"wrong file shape"; it is also "correct-looking structure that silently drops
the knowledge that made the structure valid."

Before closing a reorganization, the steward must ask:

- What did the source docs know that the target docs no longer know?
- Is the loss intentional because a later decision superseded it?
- If intentional, is the superseding rationale captured?
- If not intentional, where is the smallest stable destination for that
  knowledge?
- Does that destination live with the scope, file, or pattern that actually owns
  the rule?
- If this review involves source movement, has every symbol or behavior-bearing
  definition been marked preserved, intentional loss, or unresolved loss?
- If a destination crosses a scope or package boundary, has the destination
  owner proven the placement locally?
