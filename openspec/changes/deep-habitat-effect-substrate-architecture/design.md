# Design: Effect Substrate Architecture

## Target Spine

```text
host adapter -> Habitat runtime -> domain service -> provider/resource
```

Host adapters parse host-specific inputs and render host-specific outputs.
Domain services make Habitat decisions. Providers acquire and execute external
capabilities. Resources are scoped through Effect.

## Target File Tree

The controlling tree is in
`docs/projects/habitat-harness/deep-refactor/effect-first-refactor-domino-plan.md`.
Implementation SHALL converge on these top-level source domains:

- `src/runtime/**`
- `src/config/**`
- `src/errors/**`
- `src/resources/**`
- `src/providers/{command,fs,clock,git,grit,biome,nx,husky,reporter,workspace-tools}/**`
- `src/domains/**`
- `src/public/**`

Existing `src/lib/**`, `src/base/**`, and `src/adapters/**` files remain only
until their logic is moved or their public adapter role is made explicit.

## State-Space Collapse

- Replace process helpers with `CommandRunner`.
- Replace direct env/path/cache construction with `HabitatConfig`.
- Replace thrown expected errors with tagged domain/provider errors.
- Replace direct temp/cache/file lifecycle with scoped resources.
- Replace optional dependency bags with Effect requirements and request unions.
- Replace mixed `ownerTool` internals with domain authority plus provider
  capability fields.
- Replace broad public barrels with explicit public contracts.
- Replace `src/lib`, `src/base`, and old `src/adapters` ownership with named
  runtime, provider, domain, command, and public homes.

## Public Contract Risks

- `CheckReport` schema version 1.
- `habitat check`, `fix`, `verify`, `graph`, `hook`, and `classify` output.
- Root package scripts and Husky delegators.
- `@internal/habitat-harness` package exports.
- D14A `.habitat` authored artifact paths.

## Implementation Gate

This design must be accepted before source implementation packets create or
move runtime/provider/domain modules.
