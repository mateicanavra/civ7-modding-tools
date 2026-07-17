# MapGen Package Ownership Migration

Status: `accepted-pre-a2-migration`

This document defines the package and tooling correction that must land before
A.2 begins. It refines the package-boundary work in the architecture
normalization packet without changing its product, recipe, stage, or operation
semantics.

## Outcome

Reusable MapGen domain implementations live in MapGen Core. Swooper Maps owns
only its recipes and Civ7 product-specific domain policy. Civ7-specific bundle
compatibility lives at the adapter boundary. Diagnostic and development tools
live with their actual reusable or product owner, not in the shipped mod source
tree.

This is a behavior-preserving ownership migration. It is not A.2 Authority, a
domain-interior redesign, or a generated-output certification exercise.

## Ownership Laws

1. `@swooper/mapgen-core` owns reusable domain contracts, operations,
   strategies, rules, algorithms, and neutral runtime observability.
2. Swooper Maps owns recipes plus Civ7 product policy that is meaningful only
   for that mod. Its runtime source tree does not own reusable SDK mechanics,
   bundler shims, diagnostics, or live tooling.
3. `@civ7/adapter` owns Civ7 runtime adaptation and Civ7-specific map-script
   bundle compatibility. MapGen Core's build remains environment-neutral.
4. `@swooper/mapgen-viz` owns reusable dump/trace IO and visualization tooling.
   `@civ7/map-policy` owns reusable Civ7 map-policy live proofs.
5. Package exports are the public dependency graph. Temporary aliases, deep
   source imports, and resolver plugins are deleted rather than preserved as a
   second graph.
6. Tests and active Habitat authority move with the behavior they own.
   Historical and archived records do not move merely to rewrite old paths.
7. Generated mod output is regenerated, never hand-edited and never treated as
   the source lint surface. Source contracts, builds, import boundaries, and
   runtime smoke tests are the proof owners.

## Exact Domain Cut

Move these four complete domain roots from
`mods/mod-swooper-maps/src/domain/` to
`packages/mapgen-core/src/domains/`:

| Domain | Operation roots | Source files |
| --- | ---: | ---: |
| Foundation | 18 | 94 |
| Morphology | 19 | 126 |
| Hydrology | 19 | 125 |
| Ecology | 34 | 216 |
| **Total** | **90** | **561** |

The moved roots do not import Swooper recipes, maps, or development tools; have
no `@civ7/*` or Node dependencies; and contain only two cross-domain imports,
both from Ecology to Hydrology policy. Their consumers do move to the new
facades. Move each root intact and do not redesign operation interiors.

Keep these product-owned domains in Swooper Maps:

- Resources: 8 operation roots.
- Placement: 3 operation roots.

Those 11 contracts embed Swooper/Civ7 resource identity, catalogs, start
policy, or natural-wonder policy. Moving or splitting them now would change
authority rather than correct ownership. A later decision may extract a proven
reusable kernel; this migration does not invent one.

Core exposes only explicit domain subpaths:

```text
@swooper/mapgen-core/domains/foundation
@swooper/mapgen-core/domains/foundation/ops
@swooper/mapgen-core/domains/morphology
@swooper/mapgen-core/domains/morphology/ops
@swooper/mapgen-core/domains/hydrology
@swooper/mapgen-core/domains/hydrology/ops
@swooper/mapgen-core/domains/ecology
@swooper/mapgen-core/domains/ecology/ops
```

Do not add the domains to Core's broad root barrel. After the final consumer
moves, delete `@mapgen/domain` aliases and the custom resolver that supports
them.

Each listed Core entry is both a tsup entry and a package export. Its domain
root is the curated public facade for admitted model, policy, schema, and
artifact values; `/ops` is the operation catalog. Promote the 56 current deep
consumer imports through those finite facades rather than exposing wildcard
deep paths. Imports inside the moved Core sources use package-local relative
source imports, not `@swooper/mapgen-core` self-imports that resolve through
`dist`.

The retained domains expose the same two curated Swooper-owned facades:

```text
mod-swooper-maps/domains/resources
mod-swooper-maps/domains/resources/ops
mod-swooper-maps/domains/placement
mod-swooper-maps/domains/placement/ops
```

Promote the current retained-domain policy, schema, data, and artifact
consumers through those roots. Do not replace `@mapgen/domain/*` with another
wildcard compatibility surface.

## Tests And Authority

