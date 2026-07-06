# Run In Game Runtime OpenSpec Packet Workstream Process

Status: active planning process

Branch: `agent-codex-mapgen-studio-runtime-openspec-packets`

Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-mapgen-studio-runtime-openspec-packets`

Source proposal:
`docs/projects/mapgen-studio/resources/run-in-game-deploy-manifest-proposal.md`

## Objective

Turn the Run in Game runtime and deployment model proposal into executable
OpenSpec workstream packets. Each packet must be a complete domino: a coherent
implementation change that leaves the system working, removes ambiguity, and
can be executed by a fresh team with only the packet as guidance. If this
packet branch has not merged into `main`, execution starts from the worktree
holding the packet branch and builds on top of that stack; after merge,
execution may start from a fresh `main` worktree.

## Process Principle

The workstream advances by forward-locking stages. Each stage produces a durable
artifact that the next stage consumes. Earlier uncertainty is resolved before it
can become packet text. Packet text must not carry conditional design branches,
compatibility paths, shims, fallbacks, or unresolved "decide later" language.

Tests are strictly for behavior: product behavior, API behavior, runtime
behavior, and code behavior. Structural and topological requirements are not
tested by searching for deleted names or legacy keys. They are enforced through
Habitat/Grit authority rules and positive structural assertions that state the
required shape directly.

Live verification is mandatory. The packet train cannot be closed-passed until
all declared behavior tests are green, actual Studio endpoints have been
exercised through live API calls, and Civilization 7 has loaded the generated
content for the live variant matrix. Civ7 being unavailable is a blocker to
resolve, not an acceptable skip or alternate closure state.

Permanent structural constraints must be phrased as positive assertions: the
system has this owner, this entrypoint, this schema closure, this dependency
edge, this write root, or this artifact topology. Temporary migration
constraints belong in candidate or packet-local Grit patterns with an explicit
promotion/removal decision. `optional` is allowed only for intentionally
supported capability variants, never as a catch-all for unmanaged runtime state.

## Stage 0: Workspace And Authority Grounding

Purpose: make the planning surface clean and recoverable.

Inputs:

- current user direction;
- root `AGENTS.md`;
- `civ7-open-spec-workstream`;
- `habitat:systematic-workstream`;
- `civ7-product-authority`;
- `civ7-architecture-authority`;
- OpenSpec source map, phase loop, artifact contracts, team and review lanes;
- the copied proposal document.

Outputs:

- this process record;
- clean planning worktree state except intentional planning artifacts;
- authority and evidence classification notes in subsequent packet records.

Completion criteria:

- planning work happens only in the new worktree;
- copied proposal is present;
- repo tooling is available;
- current runner worktree patches remain untouched.

## Stage 1: Advisor Wave - Scope And Decomposition

Purpose: decide how the migration should be broken down and sequenced before
any packet is drafted.

Advisor lenses:

- contract and identity boundaries;
- operation lifecycle and ownership;
- generation, deployment, and artifact boundaries;
- diagnostics, attribution, and public status;
- testing strategy and verification rails.

Advisor prompts must include:

- source proposal path;
- authority order;
- hard core: collapse state space, do not preserve legacy behavior;
- explicit no-shim/no-fallback/no-dual-path/no-compatibility-lane instruction;
- output contract: proposed packets, sequence, write sets, risks, and design
  questions that must be resolved before packet drafting.

Stage output:

- advisor reports;
- synthesized decomposition and domino order;
- resolved design-question ledger for any turbulence found during
  decomposition.

Completion criteria:

- every advisor report has been read and synthesized;
- decomposition is expressed as packet candidates with objectives, dependencies,
  write sets, and verification shapes;
- no packet candidate contains an unresolved design branch.

## Stage 2: Packet Draft Loop

Purpose: produce one executable OpenSpec workstream packet at a time.

For each packet:

1. Re-open the source proposal and synthesized decomposition row for the packet.
2. Inspect the relevant current code, tests, and existing OpenSpec changes.
3. Resolve design questions inline before drafting packet text.
4. Draft OpenSpec artifacts under `openspec/changes/<change-id>/`.
5. Include `proposal.md`, `design.md`, `tasks.md`, relevant spec deltas, and a
   `workstream/phase-record.md` when the packet needs continuity state.
6. Run a fresh per-packet review wave.
7. Disposition findings and patch the packet before moving to the next packet.

Every packet must define:

- system context;
- before and after contracts;
- boundary enforcement;
- behavior-first required and prohibited behaviors;
- behavior tests and verification gates before implementation detail;
- any packet-specific live Studio endpoint checks when the packet changes an API
  endpoint, status projection, cancellation command, or Run in Game workflow;
- verification evidence under the packet workstream directory, with one
  auditable row for each declared gate;
- dedicated review lanes for TypeScript refactoring, code quality/structure,
  and oRPC/Effect/library correctness;
- structural enforcement as Habitat/Grit rules or positive topology assertions,
  not as behavioral tests for deleted strings;
- deterministic tasks;
- downstream realignment;
- closure criteria.

Completion criteria for each packet:

- OpenSpec validation passes for the packet;
- accepted P1/P2 review findings are repaired;
- packet contains no shortcut language except in explicit forbidden-behavior
  sections;
- packet can be executed from the packet-stack worktree, or from `main` after
  the packet branch merges, without chat context.

## Stage 2a: Design Question Resolution

Purpose: prevent hidden ambiguity from becoming a packet.

When a question appears:

1. State it as a concrete inquiry question.
2. Assign a fresh agent or local investigation to resolve it.
3. Record the answer in the packet or workstream record.
4. Continue only after the packet has one deterministic instruction.

Questions are not allowed to become:

- optional tasks;
- deferred implementation notes;
- compatibility paths;
- "support both" language;
- future cleanup promises.

## Stage 2b: Per-Packet Review

Purpose: keep quality from decaying as packets accumulate.

Review lanes:

- authority review;
- architecture review;
- OpenSpec readiness review;
- behavior-testing and evidence review;
- Habitat/Grit structural-enforcement review;
- structural simplicity review.
- TypeScript refactoring review anchored to `typescript-refactoring`;
- code quality/structure review anchored to `dev:review-code-quality`;
- library correctness review anchored to `dev:orpc`, current official oRPC
  docs, current official Effect docs, and packet-relevant library docs.

Reviewers must be adversarial and context-anchored. Their job is to find hidden
state, wrong-owner preservation, weak behavior tests, misplaced structural
assertions, shortcut language, and packet text that would force a fresh
implementer to guess. The TypeScript, code quality, and library-correctness
reviewers also check JSDoc and anchor-comment quality: cornerstone runtime code,
public ports, exported functions, and non-obvious parameters should explain the
what and why where the code is not self-evident, without narrating how each line
works.

Completion criteria:

- findings are severity-labeled;
- each material finding has a disposition;
- accepted blockers are repaired before the next packet begins.

## Stage 3: Cross-Packet Cohesion Review

Purpose: prove the packet set composes into a complete migration rather than a
pile of individually plausible changes.

Checks:

- every target concept from the proposal is introduced, enforced, or explicitly
  deleted as unnecessary;
- no old runtime path survives as a sanctioned alternative;
- packet dependencies form a clean forward sequence;
- public status and diagnostics boundaries remain consistent across packets;
- verification gates cover unit, integration, API, and runtime launch claims at
  the correct evidence level;
- final live verification covers multiple endpoint/in-game variants, not a
  single happy path.

Completion criteria:

- fresh review wave approves the full sequence or findings are repaired;
- no packet conflicts with another packet's before/after contract;
- downstream realignment across docs, tests, scripts, and OpenSpec specs is
  complete.

## Stage 4: Closure And Handoff

Purpose: leave the packet set ready for execution by another team.

Outputs:

- final packet index;
- per-packet OpenSpec artifacts;
- review disposition records;
- downstream realignment notes;
- exact execution order;
- stop conditions;
- remaining excluded work, only if it is outside the proposal scope and not a
  hidden design dependency.

Completion criteria:

- `bun run openspec:validate` passes;
- all declared behavior tests pass;
- the live Studio endpoint and Civilization 7 verification matrix passes;
- `git diff --check` passes;
- worktree state is recorded;
- no stale agents remain open;
- the branch contains only intentional planning artifacts.
