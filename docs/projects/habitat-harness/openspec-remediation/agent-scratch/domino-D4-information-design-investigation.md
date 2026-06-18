# D4 Information Design Investigation

## Supervisor Vocabulary Correction

D3 owns this state family as `GraphRefusal` / `graph-refusal`. Any earlier scratch wording inherited from the source packet that used a D4-owned graph state name is superseded by the active D4 packet language: D4 consumes and renders D3 graph refusals, with D3-owned reason categories for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, and unresolved alias dependency.

## Reviewer Frame

This review treats D4 as an execution-authority packet, not a status report or
scaffold. The intended reader is a future implementation agent who needs to
implement `habitat classify` orientation behavior without reopening product,
domain, public-surface, or validation decisions.

Primary artifact paths should be resolved through `$REMEDIATION_DIR/context.md`:

- Source packet: `$PHASE2_PACKET_DIR/D4-orientation-and-routing.md`.
- OpenSpec change root: `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing`.
- Prior per-domino review: `$AGENT_SCRATCH/domino-D4-review.md`.

## Verdict

D4 is not yet readable as an execution authority. The current OpenSpec packet
has the right file set, but its information architecture hides the actual D4
decision in source-packet prose and review findings while the normative spec,
tasks, and ledgers remain broad scaffold language. An implementation agent would
still need to choose the classification state model, public JSON compatibility
strategy, validation oracles, and downstream D14 example contract.

The information-design repair is not to add more prose everywhere. The repair
is to move each decision into the artifact that owns it, then make the packet
skimmable by state, surface, and gate.

## Where Decisions Are Hidden

### State model is outside the normative path

The source D4 packet requires explicit variants for workspace path, project
path, diff with classified paths, malformed/pathless diff, unresolved owner, and
graph refusal. The OpenSpec spec currently has only "supported path" and
"unsupported path" scenarios. That collapses six product states into two vague
examples and leaves implementers to infer whether D4 wants a discriminated union,
an optional-heavy DTO with better prose, or a complete refusal-state contract.

Repair requirement: the explicit state model belongs in both `design.md` and
`specs/habitat-harness/spec.md`. `design.md` should explain the state taxonomy,
field ownership, allowed D2/D3 inputs, and compatibility stance. The spec should
make every state a normative scenario with required and forbidden output
properties.

### Public compatibility is named as a dependency, not recorded as a decision

`proposal.md` says classify/orientation JSON and human guidance may change only
through D0 compatibility decisions, and `tasks.md` asks the executor to confirm
D0 records later. That is not enough for D4 because the core work is a public
DTO/state-space change. The packet must not be accepted while the D0
compatibility row is still a future lookup.

Repair requirement: `design.md` needs a public-surface compatibility table that
records the D0 disposition required before source edits. If the D0 row does not
exist yet, D4 should say "blocked until recorded" explicitly and the review
ledger should carry that blocker.

### Validation gates can pass while known ambiguity remains

The current validation gates prove only command exit status for two sampled
paths, OpenSpec shape, and diff hygiene. They do not falsify malformed/pathless
diff handling, graph-refusal behavior, unavailable target reporting, multi-path
diff ordering, workspace fallback, unresolved owner, or exact JSON/human output.

Repair requirement: validation must be organized by D4 state, not by generic
command category. Each required state needs a test or command oracle that would
fail if the current optional-heavy ambiguity survived.

### Tasks are design prompts instead of implementation steps

The implementation section says to define contracts, separate routing facts, and
add refusal/recovery language. Those are outcomes, not executable work. They do
not name files, public exports, DTO names, command adapter behavior, test cases,
or docs/examples.

Repair requirement: `tasks.md` should become a linear implementation checklist
with bounded file areas and behavior-specific steps. It should not ask the
executor to discover the write set as part of implementation readiness.

### Ledgers preserve "pending" state without naming the blocking decision

The review ledger says per-domino review remains blocking, but it does not yet
record the concrete D4 findings from `$AGENT_SCRATCH/domino-D4-review.md`.
The downstream ledger uses broad pending rows such as "Later domino packets"
instead of naming D14's dependency on D4 example states. The closure checklist
says tasks must be implementation steps, while the current tasks are not.

Repair requirement: ledgers should convert generic pending state into exact
blockers, dispositions, and downstream handoffs. A future reader should not need
the scratch review to know why D4 is blocked.

## Recommended Artifact Architecture

### `proposal.md`: decision brief and packet boundaries

Keep `proposal.md` compact. It should answer why D4 exists, what product
scenario it serves, what it changes, what it refuses to change, dependencies,
enabled downstream work, and hard stop conditions.

Required changes:

