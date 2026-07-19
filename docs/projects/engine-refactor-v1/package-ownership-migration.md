# MapGen Package Ownership Migration

Status: `accepted-pre-a2-migration`

This document defines the package and tooling correction that must land before
A.2 begins. It refines the package-boundary work in the architecture
normalization packet without changing its product, recipe, stage, or operation
semantics.

## Outcome

MapGen Core owns the generic authoring, compilation, execution, artifact, trace,
and reusable primitive substrate. Swooper Maps owns its complete map-generation
product: all six domain models and operations plus its recipes and product
policy. Civ7-specific bundle compatibility lives at the adapter boundary.
Diagnostic and development tools live with their actual reusable or product
owner, not in the shipped mod source tree.

This is a behavior-preserving ownership migration. It is not A.2 Authority, a
domain-interior redesign, or a generated-output certification exercise.

## Ownership Laws

1. `@swooper/mapgen-core` owns the MapGen authoring language, compiler,
   executor, artifact runtime, trace, optional step-facet dispatch, and
   genuinely generic algorithms and data-structure primitives. Purity or
   possible reuse alone does not transfer a product domain into Core.
2. Swooper Maps owns Foundation, Morphology, Hydrology, Ecology, Resources,
   Placement, its recipes, and its Civ7 product policy. Its runtime source tree
   does not own reusable SDK mechanics, bundler shims, or command-line tools.
3. `@civ7/adapter` owns Civ7 runtime adaptation and Civ7-specific map-script
   bundle compatibility. MapGen Core's build remains environment-neutral.
4. `@swooper/mapgen-viz` owns environment-neutral spatial projection contracts,
   builders, statistics, and materialization. `@swooper/mapgen-metrics` owns
   neutral measurement and target-evaluation primitives. `@civ7/map-policy`
   owns dependency-free static Civ7 map policy, including resource `Weight`,
   `MinimumPerHemisphere`, age validity, and the roster-independent
   `Staple`/`UnlocksCiv` fallback basis. `@civ7/adapter` exposes exact
   roster-dependent resource policy to planning through `EngineAdapter`;
   external live control and verification remain `@civ7/direct-control` work.
5. Package exports are the public dependency graph. Temporary aliases, deep
   source imports, and resolver plugins are deleted rather than preserved as a
   second graph.
6. Tests and active Habitat authority move with the behavior they own.
   Historical and archived records do not move merely to rewrite old paths.
7. Generated mod output is regenerated, never hand-edited and never treated as
   the source lint surface. Source contracts, builds, import boundaries, and
   runtime smoke tests are the proof owners.

## Domain Retention And Dependency Surfaces

All six domain roots and all 101 operation roots remain under
`mods/mod-swooper-maps/src/domain/`. They are Swooper's generation product,
even when an operation is deterministic, adapter-free, or potentially reusable.
Their contracts, strategies, rules, artifacts, policy, and behavior tests move
together only if a later product decision creates a real independent domain
package. This migration does not make that decision.

Generic mechanics may still be extracted into Core, Metrics, Viz, or another
named substrate when the contract is independent of Swooper's domain language
and has concrete consumers. Extract the capability; do not relocate a whole
domain merely to reach a helper inside it.

Delete the temporary `@mapgen/domain` TypeScript aliases and custom resolver.
Package-local domain internals use relative imports or finite mod-owned facades.
A consumer outside the mod receives the smallest real `mod-swooper-maps`
package export it needs, or the dependency is inverted around a genuinely
generic capability. Do not replace the alias with wildcard domain exports,
Core self-imports, or another compatibility graph.

## Tests And Authority

Domain and recipe behavior tests remain in Swooper Maps. Core tests own only
the SDK/runtime contract and generic primitives. Shared test helpers move to
Core only when they exercise that substrate rather than Swooper domain policy.

Active Habitat authority continues to govern the mod-owned domain roots. Alias
removal updates the smallest active import rules, fixtures, manifests, and
baselines needed to preserve the same predicates; it does not relocate domain
authority or rewrite historical receipts.

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

- Keep trace as Core-owned causal execution evidence. Diagnostics are commands
  and workflows that consume trace, metrics, or visualization; they are not a
  fourth payload subsystem or an `observability` package.
- Move adapter-backed engine heightfield observation to
  `@civ7/adapter/mapgen`.
- Move pure layer contracts, builders, bounds/statistics, and materialization
  from Core and duplicated consumers into environment-neutral
  `@swooper/mapgen-viz`. Studio owns browser transport/state/rendering.
  `@swooper/mapgen-diagnostics` owns reusable Node/Bun path-backed capture,
  evidence reads, exact binary admission, inventory, and neutral diffing;
  Swooper owns Standard replay, product reports, thresholds, and command UX.
- Add optional `viz` and `metrics` declarations to `createStep` only through an
  executor-owned post-provides facet hook. Facets receive the typed step result
  plus immutable config/dimensions, never mutable context or operations; trace
  remains inside `run`. Completed Standard product metrics remain run-level.
