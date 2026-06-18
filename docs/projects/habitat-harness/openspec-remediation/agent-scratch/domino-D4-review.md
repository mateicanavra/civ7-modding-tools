# D4 Orientation And Routing Per-Domino Review

## Supervisor Vocabulary Correction

D3 owns this state family as `GraphRefusal` / `graph-refusal`. Any earlier scratch wording inherited from the source packet that used a D4-owned graph state name is superseded by the active D4 packet language: D4 consumes and renders D3 graph refusals, with D3-owned reason categories for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, and unresolved alias dependency.

## Skills Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/testing-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/system-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/dev/1.0.0/skills/typescript/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/references/method-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/references/evidence-and-proof.md`

## Sources Read

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation-frame.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`

Commands run:

- `git status --short --branch`
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` passed.
- `bun run habitat classify tools/habitat-harness/src/plugin.js` passed and showed current JSON shape.
- `bun run habitat classify <literal README diff>` passed and showed current diff JSON shape.
- `bun run habitat classify <pathless newline text>` passed with `{"schemaVersion":1,"inputKind":"diff","paths":[]}`, demonstrating the malformed/pathless ambiguity remains present behavior.

## Acceptance Verdict

Not accepted. D4 remains blocked.

The generated OpenSpec scaffold is valid OpenSpec shape, but it is not a packet-specific execution contract. It drops the source packet's core discriminated state model, leaves public JSON compatibility dependent on an unresolved D0 matrix, and provides validation gates that can pass while the known malformed/pathless diff ambiguity remains. This is exactly the stop-condition class: domain model, scenario coverage, and artifact structure are ambiguous enough that an implementation agent would have to invent target behavior.

## P1 Findings

### P1: The scaffold omits the required classification state model

The source D4 packet requires a versioned classification DTO with explicit variants for workspace path, project path, diff with classified paths, malformed/pathless diff, unresolved owner, and graph refusal. The generated OpenSpec spec only contains two scenarios: supported path and unsupported path. It does not require top-level input variants, variant names, required fields per variant, or non-claims per variant.

Evidence:

- Source packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- Generated spec: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- Current code: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`

Why this blocks: the packet asks implementation to "define path/diff orientation contracts" instead of defining the contract. An execution agent could preserve the current optional-heavy `Classification`, add a shallow `kind?: string`, or invent incompatible variants and still plausibly claim to satisfy the generated scaffold.

### P1: Malformed/pathless diff and graph-refusal behavior remain black-ice ambiguity

D4's source packet explicitly calls malformed/pathless diff and graph refusal states into the contract. The generated scaffold does not name either as required scenarios, task cases, or validation gates. Present behavior confirms the risk: a newline string that is not a diff is treated as a successful diff with an empty `paths` array, and graph metadata reader failures are not modeled as a classification variant in the public contract.

Evidence:

- `classifyTarget()` treats any newline input as diff-like via `diffText()` and returns `{ schemaVersion: 1, inputKind: "diff", paths: extractDiffPaths(diff).map(...) }`.
- `bun run habitat classify $'not a diff\njust text'` exited 0 with an empty diff classification.
- `readNxProjects()` currently lets graph metadata failures escape the normal classification DTO path.

Why this blocks: these are not edge-case implementation details. They are product states for an orientation command whose job is to keep agents from editing under false confidence. A passing OpenSpec shape check and two happy-path classify commands would miss both failures.

### P1: Public JSON compatibility is unresolved but D4 is allowed to change public output

D4 affects `Classification` and `DiffClassification` JSON. D0 identifies those surfaces as public/compatibility inventory items, but the generated D4 packet does not include the D0 compatibility row, versioning decision, preservation/deprecation/refusal handling, or exact before/after JSON contract. The proposal says classify/orientation JSON may change only through D0 compatibility decisions, but the D4 phase record and tasks do not require the actual D0 matrix row before packet acceptance.

Evidence:

- D0 source packet names `Classification` and `DiffClassification` in its JSON schema inventory.
- Current `Classification` lacks `schemaVersion`, while `DiffClassification` has `schemaVersion: 1`.
- D4 generated tasks only say to "Confirm" public surfaces through D0 during pre-implementation, without recording the compatibility decision in the packet itself.

Why this blocks: D4's core repair is a public DTO/state-space change. Without a concrete compatibility disposition, implementation can either break current consumers silently or freeze the current invalid shape to avoid breakage.

## P2 Findings

### P2: Tasks are not implementation-ready steps

Tasks `2.1` through `2.3` are design outcomes, not executable implementation steps. They do not identify files, type names, expected variant names, DTO fields, test cases, or docs/examples to update. The OpenSpec workstream contract says tasks must be implementation steps, not unresolved design questions.

### P2: Write set and protected paths are deferred

The design says a concrete write set and protected path list are required before implementation, and `tasks.md` asks the executor to record them later. For this packet, the likely write set is knowable enough to bound: classify command adapter, command-engine classification logic or extracted orientation module, public exports, classify tests, and docs/examples. Deferring the write set lets an execution agent pull graph, rule registry, D14 authoring, or enforcement edits into D4.

### P2: Validation gates are confirmation checks, not falsifying checks

The generated validation gates include two classify commands, OpenSpec validation, global OpenSpec validation, and `git diff --check`. They omit the source packet's required unit test gate, malformed/pathless diff refusal, graph refusal fixture, unavailable-target assertions, diff with multiple paths, unresolved-owner/workspace fallback expectations, and exact expected JSON/human output. They also do not record expected output beyond exit status.

### P2: Domain boundary is named but not operationally owned

"Orientation and Routing" is named as owner, and adjacent forbidden owners are listed, but the packet does not state which module/package/API owns the classification DTO and command adapter after D4. It also does not say which D2 projection fields and D3 graph facts D4 is allowed to consume. That leaves authority overlap between Orientation and Routing, Rule Registry Metadata, and Workspace Graph Integration.

### P2: Spec scenarios are too coarse to constrain downstream D14

D4 enables D14 authoring topology examples, but the generated D4 spec does not define the example corpus D14 can rely on. It should provide path, diff, workspace fallback, unresolved owner, malformed/pathless diff, graph refusal, and unavailable-target examples with non-claims. Without those, D14 will either invent classify examples or weaken its fence/refusal contract.

## P3 Findings

### P3: "Supported actions" and "next safe commands" are underspecified terms

The scaffold uses product-friendly language, but for D4 these phrases need mapping to concrete output fields such as runnable graph-backed targets, unavailable targets, recovery instructions, and non-claims. Otherwise "supported action" can be read as permission to generate, apply, enforce, or run targets.

### P3: The generated spec omits source-packet non-claims

The source packet says classify does not run targets and does not prove rule correctness or apply safety. The phase record keeps broad non-claims, but the normative spec delta does not require output to carry those non-claims where they matter.

### P3: OpenSpec change name is acceptable but less precise than the product contract

`deep-habitat-d4-orientation-routing` is serviceable. If repaired, the design should still title the concrete contract as `habitat classify routing contract` or equivalent inside the packet so implementers center the command/public DTO, not an abstract orientation layer.

## Required Repairs

1. Add the explicit D4 top-level state model to `design.md` and `specs/habitat-harness/spec.md`: workspace path, project path, diff with classified paths, malformed/pathless diff, unresolved owner, graph refusal.
2. For each variant, define required fields, forbidden fields, refusal/recovery shape, non-claims, and whether graph-backed targets may appear.
3. Record the D0 compatibility disposition for `habitat classify` JSON/human output, `Classification`, `DiffClassification`, and package exports before accepting D4.
4. Replace generic implementation tasks with file- and behavior-specific steps, including the DTO migration, command adapter behavior, public export handling, tests, docs/examples, and downstream D14 example handoff.
5. Add falsifying validation gates: classify unit tests for every variant, malformed/pathless diff refusal, graph refusal fixture, unavailable-target fixture, multi-path diff ordering, workspace fallback, and exact expected command output or JSON snapshots.
6. Add a concrete write set and protected path list. Protected paths should explicitly exclude D2 registry schema ownership, D3 graph metadata authority, D7 enforcement execution, D13 scaffolding/refusal implementation, and D14 topology fence implementation unless a repair updates sequencing.
7. Update downstream realignment to name D14's dependency on D4 example states and to require updates if the state model changes during repair.

## Suggested Wording/Structural Repairs

Replace the current broad requirement with a more constraining set:

```text
### Requirement: Classify Output Uses Explicit Orientation States

