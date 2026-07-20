# Habitat Authoring Next

This document is the bridge from the current Habitat substrate to the missing
authoring workflow. It is the starting reference for the next agent building
generators and a future live-apply loop.

## North Star

Habitat should let an agent create correct MapGen structures faster than hand
authoring them from memory.

The next product milestone should be validated by an executable loop:

```text
Use Habitat to generate a new MapGen domain with one operation, wire it into a
new or existing recipe stage/step, run the generated structure through Habitat,
graph verification, and recipe compilation, and show the generated code is correct enough
for an agent to continue from it without hand-inventing topology.
```

This loop should drive design before additional rule, ledger, or documentation
work.

## Required First Investigation

Before implementing authoring generators, inspect current MapGen conventions:

- `docs/system/libs/mapgen/`
- `mods/mod-swooper-maps/src/domain/`
- `mods/mod-swooper-maps/src/recipes/standard/`
- `packages/mapgen-core/src/`
- relevant tests under `mods/mod-swooper-maps/test/`

The investigation should extract actual current topology, not desired topology.
Generator design must follow code that builds today.

## Recommended First Vertical Slice

The first useful authoring slice should be one end-to-end structure, not another
abstract generator shell.

Preferred slice:

1. Generate a domain operation skeleton in an existing domain.
2. Update the domain op registry/public surface required by current code.
3. Generate or update one recipe step that calls that operation.
4. Insert the step into an existing stage or generate a small dedicated stage if
   that is the clean current convention.
5. Run generated code through:
   - `bun habitat classify <generated diff>`;
   - owning package `check`;
   - owning package `test` where relevant;
   - `nx run-many -t habitat:check`;
   - recipe compilation or the closest current recipe validation.

If current conventions make this slice wrong, choose the smallest complete
authoring loop that crosses generation, wiring, and validation. Do not stop at files
that compile only because they are unused.

## Generator Acceptance Contract

Every authoring generator should demonstrate:

- it writes all required files;
- it updates all required registries;
- it refuses collisions before writes;
- it refuses invalid topology choices before writes;
- generated imports satisfy Habitat rules;
- generated files are classified to the expected owner and checks;
- generated structure builds and passes relevant tests;
- generated structure is understandable enough for a later agent to extend.

## Future / Not Implemented: Apply Pattern Acceptance Contract

This is a target scenario, not current `habitat fix` behavior. Today the command
only observes transformations admitted by registered `runner.fix` authority;
it refuses live writes before service realization. Every future apply pattern
should demonstrate:

- exact diagnostic rule or source shape it repairs;
- exact allowed roots;
- exact file-operation policy;
- structured rewrite inventory or isolated-copy diff evidence;
- target export existence when import paths are rewritten;
- no unapproved creates or deletes;
- package-local typecheck/test gate;
- dry-run behavior;
- live clean-worktree behavior;
- rollback behavior.

Do not present a pattern as a live `habitat fix` capability just because it has
adapter fixtures. Fixture validation is necessary, but not sufficient.

## Work Discipline

For this phase, product behavior outranks control-plane polish.

Prefer:

- failing acceptance tests before new prose;
- generated diffs before abstract capability claims;
- small complete vertical slices before broad scaffolding;
- code paths over historical records;
- explicit unsupported states over vague future tense.

Avoid:

- adding new documentation layers without generator validation;
- expanding rule-admission process for its own sake;
- treating rule-pack health as authoring capability;
- accepting "Habitat has generators" unless the generator serves the MapGen
  authoring loop being claimed.
