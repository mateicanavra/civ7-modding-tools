# Design: D3 Workspace Graph Boundary

## Frame

D3 is a graph-truth boundary. It collapses the current split state where Nx
target inference, classify output, and verify target planning each carry an
incomplete local authority for project ownership, target identity, target
availability, dependency declarations, resolved dependency relationships,
aggregate workspace gates, and graph read failures.

The design bar is concrete: after D3 implementation, a missing-project alias
cannot be represented as a runnable target, and a no-op wrapper cannot pass when
dependency resolution fails.

## Current Diagnosis

Current code contains three graph authorities:

| Surface | Current authority | Problem |
| --- | --- | --- |
| `$HABITAT_TOOL/src/plugin.js` | `OWNER_ROOTS`, target name constants, `dependencyForTarget`, `aliasRuleTarget` | Mixes same-project target dependencies, explicit project target dependencies, aggregate target dependencies, and colon-parsed alias strings without one validation model; emits `node -e ""` wrappers even when dependency project patterns are unresolved. |
| `$HABITAT_TOOL/src/lib/nx-projects.ts` | `NxProjectGraphMetadataReader`, `findOwningProject`, `projectHasTarget` | Reads resolved project metadata but does not know alias targets, aggregate targets, graph read failures, or plugin-emitted dependencies. |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | `ClassifiedTarget`, `UnavailableClassifiedTarget`, `verifyAffectedTargets`, `projectTargets`, `workspaceTargets` | Builds classify/verify target facts from local arrays and legacy `proof` DTOs rather than the same graph fact model consumed by the plugin. |

Live false-green hazard:

- `plugin.js` sets `biomeCiTargetName = "biome:ci"`.
- `dependencyForTarget("biome:ci")` emits `{ projects: ["biome"], target: "ci" }`.
- `biome` is not an Nx project.
- `aliasRuleTarget` emits `command: 'node -e ""'`.
- A cache-disabled alias run can exit 0 after Nx reports that the dependency
  project pattern matched no project.

The false-green hazard is one symptom of a broader dependency topology problem.
Current `plugin.js` also emits:

- same-project target dependencies such as `{ target: "boundaries" }` for
  `nx-boundaries`;
- explicit project target dependencies such as
  `{ projects: ["@internal/habitat-harness"], target: gritCheckTargetName }`;
- generated-zone aliases that depend on the aggregate `generated:check` target;
- aggregate/workspace targets such as `generated:check` with multiple explicit
  project dependencies.

D3 must model all of these declaration kinds before implementation. Closing
only explicit `{ projects: [...], target }` dependencies would repair
`biome-ci` while leaving same-project dependencies and aggregate target
relationships as another unvalidated path.

## Domain Boundary

Owner: Workspace Graph Integration.

D3 owns:

- graph read status;
- project identity, root, tags, and target list as current Nx metadata;
- owner-root mapping used by Habitat target inference;
- Habitat target-name policy for graph-owned workspace gates;
- rule-target dependency declaration construction, declaration-kind normalization, and
  validation;
- graph target facts consumed by classify and verify;
- graph refusal/error states for missing project, missing target, malformed
  graph JSON, Nx graph read failure, and Nx daemon failure.

D3 does not own:

- D2 rule metadata schema, except consuming implemented graph projections;
- D4 orientation prose or routing UX;
- D7 enforcement aggregation and diagnostic semantics;
- D12 verify receipt schema or handoff wording;
- D10 protected-zone policy or generated-output rules.

## Canonical Module Boundary

D3 introduces the Workspace Graph module:

| File | D3 role |
| --- | --- |
| `$HABITAT_TOOL/src/lib/workspace-graph-contract.js` | Plain ESM contract loaded by the Nx plugin and TypeScript code. Owns owner roots, target-name policy, target dependency declarations, aggregate target declarations, dependency-kind normalization, and dependency validation helpers. |
| `$HABITAT_TOOL/src/lib/workspace-graph.ts` | TypeScript graph service. Reads Nx metadata, validates contract declarations against current graph data, returns target facts/refusals, and exposes classify/verify projections. |
| `$HABITAT_TOOL/src/lib/nx-projects.ts` | Compatibility adapter over `workspace-graph.ts` for existing classify tests/imports until D3 deletes it or confines it to projection-only behavior. It may not own target availability logic after D3. |
| `$HABITAT_TOOL/src/plugin.js` | Nx inference consumer of `workspace-graph-contract.js`. It emits only resolved dependency relationships or graph refusal targets; it may not parse `project:target` strings locally. |
| `$HABITAT_TOOL/src/lib/command-engine.ts` | Classify/verify consumer of `workspace-graph.ts`. It may not hard-code project targets, workspace targets, or verify affected targets outside the graph module. |

