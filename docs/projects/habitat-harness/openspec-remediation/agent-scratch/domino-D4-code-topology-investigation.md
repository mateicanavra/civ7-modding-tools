# D4 Code Topology Investigation

## Verdict

D4 is not implementation-ready from the current OpenSpec packet. The source topology is clear enough to repair the packet, but source implementation must stay blocked until D4 records the explicit orientation state model, D0 public-surface rows, and the D2/D3 projection dependencies it will consume.

The current classify surface is an optional-heavy compatibility DTO exported from `command-engine.ts` and re-exported from `index.ts`. It mixes path, workspace fallback, diff, rule scope, target availability, and human guidance in shapes that can represent false states. A D4 implementation should not add a shallow `kind?: string` to this model; it should define a new versioned orientation result whose top-level state is exactly one scenario variant, then project legacy fields only through a D0-covered compatibility facade.

## Sources Read

Mandatory anchoring read in full:

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`

D4 and dependency evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d3-workspace-graph-boundary/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/downstream-realignment-ledger.md`

Current code surfaces:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-commands.test.ts`

Commands run:

- `git status --short --branch`
- `bun run habitat classify tools/habitat-harness/src/plugin.js`
- `bun run habitat classify $'not a diff\njust text'`
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts`

Observed command state:

- Worktree is clean on `codex/deep-habitat-openspec-remediation`; branch is ahead of `origin/main`.
- `bun run habitat classify tools/habitat-harness/src/plugin.js` exits 0 and emits the current path JSON shape.
- `bun run habitat classify $'not a diff\njust text'` exits 0 and emits `{"schemaVersion":1,"inputKind":"diff","paths":[]}`.
- `bun run --cwd tools/habitat-harness test -- test/lib/classify.test.ts` passes 20 tests.

## Current Classify Surface Map

### DTOs

`Classification` is declared in `/tools/habitat-harness/src/lib/command-engine.ts` lines 169-180:

- Required fields: `path`, `project`.
- Optional fields: `projectRoot`, `tags`, `rulesInScope`, `scopedRules`, `requiredTargets`, `targets`, `unavailableTargets`, `note`.
- Current use: path and workspace fallback result shape. It is also nested inside diff output.
- State-space problem: a single interface can represent project-owned path, workspace path, unresolved owner, graph-error-like missing facts, and partially populated target/rule state. `project: null` plus optional `targets`, optional `rulesInScope`, and optional `note` is a convention, not a type-level scenario.

`ScopedRule` and `RuleScopeKind` are declared in lines 182-194:

- `RuleScopeKind`: `exact-path`, `project-owner`, `workspace-gate`, `unresolved-metadata`.
- `ScopedRule`: `ruleId`, `ownerTool`, `ownerProject`, `scope`, `reason`.
- Current use: `rulesInScopeForPath()` builds these from whole `HarnessRule` rows and prose `scope`.
- State-space problem: `scope` is a string state derived from local D4 logic, not D2 `ruleRoutingFacts`; `reason` prose is doing authority work.

`ClassifiedTarget` is declared in lines 196-204:

- Fields: `command`, `owner`, `project`, `target`, `proof`.
- `owner` values are `project`, `workspace`, `habitat`.
- `proof` values are `nx-project-graph` or `habitat-owned`.
- Current use: project target and workspace lint command output.
- State-space problem: graph truth is encoded as command strings and a legacy `proof` compatibility field. D3 says existing `ClassifiedTarget` is compatibility DTO only and must be projected from `WorkspaceTargetState`, not constructed locally.

`UnavailableClassifiedTarget` is declared in lines 206-211:

- Fields: `owner: "project"`, `project`, `target`, `reason: "missing-nx-target"`.
- Current use: missing `check`/`test` target from Nx metadata.
- State-space problem: the reason vocabulary cannot express D3 graph refusals such as missing project, unresolved alias dependency, malformed graph JSON, Nx read failure, or daemon failure.

`DiffClassification` is declared in lines 213-217:

