# DESIGN — studio-ui extraction (synthesized)

Status: **SYNTHESIZED + ADVERSARIALLY REVIEWED 2026-07-01, pending Matei checkpoint** on the
reserved decisions (§4). Three review lenses (design-sync contract/oracle, authority
consistency, stack executability) returned 2 blockers + 8 majors — ALL folded back in: the
per-branch staging rule (repoint every not-yet-moved consumer in the moving branch), the
AppFooter provider strip, cfg.entry KEPT (§2.6), the light-render canary + incrementality
answer + CI-runnable sync target (the three dropped FRAME DoD bullets), the `./types`
types-only resolution (§2.8), and the E1-B parity-fence task.
Produced by 4 parallel designers over the frozen [LEDGER.md](./LEDGER.md); full reports with
alternatives, evidence, and exact config contents live in [design/](./design/):
[identity-wiring](./design/identity-wiring.md) · [build-css](./design/build-css.md) ·
[storybook-sync](./design/storybook-sync.md) · [structure-rewire](./design/structure-rewire.md).
This file carries the resolved cross-axis decisions, the synthesizer's conflict adjudications
(§2), and the decision packet for Matei (§4). The OpenSpec change set is
`openspec/changes/studio-ui-extraction/`.

## 1. The design in one screen

- **Package**: `packages/studio-ui`, name **RESERVED** (Q2 — candidates §4.1; docs use
  `@civ7/studio-ui` as placeholder). `private: true`, publishable-shaped manifest, v0.1.0, ESM.
  Exports: `.` (value-clean barrel), `./types`, `./styles.css` (compiled flat), `./theme.css` +
  `./fonts.css` + `./fonts/*` (source entries the app consumes). React 19 as the workspace's
  first `peerDependencies` (dupe-React fence); every dep pinned from today's lockfile
  resolutions (cva 0.7.1 / clsx 2.1.1 / tailwind-merge 3.6.0 exact; tw-animate-css promoted to
  dependencies; @rjsf exact 6.2.5; @fontsource/inter + jetbrains-mono in package deps).
- **Build**: tsup (single entry, ESM, browser) + strict `tsc --emitDeclarationOnly` d.ts tree
  (NO TS7056 tolerance — structurally dead per LEDGER row 44) + `@tailwindcss/cli` compile of
  the package stylesheet into `dist/styles.css` + declarative woff2 copy script that fails on
  missing font files. All three build-inputs.sh hand transforms die **by authoring, not
  relocation**; a theme-invariant vitest on the compiled output replaces `assert_theme_block`.