Habitat classify SHALL return a versioned orientation result whose top-level
state is exactly one of: project-path, workspace-path, diff, malformed-or-pathless-diff,
unresolved-owner, or graph-refusal.

#### Scenario: Project path is classified
- WHEN a repo path resolves to a project through D3 graph metadata
- THEN the result state is project-path and includes owner project, project root,
  tags, D2-backed scoped rule projections, graph-backed runnable targets,
  unavailable targets, recovery guidance where applicable, and classify non-claims.

#### Scenario: Malformed or pathless diff is refused
- WHEN the input is diff-like but contains no classified changed path
- THEN the result state is malformed-or-pathless-diff and includes a stable
  refusal reason, recovery instruction, no runnable graph-backed target commands,
  and a non-claim that classify did not infer ownership.

#### Scenario: Workspace graph cannot be read
- WHEN D3 graph metadata cannot be resolved
- THEN the result state is graph-refusal and includes the bounded error class,
  recovery instruction, no project-local target commands, and no rule execution claim.
```

Add a "Public Surface Compatibility" table to `design.md`:

| Surface | Current State | D0 Disposition Required Before Code | D4 Target Decision |
| --- | --- | --- | --- |
| `habitat classify` command JSON | single path unversioned, diff versioned | preserve/version/deprecate/refuse | blocked until recorded |
| `Classification` export | optional-heavy interface | public/internal/test-only decision | blocked until recorded |
| `DiffClassification` export | versioned diff wrapper | public/internal/test-only decision | blocked until recorded |

Rewrite validation tasks to include exact oracles, for example:

```text
- [ ] Run `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`
      and verify coverage for project-path, workspace-path, diff, malformed-or-pathless-diff,
      unresolved-owner, graph-refusal, unavailable targets, and unresolved rule metadata.
- [ ] Run `bun run habitat classify <malformed newline input>` and verify it returns
      the malformed-or-pathless-diff refusal state, not an empty successful diff.
```

## Non-Claims

- This review does not accept or reject D0, D2, D3, or D14 as full packets.
- This review does not claim the current code is wrong to keep existing behavior before D4 is accepted; it claims the D4 packet must decide target behavior before implementation.
- `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` proves only OpenSpec artifact shape, not D4 contract adequacy.
- The classify command probes prove current behavior for sampled inputs only; they do not prove full command correctness.
- No TypeScript implementation or OpenSpec artifact repair was performed in this review.