- Fields: `schemaVersion: 1`, `inputKind: "diff"`, `paths: Classification[]`.
- Current use: literal diff and `.diff`/`.patch` input.
- State-space problem: only diff output is versioned. A malformed/pathless diff has the same top-level success state with `paths: []`.

### Exports

`/tools/habitat-harness/src/index.ts` re-exports these classify DTOs and functions:

- Type exports lines 20-28: `Classification`, `ClassifiedTarget`, `ClassifyOptions`, `DiffClassification`, `RuleScopeKind`, `ScopedRule`, `UnavailableClassifiedTarget`.
- Function exports lines 29-44: `classifyPath`, `classifyTarget`, plus other broad command-engine functions.
- Package export path: `/tools/habitat-harness/package.json` exports `"."` as `./src/index.ts`, so these names are package-export public-surface candidates until D0 classifies them.

This means D4 cannot silently rename, remove, narrow, or replace these types/functions in source. It needs D0 rows for package exports and command JSON before code changes.

### Command Behavior

`/tools/habitat-harness/src/commands/classify.ts` is a thin Oclif adapter:

- Args lines 11-17 define one required `path` argument described as path, absolute path, literal diff, or `.diff/.patch`.
- Runtime lines 19-22 logs `JSON.stringify(await classifyTarget(args.path), null, 2)`.
- There is no `--json` flag because JSON is the only current output.
- There is no human output branch, exit-code distinction, malformed diff refusal, or graph-error catch in the adapter.

Current path output from `tools/habitat-harness/src/plugin.js` includes:

- no top-level `schemaVersion`;
- project ownership fields: `path`, `project`, `projectRoot`, `tags`;
- rule fields: `rulesInScope`, `scopedRules`;
- target fields: `requiredTargets`, `targets`, `unavailableTargets`;
- target `proof` fields that D3 classifies as compatibility/projection-only.

Current malformed/pathless diff output is:

```json
{
  "schemaVersion": 1,
  "inputKind": "diff",
  "paths": []
}
```

That is the negative-control bug: a malformed/pathless input is indistinguishable from a valid diff with no classified paths.

### Source Control Flow

`classifyTarget()` in `/tools/habitat-harness/src/lib/command-engine.ts` lines 822-835:

- Calls `diffText(target)`.
- If truthy, reads Nx projects and returns `DiffClassification`.
- Else calls `classifyPath()`.

`diffText()` lines 1077-1085:

- Treats any input containing `\n` as diff text.
- Treats any input starting with `diff --git ` as diff text.
- Reads `.diff`/`.patch` files only if they contain `diff --git ` or `\n+++ b/`.

`extractDiffPaths()` lines 1087-1099:

- Extracts paths from `diff --git a/... b/...` and `+++ b/...`.
- Sorts unique paths.
- Has no malformed/pathless state. Empty set becomes successful `paths: []`.

`classifyPathWithProjects()` lines 846-876:

- Converts input with `toRepoRelative()`.
- Uses `findOwningProject()` from `nx-projects.ts`.
- If no owner, returns the same `Classification` interface with `project: null`, `note: "workspace-level path"`, and workspace targets.
- If owner exists, returns project fields, scoped rules, project targets, workspace targets, and unavailable project targets.

`rulesInScopeForPath()` and `classifyRuleScope()` lines 879-935:

- Iterate the whole `rules` registry, not a D2 projection.
- Exact path scope comes from `scopePathPatterns(rule)` and `scopePatternMatches()`.
- Project-owner scope falls back when `rule.ownerProject === owner.name`.
- `grit-check` and `wrapped-test` owned rules without exact path metadata become `unresolved-metadata`.
- Workspace gates are inferred from `rule.ownerProject === "@internal/habitat-harness"` plus keywords in `rule.scope`.

`scopePathPatterns()`, `scopeIsMachineParseable()`, and helpers lines 955-999:

- Parse raw prose `rule.scope` with regexes and qualifier filters.
- D2 explicitly rejects raw `scope` as target authority and requires `ruleRoutingFacts` from `PathCoverage`.

`projectTargets()` lines 1032-1056:

