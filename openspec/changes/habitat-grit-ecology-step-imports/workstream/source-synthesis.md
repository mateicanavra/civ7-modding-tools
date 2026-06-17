# Source Synthesis - Ecology Step Imports Wrapped-Test

## Authority

`tools/habitat-harness/src/rules/rules.json` registers
`arch-test-ecology-step-imports` as an enforced `wrapped-test` rule with detect
command
`nx run mod-swooper-maps:test:architecture-ecology-step-imports --outputStyle=static`.
The rule forbids ecology steps deep-importing ops/rules and the presence of
retired stage directories.

`mods/mod-swooper-maps/package.json` exposes that target as
`bun test test/ecology/ecology-step-import-guardrails.test.ts` with upstream
build dependencies through Nx. `mods/mod-swooper-maps/AGENTS.md` keeps ecology
ops under `src/domain/ecology/ops` and the recipe step layer as the composition
surface.

The M2 ecology architecture alignment milestone records that step runtime code
must not import `@mapgen/domain/ecology/ops` implementations.

## Test Surface

`mods/mod-swooper-maps/test/ecology/ecology-step-import-guardrails.test.ts`
now has three executable checks:

- retired wrapper/generic ecology step directories are absent;
- active ecology stage roots have no static imports or re-exports from
  `@mapgen/domain/ecology/ops` or `@mapgen/domain/ecology/rules`;
- fixture-like parser samples prove value/type/namespace/side-effect imports,
  named re-exports, and export-star sources report, while public root imports,
  dynamic imports, and source strings stay outside the row.

## Disposition

The candidate is resolved as a wrapped-test proof checkpoint with a test repair.
Adding an active Grit check would duplicate the wrong owner layer and would not
own the package architecture target already registered by Habitat.

## Current Evidence

- The package-owned Nx target passes.
- Habitat per-rule wrapper selection for `arch-test-ecology-step-imports`
  passes.
- Aggregate `wrapped-test` passes from the corrected current HG head: ecology,
  map-bundle runtime imports, all other wrapped-test rules, and
  `baseline-integrity` are green.
- Parser inventory found 44 active ecology stage `.ts` files, 189 imports, 30
  public ecology root references, zero forbidden ecology ops/rules import or
  export findings, zero dynamic imports, zero source-string findings, and no
  retired ecology topology directories.
- The explicit empty Habitat baseline for `arch-test-ecology-step-imports`
  exists.

## Non-Claims

No active Grit rule, Grit baseline, injected Grit probe, source remediation,
dynamic import closure, source-string closure, broad domain import
normalization, ecology-owned generated-output freshness repair,
classify/generator behavior, apply safety, retired parity, or product/runtime
proof is claimed.
