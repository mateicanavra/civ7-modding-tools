# Nx DAG Normalization Catalogue

## Frame

Product outcome: contributors and agents should not reason about task ordering
outside Nx. If one named task requires another named task, the relationship is
declared through Nx `dependsOn` in `nx.json`, a project `package.json`
`nx.targets` block, an owning package script inferred by Nx, or an inferred
Habitat target.

Leaf commands still exist. Nx tasks eventually run commands. The violation is
not "a command exists"; the violation is a shell script or runner layer encoding
task sequencing, cross-project freshness, or reusable proof ordering that Nx can
own natively.

## Corpus

Reviewed live active workflow surfaces:

| Surface | Count / Scope | Authority |
| --- | ---: | --- |
| Root scripts | Root `package.json` command surface | Root contributor entrypoints |
| Workspace manifests | 22 package manifests, 139 package scripts | Project task surfaces |
| Nx defaults/plugin | `nx.json`, Habitat inference plugin | Workspace DAG authority |
| Active automation | `.github/workflows/*.yml`, `.husky/*` | CI and local hook entrypoints |
| Habitat command layer | `verify`, `graph`, hooks, classify, command engine | Habitat CLI behavior |
| Live guidance | Root `AGENTS.md`, process/testing/Habitat docs | Agent and contributor policy |

Historical project records were excluded except as background. They document past
states and should not define current task authority.

## Classification

| Category | Definition | Normalized Shape |
| --- | --- | --- |
| Root aggregate shell chain | Root script chains reusable tasks with `&&`, `bun --cwd`, `bun --filter`, or nested runner commands. | Prefer the owning package target. Keep only true root maintenance commands direct. |
| Package aggregate shell chain | Package script sequences generation, typecheck, build, validation, or cleanup that are separable named tasks. | Package `nx.targets` define the chain; scripts become leaf commands. |
| Cross-project command | A package/root target reaches into another workspace by path/filter instead of a project target edge. | Owning project target plus `dependsOn` on required projects. |
| Habitat runner layer | Habitat command compensates for missing Nx graph edges by running broad checks or nested Nx. | Habitat exposes targetable rule/tool surfaces; root workflows depend on them. |
| Duplicate tool ownership | Root target repeats a tool command already owned by the Habitat Nx plugin. | Tool command lives once on the owning project; root aliases depend on it or call it directly through Nx. |
| CI ordering | GitHub Actions serializes graph tasks as separate proof steps. | CI calls the canonical root script that delegates to Nx-owned package targets. |
| Allowed leaf command | Command performs the named operation and does not encode dependency freshness. | Keep as the target command; add `dependsOn` only when it has named prerequisites. |

## Root Violations

| Entry | Category | Current Shape | Resolution |
| --- | --- | --- | --- |
| `lint` | Habitat runner layer | Runs graph lint plus Habitat check targets. | Root script delegates to Nx `run-many`; Habitat rule/tool ownership stays inferred by the Habitat plugin. |
| `check`, `ci` | Root aggregate shell chain | Broad repo proof entrypoints. | Root scripts invoke Nx `run-many` over graph targets instead of calling the Habitat runner as a hidden orchestrator. |
| `verify:*` aliases | Root verifier registry | Root exposed each focused Swooper/map-policy verifier as a package script. | Removed; root has one `verify` script and package-owned `verify` targets expose mode flags. |
| `civ7-map-policy:gen-tables` / `verify:civ7-map-policy-tables` | Root verifier registry | Root owned map-policy generation/check aliases. | Removed; `@civ7/map-policy:verify` owns check and `--write` regeneration. |
| `publish:sdk`, `publish:cli` | Cross-project command | Root published package directories directly. | Root aliases call package-owned publish targets. |
| `refresh:data`, `mods:import`, `test:cli:play`, `link:cli`, `unlink:cli` | Cross-project command | Root reached into packages by filter/path. | Root aliases call the owning CLI/plugin Nx targets where those targets exist. |
| Root `lint:*` rule aliases | Duplicate Habitat runner | Each alias called `habitat check --rule` or `--tool`. | Root aliases call exact inferred Habitat rule/tool targets through Nx. |
| True root maintenance scripts | Allowed leaf command | Docs serve, resources submodule scripts, Graphite import helpers. | Kept direct because their implementation is root-owned and not package-specific. |

## Package Violations

| Project | Entries | Resolution |
| --- | --- | --- |
| `@civ7/docs` | `dev`, `validate`, `build` | `sync`, docs validation, and link checking become target dependencies; dev/build scripts stop chaining local scripts. |
| `mapgen-studio` | `build` | Typecheck, Vite build, and worker-bundle check become target chain. |
| `mod-civ7-intelligence-bridge` | `build` | Modinfo generation, bundle, and generated-artifact cleanup become target chain. |
| `civ-mod-dacia` | `deploy`, `build:deploy` | Deploy depends on mod build and CLI build; build/deploy shell alias is retired from root workflow use. |
| `mod-swooper-maps` | `build`, `build:studio-deploy`, `build:studio-recipes`, `viz:*`, `diag:dump`, `deploy` | Generated maps, recipe artifact generation, diagnostics preflight, and deploy prerequisites become target dependencies. |
| `@civ7/control-orpc` | `build`, `check`, `lint:contract-ownership` | Bundle/type emission and contract rule checks become target dependencies. |
| `@civ7/direct-control` | `build` | Bundle and declaration emission become target chain. |
| `@mateicanavra/civ7-cli` | `build`, publish/pack lifecycle helpers | Build stages become target chain; explicit publish/pack targets own validation edges. Lifecycle scripts remain compatibility entrypoints only where package managers require them. |
| `@mateicanavra/civ7-sdk` | publish lifecycle helper | Explicit publish target owns build validation; lifecycle entrypoint remains compatibility-only. |
| `@internal/habitat-harness` | `build` | Build stages become target chain. |

