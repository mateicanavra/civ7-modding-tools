# Official Nx Documentation Evidence Pack

Retrieval date for all URLs: 2026-06-14.

## Frame Carried Forward

**Selection:** official Nx documentation only, focused on project graph ownership, inferred tasks, affected commands, tags/dependency constraints, plugins, generators, target existence, and enforcement boundaries relevant to Habitat Harness design/spec work.

**Foreground:** Nx as repo graph/task metadata authority; Habitat as repo-local operating layer that classifies before authoring, generates supported structure, delegates each invariant to one owner layer, and keeps records truthful to current behavior.

**Exterior:** final Habitat design authority, implementation, non-Nx vendor claims, blogs, examples as standalone authority, and model-memory claims. Grit and Biome are discussed only by negative boundary: no official Nx source here defines their semantics.

**Hard core:** official Nx docs support Nx owning project/task graph metadata, task orchestration, affected-scope calculation, plugin inference, generators/sync generators, and documented boundary enforcement surfaces. They do not by themselves prove that Nx should own every architecture invariant or every structural transformation.

**Falsifier:** reframe if a cited official Nx page is stale against the repo's installed Nx version, if current command behavior contradicts these docs, or if Habitat requires enforcement/transformation surfaces not documented by Nx.

## Sources

| ID | Official Nx source | Used for |
| --- | --- | --- |
| S1 | https://nx.dev/docs/concepts/mental-model | Project graph, task graph, affected mental model, caching inputs. |
| S2 | https://nx.dev/docs/reference/project-configuration | Project configuration sources, targets, tags, implicit dependencies. |
| S3 | https://nx.dev/docs/concepts/inferred-tasks | Plugin-inferred tasks, precedence, plugin ordering, stable graph-node output. |
| S4 | https://nx.dev/docs/reference/nx-json | Plugins array, include/exclude scoping, targetDefaults, generator defaults, sync config. |
| S5 | https://nx.dev/docs/features/run-tasks | Task definition and task-running surfaces. |
| S6 | https://nx.dev/docs/features/ci-features/affected | `nx affected` behavior, CI base/head, limitations. |
| S7 | https://nx.dev/docs/reference/nx-commands | `nx affected`, `nx show projects --with-target`, `nx show project`, `nx show target`. |
| S8 | https://nx.dev/docs/features/enforce-module-boundaries | Boundary-enforcement approaches. |
| S9 | https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries | ESLint module-boundary rule scope and limitation. |
| S10 | https://nx.dev/docs/enterprise/conformance | Language-agnostic conformance, enterprise/license constraint, custom rules. |
| S11 | https://nx.dev/docs/reference/conformance/overview | Conformance rule options, project-boundary constraints, ensure owners. |
| S12 | https://nx.dev/docs/enterprise/owners | Project-level ownership and CODEOWNERS compilation, enterprise constraint. |
| S13 | https://nx.dev/docs/concepts/nx-plugins | Plugin feature boundaries: infer tasks, generate code, maintain dependencies, executors. |
| S14 | https://nx.dev/docs/extending-nx/project-graph-plugins | Project graph plugin APIs, dynamic target migration caveat. |
| S15 | https://nx.dev/docs/concepts/sync-generators | Sync generators, graph-to-filesystem updates, CI `nx sync:check`. |
| S16 | https://nx.dev/docs/extending-nx/creating-files | Generator file creation, dry-run, overwrite strategies. |
| S17 | https://nx.dev/docs/extending-nx/composing-generators | Generator composition and codemods retaining `--dry-run`/Nx Console compatibility. |
| S18 | https://nx.dev/docs/extending-nx/organization-specific-plugin | Local plugin generators for organization-specific best practices. |

## Findings

1. **Nx project graph is the official graph substrate, but it is not the whole architecture model.** Nx says the project graph reflects repository source code and external dependencies, gathers project/task metadata, and can infer much metadata from existing config when plugins are installed. Nx also states it analyzes source code to create the Project Graph and uses project targets to create the Task Graph. (S1)

2. **Project graph and task graph are deliberately distinct.** Nx says the task graph is created from the project graph, but they are not isomorphic; project dependencies do not automatically mean same-target task dependencies. Task ordering must be expressed with target `dependsOn` or equivalent task pipeline config. (S1, S2)

3. **Project configuration has a documented precedence stack.** Nx constructs project configuration from inferred plugin tasks, workspace `targetDefaults`, and project-level `package.json`/`project.json`; later sources override earlier ones. The resolved configuration is inspectable with `nx show project <project> --web` or equivalent command output. (S2, S3)

