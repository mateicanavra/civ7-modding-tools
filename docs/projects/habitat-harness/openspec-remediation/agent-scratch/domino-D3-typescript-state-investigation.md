# D3 TypeScript State-Space Investigation

## Skills Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`

## Sources Read

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D3-workspace-graph-integration-boundary.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D3-review.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/graph.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/verify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/enforcement-surface.test.ts`

Commands run as review evidence only:

- `git status --short --branch`
- `gt --version`
- `nx show project @internal/habitat-harness --json`
- `bun run habitat classify tools/habitat-harness/src/plugin.js`
- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
- `nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`

## Framing Correction Applied

This review does not treat D3 as a partial repair around
`habitat:rule:biome-ci`. The `biome-ci` alias is a current live falsifier
for the broader state-space failure: Habitat has no single Workspace Graph
Integration authority that owns project identity, project roots, target
availability, workspace gates, target aliases, alias dependency validation, graph
read status, and graph refusal states across all graph consumers.

D3 acceptance requires the complete Workspace Graph Integration authority
contract. The accepted solution must make the invalid graph states
unrepresentable or explicitly refused before any consumer can present, execute,
or record them as runnable target facts.

Historical scratch evidence is provenance only. It does not lower this bar.

## Verdict

**Not accepted.**

The current D3 packet is substantially closer than the negative-control scaffold
because `proposal.md` and `design.md` now name a Workspace Graph owner, a target
union, a module boundary, consumer contracts, a write set, and validation oracle.
That is the correct direction.

It still cannot be accepted through the TypeScript state-space lane because the
contract is not carried through the full artifact set. `tasks.md`,
`specs/habitat-harness/spec.md`, `phase-record.md`,
`downstream-realignment-ledger.md`, and `review-disposition-ledger.md` still
permit the old broad "make target availability a graph fact" implementation
path. A later implementation agent could satisfy those weaker artifacts while
leaving the complete Workspace Graph authority split across plugin inference,
metadata reads, classify JSON, verify planning, root scripts, and test fixtures.

**The simpler model:** one Workspace Graph Integration owner emits a closed,
discriminated graph state model; all consumers receive projections from that
model instead of re-parsing strings, reconstructing target truth, or downgrading
graph errors into generic command outcomes.

**State-space delta if applied:** unbounded string targets plus duplicate local
maps plus optional/untyped target facts become a closed target/refusal union. The
compiler can then prevent an unresolved project, unresolved target, unresolved
alias dependency, malformed graph read, or workspace gate from being represented
as an available executable project target.

## Current State-Space Problem

D3's full domain problem is not "one bad alias." It is the product of five
reachable-state leaks:

1. **Primitive obsession: target strings carry too much meaning.**
   `plugin.js` accepts target names such as `biome:ci`, `boundaries`,
   `grit:check`, and `generated:check` as `string`. `dependencyForTarget` then
   splits on the first colon and fabricates `{ projects, target }`. That makes
   target display names, project-local targets, workspace gates, and alias
   dependencies indistinguishable until runtime.

2. **Duplicate graph truth: several modules own partial graph facts.**
   `plugin.js` owns `OWNER_ROOTS`, target-name constants, alias construction,
   and no-op wrappers. `nx-projects.ts` owns project metadata reads and target
   existence checks. `command-engine.ts` owns classify project target lists,
   workspace target lists, and verify affected target lists. None of those
   authorities can prove that the others still agree.

3. **Optional/split target facts: classify state is encoded by container shape.**
   `Classification` has `targets?: ClassifiedTarget[]`,
   `unavailableTargets?: UnavailableClassifiedTarget[]`, and
   `requiredTargets?: string[]`. A consumer must infer state from which array a
   record appears in and whether a command string exists. This is a partial
   discriminated model, but it is not the Workspace Graph authority model.

4. **No-op alias wrappers collapse dependency failure into success.**
   `aliasRuleTarget` emits `command: 'node -e ""'`. If Nx dependency resolution
   warns but still runs the wrapper, the target exits 0. The domain state
   "alias dependency unresolved" is not represented as a graph refusal; it leaks
   into "successful command."

5. **Graph errors have no durable state channel.**
   `runGraph` returns command exit/stdout/stderr and parses JSON directly.
   `NxProjectGraphMetadataReader.readProjects()` can throw or fail through Nx.
   D3 needs graph-read states such as malformed JSON, Nx read failure, and Nx
   daemon failure to be typed graph states, not generic command failures or
   thrown exceptions outside the graph authority.

These are classic TypeScript state-space smells: primitive obsession, optional
property soup, missing discriminated union, duplicate code/authority, middle-man
wrappers that do not transform, and errors collapsed into a generic channel.

## Live Falsifier

The current live falsifier demonstrates the general boundary failure:

- `/tools/habitat-harness/src/plugin.js` defines `biomeCiTargetName` as
  `"biome:ci"`.
- `dependencyForTarget("biome:ci")` emits
  `{ projects: ["biome"], target: "ci" }`.
- `biome` is not an Nx project.
- `aliasRuleTarget` emits a no-op wrapper with `command: 'node -e ""'`.
- `nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`
  exits 0 after Nx reports the dependency project pattern matches no projects.

That does not mean D3 is scoped to `biome-ci`. It means the current model admits
the invalid state "unresolved alias dependency represented as runnable target."
D3 must eliminate that state for every current and future target/alias/gate
kind.

## P1 Findings

### P1-1: The full authority contract is not yet normative across the packet

`proposal.md` and `design.md` now name the right contract shape, but the binding
OpenSpec task/spec/phase artifacts still use the older broad language. `tasks.md`
still says:

- "Define graph metadata ownership and target alias policy."
- "Separate resolved project metadata from Habitat structural gates."
- "Make target availability a graph fact consumed by classify and verify."

Those are design prompts, not implementation-ready refactor moves. They do not
force the complete Workspace Graph authority to own owner roots, target names,
available target facts, unavailable target facts, alias dependency facts,
aggregate/workspace targets, graph-read states, classify projections, verify
target planning projections, and plugin target inference projections.

This blocks acceptance because an implementation could still make a local helper
for `biome-ci`, or add a new classify field, or wrap `nx-projects.ts`, while the
state space remains split.

Required repair:

- Replace task 2 with concrete compiler-gated moves against the approved write
  set in `design.md`.
- Make each task name the source of truth it deletes or demotes:
  `OWNER_ROOTS`, colon-split dependency construction, local project target
  arrays, local workspace target arrays, hard-coded verify affected targets, and
  compatibility-only classify DTO construction.
- State that no consumer may construct graph truth from strings or local maps
  after D3.

### P1-2: The OpenSpec spec still accepts a smaller problem than D3 owns

`specs/habitat-harness/spec.md` has only two scenarios:

- project target is reported;
- target is unavailable.

That spec does not constrain alias targets, alias dependency resolution,
aggregate/workspace targets, graph refusals, graph-read failure states, verify
target planning, or the distinction between compatibility JSON and the internal
Workspace Target Fact model. It also does not reject the no-op wrapper success
state.

This blocks acceptance because the spec can pass while the complete Workspace
Graph authority contract is not implemented.

Required repair:

- Add normative scenarios for:
  - graph read succeeds with resolved project metadata;
  - graph read fails as `graph-refusal`, not generic command output;
  - malformed graph JSON is represented as a graph refusal;
  - project target is available only when current graph metadata resolves it;
  - missing project is a refusal or unavailable fact, never a command;
  - missing target is unavailable/refusal, never a command;
  - alias target exists only with resolved dependency project and target;
  - unresolved alias dependency prevents wrapper target emission/execution;
  - aggregate/workspace target is not project-local;
  - classify JSON is a D0 compatibility projection from graph facts;
  - verify target plan is a D3 graph projection while D12 owns receipt schema.

### P1-3: Alias target in the design model still risks smuggling implementation detail into the domain fact

The current `design.md` target model sketches:

```ts
| {
    kind: "alias-target";
    project: string;
    projectRoot: string;
    target: string;
    dependency: { project: string; target: string };
    wrapperCommand: "node -e \"\"";
  }
