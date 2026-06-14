# Review Disposition Ledger

**Change:** `habitat-enforcement-surface-cleanup`
**Status:** reviews received; accepted P1/P2 findings patched in design
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HESC-R1 | Effect substrate | P1 | Selector/check pipeline, command provenance, orchestration boundaries, wrapper-parser projection, and cleanup/test seams are genuine Effect-fit areas; records-only and root-script label edits are not. | Accepted. | Patch design to state slice-level Effect recommendation and adoption gates. | patched |
| HESC-R2 | Effect substrate | P1 | Effect adoption must preserve oclif as command shell, keep `Effect.run*` at runtime edges, preserve valid `CheckReport` v1 unless separately changed, keep `check` collect-all, and leave Nx/Grit/Biome proof native. | Accepted. | Patch design/tasks with runtime-edge, report-compatibility, collect-all, fail-closed, and native-proof gates. | patched |
| HESC-R3 | Effect substrate | P2 | Manual implementation is acceptable only when it provides the same typed failure, command provenance, cleanup proof, and test substitution outcomes for trigger-area slices. | Accepted. | Patch design/tasks to require manual-equivalence proof when Effect is not adopted. | patched |
| HESC-R4 | Command/evidence | P1 | Verify proof could still close from prose because current `verify` prints CheckReport plus raw Nx output and does not emit a structured proof artifact. | Accepted. | Add `workstream/verify-proof-contract.md`; patch design, spec, tasks, and proof matrix to require generated structured `VerifyProof`. | patched |
| HESC-R5 | Effect substrate | P2 | Effect/manual decision was sequenced after implementation-shaped tasks despite standing decision record requiring it before command/check/fix/hook orchestration work. | Accepted. | Patch tasks/design to make the Effect adopt/manual table a pre-implementation gate for command, wrapper, verify, selector, hook, and proof provenance edits. | patched |
| HESC-R6 | Wrapper/parser | P2 | Wrapped-test parity was underspecified; zero-exit skip/warning/debt output could disappear through the generic parser. | Accepted. | Patch design, spec, tasks, and proof matrix to require direct-vs-Habitat parity for every `wrapped-test` rule. | patched |
| HESC-R7 | CI/evidence | P2 | CI proof boundary could overclaim because the packet classified Habitat verify but not the main CI build/Biome/lint/test steps. | Accepted. | Add `workstream/ci-classification.md`; patch design, spec, tasks, and proof matrix to separate CI proof classes and non-claims. | patched |
| HESC-R8 | Records/downstream | P3 | Downstream realignment omitted `invariant-corpus.md`, which still contains H6-era enforcement statements. | Accepted. | Add downstream ledger rows for `invariant-corpus.md` and Stage 0/research scan artifact. | patched |
