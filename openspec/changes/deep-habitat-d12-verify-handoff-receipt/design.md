# Design: D12 Verify Handoff Receipt

## Boundary

D12 owns the `habitat verify` receipt boundary. It assembles already-owned
upstream facts into a bounded local handoff record:

- D7 owns check-report semantics and affected-execution admission.
- D3 owns workspace graph reads, graph refusal, and verify target planning.
- D1 owns bounded command-output DTO discipline.
- Oclif owns command parsing and help rendering.

D12 does not own the truth of project targets, rule correctness, graph
correctness, CI, root aggregate verification, reviewer approval, or PR readiness.

## Source Layout

| File | Responsibility |
| --- | --- |
| `src/commands/verify.ts` | Thin Oclif adapter: parse flags, run check, ask D3 for target plan, invoke affected Nx only when allowed, render human or JSON output. |
| `src/lib/verify/index.ts` | Verify module barrel for command orchestration and package exports. |
| `src/lib/verify/schema.ts` | TypeBox source of truth for `VerifyReceipt` and child DTOs. |
| `src/lib/verify/base.ts` | Base selection from explicit flag or merge-base resolution. |
| `src/lib/verify/receipt.ts` | Receipt assembly from D7 projection, D3 target plan, affected result, and post-state observation. |
| `src/lib/verify/nx-affected.ts` | Affected argv construction and bounded Nx output summarization. |
| `src/lib/verify/post-state.ts` | Bounded `git status --short --branch` observation. |
| `src/lib/verify/command-output.ts` | Shared bounded-output and selected-env helpers. |

## Receipt State

`VerifyReceipt` is a closed TypeBox object:

- `outcome`: `succeeded`, `failed`, or `blocked`.
- `base`: requested base, resolved base, and source (`flag` or `merge-base`).
- `habitatCheck`: selected rule ids, status counts, D7 admission, and selector state.
- `targetPlan`: ready targets or graph-refusal summary.
- `nxAffected`: `executed`, `failed`, or `skipped`.
- `postState`: observed clean, observed dirty, or unavailable.

The receipt contains command-output previews and lengths. It does not serialize
raw stdout/stderr bodies from affected Nx.

## Command Flow

1. Resolve base from `--base` or merge-base.
2. Run Habitat check through the existing check-report boundary.
3. Consume D7 `VerifyCheckSummaryProjection`.
4. Read D3 `VerifyTargetPlan`.
5. If check or graph state blocks affected execution, build a blocked receipt.
6. Otherwise run:
   `nx affected -t <targets> --base <resolved-base> --head HEAD --outputStyle=static`
7. Observe post-state with `git status --short --branch`.
8. Emit human output or JSON receipt.

## Stability

- Keep the existing command path and package root exports stable.
- Keep `schemaVersion: 1` for the current receipt DTO.
- Keep source modules generic to repo-local structural tooling; no Civ-specific
  domain semantics belong in D12.
- Future receipt fields should be TypeBox-first and added through the schema
  module before runtime assembly code consumes them.

## Validation

Focused validation for this slice:

- TypeScript package check.
- Verify receipt unit tests.
- Oclif command tests for `verify`.
- `habitat verify --help`.
- `habitat verify --json`.
- OpenSpec validation.
- Diff hygiene.
