# H8 Reassessment — Effect-Native Habitat Core

## Evidence Read

- H8 branch diff: `agent-F-habitat-git-hooks..agent-F-habitat-generators-migrations`.
- H8 records:
  `openspec/changes/habitat-generators-migrations/proposal.md`,
  `openspec/changes/habitat-generators-migrations/specs/habitat-harness/spec.md`,
  `openspec/changes/habitat-generators-migrations/tasks.md`, and
  `openspec/changes/habitat-generators-migrations/workstream/phase-record.md`.
- H8 implementation:
  `tools/habitat-harness/generators.json`,
  `tools/habitat-harness/migrations.json`,
  `tools/habitat-harness/package.json`,
  `tools/habitat-harness/src/commands/classify.ts`,
  `tools/habitat-harness/src/lib/command-engine.ts`,
  `tools/habitat-harness/src/generators/project/generator.cjs`,
  `tools/habitat-harness/src/generators/pattern/generator.cjs`,
  `tools/habitat-harness/src/migrations/baseline-metadata-noop.cjs`,
  `tools/habitat-harness/test/commands/habitat-commands.test.ts`, and
  `tools/habitat-harness/test/lib/classify.test.ts`.
- H8 operating-loop docs:
  root `AGENTS.md`, `tools/habitat-harness/README.md`, and
  `docs/projects/habitat-harness/workstream-record.md`.

## H8 Surfaces That Affect The Effect Design

- H8 made Habitat a repo-local Nx plugin surface as well as an oclif CLI:
  `generators.json` declares `project` and `pattern`; `migrations.json`
  declares a local migration; `package.json` exposes generator and migration
  metadata.
- `classify <path-or-diff>` now handles repo-relative paths, absolute paths,
  literal diffs, and `.diff`/`.patch` files. Diff classification returns
  schema version `1`, input kind `diff`, and sorted path classifications for
  changed `b/` paths.
- Project classification discovers owners across `apps`, `packages`,
  `packages/plugins`, `mods`, and `tools`, chooses the longest matching root,
  and emits `path`, `project`, `projectRoot`, `tags`, `rulesInScope`, and
  `requiredTargets`. Workspace paths emit `project: null`, the
  workspace-level note, and workspace targets.
- The project generator supports only uniform `foundation`, `plugin`, and
  `app` kinds at runtime, while its schema accepts taxonomy kinds and `kind:*`
  spellings. Unsupported kinds are refused with a domain-owner rationale.
- Project generator output includes kind-specific default roots/package names,
  `package.json` tags/scripts/exports/files/engine, `tsconfig.json`,
  `src/index.ts`, a Bun test stub, and README. Non-empty roots are refused.
- The pattern generator writes a native Grit pattern, an empty locked baseline,
  and a `grit-check` rule-pack entry in one generator operation, and refuses
  duplicate pattern paths, baseline paths, or rule ids.
- Migration proof is local because `@internal/habitat-harness` is unpublished:
  a hand-authored run file points at package `./tools/habitat-harness`, then
  `nx migrate --run-migrations=<run-file>.json --skip-install` runs.

## Design Consequences

- The parent spec cannot stay singular; H8 adds enough distinct behavior
  surfaces that one broad `habitat-harness` spec would hide important host
  boundaries.
- Nx generators and migrations are not oclif command programs. They require a
  distinct child change and spec delta:
  `habitat-effect-nx-generators-migrations`.
- Generator-owned writes must stay Nx `Tree` writes. Effect-backed generator
  logic needs a Tree-backed service rather than direct platform filesystem
  writes for generator output.
- Generator and migration runtime lifecycle is bounded by Nx factory promise
  completion, not `Command.run()` completion.
- The ESM package plus CJS factory metadata requires an explicit implementation
  bridge before Effect TypeScript is shared with generator or migration
  factories.
