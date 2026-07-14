# Testing

This repository routes project test suites through Nx. Projects use Vitest or
Bun according to their runtime and package contract.

## One graph per output namespace

Nx orders and deduplicates tasks inside one invocation. Put related targets in
one graph whenever they materialize or consume build output in the same
worktree:

```bash
nx run-many -t check,test --projects=mod-swooper-maps
```

Do not run independent output-producing Nx graphs concurrently in one
worktree, and do not create temporary worktrees for routine proof. Express the
dependency edges and let one native Nx graph schedule, deduplicate, cache, and
parallelize the work.

Nx-owned Habitat targets never invoke Nx recursively. Owner-local Habitat work
and concrete graph-backed rules are sibling leaves under dependency-only
`check:policy` owner targets. Public `check` targets compose `typecheck`,
`check:policy`, and upstream `check` targets; Nx chooses concurrency and restores
cached outputs once per graph.

Root `format` and `lint` are stable workspace operations backed by the Habitat
project's `format`, `lint`, and `check:hygiene` targets. Their private
implementations enforce canonical package-manifest ordering and source hygiene
without exposing vendor names as root task contracts. `habitat:check:hygiene`
owns the fast repository-wide native proof; `habitat:lint` retains the stricter
Effect audit over JavaScript and TypeScript sources while its inherited findings
are reduced monotonically.

TypeScript checks are observation-only. When the effective project config is
composite or incremental, invoke `tsc --noEmit` with `--composite false
--incremental false` so the check does not read or write shared build state.

## Running all tests

```bash
bun run test
```

This runs every project that currently exposes an Nx `test` target. Use
`nx show projects --with-target test` to inspect the current set.

To run only the Vitest projects:

```bash
bunx vitest run
```

To run only the mapgen-core Bun tests:

```bash
nx run mapgen-core:test
```

To run only the mod tests:

```bash
nx run mod-swooper-maps:test
```

To run only the Civ7 adapter tests:

```bash
nx run civ7-adapter:test
```

See the [Swooper Maps test corpus guide](../../mods/mod-swooper-maps/test/README.md)
for its current ownership and classification rules and its explicitly future
harness direction.

See the [MapGen Core test corpus guide](../../packages/mapgen-core/test/README.md)
for the generic component ownership tree.

## Visualizing test runs

```bash
bunx vitest --ui
```

Opens the interactive Vitest UI for all workspaces.

## Running a single workspace

```bash
bunx vitest run --project <name>
```

Use the project name from `vitest.config.ts` (`cli`, `sdk`, `docs`, or `playground`) to target an individual suite.

Test ownership and execution are declared by each project's Nx targets and its
nearest test-corpus guide. Bun and Vitest execute transpiled TypeScript; a
passing runtime suite does not substitute for a TypeScript target whose file
set includes that suite.

## Physics-Truth Guardrails (Swooper Maps)

For `mods/mod-swooper-maps`, CI/local validation should include:

- Placement domain suites (`test/domains/placement/**`, `test/domains/resources/**`) validating direct planning behavior, plus the concrete placement stage suite (`test/recipes/swooper-physics-standard/stages/placement/**`) validating projections and composition.
- Hydrology domain suite (`test/domains/hydrology/**`) validating direct hydrology behavior, plus concrete recipe and stage cases under `test/recipes/swooper-physics-standard/**` validating runtime fill and projection behavior.
- Habitat policy checks reported by `bun habitat classify` for the changed
  source scope. Structural and import invariants belong to Habitat rather than
  package tests that scan source text.
- RNG authority guards (`packages/mapgen-core/test/core/rng.test.ts`,
  `.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/check.mjs`, and
  `mods/mod-swooper-maps/test/recipes/swooper-physics-standard/recipe/standard-rng-authority.test.ts`)
  ensuring authored MapGen entropy comes from `env.seed`, not Civ7 adapter RNG
  or official generators.

When these fail, treat them as architecture regressions rather than tuning noise.