```

This is directionally useful because it makes an alias dependency explicit. But
as an authority contract, it risks making `node -e ""` part of the domain state
instead of an Nx plugin emission detail. The domain fact should be "resolved
alias target delegates to resolved target dependencies"; the no-op wrapper is
only one projection used by Nx target inference, and it is valid only if
dependency execution is guaranteed or failure happens before wrapper execution.

This matters because D3's complete solution is not "safe no-op wrappers." It is
"target facts cannot lie about graph truth." A future projection may not use a
wrapper at all.

Required repair:

- Split the domain fact from the Nx emission projection:
  - `WorkspaceTargetFact.kind === "resolved-alias-target"` carries resolved
    dependencies and alias identity.
  - `NxInferredTargetProjection.kind === "alias-wrapper-target"` carries
    `command: 'node -e ""'`, `dependsOn`, cache/output settings, and the rule
    that this projection is forbidden for unresolved dependencies.
- If the packet keeps `wrapperCommand` in the fact, state explicitly that it is
  projection metadata and not proof of execution.

### P1-4: The target model does not yet cover enough dependency shape for complete graph authority

The proposed `alias-target` allows one dependency:

```ts
dependency: { project: string; target: string }
```

The graph domain already contains target facts with multiple dependencies
(`generated:check` depends on `@swooper/mapgen-core:build` and
`@civ7/map-policy:verify`). The complete Workspace Graph Integration contract
needs a normalized dependency model that covers project-specific dependencies,
self-project dependencies, workspace/aggregate dependencies, and zero or many
dependencies without falling back to ad hoc strings.

Required repair:

- Define a closed `WorkspaceTargetDependency` union, not a single `{ project,
  target }` object:

```ts
type WorkspaceTargetDependency =
  | { kind: "same-project-target"; target: TargetName }
  | { kind: "project-target"; project: ProjectName; target: TargetName }
  | { kind: "workspace-target"; target: TargetName };
