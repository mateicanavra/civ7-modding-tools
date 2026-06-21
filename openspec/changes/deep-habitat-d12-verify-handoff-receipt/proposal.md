# Proposal: D12 Verify Handoff Receipt

## Summary

D12 implements `habitat verify` as a bounded local handoff receipt. The command
first consumes Habitat check state, then consumes the workspace graph's verify
target plan, then runs affected Nx targets only when those upstream states admit
execution. JSON mode emits a TypeBox-validated `VerifyReceipt`.

The receipt is a repo-local structural-tooling artifact. It records local verify
observations only: check consumption, target planning, affected execution, base
selection, bounded output metadata, and post-state.

## Product Scenario

An agent is preparing work for review and runs `habitat verify --json`. The
reviewer needs one compact record answering:

- which check summary was consumed;
- which base was selected and why;
- which affected targets were planned;
- whether affected targets ran, failed, or were skipped;
- what bounded command-output metadata is available;
- what post-state command observation was available.

Skipped affected execution is a first-class state. A failed check, refused graph
target plan, or failed affected command must be visible in the receipt state
instead of being hidden in missing fields or generic success output.

## Authority

- D0 public-surface compatibility matrix for command JSON, help text, human
  output, and package exports.
- D1 receipt/output boundary for TypeBox-first DTO validation and bounded output
  metadata.
- D3 workspace graph boundary for verify target planning and graph refusal.
- D7 structural check/report boundary for verify check projection and affected
  execution admission.
- Oclif remains the command shell.
- TypeBox schemas are the source of truth for receipt DTOs and runtime
  validation.

## Implementation Scope

- Keep `tools/habitat-harness/src/commands/verify.ts` as a thin Oclif adapter.
- Implement focused verify modules under `tools/habitat-harness/src/lib/verify/`.
- Expose the verify module through `tools/habitat-harness/src/lib/verify/index.ts`
  and the package root barrel.
- Emit a closed `VerifyReceipt` with `succeeded`, `failed`, `blocked`, and `planned`
  outcomes.
- Emit `nxAffected.kind` as `executed`, `failed`, or `skipped`.
- Build affected argv from D3 targets, resolved base, `--head HEAD`, and
  `--outputStyle=static`.
- Serialize bounded stdout/stderr metadata, not raw command-output bodies.
- Record post-state through bounded `git status --short --branch` observation.
- Keep root `bun run verify` distinct from diagnostic `habitat verify`.

## Out Of Scope

- Changing root `bun run verify`.
- Modeling CI, PR readiness, reviewer approval, product/runtime behavior, apply
  safety, OpenSpec acceptance, or Graphite readiness in the receipt.
- Modeling migration/process fields in runtime DTOs.
- Reintroducing removed process-only helper surfaces.
- Treating D11 hook/local-feedback pass as verify completion.

## Validation Gates

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts`
- `bun run habitat verify --help`
- `bun run habitat verify --json`
- `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict`
- `bun run openspec:validate`
- `git diff --check`
