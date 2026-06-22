# Derived Tag Taxonomy

Derived entirely from existing enforcement + docs (frame hard core #4: encode
the **current implied architecture**, lockable on the ratchet, revisable later
as deliberate decisions). Every tag cites the existing rule/doc that justifies
it. Wrong-tag discoveries are future refactors, not blockers (Matei D4).

Two enforcement planes — do not conflate them:

- **Project plane (Nx tags + `enforce-module-boundaries`):** rules between
  workspace projects. Tags live in each `package.json` under `"nx": {"tags": [...]}`.
- **Intra-project plane (GritQL / file layer):** rules inside a single project
  (domain/recipe/steps structure inside `mod-swooper-maps`, contract files,
  generated zones). Nx cannot see inside one project; these are grit/file rules
  and are listed here only as `scope:*` rule families for provenance.

## 1. `kind:*` tags (project plane)

| Tag | Definition | Provenance (existing rule/doc) |
|---|---|---|
| `kind:workspace` | Repo-root orchestration and proof entrypoints: owns root Nx aggregate targets and root `scripts/**`; consumes public package surfaces only | root `AGENTS.md` Tooling Defaults; Habitat `workspace-entrypoints`; Nx DAG normalization |
| `kind:app` | User-facing applications and entry surfaces (CLI included): own caller-specific transports/workflows; consume public surfaces only | `apps/*` layout; `docs/system/ARCHITECTURE.md`; Habitat `workspace-entrypoints` |
| `kind:sdk` | High-level authoring/builder APIs for mod generation; mapgen runtime only via `@civ7/sdk/mapgen` subpath | `packages/sdk/AGENTS.md`; Habitat `grit-sdk-mapgen-entrypoint` |
| `kind:engine` | Pure TS engine/domain logic (no Civ7 runtime values, no engine globals) | `core-purity.test.ts`; normalization guardrail G3 |
| `kind:adapter` | Sole owner of Civ7 engine globals and `/base-standard/` imports | `lint-adapter-boundary.sh`; `packages/civ7-adapter/AGENTS.md` |
| `kind:control` | Runtime control of a live Civ7 instance: socket protocol (`direct-control`) and oRPC service surface (`control-orpc`, `studio-server`) | `packages/civ7-direct-control/AGENTS.md`; Habitat `grit-control-orpc-contract-ownership`; root `AGENTS.md` ("runtime Civ7 control belongs in @civ7/direct-control") |
| `kind:foundation` | Pure leaf libraries: types, config, policy facts, viz contracts; no domain orchestration, broadly importable | `packages/civ7-types`, `config`, `civ7-map-policy`, `mapgen-viz` package docs |
| `kind:plugin` | Reusable CLI/SDK helper libraries, leaf-local | `packages/plugins/*`; `packages/cli/AGENTS.md` |
| `kind:mod` | Game-facing mod packages (recipes, domains, map configs, game runtime wrappers) | `mods/*`; `docs/system/ARCHITECTURE.md` |
| `kind:tooling` | Repo-local dev tooling (the habitat harness itself) | new with this workstream |

### Control lifecycle note

`kind:control` is a project-plane grouping, not a single lifecycle owner. Current
accepted control architecture keeps these responsibilities separate:

- `@civ7/direct-control` owns the raw tuner socket/framing/session primitive and
  graceful close behavior.
- `@civ7/studio-server` owns the long-lived Studio host session through the
  Effect-scoped `Civ7TunerSession` (`Layer.scoped`, `Effect.acquireRelease`, and
  host `ManagedRuntime.dispose`).
- `@civ7/control-orpc` owns native oRPC/Effect procedure contracts and service
  behavior over supplied direct-control ports; provider construction belongs to
  callers/runtime adapters.
- Effect procedure code may use scoped acquire/release for reversible game UI
  state, but must not add raw transports or caller-local session ownership.

Provenance: `packages/civ7-direct-control/AGENTS.md`,
`packages/civ7-control-orpc/AGENTS.md`,
`docs/projects/mapgen-studio-redesign/research/04-effect-native-substrate-spike.md`,
`docs/projects/studio-runtime-simplification/PLAN.md`, and
`packages/studio-server/src/services/Civ7TunerSession.ts`.

### Habitat internal boundary tags

`@internal/habitat-harness` remains one package, but Habitat's source is
projected into inferred Nx boundary projects. Fixed roots cover the command
surface, service shell, service model, provider implementations, shared
resources, and runtime composition. Every directory under
`tools/habitat-harness/src/service/modules/*` is inferred as the same
`layer:service-module` kind, so future modules inherit the same boundary
treatment without adding a concrete tag or constraint row.