- Hard-codes `["check", "test"]`.
- Uses `projectHasTarget()` from `nx-projects.ts`.
- Constructs `nx run <project>:<target>` command strings locally.
- Constructs `proof: { kind: "nx-project-graph" }` locally.
- Emits only `missing-nx-target` unavailable facts.

`workspaceTargets()` lines 1058-1071:

- Hard-codes `bun run lint` as a workspace target.
- Emits `proof: { kind: "habitat-owned" }`.
- D3 requires graph-owned aggregate/workspace targets and graph refusals to come from the Workspace Graph module, not local arrays.

`readNxProjects()` lines 1073-1075:

- Lets `NxProjectGraphMetadataReader.readProjects()` errors escape.
- There is no `graph-error` orientation variant.

### Test Consumers

`/tools/habitat-harness/test/lib/classify.test.ts` directly imports `classifyPath` and `classifyTarget` from `command-engine.ts`.

Current assertions lock these compatibility fields:

- Project fields: `project`, `tags`, `projectRoot`.
- Rule fields: `rulesInScope`, `scopedRules`, `ScopedRule.scope`.
- Target fields: `requiredTargets`, `targets`, `targets[].proof`, `unavailableTargets`.
- Workspace fallback: `project === null`, `note === "workspace-level path"`, `requiredTargets === ["bun run lint"]`.
- Missing filesystem path behavior: path ownership is by path string and Nx project roots, not filesystem existence.
- Diff behavior: `inputKind === "diff"`, `paths.length`, stable sorted path order, nested `Classification` shape.
- Live graph behavior: real Nx graph omits missing `@civ7/adapter:test`.

Missing test consumers that D4 must add:

- Malformed/pathless diff refusal state.
- Graph read failure state from injected `nxProjects` reader throwing.
- Explicit unresolved owner state if D4 distinguishes unsupported path from workspace fallback.
- Multi-path diff with per-path non-claims and no project-singleton leakage.
- Unavailable targets and graph refusals from D3-compatible target facts.
- Exact JSON snapshots for each orientation variant if D0 decides JSON is versioned or preserved through facade.

`/tools/habitat-harness/test/commands/habitat-commands.test.ts` mocks `classifyTarget()` and only asserts the command adapter prints parseable ownership JSON and forwards the raw arg. It does not pin real output shape, exit codes, or refusal behavior.

## Exact State-Space Smells

1. Optional-property soup in `Classification`.
   - `projectRoot`, `tags`, `rulesInScope`, `scopedRules`, `requiredTargets`, `targets`, `unavailableTargets`, and `note` can be omitted or combined independently.
   - A workspace path, project path, unresolved owner, and graph-error-ish partial result all share one interface.
   - Repair demand: replace target orientation with a closed union. Project path, workspace path, diff, malformed/pathless diff, unresolved owner, and graph error must be distinct variants with required and forbidden fields.

2. Diff detection is stringly and over-broad.
   - `diffText()` treats any newline as diff.
   - `extractDiffPaths()` can return `[]`, which becomes a success.
   - Repair demand: separate input classification from diff classification. Diff-like valid, diff-like malformed/pathless, path-like, and unreadable patch file must be explicit states or refusal paths.

3. Rule routing is prose-derived.
   - `isWorkspaceGate()` searches words like `all`, `workspace`, `staged`, `package.json`, `docs/`, and `package-manager` inside `rule.scope`.
   - `scopePathPatterns()` regexes raw prose into path globs.
   - D2 says `scope` is compatibility-only prose and target routing must consume `ruleRoutingFacts`.
   - Repair demand: D4 may display compatibility prose only through D0; target routing must consume D2 `ruleRoutingFacts` and report `unresolved-routing-metadata` without guessing.

4. Graph and target facts are locally reconstructed.
   - `projectTargets()` hard-codes `check` and `test`.
   - `workspaceTargets()` hard-codes `bun run lint`.
   - `ClassifiedTarget.proof` uses graph/proof language in classify output.
   - D3 says classify must consume `ClassifyTargetProjection` from `WorkspaceTargetState[]`.
   - Repair demand: D4 must depend on D3 graph facts for owner project, target availability, unavailable targets, aggregate/workspace targets, and graph refusals. It must not infer alias validity or target truth locally.