- **CSS**: ONE natively dark-default authored source (§2.1): `:root, .dark { dark tokens }` +
  `.light { light tokens }` (cascade-order proven equivalent to today's `_ds-compiled.css`),
  @theme inline block verbatim, tw-animate-css import, `.custom-scrollbar` + native
  select/input resets, authored `@font-face` with `url(./fonts/…)` correct at authoring time.
  Tailwind `@source` scan covers component sources + story files + sonner.tsx.
  **Mandatory app companion**: `index.html` pre-paint light branch adds `classList.add("light")`.
- **Storybook**: package-hosted `.storybook/`, stories co-located, preview = fonts + package
  CSS + `TooltipProvider(300)` wrapping `[Story, Toaster]` + theme decorator writing BOTH
  classes. App Storybook + storeReset/queryStub deleted. Stories import the package **by bare
  name** (self-referential) — `storyImports.shim` deletes by the converter's own specifier rule;
  one tsconfig `paths` self-entry for typecheck.
- **Sync repoint**: `.design-sync/` + `.ds-sync/` git-mv into the package. Config-only,
  same-shape (`storybook`): pkg → package name, **entry KEPT at `dist/index.js`** (§2.6),
  cssEntry → `dist/styles.css`, buildCmd → package build; DELETE
  `libOverrides` + synthEntry fork + `storyImports` + `componentSrcMap` (prune with build-log
  watch item); overrides/titles/provider/docsMap carried verbatim (docsMap re-pointed
  PKG_DIR-relative). **Anchor survives as changed:[46]** (verified: only a shape change discards
  it). Full O(46) recapture/regrade priced; portal-4 via the manual path; `DS_CHROMIUM_PATH`
  set; NO upload without Matei's go-ahead.
- **Structure**: five ds-group dirs `src/components/{ui,composites,forms,panels,layout}` +
  `src/{lib,types,styles,storybook}`; zero file renames; forms five-module unit intact in one
  dir; story titles byte-frozen; full tree with every file named in
  [structure-rewire §3](./design/structure-rewire.md). Split-formatter module
  `panels/statusLabels.ts` (4 functions + collapsed `RunInGameRelation` union); re-homed types
  exact names in structure-rewire §3.4; value-clean barrel spec §3.5 (46 + TooltipProvider +
  cn/useResolvedTheme/LAYOUT/statusLabels/useConfigCollapse; `toast` absent).
- **App rewire**: ~36 verified file edits (19 ui/types repoints — LEDGER's 17 was an
  undercount, erratum §5) + 11 test relocations; app `index.css` collapses to tailwind +
  package theme/fonts imports + `@source` of package dist; app package.json sheds the moved
  deps (@radix ×12, cva/clsx/tailwind-merge, rjsf, typebox, tw-animate, lucide, @fontsource ×2).
- **Migration**: 8-branch Graphite stack, each CI-green: B1 scaffold → B2 foundation+primitives
  → B3 composites+layout → B4 forms → B5 panels+splits → B6 AppHeader (E4a) → B7 sync repoint +
  deletions (build-inputs.sh, tsconfig.dts.json, ds-entry.tsx, fork, app .storybook) + one full
  local resync oracle run → B8+ the E3 cleanup wave post-anchor.

## 2. Synthesizer adjudications (cross-designer conflicts)

1. **CSS source shape — single dark-default source wins** (build-css over structure-rewire's
   dual-artifact). Designer 4 kept a light-default `styles/index.css` + an authored
   `dark-default.css` inversion; that is **two owners of the palette** — the exact drift class
   build-inputs.sh had. Designer 2's single source (`:root, .dark { dark }` + `.light { light }`,
   zero duplication, cascade-order proof) is the one-owner shape; the app consumes the same
   theme source and both the app and the ds bundle read the identical token block. Tree amends:
   `src/styles/{index.css (compile entry: tailwindcss source(none) + @source + imports),
   theme.css (dark-default tokens + globals), fonts.css}`; `dist/styles.css` is the compiled
   flat artifact; cssEntry = `dist/styles.css` (Designer 4's `styles-dark-default.css` name is
   superseded).
2. **E1 is a bundle, not a lone type decision** (both designers converged on the coupling,
   opposite recommendations — packet in §4.2). Facts both sides now share: the Nx boundary rule
   counts type-only imports, so E1-A (types-only dep on `@civ7/studio-server`) is illegal under
   `kind:foundation` and forces a formal `kind:ui` taxonomy revision; E1-A also degrades the
   affected cards' `.d.ts` on claude.ai/design to `unknown` (the converter's ts-morph project
   cannot resolve external modules) — a direct product-quality cost to the thing this
   workstream serves; E1-B's reverse-drift risk (re-homing server-owned phase vocabularies) is
   mechanically fenced by an app-side type-level parity test that fails `mapgen-studio:check`
   on drift. **Synthesizer recommendation: E1-B + kind:foundation** (re-home into
   `src/types/server-contract.ts`; statusLabels types against the re-homed unions).