- Let step `provides` name `ArtifactModule` values directly and derive provider
  contracts/runtimes once, deleting the duplicate implementation-level artifact
  tuple without introducing a registry or hidden lookup.
- Keep Swooper-specific analysis, profiling, placement policy, and diagnostic
  command entrypoints in the mod. Reusable live verification moves only in its
  later package slice; no diagnostic package may acquire Civ7 control.
- Extract pure count, numeric, and component measurement plus `MetricTarget`
  evaluation into `@swooper/mapgen-metrics`. The Standard recipe owns product
  provenance, sample and cohort membership, admitted preset scenarios, seed
  cases, typed artifact capture, semantic metric families, and concrete product
  targets under `src/recipes/standard/metrics`. Tests assert those shared
  targets, and thin commands may report them; one captured generation can be
  evaluated by multiple targets without rerunning it.
- Standard placement and resource metric families now own completed-map seating, legality,
  freshwater opportunity, fertility, fairness, realized support, complete resource admission,
  authored resource-range evidence, geological clustering, latitude/sector distribution, and
  qualifying-landmass density. Standard and Earthlike targets own only the accepted budgets;
  provisional resource ranges remain measurements. The mixed E1/E2/E3 harness is deleted rather than moved:
  synthetic operation probes remain behavior tests, while roster-dependent policy is a declared
  adapter input and its product behavior is covered by bounded live verification.
- Delete both milestone-scoped placement live probes rather than promoting
  their incomplete comparison models into a reusable package API. Preserve
  their historical evidence. Static resource facts and fallback admission stay
  in dependency-free `@civ7/map-policy`; exact `isResourceRequiredForAge`
  stays roster-dependent and flows through `EngineAdapter`. An unavailable
  engine answer admits only age-valid `Staple`/`UnlocksCiv` basis; all other
  cases remain unresolved rather than becoming false.
- Empty and delete `mods/mod-swooper-maps/src/dev` and its TypeScript config.

The tooling package train is deliberately narrow: `mapgen-diagnostics` now,
then reusable file-plan mechanics, then reusable live verification. Until their
own slices land, live commands and `scripts/map-artifacts/{file-plan,write-file-plan}.ts`
remain together under Swooper ownership; none belongs in Core.

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
   close the retained Swooper corpus and carry domain documentation repairs
   with the semantic slice that owns the affected surface.
3. **Bundle compatibility authority.** Establish adapter-owned map-script build
   support, neutralize Core's build, remove duplicate shims, and prove both
   Swooper and Studio-run bundling.
4. **Map product metrics authority.** Extract the pure measurement and target
   engine, run the Standard recipe once per admitted scenario, capture stable
   evidence, centralize concrete product targets beside the recipe, and keep
   tests and thin reports as consumers rather than owners of product authority.
5. **Development-tool ownership.** Collapse artifact-provider authorship,
   consolidate the pure visualization model, migrate stable step projections
   through the post-provides facet, move live policy and Swooper-specific
   commands to their real owners, and delete `src/dev`.
6. **Core development boundary.** Remove Swooper taxonomy and product-specific
   diagnostics from Core; promote only neutral primitives into Trace, Metrics,
   or Viz and keep product consumers in the mod.
7. **Domain dependency surface.** Keep all six domains in Swooper, replace the
   fake `@mapgen/domain` graph with finite real ownership surfaces, and delete
   obsolete resolver paths without changing domain behavior.

Slice boundaries may combine only when implementation proves one inseparable
contract; file count is not a reason.

## Proof

Every slice runs its owner-local build, typecheck, and tests through one native
Nx graph. The final package boundary additionally proves:

- Core and Swooper build, typecheck, and test from normal package imports.
- Swooper's `test:studio-run-in-game` lane remains green;
- Habitat policy and import boundaries govern the new paths;
- no production import uses `@mapgen/domain` or a custom domain resolver;
- no Swooper domain implementation or product taxonomy is exported by Core;
- Foundation, Morphology, Hydrology, Ecology, Resources, and Placement remain
  mod-owned, with all 101 operation roots under the Swooper source tree;
- Swooper and Studio-run bundles build with one adapter-owned compatibility
  surface;
- `test/build/map-bundle-runtime-compatibility.test.ts` proves the embedded-V8
  compatibility constraints for both bundle paths;
- Knip finds no dead exports introduced by the completed moves.

Generated byte or digest equality is not a gate. Build correctness, public
contract preservation, deterministic behavior tests, and bounded runtime smoke
are the relevant oracles.

## Workspace And Project References

Only after these package ownership and public dependency surfaces are final,
migrate the workspace from
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
- No Swooper domain-root move or domain-package split.
- No recipe, stage, config, runtime, or product behavior change.
- No compatibility package, broad barrel, second task graph, custom compiler
  verifier, or generated-output lint regime.
- No manual stack replay. Final ancestry uses native Graphite restack and
  ordinary semantic layers.
