# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Import boundaries target scope
- Owner: Effect-first implementation lane
- Branch/Graphite stack: `agent-DRA-effect-import-boundaries-target-scope`
  stacked on `agent-DRA-effect-verify-json-receipt-boundary`
- Started: 2026-06-20
- Last updated: 2026-06-20
- Status: implemented and validated

## Objective

Make Habitat's project-plane boundary gate behave like a professional tool
boundary: Nx owns project import legality, Habitat reports it, and the target
only scans inputs that can affect that legality.

## Diagnosis

- `import-boundaries` aliases to `@internal/habitat-harness:boundaries`.
- The target previously ran `eslint .` and inherited `habitatInputs()`.
- `habitatInputs()` includes broad docs, rule metadata, Grit artifacts, and
  unrelated Habitat files, so routine refactor/doc churn can invalidate the
  full boundary target.
- Several `target-check` architecture-test rows remain in Habitat structural
  enforcement even though topology enforcement should live in Nx, Biome,
  Grit/source-check, or file-layer rules.

## Implementation Notes

- `boundaries` keeps the Nx/ESLint authority path, but its target inputs are now
  boundary-specific rather than all Habitat inputs.
- `format-ci` now executes through `BiomeProvider` inside structural-check
  execution, so Habitat diagnostics do not route one Biome command through an Nx
  graph target.

## Review Lanes

- Habitat execution lane: trace structural-check grouping and target execution.
- Vendor semantics lane: confirm Nx/Biome/Grit ownership boundaries.
- Nx boundary lane: trace command chain and cache/input model.
- Adversarial lane: reject duplicate boundary engines, tests-as-topology, and
  fallback/skip paths.

## Verification

- `bun run --cwd tools/habitat-harness check`
- `nx run @internal/habitat-harness:boundaries --skipNxCache --outputStyle=static`
- `bun run habitat -- check --tool import-boundaries --json`
- `bun run habitat -- check --json`
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec -- validate deep-habitat-effect-import-boundaries-target-scope --strict`
- `bun run openspec:validate`
- `git diff --check`