The split contract/service shape is intentional: Nx loads `src/plugin.js` as
plain ESM without a TypeScript plugin, while Habitat TypeScript needs typed graph
states. Both sides share the same owner-root and target-alias authority.

## Target Ontology

The D3 ontology uses standard engineering names first and adds Habitat-specific
qualifiers only where the repo-harness domain needs a special invariant.

| Term | Meaning | Owner |
| --- | --- | --- |
| `WorkspaceGraphSnapshot` | A bounded read of current Nx project metadata plus graph read status. | D3 |
| `WorkspaceProject` | Current Nx project identity: project name, root, tags, source root, and declared targets. | D3 |
| `WorkspaceTarget` | A target declared on a current project or a Habitat-owned aggregate workspace gate. | D3 |
| `TargetDependencyDeclaration` | Source declaration of a target relationship before graph resolution. Kinds are same-project target dependency, explicit project target dependency, aggregate/workspace dependency, and multi-dependency target relationship. | D3 |
| `TargetDependency` | Resolved relationship from one target/alias to the target that must run or resolve first. | D3 |
| `TargetAlias` | Habitat rule target that delegates to a resolved `TargetDependency`. It is not a command success claim. | D3 |
| `GraphRefusal` | Refusal to emit or treat a graph-backed target as runnable because graph facts are missing or unreadable. | D3 |
| `ClassifyTargetProjection` | D0-compatible classify output projected from D3 target states. | D3 with D0 compatibility rows |
| `CheckInvocationSurface` | Nx-inferred `habitat:check` or `habitat:rule:*` surface that invokes check through graph-owned targets. | D3 graph surface, D7 check semantics |
| `VerifyTargetPlan` | Graph-derived target plan consumed by verify before D12 records handoff receipt fields. | D3 target plan, D12 receipt |

`TargetDependencyDeclaration` is the source topology model. It is not a parsed
string. `TargetDependency` is the resolved relationship after the declaration
has been normalized against the current `WorkspaceGraphSnapshot`. A
`TargetAlias` cannot exist as runnable unless every dependency declaration
resolves.

## Target State Model

The implementation SHALL use a discriminated state model equivalent to this:

```ts
type WorkspaceGraphReadState =
  | { kind: "graph-ready"; snapshot: WorkspaceGraphSnapshot }
  | { kind: "malformed-graph-json"; message: string }
  | { kind: "nx-read-failure"; message: string; exitCode?: number | null }
  | { kind: "nx-daemon-failure"; message: string };

type WorkspaceTargetState =
  | {
      kind: "available-project-target";
      project: string;
      projectRoot: string;
      target: string;
      command: string;
    }
  | {
      kind: "unavailable-project-target";
      project: string;
      projectRoot: string;
      target: string;
      reason: "missing-target";
    }
  | {
      kind: "alias-target";
      project: string;
      projectRoot: string;
      target: string;
      dependency: TargetDependencyResolution;
    }
  | {
      kind: "aggregate-workspace-target";
      target: string;
      command: string;
      dependencies: readonly TargetDependencyResolution[];
    }
  | {
      kind: "graph-refusal";
      reason:
        | "missing-project"
        | "missing-target"
        | "unresolved-alias-dependency"
        | "malformed-graph-json"
        | "nx-read-failure"
        | "nx-daemon-failure";
      target?: string;
      project?: string;
      message: string;
    };

type TargetDependencyResolution =
  | {
      kind: "resolved-target-dependency";
      declaration: TargetDependencyDeclaration;
      project: string;
      target: string;
    }
  | {
      kind: "unresolved-target-dependency";
      reason: "missing-project" | "missing-target";
      declaration: TargetDependencyDeclaration;
      project: string;
      target: string;
    };

type TargetDependencyDeclaration =
  | {
      kind: "same-project-target-dependency";
      target: string;
    }
  | {
      kind: "explicit-project-target-dependency";
      project: string;
      target: string;
    }
  | {
      kind: "aggregate-workspace-dependency";
      target: string;
      dependencies: readonly TargetDependencyDeclaration[];
    }
  | {
      kind: "multi-dependency-target-relationship";
      target: string;
      dependencies: readonly TargetDependencyDeclaration[];
    };
```

