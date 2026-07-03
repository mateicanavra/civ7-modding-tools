# Design report — Q4: Build recipe & CSS pipeline (Designer 2)

**Lens:** the package build natively produces everything `apps/mapgen-studio/.design-sync/build-inputs.sh` manufactures by hand. Any post-build transform of a compiled artifact = build-inputs.sh reborn = design failure.

**Package placeholder:** `@swooper/studio-ui` at `packages/studio-ui/` — the NAME and location are **Q2, RESERVED to Matei**. Every occurrence below is a placeholder; nothing in this design depends on the specific name (one config key + import specifiers change).

Repo worktree read: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction` @ `c4ebaf1e1`. Ground reports cited as `ground/converter.md` and `ground/theme-token.md` (session scratchpad `ground/`).

---

## 0. TL;DR

- **JS:** tsup single-entry ESM (house convention; root already ships `tsup ^8.5.1`), `dts: false`.
- **Types:** `tsc -p tsconfig.build.json --emitDeclarationOnly` into `dist/` — the build itself is the strict gate (tsc exits non-zero on any error; no TS7056 tolerance possible because the package type graph can never reach `src/lib/orpc.ts`). `src/index.ts` is the authored barrel; its emitted `dist/index.d.ts` is the `types` entry that retires the synthEntry fork.
- **CSS:** ONE authored dark-default source (`:root, .dark { dark }` + `.light { light }` — zero palette duplication), compiled to a flat `dist/styles.css` by `@tailwindcss/cli` with `source(none)` + explicit `@source "../"` (covers components, stories, fixtures, sonner.tsx). A theme-invariant test on the compiled output replaces `assert_theme_block`.
- **Fonts:** package-owned authored `fonts.css` (`url(./fonts/…)`) + a declarative copy of pinned `@fontsource` woff2s into `dist/fonts/`; the app drops its six `@fontsource` JS imports.
- **App:** `apps/mapgen-studio/src/index.css` collapses to imports (`tailwindcss`, `@swooper/studio-ui/theme.css`, `@swooper/studio-ui/fonts.css`) + `@source` of the package dist. The app-only-globals set turns out to be **empty**. One mandatory app-side companion change: the `index.html` pre-paint script must add the `.light` class in its light branch (today it only appends a style override — index.html:48-57).
- **design-sync:** `cfg.entry` dropped (resolveDistEntry reads `module`/`exports` natively), `cssEntry: "dist/styles.css"`, `buildCmd` = the package build, synthEntry fork + `libOverrides` deleted. **Zero transforms between `dist/` and the converter.**

The three hand transforms die by authoring, not by relocation: font-url rewrite (build-inputs.sh:71) → URLs authored `./fonts/` at source; `.dark`→`:root` flip (:79-85) → `:root` authored dark; `:root`→`.light` (:96-102) → `.light` authored. `assert_theme_block` (:22-32) → a real test on `dist/styles.css`.

---

## 1. What must be natively produced (the contract restated)

From `ground/converter.md` §3 (verified against `.ds-sync/` code) the converter consumes exactly:

1. An esbuild-bundlable **ESM dist entry** exporting the 46 PascalCase names + `TooltipProvider` (provider gate hard-fails otherwise — `package-build.mjs:643-645`); resolved via pkgJson `module` → `exports['.'].import` → … (`bundle.mjs:24-35`).
2. A **flat compiled stylesheet** (`cfg.cssEntry`, PKG_DIR-relative, containment-bounded inside the package — `package-build.mjs:282-310`): no dangling `@import` (`[CSS_IMPORT_MISSING]`, `package-validate.mjs:160-163`), dark tokens as the `:root` default, light palette under `.light`, `@font-face` rules whose relative `url()`s resolve to shipped woff2s from the stylesheet's own directory.
3. A **`.d.ts` tree** with `<Name>Props` interfaces + a `types` barrel: `findTypesRoot` = `dirname(pkgJson.types)` (dts.mjs:10-24); `loadDts` parses `<typesRoot>/**/*.d.ts` (dts.mjs:105-108); `exportedNames` reads the entry named by `types` via ts-morph `getExportedDeclarations()` — **which follows `export * from` re-exports** (dts.mjs:270-283), so a tsc-emitted tree with a re-exporting barrel satisfies it. A non-empty exported set is precisely what lets `.design-sync/overrides/source-storybook.mjs` (the synthEntry fork) be deleted.
4. **Font binaries** resolvable relative to `dirname(cssEntry)` with `roots=[PKG_DIR]` (`extractFonts`, css.mjs:13-49) — the woff2s must physically live inside the package.

All standard library-build outputs — except the dark-default/`.light` stylesheet, which no off-the-shelf pipeline emits by accident. That artifact is designed in §4.

---

## 2. Decision 1 — JS build tool

| Option | Pros | Cons |
|---|---|---|
| **tsup (recommended)** | House convention (`packages/mapgen-viz/package.json`: `tsup src/index.ts --format esm --dts`; `packages/mapgen-core`: `"build": "tsup"` + `tsup.config.ts`; root devDep `tsup ^8.5.1`); esbuild-fast on ~60 TSX modules; auto-externalizes `dependencies` + `peerDependencies` (Radix, sonner, rjsf, lucide, cva/clsx/tailwind-merge, react stay unbundled — exactly what the app's Vite and the converter's esbuild pass want); JSX via tsconfig `jsx: react-jsx` | `--dts` does **not type-check** (see Decision 2 — we don't use it); one bundled file (fine: ESM + `sideEffects` → Rollup tree-shakes named exports) |
| Vite lib mode | Could unify JS+CSS+assets in one tool; native url()/asset handling | No in-repo lib-mode precedent; CSS-entry lib builds are the awkward corner of Vite (output naming, `cssCodeSplit` quirks); heavier config for zero capability we need; hashed asset names make fidelity diffs noisier |
| plain tsc | Simplest mental model; per-module output | No house precedent for JS emit (tsc is the *check* tool here); no externals/treeshake control; slowest; still needs the CSS pipeline anyway |

**Recommendation: tsup.** Exact config:

`packages/studio-ui/tsup.config.ts`
```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  treeshake: true,
  // dist lifecycle is owned by the build script (rimraf first); tsc's d.ts
  // tree and the CSS/fonts artifacts land beside the bundle.
  clean: false,
  // Declarations come from tsc --emitDeclarationOnly (strict, fail-loud).
  dts: false,
});
```

`package.json` build scripts (Nx-invoked, mapgen-core style):
```json
"scripts": {
  "build": "rimraf dist && bun run build:js && bun run build:types && bun run build:css && bun run build:assets",
  "build:js": "tsup",
  "build:types": "tsc -p tsconfig.build.json",
  "build:css": "tailwindcss -i src/styles/index.css -o dist/styles.css",
  "build:assets": "node scripts/build-assets.mjs",
  "check": "tsc --noEmit",
  "test": "vitest run --config ../../vitest.config.ts --project studio-ui",
  "clean": "rimraf dist"
},
"nx": { "tags": ["<Q2 — kind:foundation unless a taxonomy revision lands>"], "targets": {
  "build": { "outputs": ["{projectRoot}/dist"], "dependsOn": ["^build"] }
} }
```

Class strings in component sources survive tsup/esbuild verbatim (string literals are not mangled), which the app-side `@source` scan of `dist` relies on (§6). One-file vs `bundle: false` per-module output: both satisfy every consumer; one file matches the house exemplars — chosen for convention, not necessity.

---

## 3. Decision 2 — d.ts strategy (strict emit, types barrel)

| Option | Pros | Cons |
|---|---|---|
| **`tsc --emitDeclarationOnly` (recommended)** | The **build step itself fails on any type error** — the anti-TS7056 posture is structural, not a sibling gate; emits a d.ts *tree* mirroring src (richer for `propsBodyFor`, which finds `<Name>Props` anywhere in-package — dts.mjs:362-394); `declarationMap` for editor jump-to-source | Barrel d.ts contains re-exports — but verified: `exportedNames` uses `getExportedDeclarations()` which resolves them (dts.mjs:274-283), and the whole tree is loaded into the ts-morph project (dts.mjs:105-108) |
| `tsup --dts` | Single rolled-up `index.d.ts`; one tool | **tsup dts does not type-check** — a broken type graph can still "build green", recreating the tolerate-and-ship failure mode this workstream exists to kill; rollup-plugin-dts occasionally mis-bundles Radix/`ComponentPropsWithoutRef`-heavy trees |
| `build-inputs`-style side tsconfig | — | The deletion target. Hand-enumerated include list + `noEmitOnError:false` is the bug class (tsconfig.dts.json:16-27, build-inputs.sh:44-54) |

**Recommendation: tsc tree emit.** Why the TS7056 path is dead by construction: the error lives in `src/lib/orpc.ts`, reached only via PipelineStage's type-only `useRecipeDagQuery` import (build-inputs.sh:48-50). Per LEDGER row 44, `useRecipeDagQuery` + `prunePipelineExpansion` **stay app-side** and `RecipeDagLoadStatus` re-homes — the package's type graph cannot reach the app. If any future import reintroduces such a path, `tsc -p tsconfig.build.json` exits non-zero and the **build fails loud** — the exact inversion of `|| echo` tolerance.

`packages/studio-ui/tsconfig.build.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.stories.tsx", "src/**/*.test.*"]
}
```

- Stories are excluded from *emit* (they're not API; the converter reads story **sources**, not story d.ts) but included in `check` (`tsc --noEmit` over the full `tsconfig.json`).
- **The types barrel is `src/index.ts` itself** — the authored, value-clean barrel (LEDGER adjudication 8; seeded from `ds-entry.tsx` per `ground/converter.md` §6, which then dies). `tsc` emits it as `dist/index.d.ts`; `package.json` `"types": "./dist/index.d.ts"` makes `findTypesRoot` return `dist` and `exportedNames` non-empty → fork + `libOverrides` deleted. Extra PascalCase exports beyond the 46 (DialogContent, SelectTrigger, …) are harmless: in storybook shape the component list comes from story titles; `exportedNames` only backs the public-exports filter and subcomponent partitioning (`package-build.mjs:690-736`).
- **E1 interaction (flag, decision reserved):** if E1 lands on "types-only peer dep on `@civ7/studio-server`", the emitted d.ts will carry `import("@civ7/studio-server/…")` references that the converter's ts-morph project **cannot resolve** (it loads only the package tree + `@types/react` — dts.mjs:103-108), degrading those props to `any`/`unknown` in the uploaded cards. Re-homed structural types yield strictly better card contracts. Not my decision; the build works either way.

---

## 4. Decision 3 — the authored CSS source (the hard part)

### 4a. Shape decision: author dark-default natively

| Option | Pros | Cons |
|---|---|---|
| **A (recommended): ONE dark-default source; `:root, .dark { dark }` + `.light { light }`** | The inversion becomes a deliberate authored fact — nothing manufactures it; app, Storybook, and sync consume the **same** theme artifact (FRAME §1 "they are the same artifact"); zero palette duplication via the selector list; `.light` explicit everywhere matches StudioProviders' existing both-classes convention (StudioProviders.tsx:28-32) | Changes the app's *default-state* CSS semantics (absence of classes now = dark) → needs the one-line `index.html` fix (§7) and the package Storybook decorator must write both classes (Q5 coordination) |
| B: keep light-default source + a second dark-default entry | App untouched | Two artifacts with different default semantics = the inversion survives as a maintained fork; either duplicated palettes (drift) or selector gymnastics; violates "one owner" |
| C: build-time re-target (PostCSS plugin flipping `.dark`→`:root`) | Single source | **This is build-inputs.sh reborn** with better tooling. Rejected on the lens. |

Prior grounding already recommends A (`ground/converter.md` §3: "authoring this deliberately … not by omission"; `ground/theme-token.md` §5.5).

### 4b. Exact source files

```
packages/studio-ui/src/styles/
  index.css     # the CSS BUILD ENTRY (compiled → dist/styles.css)
  theme.css     # the CONSUMER theme source (copied verbatim → dist/theme.css)
  fonts.css     # authored @font-face rules (copied verbatim → dist/fonts.css)