- Replace absolute path citations with `$REMEDIATION_DIR/context.md` variables.
- Replace "OpenSpec packet scaffold" language with "OpenSpec execution contract"
  only after the normative spec and ledgers are repaired. Until then, call the
  packet "draft, blocked by D4 review findings."
- Clarify "supported action" as graph-backed runnable target guidance,
  unavailable target reporting, recovery instructions, and non-claims. Do not
  leave it as a permission-shaped phrase.

Suggested wording:

```text
This change defines the `habitat classify` orientation result contract for path
and diff inputs. It turns D2 rule projections and D3 graph facts into command
guidance, refusal states, unavailable-target reporting, and non-claims. It does
not execute checks, prove rule correctness, or create enforcement behavior.
```

### `design.md`: decision tables and authority map

`design.md` should be the packet's reasoning and boundary authority. It should
contain the state taxonomy, field ownership, D0 compatibility decision, write
set/protected paths, and D2/D3 consumption rules.

Required structure:

- "Orientation State Taxonomy" table with one row per state.
- "Field Ownership" table separating D4-owned fields from D2 projections and D3
  graph facts.
- "Public Surface Compatibility" table for command JSON, human output,
  `Classification`, `DiffClassification`, and package exports.
- "Write Set And Protected Paths" table.
- "Rejected Alternatives" section that rejects optional-heavy DTO extension and
  shallow `kind?: string` tagging.

Suggested state table columns:

```text
State | When selected | Required fields | Forbidden fields | D2/D3 inputs allowed | Non-claims | Validation oracle
```

Suggested ownership wording:

```text
D4 owns the top-level orientation state, command-facing result shape, recovery
guidance, unavailable-target presentation, and classify non-claims. D4 consumes
D2 rule-scope projections and D3 graph target facts but does not redefine either
source schema. D4 must not run targets or report enforcement outcomes.
```

### `specs/habitat-harness/spec.md`: normative state contract

The spec should be the primary implementation authority. It should not say
"supported path" when the real contract is a set of mutually exclusive
orientation states.

Required normative requirements:

- `habitat classify` output uses exactly one top-level orientation state.
- Project path state includes owner, project root, tags, scoped rule projections,
  graph-backed runnable targets, unavailable targets, recovery guidance where
  applicable, and classify non-claims.
- Workspace path state explains workspace-level ownership without inventing a
  project owner.
- Diff state contains classified path entries and preserves multi-path ordering
  or declares the deterministic ordering rule.
- Malformed/pathless diff state refuses ownership inference and includes no
  runnable target commands.
- Unresolved owner state separates "path exists but no owner fact" from
  unsupported input.
- Graph-error state contains bounded error class and recovery guidance, but no
  project-local target commands.

Suggested requirement heading:

```text
### Requirement: Classify Output Uses Mutually Exclusive Orientation States
```

Suggested scenario wording:

```text
#### Scenario: Malformed or pathless diff is refused
- **WHEN** the input is diff-like but contains no classified changed path
- **THEN** the result state is `malformed-or-pathless-diff`
- **AND** the result includes a stable refusal reason and recovery instruction
- **AND** the result includes no graph-backed runnable target commands
- **AND** the result states that classify did not infer ownership
```

### `tasks.md`: executable checklist

Tasks should follow the implementation order and name concrete behavior. The
future agent should not need to translate "define orientation contracts" into a
work plan.

Required task groups:

- Ground D0/D2/D3 prerequisites and record exact compatibility rows.
- Define or migrate the classify orientation DTO and public export handling.
- Update command adapter behavior for path, diff, malformed/pathless diff,
  unresolved owner, and graph-refusal states.
- Wire D2 rule projections and D3 graph target facts without redefining those
  domains.
- Add tests by state, including malformed/pathless diff refusal and graph-refusal
  fixture.
- Update docs/examples and hand off the D4 example corpus to D14.
- Run falsifying validation with exact output or snapshot expectations.

Suggested task wording:

```text
- [ ] Replace the optional-heavy classify result with a mutually exclusive
      orientation result covering project-path, workspace-path, diff,
      malformed-or-pathless-diff, unresolved-owner, and graph-refusal states.
- [ ] Add classify tests that fail when a newline-containing non-diff input is
      returned as a successful empty diff.
- [ ] Record the D0 compatibility disposition for `habitat classify` JSON,
      human output, `Classification`, `DiffClassification`, and public exports
      before changing source files.
```

### Workstream ledgers: state, findings, and downstream handoff

The ledgers should carry live execution control, not duplicate the proposal.

Required changes:

- `phase-record.md`: replace absolute worktree/source paths with
  `$ACTIVE_REMEDIATION_WORKTREE`, `$ACTIVE_REMEDIATION_BRANCH`,
  `$D4_SOURCE_PACKET`, and `$D4_CHANGE` after those D4 variables are added to
  `$REMEDIATION_DIR/context.md`.
