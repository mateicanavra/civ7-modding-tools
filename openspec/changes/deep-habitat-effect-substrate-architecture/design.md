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

Existing `src/lib/**`, `src/base/**`, and any old adapter roots remain only
until their logic is moved into named substrate, provider, domain, service, or
host owners.

The current-to-target movement map for this packet is
`workstream/source-movement-map.md`. That file is controlling for later source
packets when deciding whether code is carried forward, split, facaded, or
deleted.

## State-Space Collapse

- Replace process helpers with `CommandRunner`.
- Replace direct env/path/cache construction with `HabitatConfig`.
- Replace thrown expected errors with tagged domain/provider errors.
- Replace direct temp/cache/file lifecycle with scoped resources.
- Replace optional dependency bags with Effect requirements and request unions.
- Replace mixed `ownerTool` internals with domain authority plus provider
  capability fields.
- Replace broad public barrels with explicit public contracts.
- Replace `src/lib`, `src/base`, and old adapter ownership with named
  runtime, provider, domain, command, and public homes.

## Ownership Model

The provider/domain/resource ownership catalog is
`workstream/domain-provider-ownership.md`. Later source packets must assign
each migrated capability to exactly one primary owner and obey the runtime edge
contract in that artifact:

- Runtime: Effect program execution and live/test layer assembly.
- Config: repo roots, harness roots, cache roots, vendor command policy, mode,
  and timeout policy.
- Resources: scoped filesystem, clock, temp/cache/write-set/lock lifecycle.
- Providers: external vendor/tool facts and command construction/execution.
- Domains: Habitat policy and state transitions.
- Public contracts: stable exports, command output, receipt/report schemas,
  and compatibility facades.

Expected failures use the `HabitatError` families named in the ownership
catalog. Generic thrown errors are not acceptable for user/tool/config/refusal
states after the relevant domain or provider packet migrates a module.

## Public Contract Risks

- `CheckReport` schema version 1.
- `habitat check`, `fix`, `verify`, `graph`, `hook`, and `classify` output.
- Root package scripts and Husky delegators.
- `@internal/habitat-harness` package exports.
- D14A `.habitat` authored artifact paths.

`workstream/public-contract-risk-register.md` is the required risk register for
later source packets. `workstream/public-surface-ledger.md` binds those risks to
concrete D0 matrix `surface_id` rows. A source packet that touches one of those
surfaces must cite the exact rows and record whether it preserves, facades,
versions, deprecates, or refuses the affected surface before closure.

## Implementation Gate

This design must be accepted before source implementation packets create or
move runtime/provider/domain modules.

Source implementation packets SHALL NOT:

- add new feature ownership under `src/lib/**`, `src/base/**`, or old adapter
  roots;
- create `src/domain/**` instead of `src/domains/**`;
- add a provider that also owns Habitat domain policy;
- add a domain service that reconstructs vendor command semantics locally;
- retain two active implementations for the same behavior after cutover;
- change command output, package exports, hook behavior, or authored artifact
  paths without a named public-contract handling decision.