```

- Make alias and aggregate facts carry `dependencies: readonly
  WorkspaceTargetDependency[]`.
- Add refusal cases for every dependency that cannot be resolved under its kind.

### P1-5: Graph error/refusal states are named, but not yet tied to consumer behavior

`design.md` names graph refusals for missing project, missing target,
unresolved alias dependency, malformed graph JSON, Nx read failure, and Nx daemon
failure. That is the right state set. The artifacts still need to bind those
states to exact consumer behavior:

- `plugin.js`: unresolved alias dependencies cannot emit runnable wrapper
  targets.
- `classify`: graph refusals must appear as non-runnable facts and must not
  populate `requiredTargets`.
- `verify`: graph refusals must block or mark the target plan according to a D12
  handoff contract, but D3 must at least prevent a generic "run affected"
  target list from pretending graph planning succeeded.
- `graph` command: malformed graph JSON and Nx read failures should be reported
  through the graph state model where this command is in D3 scope.

Without these consumer-specific obligations, `graph-refusal` can become a type
that exists but is never the source of truth for command behavior.

## P2 Findings

### P2-1: `ClassifiedTarget` remains a compatibility DTO without a required migration gate

Current classify output uses:

- `requiredTargets?: string[]`
- `targets?: ClassifiedTarget[]`
- `unavailableTargets?: UnavailableClassifiedTarget[]`

The design correctly says these are compatibility DTOs only. But the remaining
packet artifacts do not require a migration gate proving that these fields are
constructed from `WorkspaceTargetFact` and not from local arrays in
`command-engine.ts`.

Required repair:

- Add a task and test gate that fails if `projectTargets()` / `workspaceTargets()`
  remain the authority after D3.
- Add classify tests that assert `requiredTargets` contains only runnable
  projections of `available-project-target` or `aggregate-workspace-target`, not
  graph refusals or unavailable targets.

### P2-2: The write set is strong in `design.md` but not copied into phase closure controls

`design.md` names a useful write set and protected paths. `phase-record.md` and
`closure-checklist.md` still do not carry the same concrete write set, protected
path list, or acceptance gate.

Required repair:

- Copy the approved write set/protected paths into the phase record.
- Add closure checklist items for:
  - no graph truth outside the Workspace Graph modules;
  - no colon-split dependency parsing;
  - no local owner-root map in consumers;
  - no hard-coded verify/classify target plan outside the graph authority;
  - D0/D2 blockers still respected before source implementation.

### P2-3: Validation gates are stronger in `proposal.md` and `design.md`, but not in `tasks.md` or `phase-record.md`

The improved validation oracle requires workspace graph tests, enforcement
surface tests, classify tests, `nx show project --json`, cache-disabled alias
execution, classify JSON, OpenSpec validation, and diff check. `tasks.md` and
`phase-record.md` still list only the earlier smoke gates.

Required repair:

- Align `tasks.md` validation with the design oracle.
- Include exact pass/fail semantics:
  - current false-green state must fail;
  - missing-project alias fixture must produce graph refusal;
  - no-op wrapper success without dependency execution is failure;
  - classify JSON must distinguish available, unavailable, aggregate, alias, and
    refusal facts.

### P2-4: Downstream ledger does not yet state the complete handoff contract

`design.md` gives useful downstream handoffs for D4, D7, and D12. The downstream
realignment ledger still says "pending" without naming which facts are allowed
and which are non-claims.

Required repair:

- Copy the D4/D7/D12 handoff rows into the downstream ledger.
- Add one explicit constraint: downstream packets may consume graph facts but may
  not infer target truth, alias validity, or graph-read success themselves.

### P2-5: Naming still mixes graph facts with command/proof language in compatibility surfaces

The design correctly demotes legacy `proof` fields to compatibility facts.
However, current code and tests still expect `proof.kind: "nx-project-graph"` and
`proof.kind: "habitat-owned"`. D3 should not require immediate public JSON
renaming without D0, but the packet must prevent the implementation from
treating `proof` as target-domain language.

Required repair:

- State in tasks/spec that compatibility fields may remain only as D0-governed
  projections.
- The Workspace Graph core types should use graph facts, target dependencies,
  target projections, graph refusals, command outcomes, and receipts, not
  product-level "proof" terminology.

## Target Type Model

The target model below is the bar this review expects D3 to specify before
implementation. Names may differ, but the state-space properties should hold.

```ts
type ProjectName = string & { readonly __brand: "ProjectName" };
type ProjectRoot = string & { readonly __brand: "ProjectRoot" };
type TargetName = string & { readonly __brand: "TargetName" };
type CommandString = string & { readonly __brand: "CommandString" };

