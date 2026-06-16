# Downstream Realignment Ledger - Apply Helper Redeclarations

| Surface | Action | Rationale | Remaining gate |
| --- | --- | --- | --- |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Update required | The RHR row no longer has live helper redeclarations after this source remediation; the AHR apply row needs current proof state. | Final proof commands and local commit. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Update required | Aggregate proof matrix must distinguish historical RHR blocker evidence from current remediated source state. | Final proof commands and local commit. |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Update required | Command log needs direct apply-pattern, source remediation, package validation, and RHR-clean proof rows. | Final proof commands and local commit. |
| `openspec/changes/habitat-grit-proof-runtime-helper-redeclarations/**` | Minimal downstream update if touched | The original RHR blocker checkpoint remains historical, but future readers should see that a successor apply row remediated the live candidates. | Preserve RHR fixture proof and non-claims. |

## Protected Surfaces

- Generated `mod/` output.
- Shared Habitat apply adapter implementation beyond reverting the out-of-scope
  helper allowlist experiment.
- HR classify/generator records and implementation.