Constraints:

- `alias-target` can exist only when its dependency declarations resolve in the
  current graph.
- A `same-project-target-dependency` MUST resolve by using the declaring
  project/root as the owning project. It may not remain projectless after
  normalization, and missing same-project targets produce graph refusal.
- An `explicit-project-target-dependency` MUST resolve the named project and
  target from `WorkspaceGraphSnapshot`.
- An `aggregate-workspace-dependency` or
  `multi-dependency-target-relationship` MUST resolve every child declaration;
  Habitat withholds runnable state unless every child declaration resolves.
- An unresolved alias dependency declaration is `graph-refusal`, not a runnable
  target.
- `node -e ""` is not graph-domain state. It is an Nx inferred-target projection
  detail permitted only after D3 has resolved every dependency declaration.
- Aggregate/workspace targets are not project-local targets.
- Existing `ClassifiedTarget` / `UnavailableClassifiedTarget` are compatibility
  DTOs only. D3 implementation may preserve their JSON shape under D0, but their
  construction must come from `WorkspaceTargetState`.
- Legacy `proof` fields in classify target output are compatibility fields. New
  target-domain code should use graph facts, receipts, diagnostics, and command
  outcomes rather than product-level proof/evidence types.

## Consumer Contracts

| Consumer | Required D3 projection |
| --- | --- |
| `plugin.js` | Owner roots, graph-owned target names, target dependency declarations, aggregate target declarations, validation that every dependency declaration kind resolves before emitting wrapper targets. |
| `classifyPath` / diff classify | `ClassifyTargetProjection` from `WorkspaceTargetState[]` for owning project targets, unavailable targets, aggregate targets, and graph refusals. Classify JSON compatibility is handled through D0 rows. |
| `verify` | `VerifyTargetPlan` derived from graph-owned aggregate/workspace target states. D3 may expose graph-read refusal states; D12 owns final receipt fields. |
| `check` | No direct graph-service read for rule evaluation. D3 controls only Nx inferred `habitat:check` and `habitat:rule:*` surfaces that run check through Nx. |

Nx inferred target projection:

- `NxInferredTargetDefinition` is the projection that may contain a no-op
  wrapper command for an alias.
- The projection is valid only when its source `alias-target` has a
  `resolved-target-dependency`.
- A missing project, missing target, malformed target reference, graph read
  failure, or daemon failure produces `GraphRefusal` and no runnable alias
  wrapper.

## Plugin/Graph Validation Data Flow

D3 uses one validation path for plugin target inference, classify, and verify:

1. `workspace-graph-contract.js` declares owner roots, graph-owned target names,
   aggregate workspace targets, and structured dependency declarations. It is
   declarative plus validation-capable: its validation helpers accept a current
   project/target inventory plus the declaring project/root and return resolved
   dependency relationships or graph refusals.
2. `workspace-graph.ts` reads the current Nx graph, converts it into a
   `WorkspaceGraphSnapshot`, and calls the same contract validation helpers used
   by the plugin path.
3. `plugin.js` builds Nx inferred targets only from validated contract output.
   A resolved `alias-target` may project to an Nx target with a no-op wrapper and
   `dependsOn`. An unresolved alias is withheld from runnable alias output and
   represented as a graph refusal for classify/verify surfaces.
4. `command-engine.ts` consumes `workspace-graph.ts` projections. It may render
   D0-compatible classify/verify output, but it may not re-validate aliases or
   reconstruct graph truth from local arrays.

Representation decision:

- Unresolved aliases are non-runnable graph refusals.
- D3 does not emit a passing alias wrapper for unresolved dependencies.
- If implementation needs a command-facing failure for an unresolved alias, it
  must be a failing D3 graph-refusal target, not `node -e ""`, and must be
  covered by D0 compatibility rows before it becomes public behavior.

