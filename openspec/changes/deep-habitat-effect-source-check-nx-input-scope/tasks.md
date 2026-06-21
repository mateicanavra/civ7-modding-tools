# Tasks

## 1. Implementation

- [x] 1.1 Route source-check Nx target inputs through exact path coverage.
- [x] 1.2 Keep scan roots only as fallback inputs for source-check rules without
      exact coverage.
- [x] 1.3 Preserve source-check module, manifest, rule metadata, and runtime
      inputs.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate deep-habitat-effect-source-check-nx-input-scope --strict`
- [x] 2.2 `bun run --cwd tools/habitat-harness check`
- [x] 2.3 `nx show project @internal/habitat-harness --json`
      - Confirmed `source:check` target has no `{workspaceRoot}/packages/**`
        broad input after exact coverage scoping.
- [x] 2.4 `bun run biome:ci`
- [x] 2.5 `git diff --check`
- [x] 2.6 `nx run @internal/habitat-harness:source:check`
