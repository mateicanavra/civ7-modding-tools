# Failure Patterns

Open this file when work starts drifting or a patch is growing wrappers.

| Failure | Symptom | Repair |
|---|---|---|
| Current topology becomes authority | A legacy file/folder is preserved because it exists | Return to controlling docs and owner boundaries |
| Generated output becomes source | `dist/`, `mod/`, or generated resources are edited directly | Change source and regenerate |
| Adapter/core collapse | Pure MapGen code imports Civ7 runtime APIs or adapter code grows algorithms | Move runtime calls to adapter/mod boundary and algorithms to core/domain owner |
| Truth/projection blur | Engine generator output is described as deterministic pipeline truth without a controlling decision | Decide whether the pipeline owns truth; otherwise name the surface as projection/materialization |
| Shared bucket growth | `shared`, `utils`, `common`, or `support` absorbs unrelated concerns | Split by owner and invariant |
| Router drift | `AGENTS.md` or docs point to missing/stale files | Fix routers before dependent implementation |
| Proof inflation | Typecheck/build/XML output is claimed as in-game correctness | Label proof boundary and run stronger evidence when needed |
| Guard appeasement | Code shape contorts to satisfy lint/type failures | Repair the boundary or enforcement model |
| Hidden sub-pipeline | A single step delegates a long sequence with unmodeled dependencies | Expose contract steps or document as compatibility/materialization wrapper |
| Closure overclaim | Final status says done/safe/verified without exact evidence | Restate claim with implemented and verified boundaries |

## Smell Tests

- Would this owner still make sense if the current path had never existed?
- Is the helper hiding an adapter, runtime, or generated-output decision?
- Is the folder name an owner or a vague adjective?
- Does the proof observe source behavior, generated output, or in-game runtime?
- Could a future agent identify the responsible docs and tests without chat history?
