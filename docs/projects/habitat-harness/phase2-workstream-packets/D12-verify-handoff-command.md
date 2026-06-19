# D12 Verify Handoff Command

## Intent

Refactor `habitat verify` into a bounded handoff receipt command. The command
runs Habitat check first, asks the workspace graph for the verify target plan,
runs affected Nx targets only when those upstream states allow execution, and
records post-state using bounded command-output metadata.

## Product Scenario

An agent needs a compact local verify record before handing work to a reviewer.
If Habitat check fails, affected Nx execution is skipped with a reason. If the
workspace graph refuses target planning, affected execution is skipped with that
graph refusal. If affected execution runs and fails, the receipt records the
failed state and bounded stream metadata.

## Domain Owner

Verify receipt owner with Workspace Graph and Structural Check dependencies.

Forbidden owners:

- Verify does not own structural diagnostics.
- Verify does not own Nx graph construction.
- Verify does not own Graphite submit or PR state.

## Consumers

Reviewers, agents handing work off, command JSON consumers, and downstream
packets that need verify examples.

## Contract

`habitat verify --json` emits `VerifyReceipt` with:

- command invocation metadata;
- Habitat check summary consumed through the D7 projection;
- selected base and base source;
- D3 target plan state;
- affected target result or skipped reason;
- bounded stdout/stderr metadata;
- cache state by task where observable;
- git post-state observation.

## Dependency Order

Blocked by: D1, D3, and D7.

Unblocks: D14 examples and later command-facing handoff work.

Parallelism: D12 can design before D7 implementation if the CheckReport
contract is stable, but cannot close before D7 supplies the check projection
that controls affected-execution admission.

## Current State-Space Problem

The old verify helper combined check summary, affected Nx states, stream
bounding, cache parsing, git/resource state, and process-era runtime fields
fields. Selector state also used placeholder objects instead of an explicit
domain state.

## Solution Design

1. Consume CheckReport output through the D7 projection.
2. Consume graph/target facts through D3.
3. Make selector state explicit: none, requested, or unsupported.
4. Keep affected Nx states as executed, skipped, or failed with required
   reasons.
5. Keep the runtime DTO focused on local verify receipt behavior.

## TypeScript State-Space Reduction

Replace placeholder selector objects and optional affected fields with explicit
variants. Prevent affected execution after failed check unless a future public
contract intentionally supports a forced mode.

The rejected alternative is to keep a broad output bag and patch individual
fields independently.

## Public Surface Impact

Affects `VerifyReceipt` command JSON, `habitat verify --json`, and package
exports for verify receipt schemas/helpers. D0/D1 must version or preserve
stable fields.

## Review Lanes

- Verify receipt review.
- Graph consumer review.
- API/JSON compatibility review.
- Operations stream-boundary review.

## Downstream Realignment

Update:

- verify receipt contract;
- handoff examples;
- validation stop conditions;
- docs that compare root `bun run verify` and diagnostic `habitat verify`.

## Validation Commands

- `bun run --cwd tools/habitat-harness test -- test/lib/verify-receipt.test.ts test/commands/habitat-commands.test.ts`
- `bun run habitat verify --json`
- `git status --short --branch`

Expected behavior:

- `habitat verify --json` emits a valid receipt for succeeded, failed, or
  blocked local verify states.
- Verify does not mutate the worktree.
- Delegated command output is bounded in the receipt instead of serialized as
  raw stdout/stderr bodies.

## Graphite/OpenSpec Closure

Use OpenSpec for verify schema or command behavior changes. Commit after D7 and
D3 source surfaces are live.

## Stop Conditions

Stop if:

- affected targets run after failed check without explicit contract;
- placeholder or absent fields hide unsupported selector state;
- Graphite state is modeled as verify behavior;
- verify output omits blocked/skipped/failed local states.