4. **Target existence must be proved from resolved project/task metadata, not assumed from defaults.** Nx documents tasks as coming from package scripts, inferred tooling config, or project configuration, and documents `nx show projects --with-target <target>`, `nx show project`, and `nx show target <project>:<target>` for inspection. For Habitat records, the safe proof is the resolved Nx command output, not the presence of a `targetDefaults` key. (S5, S7)

5. **Inferred tasks are plugin-owned and config-file driven.** Nx plugins detect tool configuration files, infer runnable tasks, and infer command, cacheability, inputs, outputs, and task dependencies. Plugin processing order matters: if multiple plugins create the same task name, the later plugin in `nx.json` wins. Include/exclude globs can scope which config files a plugin processes. (S3, S4)

6. **Inferred plugin output must be deterministic.** Nx hashes the project graph node produced by plugins for cache reuse; official guidance says unstable `createNodes`/`createNodesV2` output causes cache misses and warns against nondeterministic ordering, machine-specific values, absolute paths, timestamps, random IDs, and environment leakage. (S3)

7. **Dynamic targets have a migration safety caveat.** Nx warns that targets created inside plugin code cannot be found by Nx migration generators. The documented mitigations are to create dynamic targets only for executors the plugin owns, or for third-party executors define only `executor` dynamically and require options in `targetDefaults`. (S14)

8. **`nx affected` is a graph-and-Git optimization, not an architecture proof.** Nx says affected uses Git changed files, the project graph, and dependent projects to identify an affected task subset, then runs specified tasks on that subset. CI should configure `base`/`head`; default local behavior uses `main` and the current filesystem. Nx also notes that changes to widely-used projects may still affect most of the workspace. (S6, S7)

9. **Tags and dependency constraints are documented project-level boundary inputs.** Nx project config supports `tags`; docs show using tag dimensions such as `scope:*` and `type:*` to express dependency constraints. Nx says dependency constraints can be enforced through ESLint or Conformance, and conformance `depConstraints` must include `sourceTag` or `allSourceTags`. (S2, S8, S10, S11)

10. **Boundary enforcement has two official paths with different limits.** `@nx/enforce-module-boundaries` is documented as an ESLint rule for JavaScript/TypeScript imports and `package.json` dependencies, and Nx explicitly says it requires ESLint and only works for JavaScript/TypeScript projects. Conformance's project-boundary rule is language-agnostic across all project dependencies, but it requires Nx Enterprise. (S8, S9, S10, S11)

11. **Project ownership is official but enterprise-gated.** Nx says the atomic unit of code in an Nx workspace is a project and `@nx/owners` lets teams define ownership in that project mental model, compiling project ownership into CODEOWNERS. The owners plugin and conformance `ensure-owners` rule require an active Nx Enterprise license. (S10, S11, S12)

12. **Generators are the official supported-structure mechanism.** Nx plugin docs list "Generate Code" as a plugin feature, and organization-specific plugin docs say Nx lets teams encode best practices in repository-tailored code generators. Generator docs support creating, updating, moving, and deleting files, using `--dry-run`, composing generators, composing codemods while retaining `--dry-run` and Nx Console compatibility, and choosing overwrite behavior. (S13, S16, S17, S18)

13. **Sync generators are the official graph-to-filesystem bridge.** Nx says sync generators can keep the repository in a correct state, including using the project graph to update files. Task sync generators run in dry-run mode and prompt locally or fail in CI if changes would be needed; global sync generators run via `nx sync`/`nx sync:check`, and Nx recommends `nx sync:check` early in CI. (S15)

14. **Nx can orchestrate other tools, but official docs do not make Nx their semantic owner.** Plugin features include inferred tasks, code generation, dependency maintenance, and executors. That supports Habitat invoking Biome/Grit-like tools through targets/executors/generators, but the cited Nx docs do not define formatting semantics, GritQL pattern semantics, or source-code rewrite correctness outside generator/codemod mechanics. (S13, S15, S16, S17)

## Implications For Habitat Changesets

- **Graph authority:** Habitat should treat Nx as the canonical project/task graph and target-discovery substrate, then layer Habitat classification over resolved Nx metadata and repo-specific taxonomy.

- **Target proof gate:** Any Habitat command that tells agents to run `lint`, `test`, `build`, `boundaries`, `grit-check`, or similar should prove target existence with `nx show projects --with-target <target>` or resolved project/target inspection. A `targetDefaults` key is not enough evidence.