```

`src/styles/index.css` — compile entry, flat output:
```css
/* Package CSS build entry. @tailwindcss/cli compiles this to dist/styles.css
   (flat: every @import inlined, utilities generated from the @source scan). */
@import "tailwindcss" source(none);
@import "./fonts.css";
@import "./theme.css";

/* Deterministic content scan — source(none) disables auto-detection so the
   compile never depends on cwd or .gitignore state. Scope MUST cover story
   files and sonner.tsx (LEDGER adjudication 9). "../" = the package src/. */
@source "../";
```

`src/styles/theme.css` — the token/theme layer, authored **dark-default**:
```css
/* MapGen Studio design system — dark-default by design.
   The studio is dark-FIRST: :root carries the dark palette; hosts opt into
   light by putting .light on the root element. Contract (all three surfaces
   already honor it): host writes .dark or .light on <html>; absence = dark. */
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* VERBATIM move of apps/mapgen-studio/src/index.css:21-68 —
     27 --color-* mappings, --font-sans/--font-mono, --text-data/--text-label
     (+line-heights), --radius-sm/md/lg/xl, --animate-pulse-subtle. */
}

/* Palette. `:root, .dark` = ONE dark block (no duplication): :root makes dark
   the default; the .dark selector keeps the explicit-class convention working
   (app pre-paint, StudioProviders, Storybook decorator, container-scoped
   theming in the design tool). */
