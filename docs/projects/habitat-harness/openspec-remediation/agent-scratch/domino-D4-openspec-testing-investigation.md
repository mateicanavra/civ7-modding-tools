# D4 OpenSpec And Testing Investigation

## Supervisor Vocabulary Correction

D3 owns this state family as `GraphRefusal` / `graph-refusal`. Any earlier scratch wording inherited from the source packet that used a D4-owned graph state name is superseded by the active D4 packet language: D4 consumes and renders D3 graph refusals, with D3-owned reason categories for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, and unresolved alias dependency.

## Scope

Lane: D4 Orientation and Routing OpenSpec/testing review.

Objective: turn `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing` into an implementation-ready OpenSpec change packet. This review owns OpenSpec structure, normative requirement clarity, executable task shape, and validation gates as falsifying oracles. It does not implement TypeScript and does not patch packet files.

## Sources Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- Every file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/civ7-open-spec-workstream/references/`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`
- Every current D4 OpenSpec file under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/`
- Accepted D0 design/spec/tasks under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/`
- Accepted D2 design/spec/tasks under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/`
- Accepted D3 design/spec/tasks under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/`
- Present-behavior evidence in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`

Command run:

- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` passed. This proves OpenSpec shape only; it does not prove D4 contract adequacy.

## Verdict

D4 is not implementation-ready. The current OpenSpec scaffold is syntactically valid but still proposal-shaped: it leaves the classification state model, public JSON compatibility, D2/D3 dependency consumption, write set, stop conditions, and falsifying validation gates for the implementation agent to invent.

The source D4 packet requires a versioned discriminated orientation result for workspace path, project path, diff with classified paths, malformed/pathless diff, unresolved owner, and graph refusal. The current spec has only "Supported path is classified" and "Unsupported path is classified." That is too coarse to remove invalid states or prevent false confidence in `habitat classify`.

## P1 Findings

### P1: D4 does not define the required orientation state model

The source packet requires a versioned DTO with explicit variants for project path, workspace path, diff with classified paths, malformed/pathless diff, unresolved owner, and graph refusal. The current D4 spec defines one broad requirement and two scenarios, neither of which names the top-level states, their required fields, forbidden fields, or non-claims.

Why this blocks: an implementation agent could preserve the current optional-heavy `Classification` shape, add a shallow `kind` field, or treat workspace paths and unresolved owners as the same state while still satisfying the current scaffold language. That fails the D4 objective: reduce state space before agents rely on classify for editing orientation.

Repair demand:

- Add an explicit top-level orientation result union to `design.md`.
- Add normative state-family requirements and scenario names to `specs/habitat-harness/spec.md`.
- State that each command invocation returns exactly one top-level state, except `diff` which contains per-path orientation items with their own state.

### P1: Malformed/pathless diff, graph refusal, and unresolved owner are not falsifiable states

Current `classifyTarget()` treats any newline-containing input as diff-like and returns `DiffClassification` with `paths: extractDiffPaths(diff)`. A malformed/pathless diff can therefore become a successful empty diff. Current graph read failures also escape the orientation DTO path rather than becoming a user-facing graph-refusal state.

Why this blocks: D4's product scenario is to prevent humans and agents from acting under false orientation. A pathless diff, unresolved owner, or graph failure must not look like a supported workspace path, an empty successful diff, or a runnable target list.

Repair demand:

- Add separate normative states for `malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`.
- Require refusal/recovery text and non-claims for each state.
- Forbid runnable graph-backed commands in those states.

### P1: D0 compatibility disposition is required but not recorded

D4 changes `habitat classify` JSON/human output and touches the compatibility
shape for `Classification`, `DiffClassification`, and package exports when
source implementation reaches those surfaces. D0 requires each later packet to
cite concrete `surface_id` rows and follow row compatibility handling before
changing public or durable surfaces. The current D4 proposal says JSON may
change only through D0 decisions, while the tasks defer concrete D0 row
citation and compatibility-handling proof to implementation.

Why this blocks: D4's core change is a public command DTO migration. Without exact D0 row citations and handling, implementation can either silently break consumers or preserve invalid current states to avoid breakage.

Repair demand:

