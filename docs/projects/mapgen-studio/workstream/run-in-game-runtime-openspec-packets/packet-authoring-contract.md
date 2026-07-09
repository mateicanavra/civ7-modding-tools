# Packet Authoring Contract

Status: active guidance for the Run in Game runtime packet train

This contract applies to every OpenSpec packet produced by this workstream.

## Behavior Verification

Behavior tests cover observable product and code behavior only:

- public API accepts and rejects the right inputs;
- public status and error projections expose the right safe shape;
- operation phases, cancellation, terminalization, diagnostics lookup, and
  runtime launch outcomes behave correctly;
- generated artifacts, deployment copies, runtime observations, and attribution
  records contain the expected runtime data;
- live verification demonstrates the user-facing Run in Game flow against
  actual Studio endpoints and Civilization 7.

Do not add behavior tests whose purpose is to search for deleted names, legacy
keys, former env vars, old file paths, retired entrypoints, or old topology.

Behavioral unit tests and focused behavior tests are necessary but never
sufficient for initiative closure. The full packet train closes only after all
declared behavior tests are green, live Studio endpoint calls exercise the
actual server contract, and Civilization 7 loads the generated content in game.
Mocked direct-control readers, fixture generators, and unit tests are
packet-level evidence; they cannot replace the final live verification gate.

Every packet uses the same command-selection rule:

1. Run `bun run openspec -- validate <change-id> --strict`.
2. Run `bun habitat classify <diff-or-packet-write-set>`.
3. Run every Habitat/Nx/Biome/Grit command reported by classify.
4. Run packet-specific behavior tests named in the packet.
5. Run and record packet-specific live endpoint checks whenever the packet changes a
   public Studio endpoint, operation status projection, cancellation command,
   or Run in Game server workflow.
6. Record commands, results, and what each result proves in
   `openspec/changes/<change-id>/workstream/verification-evidence.md`. A skipped
   declared gate leaves the packet incomplete.
7. For the final closure packet, also run `bun run openspec:validate` and the
   full live Run in Game verification matrix from `target-vocabulary.md`.

Civilization 7 availability is a prerequisite for closed-passed status, not an
acceptable skip condition. If the live environment is unavailable, the
initiative remains blocked and open until the environment is restored and the
live matrix passes.

A live Studio endpoint check means starting the Studio server from the
implementation worktree and issuing real requests through the running Studio
daemon's public `/rpc` oRPC mount. Handler-direct calls, mocked transports,
fixture-only servers, and unit or integration tests that bypass the running
endpoint do not satisfy this gate. Evidence records the server start command
and URL, oRPC operation, request payload shape, request id when admitted,
timestamps, redacted response/status payloads, terminal status when applicable,
command output, and the oracle each result satisfies.
Endpoint and UI runs use the same stable `mapgen-studio:serve-daemon` target.
That target must run the Studio daemon with the dev-only `bun-source` condition
and without Bun watch. Run in Game materialization intentionally writes
generated content inside the repo, and those writes must not restart the process
that owns the active operation registry.

Declared verification gates include every item listed under a packet's
`Verification Gates`, every command returned by `bun habitat classify`, every
packet-specific behavior test named in `tasks.md` or `proposal.md`, every live
endpoint or Civ7 check required by this contract and `target-vocabulary.md`,
and every dedicated reviewer lane required below.

Each packet's `verification-evidence.md` uses one row per gate with:

- gate id;
- required or conditionally-required classification;
- command, protocol, or reviewer prompt;
- environment and server/Civ7 preconditions;
- result or exit status;
- artifact path or captured evidence location;
- oracle;
- verdict.

The initiative has only two closure states: closed-passed or not closed. If
Civ7, the Studio endpoint runtime, a declared verification gate, or a required
review lane is unavailable or failing, the packet train is blocked and remains
open. A handoff may record the blocker and re-entry protocol, but it is not
closure and must not be labeled green, accepted, or complete.

## Required Review Lanes

Every changeset gets dedicated reviewers anchored to the relevant skill or
source corpus before it closes:

- TypeScript refactoring reviewer: reads `typescript-refactoring` and reviews
  reachable state, type-level modeling, escape hatches, public type drift,
  behavior-preserving simplification, and compiler-enforced invariants.
- Code quality / structure reviewer: reads `dev:review-code-quality` and
  reviews TypeScript design patterns, architecture shape, ownership, file/module
  cohesion, abstraction quality, wrong-owner preservation, and complexity that
  should be deleted rather than moved.
- Library correctness reviewer: reads `dev:orpc`, current official oRPC docs,
  current official Effect docs, and any packet-relevant library docs for
  oRPC/Effect/direct-control/TypeBox boundaries. This reviewer checks API
  contract correctness, Effect runtime/finalizer/resource practice, transport
  semantics, error/data leakage, and cleanup of library cruft or stale adapter
  patterns.

All three reviewers also inspect documentation quality inside code. They verify
that exported functions, non-obvious parameters, public ports, and cornerstone
runtime pieces have useful JSDoc where it clarifies the what and the why. Anchor
comments are expected for load-bearing runtime structures whose role is not
immediately self-evident. Comments that narrate the next line or preserve
implementation trivia fail this review lane.

## Structural Enforcement

Structural and topological requirements are enforced with Habitat/Grit authority
rules or existing Habitat boundary mechanisms. Packets phrase permanent
structure as positive assertions:

- the public Run in Game contract has this exact closed schema owner and shape;
- launch source resolution has this owner and these input/output contracts;
- request generation has exactly one manifest input;
- request artifacts write under exactly one request workspace root;
- catalog generation reads exactly one catalog source index;
- deployment copies from this generated mod root to this deployed mod identity;
- diagnostics and attribution are available only through explicit lookup
  records.

The rule should assert the desired shape directly. Avoid encoding permanence as
"old string X is absent" unless the rule is a temporary transition pattern.

## Grit Pattern Work

When a packet requires a Grit rule, it must specify:

- lifecycle: candidate, registered advisory, registered enforced, or removed;
- owner surface and scan roots;
- positive assertion;
- fixture strategy: positive examples, negative examples, parser edge cases,
  and false-positive controls;
- current-tree scan result: zero findings, accepted baseline, or blocker;
- baseline/introduction contract;
- hook-scope decision;
- promotion or removal condition.

Temporary rules exist only to control a transition hazard. Permanent rules
encode the target topology and become part of the architecture.

## Optionality

`optional` means an intentionally supported product or code capability with a
declared contract. It never means ad hoc data, unmanaged records, raw catch-all
fields, or best-effort topology.

If a concept does not deserve first-class support in this packet train, exclude
it and state the supported contract without an optional hole.