:root,
.dark {
  color-scheme: dark;
  /* VERBATIM: the 27 token values from src/index.css .dark block (115-146) */
  --background: 240 14% 6%;
  /* … all 27 … */
  --warning: 40 80% 56%;

  /* theme-agnostic (from src/index.css:108-112) — must be reachable in every
     theme state; today they ride along in whichever palette block applies */
  --radius: 0.25rem;
  --color-border-secondary: hsl(var(--border-strong));
  --color-text-muted: hsl(var(--muted-foreground));
}

/* ORDER IS LOAD-BEARING: .light and :root have EQUAL specificity (0,1,0) —
   :root is a pseudo-class. .light wins over the dark default only because it
   comes LATER in source order. Never move this block above the palette. */
.light {
  color-scheme: light;
  /* VERBATIM: the 27 token values from src/index.css :root block (76-113) */
  --background: 240 20% 97%;
  /* … all 27 … */
  --warning: 38 80% 42%;

  --radius: 0.25rem;
  --color-border-secondary: hsl(var(--border-strong));
  --color-text-muted: hsl(var(--muted-foreground));
}

@layer base {
  /* VERBATIM move of src/index.css:151-179 (border-color default, html font
     + smoothing, body margin/min-height/bg/color, focus contour signature) */
}

/* Unlayered globals — VERBATIM move of src/index.css:181-259:
   .font-mono, .custom-scrollbar (all rules), native select reset,
   input[type=number] spinner reset, button cursor/disabled,
   @supports backdrop-blur fallback, pulse-subtle keyframes + class.
   (Dead-weight candidates — pulse-subtle, the two legacy repointers — move
   VERBATIM in v1 per the E3 verbatim-first doctrine; deletion belongs to the
   cleanup wave.) */
