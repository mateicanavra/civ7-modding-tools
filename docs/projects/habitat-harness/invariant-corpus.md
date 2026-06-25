# Invariant Corpus — Existing Enforcement → Harness Migration Map

Gate-4 corpus ledger for the habitat-harness workstream (see `FRAME.md`).
Enumerates every existing enforcement mechanism with its proposed harness
owner and migration disposition. Derived from code at `main` (2026-06-12).

Disposition legend:
- **port** — re-home into the named harness layer; retire the original in the same slice.
- **wrap-then-port** — slice H2 wraps it behind the habitat CLI unchanged (JSON output added); a later slice ports internals to the owning tool and retires the script.
- **keep-as-test** — genuine behavior/correctness test; stays in `test/`, not harness-owned. The harness may *invoke* it but does not own it.
- **keep** — orthogonal to the harness (CI orchestration etc.).

Owner-layer legend (frame hard core #2): `nx-boundaries` (tags + enforce-module-boundaries), `grit-check` / `grit-apply` (syntax layer), `biome` (hygiene), `file-layer` (path/generated-zone rules), `habitat-native` (custom TS check inside the harness — budgeted; see degeneration trigger in FRAME.md).

## A. Lint scripts (`scripts/lint/`)

| ID | Implementation | Invariant | Scope | Enforced today | JSON? | Exceptions | Harness owner | Disposition |
|---|---|---|---|---|---|---|---|---|
| adapter-boundary | `lint-adapter-boundary.sh` (bash+rg) | `/base-standard/` imports only inside `packages/civ7-adapter` | `packages/**` | Habitat `wrapped-script` through the root Nx/Habitat lint lane; direct script remains the wrapped source command | parseable text | 7 allowlisted files (CIV-20, CIV-47, map-policy provenance/test/setup) remain in the wrapped broad string rule; H5's Grit runtime-import rule starts empty | grit-check for runtime imports; wrapped script for broad provenance-string scan until H6 disposition | wrap-then-port |
| domain-refactor-guardrails | `lint-domain-refactor-guardrails.sh` (bash+rg, `boundary`/`full` profiles) | boundary profile: ops don't import adapter/context/map-projection/domain-root config; full profile adds cross-domain/RNG/engine/config/docs/schema/foundation/ecology special cases | `mods/mod-swooper-maps/src/domain/**`, `recipes/standard/**` | Habitat `wrapped-script` for the default profile; strict-core remains a direct full-profile diagnostic alias | text | 0 | grit-check for the default boundary profile; wrapped rule for full profile | wrap-then-port |
| mapgen-recipe-imports | retired H6 (`lint-mapgen-recipe-imports.sh`) | recipes import domain only via public surfaces (`@mapgen/domain/<d>`, `/ops`, `/config.js`) | `mods/mod-swooper-maps/src/recipes/**` | Habitat `grit-check` | JSON via Habitat | 0 | grit-check (path-level within mod) | ported/retired in H6 |
| normalization-guardrails | Habitat-native + Grit split (former `lint-normalization-guardrails.mjs`) | G1 no milestone-prefixed recipe IDs; G2 no domain-root catalogs; G3 no Civ7 runtime imports in mapgen-core; G5 no sibling stage step imports; G6 recipe/docs stage-order sync; G7 superseded stage IDs in docs; G8 placement outcome contract boundary; G9 no wrapper-only stage config; G10 viz contract ownership; G11 SDK runtime entrypoint isolation | mod recipes/domain, sdk, mapgen-core, docs | Habitat `normalization-guardrails` + `grit-check` | JSON via Habitat | 0 | split: grit-check (G2, G3 runtime-value, G5, G8, G9, G10, G11), habitat-native (G1, G6, G7), nx-boundaries (G3 project-edge context only) | ported/slimmed in H6 |
| control-orpc-contract-ownership | retired H6 (`lint-control-orpc-contract-ownership.mjs`) | no `@civ7/direct-control` imports in service contracts; no schema exports from module contracts; no contract-local re-exports from public surface | `packages/civ7-control-orpc/src/modules/**/contract.ts` | Habitat `grit-control-orpc-contract-ownership` | JSON via Habitat | 0 | grit-check | ported/retired in H6 |
| workspace-entrypoints | Habitat-native (former `lint-workspace-entrypoints.mjs`) | package-local scripts must not hide workspace orchestration (`--filter`, `--cwd`, nested turbo→nx) | all `package.json` | Habitat `workspace-entrypoints` | JSON via Habitat | 0 | habitat-native (manifest rule, not source syntax) | ported in H6 |
| adr-lint | Habitat-native (former `lint-doc-adrs.mjs`) | ADR frontmatter shape + heading IDs + no hardcoded paths | `docs/projects/*/resources/spec/adr/` | manual/advisory | yes (`--json`) | 0 | habitat-native (doc tooling) | ported in H6 |
| doc-ambiguity-lint | Habitat-native (former `lint-doc-ambiguity.mjs`) | vague-language reduction with baseline tracking | `docs/**` | manual/advisory | yes + baseline file | baseline `docs/.doc-ambiguity-lint-baseline.json` (prior art for the ratchet) | habitat-native | ported in H6 (advisory lane) |
| mapgen-docs-lint | `lint-mapgen-docs.py` (python) | mapgen canonical docs have `<toc>`, ground-truth anchors, anchor paths exist | `docs/system/libs/mapgen/**` | Habitat `wrapped-script` through the root Nx/Habitat lint lane; direct alias remains diagnostic | stderr text | 0 | habitat-native | wrap (port py→TS only if touched) |

## B. ESLint flat-config blocks (`eslint.config.js`)

| ID | Block | Invariant | Harness owner | Disposition |
|---|---|---|---|---|
| eslint-studio-recipe-imports | lines ~27–62 | Studio UI imports recipe *artifacts*, not runtime modules (worker files exempt) | grit-check (artifact-vs-runtime split is a subpath distinction within one project — invisible to Nx tags; worker exemptions preserved in the pattern) | port |
| eslint-domain-ops-deep-imports | ~65–88 | no deep `@mapgen/domain/*/ops|rules|strategies/*` imports outside domain | grit-check (intra-package path rule; nx can't see within one project) | port |
| eslint-runtime-typebox-ban | ~91–127 | steps/strategies: no TypeBox `Value.*`/`TypeCompiler`, no `runValidated`, no compiler-normalize imports | grit-check | port |
| eslint-redefined-helpers | ~129–170 | steps/strategies must not redeclare `clamp01`/`clampChance`/`normalizeRange`/`rollPercent` | grit-check | port |
| eslint-step-contract-imports | ~174–197 | step contracts import only `@mapgen/domain/<d>` entrypoint | grit-check | port |
| eslint-recipe-domain-ops | ~199–214 | `recipe.ts` imports domain ops surface, not contract entrypoint | grit-check | port |
| eslint-contract-export-all | ~216–235 | no bare `export *` in contract/public-surface files (`export type *` ok) | Habitat `grit-contract-export-all` after H6; pattern uses native Grit with a `text(...)` guard so existing type-only export stars stay green. | ported/retired in H6 |
| eslint-empty-schema-defaults | ~237–250 | no `{ default: {} }` in contract schemas | grit-check | port |

Note (frame hard core #2): after H6, root `eslint.config.js` is deleted. ESLint
survives only in `eslint.boundaries.config.mjs`, whose sole rule is
`@nx/enforce-module-boundaries`.

## C. Architecture tests (stay as tests)

| ID | File | Invariant | Disposition |
|---|---|---|---|
| core-purity | `packages/mapgen-core/test/architecture/core-purity.test.ts` | mapgen-core prod code has no Civ7 runtime refs | keep-as-test; **duplicated intent** with nx-boundaries tag rule (`kind:core` ↛ `kind:adapter`) — once the tag rule is locked, slim the test or retire (decided in H6) |
| rng-authority-static | `.habitat/civ7/mapgen/pipeline/_self/check/rng-authority-static/rng-authority-static.check.mjs` | no engine RNG / official generators in standard recipe + domain source | migrated from package test to Habitat command-check in hidden-test-authority batch; runtime RNG execution proof stays in `standard-rng-authority.test.ts` |
| recipe-import-boundary | retired H6 (`mods/.../test/pipeline/recipe-import-boundary.test.ts`) | recipes use public domain surfaces | grit-check equivalent locked; retired in H6 |
| ecology-step-imports | `.habitat/civ7/mapgen/pipeline/_self/check/ecology-step-imports/ecology-step-imports.check.mjs` | retired stage dirs absent; active ecology stages avoid ecology ops/rules internals | migrated from package test to Habitat command-check in hidden-test-authority audit; `.pattern.md` remains future Grit source while source-check path compatibility is repaired |
| m11-projection-boundary-band | `mods/.../test/foundation/m11-projection-boundary-band.test.ts` | projection algorithm correctness | keep-as-test (domain logic, not structure) |
| map-bundle-runtime-imports | `mods/.../test/build/map-bundle-runtime-imports.test.ts` | built bundles embed workspace packages; TextEncoder bootstrap; river markers | keep-as-test (build output correctness) |
| cutover-tests | `mods/mod-swooper-maps` `test:architecture-cutover` → Habitat-owned `op-calls-op`, `cutover-source-guardrails`, and `standard-stage-topology` command-checks | M-cutover structural invariants (distinct from the six rows above) | migrated to Habitat command-checks in hidden-test-authority audit/batch; package-local cutover tests retired |

## D. CI wiring

| ID | Where | Behavior | Disposition |
|---|---|---|---|
| pnpm-guard | `.github/workflows/ci.yml` | fail on pnpm artifacts | keep; H7 adds a **registered file-layer rule** (empty baseline, locked) run in pre-commit — not an unregistered native check |
| root-lint | `package.json` `lint` | graph-owned hygiene gate | current root `lint` runs `nx run-many --targets=lint`; the Toolkit Biome hygiene target is `habitat:biome:ci`; full Habitat structural proof is separate |
| root-check | `package.json` `check` | graph-owned aggregate | current root `check` runs `nx run-many --targets=build,check,lint,test,verify`; structural Habitat proof remains explicit through Habitat/check/verify paths rather than hidden in lint |
| architecture-strict-core | ci.yml job | strict-core guardrails plus Habitat diagnostics artifact | current strict-core remains a direct full-profile diagnostic step; Habitat diagnostics are captured separately through `habitat:check --json` |

## E. Generated zones (file layer)

| Zone | Generator | Guard today | Harness action |
|---|---|---|---|
| `mods/mod-swooper-maps/src/maps/generated/**` | `gen:maps` (`scripts/generate-map-artifacts.ts`) | none | file-layer write-protection rule + "regenerate, don't edit" remediation |
| `packages/civ7-types/generated/**` | resources workflow (external) | none | file-layer rule |
| `packages/civ7-map-policy/src/civ7-tables.gen.ts` | `civ7-map-policy:gen-tables` | adapter-boundary allowlist only | file-layer rule |
| `dist/**`, `mod/**`, `types/**` build outputs | nx/turbo targets | gitignore (mostly) | out of scope where untracked |

## F. Promised-but-unenforced (candidate NEW invariants)

| Invariant | Source of promise | Today | Workstream slice |
|---|---|---|---|
| Generated artifacts are read-only (regenerate via scripts) | root `AGENTS.md` Hygiene | nothing | H5 (file layer, staged-file guard) |
| Formatting consistency | pre-H4: `.prettierrc` existed; no gate anywhere | Biome config present; CI/habitat gate pending in H4 | H4 (Biome `format`/`ci`) |
| Bun-only package manager locally | CI-only pnpm guard | CI only | H7 (pre-commit cheap check) |
| Stage truth/projection separation (`map-*` projection-only) | normalization packet / openspec config | prose + partial G-guards | logged; future rule after normalization train lands (exterior here) |
| Typed intent APIs at adapter boundary | swooper-maps architecture.md | prose only | logged in discrepancy-log; future rule |

## Summary counts

- 9 lint scripts → Grit/Habitat-native/wrapped split after H6: recipe-import and control-oRPC scripts retired; workspace/doc/normalization native rules moved under `tools/habitat/src/rules/native`; adapter/domain-refactor/mapgen-docs remain wrapped for still-owned semantics.
- 8 ESLint rule families → grit-check families after H6, including `grit-contract-export-all`; root `eslint.config.js` retired.
- 6 architecture tests (+4 coarse-wrapped cutover tests) → recipe-import-boundary retired in H6; ecology test slimmed to directory absence; runtime/build/domain tests stay.
- 4 generated zones → file-layer rules (new enforcement).
- 5 promised-but-unenforced invariants → 3 in-scope new rules (H4/H5/H7), 2 logged as future.