- **Inferred-task hygiene:** If Habitat adds or modifies Nx plugins, `createNodesV2` output must be deterministic, workspace-relative, and sorted. Plugin scoping should use `include`/`exclude` when only part of the repo should receive inferred targets.

- **Dynamic-target boundary:** Habitat should avoid dynamic targets for third-party executors unless only the executor is dynamic and options live in `targetDefaults`. If Habitat owns the executor, migration/update responsibility stays with Habitat.

- **Boundary ownership:** Use open-source Nx ESLint boundaries for JS/TS import/package dependency constraints. Use Nx Conformance only if the repo intentionally accepts the Enterprise dependency. Use Habitat-native, Grit, file-layer checks, or tests for invariants outside those documented Nx surfaces.

- **Ownership layer:** Do not assume Nx Owners is available. If ownership is required without Enterprise, Habitat must own owner metadata/checks or generate CODEOWNERS through another repo-local mechanism, and records must say that Nx Owners was not used.

- **Generator-first structure:** Supported new structure should be created through Nx generators or Habitat generators in an Nx plugin. Generators should default to dry-run proof in docs/tests and explicitly choose overwrite behavior for any file writes.

- **Sync where graph truth writes files:** If Habitat needs generated manifests, TypeScript refs, CODEOWNERS-like files, or tool configs derived from the project graph, sync generators are the closest official Nx mechanism. CI should run `nx sync:check` or the Habitat wrapper around it.

- **Affected as scope reducer only:** Habitat can use `nx affected` to shrink verification scope, but must not treat it as evidence that unchanged areas remain architecturally valid. Baseline shrink-only rules and full scans remain necessary where architecture drift can hide outside the affected set.

- **Records:** Habitat records should distinguish official Nx-resolved state (`nx show`, `nx graph`, `nx affected --graph`, `nx sync:check`) from historical claims, desired design, and Habitat/Grit/Biome-specific behavior.

## Non-Applicable Areas

- Official Nx docs in this pack do not define GritQL syntax, match semantics, apply safety, or false-positive modeling. Grit pattern authority must come from Grit docs/current Grit behavior and Habitat fixtures, not Nx.

- Official Nx docs in this pack do not define Biome formatting or lint rule semantics. Biome remains the hygiene owner only if Biome docs/current behavior support that claim.

- Nx example library taxonomies (`feature`, `ui`, `data-access`, `util`) are presented as one possible organization. They should not be imported as Habitat's architecture taxonomy without repo-specific authority.

- Nx affected commands do not replace full architectural scans, baseline ratchets, or product proof. They reduce task scope based on graph/Git analysis.

- Nx Conformance and Owners are official but enterprise-gated. They are not safe baseline assumptions for a repo-local open harness unless license availability is verified and accepted as a dependency.

## Uncertainties

- **Installed version gap:** `nx show target` is documented as requiring Nx 22.6+. Verify the repo's installed Nx version before making it a required Habitat proof command.

- **License gap:** The docs are clear that Conformance and Owners require Enterprise. The repo's license status is not established by official docs and must be checked before assigning invariants to those plugins.

- **Current behavior gap:** Official docs say what Nx supports, but Habitat specs must still verify current repo behavior with `nx ...` using the pinned local Nx binary.

- **Boundary naming gap:** The repo mentions an `nx-boundaries`/Habitat `boundaries` target in local AGENTS guidance. This evidence pack does not verify whether that target maps exactly to official `@nx/enforce-module-boundaries`, Conformance, or custom Habitat logic.

- **Transformation split gap:** Official Nx docs support generators/codemods/sync generators, but not the boundary between Nx generator-owned transforms and Grit-owned structural rewrites. That split must be set by Habitat design plus Grit/Biome evidence.

## Stop/Reframe Triggers

- Stop if Habitat design requires Nx to enforce non-JS/TS dependency boundaries without accepting Nx Enterprise Conformance or adding a separate Habitat/Grit/file-layer owner.

- Stop if a changeset treats tags, `targetDefaults`, or project folder names as proof of target existence without resolved Nx inspection.

- Stop if plugin-inferred targets are nondeterministic or include machine-local values, because Nx documents those as cache-invalidating.

- Stop if dynamic targets for third-party executors need migration support; Nx docs explicitly warn that migration generators cannot find those target configs.

- Stop if affected-only verification is used as a product proof for architectural correctness.

- Stop if current pinned Nx behavior contradicts any cited official doc; record the versioned behavior and reframe from current command evidence.
