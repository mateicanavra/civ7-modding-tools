# Review Findings

Status: closed review artifact

## Findings

### Accepted: Whole-file Classification Was Too Coarse

Review found that `lib/tectonics/constants.ts` and `lib/tectonics/shared.ts`
mix owner classes. The final disposition table now splits those rows by symbol
group instead of assigning a whole-file destination.

### Accepted: Core Extraction Needs Stronger Execution Proof

Some `shared.ts` helpers are plausibly core mechanics, but current import
evidence only proves foundation consumers. The final table marks those as core
extraction candidates with exact candidate files and requires later execution
proof before movement.

### Accepted: Deletion Evidence Is Strong But Not Tool-Complete

No installed Knip, ts-prune, depcheck, or unimported binary was available. The
deletion rows are therefore qualified by `rg` import evidence plus duplicate
operation-local owner evidence. The final table requires typecheck/test proof in
the later deletion slice.

### Accepted: `require.ts` Has No Legal Whole-File Destination

`require.ts` is live cross-operation guard support, but neither shared
`foundation/lib` nor a generic helper folder is an owner. The disposition table
therefore blocks whole-file movement and requires either operation-local
decomposition or a narrow artifact-validation owner law before preserving a
shared validation surface.

## Coverage Check

Every source row in `corpus/source-inventory.md` appears in
`synthesis/disposition-table.md`. Mixed rows have symbol-level dispositions.

## Final Review State

No accepted P1/P2 findings remain open for this packet. Remaining risks are
intentionally carried into later implementation slices:

- exact core API proof for core-candidate helpers;
- exact artifact-contract extraction mechanics;
- typecheck/test proof before deleting unimported duplicate files;
- owner-law decision for shared artifact input guards.