```

Everything in the app's `index.css` moves. **Nothing in it is app-only** (checked block-by-block: tokens/@theme → package by kernel; `@layer base` + focus signature + `.font-mono` + `.custom-scrollbar` + form resets + button cursor + backdrop fallback + keyframes are all inside today's `_ds-compiled.css` and therefore part of what the 46 cards render with — moving less would be a fidelity break). This satisfies coherence §3's "index.css is a SPLIT" with the app half being *imports only* (§7).

### 4c. Cascade-order proof (falsifier: semantics vs today's `_ds-compiled.css`)

Today's artifact order: `[tailwind layers]` → `:root{light}`(A, src :76) → `.dark{dark}`(B, :115) → `[globals]` → appended `:root{dark}`(C, build-inputs:79-85) → appended `.light{light}`(D, :96-102). Designed order: `:root,.dark{dark}`(X) → `.light{light}`(Y).

| Root state | Today's computed result | Designed computed result | Match |
|---|---|---|---|
| no class | C wins over A (later, equal specificity) → **dark**, `color-scheme: dark`; `--radius`+legacy vars survive from A | X matches via `:root` → **dark**; radius+legacy in X | ✓ |
| `.light` | D wins (latest) → **light**, `color-scheme: light` | Y wins (later than X, equal specificity) → **light** | ✓ |
| `.dark` | B and C both match; C later → dark values (B ≡ C) → **dark** | X matches twice (both selectors) → **dark** | ✓ |
| container-scoped `div.dark` / `div.light` (design-tool case) | class blocks B/D apply to the subtree | `.dark` in X / Y apply to the subtree | ✓ |

Residual byte-level differences, all semantics-neutral: (1) the early light `:root` block (A) disappears — no state observable above reads a value only A defines; (2) utility coverage narrows from app-superset to package+stories (see §5 — cards unaffected, explorations risk flagged in §9); (3) output is unminified where today's is Vite-minified — deliberate, for diffable fidelity review (`styleSha` flips either way; the full 46-card render-check + re-upload wave is already priced — `ground/converter.md` §4).

### 4d. The designed replacement for `assert_theme_block`: a theme-invariant test

`packages/studio-ui/test/theme-invariants.test.ts` (vitest, runs in `test`; CI-gating):
- parse `dist/styles.css` (postcss or plain regex over the flat output);
- assert the `:root, .dark` block exists and carries `--background: 240 14% 6%` (dark-default spot check);
- assert `.light` exists **after** it and defines the identical token-name set (all 27 + radius + repointers) — this is the exact "light palette silently dropped" bug class (FRAME §4) made unshippable;
- assert at least one `@font-face` with `url(./fonts/` and that every referenced file exists in `dist/fonts/`.

This is the light-render canary's static half; the render-time half (a `.light` card render) belongs to the verification designer, but the hook is trivial once `.light` is an authored block.

---

## 5. Decision 4 — Tailwind v4 compile & content-scan scope

| Option | Pros | Cons |
|---|---|---|
| **@tailwindcss/cli (recommended)** | Purpose-built one-shot `input → flat output`; inlines all `@import`s (tw-animate-css, theme.css, fonts.css) so `[CSS_IMPORT_MISSING]` is structurally satisfied; honors `@source`/`source(none)`; same-dir `@import "./fonts.css"` means `url(./fonts/…)` survives untouched into `dist/styles.css`; no asset renaming | New devDep (`@tailwindcss/cli`) — no in-repo precedent, but none exists for ANY CSS-shipping package (FRAME §4: "this package sets that convention") |
| @tailwindcss/vite (a CSS-entry `vite build`) | One toolchain with Storybook/app; native asset emission | CSS-entry lib builds are fiddly (naming, `copyPublicDir`); hashed font names; a whole Vite config for one stylesheet |
| @tailwindcss/postcss | — | An extra runner + config file for nothing the CLI doesn't do |

**Recommendation:** `@tailwindcss/cli`, command `tailwindcss -i src/styles/index.css -o dist/styles.css` (unminified — §4c). devDeps: `"tailwindcss": "4.3.0"`, `"@tailwindcss/cli": "4.3.0"` — **pinned exact, and identical to the version the app's `@tailwindcss/vite` resolves** (today both `^4.1.13` → 4.3.0). Version skew between the package compile (feeds design-sync) and the app compile (feeds the product) is the one way "same artifact" quietly forks; pin both sides (root `overrides` if needed).

**@source scope (no in-repo precedent — set here):**
```css
@import "tailwindcss" source(none);   /* determinism: no cwd/gitignore-dependent auto-scan */
@source "../";                        /* packages/studio-ui/src — relative to src/styles/index.css */
```
This single directive covers, by construction:
- all 46 component sources (`src/components/ui/*.tsx`, `src/ui/components/**`, forms, panels — wherever Designer 1's tree puts them under `src/`);
- **all story files** (stories relocate into the package per LEDGER §6 client demands; co-located under `src/` they are inside the scan — if Designer 5 homes them outside `src/`, add `@source "../../stories";` — the directive list is the contract, not the layout);
- **`sonner.tsx` arbitrary variants** (`group-[.toaster]:bg-popover` … sonner.tsx:77-80) — LEDGER adjudication 9's named hazard — and GameConsole's container-query variant `@max-3xl:hidden` (GameConsole.tsx:271);
- moving story fixtures (`mockWidgetProps.tsx` uses `text-data` — grep-verified).

If the package Storybook's `.storybook/preview.tsx` carries its own utility classes (Q5), add `@source "../../.storybook";` — same mechanism, one line.

---

## 6. Decision 5 — fonts

**Today:** the app imports six `@fontsource/{inter,jetbrains-mono}` CSS files at both JS entries (`src/main.tsx:1-7`, `.storybook/preview.tsx:4-9`); Vite inlines the `@font-face` rules into the compiled CSS and emits the woff2s as `dist/assets/*` with absolute `/assets/` URLs; `build-inputs.sh:71` rewrites `url(/assets/` → `url(./` so `extractFonts` can resolve them. The converter then copies the woff2s to the upload's `fonts/` dir and rewrites rules to `./fonts/` (css.mjs:104-125).

**Designed (one owner: the package):**
- `src/styles/fonts.css` — **authored** `@font-face` rules, `url("./fonts/<file>.woff2")`, covering exactly the faces the app ships today: Inter 400/500/600/700 + JetBrains Mono 400/500, all subsets `@fontsource` declares (transcribed ONCE from the `@fontsource` CSS at authoring time — a one-time authoring act, committed as source; NOT a build-time rewrite).
- `dependencies`: `"@fontsource/inter": "5.1.1"`, `"@fontsource/jetbrains-mono": "5.1.1"` (pinned exact — filenames are the contract).
- `scripts/build-assets.mjs` — declarative, fail-loud: copies `src/styles/theme.css` + `src/styles/fonts.css` **verbatim** to `dist/`; copies each woff2 named by an explicit manifest (or by parsing fonts.css's own `url()` list) from the resolved `@fontsource` packages into `dist/fonts/`; **errors if any `url()` in fonts.css has no file on disk** (an @fontsource bump that renames files breaks the build, not the upload).
- *Lens defense:* this script transforms nothing — it materializes declared static inputs at declared paths and asserts their existence. The retired transform (regex over compiled CSS) is replaced by URLs that are simply *correct at authoring time*.

Why the URLs survive both consumers:
- **design-sync:** `cssEntry = dist/styles.css` contains the inlined `@font-face` with `url(./fonts/…)`; `extractFonts` resolves against `dirname(cssEntry)` = `dist/`, finds `dist/fonts/*.woff2` (inside PKG_DIR — containment ✓), copies to the upload `fonts/` dir, rewrites rules — identical to today's mechanics minus the sed step.
- **the app:** imports `@swooper/studio-ui/fonts.css` (→ `dist/fonts.css`); Vite resolves `url(./fonts/…)` relative to that file through the workspace symlink, emits the woff2s into the app build, and rewrites URLs — standard Vite CSS asset handling, no special cases. `src/main.tsx:1-7` and the app preview drop the six `@fontsource` imports and the app drops the two `@fontsource` deps (otherwise fonts have two owners and every `@font-face` ships twice).

Alternative considered: keep `@fontsource` imports app-side and ship fonts only for design-sync — rejected: two owners of the same faces, and the package stylesheet would be incomplete as a standalone artifact.

---

## 7. Decision 6 — dist layout + exports map (for Designer 1)

```
packages/studio-ui/dist/
  index.js            # tsup ESM bundle (deps external)
  index.js.map
  index.d.ts          # tsc-emitted barrel declaration (the `types` entry)
  **/*.d.ts(.map)     # tsc declaration tree mirroring src/
  styles.css          # compiled flat stylesheet (design-sync cssEntry)
  theme.css           # verbatim copy of src/styles/theme.css (Tailwind-v4 consumers)
  fonts.css           # verbatim copy of src/styles/fonts.css
  fonts/*.woff2       # copied @fontsource binaries
```

`package.json` (build-relevant fields; name/tags/publishing = **Q2 RESERVED**):
```json
{
  "name": "@swooper/studio-ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": ["**/*.css"],
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["src", "dist"],
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/styles.css",
    "./theme.css": "./dist/theme.css",
    "./fonts.css": "./dist/fonts.css",
    "./fonts/*": "./dist/fonts/*",
    "./package.json": "./package.json"
  },
  "engines": { "node": "22.22.0" }
}
```
- Top-level `module` + `types` are load-bearing for the converter (`resolveDistEntry` reads `module` first — bundle.mjs:24-35; `findTypesRoot`/`exportedNames` read `types` — dts.mjs:10-24, 270-283). `exports` shape mirrors `mapgen-viz`/`mapgen-core` house style.
- `files: ["src","dist"]` (house style) keeps sources available for `@source` fallbacks and declarationMaps.
- `dependencies` (pinned — kills the `"latest"` defect, WORKSTREAM §5b): every Radix package used by the primitives, `sonner`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@rjsf/core` + `@rjsf/utils` (deep-subpath CSP pin documented per LEDGER §7), `tw-animate-css` (**real dependency** — adjudication 9; the app resolves it through `theme.css`'s `@import`), `@fontsource/inter`, `@fontsource/jetbrains-mono`. `peerDependencies`: `react` / `react-dom` `^19` (+ devDeps for the build) — first peer-dep in the workspace, flagged under Q2 (WORKSTREAM Q2 note). Exact dependency policy beyond the build's needs is Designer 1/3 territory.

---

## 8. Decision 7 — app-side consumption

`apps/mapgen-studio/src/index.css` becomes, in full:
```css
/* MapGen Studio app stylesheet. The design system (tokens, palettes, globals,
   component utilities) is owned by @swooper/studio-ui; this file only wires
   the app's own Tailwind compile to it. */
@import "tailwindcss";
@import "@swooper/studio-ui/theme.css";
@import "@swooper/studio-ui/fonts.css";

/* Generate utilities used by package components (class strings survive in the
   dist bundle verbatim). Auto-detection skips node_modules; this is explicit. */
@source "../node_modules/@swooper/studio-ui/dist";
```
- The app **must keep its own Tailwind compile** (not just import `styles.css`): app-side files outside the moving surface use theme-dependent utilities (`text-data` in `src/app/StudioShell.tsx`, `src/app/CanvasStage.tsx` — grep-verified), so the app compile needs the `@theme inline` mapping → it imports the package's **theme source**, not the compiled artifact. Importing `styles.css` *as well* would double every token block and utility — rejected.
- The alternative to the `@source`-into-node_modules line is importing the compiled `styles.css` for component utilities — rejected above; if the symlinked `@source` path misbehaves (bun workspace symlink), the fallback is the workspace-relative real path (`@source "../../../packages/studio-ui/dist";`) — same semantics, uglier coupling. Verify at implementation; pnpm-style symlinked `@source` is the ecosystem-standard pattern.
- `src/main.tsx` drops the six `@fontsource` imports (§6). The app Storybook entry does the same or retires with the topology move (Q5).

**The theme-preference flip stays app-side — verified, with one mandatory fix:**
- `StudioProviders.tsx:28-32` already writes **both** `.light`/`.dark` explicitly (comment says it matches the design-sync convention) — unchanged, fully compatible with dark-default CSS.
- `index.html:37-61` pre-paint script: dark branch adds `.dark`; **the light branch only appends a hex flash-guard override and never adds `.light`** (index.html:48-57). Under light-default CSS that was fine (absence = light); under the package's dark-default CSS a light-preference user would first-paint DARK until the StudioProviders effect runs. **Required companion change:** the light branch additionally runs `document.documentElement.classList.add("light")`. One line, app-owned, consistent with the documented contract ("host writes .dark or .light; absence = dark"). The hardcoded hex flash-guard copies stay app-owned manual-sync, as today (index.html:12-20).
- Same-class-convention consequence for every non-app surface: the **package Storybook decorator must write both classes** (today's app decorator only toggles `.dark`, `.storybook/preview.tsx:53` — "light = absence" no longer resolves light). Flagged to Designer 5 (Q5). `useResolvedTheme` needs no change — its `color-scheme` fallback reads dark for a classless root, which is now also the CSS truth (useResolvedTheme.ts; ground/theme-token.md §3).

---

## 9. Decision 8 — what design-sync consumes post-move

`apps/mapgen-studio/.design-sync/config.json` (or wherever Q6/Q8 homes it — all values below are PKG_DIR-relative and location-agnostic):

| Key | Today | Post-move |
|---|---|---|
| `pkg` | `"mapgen-studio"` | `"@swooper/studio-ui"` (Q2 name) — with `entry` dropped, PKG_DIR resolves via `node_modules/@swooper/studio-ui` (workspace symlink; realpath-consistent containment — `package-build.mjs:291-309`) |
| `entry` | `.design-sync/ds-entry.tsx` | **deleted** — `resolveDistEntry` reads `module`/`exports['.'].import` → `dist/index.js` (bundle.mjs:24-35). The barrel exports all 46 + `TooltipProvider`, so the provider export gate passes (`package-build.mjs:643-645`). `ds-entry.tsx` retires (LEDGER kernel: delete) |
| `cssEntry` | `dist/assets/_ds-compiled.css` | `"dist/styles.css"` — the real compiled artifact, inside PKG_DIR ✓ |
| `buildCmd` | `bash .design-sync/build-inputs.sh` | `"bun nx run @swooper/studio-ui:build"` (declarative; no script executes it — `ground/converter.md` §0; README/NOTES runbooks update with it) |
| `libOverrides` + `.design-sync/overrides/source-storybook.mjs` | synthEntry fork | **both deleted** — `types` barrel makes `exportedNames` non-empty (the fork's own stated removal condition). Global-slice change → the priced one-time 46-card re-grade |
| `tsconfig` | `tsconfig.json` (app's, PKG_DIR-relative) | `"tsconfig.json"` resolves to the **package's** tsconfig once PKG_DIR moves — must carry whatever aliases the relocated stories use (Q5/Q6 own story import style; the key must be re-verified on repoint) |

**No hand transform remains between `dist/` and the converter input:** `dist/index.js` (real ESM entry), `dist/styles.css` (dark-default + `.light`, flat, fonts inlined with `./fonts/` URLs), `dist/**/*.d.ts` (strict tree + barrel), `dist/fonts/` — each is a first-class output of `bun nx run @swooper/studio-ui:build`. `build-inputs.sh`, `tsconfig.dts.json`, `ds-entry.tsx`, and the synthEntry fork are deleted, not bypassed (FRAME §2).

---

## 10. Falsifier walk + residual risks

Falsifier (diff designed compiled CSS vs today's `_ds-compiled.css`): **token values** — verbatim block moves, byte-identical values; **dark-default** — proven state-by-state in §4c; **`.light` behavior** — same block content, same equal-specificity/later-source mechanism build-inputs relies on (build-inputs.sh:92-95). No semantic divergence found. Execution-phase check: compile once, then diff computed styles of a probe element under all three root states against the old artifact (cheap script; belongs in the cutover verification).

Risks / conflicts for the frame-holder:

1. **Dark-default flips the app's classless state** — safe only with the `index.html` `.light` one-liner (§8) and a both-classes package-SB decorator (Q5). Miss either and light users get a dark first paint / light stories render dark. This is the one place my design *requires* changes outside the package.
2. **Utility superset → subset.** Today's uploaded stylesheet contains every class the whole app uses; the package compile contains only package+story usage. The 46 cards cannot lose anything (their classes originate in scanned sources), but the design agent's `explorations/` may use utilities that only existed via app code. Cutover check: extract both artifacts' class sets, diff, and grep the fetched explorations for casualties; remedy, if needed, is an authored `@source inline(…)` safelist — never a scan of app code from the package.
3. **Tailwind version skew** between the package CLI compile and the app's `@tailwindcss/vite` — pin both exact (§5) or the "same artifact" premise silently forks.
4. **E1 shapes d.ts quality** through the converter's resolver (§3) — types-only peer dep degrades affected card contracts to `unknown`; worth stating in the E1 options table.
5. **Q5 dependency:** the `@source "../"` design assumes stories live under package `src/` (co-located). A different story home costs one more `@source` line — the directive list is the contract to keep in sync.
6. **styleSha/bundleSha will flip** on cutover regardless — full 46-card render-check + whole-surface re-upload, already priced (`ground/converter.md` §4); upload remains gated on Matei's go-ahead.
