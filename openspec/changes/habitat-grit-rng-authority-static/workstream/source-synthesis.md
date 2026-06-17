# Source Synthesis - RNG Authority Static

## Authority

`docs/projects/habitat-harness/invariant-corpus.md` classifies
`rng-authority-boundary` as an architecture test with disposition
`keep-as-test (runtime semantics)`. `docs/projects/habitat-harness/taxonomy.md`
lists `scope:rng-authority` as "no engine RNG / official generators in authored
generation" and names `rng-authority-boundary.test.ts` as the provenance that
stays a test.

`tools/habitat-harness/src/rules/rules.json` already registers
`arch-test-rng-authority` as an enforced `wrapped-test` rule with detect command
`nx run mod-swooper-maps:test:architecture-rng-authority --outputStyle=static`.
`mods/mod-swooper-maps/package.json` exposes the package script and Nx target.

## Test Surface

`mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts` scans
`src/domain` and `src/recipes/standard` `.ts` files. It reports direct adapter
RNG, `TerrainBuilder.getRandomNumber`, ambient `Math.random`, official
lake/biome/feature/snow/resource/discovery/start generator calls, and internal
RNG imports from `@swooper/mapgen-core/lib/rng`.

`mods/mod-swooper-maps/test/pipeline/standard-rng-authority.test.ts` proves the
standard recipe runtime does not consume adapter RNG during authored generation.
That runtime proof is useful authority context, but this row's Habitat rule
proof is the wrapped `rng-authority-boundary` target.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint. Adding an active
Grit check would duplicate the wrong owner layer and would not prove the runtime
RNG-consumption behavior recorded by the existing test suite.

## Current Evidence

- The package-owned Nx target passes.
- Habitat per-rule wrapper selection for `arch-test-rng-authority` passes.
- Aggregate `wrapped-test` includes the RNG rule as passing, while remaining
  current-red for separate Swooper map bundle freshness.
- The explicit empty Habitat baseline for `arch-test-rng-authority` exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, source remediation,
Swooper generated map freshness repair, aggregate wrapped-test closure,
classify/generator behavior, apply safety, retired parity, or product/runtime
proof is claimed.
