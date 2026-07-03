# Foundation Lib / Tectonics Disposition Workstream

Status: closed prework decision

This packet runs prework item 1 from `../inventory.md`.

Decision:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

The controlling method is:

- `../frame.md`
- `../single-prework-decision-frame.md`
- `../decision-runner-brief.md`

## Objective

Produce a row-level decision for every file currently under
`mods/mod-swooper-maps/src/domain/foundation/lib/**`, with exact owner class,
exact disposition, governing authority, and evidence strength.

The packet remains prework only. It does not move source, delete files, edit
runtime code, author Grit rules, or change `structure.toml`.

## Authority Order

1. Direct user decisions in the active session.
2. Active scope, file, and pattern documents in this workstream.
3. Shared decision-book criteria in this workstream.
4. Canonical Civ7 product and architecture authority.
5. Current source, callers, tests, and generated/runtime evidence.
6. Git history and stale docs as explanatory evidence only.

Current location is evidence. Owner placement comes from authority plus source
relationships.

## Evidence Plan

Required evidence was gathered for:

- selected inventory item;
- active domain scope/file law and decision-book criteria;
- all current `foundation/lib/**` files;
- exports, imports, callers, and adjacent operation consumers;
- downstream recipe/stage consumers;
- `packages/mapgen-core` ownership and existing reusable mechanics surfaces;
- duplicate-operation evidence for unimported tectonics implementation files.

Tool evidence used:

- `find` for exact current file list;
- `rg` direct import and symbol scans;
- targeted source inspection for operation-local replacement implementations;
- `packages/mapgen-core/src/**` surface inspection for plausible core owners;
- `bun habitat classify .habitat/.active` as final routing validation;
- `git diff --check -- .habitat/.active` as final whitespace validation.

No compiler, runtime, or source movement verification was required because this
packet does not modify source behavior.

## Team Lanes

The steward owns synthesis, write-back, and final decisions. Three read-only
lanes were assigned:

| Lane | Artifact | Output |
| --- | --- | --- |
| Authority Mapper | `corpus/architecture-authority.md` | Controlling owner criteria, source docs, non-owners, and authority gaps. |
| Source Mapper | `corpus/source-inventory.md` | Exact paths/symbols, exports, imports, callers, collars, and initial role tags. |
| Unused-Code Auditor | `evidence/unused-code-evidence.md` | Unused/dead-code findings, commands, limits, and interpretation. |

The steward also ran local relationship checks so synthesis could proceed while
agent lanes were in flight. Agent results were used as cross-checking evidence,
not as authority.

## Closure

This packet is closed because:

- `synthesis/disposition-table.md` covers every row in
  `corpus/source-inventory.md`;
- every row has an exact disposition or a named authority/reference update;
- raw evidence and interpretation are separated;
- review findings are resolved in `reviews/review-findings.md`;
- `../inventory.md` now records this packet in the completed section and
  advances the active queue.

## Write Boundary

This packet writes active Habitat authority material under this decision
directory and the owning inventory write-back only. Later source movement,
deletion, `structure.toml`, Grit packets, and runtime code changes must be
opened as implementation slices.
