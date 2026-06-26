# Phase Record: D12 Verify Handoff Receipt

## State

- Status: source implementation complete; final Graphite submission remains.
- Stack parent: submitted D11 local-feedback layer `c0a45918b`.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`.
- Product boundary: `habitat verify` emits a bounded verify receipt from check, graph target-plan, affected Nx, base, and post-state observations.

## Objective

D12 implements the verify handoff receipt as a generic repo-local Habitat command
contract. The receipt helps an agent or reviewer understand what local checks
were consumed, whether affected targets ran or were skipped, how the base was
selected, what bounded command-output metadata is available, and what post-state
was observed.

D12 owns local verify receipt state only. CI, PR state, product approval,
runtime behavior, OpenSpec acceptance, apply safety, root aggregate
verification, rule correctness, and Graphite readiness remain separate owner
surfaces.

## Current Implementation Shape

- `tools/habitat-harness/src/commands/verify.ts` remains a thin Oclif command adapter.
- `tools/habitat-harness/src/lib/verify/index.ts` is the verify module barrel used by the command and package root.
- Focused modules under `tools/habitat-harness/src/lib/verify/` own base resolution, TypeBox schemas, receipt assembly, Nx affected observation, bounded command output, and post-state observation.
- TypeBox schemas are the source of truth for receipt DTOs and runtime validation.
- D7 `VerifyCheckSummaryProjection` decides affected-execution admission and selector state.
- D3 `VerifyTargetPlan` supplies affected targets and graph-refusal state.
- Affected execution is closed as `executed`, `failed`, or `skipped`.
- Skipped affected execution carries either `habitat-check-failed` or `workspace-graph-refused`.
- Nx affected argv is `nx affected -t <D3 targets> --base <resolved-base> --head HEAD --outputStyle=static`.
- Serialized receipt output stores bounded stdout/stderr metadata, not raw command-output bodies.
- Receipt source omits process-only fields.

## Validation

| Command | Status | Result |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness check` | pass | `tsc -p tsconfig.json --noEmit` exited 0 after the verify module split and TypeBox schema documentation pass. |
| `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts` | pass | 2 files, 16 tests passed. |
| `bun run habitat verify --help` | pass | Oclif help renders verify usage, `--base`, and `--json`. |
| `bun run habitat verify --json` | pass with blocked receipt | Exit 1 with valid `VerifyReceipt`: `outcome=blocked`, `nxAffected.kind=skipped`, `habitatCheck.consumption=blocks-affected-execution`, `targetPlan.kind=target-plan-ready`, `postState.kind=observed-dirty`; stdout stored at `/tmp/d12-habitat-verify-json.out`. |
| `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` | pass | Change is valid. |
| `bun run openspec:validate` | pass | 249 OpenSpec items passed, 0 failed. |
| `git diff --check` | pass | No whitespace errors. |
| Active source/test terminology audit | pass | No removed process-era receipt vocabulary remains in active Habitat source/tests. |

## Remaining Closure Work

- Commit and submit through Graphite with a clean worktree.