Move the 54 environment-neutral domain tests to
`packages/mapgen-core/test/domains/**`. Move both shared owners they consume:
promote the generic `compiler-helpers.ts` capability through the explicit
`@swooper/mapgen-core/testing` subpath so both Core and retained Swooper tests
consume one owner, and move the Foundation-specific
`tectonics-history-runner.ts` to Foundation test support. Keep these nine
product/recipe integrations in Swooper Maps:

- Foundation: `foundation-gates`.
- Morphology: `relief-metrics-consistency`, `mountain-range-length`,
  `terrain-relief-balance`, `compute-shelf-mask-margin-depth`.
- Hydrology: `hydrology-river-network-metrics`.
- Ecology: `biomes-stripes-regression`, `earthlike-balance-smoke`,
  `biomes-latcutoff-regression`.

Mechanically re-anchor active Habitat path scopes, owner-project identities,
imports, fixtures, manifests, and baselines required to keep existing authority
executable. The initial census found 99 active old-path or `@mapgen/domain`
references. Do not change rule ids, predicates, topology expectations, fixture
semantics, baseline contents beyond path relocation, or fix admission. After
the final move, update the A.2 launch frame to the new physical roots without
beginning A.2. Historical receipts remain historical.

## Bundle And Tool Owners

### Civ7 map-script build support

Create the build-time subpath `@civ7/adapter/map-script-build`. It owns:

- the TypeBox format/guard-emitter compatibility plugin required by final Civ7
  map bundles;
- one canonical `TextEncoder` compatibility banner.

Swooper's tsup build and the Studio run-manifest generator consume that one
surface. Delete their duplicate banners and deep Core build-helper imports.
Core's library build keeps TypeBox and workspace dependencies external so the
final Civ7 bundler sees and can transform their modules; it does not apply Civ7
shims or pre-bundle compatibility-sensitive TypeBox code. Pure UTF-8 encoding
belongs in Core's neutral encoding library, not a global polyfill module.

The bundle-sensitive test must prove no Civ7-unsupported Unicode syntax reaches
either shipped or Studio-run maps and exactly one `TextEncoder` bootstrap runs
before any pre-use. This is a bounded embedded-V8 compatibility oracle, not
general linting of generated output.

Delete Studio's `resolveJsToTsInRepo` and `mapgenDomainAlias` plugins once
normal package resolution proves the bundle. The current esbuild version has
already bundled the recipe without either resolver.

### Development and observation surfaces

- Move reusable Core runtime visualization helpers to the explicit
  `@swooper/mapgen-core/observability` subpath; do not root-export them.
- Move adapter-backed engine heightfield observation to
  `@civ7/adapter/mapgen`.
- Move generic dump IO, read/diff/list, and trace tooling to
  `@swooper/mapgen-viz/node` and `packages/mapgen-viz/tools`.
- Move Swooper-specific analysis, profiling, live, and placement commands to
  the mod's existing `scripts/{diagnostics,live,placement}` owners.
- Extract pure count, numeric, and component measurement plus `MetricTarget`
  evaluation into `@swooper/mapgen-metrics`. The Standard recipe owns product
  provenance, sample and cohort membership, admitted preset scenarios, seed
  cases, typed artifact capture, semantic metric families, and concrete product
  targets under `src/recipes/standard/metrics`. Tests assert those shared
  targets, and thin commands may report them; one captured generation can be
  evaluated by multiple targets without rerunning it.
- Keep the mixed placement-realignment harness in `src/dev/diagnostics` until
  its offline E1/E2/E3 measurements can be separated from synthetic probes and
  live/Studio evidence. Moving that file alone would not create a metrics
  component.
- Move reusable map-policy live checks to
  `packages/civ7-map-policy/scripts/live`.
- Empty and delete `mods/mod-swooper-maps/src/dev` and its TypeScript config.

Keep `scripts/map-artifacts/file-plan.ts` and `write-file-plan.ts` together in
Swooper. Their three consumers and their data model are product-specific; no
public Core build-support abstraction is earned.

### Categorical deletions

Delete the obsolete config-shape migration, standard-authoring report, and
tautological manual-placement catalog verifier. Delete the superseded
bathymetry, margin, shelf-spottiness, single deep-ocean census, and terrain
renderer, deep-ocean matrix, and reef census investigations once their useful
sampling predicates live in map product behavior tests; none of their file
shapes is a compatibility surface.

