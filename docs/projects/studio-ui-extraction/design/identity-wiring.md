# Design report — Package identity & workspace wiring (Designer 1)

Axis: open question **Q2** (name / location / publishing) + Nx integration + dependency policy.
Ground truth honored: LEDGER.md (frozen 2026-07-01, adjudications §3, ownership §4, escalations §5, client demands §6), `ledger/coherence.md` §3, WORKSTREAM.md §3/§5/§5b, FRAME.md §2/§3/§6. Repo evidence read from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` @ `c4ebaf1e1`. Ground reports cited as `ground/<name>.md`. No repo file modified.

Lens: the package must be a first-class citizen of the bun+Nx workspace — CI (`nx run-many --targets=build,check,lint,test,verify`, root `package.json:12`) picks it up with zero pipeline edits — and its manifest must be honest per LEDGER adjudication 10 (dependency truth lives at the package boundary).

---

## 0. Summary of recommendations

| # | Axis | Recommendation | Reserved? |
|---|---|---|---|
| D1 | Package name | **`@swooper/studio-ui`** | **RESERVED (Q2)** |
| D2 | Location + publishing | **`packages/studio-ui/`, `private: true`, publishable-shaped manifest** | **RESERVED (Q2)** |
| D3 | Manifest shape (exports/sideEffects/peers/deps) | exports = `.` + `./types` + `./styles.css`; `sideEffects: ["**/*.css"]`; **react/react-dom as peerDependencies `^19.0.0`** (first peer-dep precedent in the repo, deliberate); deps pinned from today's lockfile resolutions | no |
| D4 | Contract-types wiring (E1) | design parameterized: **E1-B (re-home) = zero workspace deps**; E1-A (types-only dep) = one `dependencies` line + forced taxonomy revision. App imports `@swooper/studio-ui/types` under BOTH branches | **E1 RESERVED** |
| D5 | Nx wiring | package.json `"nx": { "tags": [...] }` only; targets as plain scripts (`build/check/test/clean` + later `verify`); zero `nx.json` edits | no |
| D6 | Boundary tag | **`kind:foundation`** under E1-B; **new `kind:ui`** (formal taxonomy revision) forced iff E1-A | follows E1 |
| D7 | tsconfig | extend `tsconfig.base.json`, override `module: esnext` / `moduleResolution: bundler` / `jsx: react-jsx` / `verbatimModuleSyntax`, `noEmit` (tsup emits d.ts); strict, no TS7056 tolerance | no |
| D8 | Test wiring | root `vitest.config.ts` project block `studio-ui` + package-local jsdom/@testing-library devDeps (isolated linker demands them) | no |

---

## 1. D1 — Package name (RESERVED to Matei, Q2)

### Verified naming ground (full workspace listing @ `c4ebaf1e1`)

| Scope | Members | Practice |
|---|---|---|
| `@swooper/*` | `@swooper/mapgen-core` (kind:engine), `@swooper/mapgen-viz` (kind:foundation) | mapgen domain |
| `@civ7/*` | `adapter`, `control-orpc`, `direct-control`, `map-policy`, `types`, `config`, `studio-server`, `plugin-*`, `docs`, `playground` | infra / control / plugins / apps |
| `@mateicanavra/*` | `civ7-cli`, `civ7-sdk` | the only actually-published packages (GitHub Packages; `packages/sdk/package.json:65-68` `publishConfig`) |
| unscoped | `mapgen-studio`, `mod-swooper-maps`, `civ-mod-dacia`, `mod-civ7-intelligence-bridge` | apps + mods |

The split is real but not surgical (`@civ7/map-policy` is arguably mapgen-domain). The Nx project name **is** the package.json `name` (package-json-workspaces inference, `ground/repo-conventions.md` §4.1) and root scripts address projects by that name — so the name is also the CLI handle (`nx run <name>:build`).

### Options

| Candidate | For | Against |
|---|---|---|
| **`@swooper/studio-ui`** ★ | MapGen Studio is squarely mapgen-domain; short; dir `packages/studio-ui` matches unscoped-suffix house style (`mapgen-viz`, `studio-server`); leaves `@civ7/*` meaning "infra" intact | breaks nominal symmetry with `@civ7/studio-server` |
| `@civ7/studio-ui` | perfect sibling symmetry with `@civ7/studio-server`; if E1-A lands (package type-depends on studio-server) the pairing reads naturally | `@civ7/*` in practice = infra/control/plugins; a design system of the mapgen app is domain presentation, not infra; if E2 lands "ship Civ7 engine ids in package" that's *domain* data, again `@swooper`-flavored |
| `@swooper/mapgen-studio-ui` | maximally explicit; exactly the app's name + `-ui` | long; every import line and `nx run` invocation pays for it; no other package repeats its app's full name |
| `@swooper/ui` | reads as "the design system" | over-general: FRAME §3 says this is NOT a general design-system program ("one package, one consumer app, one sync pipeline"); the name would advertise scope the frame forbids |

**Recommendation: `@swooper/studio-ui`.** Tiebreaker for Matei: if you read "studio" as a product whose stack should be named as a unit (server+ui under one scope), pick `@civ7/studio-ui`; if you read the split as domain-vs-infra (the practiced meaning), the UI surface is domain → `@swooper`.

Knock-on (either choice): design-sync `config.json` `pkg` key becomes the new name (today `"pkg": "mapgen-studio"`, `ground/sync-surface.md` §2) — the `pkg` value is the import specifier the DS previews use; Q6's repoint carries it.

## 2. D2 — Location and publishing posture (RESERVED to Matei, Q2)

**Location: `packages/<dir>` — not contested.** Root workspaces globs (`package.json:73-79`) auto-register it; CI's Nx cache key already hashes `packages/*/package.json` (`ground/repo-conventions.md` §1.1); the habitat boundary/biome/grit scans cover `packages/**` on day one with no wiring (§4.1). Dir name = unscoped suffix: `packages/studio-ui`.

### Publishing posture options

| Option | Shape | Trade-off |
|---|---|---|
| **P1 — private workspace package, publishable-shaped manifest** ★ | `"private": true`, `"version": "0.1.0"`, full `exports`/`files`/`sideEffects`/peers as if publishable | Matches every internal exemplar (`studio-server:5`, `mapgen-viz:5`, control-orpc, plugin-*). Zero registry decisions now; flipping later = flip `private`, add `publishConfig`, (likely) rename — one commit. |
| P2 — publishable now | `"private": false` + `publishConfig` | House publishing is GitHub Packages, where **the scope must equal the repo owner**: both published packages are `@mateicanavra/*` (`packages/sdk/package.json:65-68`). Publishing under `@swooper`/`@civ7` requires either owning those npm scopes (unverified) or a rename to `@mateicanavra/studio-ui` — i.e., P2 partially pre-empts D1. No consumer outside this repo exists (FRAME §3), so the cost buys nothing today. |

**Recommendation: P1.** The LEDGER's "pin before publishing" items (adjudication 9) are done NOW regardless, so P1 does not create drift debt. Record explicitly: publishable-shaped means "the manifest would survive `npm publish` review", not "we intend to publish".

Metadata per house convention: `"type": "module"`, `"version": "0.1.0"`, `"engines": { "node": "22.22.0" }`; license omitted like other private packages (add `MIT` if Matei picks P2).

## 3. D3 — Full package.json shape

### 3.1 Draft manifest (concrete; E1-B branch shown, E1-A delta in §4)

```jsonc
{
  "name": "@swooper/studio-ui",                      // D1, RESERVED
  "version": "0.1.0",
  "description": "MapGen Studio design system: the 46 design-synced components, theme tokens, extended cn, useResolvedTheme, and the story corpus",
  "private": true,                                    // D2, RESERVED
  "type": "module",
  "nx": { "tags": ["kind:foundation"] },              // D6; becomes kind:ui iff E1-A
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "exports": {
    ".":            { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./types":      { "types": "./dist/types.d.ts", "import": "./dist/types.js" },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "<Q4's recipe — contract below>",
    "dev":   "<Q4's watch variant>",
    "check": "tsc -p tsconfig.json --noEmit",
    "test":  "vitest run --config ../../vitest.config.ts --project studio-ui",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@radix-ui/react-checkbox": "1.3.4",
    "@radix-ui/react-dialog": "1.1.16",
    "@radix-ui/react-dropdown-menu": "2.1.17",
    "@radix-ui/react-label": "2.1.9",
    "@radix-ui/react-popover": "1.1.16",
    "@radix-ui/react-scroll-area": "1.2.11",
    "@radix-ui/react-select": "2.3.0",
    "@radix-ui/react-separator": "1.1.9",
    "@radix-ui/react-slot": "1.2.5",
    "@radix-ui/react-switch": "1.3.0",
    "@radix-ui/react-tabs": "1.1.14",
    "@radix-ui/react-tooltip": "1.2.9",
    "@rjsf/core": "6.2.5",
    "@rjsf/utils": "6.2.5",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "0.522.0",
    "sonner": "2.0.7",
    "tailwind-merge": "3.6.0",
    "tw-animate-css": "1.4.0",
    "typebox": "^1.0.80"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@types/react": "^19.2.10",
    "@types/react-dom": "^19.2.3",
    "@testing-library/dom": "10.4.1",
    "@testing-library/react": "16.3.2",
    "jsdom": "29.1.1",
    "tailwindcss": "^4.1.13",
    "@tailwindcss/vite": "^4.1.13"
  },
  "engines": { "node": "22.22.0" }
}
```

### 3.2 Exports map rationale

- **Root entry** = the value-clean barrel (LEDGER adjudication 8): all 46 components + `TooltipProvider` + `cn` + `useResolvedTheme` + `LAYOUT` + the split-out formatters — everything the app and the design-sync `--entry` need (LEDGER §6 client demands). Dist-only paths, `types`-first key order, ESM-only: the exact house pattern (`packages/mapgen-core/package.json:21-86`; `mapgen-viz:18-23`).
- **`./types`** = the types barrel LEDGER §6 demands ("one value-clean barrel, one types barrel") and the artifact that retires the `source-storybook.mjs` synthEntry fork (WORKSTREAM §5a.5 — the fork exists only because the app publishes no `exports`/`types`). Emit a real (near-empty) `dist/types.js` beside the `.d.ts` so the subpath behaves under every resolver; tsup emits this for free from a type-only entry. It carries: `StageView` (row 20 re-home), `RecipeDagLoadStatus` (row 44 re-home — this is what kills the TS7056 path), the collapsed `RunInGame*Relation` union (adjudication 7), the riverLakeInspector structural types (rows 22/41), and the E1-dependent contract-type surface (§4).
- **`./styles.css`** = the compiled CSS entry that owns the `@theme inline` token block, tw-animate-css, and the unlayered globals (adjudication 9). No CSS-export precedent exists in the repo (`ground/repo-conventions.md` §3.2) — this sets it; a plain string target (no conditions object) is the community norm for asset subpaths. Q4 owns how the file is produced; this design fixes only its exported name and that it is a **single flat file** (design-sync consumes the transitive `@import` closure of `cssEntry`; a flat file keeps the closure trivial).
- **No `bun-source` condition.** That condition serves the Bun-run server daemon only (`apps/mapgen-studio/package.json:116`; `ground/repo-conventions.md` §2.4); the Vite frontend never sets resolve conditions. FRAME §4 explicitly warns not to cargo-cult it.
- **No per-component subpaths.** The barrel is the sync's entry and the app's import surface; 46 subpaths would re-create the exports↔entry hand-sync burden mapgen-core carries (`tsup.config.ts` entry array mirrored by hand) for zero consumer demand.
- **`sideEffects: ["**/*.css"]`** — component JS is pure (props-driven, no module-scope effects per LEDGER §6), so allow full tree-shaking but protect the CSS entry from being pruned by any bundler that ever sees it imported. First `sideEffects` field in the repo (verified absent everywhere, `ground/repo-conventions.md` §3.2) — deliberate.
- **`files: ["dist"]`** — `src` in `files` is only needed by packages whose exports reach into src (`bun-source` packages, mapgen-viz's dev alias); neither applies. npm-pack hygiene for the publishable-shaped posture.

### 3.3 peerDependencies policy — the precedent is ours to set (verified: zero peerDependencies repo-wide, `ground/repo-conventions.md` §1.8)

| Option | Trade-off |
|---|---|
| **react + react-dom as peers `^19.0.0`, duplicated in devDependencies `^19.2.4`** ★ | The library-correct posture: exactly one React instance is structurally guaranteed — the app provides it, the package's compiled output never carries its own. Under bun's isolated linker (`bunfig.toml:4`) peers resolve against the dependent's context and bun auto-installs missing peers, so a single-app workspace behaves identically to today; the devDep copy (same resolved version 19.2.4 → same store entry, one physical React) serves the package's own tests/Storybook. Sets the repo's first peer-dep precedent — which is fine, because this is the repo's first React *library* (every prior package is Node-side). |
| react as a regular dependency | Honest today, but plants the duplicate-React landmine: the moment app and package ranges drift, two React copies exist under the isolated linker and every hook call in the package breaks at runtime. That is precisely a "dependency-direction smell = defect" under the directive — the package does not own the app's renderer. |
| no declaration (lean on hoisting) | Fails outright: the isolated linker resolves imports per-package; undeclared = unresolvable (`ground/repo-conventions.md` §4.4). |

Peer range `^19.0.0` (not `^19.2.4`): the package uses React 19 APIs (no forwardRef sweep is E3-gated), not 19.2-specific ones; a wide-but-major-pinned peer range is what every Radix package in the lockfile does. `@types/react` stays devDeps-only (workspace-private; consumers here are TS-native — revisit only if P2 ever lands).

### 3.4 Dependency list — derivation and pins

Rule: a package dependency is exactly what the barrel's runtime closure imports (LEDGER adjudication 10 — honesty is enforced *at the package boundary*, and the isolated linker mechanically enforces it). Pins copied from today's **resolved** versions so the extraction changes zero installed bytes:

- **All 12 `@radix-ui/*` pins verbatim** from `apps/mapgen-studio/package.json:146-157` (already exact pins). Verified no radix import exists outside `src/components/ui/` (grep at `c4ebaf1e1`), so the app side drops them entirely at rewire.
- **`class-variance-authority 0.7.1`, `clsx 2.1.1`, `tailwind-merge 3.6.0`** — currently `"latest"` in the app (`package.json:163-164,172` — the defect named in WORKSTREAM §5b and adjudication 9 "pin before publishing"); pins are the lockfile's current resolutions (`bun.lock`: cva@0.7.1, clsx@2.1.1, tailwind-merge@3.6.0). Exact pins, not carets: these three define `cn` semantics, the one class-merge engine of the whole surface (adjudication 4), and tailwind-merge in particular has a history of merge-behavior changes in minors.
- **`tw-animate-css 1.4.0` PROMOTED to dependencies** — devDeps-only today (`apps/mapgen-studio/package.json:189`), a categorical fix ordered by adjudication 9/13. It lives in `dependencies` (not devDeps) because the package's CSS entry *owns* it: whether the app consumes compiled CSS or ever scans package source CSS, the import must resolve from the package's own context.
- **`@rjsf/core 6.2.5` + `@rjsf/utils 6.2.5`** — exact pins (app has `^6.2.5`). Justification: the `@rjsf/core/lib/components/Form.js` deep-subpath import is a pinned CSP hazard that must be re-verified on every rjsf bump (LEDGER §7); an exact pin turns "a bump happened" into an explicit diff.
- **`sonner 2.0.7`** — Toaster. Note: the app ALSO keeps `sonner 2.0.7` in its own deps — `src/app/hooks/useToast.ts` repoints to sonner directly once the barrel's `toast` value re-export is dropped (adjudication 8). Same pin on both sides; not a smell, both genuinely import it.
- **`lucide-react 0.522.0`** — icons; verified the only importer outside the moving component homes is `features/recipeDag/domainPresentation.ts`, which itself moves (coherence §3 recipeDag split). App side drops it.
- **`typebox ^1.0.80`** — `typeboxRjsfValidator.ts:49` imports `typebox/value` (grep-verified). Caret (not exact) deliberately: it must stay resolution-identical with `@civ7/studio-server` and the app (`^1.0.80` both) to avoid a second typebox instance; matching the workspace range keeps bun deduping them to one copy.
- **`@standard-schema/spec` stays OUT** — zero imports anywhere in `apps/mapgen-studio/src` (grep-verified); it's a server/app transitive concern.

**Stays OUT (categorical, per brief + coherence §3):** `zustand`, `@tanstack/react-query`, all `@orpc/*`, `effect`/`effect-orpc`, `@swooper/mapgen-core`, `@swooper/mapgen-viz`, `mod-swooper-maps`, `@deck.gl/*`, `@civ7/adapter|control-orpc|direct-control|map-policy|plugin-mods`, `@rjsf/validator-ajv8` (retired by the TypeBox validator, PR #1993). Any of these appearing in the package manifest is a red flag that a split (status formatters, configBuilders, useRecipeDagQuery, seedPolicy, setupConfig) was executed wrong.

**Conditional — fonts (coordinate with Q4/theme designer):** design-sync demands woff2 fonts in the bundle (LEDGER §6); `@fontsource/inter`/`@fontsource/jetbrains-mono` are app deps today (`package.json:144-145`). If Q4 makes the package CSS own the `@font-face` layer (consistent with "CSS pipeline is categorical", adjudication 9), add both at `^5.1.1` to package `dependencies` and drop from the app; if fonts stay an app concern with the converter collecting them separately, they stay out. This report's manifest is valid under either; flagged as the one open manifest line.

**Residual app manifest**: re-derive mechanically at rewire — the isolated linker fails loudly on any under-declaration, and the app's `check`/`build` will name every miss. Expected drops: 12×radix, cva/clsx/tailwind-merge, lucide-react, tw-animate-css, `@rjsf/*`; expected keeps: sonner (useToast), everything transport/store/engine.

### 3.5 Toolchain deps NOT declared

`tsup`, `typescript`, `vitest`, `rimraf` are root devDependencies (root `package.json:120-124`) and every existing package resolves their bins from the root under bun workspaces (mapgen-viz builds with undeclared tsup today). House rule per `ground/repo-conventions.md` §4.4: do not re-pin the toolchain per-package. `tailwindcss`/`@tailwindcss/vite` ARE declared (devDeps) because the package's build imports them as modules, not just bins — final call on which of the two Q4's recipe needs is Q4's; both listed pending that design.

## 4. D4 — Contract-types wiring, parameterized on E1 (E1 RESERVED to Matei)

Three sites (LEDGER E1): `MapConfigSaveDeployStatus` + `RunInGameOperationStatus` (GameConsole/RecipePanel props, post split-formatters) and `RecipeDagResult` (PipelineStage public prop). Both branches below keep the same app-facing surface: **the app imports these from `@swooper/studio-ui/types` either way**, so Matei's E1 call flips package internals + one manifest line + the tag — not the rewire.

### Branch E1-A — types-only reference to `@civ7/studio-server`

- Manifest: add `"@civ7/studio-server": "workspace:*"` to **`dependencies`** (not devDeps: the types appear in the package's *published* `.d.ts` — `GameConsoleProps` et al. — so consumers need the reference resolvable at typecheck; a devDep would be the exact under-declaration adjudication 10 bans). Runtime JS never references it (all imports are `import type`, erased under `verbatimModuleSyntax`), so no server code can leak into the bundle — enforceable with a one-line dist grep in `verify` (§5.4).
- Types barrel re-exports: `export type { MapConfigSaveDeployStatus, RunInGameOperationStatus, RecipeDagResult } from "@civ7/studio-server/contract"` — the subpath exists with real d.ts (`packages/studio-server/package.json:24-28`).
- Nx graph: a real edge package→studio-server appears (Nx derives edges from imports + manifest). Consequences: (a) package `build`/`check` gain `^build` on studio-server — already in the CI graph, no new work, but the UI package can no longer build before the server package on cold caches; (b) **boundary lint**: `kind:foundation → kind:control` is illegal (`eslint.boundaries.config.mjs:33`), and `@nx/enforce-module-boundaries` does not exempt type-only imports — so E1-A **forces the `kind:ui` taxonomy revision** (§6, option T2). This coupling is the single biggest hidden cost of E1-A and was not priced in the LEDGER's E1 framing ("zero drift, direction smell") — surface it to Matei with the E1 decision.

### Branch E1-B — re-homed structural types

- The three shapes live in package source (suggested home: `src/types/server-contract.ts`, exported via `./types`); zero workspace dependencies; `kind:foundation` fits with no taxonomy change.
- Reverse-drift control (the verify-panels HEAVY-for-the-DAG-shape risk): add an **app-side** type-level assignability test (the app is the one place that sees both the server truth and the package twin), e.g. a `test/types/contractParity.test-d.ts` with mutual-`satisfies` assertions for the three shapes. Drift then fails `mapgen-studio:check`/`test` loudly instead of rotting silently. This test is app code, so it costs the package nothing and dies naturally if E1 is ever re-decided.
- Union twins: the collapsed `RunInGameActionRelation`/`RunInGameCurrentRelation` union (adjudication 7) is package-owned under BOTH branches (it is not a server contract type); only the three contract shapes above are E1 matter.

**Recommendation (for Matei's decision, not made here): E1-B.** It is the only branch where the dependency direction is clean (directive: direction smells are defects), the only one that keeps `kind:foundation` legal, and its known cost (reverse drift on the DAG shape) is mechanically fenced by the parity test. E1-A's real price — a taxonomy revision admitting `ui → control` type edges — encodes the smell into the boundary table permanently.

## 5. D5 — Nx wiring

### 5.1 Registration and config surface

Nothing to register: workspaces glob + package.json = project (verified mechanism, `ground/repo-conventions.md` §4.1; no `projects` key in `nx.json`, single habitat plugin only). Config is the package.json `"nx"` key — **no project.json** (repo has exactly one, `civ7-direct-control`, as the deliberate exception; the FRAME §8 project.json collision concerns the *app*, which this design does not touch). Full shape:

```json
"nx": { "tags": ["kind:foundation"] }
```

No `nx.targets` overrides needed: plain scripts + `nx.json` targetDefaults do everything —

| Target | Script | targetDefault effect (`nx.json:15-85`) |
|---|---|---|
| `build` | Q4's recipe | `dependsOn ^build`, outputs `{projectRoot}/dist/**` already covered (`nx.json:18-23`), cached |
| `check` | `tsc -p tsconfig.json --noEmit` | `dependsOn ^build,^check`, cached |
| `test` | `vitest run --config ../../vitest.config.ts --project studio-ui` | `dependsOn ^build`, cached |
| `clean` | `rimraf dist` | cached |
| `verify` (later change set) | artifact-contract assertions (§5.4) | `dependsOn build,^build`, **uncached** (`nx.json:78-81`) |

No `lint` script: root `lint` = repo-wide `habitat-harness:biome:ci` (root `package.json:24`) and biome needs zero config for a CSS-shipping package (`tailwindDirectives` already on, `ground/repo-conventions.md` §1.10) — matching mapgen-viz/mapgen-core/studio-server, which also have none.

### 5.2 The CI chain (falsifier walk)

CI = `nx run-many --targets=build,check,lint,test,verify` (root `package.json:12`, `ci.yml:52-53`). **Any script named one of those five auto-joins; custom names don't run** (`ground/repo-conventions.md` §1.4). The falsifier — breaking `nx run mapgen-studio:check`'s `^build` chain — is checked as follows: the app's rewire adds `"@swooper/studio-ui": "workspace:*"` to app dependencies → Nx adds the edge → app `check` (which keeps its existing `dependsOn: ["^build", mod-swooper-maps build:studio-recipes]`, `apps/mapgen-studio/package.json:50-60`) now runs package `build` first → app `tsc` resolves `node_modules/@swooper/studio-ui` → symlink → `exports` → fresh `dist/*.d.ts`. No app `nx` key edit, no `nx.json` edit, no CI edit. Same for `build:vite`→`check` and `test`. The one behavior to know, not fix: cold editors need one `nx run @swooper/studio-ui:build` before types resolve — true of every dist-first package here.

### 5.3 Dev-loop wiring (recommended, small)

`vite.config.ts:64-73` deliberately ignores `packages/*/dist/**` in the dev watcher — so a dist-only package gets **no HMR** for component edits, which is unacceptable for the app's primary UI surface. Adopt the sanctioned house pattern (the mapgen-viz precedent, `ground/repo-conventions.md` §2.2): dev-only source alias `@swooper/studio-ui` → `../../packages/studio-ui/src/index.ts`, mirrored in BOTH `apps/mapgen-studio/vite.config.ts` (serve-gated) and whichever `.storybook/main.ts` survives Q5 (DEVELOPMENT-gated). Known cost: the same dual-maintenance the repo already tolerates for mapgen-viz. Production/CI paths stay dist-first, so the fidelity oracle and the sync always see the real build artifacts.

### 5.4 The `verify` slot and the design-sync CI ambition (FRAME §2 "sync is CI-runnable ... an Nx target")

Recommendation: package `"verify"` = fast **artifact-contract assertions** on the real dist (map-policy is the house `verify` exemplar, `civ7-map-policy/package.json:23`): dist entry exists and exports exactly the 46 names + TooltipProvider; `dist/styles.css` contains the dark-default `:root` block AND the `.light` block (this is the structural, on-real-artifacts replacement for `build-inputs.sh`'s `assert_theme_block` guard — the bug class from FRAME §1 becomes a CI assertion); no `@civ7/studio-server` specifier appears in `dist/*.js` (E1-A runtime-leak fence, §4). Cheap, Chromium-free, runs on every CI pass. The full resync/render-check (needs `DS_CHROMIUM_PATH`, O(46) captures) must NOT be `verify` — it stays a manually-invoked target (custom name, e.g. `design-sync:check`, deliberately outside the CI five) per the atomic-upload gating in WORKSTREAM §3.6. Exact target composition belongs to the Q6 designer; this design reserves the names and the CI-weight rule.

## 6. D6 — Boundary tag (follows E1; taxonomy revision itself is Matei-gated by the habitat protocol)

Enforced table: `eslint.boundaries.config.mjs:19-70` via `@nx/enforce-module-boundaries` (run as the `boundaries` target, habitat plugin `tools/habitat-harness/src/plugin.js:85-108`). No `kind:ui` exists. The rule only constrains **workspace project edges** — npm deps are invisible to it — so the tag question is exactly "what workspace packages may the UI package import".

| Option | Legality | Trade-off |
|---|---|---|
| **T1 — `kind:foundation`** ★ (under E1-B) | `foundation → foundation` only (`:33`); under E1-B the package has ZERO workspace deps → trivially legal; `kind:app → foundation` already allowed (`:56-68`) so the app consumes it with no table change | Zero config churn, and the constraint semantics are *exactly right* for a design system: it may never grow a workspace dependency on engine/control/app without the lint screaming — the boundary table becomes the enforcement of LEDGER §6's "no store, no transport, no server runtime". Mild semantic stretch: "foundation" members today are contract/util packages (mapgen-viz, types, config, map-policy); a React library is a new *flavor* of foundation, same *position*. |
| T2 — new `kind:ui` | Requires the formal paired revision: `docs/projects/habitat-harness/taxonomy.md` §3 + `eslint.boundaries.config.mjs` together, per the protocol in `tools/habitat-harness/README.md` (config header `:10-14` makes this explicit). Rows: `{ sourceTag: "kind:ui", onlyDependOnLibsWithTags: ["kind:foundation"] }` (+ `"kind:control"` iff E1-A) and add `"kind:ui"` to `kind:app`'s list | Honest layer naming; **mandatory under E1-A** (foundation→control is illegal and the boundaries rule does not exempt `import type`). Cost: a cross-lane taxonomy change owned by the habitat discipline — process weight this extraction doesn't otherwise need. |
| T3 — `allow`-list exception for `@civ7/studio-server/contract` | Technically expressible (`allow:` at `:111`) | Rejected: the config header forbids ad-hoc additions ("any red edge is a violation, not negotiable debt"); an allow-entry is a taxonomy revision in disguise, minus the honesty. |

**Recommendation: T1 under E1-B; T2 becomes mandatory iff Matei picks E1-A** — present the pairing to Matei as one decision ("E1-B + foundation" vs "E1-A + kind:ui revision"), not two.

## 7. D7 — TypeScript config

```jsonc
// packages/studio-ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "types": []
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

- **Base: `tsconfig.base.json`** (ES2022 / strict / declaration / noEmit) with the **studio-server-style bundler override** (`packages/studio-server/tsconfig.json:2-16` documents the exact rationale: tsup builds it, Vite consumes it → typecheck with bundler semantics). NOT `extends: ../../tsconfig.json` (the mapgen-viz quirk — inherits the root composite `references`, pointless here) and NOT the app's standalone config (the app is deliberately self-contained; a package should inherit the base like every other package).
- **`jsx: "react-jsx"`** — first package to set `jsx` (verified zero hits outside the app, `ground/repo-conventions.md` §1.7). No conflict: it's per-project config.
- **`verbatimModuleSyntax: true`** — house style (viz, server) AND load-bearing here: it forces `import type` for every E1/type-only crossing, which is what makes the "no server code in the bundle" guarantee (§4, §5.4) compiler-enforced rather than convention.
- **`types: []`** — browser package; no node ambient types (viz/server declare `["node"]` because they're Node-side; copying that here would silently legalize `process.*` in components).
- **`noEmit` stays true (inherited); tsup emits.** The house split (`ground/repo-conventions.md` §1.7): `check` = strict tsc, `build` = tsup with `dts: true`. **Strict d.ts emit is now a hard gate, not best-effort**: FRAME §2 requires the TS7056 tolerance gone, and it dies structurally — the offending type path (`src/lib/orpc.ts` orpc client types) never enters the package graph because `RecipeDagLoadStatus` re-homes into the package (LEDGER row 44) and `useRecipeDagQuery` stays app-side (coherence §3 recipeDag split). If tsup's dts step ever hits TS7056 in this package, a split was mis-executed — stop-and-diagnose, do not add `skipLibCheck`-style tolerances to the build.
- Stories compile under `check` (they're in `src/**`), keeping the oracle type-honest. If Q5 homes Storybook in the package, its `.storybook/` config joins the include set — Q5's call.

## 8. D8 — Test wiring

House mechanism (`ground/repo-conventions.md` §1.9): vitest-tested projects register a named project block in root `vitest.config.ts`, and the package script targets it. Add:

- Root `vitest.config.ts`: a `studio-ui` project block — `environment: "jsdom"`, include `packages/studio-ui/**/*.test.{ts,tsx}`. Unlike the mapgen-studio block (`vitest.config.ts:47-91`) it needs **no alias re-declarations**: package-internal imports are relative/bare-npm, the `@` alias does not exist in the package (the ledger's `@`-alias rewrite for the 46 stories is precisely the removal of that coupling).
- Tests that move with their modules: `typeboxRjsfValidator.test` (coherence §3 configOverrides split) and the repointed `sonnerTheme` test (adjudication 5). Hence the jsdom/@testing-library devDeps in §3.1 — under the isolated linker the package cannot borrow them from the app (`ground/repo-conventions.md` §1.8).
- The E1-B parity test (§4) lives in the **app's** test project, not the package's, by design.

---

## 9. Conflicts / risks (cross-axis)

1. **E1 ↔ tag coupling (biggest):** E1-A forces the `kind:ui` taxonomy revision (foundation→control illegal; the boundaries rule counts type-only imports). The LEDGER's E1 option table prices E1-A as "zero drift, direction smell" — the taxonomy-revision cost must be added to Matei's decision packet. Owner of the packet should present "E1-B + kind:foundation" vs "E1-A + kind:ui revision" as single bundles.
2. **Publishing scope constraint:** house registry is GitHub Packages where scope = owner; a future publish of `@swooper/studio-ui` means a rename or a scope decision. P1 defers this cleanly, but D1 and P2 interact — if Matei wants publishable-now, the name conversation changes.
3. **Fonts ownership is the one open manifest line** — coordinate with Q4/theme designer (§3.4). Either resolution keeps this manifest valid.
4. **Dev HMR requires the dual-maintained source alias** (vite.config + storybook main) because the app watcher ignores `packages/*/dist/**`; skipping it makes component iteration build-gated. Accepted house pattern, but it must be gated to dev only or the oracle would stop seeing real dist artifacts.
5. **`verify` weight discipline:** if anyone wires the Chromium render-check into `verify`, every CI run pays O(46) captures and needs a browser — keep `verify` = artifact assertions, full resync = manually-invoked custom target (names reserved in §5.4; final composition is Q6's).
6. **Peer-dep precedent:** first `peerDependencies` in the workspace. Bun's isolated linker handles it, but any future tooling that audits "all deps declared" must learn the peer category — low risk, worth one line in the package README.
7. **sonner double-declaration** (package Toaster + app useToast) is correct-by-design but will look like duplication in review — pre-empt with a manifest comment in the PR description, and keep both pins identical (2.0.7).
