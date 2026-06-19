# Habitat Toolkit Scenarios

This document names concrete scenarios Habitat supports now and concrete
scenarios it does not yet support. Treat it as the practical product boundary
for agents entering the toolkit.

## Supported Today

### Classify A Path Before Editing

Use:

```bash
bun run habitat classify mods/mod-swooper-maps/src/recipes/standard/recipe.ts
```

Supported outcome:

- owning Nx project is identified;
- project root and tags are reported;
- D2-backed rule-routing facts are reported;
- graph-backed target guidance is reported;
- unavailable target facts are separated from runnable commands.

Use this before touching unfamiliar code.

### Classify A Diff Or Patch

Use:

```bash
bun run habitat classify path/to/change.patch
```

Supported outcome:

- each changed path gets a separate classification;
- workspace-level paths get workspace gates;
- project-owned paths get project guidance and Habitat gates;
- malformed or pathless diffs are refused instead of reported as successful
  empty classifications.

This supports handoff after broad edits, especially when a patch crosses package
or mod boundaries.

### Run The Full Habitat Rule Pack

Use:

```bash
bun run habitat:check
```

Supported outcome:

- all selected Habitat rules run;
- baselines are applied;
- baseline integrity is checked;
- enforced findings fail;
- advisory findings report without failing;
- JSON output is available with `bun run habitat check -- --json`.

### Run Graph-Owned Repo Proof

Use:

```bash
bun run verify
bun run check
```

Supported outcome:

- Nx expands task dependencies from the graph;
- package checks run through owning targets;
- Habitat checks participate through `habitat:check` where configured.

Use root Nx scripts for review-grade proof.

### Run Diagnostic Habitat Verify

Use:

```bash
bun run habitat verify -- --base <ref>
```

Supported outcome:

- Habitat check runs first;
- affected Nx verification runs only if Habitat check passes;
- JSON mode can emit a structured proof artifact.

This is useful for diagnostic proof slices, not as a replacement for root graph
proof.

### Scaffold A Uniform Workspace Project

Use:

```bash
nx g @internal/habitat-harness:project map-tools --kind=foundation
nx g @internal/habitat-harness:project graph --kind=plugin
nx g @internal/habitat-harness:project map-console --kind=app
```

Supported outcome:

- canonical root and package name are enforced;
- package metadata and `kind:*` tag are written;
- TypeScript config, source stub, test stub, and README are written;
- Nx can discover the generated project.

Not supported by this scenario:

- `kind=mod`;
- `kind=engine`;
- `kind=control`;
- `kind=adapter`;
- `kind=sdk`;
- `kind=tooling`;
- MapGen recipe/domain/stage/step authoring.

### Draft A New Grit Rule Candidate

Use:

```bash
nx g @internal/habitat-harness:pattern grit-my-rule
```

Supported outcome:

- candidate manifest and candidate pattern draft are written under
  `tools/habitat-harness/src/rules/pattern-authority/candidates`;
- no active enforcement state is created;
- the candidate remains outside the rule pack until promoted.

This is the correct first move for a new rule idea.

### Promote A Grit Rule After Authority Is Accepted

Use the same generator with registered lifecycle flags only after a Pattern
Authority Manifest and baseline contract exist.

Supported outcome:

- accepted manifest is validated;
- baseline contract is validated;
- active check pattern is written;
- `rules.json` is updated;
- hook scope is recorded only when the manifest and invocation agree.

This supports disciplined rule admission. It does not decide whether the rule is
useful; the manifest and review must establish that.

### Apply The Approved Deep Import Repair

Use:

```bash
bun run habitat:fix -- --dry-run
bun run habitat:fix
```

Supported outcome:

- Habitat runs the wired Grit apply pattern for domain ops deep imports;
- live writes require clean worktree state;
- unapproved writes are blocked;
- changed files are handed to Biome;
- transaction proof captures changed paths and diff evidence.

This is the only generic `habitat fix` codemod path that should be assumed
available in the current toolkit.

### Run Local Hooks

Use:

```bash
bun run habitat hook pre-commit
bun run habitat hook pre-push
```

Supported outcome:

- local staged feedback runs through Habitat;
- Graphite-aware pre-push affected proof can run;
- hooks reduce friction before CI/review.

Hooks are not authoritative product proof.

## Not Supported Yet

### Generate A New MapGen Recipe

Desired command shape does not exist yet.

Unsupported outcome:

- creating recipe root files;
- creating stage order;
- binding domain ops;
- emitting recipe metadata/artifacts;
- proving recipe compilation.

### Generate A New MapGen Domain

Desired command shape does not exist yet.

Unsupported outcome:

- creating domain public surfaces;
- creating ops/public config topology;
- registering domain ops;
- aligning recipe imports to the new domain;
- proving domain contracts through package tests.

### Generate A Domain Operation

Desired command shape does not exist yet.

Unsupported outcome:

- creating operation implementation;
- creating input/default/schema/contract shape where needed;
- updating the domain ops registry;
- checking runtime/import boundary rules for the new operation.

### Generate A Recipe Stage

Desired command shape does not exist yet.

Unsupported outcome:

- creating the stage directory;
- creating stage contract/default/schema files;
- updating recipe stage ordering;
- wiring steps into the stage.

### Generate A Recipe Step

Desired command shape does not exist yet.

Unsupported outcome:

- creating a step implementation;
- creating or updating step contract/default/schema files;
- inserting the step into a stage;
- binding a domain operation to the step.

### Automatically Fix Every Grit Finding

Unsupported outcome:

- mapping every diagnostic rule to an apply pattern;
- applying helper-redeclaration fixes through `habitat fix`;
- repairing architecture violations that require semantic decisions;
- applying rewrites without per-pattern proof.

### Prove A Generated MapGen Authoring Flow

Unsupported outcome:

- generate domain + op + stage + step;
- wire it into recipe topology;
- run Habitat, Nx, package tests, and recipe compilation as one accepted product
  proof.

This is the next major product loop to build.

## Scenario Selection Rule

If the scenario is about detecting, classifying, routing, checking, or guarded
repair of existing structure, first look for the supported Habitat surface.

If the scenario is about creating MapGen recipe/domain/op/stage/step topology,
assume it is not supported until a generator and acceptance test exist.
