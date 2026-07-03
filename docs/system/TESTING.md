# Testing

This repository uses [Vitest](https://vitest.dev/) for unit tests across most workspaces, and [Bun](https://bun.sh/) (`bun test`) for `@swooper/mapgen-core`.

## Running all tests

```bash
bun run test
```

Runs:

- `vitest` across all configured projects in `vitest.config.ts`
- `bun test` for `@swooper/mapgen-core`
- `bun test` for `mods/mod-swooper-maps`

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

Each app and package includes a minimal smoke test and a local `TESTING.md` describing recommended scenarios to cover.

## Physics-Truth Guardrails (Swooper Maps)

For `mods/mod-swooper-maps`, CI/local validation should include:

- Deterministic placement suite (`test/placement/**`) validating stamp-based resources/wonders/discoveries.
- Hydrology regression suite (`test/map-hydrology/**`, `test/hydrology/plan-lakes.test.ts`) validating sink-driven lake planning and runtime fill parity.
- Static policy scans (`bun habitat check --rule ecology-fudging-guardrails`) enforcing no RNG/fudge constructs and no legacy generator call/module usage in scoped ecology/hydrology/placement surfaces.
- RNG authority guards (`packages/mapgen-core/test/core/rng.test.ts`,
  `.habitat/civ7/mapgen/pipeline/_self/check/rng-authority-static/rng-authority-static.check.mjs`, and
  `mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts`)
  ensuring authored MapGen entropy comes from `env.seed`, not Civ7 adapter RNG
  or official generators.

When these fail, treat them as architecture regressions rather than tuning noise.