type WorkspaceGraphState =
  | {
      kind: "ready";
      projects: readonly WorkspaceProjectFact[];
      targets: readonly WorkspaceTargetFact[];
    }
  | {
      kind: "refused";
      refusal: WorkspaceGraphRefusal;
    };

type WorkspaceGraphRefusal =
  | { kind: "malformed-graph-json"; message: string }
  | { kind: "nx-read-failure"; message: string; exitCode?: number | null }
  | { kind: "nx-daemon-failure"; message: string };

type WorkspaceProjectFact = {
  kind: "project";
  name: ProjectName;
  root: ProjectRoot;
  sourceRoot: ProjectRoot | null;
  tags: readonly string[];
  targets: readonly TargetName[];
};

type WorkspaceTargetDependency =
  | { kind: "same-project-target"; target: TargetName }
  | { kind: "project-target"; project: ProjectName; target: TargetName }
  | { kind: "workspace-target"; target: TargetName };

type WorkspaceTargetFact =
  | {
      kind: "available-project-target";
      project: ProjectName;
      projectRoot: ProjectRoot;
      target: TargetName;
      command: CommandString;
    }
  | {
      kind: "unavailable-project-target";
      project: ProjectName;
      projectRoot: ProjectRoot;
      target: TargetName;
      reason: "missing-target";
    }
  | {
      kind: "aggregate-workspace-target";
      target: TargetName;
      command: CommandString;
      dependencies: readonly WorkspaceTargetDependency[];
    }
  | {
      kind: "resolved-alias-target";
      project: ProjectName;
      projectRoot: ProjectRoot;
      target: TargetName;
      dependencies: readonly WorkspaceTargetDependency[];
    }
  | {
      kind: "graph-refusal-target";
      reason:
        | "missing-project"
        | "missing-target"
        | "unresolved-alias-dependency"
        | "malformed-graph-json"
        | "nx-read-failure"
        | "nx-daemon-failure";
      project?: ProjectName;
      target?: TargetName;
      dependency?: WorkspaceTargetDependency;
      message: string;
    };

