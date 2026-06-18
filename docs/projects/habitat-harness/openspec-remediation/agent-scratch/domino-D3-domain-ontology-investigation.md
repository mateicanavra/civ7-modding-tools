# D3 Domain/Ontology Investigation: Workspace Graph Boundary

## Review Frame

Objective: adversarially review the D3 Workspace Graph Boundary domain model and
naming before packet acceptance. This is a design/specification review only; no
source implementation was changed.

Current D3 artifacts reviewed:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/workstream/*.md`

The worktree currently has an uncommitted repair in `proposal.md`. This review
treats that repair as part of the current local D3 design surface while leaving
it untouched. The repair moves the proposal toward the right ontology, but the
rest of the packet has not caught up. Historical scratch evidence is provenance
only; it is not current guidance and does not lower the D3 acceptance bar.

## Framing Correction

D3 is not a partial repair around `habitat:rule:biome-ci`. The `biome-ci`
false-green is the most concrete falsifier for the domain problem, not the
domain boundary. D3 acceptance requires the complete Workspace Graph Integration
authority contract for all graph consumers and target states in scope:

- current Nx project graph reads;
- repo path to owning project resolution;
- project target availability;
- Habitat workspace/aggregate target definition;
- rule-target alias dependency declaration and resolution;
- graph read and graph resolution refusals;
- classify, check/Nx inference, and verify consumer projections.

The exact domain owner should be `Workspace Graph Integration`. That boundary is
valid only if it protects the complete solution by centralizing resolved graph
truth and target-resolution authority. Orientation/routing may present graph
facts, D2 may declare registry graph intent, D7 may execute/check structural
pipelines, and D12 may record verify handoff receipts, but none of those domains
may construct owner roots, parse target references, decide alias dependencies,
or decide whether a target is resolvable in the current Nx graph.

## Verdict

Not accepted.

D3 now names the right falsifier in the repaired proposal: the live
`habitat:rule:biome-ci` false-green alias where a `dependsOn` project pattern
matches no project and the no-op wrapper can still exit 0. That example proves
the boundary is currently unsafe, but fixing that single alias would not satisfy
D3.

The current D3 design is still not acceptable because the accepted ontology is
not operationalized across the packet. The design/tasks/spec remain generic
enough that an implementation agent would still have to invent the graph entity
model, relationship semantics, failure taxonomy, and classify/check/verify
consumer projections while coding. That violates the remediation frame and
keeps the same implementation-time design trap that D3 is supposed to remove.

## What The D3 Ontology Must Do

D3 is not just "read the Nx graph." Its competency questions are:

1. For a repo-relative path, which Nx project owns it according to the current
   graph?
2. For a project, which target names are currently resolvable Nx targets?
3. For a Habitat rule target alias, which concrete project target does it
   depend on, and is that dependency resolved before the wrapper can execute?
4. Which targets are workspace/aggregate gates rather than project-local
   targets?
5. When graph truth cannot be established, what refusal/failure fact is emitted:
   missing project, missing target, malformed graph JSON, Nx graph read/daemon
   failure, or malformed registry graph declaration?
6. Which projection is each consumer allowed to use: classify target listing,
   check/Nx inferred target definition, or verify target plan/receipt handoff?

The ontology therefore needs a complete bounded core, not a generic "graph fact"
bucket and not a one-off alias fix:

- Raw source evidence: Nx project graph read, `nx show project`, current plugin
  output, D2 `ruleGraphFacts`.
- Accepted Workspace Graph facts: project ownership, project target resolution,
  workspace/aggregate target, alias dependency resolution, graph refusal.
- Consumer projections: classify target facts, Nx inferred target definitions,
  verify target plan facts.
- Non-truth records: validation evidence, command output, future D12 receipts.

The current repaired proposal gestures at this split. `design.md`, `tasks.md`,
and `spec.md` still do not commit to it.

## P1 Findings

### P1-1: The complete Workspace Graph ontology exists only as proposal-level intent

The repaired `proposal.md` names the live false-green, a closed graph fact model,
the Workspace Graph module as owner, direct consumers, stop conditions, and
falsifying validation. Those are the right semantic moves.

The authoritative design/spec/task artifacts still say only:

- "Define graph metadata ownership and target alias policy."
- "Separate resolved project metadata from Habitat structural gates."
- "Make target availability a graph fact consumed by classify and verify."

Those are not implementation-ready semantic commitments. They are placeholders
for the exact design D3 must settle before implementation.

This is a P1 because OpenSpec acceptance is based on the complete packet, not on
a single proposal-level repair. An executor could satisfy the current
`design.md` and `tasks.md` by adding a helper around current graph reads or by
special-casing `biome-ci`, while leaving the Workspace Graph Integration
authority contract incomplete.

Required repair:

- Propagate the proposal's falsifier, domain boundary, closed fact model, consumer
  scope, stop conditions, and falsifying gates into `design.md`, `tasks.md`,
  `specs/habitat-harness/spec.md`, the phase record, and the closure checklist.
- Replace generic task language with concrete semantic tasks: define the graph
  contract, resolve alias dependencies structurally, expose classify facts,
  expose verify target plan/refusal facts, and reject unresolved alias wrappers
  before command execution.

### P1-2: `graph fact` is still too broad to be the accepted ontology

The phrase "graph fact" is useful only if D3 defines the layers. Right now it can
mean any of these:

- raw Nx graph node/target metadata;
- D2 registry graph declarations such as `GraphTargetReference`;
- derived Workspace Graph truth;
- classify JSON output;
- verify target plan output;
- validation evidence from command runs.

Those are different semantic commitments. Raw evidence is not accepted truth.
Registry declaration is not resolution. Resolution is not execution. Classify
output is not a runnable command proof.

Current code shows why the distinction matters. `ClassifiedTarget.proof` in
`tools/habitat-harness/src/lib/command-engine.ts` lines 196-204 currently mixes
target listing with a proof-shaped field. `UnavailableClassifiedTarget` at
lines 206-211 has only `missing-nx-target`. `plugin.js` lines 182-197 turns a
target-name string into `dependsOn`. These are compatibility shapes and
present-state evidence, not an accepted graph ontology.

Required repair:

- Define source-layer names and accepted-layer names separately.
- Suggested accepted ontology:
  - `WorkspaceGraphRead`: raw current Nx graph read result or read failure.
  - `ProjectOwnership`: repo path/project-root ownership fact.
  - `ProjectTargetResolution`: available or unavailable project target.
  - `WorkspaceGateTarget`: Habitat/root-owned workspace gate, not project-local.
  - `AliasDependencyResolution`: alias target plus resolved dependency target or
    a refusal reason.
  - `GraphRefusal`: closed refusal union for graph-read and graph-resolution
    failures.
  - Consumer projections: `ClassifyTargetFact`, `NxInferredTargetDefinition`,
    and `VerifyTargetPlanFact` or equivalent names.
- State explicitly that D2 `ruleGraphFacts` are declarations consumed by D3, not
  resolved graph truth.

### P1-3: Alias dependency is one relationship entity in the full graph contract, not a target string

D3's most visible failure is a relationship failure: `habitat:rule:biome-ci` declares an
alias target whose dependency is interpreted as project `biome`, target `ci`,
but `biome` is not a project. The invalid state survives because the current
model treats target names and target references as strings and then parses them
late.

That relationship model must generalize across every Habitat rule alias and
workspace target. The accepted contract cannot be "make the Biome alias point at
the right target"; it must make unresolved alias dependencies unrepresentable or
refused for all aliases.

`plugin.js` lines 182-188 implement exactly the unsafe ontology: split on the
first colon, treat the prefix as a project, and treat the suffix as a target.
That is invalid for scoped npm package project names such as
`@swooper/mapgen-core`, for multi-colon target names, and for any alias whose
real dependency is a workspace-owned target on `@internal/habitat-harness`.

The current D3 packet says "alias target with resolved dependency" in the
proposal, but it does not define relationship identity, endpoints, direction,
or lifecycle:

- What is the alias target's identity?
- What is the declared dependency?
- Which project/target resolution makes it executable?
- Which failure makes wrapper creation or execution forbidden?
- Is a no-op wrapper ever allowed without dependency execution evidence?

Required repair:

- Model alias dependency as a first-class relation:
  - source endpoint: alias target identity, owning project, rule id;
  - target endpoint: structured project target reference;
  - resolution state: resolved, missing project, missing target, malformed
    declaration, graph unavailable;
  - execution permission: wrapper-emittable only when dependency is resolved.
- Ban colon-derived dependency construction as target authority. A colon string
  may be a compatibility input only before a parser produces a structured
  reference or refusal.
- Add spec scenarios for `biome-ci`, a scoped project name target reference, a
  multi-colon target name, and an injected missing-project alias.

### P1-4: Refusal/error semantics are not closed enough to prevent false green

The source packet requires D3 to distinguish Nx daemon errors, malformed graph
JSON, and missing target/project states. The current proposal says "graph
refusal states"; `design.md`, `tasks.md`, and `spec.md` do not define them.

This matters because false green is not only "target missing." It is any path
where graph truth is unavailable but the product emits a runnable command or a
successful wrapper anyway. The closed D3 refusal taxonomy must distinguish:

- `nx-graph-read-failed`: Nx graph command/API could not provide graph data.
- `nx-daemon-failed` or a chosen broader `nx-graph-service-failed`: Nx daemon or
  graph service failed in a way that prevents trusted metadata.
- `malformed-graph-json`: graph command emitted JSON that cannot be parsed or
  does not have the expected shape.
- `missing-project`: a referenced project does not exist in current graph.
- `missing-target`: referenced project exists but target does not.
- `malformed-target-reference`: registry/plugin input cannot be interpreted as a
  structured target reference.
- `unsupported-workspace-gate`: a workspace/root gate is being projected as a
  project-local target.

Required repair:

- Define the closed refusal union in D3, with a rule for which failures are
  command failures, which are classify unavailable facts, and which are verify
  target-plan refusals.
- Add normative spec scenarios for malformed graph JSON and graph read/daemon
  failure, not just missing target.
- State that graph read/refusal facts are not validation evidence and not D12
  receipt schema; they are graph-domain facts consumed by later projections.

### P1-5: Classify/check/verify consumer roles are named but not semantically separated

The repaired proposal improves consumer scope, but the rest of the packet still
does not make those roles operational.

The three consumers need different projections:

- `classify` answers "what applies here?" It may show available targets,
  unavailable targets, workspace gates, and graph refusals. It must not imply
  execution success.
- `check` should not directly read graph truth in D3 unless D3 explicitly says
  so. It consumes D3 through Nx inferred `habitat:check` and `habitat:rule:*`
  target surfaces.
- `verify` needs a target plan/refusal surface for affected Nx targets. D12 may
  record the receipt later, but D3 must decide what verify can rely on.

Current code has separate target vocabularies: `Classification.targets`,
`requiredTargets`, `unavailableTargets`, `verifyAffectedTargets`, and plugin
targets. D3 must decide whether these become projections of one Workspace Graph
contract or compatibility outputs over a new internal contract.

Required repair:

- Add a consumer projection table to `design.md`, not only `proposal.md`.
- For each consumer, state input, output, allowed graph facts, forbidden graph
  facts, and non-claims.
- Add spec scenarios that assert `classify` does not emit an executable command
  for unresolved targets, `check` obtains aliases only through resolved Nx
  target inference, and `verify` refuses or records unavailable target facts
  without claiming D12 receipt semantics.

## P2 Findings

### P2-1: `available target`, `unavailable target`, `alias target`, and `aggregate target` need sharper names

The source packet's five states are directionally right, but the terms are still
too close to UI labels. D3 should name the invariant each state carries:

- `available-project-target`: project exists and target exists in current Nx
  graph.
- `unavailable-project-target`: project exists but target does not, or target
  is withheld with a specific reason.
- `alias-target`: an inferred Habitat target whose command is only a wrapper
  around a resolved dependency.
- `aggregate-workspace-target`: a Habitat/root workspace gate that is not
  project-local and should not be reported as a project target.
- `graph-refusal`: graph truth could not be established, or a graph declaration
  cannot be safely resolved.

Avoid bare `available` because availability may mean "present in Nx metadata,"
"safe to suggest," "safe to execute," or "last command passed." D3 owns the
first two only; execution success belongs elsewhere.

### P2-2: `Workspace Graph Boundary` is a good packet label, but the owner boundary must be exact

The packet alternates among "Workspace Graph Boundary," "Workspace Graph
Integration," "graph metadata ownership," "graph functions," and "Workspace
Graph module." Those can coexist only if the packet defines which is the domain
and which is the implementation boundary.

Recommended disposition:

- Domain: Workspace Graph Integration.
- OpenSpec packet/change: D3 Workspace Graph Boundary.
- Implementation/service boundary: Workspace Graph service or Workspace Graph
  module.
- Avoid "graph metadata ownership" as the central name; it sounds like a data
  field owner and undersells target resolution/refusal behavior.

Why this boundary protects the complete solution: it is the only boundary that
can combine D2 declared graph intent with live Nx graph reads and produce one
resolved truth for plugin inference, classify output, and verify target planning.
Splitting that authority lets aliases, target lists, owner roots, and graph
errors diverge again.

### P2-3: `proof` and `evidence` need a local D3 disposition table

The remediation frame already says proof/evidence-shaped names are suspect.
D3's source packet uses "proof commands," "proof classes," and "dependency
execution evidence." Current code has `ClassifiedTarget.proof` and `VerifyProof`.

D3 should not silently inherit those terms into graph product code. The right
D3 terms are closer to:

- graph fact;
- target resolution;
- dependency execution record;
- command outcome;
- validation evidence;
- receipt/handoff record, only where D1/D12 own it.

Required repair:

- Add a D3-local term disposition table:
  - `ClassifiedTarget.proof`: compatibility field; target replacement is
    `source` or `resolution` only if D0 permits JSON change.
  - `VerifyProof`: out of D3 naming authority; D12 owns receipt/handoff naming.
  - "dependency execution evidence": validation gate wording, not product type
    name.
  - "graph fact": accepted only with closed variants and source/consumer layer
    separation.

### P2-4: D2 dependency is semantically important but D3 does not yet consume it precisely

D2 already defines `ruleGraphFacts` and `GraphTargetReference` as the registry
projection D3 may consume. D3 should not rediscover those terms or make the rule
registry the graph authority.

Required repair:

- In D3 design, state that D2 supplies declared graph intent and D3 supplies
  resolved graph truth.
- Name the required handoff from D2 to D3:
  - owner/root declaration;
  - rule target alias policy;
  - structured dependency target;
  - malformed graph declaration failure.
- Keep source implementation blocked until D2's implementation provides live
  graph projections and D0 covers public target metadata changes.

### P2-5: Validation names still risk confusing command success with ontology acceptance

The repaired proposal correctly says the alias run passes only if dependency
execution is recorded or the command fails before wrapper execution. The rest of
the packet still lists smoke commands without expected assertions.

Required repair:

- For each validation gate, state the expected status and the semantic oracle:
  graph fact emitted, alias dependency resolved, wrapper refused, classify JSON
  compatibility preserved, or graph refusal surfaced.
- Avoid "proof" as the gate label unless it means external validation evidence,
  not a product type.

## Required Repairs Before Acceptance

1. Make `design.md` the canonical ontology artifact, not `proposal.md`.
2. Define the closed Workspace Graph fact model and the separate consumer
   projections.
3. Model alias dependency as a relationship entity with structured endpoints,
   resolution state, and wrapper-execution permission.
4. Define the graph refusal/error taxonomy, including malformed graph JSON and
   Nx graph read/daemon failure.
5. Add classify/check/verify projection semantics and non-claims to the design
   and spec.
6. Add a local term disposition table for proof/evidence/current DTO names.
7. Make D2 handoff exact: D2 declared graph facts in, D3 resolved graph truth
   out.
8. Expand `tasks.md` from design placeholders into implementation-ready steps
   that name the graph contract, module boundary, consumer projections, tests,
   and validation oracles.
9. Expand `spec.md` beyond two scenarios to include alias dependency resolution,
   unresolved alias refusal, workspace gate distinction, malformed graph input,
   Nx graph read failure, and consumer-specific non-claims.
10. Update the phase record, downstream ledger, and closure checklist so an
    implementation agent cannot treat the repaired proposal alone, the
    `biome-ci` fix alone, or historical scratch evidence as acceptance.

## Acceptance Bar

D3 can be accepted when the packet can answer these without implementation-time
judgment:

- What is the single Workspace Graph owner boundary?
- Why does that exact boundary protect the complete Workspace Graph Integration
  problem rather than only the current `biome-ci` falsifier?
- Which facts are raw Nx evidence, D2 declarations, accepted graph truth,
  validation evidence, and consumer projections?
- What exact states can a target resolution inhabit?
- What exact states can an alias dependency resolution inhabit?
- Which unresolved states refuse wrapper execution before `node -e ""`?
- Which graph failures are shown to classify, verify, or command output?
- Which current proof/evidence names are compatibility-only, retained, renamed,
  or deferred?
- Which D4/D7/D12 assumptions are stable after D3, and which remain non-claims?

Until those are answered in the OpenSpec artifacts, the current D3 design is not
accepted.

## Skills Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- Every `references/*.md` and both assets under `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/`