5. Graph errors are not modeled.
   - `readNxProjects()` returns or throws; throws escape instead of becoming a result.
   - Repair demand: add `graph-error` orientation variant with bounded reason vocabulary inherited from D3, recovery instruction, no runnable target commands, and explicit non-claims.

6. Current output has split versioning.
   - `DiffClassification` has `schemaVersion: 1`; `Classification` does not.
   - Repair demand: D4 target JSON must be versioned consistently, with D0 deciding whether legacy command JSON is preserved, versioned, facaded, deprecated, or refused.

7. Compatibility and domain authority are mixed in public exports.
   - `Classification`, `ClassifiedTarget`, `DiffClassification`, `ScopedRule`, and functions are exported from `index.ts`.
   - Repair demand: source implementation may introduce internal orientation types only behind D0-covered public facades. It must not let accidental internal types become new public contracts.

## D2/D3 Dependency Facts D4 Must Consume

D2 accepted design/spec facts relevant to D4:

- `scope` is not target authority; it may survive only as compatibility prose.
- `ruleRoutingFacts` is the named projection for classify/D4 routing.
- `PathCoverage` states must be closed: exact path/glob coverage, owner-project coverage, workspace-gate coverage, or unresolved metadata.
- Consumers may not receive whole `RuleRegistryRecord`/legacy `HarnessRule` across domain boundaries unless D2 records an exception.
- Malformed metadata such as unresolved routing metadata must fail through D1-aligned output families, not ordinary rule violations.

D3 accepted design/spec facts relevant to D4:

- Workspace Graph owns project identity, roots, tags, target availability, aggregate/workspace targets, and graph read failures.
- Existing `ClassifiedTarget`/`UnavailableClassifiedTarget` are compatibility DTOs only.
- Classify should receive `ClassifyTargetProjection` from `WorkspaceTargetState[]`.
- Graph target states are closed: available project target, unavailable project target, alias target with resolved dependency, aggregate/workspace target, and graph refusal.
- D4 may consume D3 project ownership, target availability, unavailable target, and graph refusal facts, but may not infer target truth or alias validity.

## D0 Public-Surface Dependencies

D0 requires a public-surface matrix before later packets change command behavior, command JSON, package exports, root scripts, Nx target metadata, docs/examples, and related surfaces.

D4 implementation is blocked behind concrete D0 rows for at least:

| Surface | Current topology | Why D4 depends on D0 |
| --- | --- | --- |
| `habitat classify` CLI verb/arg | `/tools/habitat-harness/src/commands/classify.ts` prints JSON for one required arg | D4 may alter refusal behavior, exit codes, JSON shape, and possibly human/non-claim output. |
| `habitat classify` command JSON path output | `Classification` object without schemaVersion | D4 target must version or facade path output. |
| `habitat classify` command JSON diff output | `DiffClassification` with `schemaVersion: 1`, `inputKind: "diff"` | D4 must decide whether valid diff output is preserved, versioned, or nested under a new orientation result. |
| Malformed/pathless diff behavior | currently success with empty `paths` | D4 wants a refusal-like variant; this is an intentional behavior change. |
| Package exports from `src/index.ts` | classify DTOs and functions exported from `"."` | D4 may add new orientation types and/or facade old types. |
| Docs/examples | `tools/habitat-harness/docs/SCENARIOS.md`, README/examples per packet | Examples must follow D0 docs-example rows before public guidance changes. |
| D3 classify target compatibility fields | `ClassifiedTarget`, `UnavailableClassifiedTarget`, legacy `proof` | D4 must not remove or reinterpret target fields without D0 handling. |

Until those rows exist, D4 can be repaired as design/specification only. Source implementation that changes output or exports must remain blocked.

## Concrete D4 Write Set

