# Phase Record — Effect-Native Habitat Core

## Status

CLOSED LOCALLY / DESIGN-ONLY — stacked after closed H7 and H8; implementation
belongs in child changes after this parent design slice. This revision records
the H8 reassessment and multi-spec split requested after the initial parent
commit.

## Branch And Stack State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-F-habitat-effect-core`
- Branch: `agent-F-habitat-effect-core`
- Graphite parent: `agent-F-habitat-generators-migrations`
- Current branch state: `agent-F-habitat-effect-core` is stacked on H8 branch
  `agent-F-habitat-generators-migrations`; the branch's unique design commit
  owns this parent OpenSpec change.
- Dirty ownership before commit: only
  `openspec/changes/habitat-effect-native-core/**` is owned by this split
  revision.

## Protected / Forbidden Write Set

- Do not edit H1-H8 historical OpenSpec records from this parent change.
- Do not edit product/runtime Civ7 control, MapGen/Swooper, SDK, Studio, mods,
  generated output, or lockfiles from this parent design slice.
- Downstream realignment belongs under this change or child changes, not in
  historical records.

## Grounding

- Frame: `openspec/changes/habitat-effect-native-core/workstream/frame.md`
- Proposal: `openspec/changes/habitat-effect-native-core/proposal.md`
- Design: `openspec/changes/habitat-effect-native-core/design.md`
- Tasks: `openspec/changes/habitat-effect-native-core/tasks.md`
- Spec deltas:
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-runtime-substrate/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-process-baselines/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-check-orchestration/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-command-programs/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-nx-generators-migrations/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-hooks/spec.md`
  - `openspec/changes/habitat-effect-native-core/specs/habitat-effect-generated-verifier/spec.md`
- H8 reassessment:
  `openspec/changes/habitat-effect-native-core/workstream/h8-reassessment.md`
- Review disposition:
  `openspec/changes/habitat-effect-native-core/workstream/review-disposition.md`

## Evidence Read

- Habitat project docs: FRAME, workstream record, invariant corpus, taxonomy,
  discrepancy log, review disposition ledger.
- Habitat OpenSpec train: H1, H2, H3, H4, H4.5, H5, H6, H7, H8. The split
  revision re-read H8 records and branch diff in full.
- Current harness code: oclif commands, command engine, baselines, Grit, hooks,
  generated zones, process runner, diagnostics, tests, README, root AGENTS,
  H8 classify, H8 generators, and H8 migration metadata.
- Local Effect precedent: `@civ7/studio-server` runtime/services/handler/tests
  and `@civ7/control-orpc` procedure surface.
- Official Effect docs: services/context, layers, resource management, Scope,
  runtime/ManagedRuntime, platform command/filesystem/path/terminal,
  concurrency primitives, scheduling, schema/config/logging, expected/tagged
  errors, and testing/TestClock.

## Agent Review Inputs

- Sequencing/workstream review: parent design is acceptable; implementation
  must wait until H8 closes and split into child changes.
- Harness parity review: tighten check exit semantics, resource-publish carve
  out, Grit details, baseline authoring, generated-zone policy table behavior,
  H8 parity gates, and stdout/stderr probes.
- H8 reassessment review: separate Nx generator/migration surfaces from oclif
  command programs; pin classify payload shape; pin generator, pattern, and
  migration parity.
- OpenSpec split review: replace singular broad spec with multiple
  capability-level spec deltas and update phase metadata.
- Effect-idiom review: repeat platform dependency proof in-repo, reconcile Bun
  dev path with Node live layer, keep internal report-schema failure as a
  defect, remove custom clock abstraction, and forbid nested Habitat CLI
  invocation inside migrated hooks.
- Formal workstream review wave: authority/H8 parity, OpenSpec shape/task
  readiness, Effect architecture/lifecycle, Nx generator/migration boundary,
  proof/closure, and information-design/future-DRA clarity.

## Current Decisions

- `habitat-effect-native-core` is a parent/design OpenSpec change.
- Child implementation changes:
  `habitat-effect-runtime-substrate`,
  `habitat-effect-process-baselines`,
  `habitat-effect-check-orchestration`,
  `habitat-effect-command-programs`,
  `habitat-effect-nx-generators-migrations`,
  `habitat-effect-hooks`,
  `habitat-effect-generated-verifier`.
- Oclif remains the command adapter.
- Nx generators and migrations remain Nx host adapters with an Nx `Tree` backed
  generator workspace service.
- Core modules return Effect programs and structured results.
- Live platform direction is Node-oriented, with in-repo proof required for both
  Bun dev invocation and built Node oclif invocation before manifest edits.
- Keep pure data/parsers/renderers plain.
- Move hooks and generated-zone verification after process/Git/FS/baseline
  services are proven.

## Stop-Condition Status

- H7/H8 not closed: clear in the current stack (`openspec list` reports both
  complete); child implementation still waits for this parent design commit.
- Command parity changed: no implementation in this slice.
- Runtime/resource outlives command: no implementation in this slice.
- Hook restage policy unproven: deferred to `habitat-effect-hooks`.
- Grit scan model unproven: deferred to `habitat-effect-check-orchestration`.
- Generated-zone snapshot/restore unproven: deferred to
  `habitat-effect-generated-verifier`.
- Dependency peer/runtime proof incomplete in-repo: deferred to
  `habitat-effect-runtime-substrate`.
- Nx generator Tree/runtime/module bridge unproven: deferred to
  `habitat-effect-nx-generators-migrations`.

## Validation Log

- 2026-06-14: `bun install` completed before design drafting.
- 2026-06-14: `bun run build` passed before design drafting.
- 2026-06-14: `bun run openspec -- list` completed after install.
- 2026-06-14: Temp dependency probe installed `effect@3.21.3`,
  `@effect/platform@0.96.1`, and `@effect/platform-node@0.107.0` under Bun
  without peer warnings.
- 2026-06-14: Temp runtime probe imported `NodeContext.layer` and ran a minimal
  Effect program under Bun.
- 2026-06-14: `bun run openspec -- validate habitat-effect-native-core
  --strict` passed after adversarial-review revisions.
- 2026-06-14: `bun run openspec:validate` passed: 158 OpenSpec records valid.
- 2026-06-14: `git diff --check` passed.
- 2026-06-14: banned-language scan for this change returned no hits.
- 2026-06-14: `gt info agent-F-habitat-effect-core` reported parent
  `agent-F-habitat-generators-migrations`.
- 2026-06-14: H8 branch diff and implementation files re-read; parent spec
  split revised from one `habitat-harness` spec delta to seven child-aligned
  spec deltas.
- 2026-06-14: `bun run openspec -- validate habitat-effect-native-core
  --strict` initially found missing parsed requirement keywords after the split;
  requirement bodies were repaired.
- 2026-06-14: `bun run openspec -- validate habitat-effect-native-core
  --strict` passed after split repairs.
- 2026-06-14: `bun run openspec:validate` passed: 158 OpenSpec records valid.
- 2026-06-14: `git diff --check` passed after split repairs.
- 2026-06-14: Formal review wave completed; accepted findings repaired for
  classify deletion-diff parity, task scoping, Nx factory lifecycle stop
  conditions, reporter/runtime boundaries, source CJS factory metadata parity,
  Tree-write coverage, and parent-vs-child verification gates.
- 2026-06-14: `bun run openspec -- list` reported
  `habitat-effect-native-core` complete after task-scope repair.
- 2026-06-14: `bun run openspec -- validate habitat-effect-native-core
  --strict` passed after formal review repairs.
- 2026-06-14: `bun run openspec:validate` passed after formal review repairs:
  158 OpenSpec records valid.
- 2026-06-14: `git diff --check` passed after formal review repairs.
- 2026-06-14: shortcut-language scan returned no hits after formal review
  repairs.

## Next Exact Action

Next implementation action is to draft `habitat-effect-runtime-substrate` as a
child change. Keep this parent design read-only except for review-driven
corrections.
