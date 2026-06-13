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
| `kind:app` | User-facing applications and entry surfaces (CLI included): own caller-specific transports/workflows; consume public surfaces only | `apps/*` layout; `docs/system/ARCHITECTURE.md`; `lint-workspace-entrypoints.mjs` |
| `kind:sdk` | High-level authoring/builder APIs for mod generation; mapgen runtime only via `@civ7/sdk/mapgen` subpath | `packages/sdk/AGENTS.md`; `lint-normalization-guardrails.mjs` G11 |
| `kind:engine` | Pure TS engine/domain logic (no Civ7 runtime values, no engine globals) | `core-purity.test.ts`; normalization guardrail G3 |
| `kind:adapter` | Sole owner of Civ7 engine globals and `/base-standard/` imports | `lint-adapter-boundary.sh`; `packages/civ7-adapter/AGENTS.md` |
| `kind:control` | Runtime control of a live Civ7 instance: socket protocol (`direct-control`) and oRPC service surface (`control-orpc`, `studio-server`) | `packages/civ7-direct-control/AGENTS.md`; `lint-control-orpc-contract-ownership.mjs`; root `AGENTS.md` ("runtime Civ7 control belongs in @civ7/direct-control") |
| `kind:foundation` | Pure leaf libraries: types, config, policy facts, viz contracts; no domain orchestration, broadly importable | `packages/civ7-types`, `config`, `civ7-map-policy`, `mapgen-viz` package docs |
| `kind:plugin` | Reusable CLI/SDK helper libraries, leaf-local | `packages/plugins/*`; `packages/cli/AGENTS.md` |
| `kind:mod` | Game-facing mod packages (recipes, domains, map configs, game runtime wrappers) | `mods/*`; `docs/system/ARCHITECTURE.md` |
| `kind:tooling` | Repo-local dev tooling (the habitat harness itself) | new with this workstream |

## 2. Per-project assignment (all 21 existing projects + the new harness package)

| Project | Path | Tags |
|---|---|---|
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
| mod-swooper-civ-dacia | `mods/mod-swooper-civ-dacia` | `kind:mod` |
| (new) @internal/habitat-harness | `tools/habitat-harness` | `kind:tooling` |

## 3. Dependency constraints (project plane, initial rule set)

Encodes current enforcement generalized to tags. Verified against actual
`package.json` dependency edges at `main` — **no current violations** except
the allowlisted adapter-boundary files (which are file-level, not project-level,
and become the grit rule's baseline).

| sourceTag | onlyDependOnLibsWithTags | Generalizes |
|---|---|---|
| `kind:foundation` | `kind:foundation` | leaf purity (types/config/policy/viz import nothing higher) |
| `kind:adapter` | `kind:foundation` | adapter translates engine↔types; owns `/base-standard/` exclusively (`lint-adapter-boundary.sh`) |
| `kind:engine` | `kind:adapter`, `kind:foundation` | core purity: mapgen-core sees adapter *types* only, never runtime values (`core-purity.test.ts`, G3 — runtime-value ban stays grit/test-owned) |
| `kind:plugin` | `kind:plugin`, `kind:foundation` | plugins stay leaf-local (`cli/AGENTS.md`) |
| `kind:sdk` | `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:plugin` | SDK composes engine+adapter; mapgen subpath isolation (G11) stays grit-owned |
| `kind:control` | `kind:control`, `kind:foundation`, `kind:adapter`, `kind:engine`, `kind:mod` ¹ | control service layering (`control-orpc` over `direct-control`); contract-ownership rules stay grit-owned |
| `kind:mod` | `kind:sdk`, `kind:engine`, `kind:adapter`, `kind:foundation`, `kind:control` | mods consume SDK/engine/adapter/policy |
| `kind:app` | everything except `kind:app` | apps are top of the graph; nothing imports apps |
| `kind:tooling` | `kind:tooling`, `kind:foundation` | harness stays out of product graph |

¹ `kind:control` → `kind:mod` exists only for the studio-server → mod-swooper-maps
recipe-artifact edge; expect to narrow this when artifact packages split out.
Recorded as a deliberate wide edge, revisit on ratchet review.

Initial baseline expectation: **all constraints green at adoption** (the
project-plane graph is already clean). The burn-down backlog lives in the
intra-project plane (existing allowlists + new file-layer/grit rules).

## 4. `scope:*` rule families (intra-project plane — grit/file-layer owned)

Not Nx tags. These name rule families inside `mod-swooper-maps` (and
mapgen-core) for provenance and grit-pattern grouping:

| Family | Rules | Provenance |
|---|---|---|
| `scope:domain-surface` | recipes import domain only via `@mapgen/domain/<d>`, `/ops`, `/config.js`; step contracts only the entrypoint; no deep ops/rules/strategies imports; no domain-root `export *` facades | `lint-mapgen-recipe-imports.sh`, eslint blocks, `recipe-import-boundary.test.ts`, guardrails full profile |
| `scope:runtime-purity` | steps/strategies: no TypeBox runtime (`Value.*`, `TypeCompiler`), no `runValidated`, no helper redeclarations, no config merges (`?? {}`, `Value.Default(`) | eslint blocks; guardrails full profile |
| `scope:stage-isolation` | no sibling-stage step imports (G5); no milestone-prefixed recipe IDs (G1); stage-order doc sync (G6) | `lint-normalization-guardrails.mjs` |
| `scope:rng-authority` | no engine RNG / official generators in authored generation | `rng-authority-boundary.test.ts` (stays a test) |
| `scope:generated-zone` | generated paths are regenerate-only | root `AGENTS.md` promise (new enforcement, slice H5) |
