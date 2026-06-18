# D4 TypeScript State-Space Investigation

## Supervisor Vocabulary Correction

D3 owns this state family as `GraphRefusal` / `graph-refusal`. Any earlier scratch wording inherited from the source packet that used a D4-owned graph state name is superseded by the active D4 packet language: D4 consumes and renders D3 graph refusals, with D3-owned reason categories for malformed graph JSON, Nx read failure, Nx daemon failure, missing project, missing target, and unresolved alias dependency.

## Verdict

Blocked. D4 currently describes a desired orientation/routing improvement but does not specify the TypeScript state-space collapse needed to make invalid classify states unrepresentable.

The repair must define a real discriminated union orientation result, field rules per variant, D0 compatibility handling for every public surface, and a refactor sequence that deletes invalid optional combinations before rearranging files or names. A shallow `kind?: string` addition to the current `Classification` interface is explicitly insufficient.

## Sources Read

- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/SKILL.md`
- All files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/`
- Both files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/classify.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/classify.test.ts`
- `docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`

## Current Type Shape

`command-engine.ts` currently exports:

- `Classification`: a single optional-heavy interface with `path`, `project`, optional `projectRoot`, `tags`, `rulesInScope`, `scopedRules`, `requiredTargets`, `targets`, `unavailableTargets`, and `note`.
- `DiffClassification`: a wrapper with `schemaVersion: 1`, `inputKind: "diff"`, and `paths: Classification[]`.

The package entrypoint re-exports both public types from `src/index.ts`, and `src/commands/classify.ts` serializes the direct result of `classifyTarget()` as command JSON. That makes this a public type and command JSON compatibility change, not an internal cleanup.

Current creation paths:

- `classifyTarget()` treats any input where `diffText(target)` returns truthy as a successful diff result and maps `extractDiffPaths(diff)` into `Classification[]`.
- `classifyPathWithProjects()` returns either a workspace fallback shape with `project: null`, `note`, `requiredTargets`, and `targets`, or a project-owned shape with owner facts, rule facts, target facts, and unavailable target facts.
- Graph metadata failures escape through `readNxProjects()` rather than becoming a classified orientation state.

## Required Target State Model

D4 must require one top-level discriminant. Suggested public model names are placeholders; the important contract is the closed state set and variant-owned fields.

```ts
type ClassifyOrientationResult =
  | ProjectPathOrientation
  | WorkspacePathOrientation
  | DiffOrientation
  | MalformedOrPathlessDiffOrientation
  | UnresolvedOwnerOrientation
  | GraphRefusalOrientation;