3. **Name candidates both live** (§4.1): Designer 1 recommends `@swooper/studio-ui` (practiced
   split: @swooper/* = mapgen domain), Designer 4 recommends `@civ7/studio-ui` (pairs with
   `@civ7/studio-server`; studio chrome is product tooling, not mapgen domain). Reserved to
   Matei; docs use `@civ7/studio-ui` as the running placeholder.
4. **Fonts resolved**: Designer 1's open manifest line closes per Designer 2 — package owns
   `@fontsource/inter` + `@fontsource/jetbrains-mono` (pinned), authored `@font-face`, woff2
   copy into `dist/fonts/`; the app drops its six `@fontsource` JS imports and both deps.
5. **AppFooter is non-verbatim regardless of E2** — the seedMin/seedMax inject-prop is a
   binding LEDGER adjudication (not E2-gated); story args supply today's exact values so
   rendered output is identical. E2 only decides whether MAP_SIZE/PLAYER_COUNT options data
   also becomes props (§4.3). LEDGER adjudication 6's second half also rides B3: AppFooter's
   inline `TooltipProvider` is STRIPPED (ambient policy; behavior-only at rest; hover verified
   manually).
6. **cfg.entry is KEPT at `dist/index.js`** (adjudicating Designer 3 over Designer 2's drop):
   without `entry`, PKG_DIR falls back to `join(NODE_MODULES, pkg)` (package-build.mjs:158-176),
   which is nonexistent for a workspace package under this repo's bun ISOLATED linker — a
   `[NO_DIST]` hard exit or mis-resolved cssEntry/docsMap/readmeHeader. Keeping `entry` makes
   PKG_DIR anchoring deterministic via the named-package.json walk-up, independent of
   node_modules topology (Designer 3's M5 analysis).
7. **The package .storybook alias is the UNCONDITIONAL source alias** (adjudicating the
   storybook-sync designer over DESIGN's earlier "dev-gated" wording): the oracle's compare is
   dist-rendered cards (converter bundles `dist/index.js` via resolveDistEntry) vs
   source-rendered sb-reference — a source↔dist build defect SURFACES as a compare mismatch,
   so the source alias is load-bearing, not a fidelity leak. Only the APP's vite source alias
   is dev-gated.
8. **`./types` is a types-only export condition** (`{ "types": "./dist/types/index.d.ts" }`,
   no `import` condition), resolving the single-entry-tsup vs runtime-subpath contradiction:
   the strict tsc tree emit produces the `.d.ts` for free, and every app repoint to
   `<pkg>/types` is `import type` (compiler-enforced by verbatimModuleSyntax). No second tsup
   entry, no runtime stub.
9. **Fonts source/dist seam**: `fonts.css` URLs are dist-layout-relative (woff2s copied only
   into `dist/fonts/`); the package Storybook preview therefore imports `theme.css` +
   direct `@fontsource` imports (not the fonts-including compile entry), documented at B1.

## 3. Verification design (ZERO_DRIFT hooks)

- **Per branch (B2–B6)**: package build green (strict d.ts), `nx run mapgen-studio:check`
  green, relocated tests green (typeboxRjsfValidator, sonnerTheme repointed, markup-pin tests),
  `build-storybook` smoke on the package.
- **B7 (the oracle run)**: buildCmd + sb-reference rebuild TOGETHER → `resync.mjs --remote`
  (DS_CHROMIUM_PATH=Google Chrome) → expect **changed:[46] / added:[] / removed:[]** with the
  anchor ok — any added/removed is a stop (missing barrel export or title change); full
  render-check tier is automatic (bundle+styling+components all moved); grade all 46 from
  fresh sheets; the 4 portal dialogs via the recorded PR-#1992 manual-verification path.
- **Light-render canary (FRAME §2 DoD)**: B7 additionally runs a forced-`.light` render pass
  over a small token-heavy story set (reference + preview both forced `.light`, compared) so
  the fidelity gate exercises BOTH theme modes — closing the dark-only-gate blindspot the
  frame names; the static theme-invariant test is the fast half, this is the render half.
- **CI `verify` target**: fast artifact-contract assertions only (46 exports + TooltipProvider
  present; dark `:root` AND `.light` blocks in styles.css; no `@civ7/studio-server` specifier
  in dist JS — unconditional, load-bearing under BOTH E1 branches; token-set parity against
  the committed token-contract fixture captured at B1 from today's `_ds-compiled.css`) — the
  on-real-artifacts replacement for build-inputs.sh's assert_theme_block. The Chromium
  render-check is NEVER wired into CI's five targets.
- **CI-runnable sync (FRAME §2 DoD)**: a custom-named Nx target on the package (e.g.
  `design-sync:check` — buildCmd + sb-reference rebuild + `resync.mjs` local verdict),
  deliberately OUTSIDE the CI five (weight rule), created at B7.
- **Incrementality (FRAME §2 DoD — recorded finding, not a build)**: the frame's "any shared
  CSS change de-incrementalizes all 46" is false for grading (grades/captures carry; styleSha
  partitions uploads only — Q10 reframe, WORKSTREAM §5). The real cost axis is the full-46
  chromium render-check + whole-surface upload on styleSha/bundleSha flips, and resync.mjs's
  render-check tiering (skip/sample/full) is already the designed path; the same-shape repoint
  preserves the anchor so post-extraction syncs stay incremental. Documented as the DoD
  answer; confirmed at the checkpoint.
- **E1-B drift fence**: an app-side type-level parity test (mutual-assignability between
  `@civ7/studio-server/contract` unions/shapes and the package's re-homed types) lands with
  the B5 splits and fails `mapgen-studio:check` on any server-side drift.
- **Cutover class-set check**: diff the old uploaded stylesheet's class set vs the package
  compile (superset→subset hazard); grep fetched `explorations/` for app-only utilities;
  remedy is an authored `@source inline()` safelist, never scanning app code.
- **Upload**: gated on Matei (project `531d158d…`, atomic path, deletes verbatim).

## 4. Decision packet — RESERVED to Matei

1. **Q2 — name + publishing**: (a) `@civ7/studio-ui` (pairs with studio-server; studio product
   family) vs (b) `@swooper/studio-ui` (mapgen-domain reading; Designer 1's verified naming
   split) vs (c) `@swooper/mapgen-studio-ui` (maximally explicit). All at `packages/studio-ui`,
   private + publishable-shaped (house exemplars all private; GitHub-Packages publishing would
   force a scope rename later regardless). **Rec: (a).**
2. **E1 bundle — contract types × Nx tag**: (A) types-only dep on `@civ7/studio-server` +
   formal `kind:ui` taxonomy revision (zero drift risk; BUT permanent ui→control taxonomy row +
   cards' `.d.ts` degrade to `unknown` on claude.ai/design) vs (B) re-home structural types
   (`server-contract.ts`) + `kind:foundation` unchanged + app-side parity-test drift fence
   (clean direction; reverse-drift risk fenced). **Rec: (B).** Under E4a,
   `Civ7StudioSetupConfig` exits the public API entirely, shrinking E1 to three prop types +
   two phase unions.
3. **E2 — Civ7 options data**: (A) options.ts/defaults.ts data stays app-side, AppFooter/
   AppHeader take options via props mirroring today's shapes exactly (clean; render-identical;
   API churn) vs (B) ship the engine-id data in the package for v1 and lift in the E3 wave
   (max first-sync verbatimness; directive defect carried temporarily). **Rec: (A)** — the
   move re-keys everything anyway and mirrored shapes keep DOM identical.
4. **E3 — cleanup-wave batching**: verbatim-move-first, ONE designed cleanup wave post-anchor
   (B8+) for every oracle-gated visual cleanup (ErrorBanner text-data, AppBrand propification,
   positioning-as-chrome lifts, ExplorePanel native→Radix selects, TagSelectWidget cn flip,
   panels/forms manual-join normalization onto the extended cn, the `${id}__error` shared
   id-builder extraction, React 19 forwardRef sweep, GameConsole Popover rebuild). **Rec: as
   stated** (already the recommended shape in the ledger; confirm).
5. **E4 — AppHeader**: (a) approved redesign in B6 — `AppHeaderSetupState` view-model +
   intent callbacks (exact contract in structure-rewire §5); rendered output identical, API
   changes; vs (b) defer → 45-component v1, **and the design project loses the AppHeader card
   until it lands** (anchor-diff puts it in deletePaths; no keep-stale mechanism). **Rec: (a).**

## 5. Errata against the frozen LEDGER (recorded, not re-frozen)

- ui/types app-side importers: **19 files** by direct grep (coherence §2.2 said 17; the two
  `ui/constants` files were missed).
- `runInGameRequiresProcessRestart` must move with the formatters (dep of
  `runInGamePrimaryActionLabel`) and stay barrel-exported — it has an app consumer
  (StudioShell.tsx:14); the ledger's split table listed only the three formatters.
- The coherence §3 ownership table has **24 rows**, not the "25" LEDGER §4 states (mechanical
  count); the walk itself is complete.
- `storeReset`/`queryStub`: the synthesis takes the **retire** branch of coherence §2.12
  ("or retire with the old preview") rather than LEDGER §3.12's literal "stay app-side" — the
  app has zero stories post-move, so keeping them would preserve dead code.

## 6. Open coordination seams (watched during execution)

- Dev HMR: the APP's vite source alias is dev-gated (the app's production build + the
  converter's bundle side always see real dist); the package .storybook's source alias is
  unconditional BY DESIGN (§2.7 — the oracle compares dist-rendered cards against the
  source-rendered reference, so source↔dist divergence surfaces as a mismatch).
- Tailwind version skew: pin `tailwindcss` + `@tailwindcss/cli` + app's `@tailwindcss/vite` to
  the same exact version (4.3.0).
- `globalName` stays `MapGenStudio` (project explorations were authored against it).
- The vendored `.ds-sync` carries the un-upstreamed `--tw-*` emit patch — re-verify after any
  skill re-stage (existing watch item; moves with the dir).
- `componentSrcMap` prune safety valve: watch the "(grouped N subcomponents…)" build-log line
  on the first converter run; re-pin per-name if it fires.
- sonner appears in BOTH manifests by design (package Toaster, app useToast) — same 2.0.7 pin.