- Add a `Public Surface Compatibility` section to `design.md` that names each D0 row required before source edits.
- Stop before implementation if classify command JSON, human output, package exports, docs examples, or tests lack D0 rows.
- Make D0 row citation a task and closure gate, not an optional preflight note.

### P1: D4 does not bind its dependencies to accepted D2 and D3 contracts

D2 owns `ruleRoutingFacts`, unresolved routing metadata, and the prohibition on parsing prose `scope` as authority. D3 owns project ownership, target availability, unavailable targets, graph refusals, and graph refusal classification. The D4 packet says it consumes D2/D3, but it does not name which D2 projections and D3 graph states D4 may consume, nor which facts it may not recreate.

Why this blocks: Orientation and Routing can accidentally become a second Rule Registry Metadata owner or Workspace Graph owner. That violates the accepted D2/D3 boundary and leaves two domains able to claim target/routing truth.

Repair demand:

- `design.md` must state D4 consumes `ruleRoutingFacts` from D2 and `ClassifyTargetProjection`/graph refusal facts from D3.
- D4 must forbid raw `scope` parsing, local owner-root maps, local target arrays, colon target parsing, and wrapper-exit target truth.
- The spec must include D2 unresolved routing metadata and D3 graph refusal scenarios.

## P2 Findings

### P2: Tasks are design prompts, not executable implementation steps

Tasks `2.1` through `2.3` say "Define path/diff orientation contracts," "Separate routing facts from enforcement results," and "Add refusal and recovery language." These are goals, not steps. They omit write paths, type names, variant names, tests, docs, exact output behavior, and stop conditions.

Repair demand: replace implementation tasks with ordered slices: D0 grounding, orientation DTO/model, D2/D3 projection consumption, command adapter rendering, tests/fixtures, docs/examples, validation, review/realignment.

### P2: The write set and protected paths are deferred

The current D4 packet says the executor must record a concrete write set later. For D4, the likely implementation write set is already bounded enough to bound in the packet.