This data flow protects the complete solution because every consumer receives
target availability and dependency truth from the same contract/snapshot pair.
No consumer gets to reinterpret a target string after the graph authority has
decided.

## Dependency Declaration Topology

D3 recognizes these dependency declaration kinds:

| Kind | Current example | Resolution rule | Failure state |
| --- | --- | --- | --- |
| `same-project-target-dependency` | `nx-boundaries` alias uses `{ target: "boundaries" }`. | Normalize to the project that owns the alias target, then require that project to declare `boundaries`. | `graph-refusal` with `missing-target` on the declaring project. |
| `explicit-project-target-dependency` | Grit aliases use `{ projects: ["@internal/habitat-harness"], target: gritCheckTargetName }`. The false `biome-ci` path currently uses `{ projects: ["biome"], target: "ci" }`. | Resolve the named project in `WorkspaceGraphSnapshot`, then require the named target on that project. | `graph-refusal` with `missing-project` or `missing-target`. |
| `aggregate-workspace-dependency` | `generated:check` represents an aggregate/generated-zone gate. | Resolve the aggregate target as a graph-owned workspace target and resolve all declared child dependencies before it becomes available. | `graph-refusal` if the aggregate declaration is unknown or any child dependency is unresolved. |
| `multi-dependency-target-relationship` | `generated:check` and other broad gates can depend on multiple explicit project target declarations. | Resolve every child declaration and preserve all resolved relationships; withhold runnable state unless every child declaration resolves. | `graph-refusal` identifying every missing child dependency. |

`dependencyForTarget` is not a valid post-D3 authority. The implementation may
use a helper to build declarations, but it must return one of the declaration
kinds above and must validate against `WorkspaceGraphSnapshot` before any Nx
`dependsOn` projection is emitted.

## D0/D2 Dependency Inventory

| Dependency | D3 design use | Source implementation blocker |
| --- | --- | --- |
| D0 command surface inventory | D3 identifies public/durable surfaces: classify JSON, verify output/target plan, Nx inferred targets, root scripts, package plugin export, docs/examples. | Concrete D0 matrix rows are required before source implementation changes any D3-touched public/durable surface. |
| D2 rule graph projections | D3 consumes accepted design terms for `ruleGraphFacts` and registry graph declarations. | D2 implementation facts must exist before D3 source code can rely on live graph projections from the registry. |

D3 may be accepted for design/specification after review, but source
implementation remains blocked until these live prerequisites are satisfied.

## Public Compatibility Map

| Surface | D3 effect | Compatibility handling |
| --- | --- | --- |
| `habitat classify --json` target fields | May render `ClassifyTargetProjection` from D3 states and preserve legacy target DTO fields. | D0 rows decide preserve/additive/version/facade/refuse behavior before source edits. |
| Legacy classify `proof` field | Compatibility DTO only, projected from graph state if preserved. | Preserve or version only through D0; do not use as target-domain language in new code. |
| `habitat verify` target plan/output | May derive target plan from `VerifyTargetPlan`. | D0 rows and D12 receipt boundary required before public schema changes. |
| Nx inferred target names | `habitat:check`, `habitat:rule:*`, aggregate workspace targets, dependency declarations, and resolved dependency relationships come from Workspace Graph contract. | D0 rows required before public target behavior/name changes. |
| Root scripts invoking graph-owned targets | Scripts may inherit corrected dependencies. | D0 rows required before script behavior changes. |
| Package export `@internal/habitat-harness/plugin` | Plugin may import Workspace Graph contract helpers. | D0 rows required if export shape changes; internal imports stay within approved write set. |
| Docs/examples | May show graph refusal or unavailable target states. | D0 rows required when public examples change accepted command behavior. |

## Approved Implementation Write Set

D3 source implementation may touch only:

- `$HABITAT_TOOL/src/lib/workspace-graph-contract.js`
- `$HABITAT_TOOL/src/lib/workspace-graph.ts`
- `$HABITAT_TOOL/src/lib/nx-projects.ts`
- `$HABITAT_TOOL/src/plugin.js`
- `$HABITAT_TOOL/src/lib/command-engine.ts`
- `$HABITAT_TOOL/src/commands/graph.ts`
- `$HABITAT_TOOL/src/commands/verify.ts` only where it delegates to command-engine verify behavior
- `$HABITAT_TOOL/src/index.ts` only for public export compatibility explicitly covered by D0
- `$HABITAT_TOOL/test/lib/workspace-graph.test.ts`
- `$HABITAT_TOOL/test/lib/enforcement-surface.test.ts`
- `$HABITAT_TOOL/test/lib/classify.test.ts`
- `$HABITAT_TOOL/test/commands/habitat-commands.test.ts`
- adjacent Habitat docs/examples only when D0 rows cover the public guidance

