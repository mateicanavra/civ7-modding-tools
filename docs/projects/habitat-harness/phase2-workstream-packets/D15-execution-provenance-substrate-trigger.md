# D15 Execution Provenance Substrate Trigger

## Intent

Define the exact condition under which a packet may introduce a shared typed
command-observation substrate. D15 is not a default standalone migration to
Effect or any other process framework.

## Product Scenario

A packet needs command observation details such as cwd, argv, env subset, git
state, cache status, output bounds, or typed process failures and cannot model
those details with its own local DTOs without creating contradictory states.

## Domain Owner

Command Observation Trigger owner.

Forbidden owners:

- Individual packet owners may not introduce unbounded substrate migrations because
  command execution feels messy.
- D1 may define receipt/output-family language but may not force an Effect
  migration by default.

## Consumers

D6, D7, D9, D11, and G-HOST may request D15 only if their local DTOs/projections
cannot represent a concrete command-observation state without contradiction.

## Contract

D15 is a trigger protocol. A consuming packet must record:

- concrete scenario requiring shared command-observation state;
- current contradictory state;
- local DTO/projection alternative attempted and rejected;
- field-level ownership map for each required runtime command field;
- public output impact;
- validation class;
- rollback/escape plan;
- type-check and test performance risk.

## Dependency Order

Blocked by: D1 and a packet-specific need.

Unblocks: only the packet that triggered it. It does not reorder the whole suite.

Parallelism: none as a standalone implementation. Triggered work must stay
inside the consuming packet or become a separately reviewed OpenSpec slice only
after the consuming packet passes its local DTO sufficiency review.

## Current State-Space Problem

Habitat already has command/process-related code (`habitat-process.ts`,
`effect-runtime.ts`, `effect-parity.ts`, and Grit/apply command records), but an
unbounded substrate migration would add state before identifying which reachable
contradictory state it removes.

## Solution Design

1. Treat D15 as a decision checklist embedded in D6, D7, D9, D11, or G-HOST.
2. Require a local DTO sufficiency artifact that names the attempted
   discriminated union, typestate, or projection shape; the exact state it cannot
   represent; and the negative fixture or typed example that demonstrates the
   contradiction.
3. If triggered, design the bounded typed command-observation contract for the
   consuming packet's command family.
4. Preserve behavior and public types unless explicitly versioned.
5. Reject unbounded framework migration without measured state-space reduction
   and passing validation.

## TypeScript State-Space Reduction

A valid D15 activation must remove at least one contradictory state, such as:

- success result without cwd/argv command observation;
- cache status assumed when unobservable;
- output digest absent for write transaction validation;
- git state stale or untied to command execution;
- failure tag string not tied to command family.

The rejected default is "move all Habitat internals to Effect." Effect is valid
only when a consuming packet shows that a local DTO cannot model the required
command observation state and that Effect removes the named contradiction.

## Public Surface Impact

Should be internal unless receipt, diagnostic, transaction, hook, package export,
or handoff outputs expose command-observation fields. D0/D1 classify and version
any public fields, output-family handling, and non-claim language before source
implementation.

## Validation Classes

Required design validation:

- trigger scenario;
- current contradictory state;
- local DTO sufficiency artifact with the attempted local type shape, rejected
  local alternative, contradiction fixture, required command fields, and proposed
  shared discriminants;
- type-check/build risk analysis.

Later implementation validation if triggered:

- typed command result tests;
- failure injection tests;
- command behavior;
- performance/build sanity;
- parity tests if replacing existing execution path.

Non-claims:

- D15 does not authorize unbounded substrate migration.
- D15 does not improve product behavior by itself.
- D15 does not replace D1 output-family or receipt language.

## Review Lanes

- TypeScript overengineering review.
- Operations command review.
- Public API impact review.
- Performance/build review.

## Downstream Realignment

Update only the consuming packet's decision row unless D15 becomes a standalone
OpenSpec change. If it becomes standalone, update the packet suite index with
the exact trigger and dependency impact.

## Validation Commands / Trigger Check Template

- `bun run --cwd tools/habitat-harness test -- test/lib/habitat-process.test.ts test/lib/effect-parity.test.ts`:
  expected exit 0 only if a later accepted packet changes command-result or
  execution-runtime behavior.
- `git status --short --branch`: expected exit 0; command-observation capture must not
  create hidden output files.
- `bun run habitat check --tool grit-check --json`: expected status follows D6;
  when used as a D15 trigger, record argv, cwd, env subset, duration,
  stdout/stderr bounds, cache/freshness, and git state.
- `bun run habitat check --json`: expected status follows D7; when used as a
  D15 trigger, record delegated command observations for each rule/tool segment.
- `bun run habitat fix --dry-run --json`: expected status follows D9; when used
  as a D15 trigger, record isolated-copy path, approved write roots, formatter
  handoff, and git state.
- `bun run habitat hook pre-commit --dry-run`: expected status follows D11; when
  used as a D15 trigger, record staged paths, Graphite base, and local-only
  non-claim.
- Consuming-packet note: D6, D7, D9, D11, and G-HOST still own whether these
  commands are required for their closure; D15 only defines the substrate
  trigger record shape when one of those exact commands exposes
  unrepresentable command observation state.
- Cache stance: process/command-observation tests run fresh; delegated command cache use
  must be captured rather than hidden.
- If a later accepted packet changes D15 to `trigger-accepted`, include one
  missing binary, one nonzero command, and one oversized output case; all must
  preserve typed failure state.
- Non-claim: D15 does not authorize unbounded Effect/substrate migration unless a
  consuming packet passes the local DTO sufficiency review.

## Graphite/OpenSpec Closure

No standalone source commit by default. If triggered into an implementation
slice, it must be one focused Graphite layer with OpenSpec only when public
command-observation behavior changes.

## Stop Conditions

Stop if:

- the packet cannot name a contradictory state removed by typed command
  observation;
- the proposal is framework migration language rather than product command-observation need;
- type-check performance or readability risk is unmeasured;
- public command-observation fields change without D0/D1 compatibility.
