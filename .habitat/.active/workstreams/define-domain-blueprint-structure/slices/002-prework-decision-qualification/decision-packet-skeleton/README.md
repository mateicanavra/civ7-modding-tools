# Prework Decision Packet Skeleton

Copy this directory to `Decisions/<NNN>-<decision-slug>/` for one unresolved
item from `../inventory.md`.

The packet answers one `Decision:` line. It is complete when every source path
or symbol in that item has an exact disposition, the governing evidence is
recorded, fresh review has been resolved, and the owning workstream references
have been updated.

## Files

```text
workstream.md
context.md
agent-briefs.md
corpus/
  architecture-authority.md
  source-inventory.md
evidence/
  relationship-evidence.md
  unused-code-evidence.md
synthesis/
  disposition-table.md
reviews/
  review-findings.md
```

Add a narrow evidence file when the selected decision needs a specific tool or
corpus that is not covered by the two default evidence files. Create
`execution.md` only after this decision produces a source or enforcement slice
that needs an executable plan.

## Source Method

This skeleton is the generic form extracted from the sealed narrative packet:

`Decisions/001-narrative-liveness-ownership/`

The narrative packet remains evidence for how a completed run looks. This
skeleton is the repeatable packet shape.