Protected paths:

- `$HABITAT_TOOL/src/rules/rules.json` until D2 implementation facts
  authorize graph projection changes.
- D4, D7, and D12 OpenSpec packets except downstream ledger/index dependency
  notes.
- generated output, lockfiles, and unrelated Civ/MapGen domains.

## Safe Refactor Sequence

1. Add the Workspace Graph contract module with owner roots, target-name policy,
   aggregate target declarations, and explicit target dependency declarations
   for every declaration kind.
2. Add the typed Workspace Graph service and tests for all target/refusal states.
3. Migrate `plugin.js` to consume dependency declarations and reject or withhold
   unresolved aliases before emitting wrapper targets.
4. Migrate `nx-projects.ts` to become a graph-service adapter rather than an
   independent target-availability owner.
5. Migrate classify target construction in `command-engine.ts` from local
   `projectTargets`/`workspaceTargets` arrays to `WorkspaceTargetFact`.
6. Migrate verify target planning from hard-coded target names to D3 graph facts
   while preserving D12-owned receipt semantics.
7. Delete colon-split dependency parsing and duplicate owner-root maps.
8. Run falsifying validation after each logical slice.

## Validation Oracle

D3 validation is falsifying only if it can fail the current false-green state:

- A full-domain graph inventory oracle enumerates every Habitat-owned graph
  surface from the Workspace Graph module: owner roots, aggregate/workspace
  targets, `habitat:check` targets, every `habitat:rule:*` alias target, every
  dependency declaration kind, every resolved dependency relationship, every
  unavailable project target emitted by classify, and every graph refusal bad
  case. Any Habitat-owned target outside that inventory is a D3 failure.
- A unit fixture injects a missing-project alias and expects
  `graph-refusal: unresolved-alias-dependency`.
- Unit fixtures cover same-project dependency resolution and same-project
  missing-target refusal for the `nx-boundaries`/`boundaries` shape.
- Unit fixtures cover aggregate/multi-dependency target resolution and child
  dependency failure for the `generated:check` shape.
- Unit fixtures cover scoped project names and multi-colon target names so the
  graph contract cannot regress to first-colon string splitting.
- `nx show project @internal/habitat-harness --json` shows
  `habitat:rule:biome-ci` depends on the canonical Habitat Biome target owned by
  the real project, not `projects: ["biome"], target: "ci"`.
- `NX_DAEMON=false nx run @internal/habitat-harness:habitat:rule:biome-ci --skip-nx-cache`
  either records execution of the canonical Biome dependency or fails before
  wrapper execution. A clean `node -e ""` success without dependency execution is
  a failed D3 gate.
- Classify JSON distinguishes available project targets, unavailable project
  targets, aggregate/workspace targets, and graph refusals.
- Unit tests cover malformed graph JSON, Nx read failure, and Nx daemon failure
  as graph refusal states.

## Downstream Handoffs

| Downstream | D3 fact allowed after design acceptance | Non-claim |
| --- | --- | --- |
| D4 Orientation And Routing | May design orientation against project ownership, target availability, unavailable target, and graph refusal facts. | D4 may not infer target truth or alias validity. |
| D7 Structural Enforcement Pipeline | May design execution planning against available targets, aggregate targets, dependency declarations, and resolved dependency relationships. | D7 may not treat a wrapper exit 0 as target success without D3 dependency resolution. |
| D12 Verify Handoff Receipt | May design receipt fields around D3 graph-read status and verify target plan facts. | D12 owns receipt schema, not graph construction. |

## Rejected Alternatives

- Fix only the `biome-ci` special case. Rejected because it leaves string-parsed
  dependency declarations open for the next rule.
- Keep plugin and classify graph truth separate. Rejected because this is the
  state-space split that produced the false green.
- Let Nx warnings be enough. Rejected because the current wrapper can still exit
  0 after an unresolved dependency warning.
