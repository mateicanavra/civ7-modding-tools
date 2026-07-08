# Packet 14 Verification Evidence

Packet: `studio-run-diagnostics-retention-guards`

Status: implementation and structural closure gates are green. Final packet
closure remains open pending the full live Run in Game matrix and final
packet-set review.

## Implementation Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Retention behavior | PASS | `bun nx run control-studio-server:test -- operationRuntime.test.ts` passed with `72` tests. Coverage includes startup cleanup, terminalization cleanup, active operation preservation, latest-100 retention by `terminalAt` plus request id, young terminal retention, diagnostics lookup after retained/deleted workspaces, and attribution sidecar disk retention/deletion. |
| Handler diagnostics lookup | PASS | `bun nx run control-studio-server:test -- handler.test.ts operationRuntime.test.ts` passed with `96` tests after the handler-level oRPC diagnostics test was tightened to wait for the private attribution report's top-level terminal state. |
| Studio server suite | PASS | `bun nx run control-studio-server:test` passed with `128` tests after retention and handler repairs. |
| Studio app suite | PASS | `bun nx run mapgen-studio:test` passed with `411` tests. |
| TypeScript check | PASS | `bun nx run control-studio-server:check` passed. |
| Workspace lint | PASS | `bun run lint` passed for the linted workspace projects. |

## Structural Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| SA-14 targeted check | PASS | `bun habitat check --json --rule habitat-studio-run-runtime-authority-closure` passed. |
| MapGen Studio Habitat owner check | PASS | `bun habitat check --owner mapgen-studio --json` passed, including SA-01 through SA-14. |
| Classification | PASS | `bun habitat classify` was run for the changed runtime source, server tests, SA-14 manifest, and structural matrix. Classification routed the runtime files to `control-studio-server` check/test and the authority files to Habitat/workspace lint surfaces. |
| Temporary pattern disposition | PASS | SA-14 rejects unresolved sibling rule directories, manifest/id mismatches, duplicate ids, advisory Grit rules, and rule manifests not listed in SA-01 through SA-14. No active packet-local temporary Grit pattern remains in the Run in Game authority set. |

## OpenSpec Evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Packet strict validation | PASS | `bun run openspec -- validate studio-run-diagnostics-retention-guards --strict` passed. |
| All strict validation | PASS | `bun run openspec:validate` passed: `363` items valid. |

## Review Evidence

| Lane | Result | Disposition |
| --- | --- | --- |
| TypeScript refactoring | PASS after repair | Initial no-findings review noted useful test gaps. Accepted and added young-record retention plus attribution sidecar disk checks. Re-review found SA-14 duplicate-id and handler poll brittleness; both repaired. |
| Code quality / structure | PASS after repair | Accepted findings that SA-14 needed to reject unmatrixed sibling rule manifests and assert its own matrix row. Repaired by expected-only sibling validation and SA-14 row validation while keeping child Habitat execution scoped to SA-01 through SA-13. |
| oRPC / Effect / Habitat library correctness | PASS after repair | Accepted findings that terminal retention cleanup should not block the uninterruptible publish path and that SA-14 failure output needed compact child-check summaries. Repaired by FiberSet-scheduled coalesced cleanup and child JSON parsing. |

## Live Matrix

Not yet green. Packet 14 still requires the full matrix in
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/target-vocabulary.md`:
actual Studio endpoint calls, successful in-game Civilization 7 launch variants,
API/control variants, public/private leak checks, diagnostics/correlation
evidence, and post-start Civ7 evidence that the loaded game uses the generated
Studio-run artifact.
