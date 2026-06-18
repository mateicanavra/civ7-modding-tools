# D12 Proof/Handoff Verify Command

## Intent

Refactor `habitat verify` into a handoff proof assembler that runs Habitat
check, conditionally runs affected Nx proof, records post-state, and states
non-claims without owning check or graph internals.

## Product Scenario

A DRA owner needs a bounded, current command proof for handoff. If Habitat check
fails, affected Nx proof is skipped with reason. If check passes, affected proof
runs against the correct base and records cache/stream/post-state evidence.

## Domain Owner

Proof Contract owner with Workspace Graph Integration as graph dependency.

Forbidden owners:

- Verify does not own structural diagnostics.
- Verify does not own Nx graph construction.
- Verify does not own Graphite submit/PR state.

## Consumers

DRA owners, reviewers, handoff packets, agents before final response, project
records.

## Contract

`habitat verify` emits `VerifyProof` with:

- proof class;
- Habitat check summary;
- selected base;
- affected target plan/result/skipped reason;
- bounded stdout/stderr streams;
- cache state by task where observable;
- git/resource post-state;
- non-claims.

## Dependency Order

Blocked by: D1, D3, and D7.

Unblocks: D14 and Phase 3 closure model.

Parallelism: can design before D7 implementation if CheckReport contract is
stable, but cannot close before D7.

## Current State-Space Problem

`createVerifyProof` combines check summary, affected Nx states, stream bounding,
cache parsing, git/resource state, and non-claims. `VerifyProof.habitatCheck.requestedSelectors`
currently emits `{}` because verify has no selector flags.

## Solution Design

1. Consume `CheckReport` constructor output from D7.
2. Consume graph/target facts from D3.
3. Make requested selector state explicit: none, inherited, unsupported, or
   requested.
4. Keep affected Nx states as executed/skipped/failed with required reasons.
5. Record Graphite state as a separate non-claim field if included at all.

## TypeScript State-Space Reduction

Replace `{}` selector placeholders and optional affected fields with explicit
variants. Prevent affected proof from executing when check failed unless a
future public contract intentionally supports forced mode.

The rejected alternative is to keep `VerifyProof` as a broad output bag and fix
individual fields.

## Public Surface Impact

Likely affects `VerifyProof` JSON. D0/D1 must version or preserve stable fields.
Human output must keep non-claims visible.

## Proof Classes

Required design proof:

- current verify proof field inventory;
- affected command behavior;
- check-failure skip scenario.

Later implementation proof:

- verify proof schema tests;
- check-failure skip tests;
- affected-executed tests;
- stream bounding tests;
- cache parsing tests;
- command behavior for `habitat verify --json`.

Non-claims:

- verify is not CI.
- verify is not runtime/product proof.
- verify is not Graphite submit/PR proof.
- verify does not prove apply safety.

## Review Lanes

- Proof/handoff review.
- Graph consumer review.
- API/JSON compatibility review.
- Operations stream-boundary review.

## Downstream Realignment

Update:

- verification contract;
- handoff templates;
- validation stop conditions;
- docs that compare root `bun run verify` and `habitat verify`.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/lib/proof-artifact.test.ts`:
  expected exit 0; verify proof schema and artifact proof.
- `bun run habitat verify --json`: expected exit 0 only after D7 current-tree
  proof and D3 graph metadata are stable.
- `git status --short --branch`: expected exit 0; verify must not mutate the
  worktree except explicit proof-output paths.
- Cache stance: verify must record each delegated command and whether it was
  cached, fresh, skipped, or explicitly non-claimed.
- Injected bad case: include one failing delegated command and prove verify
  emits a failing proof with bounded stdout/stderr.
- Non-claim: verify assembles handoff proof; it does not make local hooks or CI
  redundant.

## Graphite/OpenSpec Closure

Use OpenSpec for any verify schema or command behavior change. Commit after D7
and D3 are stable.

## Stop Conditions

Stop if:

- affected targets run after failed check without explicit contract;
- `{}` or absent fields hide unsupported selector state;
- Graphite state is reported as behavior proof;
- verify output omits non-claims.
