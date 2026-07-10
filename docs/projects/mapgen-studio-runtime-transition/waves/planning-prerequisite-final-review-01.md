# Planning Prerequisite Second-Repair Review 01

Status: closed with residual findings; third repair required

Closed: 2026-07-09T21:59:38-04:00

## Assignments

| Branch | Agent/session | State | Result |
| --- | --- | --- | --- |
| environment repair | Rawls (`019f49b6-67f9-7ae0-8cf4-aa63398d7ffa`) | closed | two P2 fixture-boundary findings |
| Foundry authority | Heisenberg (`019f49b6-6916-7d90-a8d0-c58c22552e62`) | closed | three P1 RAWR/source-order findings |
| token value form | Kepler (`019f49b6-6a24-7cc2-b698-9d83800aaa2d`) | closed | three P2 collector/guard/write-set findings |

All reviewers were read-only and preserved the dirty worktree patches.

## Residual Findings

| Finding | Severity | Disposition | Repair demand |
| --- | --- | --- | --- |
| `ENV-RR2-01` fixture sanitization masks helper behavior | P2 | accepted | separate hermetic fixture-construction env from deliberately poisoned helper-invocation env; verify the helper clears its claimed selectors/signing itself |
| `ENV-RR2-02` local transport policy inherited | P2 | accepted | set fixture `GIT_ALLOW_PROTOCOL=file` explicitly and retain hostile outer-env coverage |
| `FOUNDRY-RR2-01` resources/providers/lifecycle conflated | P1 | accepted | resources own contracts/selectors, providers implement them, and lifecycle machinery belongs under `packages/core/runtime` |
| `FOUNDRY-RR2-02` realization starts after compile | P1 | accepted | runtime realization includes compilation as its first phase and continues through provisioning/lowering/mounting/diagnostics/finalization |
| `FOUNDRY-RR2-03` source order still duplicated | P1 | accepted | make canonical `FRAME.md` the only ordered list; every README/frame/domino/DRA entry delegates without restating or reversing it |
| `TOKEN-RR2-01` missing story export can look healthy | P2 | accepted | collect an observable render-success marker and exercise the collector seam against invalid export/navigation cases |
| `TOKEN-RR2-02` chroma grammar/guard evidence conflict | P2 | accepted | align grammar with declared range and send malformed, empty, HSL, and out-of-range mutations through the real artifact guard; narrow task wording to actual evidence |
| `TOKEN-RR2-03` OpenSpec omits new helper/test owners | P2 | accepted | disclose the result-helper split and both new files in proposal/design/tasks |

Already closed in this pass: API kind/instance/projection ownership,
worker/host candidate status, app-owned selection, unresolved Studio
decomposition, and deferred cleanup/exit ordering.

## Close Condition

Fresh workers implement only these residuals. A fresh review then requires zero
P1/P2. No branch advances to commit merely because its static checks are green.
