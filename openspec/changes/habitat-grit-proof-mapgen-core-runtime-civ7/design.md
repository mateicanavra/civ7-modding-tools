# Design - MapGen Core Runtime Civ7 Closure

## Frame

### Objective

Close `grit-mapgen-core-runtime-civ7` as an active, registered Habitat Grit
check for MapGen core/engine runtime-coupling syntax.

### Product Movement

MapGen core is a pure TypeScript engine. This row keeps runtime Civ7 adapter
values, `/base-standard/` runtime paths, and direct engine globals out of
`packages/mapgen-core/src/core` and `packages/mapgen-core/src/engine` so
future edits do not reintroduce adapter-layer coupling.

### Selection

- Rule id: `grit-mapgen-core-runtime-civ7`
- Grit pattern: `mapgen_core_runtime_civ7`
- Pattern file: `.grit/patterns/habitat/checks/mapgen_core_runtime_civ7.md`
- Owner layer: `grit-check`
- Registry scope: `packages/mapgen-core/src/{core,engine}/**/*.ts`
- Predicate scope: `packages/mapgen-core/src/core/**/*.ts` and
  `packages/mapgen-core/src/engine/**/*.ts`
- Predicate classes:
  - value-bearing static imports from `@civ7/adapter`,
    `@civ7/adapter/civ7`, or `/base-standard/...`;
  - side-effect imports from the same runtime sources;
  - mixed value/type imports where at least one imported binding is a value;
  - member expressions on `GameplayMap`, `TerrainBuilder`,
    `ResourceBuilder`, `FeatureBuilder`, `AreaBuilder`,
    `MapConstructibles`, or `GameInfo`.
- Explicit controls:
  - pure `import type` adapter imports;
  - single-line pure inline `import { type ... }` adapter imports;
  - paths outside core/engine, `.tsx`, package/test paths, source lookalikes,
    and local identifier-name lookalikes.

### Hard Core

1. This is a check proof, not an apply proof.
2. Type-only adapter imports are not runtime coupling for this row because the
   registry forbids adapter value imports and runtime globals.
3. Native fixtures, parser inventory, Habitat wrapper behavior, baseline
   behavior, injected proof, and product/runtime behavior are separate proof
   classes.
4. Parser inventory can prove zero current-source candidates, but not raw Grit
   acquisition or product behavior.
5. This row does not mutate MapGen source because the repaired current
   predicate has zero live value-bearing candidates.

### Exterior

- Broad type-reference policy for MapGen core.
- SDK mapgen entrypoint proof, adapter base-standard import proof,
  direct-control/runtime product proof, or neighboring row closure.
- Source remediation or migration.
- Generic apply/codemod safety.
- Raw direct Grit acquisition and Effect adapter proof.
- Product/runtime Civ7 behavior.

### Falsifier

This checkpoint fails if value-bearing import fixtures do not report, if pure
type-only imports report, if current source has live value-bearing candidates
that are recorded as clean, if wrapper/injected proof is inferred from native
fixtures alone, or if raw acquisition/product proof is claimed.

## Source Synthesis

`packages/mapgen-core/AGENTS.md` and `packages/mapgen-core/src/AGENTS.md`
define MapGen core as pure TypeScript domain logic. Runtime Civ7 interaction
goes through adapter/control layers.

`rules.json` registers `grit-mapgen-core-runtime-civ7` as an enforced
`grit-check` scoped to `packages/mapgen-core/src/{core,engine}/**/*.ts`,
forbidding Civ7 adapter value imports, `/base-standard` paths, and runtime
globals.

`taxonomy.md`, `invariant-corpus.md`, and the engine-refactor packet record
the same owner boundary: MapGen core is `kind:engine` and should not depend on
Civ7 runtime values.

The accepted `habitat-grit-core-purity-wrapped-test` row is adjacent context:
it proves a wrapped-test source scan for MapGen core production purity. This
row remains Grit-owned and proves the registered Grit syntax guard.

## Fixture Matrix

| Class | Expected behavior |
| --- | --- |
| Core/engine value import from `@civ7/adapter` | Reports |
| Core/engine value import from `@civ7/adapter/civ7` | Reports |
| Core/engine value import from `/base-standard/...` | Reports |
| Core/engine side-effect import from adapter or `/base-standard/...` | Reports |
| Core/engine mixed value/type import from adapter | Reports |
| Core/engine member expression on listed Civ7 globals | Reports |
| Core/engine pure `import type` adapter import | Does not report |
| Core/engine pure inline `import { type ... }` adapter import | Does not report |
| Authoring, adapter-style, package, map, test, `.tsx`, and non-core/engine paths | Do not report |
| Source lookalikes such as `@civ7/adapterish` or `/base-standardish/...` | Do not report |
| Local identifiers or interface names containing runtime global names | Do not report unless they form the member-expression predicate |

## Proof Contract

This row may record:

- `MCR-PREDICATE-REPAIR-2026-06-16`: repaired native predicate for
  value-bearing static imports and runtime globals.
- `MCR-NATIVE-FIXTURES-2026-06-16`: native fixture/parser-edge proof for
  import, runtime-global, path, and type-only control classes.
- `MCR-CORE-INVENTORY-2026-06-16`: parser inventory/live zero-candidate
  evidence over current MapGen core/engine roots.
- `MCR-PER-RULE-SELECTOR-2026-06-16`: Habitat per-rule wrapper proof.
- `MCR-HABITAT-GRIT-TOOL-2026-06-16`: aggregate `grit-check` wrapper proof.
- `MCR-BASELINE-FILES-2026-06-16`: explicit empty baseline and
  `baseline-integrity` proof.
- `MCR-INJECTED-PROBE-2026-06-16`: row-specific injected violation and
  path-control proof.

This row must not record:

- raw direct Grit acquisition;
- generated-output edits;
- Effect adapter proof;
- apply safety;
- retired parity;
- neighboring adapter/sdk/runtime row closure;
- broad type-reference closure;
- product/runtime proof.

## Downstream Records

The aggregate proof matrix, command proof log, and corpus ledger are updated
for this row's current active-check closure. Recovery ledger, taxonomy,
invariant corpus, and command docs remain unchanged because the product policy
is existing authority; this row repairs and proves the executable Grit check.