| Tag | Definition |
|---|---|
| `habitat:cli` | Thin command surface and bin-facing command classes. CLI code calls the Habitat service; it does not own domain execution. |
| `habitat:service` | Effect/oRPC service contracts, implementers, routers, and owned modules for checking, fixing, classifying, verifying, graph routing, hooks, and scaffolding. |
| `habitat:runtime` | Effect resources/providers and runtime composition for config, typed errors, filesystem/time/cache, command execution, and delegated vendor tools such as Grit, Biome, Nx, Git, Graphite, and reporters. |
| `layer:service-entry` | Public caller entry for a service package or command surface. |
| `layer:service-shell` | Root service contract, Effect-oRPC implementer, root router composition, and initial context. |
| `layer:service-model` | Service-wide DTOs, read models, facts, and policies intentionally shared by modules. |
| `layer:service-module` | One named service module with its contract, module implementer, router, local model, local policy, and local middleware. |
| `layer:resource-provider` | Resource/provider implementation and runtime layer composition for delegated tools and host capabilities. |

## 2. Per-project assignment

| Project | Path | Tags |
|---|---|---|
| civ7-modding-tools | `.` | `kind:workspace` |
| @mateicanavra/civ7-cli | `packages/cli` | `kind:app` |
| @civ7/docs | `apps/docs` | `kind:app` |
| @civ7/playground | `apps/playground` | `kind:app` |
| mapgen-studio | `apps/mapgen-studio` | `kind:app` |
| @mateicanavra/civ7-sdk | `packages/sdk` | `kind:sdk` |
| @swooper/mapgen-core | `packages/mapgen-core` | `kind:engine` |
| @civ7/adapter | `packages/civ7-adapter` | `kind:adapter` |
| @civ7/direct-control | `packages/civ7-direct-control` | `kind:control` |
| @civ7/control-orpc | `packages/civ7-control-orpc` | `kind:control` |
| @civ7/studio-server | `packages/studio-server` | `kind:control` |
| @civ7/types | `packages/civ7-types` | `kind:foundation` |
| @civ7/config | `packages/config` | `kind:foundation` |
| @civ7/map-policy | `packages/civ7-map-policy` | `kind:foundation` |
| @swooper/mapgen-viz | `packages/mapgen-viz` | `kind:foundation` |
| @civ7/plugin-files | `packages/plugins/plugin-files` | `kind:plugin` |
| @civ7/plugin-git | `packages/plugins/plugin-git` | `kind:plugin` |
| @civ7/plugin-graph | `packages/plugins/plugin-graph` | `kind:plugin` |
| @civ7/plugin-mods | `packages/plugins/plugin-mods` | `kind:plugin` |
| mod-swooper-maps | `mods/mod-swooper-maps` | `kind:mod` |
| mod-civ7-intelligence-bridge | `mods/mod-civ7-intelligence-bridge` | `kind:mod`, `kind:control` |
| civ-mod-dacia | `mods/mod-swooper-civ-dacia` | `kind:mod` |
| @internal/habitat-artifacts | `.habitat` | `kind:tooling` |
| @internal/habitat-harness | `tools/habitat-harness` | `kind:tooling` |
| @internal/habitat-harness-service-shell | `tools/habitat-harness/src/service` | `kind:tooling`, `habitat:service`, `layer:service-shell` |
| @internal/habitat-harness-service-model | `tools/habitat-harness/src/service/model` | `kind:tooling`, `habitat:service`, `layer:service-model` |
| @internal/habitat-harness-providers | `tools/habitat-harness/src/providers` | `kind:tooling`, `habitat:runtime`, `layer:resource-provider` |
| @internal/habitat-harness-resources | `tools/habitat-harness/src/resources` | `kind:tooling`, `habitat:runtime`, `layer:resource-provider` |
| @internal/habitat-harness-runtime | `tools/habitat-harness/src/runtime` | `kind:tooling`, `habitat:runtime` |
| @internal/habitat-harness-cli | `tools/habitat-harness/src/cli` | `kind:tooling`, `habitat:cli` |

Habitat service module projects are inferred from
`tools/habitat-harness/src/service/modules/*` with project names
`@internal/habitat-harness-service-module-<module>` and tags `kind:tooling`,
`habitat:service`, and `layer:service-module`. They are not enumerated here
because the boundary rule applies to the kind, not to concrete module names.
Each module-local `model` directory is also inferred as
`@internal/habitat-harness-service-module-<module>-model` with tags
`kind:tooling`, `habitat:service`, `layer:service-model`, and
`scope:module-model`. Module roots may import their own `./model/**` artifacts;
other access is still governed by the tag rows below.

## 3. Dependency constraints (project plane, initial rule set)

Encodes current enforcement generalized to tags. Current proof compares this
table against workspace manifests, resolved Nx project metadata, the quarantined
ESLint boundary config, and the resolved Nx project graph. File-level debts such
as adapter-boundary allowlists are outside this project-plane taxonomy and stay
owned by their Grit/file-layer rules.

