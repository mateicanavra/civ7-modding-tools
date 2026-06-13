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
| adapter-boundary | `lint-adapter-boundary.sh` (bash+rg) | `/base-standard/` imports only inside `packages/civ7-adapter` | `packages/**` | root `check` + `ci:architecture-strict-core` | parseable text | 6 allowlisted files (CIV-20, CIV-47, map-policy tables) → becomes the rule's ratchet baseline | grit-check (+ nx tag `kind:adapter` context) | wrap-then-port |
| domain-refactor-guardrails | `lint-domain-refactor-guardrails.sh` (bash+rg, `boundary`/`full` profiles) | ops don't import adapter/context/map-projection/domain-root config; no cross-domain deep imports; no RNG/engine imports outside runtime layers; full profile adds JSDoc/schema-description rules | `mods/mod-swooper-maps/src/domain/**`, `recipes/standard/**` | root `check` + strict-core (full) | text | 0 | grit-check (+ grit-apply candidates for JSDoc) | wrap-then-port |
| mapgen-recipe-imports | `lint-mapgen-recipe-imports.sh` (bash+rg) | recipes import domain only via public surfaces (`@mapgen/domain/<d>`, `/ops`, `/config.js`) | `mods/mod-swooper-maps/src/recipes/**` | root `check` | text | 0 | nx-boundaries (package-level) + grit-check (path-level within mod) | wrap-then-port |
| normalization-guardrails | `lint-normalization-guardrails.mjs` | G1 no milestone-prefixed recipe IDs; G2 no domain-root catalogs; G3 no Civ7 runtime imports in mapgen-core; G5 no sibling stage step imports; G6 recipe/docs stage-order sync; G7 superseded stage IDs in docs; G8 placement outcome contract boundary; G9 no wrapper-only stage config; G10 viz contract ownership; G11 SDK runtime entrypoint isolation | mod recipes/domain, sdk, mapgen-core, docs | root `check` | structured text | 0 | split: grit-check (G1,G2,G5,G9), nx-boundaries (G3,G10,G11), habitat-native (G6,G7 — doc/code sync is semantic) | wrap-then-port |
| control-orpc-contract-ownership | `lint-control-orpc-contract-ownership.mjs` | no `@civ7/direct-control` imports in service contracts; no schema exports from module contracts; no contract-local re-exports from public surface | `packages/civ7-control-orpc/src/modules/**/contract.ts` | root `check` | text | 0 | grit-check | wrap-then-port |
| workspace-entrypoints | `lint-workspace-entrypoints.mjs` | package-local scripts must not hide workspace orchestration (`--filter`, `--cwd`, nested turbo→nx) | all `package.json` | root `check` | text | 0 | habitat-native (manifest rule, not source syntax) | wrap-then-port (update for nx in H1) |
| adr-lint | `lint-doc-adrs.mjs` | ADR frontmatter shape + heading IDs + no hardcoded paths | `docs/projects/*/resources/spec/adr/` | manual | yes (`--json`) | 0 | habitat-native (doc tooling) | wrap (keep semantics; low priority) |
| doc-ambiguity-lint | `lint-doc-ambiguity.mjs` | vague-language reduction with baseline tracking | `docs/**` | manual/advisory | yes + baseline file | baseline `docs/.doc-ambiguity-lint-baseline.json` (prior art for the ratchet) | habitat-native | wrap (advisory lane) |
| mapgen-docs-lint | `lint-mapgen-docs.py` (python) | mapgen canonical docs have `<toc>`, ground-truth anchors, anchor paths exist | `docs/system/libs/mapgen/**` | root `check` | stderr text | 0 | habitat-native | wrap (port py→TS only if touched) |

## B. ESLint flat-config blocks (`eslint.config.js`)

