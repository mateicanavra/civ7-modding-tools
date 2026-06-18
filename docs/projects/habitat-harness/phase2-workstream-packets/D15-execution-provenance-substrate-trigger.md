# D15 Execution Provenance Substrate Trigger

## Intent

Define the narrow condition under which a packet may introduce a typed execution
provenance substrate. D15 is not a default standalone migration to Effect or any
other process framework.

## Product Scenario

A packet needs to prove command provenance, cwd/env/git state/cache policy/output
digests, or typed process failures and cannot do so with the local DTOs in that
packet without creating contradictory states.

## Domain Owner

Process/proof substrate owner.

Forbidden owners:

- Individual packet owners may not introduce broad substrate migrations because
  command execution feels messy.
- Proof Contract may define labels but not force an Effect migration by default.

## Consumers

Primarily D6, D9, and optionally D7/D11 if their command provenance states cannot
be represented locally.

## Contract

D15 is a trigger protocol. A consuming packet must record:

- concrete scenario requiring typed provenance;
- current contradictory state;
- local DTO alternative rejected;
- runtime command fields required;
- public output impact;
- proof class;
- rollback/escape plan;
- type-check and test performance risk.

## Dependency Order

Blocked by: D1 and a packet-specific need.

Unblocks: only the packet that triggered it. It does not reorder the whole suite.

Parallelism: none as a standalone implementation. Triggered work must stay
inside the consuming packet or become a separately reviewed OpenSpec slice only
after packet-minimization passes.

## Current State-Space Problem

Habitat already has command/process-related code (`habitat-process.ts`,
`effect-runtime.ts`, `effect-parity.ts`, Grit/apply proof fields), but a broad
substrate migration would add state before proving which state it removes.

## Solution Design

1. Treat D15 as a decision checklist embedded in D6, D7, D9, or D11.
2. Require proof that local discriminated DTOs are insufficient.
3. If triggered, design the smallest typed provenance layer for the consuming
   packet's command family.
4. Preserve behavior and public types unless explicitly versioned.
5. Reject broad framework migration without measured state-space reduction and
   green proof.

## TypeScript State-Space Reduction

A valid D15 activation must remove at least one contradictory state, such as:

- success result without cwd/argv provenance;
- cache status assumed when unobservable;
- output digest absent for write proof;
- git state stale or untied to command execution;
- failure tag string not tied to command family.

The rejected default is "move all Habitat internals to Effect." Effect is only
valid when it is the smallest way to model the needed provenance.

## Public Surface Impact

Should be internal unless proof DTOs expose provenance fields. D0/D1 classify
and version any public proof fields.

## Proof Classes

Required design proof:

- trigger scenario;
- current contradictory state;
- local alternative rejected;
- type-check/build risk analysis.

Later implementation proof if triggered:

- typed command result tests;
- failure injection tests;
- command behavior;
- performance/build sanity;
- parity tests if replacing existing execution path.

Non-claims:

- D15 does not authorize broad substrate migration.
- D15 does not improve product behavior by itself.
- D15 does not replace proof-class labels.

## Review Lanes

- TypeScript overengineering review.
- Operations proof review.
- Public API impact review.
- Performance/build review.

## Downstream Realignment

Update only the consuming packet's decision row unless D15 becomes a standalone
OpenSpec change. If it becomes standalone, update the packet suite index with
the exact trigger and dependency impact.

## Validation Commands / Proof Template

- `bun run --cwd tools/habitat-harness test -- test/lib/habitat-process.test.ts test/lib/effect-parity.test.ts`:
  expected exit 0; typed command-result and substrate parity proof.
- `git status --short --branch`: expected exit 0; provenance capture must not
  create hidden output files.
- `bun run habitat check --tool grit-check --json`: expected status follows D6;
  when used as a D15 trigger, record argv, cwd, env subset, duration,
  stdout/stderr bounds, cache/freshness, and git state.
- `bun run habitat check --json`: expected status follows D7; when used as a
  D15 trigger, record delegated command provenance for each rule/tool segment.
- `bun run habitat fix --dry-run --json`: expected status follows D9; when used
  as a D15 trigger, record isolated-copy path, approved write roots, formatter
  handoff, and git state.
- `bun run habitat hook pre-commit --dry-run`: expected status follows D11; when
  used as a D15 trigger, record staged paths, Graphite base, and local-only
  non-claim.
- Consuming-packet note: D6, D7, D9, and D11 still own whether these commands
  are required for their closure; D15 only defines the substrate trigger
  evidence shape when one of those exact commands exposes untyped provenance.
- Cache stance: process/provenance tests run fresh; delegated command cache use
  must be captured rather than hidden.
- Injected bad case: include one missing binary, one nonzero command, and one
  oversized output case; all must preserve typed failure state.
- Non-claim: D15 does not authorize broad Effect/substrate migration unless a
  consuming packet passes minimization.

## Graphite/OpenSpec Closure

No standalone commit by default. If triggered into an implementation slice, it
must be one focused Graphite layer with OpenSpec only when public proof behavior
changes.

## Stop Conditions

Stop if:

- the packet cannot name a contradictory state removed by typed provenance;
- the proposal is framework migration language rather than product proof need;
- type-check performance or readability risk is unmeasured;
- public proof fields change without D0/D1 compatibility.