## Active Automation And Docs Violations

| Surface | Finding | Resolution |
| --- | --- | --- |
| `.github/workflows/ci.yml` | CI serializes build, Biome, lint, and tests as separate workflow steps. | CI runs one root `ci` target after install. |
| `.github/workflows/publish.yml` | Publish workflow performs package validation and publishing outside root graph targets. | Publish job calls root publish targets. |
| Habitat pre-push hook | Uses `--excludeTaskDependencies`, disabling graph expansion. | Remove the flag so affected tasks keep dependency expansion. |
| Habitat classify guidance | Returns hardcoded command strings instead of graph target selectors. | Keep user-friendly commands, but point to graph-owned targets and root aggregates. |
| `tools/habitat-harness/README.md` and testing docs | Some guidance blesses excluded dependencies or package-local freshness. | Update current guidance to distinguish debug commands from graph-owned proof commands. |
| Habitat generated-zone verifier | Nested root proof and `git diff` against `HEAD` inside dirty worktrees. | The generated checker now compares post-regeneration bytes against its pre-run snapshot, preserves pre-existing untracked generated files, and receives policy-table verification through Nx `dependsOn`. |

## Design Decisions

1. Root proof paths are graph-owned without turning root `package.json` into a
   synthetic target registry. `bun run lint`, `bun run check`, `bun run verify`,
   and CI entrypoints must resolve into Nx-owned package targets.
2. Habitat CLI remains useful for diagnostics and hook UX, but root proof does
   not depend on a broad Habitat runner loop.
3. Habitat rule ownership is per project. The plugin must include every
   `ownerProject` in `rules.json`; missing owner roots are defects.
4. Tool targets should have one owner. Biome, boundaries, Grit, and generated
   checks live on `@internal/habitat-harness` unless a narrower project target
   is explicitly inferred.
5. Package lifecycle scripts may exist for package-manager compatibility, but
   explicit repo workflows must use Nx targets with declared dependencies.
6. Package-specific proof scripts live under the owning package. Root `scripts/**`
   is reserved for root-owned maintenance and must not become a domain script
   dumping ground.
7. Generated-zone checks compare the current working tree to the generator's
   output, not blindly to `HEAD`; uncommitted regenerated files are valid if the
   generator is idempotent.

## Implementation Closure Notes

- Root `lint`, `check`, `verify`, and `ci` are thin script entrypoints into Nx
  package targets.
- Package-local build/deploy/test aggregates were split into leaf commands plus
  per-project Nx target metadata (`package.json` `nx.targets` or
  `project.json`) dependency chains.
- Swooper verification scripts moved under `mods/mod-swooper-maps/scripts/**`
  and are selected by the package's single `verify` script.
- Map-policy generated table verification moved under
  `packages/civ7-map-policy/scripts/verify.ts`.
- `@civ7/adapter/manual-catalogs/discoveries` is a dist-backed public subpath
  because `mod-swooper-maps:verify -- --mode placement-catalogs` intentionally validates the adapter-owned
  manual discovery catalog.
- `mod-swooper-maps` live verification no longer imports `@civ7/plugin-mods`;
  it derives the user Civ Mods directory locally to avoid a mod-to-plugin
  project-plane edge.
- `packages/civ7-map-policy/scripts/verify.ts` is allowlisted in the adapter
  boundary check with the existing map-policy provenance files because it owns
  official-resource extraction paths for generated policy tables; it is not a
  runtime `/base-standard/` import.
- The generated map artifact drift was real: `studio-current` existed in source
  config but was missing from generated map entry metadata/text. Regeneration
  added `mods/mod-swooper-maps/src/maps/generated/studio-current.ts` plus the
  generated mod metadata rows.

## Verification Results

- `bun install` passed and refreshed `bun.lock`.
- `nx run mod-swooper-maps:gen:maps --output-style=stream` passed.
- `nx run @internal/habitat-harness:generated:check --output-style=stream`
  passed after the generated verifier snapshot repair and regenerated outputs.
- `nx run --project=@internal/habitat-harness --target=habitat:rule:workspace-entrypoints`
  passed after the simplification pass.
- `nx run @civ7/direct-control:build --output-style=stream` passed
  with explicit `project.json` targets for bundle emission, declaration
  emission, and the `nx:noop` aggregate.
- `nx run @internal/habitat-harness:build --output-style=stream`
  passed.
- `nx run @internal/habitat-harness:test --output-style=stream`
  passed.
- `bun run lint` reaches the graph-owned `lint,habitat:check` aggregate. The
  lint targets themselves pass, while current `habitat:check` targets fail on
  locked Habitat/Grit rule findings. Those findings are architecture debt that
  belongs to the prepared repair and per-pattern workstreams, not Nx workflow
  or dependency-resolution failure.
- `bun run verify` passed through package-owned `verify` targets.

## Falsifiers

- `nx show project` does not expose the inferred rule/tool/project targets
  expected by this catalogue.
- A converted aggregate target runs a dependent task in a different order than
  the old command where order is semantically required.
- A package-specific root workflow still calls `habitat check`, `bun --cwd`, or
  `bun --filter` to compensate for missing graph edges.
- CI still sequences graph proof as separate shell steps after this change.
- A `rules.json` owner has no matching inferred Nx project target.