- `review-disposition-ledger.md`: add rows for the prior P1/P2 D4 findings and
  mark them accepted/blocking or rejected with evidence. "Per-domino review
  pending" is no longer specific enough.
- `downstream-realignment-ledger.md`: split "Later domino packets" into a D14
  row requiring the D4 example corpus and a packet-index row for D4 status.
- `closure-checklist.md`: add checks for explicit state model, D0 compatibility
  row, falsifying validation, concrete write set/protected paths, and D14
  handoff.

## Path And Template Repairs

D4 packet artifacts currently repeat the active worktree path in `proposal.md`
and `phase-record.md`. Durable artifacts should instead cite
`$REMEDIATION_DIR/context.md` variables and templates.

First add D4 variables to `$REMEDIATION_DIR/context.md`:

```text
| `$D4_CHANGE` | `$OPENSPEC_CHANGES/deep-habitat-d4-orientation-routing`. |
| `$D4_SOURCE_PACKET` | `$PHASE2_PACKET_DIR/D4-orientation-and-routing.md`. |
| `$D4_NEGATIVE_REVIEW` | `$AGENT_SCRATCH/domino-D4-review.md`. |
| `$D4_INFO_DESIGN_REVIEW` | `$AGENT_SCRATCH/domino-D4-information-design-investigation.md`. |
| `$D4_REVIEW_LEDGER` | `$D4_CHANGE/workstream/review-disposition-ledger.md`. |
| `$D4_PHASE_RECORD` | `$D4_CHANGE/workstream/phase-record.md`. |
| `$D4_DOWNSTREAM_LEDGER` | `$D4_CHANGE/workstream/downstream-realignment-ledger.md`. |
| `$D4_CLOSURE_CHECKLIST` | `$D4_CHANGE/workstream/closure-checklist.md`. |
```

Then replace durable absolute paths:

- `proposal.md` authority bullets should cite `$REMEDIATION_DIR/context.md`,
  `$PHASE2_PACKET_DIR`, and `$D4_SOURCE_PACKET`.
- `phase-record.md` state bullets should cite `$ACTIVE_REMEDIATION_WORKTREE`,
  `$ACTIVE_REMEDIATION_BRANCH`, `$D4_SOURCE_PACKET`, and `$D4_CHANGE`.
- Review evidence rows should cite `$D4_NEGATIVE_REVIEW` rather than a full
  local path.

Absolute paths remain appropriate in agent prompts and tool calls. They should
not be copied into durable packet authority text.

## Stale Status And Review-Gate Ambiguity

The phrase "draft scaffold" is accurate for current state but harmful if it
survives after repairs because it frames D4 as a packetization exercise rather
than an implementation authority. The packet should use one of these statuses
consistently:

- `draft scaffold; per-domino review blocking` for the current unrepaired state.
- `accepted for design/specification; implementation blocked by prerequisites`
  only after accepted P1/P2 findings are repaired and ledgers prove it.
- `implementation-ready` only after D0 compatibility, D2/D3 prerequisite facts,
  state-model spec, tasks, and validation gates are complete.

Ambiguous phrases to remove or define:

- "supported actions": replace with graph-backed runnable targets,
  unavailable targets, recovery instructions, or non-claims.
- "next safe commands": replace with exact command guidance and the evidence
  basis for each command.
- "current metadata": replace with D2 rule projections and D3 graph facts.
- "unsupported surfaces": split into unsupported path, unresolved owner,
  malformed/pathless diff, and graph refusal where those are different states.
- "Confirm ... before implementation": replace with "record disposition in this
  packet before source edits."

## Acceptance Criteria For The Repair

D4 can be rereviewed as an execution authority when:

- The spec defines all six orientation states as mutually exclusive scenarios.
- `design.md` records state taxonomy, field ownership, public compatibility,
  write set, protected paths, and rejected alternatives.
- `tasks.md` is file/behavior/test/doc specific enough to execute without
  design invention.
- The review ledger dispositions the prior D4 P1/P2 findings with repair
  evidence.
- The downstream ledger names D14's dependency on the D4 example corpus.
- Validation gates include falsifying oracles for malformed/pathless diff,
  graph refusal, unresolved owner, unavailable targets, multi-path diff, and exact
  output expectations.
- Durable artifacts use `$REMEDIATION_DIR/context.md` variables/templates rather
  than active local worktree paths.

## Non-Claims

This investigation does not edit D4 packet files, implement TypeScript, accept
D4 for implementation, or claim current runtime behavior is wrong before D4 is
accepted. It identifies the information architecture needed for D4 to become a
readable execution authority.
