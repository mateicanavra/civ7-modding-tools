# Habitat Toolkit Scenarios

This document names concrete scenarios Habitat supports now and concrete
scenarios it does not yet support. Treat it as the practical product boundary
for agents entering the toolkit.

## Supported Today

### Classify A Path Before Editing

Use:

```bash
bun habitat classify mods/mod-swooper-maps/src/recipes/standard/recipe.ts
```

Supported outcome:

- owning workspace project is identified;
- project root and tags are reported;
- D2-backed rule-routing facts are reported;
- graph-backed target guidance is reported;
- unavailable target facts are separated from runnable commands.

Use this before touching unfamiliar code.

### Classify A Diff Or Patch

Use:

```bash
bun habitat classify path/to/change.patch
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
nx run-many -t habitat:check
```

Supported outcome:

- all selected Habitat rules run;
- baselines are applied;
- baseline integrity is checked;
- enforced findings fail;
- advisory findings report without failing;
- JSON output is available with `bun habitat check --json`.

### Run Graph-Owned Repo Checks

Use:

```bash
bun run check
nx run-many -t habitat:check
bun run verify
```

Supported outcome:

- `check` runs graph-discovered package check targets;
- `nx run-many -t habitat:check` runs graph-owned Habitat structural targets;
- `verify` runs heavier package build/check/test verification targets;
- Habitat checks participate through generated owner-level `habitat:check`
  targets.

Use `bun run check` for package health, `nx run-many -t habitat:check` for
Habitat structural ownership checks, and `bun run verify` when the change needs
the heavier build/check/test aggregate. CI runs the full graph without
re-entering `verify`.

Pre-push is a local feedback path, not a synonym for `check:graph`: it checks
changed hook source paths in process, then runs affected package `check` and
explicit validation targets.

### Run Diagnostic Habitat Verify

Use:

```bash
bun habitat verify --base <ref>
```

Supported outcome:

- Habitat check runs first;
- human mode runs affected workspace verification only if Habitat check passes;
- JSON mode emits a structured verification receipt from the Habitat check and
  target plan without running the affected workspace lane.

This is useful for local verification receipts, not as a replacement for root
graph checks.

### Scaffold A Uniform Workspace Project

Use:

```bash
nx g @habitat/cli:project graph --kind=plugin
```

Supported outcome:

- canonical root and package name are enforced;
- package metadata and `kind:*` tag are written;
- TypeScript config, source stub, test stub, and README are written;
- the workspace graph can discover the generated project.

Not supported by this scenario:

- `kind=app`;
- `kind=foundation`;
- `kind=mod`;
- `kind=engine`;
- `kind=control`;
- `kind=adapter`;
- `kind=sdk`;
- `kind=tooling`;
- MapGen recipe/domain/stage/step authoring.

### Draft A New Habitat Pattern Candidate

Use:

```bash
nx g @habitat/cli:pattern my-rule
```

Supported outcome:

- candidate manifest and candidate pattern draft are written under
  `.habitat/patterns/candidates`;
- no active enforcement state is created;
- the candidate remains outside the rule pack unless a rule is authored and
  reviewed separately.

This is the correct first move for a new rule idea.

### Author An Active Habitat Rule After Review

Do not use the candidate generator as a promotion surface. Author and review a
location-independent `rule.json` with its explicit runner, artifacts, and
baseline contract.

Supported outcome:

- the active `rule.json` is validated;
- baseline contract is validated;
- registered lifecycle inputs are invalid at the candidate-generator schema;
- accepted active rules retain explicit runner, artifact, and baseline
  references;

This supports disciplined rule admission. It does not decide whether the pattern
is useful; the rule authority and review must establish that.

### Inspect Admitted Fix Plans

Use:

```bash
bun habitat fix --dry-run
bun habitat fix --dry-run --rule <id> --rule <id>
```

Supported outcome:

- Habitat derives admission only from registered `runner.fix` authority;
- omission plans every admitted rule in catalog order, while repeatable
  `--rule` selects one or many;
- invalid explicit selection refuses atomically before execution;
- admitted transformations report affected paths without writing.

This is the only current `habitat fix` capability. It is a no-write planning
surface, not a codemod path.

### Observe The Live-Write Refusal

Use:

```bash
bun habitat fix
```

Supported outcome:

- this is an immediate no-write refusal, not a repair command;
- refusal occurs before service or provider realization;
- no formatting, post-fix gates, rollback, transaction diff records, or
  commit-readiness result is produced.

**Gap and re-entry condition:** live apply is not implemented. A future design
must establish mutation authority and its complete safety proof before adding a
write-capable command state.

### Run Local Hooks

Use:

```bash
bun habitat hook pre-commit
bun habitat hook pre-push
```

Supported outcome:

- local staged feedback runs through Habitat;
- Graphite-aware pre-push affected verification can run;
- hooks reduce friction before CI/review.

Hooks are not authoritative product verification.

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

### Target Scenario: Automatically Fix Every Pattern Finding

This is a future / not implemented scenario. Current `habitat fix` remains a
no-write admission and dry-run diagnostic command.

Target outcome:

- mapping every diagnostic rule to an apply pattern;
- applying helper-redeclaration fixes through a future live-fix workflow;
- repairing architecture violations that require semantic decisions;
- applying rewrites without per-pattern validation.

### Validate A Generated MapGen Authoring Flow

Unsupported outcome:

- generate domain + op + stage + step;
- wire it into recipe topology;
- run Habitat, graph verification, package tests, and recipe compilation as one
  accepted product
  validation.

This is the next major product loop to build.

## Scenario Selection Rule

If the scenario is about detecting, classifying, routing, checking, or
no-write planning for explicitly admitted structure, first look for the
supported Habitat surface.

If the scenario is about creating MapGen recipe/domain/op/stage/step topology,
assume it is not supported until a generator and acceptance test exist.