```

Required variant rules:

| Variant | Discriminant | Required fields | Forbidden fields |
| --- | --- | --- | --- |
| Project path | `kind: "project-path"` | `schemaVersion`, `inputKind: "path"`, `path`, `owner.project`, `owner.projectRoot`, `owner.tags`, D2-backed scoped rule projections, graph-backed runnable targets, unavailable targets, non-claims | `paths`, `refusal`, graph refusal payload, workspace-only note |
| Workspace path | `kind: "workspace-path"` | `schemaVersion`, `inputKind: "path"`, `path`, explicit workspace owner/fallback fact, workspace gates, non-claims | project owner/root/tags, project-local targets, unavailable project targets, diff paths |
| Diff with paths | `kind: "diff"` | `schemaVersion`, `inputKind: "diff"`, non-empty `paths` array of path-orientation variants that can be classified from changed paths, aggregate non-claims | direct single-path owner fields on the wrapper, empty `paths`, runnable targets not owned by child path variants |
| Malformed/pathless diff | `kind: "malformed-or-pathless-diff"` | `schemaVersion`, `inputKind: "diff"`, stable refusal reason, recovery instruction, non-claim that ownership was not inferred | `paths`, project owner/root/tags, runnable targets, unavailable project targets |
| Unresolved owner | `kind: "unresolved-owner"` | `schemaVersion`, `inputKind: "path"`, `path`, unresolved owner fact, recovery instruction, workspace-safe non-claims | project owner/root/tags, project-local runnable targets, rule scopes that require owner certainty |
| Graph refusal | `kind: "graph-refusal"` | `schemaVersion`, bounded graph refusal class, recovery instruction, non-claim that graph facts/targets were unavailable | project owner/root/tags, graph-backed runnable targets, unavailable target facts pretending to come from a loaded graph |

State-space delta required: current `Classification` admits the cross-product of all optionals. The target model admits exactly one top-level state at a time, and fields such as `paths`, `owner.projectRoot`, runnable targets, unavailable targets, refusal reasons, and graph refusals are present only in the variant that owns them.

## Forbidden Current Field Combinations

D4 must name these combinations as impossible in the target model:

- `project: null` with `projectRoot`, `tags`, project-owned `targets`, `unavailableTargets`, `rulesInScope`, or `scopedRules`.
- `project: string` without `projectRoot` and owner tags.
- `project: string` with `note: "workspace-level path"`.
- `requiredTargets` containing `nx run <project>:<target>` when `targets` does not contain a matching graph-backed `ClassifiedTarget`.
- `requiredTargets` or `targets` present on malformed/pathless diff refusal.
- `unavailableTargets` presented beside a runnable command for the same project/target.
- top-level diff result with direct single-path fields such as `project`, `projectRoot`, `tags`, `rulesInScope`, or `targets`.
- diff result with `paths: []` treated as a successful classification.
- graph metadata failure represented by a thrown exception or a successful workspace fallback instead of a `graph-refusal` state.
- unresolved owner represented as ordinary workspace path without saying whether the path is truly workspace-owned, outside supported surfaces, or blocked by missing graph facts.
- `rulesInScope` diverging from `scopedRules.map(rule => rule.ruleId)`.
- scoped rule facts derived from prose `scope` heuristics instead of D2 registry projections.
- `targets` present without proof, or with proof that is not one of the target variant's allowed proof kinds.
- `note?: string` as an open string channel for routing/refusal semantics. It must collapse into typed variant fields such as refusal reason, recovery instruction, unresolved facts, or non-claims.

## Public Compatibility Moves Through D0

D4 may use only D0's closed compatibility actions: preserve, version, facade, deprecate, refuse, document-only, generated-only. It must not invent a new action.

Required D0 rows or equivalent citations before source implementation:

| Surface | Current state | Required D0 move |
| --- | --- | --- |
| `habitat classify` CLI invocation | Public command verb with a required path/diff argument | `preserve` invocation unless D0 records a different explicit command change |
| `habitat classify` command JSON | Current path shape is unversioned `Classification`; diff shape is `schemaVersion: 1` `DiffClassification` | Prefer `version` for the new discriminated result. If D0 instead chooses `preserve`, D4 must provide a compatibility wrapper/facade and expose the union separately. |
| `Classification` package export | Exported from `tools/habitat-harness/src/index.ts`; optional-heavy DTO currently used as command output | Changes must cite D0 rows and keep the compatibility shape explicit through facade, deprecation, or versioning. |
| `DiffClassification` package export | Exported from `src/index.ts`; versioned wrapper but contains optional-heavy child records | `version` or `facade`; `preserve` only if an adapter keeps old shape while target union lives behind a new surface. |
| `ClassifiedTarget`, `UnavailableClassifiedTarget`, `ScopedRule` exports | Public supporting DTOs used by classify output | `preserve` as supporting fact types unless D2/D3 explicitly version/facade them. D4 should consume them; it must not redefine D2/D3 authority locally. |
| Docs examples showing classify JSON/human output | Docs-only examples of current behavior | `document-only`; update examples only after citing command JSON/source rows. |
| Generated/derived command manifests, if classify help/manifests change later | Derived from oclif/source command definitions | `generated-only`; change source command definitions, not generated output by hand. |
| Malformed/pathless diff current acceptance | Current behavior accepts newline non-diff as empty successful diff | D0 should record whether this unsupported invocation becomes `refuse`; D4 must not preserve the false-success behavior as target behavior. |

Because `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` is absent in the current worktree, D4 is blocked from claiming concrete D0 compatibility closure.

## Safe Refactor Sequence

D4's implementation plan must be ordered by state-space reduction, not file movement.

1. Characterize current behavior before source changes.
   - Pin current path, workspace fallback, project target, unavailable target, exact rule scope, unresolved metadata, diff, multi-path diff ordering, malformed/pathless newline input, and graph reader failure behavior.
   - Mark malformed/pathless newline and graph failure tests as target-contract failures until D4 intentionally changes them.
2. Add target union types without replacing the public export yet.
   - Introduce closed variant types, `schemaVersion`, `kind`, `inputKind`, variant-owned fields, and an exhaustiveness helper.
   - No new `any`, `as any`, open `Record<string, any>`, or optional catch-all `note` channel.
3. Add creation adapters at boundaries.
   - Convert project path, workspace path, malformed/pathless diff, unresolved owner, and graph refusal into explicit variants at creation sites.
   - If D0 requires compatibility, add an old-shape adapter/facade from the new union to current `Classification`/`DiffClassification`; do not build the new model by mutating the old optional interface.
4. Migrate consumers to switch on the discriminant.
   - Command JSON, tests, docs examples, and any package consumers must consume the union through exhaustive switches or typed projection helpers.
   - `DiffOrientation.paths` must contain classified path variants and must reject/refuse empty pathless diffs.
5. Delete invalid optionals and prose routing.
   - Remove `note?: string` as semantic routing.
   - Remove `rulesInScope` if it is redundant with `scopedRules`, or make it a generated compatibility projection with an invariant test.
   - Remove or deprecate old optional fields from the target model once all consumers use variant fields.
6. Validate after each logical move.
   - Run classify unit tests after each state/adapter migration step.
   - Run `tsc --noEmit` or the repo's nearest check target after public type/export changes.
   - Diff emitted/public `.d.ts` or exported symbol inventory when changing `src/index.ts`.
   - Run OpenSpec validation only after the TypeScript contract and test oracle are represented in the packet.
7. Commit one logical move per Graphite layer after the packet is accepted for implementation.
   - Characterization, target type introduction, adapter/facade, consumer migration, deletion of old optionals, and docs/examples should be separable review units.

## Repair Demands For D4 OpenSpec

1. Replace the current broad spec with a normative requirement that names the exact orientation union variants and their required/forbidden fields.
2. Add an explicit "Forbidden Field Combinations" section to `design.md` or the normative spec so implementers cannot preserve optional-heavy `Classification` with a cosmetic discriminant.
3. Record D0 compatibility handling for `habitat classify` JSON, `Classification`, `DiffClassification`, package exports, docs examples, and generated surfaces before source implementation.
4. Require malformed/pathless diff to be a refusal state, not a successful diff with `paths: []`.
5. Require graph metadata failure to be a `graph-refusal` orientation state with no graph-backed target commands.
6. Require unresolved owner to be distinct from workspace path unless D3 graph facts prove the path is workspace-owned.
7. Replace generic implementation tasks with the safe refactor sequence above, including characterize -> introduce target types -> adapters/facades if D0 requires -> migrate consumers -> delete invalid optionals/prose routing -> validate after each move.
8. Add falsifying tests for every variant and every forbidden combination that previously compiled or serialized.
9. Require exhaustive `switch`/`never` handling for the union in TypeScript consumers.
10. Make D2/D3 consumption explicit: D4 consumes typed rule projections and graph target facts; it must not parse rule prose or invent graph truth.

## Non-Claims

- This investigation did not edit TypeScript source.
- This investigation did not edit D4 packet files.
- This investigation does not approve D4 for implementation.
- This investigation does not claim D0, D2, or D3 are complete; it only states what D4 must cite or consume before it can safely change classify state.
- OpenSpec shape validation alone is not evidence of TypeScript state-space collapse.

Skills used: domain-design, information-design, solution-design, typescript-refactoring.