| ID | Block | Invariant | Harness owner | Disposition |
|---|---|---|---|---|
| eslint-studio-recipe-imports | lines ~27–62 | Studio UI imports recipe *artifacts*, not runtime modules (worker files exempt) | nx-boundaries (tag rule app↔mod-artifacts) | port |
| eslint-domain-ops-deep-imports | ~65–88 | no deep `@mapgen/domain/*/ops|rules|strategies/*` imports outside domain | grit-check (intra-package path rule; nx can't see within one project) | port |
| eslint-runtime-typebox-ban | ~91–127 | steps/strategies: no TypeBox `Value.*`/`TypeCompiler`, no `runValidated`, no compiler-normalize imports | grit-check | port |
| eslint-redefined-helpers | ~129–170 | steps/strategies must not redeclare `clamp01`/`clampChance`/`normalizeRange`/`rollPercent` | grit-check | port |
| eslint-step-contract-imports | ~174–197 | step contracts import only `@mapgen/domain/<d>` entrypoint | grit-check | port |
| eslint-recipe-domain-ops | ~199–214 | `recipe.ts` imports domain ops surface, not contract entrypoint | grit-check | port |
| eslint-contract-export-all | ~216–235 | no bare `export *` in contract/public-surface files (`export type *` ok) | grit-check + grit-apply (named-export codemod) | port |
| eslint-empty-schema-defaults | ~237–250 | no `{ default: {} }` in contract schemas | grit-check | port |

Note (frame hard core #2): after porting, `eslint.config.js` is replaced by a
minimal boundary-only config whose sole rule is `@nx/enforce-module-boundaries`.
No other ESLint rules survive.

## C. Architecture tests (stay as tests)

| ID | File | Invariant | Disposition |
|---|---|---|---|
| core-purity | `packages/mapgen-core/test/architecture/core-purity.test.ts` | mapgen-core prod code has no Civ7 runtime refs | keep-as-test; **duplicated intent** with nx-boundaries tag rule (`kind:core` ↛ `kind:adapter`) — once the tag rule is locked, slim the test or retire (decided in H6) |
| rng-authority-boundary | `mods/.../test/pipeline/rng-authority-boundary.test.ts` | no engine RNG / official generators in standard recipe + domain | keep-as-test (runtime semantics) |
| recipe-import-boundary | `mods/.../test/pipeline/recipe-import-boundary.test.ts` | recipes use public domain surfaces | keep-as-test until grit-check equivalent is locked, then retire (H6) |
| ecology-step-import-guardrails | `mods/.../test/ecology/ecology-step-import-guardrails.test.ts` | ecology steps don't deep-import ops/rules; retired stage dirs absent | keep-as-test until grit equivalent locked (H6) |
| m11-projection-boundary-band | `mods/.../test/foundation/m11-projection-boundary-band.test.ts` | projection algorithm correctness | keep-as-test (domain logic, not structure) |
| map-bundle-runtime-imports | `mods/.../test/build/map-bundle-runtime-imports.test.ts` | built bundles embed workspace packages; TextEncoder bootstrap; river markers | keep-as-test (build output correctness) |

## D. CI wiring

| ID | Where | Behavior | Disposition |
|---|---|---|---|
| pnpm-guard | `.github/workflows/ci.yml` | fail on pnpm artifacts | keep; add habitat-native equivalent locally (cheap pre-commit) |
| root-check | `package.json` `check` → turbo + 5 lint scripts | aggregator | becomes `habitat check` / nx targets in H1–H2 |
| architecture-strict-core | ci.yml job | lint + adapter-boundary + cutover tests + guardrails + check | re-pointed at `habitat verify` (nx affected) in H2; job kept |

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
| Formatting consistency | `.prettierrc` exists; no gate anywhere | nothing | H4 (Biome `format`/`ci`) |
| Bun-only package manager locally | CI-only pnpm guard | CI only | H7 (pre-commit cheap check) |
| Stage truth/projection separation (`map-*` projection-only) | normalization packet / openspec config | prose + partial G-guards | logged; future rule after normalization train lands (exterior here) |
| Typed intent APIs at adapter boundary | swooper-maps architecture.md | prose only | logged in discrepancy-log; future rule |

## Summary counts

- 9 lint scripts → 4 grit-check families, 2 nx-boundaries families, 3 habitat-native (docs/manifest) wraps.
- 8 ESLint rule families → 1 nx-boundaries, 6 grit-check, 1 grit-apply codemod; ESLint reduced to the single Nx boundary rule.
- 6 architecture tests → all keep-as-test initially; 3 retire candidates in H6 once equivalent harness rules are locked.
- 4 generated zones → file-layer rules (new enforcement).
- 5 promised-but-unenforced invariants → 3 in-scope new rules (H4/H5/H7), 2 logged as future.
