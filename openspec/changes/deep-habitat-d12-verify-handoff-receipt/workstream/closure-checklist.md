# Closure Checklist: D12 Verify Handoff Receipt

## Source Implementation

- [x] Verify command remains a thin Oclif adapter.
- [x] Verify module exposes a `src/lib/verify/index.ts` barrel and package root exports.
- [x] Receipt schema and types are TypeBox-first.
- [x] Receipt assembly is split into focused modules under `src/lib/verify/`.
- [x] D7 check projection is consumed for selector state and affected-execution admission.
- [x] D3 target plan is consumed for affected target selection and graph-refusal state.
- [x] Affected execution distinguishes `executed`, `failed`, and `skipped`.
- [x] Affected argv includes D3 target order, resolved base, `--head HEAD`, and `--outputStyle=static`.
- [x] Raw stdout/stderr bodies are not serialized into receipts.
- [x] Post-state observation is bounded and explicit.
- [x] Runtime receipt shape contains no process-only fields.

## Validation

- [x] `bun run --cwd tools/habitat-harness check`
- [x] `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts`
- [x] Active Habitat source/tests terminology audit is clean for removed process-era receipt vocabulary.
- [x] `bun run habitat verify --help`
- [x] `bun run habitat verify --json`
- [x] `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`

## Record Closure

- [x] D0 matrix rows reflect current verify receipt JSON/help/export surfaces.
- [x] D12 proposal, design, and spec match the implemented receipt boundary.
- [x] D12 downstream realignment ledger names current D0/D1/D3/D7/D14 handoffs.
- [x] Packet index reflects D12 implementation state.
- [x] TODO/control artifacts are triaged before commit.
- [x] Graphite stack status is broad-checked before and after commit/submit.
- [x] Worktree is clean after Graphite submit.
