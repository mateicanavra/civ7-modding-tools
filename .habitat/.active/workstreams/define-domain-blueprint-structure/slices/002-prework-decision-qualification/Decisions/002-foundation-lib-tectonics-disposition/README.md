# Foundation Lib / Tectonics Disposition Decision Packet

Status: closed prework decision

This packet answers prework inventory item 1 from `../inventory.md`.

Decision:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Outcome

The active `foundation/lib/**` surface is not a valid destination bucket for the
closed domain blueprint. The live rows split into named foundation model policy,
foundation artifact-contract surfaces, and foundation operation-rule support.
The unimported `foundation/lib/tectonics/*` implementation files are duplicate
historical implementations with active operation-local replacements and are
qualified for deletion in a later execution slice.

No row is qualified for immediate movement in this prework packet. Several rows
need a narrow authority/reference update before execution because the current
scope law names the destination classes but not every exact foundation
contract/policy/support file.

## Artifacts

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

No `execution.md` is present. Source migration, deletions, `structure.toml`,
Grit packets, and runtime changes belong to later implementation slices.