Suggested write set:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- New orientation/classify contract module under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/` if needed
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts` only for D0-cited public export compatibility
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- New focused classify/orientation fixtures under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/` if needed
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/docs/SCENARIOS.md` and adjacent classify examples only when D0 rows cover public guidance
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/**`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md` only for D4 status after review

Protected paths:

- D2 registry schema/source ownership except projection consumption.
- D3 graph module ownership except consuming accepted graph facts.
- D7 structural enforcement behavior.
- D13 scaffolding/refusal implementation.
- D14 topology fence implementation.
- Generated outputs, lockfiles, and unrelated Civ/MapGen domains.

### P2: Validation gates are mostly confirmation checks

The current gates include two classify commands, OpenSpec validation, global OpenSpec validation, and `git diff --check`. They can all pass while the known malformed/pathless diff ambiguity remains. The gates do not assert exact status, output state, non-claims, or negative cases.

Repair demand: replace broad command checks with a validation oracle table and exact expected states for every D4 state.

### P2: Human output and JSON output are not separately specified

D0 treats command JSON and human output as separate planes. D4 currently says "JSON and human guidance may change" but does not specify whether human output mirrors state names, includes non-claims, or displays recovery instructions.

Repair demand: the spec must require that machine output is state-complete and human output is guidance-complete without adding claims absent from JSON. If human output remains JSON-only for now, D4 should state that and make docs/examples match.

### P2: Downstream D14 dependency is under-specified

D4 enables D14, but the current downstream ledger only says later packets are pending. D14 needs stable classify examples for project path, workspace path, multi-path diff, malformed/pathless diff, unresolved owner, graph refusal, unavailable targets, D2 unresolved metadata, and D3 graph refusal.

Repair demand: D4 should hand off a named example corpus or table that D14 can cite. D14 must not invent states or weaken D4 refusals.

## P3 Findings

### P3: "Supported actions" and "next safe commands" need field-level meaning

The current packet uses useful product language, but it does not define whether "supported actions" means runnable graph-backed targets, unavailable target facts, recovery instructions, docs links, or enforcement commands. That ambiguity can authorize target execution claims that classify does not prove.

Suggested repair: use field names like `runnableTargets`, `unavailableTargets`, `recovery`, `nonClaims`, and `routingFacts` in design text. Avoid generic "actions" unless paired with a field definition.

### P3: Source-packet non-claims are not normative

The source packet says classify does not run targets and does not prove rule correctness or apply safety. The D4 phase record has non-claims, but the spec does not require every relevant state to carry them.

Suggested repair: add a requirement that every state includes or renders classify non-claims, with stricter non-claims for refusal/error states.

### P3: State names should center command semantics

The change name is acceptable, but the packet should title the concrete contract as the `habitat classify orientation result` or `habitat classify routing contract`. That keeps implementation centered on the public command and DTO rather than an abstract layer.

## Required Normative Requirement Families

Use these requirement families in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`.

### Requirement: Classify Returns Exactly One Orientation State

Habitat classify SHALL return a versioned orientation result whose top-level `state` is exactly one of `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, or `graph-refusal`.

Scenario names:

- `Scenario: Project path resolves to an owning project`
- `Scenario: Workspace path remains workspace-scoped`
- `Scenario: Diff contains classified changed paths`
- `Scenario: Diff-like input has no changed paths`
- `Scenario: Path ownership cannot be resolved`
- `Scenario: Workspace graph cannot be read`

### Requirement: Project Path Orientation Uses D2 Routing And D3 Graph Facts

For `project-path`, Habitat SHALL include the owning project, project root, tags, D2-backed scoped rule projections, D2 unresolved routing metadata where present, D3-backed runnable targets, D3-backed unavailable targets, recovery guidance where applicable, and classify non-claims.

Scenario names:

- `Scenario: Project path includes runnable project and workspace targets`
- `Scenario: Project target is unavailable`
- `Scenario: D2 routing metadata is unresolved`
- `Scenario: Project path does not parse prose scope as authority`

### Requirement: Workspace Path Orientation Does Not Infer Project Ownership

For `workspace-path`, Habitat SHALL include workspace-level routing facts, workspace-level runnable targets if backed by D3 or D0-cited root-script compatibility, relevant workspace-gate rules, recovery guidance where applicable, and a non-claim that classify did not infer a project owner.

Scenario names:

- `Scenario: Root workspace file is classified as workspace path`
- `Scenario: Missing workspace-level path is not treated as unresolved owner`
- `Scenario: Workspace path omits project-local targets`

### Requirement: Diff Orientation Preserves Per-Path States

For `diff`, Habitat SHALL classify each changed path independently, preserve deterministic path order, and represent each path with a valid path-level orientation state. A diff result SHALL NOT collapse multiple paths into one owner, one target list, or one recovery instruction.

Scenario names:

- `Scenario: Multi-path diff classifies paths independently`
- `Scenario: Diff path order is deterministic`
- `Scenario: Diff includes project and workspace path states`
- `Scenario: Diff includes an unresolved path state without dropping other paths`

### Requirement: Malformed Or Pathless Diff Is Refused

For `malformed-or-pathless-diff`, Habitat SHALL return a stable refusal reason, recovery instruction, zero classified paths, no runnable graph-backed target commands, and a non-claim that classify did not infer ownership or target safety.

Scenario names:

- `Scenario: Newline text without diff paths is refused`
- `Scenario: Patch file with no changed paths is refused`
- `Scenario: Empty diff is not a successful diff`

### Requirement: Unresolved Owner Is Distinct From Workspace Path

For `unresolved-owner`, Habitat SHALL distinguish a path that cannot be mapped to a supported owner from an intentional workspace-level path. It SHALL include the input path, stable unresolved reason, recovery instruction, no project-local runnable targets, and non-claims.

Scenario names:

- `Scenario: Unsupported project-like path is unresolved`
- `Scenario: Unknown owner metadata does not fall back to workspace success`
- `Scenario: Unresolved owner omits project targets`

### Requirement: Graph Error Withholds Graph-Backed Claims

For `graph-refusal`, Habitat SHALL render the D3 graph read/refusal state, recovery instruction, no project-local runnable target commands, no unavailable-target inference beyond the graph refusal, and a non-claim that classify did not prove target availability.

Scenario names:

- `Scenario: Nx graph read failure returns graph-refusal`
- `Scenario: Malformed graph JSON returns graph-refusal`
- `Scenario: Nx daemon failure returns graph-refusal`
- `Scenario: Graph refusal does not emit runnable target commands`

### Requirement: D3 Graph Refusal Facts Remain Visible In Orientation

When D3 reports graph refusal facts for unavailable targets, unresolved alias dependencies, missing projects, missing targets, malformed graph JSON, Nx read failure, or Nx daemon failure, D4 SHALL preserve the refusal category in classify output and SHALL NOT convert it into a runnable command, a successful unavailable-target row, or a generic workspace note.

Scenario names:

- `Scenario: Missing-project alias appears as graph refusal`
- `Scenario: Missing-target alias appears as graph refusal`
- `Scenario: Unresolved alias dependency is non-runnable`

### Requirement: Public Compatibility Is Cited Before Source Edits

Before D4 implementation changes `habitat classify` JSON, human output, `Classification`, `DiffClassification`, package exports, docs examples, or tests that encode public output, D4 SHALL cite concrete D0 `surface_id` rows and follow each row's `compatibility_handling`.

Scenario names:

- `Scenario: Classify JSON change cites D0 command-json row`
- `Scenario: Human output change cites D0 human-output row`
- `Scenario: Package export change cites D0 package-export row`
- `Scenario: Missing D0 row blocks source implementation`

## Validation Gates And Oracles

| Gate | Expected status | Oracle | Non-claim |
| --- | --- | --- | --- |
| Project path classify: `bun run habitat classify tools/habitat-harness/src/plugin.js --json` or current command equivalent | exit 0 | Top-level `state: "project-path"`; owner is `@internal/habitat-harness`; project root is `tools/habitat-harness`; tags are present; D2-backed scoped rules are present; D3-backed runnable targets and unavailable targets are distinguishable; non-claims are present. | Does not run targets, prove rule correctness, prove graph freshness beyond current read, or prove D7 enforcement. |
| Workspace path classify: `bun run habitat classify package.json --json` or current command equivalent | exit 0 | Top-level `state: "workspace-path"`; no project owner; workspace-gate guidance present; no project-local target commands; non-claim that no project owner was inferred. | Does not prove every workspace rule is applicable or that workspace targets are fresh. |
| Multi-path diff classify using one project path and one workspace path | exit 0 | Top-level `state: "diff"`; deterministic sorted paths; each changed path has its own path-level state; targets/rules are per-path, not collapsed. | Does not prove patch applies or that changed files exist. |
| Malformed/pathless diff: literal newline text or empty patch input | nonzero or exit 0 with explicit refusal, per D0/D1 compatibility decision | Top-level `state: "malformed-or-pathless-diff"`; stable refusal reason; recovery instruction; zero runnable targets; no empty successful `paths: []` diff. | Does not infer ownership, target availability, or safety. |
| Unresolved owner path fixture | exit 0 with explicit unresolved state, unless D1/D0 requires nonzero refusal | Top-level `state: "unresolved-owner"`; input path preserved; no project-local target commands; recovery instruction names the next safe action. | Does not claim workspace ownership, project ownership, or runnable project targets. |
| Graph refusal fixture with injected `NxProjectMetadataReader` failure | exit 0 with explicit graph-refusal state, unless D1/D0 requires nonzero refusal | Top-level `state: "graph-refusal"`; graph refusal category is preserved; no project-local runnable commands; recovery instruction present. | Does not prove target availability, unavailable-target completeness, or rule applicability. |
| Unavailable target unit fixture | test exit 0 | `project-path` state includes unavailable target rows for missing project targets and does not include those targets in runnable command lists. | Does not prove absent targets should be created or run. |
| D2 unresolved routing metadata unit fixture | test exit 0 | Path-level orientation includes scoped rule with unresolved routing metadata and does not guess from legacy `scope` prose. | Does not prove D2 registry correctness beyond supplied projection facts. |
| D3 graph refusal facts unit fixture | test exit 0 | Orientation preserves D3 graph refusal categories such as missing-project alias, missing-target alias, and unresolved alias dependency as non-runnable facts. | Does not prove D3 dependency declarations are complete. |
| `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts` | exit 0 | Covers every D4 top-level state and the D2/D3 bad cases above. | Does not prove unrelated command behavior. |
| `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` | exit 0 | OpenSpec change structure is valid. | Does not prove contract adequacy. |
| `bun run openspec:validate` | exit 0 | Repo OpenSpec records remain valid. | Does not prove runtime behavior. |
| `git diff --check` | exit 0 | No whitespace conflict markers or diff formatting errors. | Does not prove semantic correctness. |

## Suggested Design Wording

Add this to `design.md` under a concrete `Habitat Classify Orientation Contract` section:

```text
D4 owns the `habitat classify` orientation result. The result is a command DTO,
not a reusable graph or rule-registry authority. D4 consumes `ruleRoutingFacts`
from D2 and graph target/refusal facts from D3. It may render those facts and
attach recovery guidance, but it may not parse legacy `scope` prose, recreate
owner-root maps, parse colon-delimited graph targets, or convert graph refusals
into runnable commands.

The top-level orientation states are: `project-path`, `workspace-path`, `diff`,
`malformed-or-pathless-diff`, `unresolved-owner`, and `graph-refusal`. Every state
includes `schemaVersion`, `state`, `input`, `nonClaims`, and either classified
facts or refusal/recovery facts. A state that lacks graph/project certainty must
withhold runnable project target commands.
```

Add this `Public Surface Compatibility` table:

| Surface | Required D0 row before source edits | D4 target decision |
| --- | --- | --- |
| `habitat classify` command JSON | command-json row for classify output shape | Version or preserve through D0; cannot silently change. |
| `habitat classify` human output | human-output row if output is not JSON-only | Human guidance must not claim more than JSON. |
| `Classification` TypeScript export | command-json/package-export row as applicable | Keep only through D0-cited facade or migrate to command DTO. |
| `DiffClassification` TypeScript export | command-json/package-export row as applicable | Replace with `diff` state or preserve through D0 versioning. |
| Classify docs examples | docs-example rows | Regenerate/update only after behavior is implemented and cited. |

## Suggested Spec Wording

Replace the current broad requirement with:

```text
### Requirement: Classify Returns Explicit Orientation States

Habitat classify SHALL return a versioned orientation result whose top-level
`state` is exactly one of `project-path`, `workspace-path`, `diff`,
`malformed-or-pathless-diff`, `unresolved-owner`, or `graph-refusal`.

Each orientation result SHALL include classify non-claims. A result SHALL NOT
include runnable project target commands unless those commands are backed by D3
graph target facts for the current graph read. A result SHALL NOT use D2 legacy
`scope` prose as routing authority.

#### Scenario: Project path resolves to an owning project
- **WHEN** a repo path resolves to a project through D3 graph metadata
- **THEN** the result state is `project-path`
- **AND** the result includes owner project, project root, tags, D2-backed scoped
  rule projections, D3-backed runnable targets, unavailable targets, recovery
  guidance where applicable, and classify non-claims

#### Scenario: Workspace path remains workspace-scoped
- **WHEN** a supported repo path is intentionally outside a project owner
- **THEN** the result state is `workspace-path`
- **AND** the result omits project-local target commands
- **AND** the result states that classify did not infer project ownership

#### Scenario: Diff-like input has no changed paths
- **WHEN** input is diff-like but contains no classified changed path
- **THEN** the result state is `malformed-or-pathless-diff`
- **AND** the result includes a stable refusal reason and recovery instruction
- **AND** the result does not return an empty successful diff or runnable targets

#### Scenario: Workspace graph cannot be read
- **WHEN** D3 graph metadata cannot be resolved
- **THEN** the result state is `graph-refusal`
- **AND** the result preserves the graph refusal category
- **AND** the result does not emit project-local runnable target commands
```

## Suggested Task Wording

Replace `tasks.md` with implementation-ready slices like:

```text
## 1. Source Preconditions

- [ ] 1.1 Confirm worktree and branch, then record `git status --short --branch`.
- [ ] 1.2 Read D0, D2, D3 accepted design/spec records and this D4 packet.
- [ ] 1.3 Cite concrete D0 rows for classify JSON, classify human output,
      `Classification`, `DiffClassification`, package exports, and docs examples.
- [ ] 1.4 Stop before source edits if any required D0 row or D2/D3 implementation
      fact is missing.
- [ ] 1.5 Record the approved write set and protected paths in the D4 phase record.

## 2. Orientation Contract Slice

- [ ] 2.1 Add the versioned orientation result state model for `project-path`,
      `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`,
      and `graph-refusal`.
- [ ] 2.2 Define required fields, forbidden fields, refusal/recovery fields, and
      non-claims for each state.
- [ ] 2.3 Preserve D0-required legacy DTO fields only through an explicit
      compatibility facade or versioned output path.

## 3. D2/D3 Consumption Slice

- [ ] 3.1 Migrate classify rule routing to D2 `ruleRoutingFacts`; remove legacy
      `scope` prose parsing as authority.
- [ ] 3.2 Migrate target facts to D3 graph projections; remove local target arrays,
      local owner-root inference, colon parsing, and wrapper-exit target truth from
      classify orientation.
- [ ] 3.3 Preserve D2 unresolved routing metadata and D3 graph refusals as explicit
      non-runnable orientation facts.

## 4. Command Rendering Slice

- [ ] 4.1 Update `habitat classify` JSON rendering to emit exactly one top-level
      D4 state.
- [ ] 4.2 Update human output or document that classify remains JSON-only; in
      either case, ensure human-facing guidance does not claim more than JSON.
- [ ] 4.3 Update public exports only as D0 compatibility handling allows.

## 5. Tests And Fixtures

- [ ] 5.1 Add unit tests for project path, workspace path, multi-path diff,
      malformed/pathless diff, unresolved owner, graph refusal, unavailable target,
      D2 unresolved routing metadata, and D3 graph refusal facts.
- [ ] 5.2 Add command behavior tests or snapshots for representative JSON/human
      output, with exact state and non-claim assertions.
- [ ] 5.3 Add a malformed/pathless diff regression asserting newline text no longer
      returns a successful empty diff.

## 6. Validation

- [ ] 6.1 Run `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`.
- [ ] 6.2 Run project path, workspace path, multi-path diff, and malformed/pathless
      diff classify commands and record exact expected states.
- [ ] 6.3 Run graph refusal and unresolved owner fixtures and record exact expected
      states.
- [ ] 6.4 Run `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict`.
- [ ] 6.5 Run `bun run openspec:validate`.
- [ ] 6.6 Run `git diff --check`.

## 7. Review And Realignment

- [ ] 7.1 Run final domain-language, OpenSpec/testing, TypeScript state-space,
      D2/D3 boundary, and information-design review lanes.
- [ ] 7.2 Repair every accepted P1/P2 finding before D4 acceptance.
- [ ] 7.3 Update `tools/habitat-harness/docs/SCENARIOS.md`, classify examples,
      D14 dependency notes, packet index, phase record, downstream ledger, and
      closure checklist only after implementation facts are known.
- [ ] 7.4 Leave the worktree clean or write a zero-context next packet.
```

## Stop Conditions

D4 must stop before implementation or closure if any of these are true:

- No concrete D0 row exists for a classify public surface that D4 changes.
- The orientation result does not use a closed top-level state.
- Malformed/pathless diff can still return a successful empty diff.
- Workspace path and unresolved owner are indistinguishable.
- Graph refusal can emit project-local runnable commands.
- Unavailable targets are listed as runnable commands.
- D2 unresolved routing metadata is hidden, guessed from prose, or silently dropped.
- D3 graph refusals are converted into runnable aliases, generic notes, or target success.
- Classify output omits non-claims about target execution, rule correctness, and safety.
- Tasks still ask implementation agents to define product behavior rather than execute packet decisions.

## Non-Claims

- This investigation does not accept or reject D0, D2, or D3 beyond using their current accepted design/spec records as D4 dependencies.
- This investigation does not patch D4 packet files.
- This investigation does not implement TypeScript source.
- The OpenSpec validation command proves only artifact shape.
- Present-code probes are evidence of current behavior, not target authority.

Skills used: domain-design, information-design, testing-design, solution-design, civ7-open-spec-workstream.
