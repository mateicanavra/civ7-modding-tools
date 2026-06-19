# Tasks

## 1. Source-Start Reconciliation

- [x] Read the accepted D12 packet, current verify source/tests, D0 matrix rows, and D1/D3/D7/D11 upstream source surfaces.
- [x] Confirm the active stack is on `agent-DRA-d12-verify-handoff-receipt` above submitted D11.
- [x] Treat stale pre-refactor packet/source language as historical input only; target source uses verify receipt language.
- [x] Confirm D3 `VerifyTargetPlan` and D7 `VerifyCheckSummaryProjection` are live TypeBox-backed projections.
- [x] Confirm D11 hook/local-feedback state is not required for the current D12 receipt implementation.

## 2. Public Surface Inventory

- [x] Cite existing D0 verify command rows for `habitat verify`, `--base`, `--json`, human affected-run output, and help wording.
- [x] Add or update D0 rows for current `VerifyReceipt` JSON and exported receipt symbols.
- [x] Update stale verify rows that still describe the current JSON/help surface using old terminology.
- [x] Preserve the distinction between root `bun run verify` and diagnostic `habitat verify`.

## 3. TypeScript Implementation

- [x] Keep `tools/habitat-harness/src/commands/verify.ts` as a thin Oclif adapter.
- [x] Replace broad receipt logic with focused modules under `tools/habitat-harness/src/lib/verify/`.
- [x] Define TypeBox-first schemas and derived TS types for `VerifyReceipt` and its state families.
- [x] Record base source as `flag` or `merge-base`.
- [x] Consume D7 check projection for selected rules, status counts, selector state, and affected-execution admission.
- [x] Consume D3 target plan and graph-refusal state before running affected Nx targets.
- [x] Represent affected execution as `executed`, `failed`, or `skipped`.
- [x] Build Nx affected argv from the D3 target plan, resolved base, `--head HEAD`, and `--outputStyle=static`.
- [x] Bound stdout/stderr metadata without serializing raw command-output bodies.
- [x] Record post-state with bounded `git status --short --branch` observation.
- [x] Remove runtime receipt fields that exist only to demonstrate implementation or process limits.

## 4. Tests And Validation

- [x] Update verify receipt tests for allowed execution, check-blocked skip, graph-refusal skip, affected failure, bounded streams, cache observations, base source, selector state, target-plan consumption, and post-state observation.
- [x] Update command tests for `habitat verify --json` receipt construction and Oclif command wiring.
- [x] Run `bun run --cwd tools/habitat-harness check`.
- [x] Run `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts`.
- [x] Run `bun run habitat verify --help` after D0/help wording repair.
- [x] Run `bun run habitat verify --json` with expected D12 outcome recorded in the phase record.

## 5. Records And Closure

- [x] Repair D12 proposal/spec/design/workstream records so active authority reflects the implemented receipt contract.
- [x] Remove stale validation gates that point to removed historical test/helper machinery.
- [x] Update downstream realignment and packet index for the implemented D12 boundary.
- [x] Run OpenSpec validation and `git diff --check`.
- [x] Triage TODO/control artifacts before commit.
- [x] Commit and submit the D12 layer through Graphite with a clean worktree.