type NxInferredTargetProjection =
  | {
      kind: "run-command-target";
      target: TargetName;
      command: CommandString;
      cache: boolean;
      inputs?: readonly string[];
      dependsOn?: readonly WorkspaceTargetDependency[];
    }
  | {
      kind: "alias-wrapper-target";
      target: TargetName;
      command: "node -e \"\"";
      cache: false;
      outputs: readonly [];
      dependsOn: readonly WorkspaceTargetDependency[];
    }
  | {
      kind: "withheld-target";
      target: TargetName;
      refusal: Extract<WorkspaceTargetFact, { kind: "graph-refusal-target" }>;
    };

type ClassifyTargetProjection =
  | {
      kind: "runnable";
      command: CommandString;
      source:
        | Extract<WorkspaceTargetFact, { kind: "available-project-target" }>
        | Extract<WorkspaceTargetFact, { kind: "aggregate-workspace-target" }>;
    }
  | {
      kind: "non-runnable";
      source:
        | Extract<WorkspaceTargetFact, { kind: "unavailable-project-target" }>
        | Extract<WorkspaceTargetFact, { kind: "graph-refusal-target" }>;
    };
```

Non-negotiable properties:

- A raw `string` may enter only at boundary parsing or compatibility projection.
- A target containing `:` is not automatically a project/target dependency.
- A workspace target is never a project-local target.
- An alias target exists only after every dependency resolves.
- A no-op wrapper is a projection detail, not graph truth.
- Graph read failures and malformed graph JSON are graph states.
- Compatibility DTOs are produced from graph facts, not parallel local logic.
- Every consumer switch over target facts is exhaustive with a `never` check.

## Safe Refactor Moves Required In Packet Artifacts

D3 should specify these moves as the implementation sequence:

1. **Introduce the graph contract boundary.**
   Add the plain ESM contract module consumed by `plugin.js` and TypeScript. It
   owns owner roots, target-name policy, aggregate target declarations, alias
   declarations, and dependency declarations. It does not read Nx metadata.

2. **Introduce the typed graph service.**
   Add the TypeScript Workspace Graph service that reads Nx metadata, parses it
   into `WorkspaceGraphState`, validates declarations against current graph
   truth, and returns `WorkspaceTargetFact` / refusal states.

3. **Replace target string parsing with structured dependency declarations.**
   Delete `dependencyForTarget` and any colon-split dependency construction.
   Dependency normalization becomes a typed parse/validation step owned by the
   graph authority.

4. **Move plugin inference onto graph projections.**
   `plugin.js` consumes the contract/projection data. It emits alias wrapper
   targets only for `resolved-alias-target`; unresolved aliases are withheld or
   refused before wrapper execution.

5. **Demote `nx-projects.ts` to a compatibility adapter.**
   It may preserve existing imports under D0 but may not own target availability
   after D3.

6. **Move classify target construction to graph facts.**
   Replace local `projectTargets()` and `workspaceTargets()` authority with
   projections from `WorkspaceTargetFact`. Keep `requiredTargets`, `targets`,
   `unavailableTargets`, and `proof` only as D0-governed compatibility output.

7. **Move verify target planning to graph facts.**
   Replace hard-coded affected target lists with graph-owned target plan facts
   or explicitly scoped graph projections. D12 still owns final receipt schema,
   but D3 owns whether the target plan is graph-valid.

8. **Add graph refusal behavior before command behavior.**
   Missing project, missing target, unresolved alias dependency, malformed graph
   JSON, Nx read failure, and Nx daemon failure must be facts before they become
   CLI output or command exits.

9. **Delete duplicate graph truth.**
   Remove local owner-root maps, local target maps, and duplicate target
   availability checks once consumers use the graph service. Do not keep shims
   that continue to decide graph truth.

10. **Keep each step compiler-gated.**
    Each slice should pass TypeScript checks and targeted tests before the next
    slice. Refactor steps must not mix behavior changes with unrelated source
    cleanup.

## Validation Gates

D3 validation must be falsifying for the complete domain contract, not only the
known `biome-ci` case.

Required unit gates:

- Workspace Graph parses a representative current Nx graph into project facts.
- Workspace Graph returns all target fact variants:
  - available project target;
  - unavailable project target;
  - aggregate/workspace target;
  - resolved alias target;
  - graph refusal target.
- Missing project alias fixture returns unresolved-alias-dependency refusal.
- Missing target alias fixture returns unresolved-alias-dependency refusal.
- Malformed graph JSON returns malformed-graph-json refusal.
- Nx read failure returns nx-read-failure refusal.
- Nx daemon failure returns nx-daemon-failure refusal.
- Projection tests assert no `alias-wrapper-target` is emitted for unresolved
  dependencies.
- Classify projection tests assert non-runnable facts do not enter
  `requiredTargets`.
- Verify target-plan tests assert graph refusal prevents a false "executed"
  target plan.

Required command gates:

- `bun run --cwd tools/habitat-harness test -- test/lib/workspace-graph.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`
- `nx show project @internal/habitat-harness --json`
- `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`
- `bun run habitat classify tools/habitat-harness/src/plugin.js --json`
- `bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict`
- `bun run openspec:validate`
- `git diff --check`

Required oracle wording:

- `nx show project` must show all alias dependencies as resolved current graph
  dependencies. It must not contain project patterns for nonexistent projects.
- A cache-disabled alias run passes only if the resolved dependency target
  executes or the alias refuses before wrapper execution.
- A successful no-op wrapper without dependency execution is failure.
- Passing OpenSpec validation is artifact-shape evidence only, never D3
  behavior proof.
- `classify --json` must distinguish runnable, unavailable, aggregate, alias,
  and refusal facts either directly or through D0-governed compatibility fields.

## Acceptance Bar

D3 can be accepted through this TypeScript state-space lane only when:

- The complete Workspace Graph Integration owner is named and bounded.
- The boundary explains why one owner protects the complete solution: graph truth
  must not be reconstructed independently by plugin inference, classify,
  verify, root scripts, tests, or downstream packets.
- The discriminated graph state model is normative in design, tasks, specs, and
  validation.
- Alias dependency resolution is structured and validated, never colon-split.
- Duplicate owner-root and target truth are deleted or explicitly compatibility
  adapters with no authority.
- Optional/split classify target facts are compatibility projections from graph
  facts, not a second model.
- No-op wrappers are projection details that cannot hide dependency failures.
- Graph errors/refusals are typed states with consumer behavior.
- D0/D2 blockers are explicit and remain blocking for source implementation.
- Downstream D4/D7/D12 handoffs say what they may consume and what they may not
  infer.

Until those conditions are reflected across the whole packet, the correct
verdict is not accepted.

## Non-Claims

- This review does not authorize source changes.
- This review does not accept D3.
- This review does not accept D0 or D2.
- This review does not claim the current `proposal.md` / `design.md` edits are
  wrong; they move toward the correct full-domain contract.
- This review does not treat `biome-ci` as the scope of D3. It treats it as a
  falsifier for the broader Workspace Graph Integration state-space problem.
