# Tasks

## 1. Implementation

- [x] 1.1 Add inferred Nx project nodes for the six Habitat architecture roots.
- [x] 1.2 Add `habitat:*` tags and dependency constraints to taxonomy and
  `eslint.boundaries.config.mjs`.
- [x] 1.3 Add package subpath resolution for Habitat internal roots.
- [x] 1.4 Rewrite cross-root Habitat imports to scoped package subpaths.
- [x] 1.5 Keep the Nx plugin bootstrap on source-local imports with a narrow
  boundary allowlist.
- [x] 1.6 Remove duplicate import-edge legality replay from taxonomy validation.

## 2. Verification

- [x] 2.1 `NX_DAEMON=false nx show projects --json`
- [x] 2.2 `NX_DAEMON=false nx run @internal/habitat-harness:boundaries --outputStyle=static`
- [x] 2.3 `bun run --cwd tools/habitat-harness validate:boundary-taxonomy`
- [x] 2.4 `bun run --cwd tools/habitat-harness check`
- [x] 2.5 `bun run --cwd tools/habitat-harness build`
- [x] 2.6 `bun run --cwd tools/habitat-harness test`
- [x] 2.7 `NX_DAEMON=false nx run @internal/habitat-harness:build --skipNxCache --outputStyle=static`
- [x] 2.8 `bun run openspec -- validate deep-habitat-effect-nx-internal-boundary-topology --strict`
- [x] 2.9 `bun run openspec:validate`
- [x] 2.10 `bun run biome:ci`
- [x] 2.11 `git diff --check`
- [x] 2.12 Source CLI graph smoke reports package plus six internal projects.
- [x] 2.13 Clean rebuilt CLI graph smoke reports package plus six internal projects.