| sourceTag | onlyDependOnLibsWithTags | Generalizes |
|---|---|---|
| `kind:workspace` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:control`, `kind:foundation`, `kind:plugin`, `kind:mod`, `kind:tooling` | root orchestration/proof scripts may consume public package surfaces, but app code remains a caller surface rather than a library |
| `kind:foundation` | `kind:foundation` | leaf purity (types/config/policy/viz import nothing higher) |
| `kind:adapter` | `kind:foundation` | adapter translates engine↔types; owns `/base-standard/` exclusively (`lint-adapter-boundary.sh`) |
| `kind:engine` | `kind:adapter`, `kind:foundation` | core purity: mapgen-core sees adapter *types* only, never runtime values (`core-purity.test.ts`, G3 — runtime-value ban stays grit/test-owned) |
| `kind:plugin` | `kind:plugin`, `kind:foundation` | plugins stay leaf-local (`cli/AGENTS.md`) |
| `kind:sdk` | `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:plugin` | SDK composes engine+adapter; mapgen subpath isolation (G11) stays grit-owned |
| `kind:control` | `kind:control`, `kind:foundation`, `kind:adapter`, `kind:engine` | control service layering (`control-orpc` over `direct-control`); lifecycle ownership remains governed by the control note above, and contract-ownership rules stay grit-owned. Architecture review 2026-06-12: no control→mod edge exists, and main `331534895` (studio-server) explicitly forbids that direction in code comments — the previously drafted `kind:mod` allowance was dropped pre-lock as falsely provenanced |
| `kind:mod` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:control`, `kind:plugin` | mods consume SDK/engine/adapter/policy/control and plugin utilities needed for mod package workflows |
| `kind:app` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:plugin`, `kind:control`, `kind:mod`, `kind:tooling` | apps are top of the graph; nothing imports apps or the workspace root |
| `kind:tooling` | `kind:tooling`, `kind:foundation` | harness stays out of product graph |
| `habitat:runtime` | `habitat:runtime`, `habitat:service` | runtime owns resource/provider integration and may consume service-owned structural facts needed to translate Habitat requests into vendor calls |
| `habitat:service` | `habitat:runtime`, `habitat:service` | service modules own Habitat logic and consume runtime resources/providers |
| `habitat:cli` | `habitat:runtime`, `habitat:service`, `habitat:cli` | CLI commands parse user flags, acquire runtime-backed service context, and call service routers while keeping command output at the edge |
| `layer:service-entry` | `layer:service-shell`, `layer:service-entry` | public service/CLI entry code may call the service shell but not service module internals directly |
| `layer:service-shell` | `habitat:runtime`, `layer:service-model`, `layer:service-module`, `layer:resource-provider` | root service composition owns contract/implementer/router assembly over modules, shared service model, and the Effect/oRPC managed runtime |
| `layer:service-module` | `layer:service-shell`, `layer:service-model`, `layer:resource-provider` | modules use the service implementer seam, shared service model, and runtime resources; same-module local imports stay inside one inferred project, while sibling module imports are red because `layer:service-module` cannot depend on `layer:service-module` |
| `layer:service-model` | `layer:service-model`, `layer:resource-provider` | service-wide facts, DTOs, and read models may reuse resource contracts but do not import module internals |
| `layer:resource-provider` | `layer:resource-provider`, `layer:service-model` | runtime providers may consume shared service model facts but must not import service module internals |

Dual-tagged projects (`mod-civ7-intelligence-bridge`: `kind:mod` +
`kind:control`) are constrained by the **intersection** of their rows — every
matching constraint is enforced, so its effective allowed set is
{engine, adapter, foundation, control} (e.g. a future sdk dep would be red
despite the mod row allowing it).

devDependency edges and test-file imports are constrained identically to
runtime deps (`enforce-module-boundaries` lints imports wherever the config's
globs reach; dep kind is irrelevant to the tag check). Verified green at
adoption (4 devDep edges).

Initial baseline expectation: **all constraints green**. The original H3
adoption proof locked `nx-boundaries` with an empty baseline; current recovery
proof keeps that claim live only when the taxonomy, boundary config, resolved
Nx tags, and resolved graph edges agree. The H3 direct rule run also found one
hidden relative test import from `@civ7/direct-control` into
`@civ7/map-policy`; it was repaired as an explicit package import/devDependency
because `kind:control -> kind:foundation` is tag-legal. The burn-down backlog
lives in the intra-project plane (existing allowlists + file-layer/Grit rules).

## 4. `scope:*` rule families (intra-project plane — grit/file-layer owned)

Not Nx tags. These name rule families inside `mod-swooper-maps` (and
mapgen-core) for provenance and grit-pattern grouping:

| Family | Rules | Provenance |
|---|---|---|
| `scope:domain-surface` | recipes import domain only via `@mapgen/domain/<d>`, `/ops`, `/config.js`; step contracts only the entrypoint; no deep ops/rules/strategies imports; no domain-root `export *` facades | Habitat Grit catalog, `grit-contract-export-all`, guardrails full profile |
| `scope:runtime-purity` | steps/strategies: no TypeBox runtime (`Value.*`, `TypeCompiler`), no `runValidated`, no helper redeclarations, no config merges (`?? {}`, `Value.Default(`) | eslint blocks; guardrails full profile |
| `scope:stage-isolation` | no sibling-stage step imports (G5); no milestone-prefixed recipe IDs (G1); stage-order doc sync (G6) | Habitat `grit-sibling-stage-step-imports` and `normalization-guardrails` |
| `scope:rng-authority` | no engine RNG / official generators in authored generation | `rng-authority-boundary.test.ts` (stays a test) |
| `scope:generated-zone` | generated paths are regenerate-only | root `AGENTS.md` promise (new enforcement, slice H5) |
