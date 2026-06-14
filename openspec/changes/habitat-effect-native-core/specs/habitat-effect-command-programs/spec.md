## ADDED Requirements

### Requirement: Non-Check Command Programs Preserve Existing Contracts

`fix`, `verify`, `graph`, and `classify` SHALL move reusable command logic into
Effect programs without changing command names, flags, stdout/stderr placement,
exit semantics, or JSON shapes.

#### Scenario: Fix dry-run preserves external tool output
- **WHEN** an agent runs `habitat fix --dry-run`
- **THEN** Habitat runs the established dry-run Grit apply path and Biome check
  path
- **AND** stdout, stderr, and exit code match the pre-refactor behavior

#### Scenario: Verify stops before Nx when check fails
- **WHEN** `habitat verify` cannot produce a passing Habitat check report
- **THEN** it preserves the established check-fail ordering before Nx affected
  verification
- **AND** it does not hide check failure behind later affected-target output

#### Scenario: Graph command cleans scoped temp output
- **WHEN** an agent runs `habitat graph --json`
- **THEN** Habitat generates the Nx graph through a scoped temp directory
- **AND** returns compact JSON when requested
- **AND** removes the temp directory before command completion

### Requirement: Classify Preserves H8 Path And Diff Semantics

`habitat classify <path-or-diff>` SHALL preserve the H8 classification
contract for repo paths, absolute paths, literal diffs, `.diff` files, and
`.patch` files.

#### Scenario: Path classification returns ownership and verification targets
- **WHEN** an agent classifies a path under a workspace project
- **THEN** the output includes `path`, `project`, `projectRoot`, `tags`,
  `rulesInScope`, and `requiredTargets`
- **AND** required project targets use the established `bun run nx run
  <project>:check` and `bun run nx run <project>:test` command strings
- **AND** workspace-level Habitat targets are included

#### Scenario: H8 classify matrix stays stable
- **WHEN** agents classify the H8 matrix paths for adapter, mod, foundation,
  and app projects
- **THEN** `packages/civ7-adapter/src/index.ts` resolves to project
  `@civ7/adapter`, tag `kind:adapter`, and the adapter boundary rule in scope
- **AND** `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` resolves to
  project `mod-swooper-maps`, tag `kind:mod`, and recipe-surface rules in
  scope
- **AND** `packages/config/src/index.ts` resolves to project `@civ7/config`,
  tag `kind:foundation`, and internal harness rules in scope
- **AND** `apps/mapgen-studio/src/main.tsx` resolves to project
  `mapgen-studio`, tag `kind:app`, and Studio recipe-artifact rules in scope

#### Scenario: Diff classification returns changed path classifications
- **WHEN** an agent classifies a literal Git diff or a `.diff`/`.patch` file
- **THEN** the output has schema version `1`, input kind `diff`, and a sorted
  path classification for each path collected from H8's `diff --git ... b/<path>`
  and `+++ b/<path>` parser
- **AND** the literal `/dev/null` marker is ignored rather than emitted as a
  target path

#### Scenario: Patch-file classification reads only diff-like patch files
- **WHEN** the classify target is an existing `.diff` or `.patch` file
- **THEN** Habitat treats the file as a diff only when it contains a Git diff
  header or `+++ b/` changed-file marker
- **AND** otherwise classifies the file path itself as a normal path target

#### Scenario: Workspace-level classification stays explicit
- **WHEN** a classified path does not belong to any discovered workspace
  project
- **THEN** the output reports `project: null`, a workspace-level note, and the
  established workspace required targets
