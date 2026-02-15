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
bun run test:vitest
```

To run only the mapgen-core Bun tests:

```bash
bun run test:mapgen
```

To run only the mod tests:

```bash
bun --cwd mods/mod-swooper-maps test
```

## Visualizing test runs

```bash
bun run test:ui
```

Opens the interactive Vitest UI for all workspaces.

## Running a single workspace

```bash
bun run test:vitest -- --project <name>
```

Use the project name from `vitest.config.ts` (`cli`, `sdk`, `docs`, or `playground`) to target an individual suite.

Each app and package includes a minimal smoke test and a local `TESTING.md` describing recommended scenarios to cover.

## Physics-Truth Guardrails (Swooper Maps)

For `mods/mod-swooper-maps`, CI/local validation should include:

- Deterministic placement suite (`test/placement/**`) validating stamp-based resources/wonders/discoveries.
- Hydrology regression suite (`test/map-hydrology/**`, `test/hydrology-plan-lakes.test.ts`) validating sink-driven lake planning and runtime fill parity.
- Static policy scans (`test/ecology/no-fudging-static-scan.test.ts`) enforcing no RNG/fudge constructs and no legacy generator call/module usage in scoped ecology/hydrology/placement surfaces.

When these fail, treat them as architecture regressions rather than tuning noise.
