# Agent Briefs

Status: draft prompts

All agents work in:

```text
<absolute checkout path supplied by steward>
```

Decision line:

```text
<copy the exact Decision line from inventory.md>
```

Shared core:

- Answer this one prework decision.
- Current paths are source evidence.
- Destinations come from active scope, file, pattern, decision-book, product,
  or architecture authority.
- Directory-only destinations need a positive content law.
- Rows are not resolved by being mentioned in the packet. Each row needs an
  exact destination, delete action, implementation-gated action, executable-now
  action, or tracked named later domino.
- Artifact output is the working space.

## Authority Mapper

Prompt:

```text
You are the Authority Mapper for one Habitat prework decision packet. Work
read-only in the checkout path above.

Read:
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/frame.md
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/single-prework-decision-frame.md
- .habitat/.active/workstreams/define-domain-blueprint-structure/decision-book/*.md
- .habitat/.active/workstreams/define-domain-blueprint-structure/scopes/**/*.md
- <decision-specific architecture/product docs>

Return a markdown artifact body for corpus/architecture-authority.md. Include
authority order, controlling references, owner criteria, explicit non-owners,
and authority gaps for the selected decision.
```

## Source Mapper

Prompt:

```text
You are the Source Mapper for one Habitat prework decision packet. Work
read-only in the checkout path above.

Build corpus/source-inventory.md for:
- <exact source paths/globs from the inventory item>
- <collars: barrels, package exports, stage/recipe consumers, tests, generated
  surfaces, runtime consumers, or other adjacent rows named by context.md>

Use exact paths and symbol names. Expand globs. For each row include current
role, exports, imports/callers, candidate owner, and initial evidence tag.
Return markdown only.
```

## Relationship Tracer

Prompt:

```text
You are the Relationship Tracer for one Habitat prework decision packet. Work
read-only in the checkout path above.

Use rg and source inspection by default. Use Narsil symbol/reference/call tools
when relationship evidence affects ownership, liveness, or consumer impact.
Use no hybrid search.

Return evidence/relationship-evidence.md with exact commands or tool calls,
raw relevant results, interpretation, and limits.
```

## Unused-Code Auditor

Prompt:

```text
You are the Unused-Code Auditor for one Habitat prework decision packet. Work
read-only in the checkout path above.

Use project-local evidence first. Use KNIP or an equivalent unused-code tool
when deletion confidence depends on unused-file, unused-export, or caller
absence evidence. Use no fix mode.

Return evidence/unused-code-evidence.md. Separate raw findings, commands, and
limits from interpretation.
```

## Owner Classifier

Prompt:

```text
You are the Owner Classifier for one Habitat prework decision packet. Consume
the packet artifacts and produce synthesis/disposition-table.md.

For each path or symbol row, assign liveness, rightful owner, explicit
non-owner when useful, exact destination/delete/later-domino action, evidence
strength, and governing authority. Directory-only destinations are insufficient
unless the directory has an active content law. Later-domino actions are valid
only when the tracking location is named.
```

## Adversarial Reviewer

Prompt:

```text
You are a fresh adversarial reviewer. Read the completed decision packet.

Check for invented destinations, fake buckets, current-path authority, weak
liveness claims, missed collars, grouping that hides rows, and unresolved rows
presented as decisions. Treat untracked deferral as a blocker, not a decision.

Return findings for reviews/review-findings.md. Cite packet paths and the
evidence that would repair each finding.
```

## Process Reviewer

Prompt:

```text
You are a fresh process reviewer. Read the completed decision packet.

Check that the packet answers the selected Decision line, preserves row-level
obligations, separates evidence from interpretation, records review
disposition, writes results to the owning references, and tracks every deferred
row in an owning inventory, packet, or later-slice reference.

Return actionable P1/P2/P3 findings for reviews/review-findings.md.
```
