# Downstream Realignment Ledger

| Surface | Disposition | Notes |
| --- | --- | --- |
| `.habitat/AUTHORITY-TOOL-SEPARATION.md` | no patch needed | Existing owner split already matches implemented runner boundary. |
| `docs/projects/habitat-harness/structure-check/structure-check-runner-spec-shape.md` | patched | Removed prep-only metadata fields and locked the final v1 TOML contract to the closed direct-child scope model. |
| `.habitat/SUBJECT-CATEGORIES.md` | patched | Added `verify_standard_recipe_declared_stage_keys` and updated the structure-check packet file list/evidence. |
| Apply-pattern admission schema | patched | Full-suite proof exposed that docs apply admissions already point at authority-tree `.pattern.md` files; the schema now admits that path shape instead of forcing legacy `.habitat/patterns/apply/**` paths. |
| Command-check split systematic wave docs | no patch needed | The wave identified this row as topology/data-driven; this change implements the next owner model without rewriting the historical corpus. |
| Execution-surface analytics | not regenerated in this slice | The scanner does not yet model `.structure.toml` as an execution surface; analytics regeneration can happen in the next conversion wave if needed. |
| Future conversion work | ready | Remaining pure topology rows can target `structure-check` after assertion split and TOML proof. |