## Semantic Slices

Each slice is a complete Graphite layer with one primary implementation owner
and fresh sessions filling the permanent review roles.

1. **Dead development noise.** Delete only the proven-obsolete Swooper scripts
   and normalize the surviving operational task surface.
2. **Documentation authority.** Replace the stale Ecology-only checker with
   generic consumed-export JSDoc authority and semantic contract descriptions;
   close the retained Swooper corpus and carry moved-domain repairs with their
   destination slices.
3. **Bundle compatibility authority.** Establish adapter-owned map-script build
   support, neutralize Core's build, remove duplicate shims, and prove both
   Swooper and Studio-run bundling.
4. **Map product metrics authority.** Extract the pure measurement and target
   engine, run the Standard recipe once per admitted scenario, capture stable
   evidence, centralize concrete product targets beside the recipe, and keep
   tests and thin reports as consumers rather than owners of product authority.
5. **Development-tool ownership.** Move observability, dump IO, live policy,
   and Swooper-specific commands to their real owners; delete `src/dev`.
6. **Foundation.** Move the complete domain, neutral tests, exports, consumers,
   and active Habitat authority.
7. **Morphology.** Apply the same complete move.
8. **Hydrology.** Apply the same complete move.
9. **Ecology.** Move after Hydrology, then delete the final fake domain aliases
   and resolver paths. Assert exactly 90 moved and 11 retained operation roots.

Foundation precedes Morphology because three Morphology tests consume the
Foundation tectonics runner. Hydrology precedes Ecology. Those two dependency
chains may proceed independently. Slice boundaries may combine only when the
implementation proves one inseparable contract; file count is not a reason.

## Proof

Every slice runs its owner-local build, typecheck, and tests through one native
Nx graph. The final package boundary additionally proves:

- Core and Swooper build, typecheck, and test from normal package imports.
- Swooper's `test:studio-run-in-game` lane remains green;
- Habitat policy and import boundaries govern the new paths;
- no production import uses `@mapgen/domain` or the old Swooper paths;
- no Core domain imports Swooper, a mod, Node, or `@civ7/*`;
- exactly 90 operation roots moved and 11 product-owned roots remain;
- Swooper and Studio-run bundles build with one adapter-owned compatibility
  surface;
- `test/build/map-bundle-runtime-compatibility.test.ts` proves the embedded-V8
  compatibility constraints for both bundle paths;
- Knip finds no dead exports introduced by the completed moves.

Generated byte or digest equality is not a gate. Build correctness, public
contract preservation, deterministic behavior tests, and bounded runtime smoke
are the relevant oracles.

## Workspace And Project References

Only after this package topology is final, migrate the workspace from
TypeScript path aliases to package-manager workspaces and project references
using the Nx 23 guide. The migration must:

1. retain the existing Bun workspace roots and create or normalize manifests
   only for real package roots, never for Habitat's internal graph nodes;
2. add `@nx/js` at the exact workspace Nx version and register its TypeScript
   sync support without duplicating or shadowing existing tsup, Vite, Bun, or
   custom build targets;
3. keep `tsconfig.base.json` compiler-options-only and make root
   `tsconfig.json` the solution graph whose references are maintained by
   `nx sync`;
4. remove path aliases, including Core's internal `@mapgen/*`, in favor of
   workspace dependencies, explicit package exports, and package-local relative
   imports;
5. preserve separate discoverable configs only for genuinely distinct runtime
   environments and reserve `tsconfig.build.json` for narrower emit closures;
6. keep tsup, Vite, Bun, and custom build owners; TypeScript references do not
   replace bundlers or make `tsc` the build system;
7. remove resolver workarounds made obsolete by standard package resolution;
8. verify `nx sync`, the project graph, editor ownership, build/typecheck/test,
   caching, and continuous targets.

The TypeScript 7 CLI plus TypeScript 6 compiler-API bridge remains intact.
Project references are a follow-on to correct package ownership, not a tool for
preserving the old topology.

## Explicit Non-Goals

- No A.2 rules, blueprints, advisory census, operation-interior normalization,
  or domain migration ledger.
- No Resources/Placement redesign or move.
- No recipe, stage, config, runtime, or product behavior change.
- No compatibility package, broad barrel, second task graph, custom compiler
  verifier, or generated-output lint regime.
- No manual stack replay. Final ancestry uses native Graphite restack and
  ordinary semantic layers.