OpenSpec/design repair write set for the current remediation pass:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/closure-checklist.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-code-topology-investigation.md`

Likely later source implementation write set, after D0 rows and live D2/D3 facts:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- New orientation/routing module under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/` if D4 extracts the target union and legacy facade.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts` only for D0-covered public export additions/facades.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-commands.test.ts`
- New focused tests under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/` for orientation DTO variants if extraction occurs.
- Adjacent Habitat docs/examples only after D0 docs-example rows exist.

## Protected Paths

D4 repair and implementation should not touch these without an amended packet and re-review:

- D2 registry source authority:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/architecture.ts`
  - Registry projection modules owned by D2.
- D3 graph authority:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/workspace-graph-contract.js`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/workspace-graph.ts`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/nx-projects.ts` except compatibility-adapter consumption explicitly coordinated with D3.
- D7 enforcement behavior and check aggregation outside classify-facing projections.
- D12 verify receipt schema and handoff wording.
- D13 scaffolding/refusal implementation and D14 topology fence implementation.
- Generated artifacts, `dist/`, `mod/`, lockfiles, and unrelated Civ/MapGen product code.
- Other OpenSpec packets except downstream ledger dependency notes.

## Repair Demands For D4 Packet

1. Define the exact target top-level union in `design.md` and `spec.md`.

   Required variants:
   - `project-path`
   - `workspace-path`
   - `diff`
   - `malformed-or-pathless-diff`
   - `unresolved-owner`
   - `graph-error`

   For each variant, specify required fields, forbidden fields, whether target facts may appear, recovery instruction shape, non-claims, and D2/D3 projection source.

2. Record compatibility handling before source work.

   Add a D0 dependency table for `habitat classify` CLI, path JSON, diff JSON, malformed diff behavior, exported classify types/functions, target DTO/proof fields, and docs examples. D4 should state that source implementation is blocked until rows with concrete `surface_id` values exist.

3. Replace prose routing with projection requirements.

   Normative spec must say D4 consumes D2 `ruleRoutingFacts`/`PathCoverage`, never raw `scope`, `reason` prose, `ownerProject` fallback alone, or regex-scraped paths as target authority.

4. Replace local target construction with D3 projection requirements.

   Normative spec must say D4 consumes D3 `ClassifyTargetProjection`/`WorkspaceTargetState` for available targets, unavailable targets, aggregate/workspace targets, and graph refusals. It must forbid local `check`/`test` arrays and local workspace target command authority in target-domain code.

5. Add falsifying test gates.

   Required implementation gates:
   - unit tests for every orientation variant;
   - malformed newline text refuses instead of empty successful diff;
   - pathless valid diff or empty patch file gets explicit refusal/recovery;
   - graph reader failure produces `graph-error`;
   - multi-path diff keeps stable ordering and per-path orientation states;
   - unavailable targets are reported as non-runnable;
   - workspace fallback does not overclaim owner/project targets;
   - JSON snapshots or equivalent exact oracles for public command output after D0 disposition.

6. Rewrite tasks as executable file/behavior steps.

   Current tasks `2.1`-`2.3` are design outcomes. Replace them with steps such as: introduce internal orientation DTO, add compatibility facade, update classify adapter, add variant tests, add malformed diff refusal, consume D2 routing projection, consume D3 graph projection, update D0-covered exports/docs.

7. Update downstream realignment for D14.

   D14 authoring topology examples should depend on D4's example corpus: project path, workspace path, multi-path diff, malformed/pathless diff, unresolved owner, graph error, unavailable target, and non-claim examples.

## Implementation Readiness Checklist

D4 is ready for source implementation only when all are true:

- D4 OpenSpec records the closed orientation union and per-variant field contracts.
- D0 matrix rows with `surface_id` values exist for every classify command/export/docs surface D4 changes.
- D2 live implementation exposes `ruleRoutingFacts` or D4 explicitly remains on a compatibility facade with no target-authority claim.
- D3 live implementation exposes classify-safe graph target/refusal projections or D4 explicitly remains on a compatibility facade with no target-authority claim.
- Tests name all target variants and include malformed/pathless diff and graph-error failures.
- Tasks identify source files, compatibility facades, tests, docs, and protected paths.

Skills used: domain-design, information-design, typescript-refactoring.
