# Design report — Designer 3: Storybook topology & design-sync repoint (Q5 + Q6)

**Lens:** Storybook is the fidelity oracle; stories are co-located with components and move together. The sync repoint is config-only, same-shape (`storybook`), and the anchor SURVIVES as `changed:[46]` — never a shape flip, never a fork of `lib/emit.mjs`/`lib/bundle.mjs`.

**Ground truth used** (cited as file:line throughout; repo paths relative to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction/apps/mapgen-studio` unless absolute):
- LEDGER.md (frozen), esp. adjudications §3 items 11–12 and client demands §6; ledger/coherence.md §2.11–2.12, §3.
- `.storybook/main.ts` + `.storybook/preview.tsx` (in full), `.design-sync/config.json` (in full), `.design-sync/overrides/source-storybook.mjs` (in full), `.design-sync/NOTES.md` (in full, bottom-up).
- The bundled storybook sub-skill (`/private/tmp/claude-501/bundled-skills/2.1.197/490ac14382e1a2b8e98edcb63e9bd8d3/design-sync/storybook/SKILL.md`, in full).
- Vendored converter (committed at `.ds-sync/`, verified with `git ls-files`): `package-build.mjs`, `lib/{common,source-kit,source-storybook,story-imports,sync-hashes,remote-diff}.mjs`, `resync.mjs`.
- Ground reports: `scratchpad/ground/storybook-oracle.md`, `scratchpad/ground/sync-surface.md`.

**Package-name placeholder:** `@civ7/studio-ui` is used throughout as a stand-in. The real name is **RESERVED to Matei (Q2)**; every occurrence below is a single search-and-replace. Package dir placeholder: `packages/studio-ui/`.

---

## 0. Load-bearing converter mechanics (verified in code — the design rests on these)

| # | Fact | Evidence |
|---|---|---|
| M1 | The anchor is discarded ONLY on a `shape` change (`shape_changed`). `pkg`, `globalName`, paths, story moves — none invalidate the anchor; they surface as per-component sourceKey mismatches → `changed:[...]`. | `.ds-sync/lib/remote-diff.mjs:97-100` |
| M2 | Grade contract (sourceKey) = global slice (`provider` + `storyImports` + `extraEntries` + **fork file bytes**) + per-component slice (overrides minus cardMode/primaryStory; titleMap-into-name) + story-file **content** hash (`srcSha`) + story set + owned-preview bytes. Deleting the fork or editing `storyImports` re-keys **all 46** in one shot. | `.ds-sync/lib/sync-hashes.mjs:137-152` (configSlicesFor), `:185-200` (sourceKeyFor); `.ds-sync/lib/source-storybook.mjs:96-100` (srcSha = content of all story files, path-independent) |
| M3 | Under `shape:"storybook"`, component identity + grouping come from **story titles** (`titleParts(e.title, titleMap, exportedSet)`); the surface is then filtered to **public exports** (`exportedNames(PKG_DIR, pkgJson)`). A real `exports`+`types` package makes `exportedSet` non-empty → the `synthEntry` fork's reason-for-being disappears (its own removal condition, `source-storybook.mjs:26-28`). | `.ds-sync/lib/source-storybook.mjs:177`; `.ds-sync/package-build.mjs:242-244, 695-702` |
| M4 | `componentSrcMap` under storybook shape: **values are never resolved** (the enrichment that reads them, `source-kit.mjs resolvePackage:114-118`, only runs for `shape:"package"`); keys are used solely to exempt names from the subcomponent partition (`package-build.mjs:722-727`). That partition triggers only for real compound members (`X.Sub` statics / namespace exports, `dts.mjs:41-66, 304-345`) — never for flat shadcn-style consts. Config validation is strict on key NAMES only (`common.mjs:184-196`); removing the whole key is legal. | cited inline |
| M5 | Path resolution split: `entry`, `storybookConfigDir`, `storybookStatic` are **cwd-relative** (`package-build.mjs:104-110, 152`); `cssEntry`, `tsconfig`, `docsMap` values, `readmeHeader` are **PKG_DIR-relative** (`cfgPath`, `package-build.mjs:298-310`; docsMap routed at `:747`); `cssEntry` is additionally bounded to PKG_DIR (upload-verbatim exfiltration guard, `:282-284`). `.design-sync/` itself resolves from **cwd** (`resolve('.design-sync')`, `package-build.mjs:795-797`, `sync-hashes.mjs:185`). PKG_DIR = walk-up from `entry` to the nearest **named** package.json (`package-build.mjs:158-175`); without `entry`, PKG_DIR = `join(NODE_MODULES, pkg)` (`:176`). |
| M6 | Story-import policy for preview compiles: a **bare specifier matching the package name** shims to `window.<GLOBAL>` by rule, before any resolution (`story-imports.mjs:129-171` `pkgRx` + dsShim); everything else resolves and shims only when it lands on a single-exported-component module (`exportedComponentFor`, `:101-108`) or the package `src/index.*` barrel (`:237-240`). Barrel-dir and multi-component-file imports otherwise **bundle a second copy from source** — the exact failure `storyImports.shim` exists to patch (NOTES.md:107-114). | cited inline |
| M7 | `buildCmd` is declarative — no converter script executes it; the operator/driver-runbook runs it (grep-verified; `sync-surface.md` §2, WORKSTREAM §5a.4). `resync.mjs` chains build → remote-diff → validate → scoped capture and emits one verdict (`resync.mjs:2-5, 27-35`). |
| M8 | `.ds-sync/` is **committed-vendored** in this repo (git ls-files confirms; NOTES' "ephemeral" claim is stale — WORKSTREAM §5a.6). It carries one in-place local patch (`--tw-*` README classifier, NOTES.md:47) that must survive the move. `emit.mjs`/`bundle.mjs` are app-contract surface — never forked (skill §5). |

---

## 1. Storybook home (Q5)

### Alternatives

| Option | Description | For | Against |
|---|---|---|---|
| **A. Package-hosted `.storybook/` (RECOMMENDED)** | `packages/studio-ui/.storybook/{main.ts,preview.tsx}`; stories co-located in package `src/`; SB devDeps on the package; Nx `storybook`/`build-storybook` targets on the package project | Stories and components move together (the lens); the oracle is self-contained with the artifact it verifies; `storybookConfigDir:".storybook"` keeps its exact config value (cwd-relative, M5); index.json `importPath`s stay package-local (`resolveStorySources` bases = `dirname(sbDir)`, `source-storybook.mjs:81-86`); the sync's Nx CI target lands on the **package** project — fully sidestepping the `apps/mapgen-studio/project.json` habitat-lane collision (FRAME §8) | The package carries SB devDeps (storybook 9.1.20, @storybook/react-vite, @storybook/addon-docs, @tailwindcss/vite + fonts) — normal for a component library |
| B. App-hosted `.storybook` pointing into the package | app keeps `.storybook/`, glob reaches `../../packages/studio-ui/src/**/*.stories.*` | No devDep move | Violates co-location; the app owns the oracle for a surface it no longer owns; `viteFinal` must alias the package name across workspaces; the sync's cwd/PKG_DIR anchoring splits across two directories (`.design-sync` cwd-resolved in the app, cssEntry PKG_DIR-bounded in the package — M5 makes this actively broken for `readmeHeader`/`docsMap`); app keeps the project.json collision |
| C. Repo-root Storybook | one root `.storybook` for everything | none today (no other storied surface) | Same anchoring problems as B; invents a convention the repo doesn't have |

**Recommendation: A.** The app's `.storybook/` and `src/storybook/{storeReset.ts,queryStub.ts}` are **deleted** with the move — after extraction the app has zero story files (all 46 move; the four deliberately-unstoried hosts stay unstoried, `src/storybook/EXCLUSIONS.md:12-15`), so an app Storybook would be an empty shell. This satisfies coherence §2.12 ("storeReset + queryStub stay app-side **(or retire with the old preview)**") via the retire branch — one owner at the end (FRAME §6). `EXCLUSIONS.md`'s content (why StudioShell/StudioProviders/DeckCanvas/CanvasStage are unstoried) moves into the package Storybook docs or the package README appendix — it documents the oracle's boundary.

App `package.json` cleanups that ride along: drop `storybook`/`build-storybook` scripts + Nx targets (app package.json:94-110,126-127 per `storybook-oracle.md` §5) and the SB devDeps.

### Exact `packages/studio-ui/.storybook/main.ts`

```ts
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Studio UI component workbench — the design-sync fidelity oracle.
 *
 * Stories import the package by its published name (the public API is the
 * story contract). The exact-match alias below points that name at the source
 * barrel so the workbench renders and HMRs source directly and never depends
 * on a prebuilt dist. The converter side is alias-independent: bare package
 * specifiers shim to window.<Global> by rule (lib/story-imports.mjs).
 *
 * Storybook 9 dissolved addon-essentials; @storybook/addon-docs is the one
 * addon installed + registered explicitly for autodocs.
 */
const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.stories.@(tsx|jsx)"],
  addons: ["@storybook/addon-docs"],
  core: { disableTelemetry: true },
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    const selfAlias = {
      // Exact match only — subpath imports (none exist today) must not be
      // rewritten under src/index.ts.
      find: /^@civ7\/studio-ui$/, // RESERVED Q2 — the published package name
      replacement: fileURLToPath(new URL("../src/index.ts", import.meta.url)),
    };
    const existingAlias = viteConfig.resolve.alias;
    viteConfig.resolve.alias = Array.isArray(existingAlias)
      ? [...existingAlias, selfAlias]
      : [
          ...Object.entries((existingAlias as Record<string, string> | undefined) ?? {}).map(
            ([find, replacement]) => ({ find, replacement })
          ),
          selfAlias,
        ];
    // Tailwind v4 is Vite-wired (no PostCSS); without this plugin the package
    // CSS source never compiles and every story renders unstyled.
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    return viteConfig;
  },
};

export default config;
```

What was deliberately **dropped** from the app `main.ts` and why:
- `"@"` alias (app main.ts:33) — retired by the import-specifier strategy (§2).
- `child_process` shim alias (app main.ts:34) — not load-bearing for the story graph: no storied component value-imports deck.gl/loaders.gl (`storybook-oracle.md` §5, grep-verified there).
- dev-only `@swooper/mapgen-viz` source alias (app main.ts:35-41) — same: riverLakeInspector's mapgen-viz import is type-only and that module stays app-side; post-re-home the stories import those types from the package (§3).

### Exact `packages/studio-ui/.storybook/preview.tsx`

Per LEDGER adjudication 12, the package preview provides **TooltipProvider(delayDuration 300) + Toaster only**. Confirmed safe by the settled ledger: zero storied components read stores or mount queries (WORKSTREAM Q5: queryStub "needed by ZERO stories", storeReset's invariant "vacuous for the 46"; `storybook-oracle.md` §2 rows 4–5). The theme toolbar/decorator is not a provider — it is the oracle's theme switch (and the FRAME §2 light-canary lever) and carries **no app import** (`storybook-oracle.md` §2 row 6); it stays.

```tsx
// Self-hosted fonts + the token system — the package's own CSS source,
// compiled by the Tailwind v4 Vite plugin, at module load, before any story
// renders. Without the token CSS every story is unstyled; without the fonts
// the type renders in a fallback face.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "../src/styles.css"; // ← the package CSS source entry — Designer 2 owns the exact filename

import type { Decorator, Preview } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Toaster, TooltipProvider } from "@civ7/studio-ui"; // RESERVED Q2

/**
 * The package's ambient context, and nothing else (LEDGER adjudication 12):
 * TooltipProvider is mandatory — tooltip-using components render silently
 * blank with no console error without it. Toaster is the sink for the Toaster
 * story's toast.*() calls. No QueryClient, no store reset: every storied
 * component is props-driven (classification ledger, frozen 2026-07-01).
 */
function StoryProviders({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}

/**
 * Theme = a class on <html>, owned by the toolbar global. Both classes are
 * written explicitly so the decorator is correct under either authoring
 * convention (light-default `:root`+`.dark` or dark-default `:root`+`.light`
 * — the package CSS owns that decision); useResolvedTheme and the Toaster
 * re-theme off the DOM either way.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "dark";
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme !== "light");
    document.documentElement.classList.toggle("light", theme === "light");
  }
  return (
    <StoryProviders>
      <Story />
    </StoryProviders>
  );
};

const preview: Preview = {
  // Every story is autodoc-eligible — the story tree doubles as living docs.
  tags: ["autodocs"],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // Dark-first by studio convention.
  initialGlobals: { theme: "dark" },
  globalTypes: {
    theme: {
      description: "Studio theme (class on <html>)",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "dark", title: "Dark", icon: "circle" },
          { value: "light", title: "Light", icon: "circlehollow" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
```

Diff vs the app preview (app preview.tsx:13-17, 30-40, 90-92): `QueryClientProvider` + `createStoryQueryClient` gone, `resetStudioStores` `beforeEach` gone, component imports come from the package's public name instead of `../src/components/ui`, CSS comes from the package source entry, and the decorator writes **both** theme classes (matches StudioProviders' both-classes behavior; keeps the oracle correct if Designer 2 flips the authoring convention to dark-default). Rendered-pixel impact of the drops: none — a context provider with no consumer and a no-op `beforeEach` produce no DOM (ledger-settled; verify via the O(46) recapture anyway, which this move triggers regardless).

---

## 2. Story import-specifier strategy

The one-time window: the extraction re-keys all 46 grades **no matter what** — deleting the fork and touching `storyImports` changes the global config slice that is hashed into every component's sourceKey (M2). Specifier rewrites are therefore free *now* and never again.

### Alternatives

| Option | Mechanics | For | Against |
|---|---|---|---|
| A. Recreate `@` inside the package | package tsconfig `paths {"@/*": ["./src/*"]}` + SB alias + `cfg.tsconfig` feeding the converter's paths plugin (`package-build.mjs:811`) | Story bytes unchanged IF the package tree mirrors the app tree | The tree will NOT mirror the app (`src/features/...`, `src/ui/components/...` are app-history accidents the clean-package directive is retiring) — so paths get rewritten anyway; keeps three alias systems alive (tsconfig, SB vite, converter); `@` inside a published package is a private convention leaking into the artifact's story corpus |
| B. Package-relative specifiers (`./button`, `../rjsfWidgets`) | co-located stories import siblings relatively; converter rule-2 auto-shims single-component modules by export name (M6) | Zero alias machinery; the most common OSS component-library pattern; SB needs no self-alias | Multi-component files (`rjsfWidgets.tsx` ×7, `rjsfTemplates.tsx` ×3, `PresetDialogs.tsx` ×3) and any barrel import do NOT auto-shim (M6) → `storyImports.shim` survives with new package-path patterns — a config surface that must track every internal reshuffle; stories don't exercise the public API; every future internal file move churns story bytes → re-keys grades again |
| **C. Self-referential bare package imports (RECOMMENDED)** | `import { AppFooter } from "@civ7/studio-ui"` in every story; fixtures imported relatively; SB `main.ts` exact-match alias → `src/index.ts` (§1) | **`storyImports` deletes entirely** — bare package specifiers shim by specifier match before any resolution (M6), the most deterministic path in the converter; stories exercise the exact public barrel a consumer gets (a story that fails to compile IS a barrel-coverage gap — enforces LEDGER adjudication 8's "barrel covers all 46"); story bytes never mention internal paths → future internal refactors don't touch `srcSha` → grades carry forward forever after this one re-key; matches the skill's own model ("real JSX importing from '{PKG}'", skill §4c prompt) | Self-name resolution must exist in 3 toolchains: SB vite (solved by the §1 exact alias — source, HMR, no build-ordering), package typecheck (one tsconfig `paths` entry `"@civ7/studio-ui": ["./src/index.ts"]` — Designer 4's tsconfig; standard practice), converter esbuild (no resolution at all — shimmed by specifier). Slightly unusual to see a package import itself in-tree |

**Recommendation: C**, with these rules:

1. Every story's component/type import comes from the bare package name. Type-only imports use `import type` (already the corpus convention — all six type-importing stories do, verified in §3) so the compiled preview carries no dead specifier either way; even a kept one shims harmlessly.
2. Fixture imports stay **relative** (`./mockWidgetProps`-style, §7) — fixtures are not public API and must never enter the barrel; relative fixture modules bundle into the preview exactly as they do today (they are not exported-component modules, so rule 2 leaves them bundled — M6).
3. Inside fixture files, component/type imports also use the bare package name (today `mockWidgetProps.tsx:3-8` imports `@/components/ui`, `@/features/configOverrides/rjsfTemplates`, `@/ui/components/fields` — all three were shim patterns; bare-name imports make the shim list unnecessary from the fixture side too, and at SB runtime the §1 alias maps them to the same source barrel instance the stories use — no dual-module-instance hazard).
4. **Story `title:` strings stay byte-verbatim** — `primitives/...` ×16, `composites/...` ×13, `forms/...` ×11, `panels/...` ×4, `layout/...` ×2 (`sync-surface.md` §1). Titles are the grouping + DS-pane identity authority (M3); an unchanged title set keeps every remote card path (`components/<group>/<Name>/...`) stable, which keeps `upload.deletePaths` clean.
5. No `titleMap` — with titles verbatim and all 46 names exported from the barrel, `titleParts` maps every title with zero config (M3).

---

## 3. The four story-side fixture-type chases (LEDGER adjudication 11) — exact new targets

Current imports read from the story files in full; targets assume the type re-homes the ledger binds (ui/types → package, coherence §3; riverLakeInspector narrow types → package, LEDGER row 22; StageView → package, row 20). The public types ride the same barrel as the components (type re-exports keep the barrel value-clean — adjudication 8 constrains **values**, not types).

| Story file (current path) | Current import (exact) | New import |
|---|---|---|
| `src/ui/components/AppFooter.stories.tsx:4` | `import type { RecipeSettings, WorldSettings } from "@/ui/types";` | `import type { RecipeSettings, WorldSettings } from "@civ7/studio-ui";` |
| `src/ui/components/RecipePanel.stories.tsx:3-4` | `import { RecipePanel, type RecipePanelProps } from "@/ui/components/RecipePanel";` + `import type { PipelineConfig, SelectOption } from "@/ui/types";` | `import { RecipePanel, type RecipePanelProps, } from "@civ7/studio-ui";` + `import type { PipelineConfig, SelectOption } from "@civ7/studio-ui";` (one merged import in practice) |
| `src/ui/components/WaterStatsSection.stories.tsx:3-8` | `import type { RiverLakeFloodplainInspectorSummary, RiverLakeInspectorLayerRef, RiverLakeInspectorMaskCategory, RiverLakeInspectorRow } from "@/features/viz/riverLakeInspector";` | `import type { RiverLakeFloodplainInspectorSummary, RiverLakeInspectorLayerRef, RiverLakeInspectorMaskCategory, RiverLakeInspectorRow } from "@civ7/studio-ui";` — these four names are exactly the "narrow structural summary/layer-ref types" the ledger re-homes (LEDGER row 22 "story types chase ×4"; coherence §3 riverLakeInspector row); the app module then imports them back from the package |
| `src/ui/components/AppHeader.stories.tsx:3` | `import type { Civ7StudioSetupConfig } from "@/features/civ7Setup/setupConfig";` | **Gated on E1 + E4 (RESERVED).** E1-re-home (or E4-A designed split): the AppHeader prop-contract type lands in the package → `import type { Civ7StudioSetupConfig } from "@civ7/studio-ui";` (possibly under a new name if the E4-A intent-callback redesign renames the prop shape — the story's args restructure with it, and AppHeader forfeits the `changed:[]` fidelity shortcut, as E4 already records). E1-peer: the type stays server-owned → `import type { Civ7StudioSetupConfig } from "@civ7/studio-server/contract";`-adjacent (wherever E1 pins it) — `import type` erases at preview-compile, so the converter is indifferent |

Fifth, adjacent (not a "type chase" but the same follow-the-move class): `src/features/recipeDag/PipelineStage.stories.tsx:3-4` — `import { PipelineStage, type PipelineStageProps } from "@/features/recipeDag/PipelineStage"` → bare package name; `import { recipeDagFixture } from "@/storybook/recipeDagFixture"` → **relative** to the fixture's package home (§7). The fixture itself (`src/storybook/recipeDagFixture.ts:1`) type-imports `RecipeDagResult` from `@civ7/studio-server/contract` — under E1-peer that line survives verbatim (types-only devDep of the package); under E1-re-home it becomes a package-internal type import. Either way `import type` erases at compile; `buildRecipeDagLayout` still executes the fixture at render (NOTES.md:51), so the fixture shape must keep satisfying whichever type E1 picks.

All six edited story files re-key and re-grade — subsumed by the full O(46) re-key (M2).

---

## 4. The exact `.design-sync/config.json` diff

Full target config (keys in today's order; `// ←` marks changes). Home: `packages/studio-ui/.design-sync/config.json` (§5).

```jsonc
{
  "pkg": "@civ7/studio-ui",                      // ← RESERVED Q2 — the real published name; feeds shim matching, README, prompt.md import examples
  "globalName": "MapGenStudio",                  //   KEEP — pins window.MapGenStudio; a pkg-derived global would churn the bundle namespace the project's explorations/ were authored against
  "projectId": "531d158d-a7f6-41cb-87a4-f0f8a5e521b0",  //   KEEP — sacred, pinned
  "shape": "storybook",                          //   KEEP — the anchor-survival condition (M1)
  "storybookStatic": ".design-sync/sb-reference", //   KEEP — cwd-relative; cwd = the package dir
  "storybookConfigDir": ".storybook",            //   KEEP — cwd-relative; now the package's .storybook (§1)
  "srcDir": "src",                               //   KEEP — package src/
  "tsconfig": "tsconfig.json",                   //   KEEP — now PKG_DIR-resolves to the package tsconfig (M5); feeds the preview-compile paths plugin (inert under bare-name imports, harmless)
  "entry": "dist/index.js",                      // ← was ".design-sync/ds-entry.tsx" — the REAL compiled ESM entry (Designer 2's dist filename); keeps PKG_DIR anchoring deterministic via the named-package.json walk-up (M5) independent of node_modules topology
  "cssEntry": "dist/index.css",                  // ← was "dist/assets/_ds-compiled.css" — the package's real built stylesheet (Designer 2's filename); PKG_DIR-bounded (M5). MUST be the dark-default `:root` + `.light` artifact with fonts url-referenced relative to it (LEDGER §6 client demands)
  "buildCmd": "bunx nx run studio-ui:build",     // ← was "bash .design-inputs.sh"… i.e. "bash .design-sync/build-inputs.sh" — declarative (M7); the Nx target form builds workspace deps first and IS the CI entrypoint FRAME §2 wants (project name per Q2)
  "readmeHeader": ".design-sync/conventions.md", //   KEEP — moves with .design-sync/ into the package; content revalidated (§6 step 7)
  //                                             // ← DELETE "libOverrides" — the fork retires (M3); also `git rm .design-sync/overrides/source-storybook.mjs` (fork bytes leave the grade slice → part of the one re-key)
  "provider": {                                  //   KEEP verbatim — decorator auto-bundling still trips on the CSS `@import "tailwindcss"` (NOTES.md:97-105) and cfg.provider is the skill's durable path anyway (skill §2.3: distill decorators into cfg.provider before upload); with provider set, decorator bundling is skipped entirely (package-build.mjs:369)
    "component": "TooltipProvider",
    "props": { "delayDuration": 300 }
  },
  //                                             // ← DELETE "storyImports" — bare package-name imports shim by specifier rule (M6); the three app-path patterns ("components/ui", "features/configOverrides", "ui/components/fields") have nothing left to match
  "overrides": { /* all 25 entries VERBATIM — Dialog 680x360 … SchemaConfigForm column (config.json:24-50) */ },
  "docsMap": { /* all 46 entries VERBATIM — values are PKG_DIR-relative ".design-sync/groups/*.md" paths (M5) and .design-sync/ moves wholesale, so the strings don't change */ },
  //                                             // ← DELETE "componentSrcMap" — see below
}
```

**`componentSrcMap`: prune (delete the key), don't re-point.** Verified basis (M4): under storybook shape the 46 path values are never read — the surface is titles ∩ public exports — and the keys' only effect is exempting names from the compound-subcomponent partition, which cannot fire for flat const exports (compounds require `X.Sub` statics or `export * as X` namespaces, `dts.mjs:304-345`; the package barrel exports flat consts). Re-pointing 46 dead paths would manufacture a hand-maintained manifest again — the exact artifact class this workstream deletes. Safety valve: on the first driver run, check the build log for `(grouped N subcomponents under M parents…)` (`package-build.mjs:733-736`) — expected absent; if any of the 46 ever appears there, re-add a one-line pin for that name only, with a NOTES.md bullet. Config validation cannot object: key-name strictness only (M4), and `componentSrcMap` is not in `REMOVED_CONFIG_KEYS`.

**What the diff deliberately does NOT touch:** `shape` (falsifier b), story titles / `titleMap` (falsifier a), the 25 card overrides, `provider`, `projectId`, `globalName`. No `lib/*.mjs` fork is added — one is deleted (falsifier c).

**Deleted files alongside the config edit:** `.design-sync/ds-entry.tsx` (LEDGER coherence §3: delete; the barrel is the export surface), `.design-sync/overrides/source-storybook.mjs` (+ its `libOverrides` entry), `.design-sync/build-inputs.sh`, `.design-sync/tsconfig.dts.json` (FRAME §2). `AUTHORING-BRIEF.md` and `BATCH5-FRAME.md` are package-shape-era history (`sync-surface.md` §4.4) — move them under `.design-sync/` with a first-line "historical — retired pipeline" marker, or archive to `docs/projects/studio-ui-extraction/`; never a runbook.

**Requirements this places on Designer 2 (build):** (i) `exports['.']` resolves to the compiled ESM entry + `types` to the generated `.d.ts` barrel under default conditions — this is what makes `exportedNames()` non-empty and retires the fork (M3); all 46 names + `TooltipProvider` must be value exports (`[PROVIDER_UNEXPORTED]` hard-fails the build otherwise, skill §5). (ii) The dist CSS is one flat file, dark-default `:root` + `.light`, `@font-face` with woff2 shipped at paths relative to it. (iii) The package's Tailwind content scan covers `src/**/*.stories.tsx` **and** `sonner.tsx` (story-scaffold utilities like the `Demo` wrappers' classes must exist in the uploaded `styles.css` — LEDGER adjudication 9; Tailwind v4 `@source` directives in the CSS source are the tool for this).

---

## 5. Where `.design-sync/` (and `.ds-sync/`) live post-move

| Option | Verdict |
|---|---|
| **Package root: `packages/studio-ui/.design-sync/` + `packages/studio-ui/.ds-sync/` (RECOMMENDED)** | The only mechanically coherent home. The converter resolves `.design-sync/` from **cwd** and `cssEntry`/`docsMap`/`readmeHeader` from **PKG_DIR** (M5); with config, entry, and artifacts all under the package, cwd = PKG_DIR = the package dir and every committed path value keeps working (`docsMap` strings byte-identical, `readmeHeader` unchanged, `storybookStatic` unchanged). "Config home = the package" is the sync's own recorded rule (NOTES.md:9-10). The sync serves the package's artifacts now — the metadata is part of the package's operational surface. |
| Stay in `apps/mapgen-studio/.design-sync/` | Breaks by construction: PKG_DIR follows `entry` to the package (M5), so `readmeHeader`/`docsMap` (PKG_DIR-relative) would resolve to `packages/studio-ui/.design-sync/...` — files that wouldn't exist there; `resolve('.design-sync')` (cwd) and PKG_DIR would disagree for every run. Also leaves sync metadata in an app that is no longer the synced artifact. |
| Repo root | Same split-anchor problem (cwd ≠ PKG_DIR), plus a convention the repo doesn't have. |

Move mechanics (all `git mv`, content edits only where §4 says):
- `git mv apps/mapgen-studio/.design-sync packages/studio-ui/.design-sync` — carries `config.json` (edited per §4), `NOTES.md` (append an extraction section: fork removed + why, componentSrcMap pruned + the subcomponent-log watch item, new runbook paths; NOTES stays append-only, read bottom-up), `conventions.md` (revalidated §6), `groups/` (docsMap targets, values unchanged), `overrides/` (now empty after the fork deletion — keep the dir or drop it; `[OVERRIDE_UNDECLARED]` only fires on files present).
- `git mv apps/mapgen-studio/.ds-sync packages/studio-ui/.ds-sync` — the converter is committed-vendored (M8) and moves as-is, **preserving the in-place `--tw-*` emit.mjs patch** (NOTES.md:47). Post-move, a skill-driven re-stage refresh (skill §7 step 1) overwrites it — re-apply or re-verify the patch after any re-stage (existing watch item, unchanged by this design). No fork of `emit.mjs`/`bundle.mjs` ever (falsifier c).
- `.gitignore` entries move to the package: `.design-sync/sb-reference/`, `.design-sync/learnings/`, `.design-sync/.cache/`, `.design-sync/node_modules`, `ds-bundle/` (skill §2.2 list). The fork-symlink entry becomes moot with zero forks.
- The pinned `projectId` travels **inside config.json** — the anchor itself lives in the remote project (`_ds_sync.json`), fetched fresh per re-sync; nothing about the move touches it (M1).
- Runbook cwd changes: all converter commands now run from `packages/studio-ui/`; `--node-modules` points wherever `react`/`react-dom` resolve for the package (verify at execution — the app's `./node_modules` precedent, NOTES.md:9, no longer applies; the walk-up `entry` anchoring keeps PKG_DIR correct regardless of which node_modules is passed, M5).
- The Nx `design-sync` target (FRAME §2 CI-runnable) lands on the **package** project — composes with nothing in the app; the `apps/mapgen-studio/project.json` habitat collision (FRAME §8) is out of the blast radius entirely.

---

## 6. The re-verify plan (first post-extraction sync)

Expected verdict shape: **`changed:[46]`** (every sourceKey moves — fork deleted + `storyImports` deleted from the global slice, story bytes edited; M2), `added:[]`, `removed:[]`, anchor `ok` (same shape, M1). Treat any `added`/`removed` entry as a **stop**: it means a title changed or a barrel export is missing (M3), not noise.

Order (skill §7 + NOTES.md:116-125, adjusted to the package home; cwd = `packages/studio-ui/`):

1. **Refresh staged scripts** (skill §7.1): re-copy `.ds-sync/` from the bundled skill *or* run the committed-vendored copy — if re-staged, re-apply/verify the `--tw-*` emit patch (M8). Fresh-clone extras: `.ds-sync` dep install + `DS_CHROMIUM_PATH`.
2. **Build the package + rebuild the reference together** — `buildCmd` (`bunx nx run studio-ui:build`) **and** `node_modules/.bin/storybook build -c .storybook -o .design-sync/sb-reference` move as a pair; `[REFERENCE_STALE?]` in the capture log = you forgot the reference (skill §7.1, §4 state rules). Check `sb-reference/iframe.html` exists and is >10KB (skill §2.2).
3. **Fetch the anchor**: `DesignSync(get_file, "_ds_sync.json")` → `.design-sync/.cache/remote-sync.json`.
4. **Run the driver**: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules <nm> --entry dist/index.js --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json` with `DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` (Homebrew `chromium` is a stale wrapper — NOTES.md:36). Bundle + styling + components all moved → the driver runs the **full** render-check tier automatically (skill §7.3); the 46-card chromium pass is the priced-in cost.
   - Watch the build log for: `source shape: storybook`, `components: 46`, **no** `(grouped … subcomponents …)` line (§4 componentSrcMap safety valve), no `[TITLE_UNMAPPED]`, no `[OVERRIDE_*]`, no `[PROVIDER_UNEXPORTED]`.
   - Known-warn triage: `[RENDER_BLANK]` on bare form controls is the recorded false positive (NOTES.md:127-131); any warn NOT in NOTES is new — investigate (resync.mjs doctrine).
5. **Grade the full 46 from fresh sheets** (`verification.pendingGrade` will list everything). Sampling rule applies (primary story image-judged; sibling-trusted for warning-free components); grade exhaustively for portals/overlays/provider-sensitive components. Fan out per skill §4c if wall-clock demands (>20 components → scoped batches of 5–8, ≤4 concurrent chromiums; learnings-fold gate between waves — an unfolded `.design-sync/learnings/` file fails the verdict, resync.mjs:33-35). The oracle bar: verbatim-moved components must read `match` — any drift beyond the portal-dialog class is stop-and-diagnose (FRAME §6), never re-grade-around.
6. **The four portal dialogs go through the manual-verification path** — `Dialog`, `PresetSaveDialog`, `PresetConfirmDialog`, `PresetErrorDialog` render open-state and portal out of `#storybook-root`, so their reference-side capture hard-fails (`sb-error: "no storybook root content"` — FRAME §3). **Never** chase them with `--force` (it also wipes all 46 fresh grades — skill §4 state rules). Instead, replicate the PR #1992 path: run the package Storybook live, eyeball each dialog story against the preview render (`ds-bundle/_screenshots/.../raw/*__ds.png` or `.review.html`), then write the grade with an explicit basis note, e.g. `{"verdict":"match","note":"manual-verified live SB vs preview render — portal capture limit (frame §3), same path as PR #1992"}`. No `cfg.overrides.<Name>.skip` — the stories stay in the surface.
7. **Conventions-header validation** (skill §7.5): validate `.design-sync/conventions.md` against the **package** artifacts — every named token/class/component must exist in `dist/index.css` + the components tree; also sweep it for app-era import examples (`mapgen-studio` as a specifier) that must become the Q2 package name. If it changed, rebuild via the driver — the prior verdict predates the header.
8. **Closing receipt**: final driver run must print `ok:true`, `verification.pendingGrade` empty, learnings folded; then `DesignSync(report_validate, …)` from `ds-bundle/.render-check.json` (skill §4d).
9. **Upload — RESERVED: no upload without Matei's explicit go-ahead** (FRAME §6; LEDGER §6). When granted: **atomic path** (anchored re-sync into the pinned, in-use project `531d158d…`): full writes list per skill §6; **deletes verbatim from `.sync-diff.json` `upload.deletePaths`** — never hand-derived, never `[]` when the diff lists paths. With titles verbatim, remote card paths are stable, so deletePaths should be near-empty; `explorations/` + `scraps/` are anchor-invisible and can never appear there (WORKSTREAM §3.6) — verify the plan's delete globs don't cover them anyway. `_ds_sync.json` is the absolute final write.
10. **Steps 1–8 run entirely locally during the execution phase** (WORKSTREAM §6 stage 5) — the local full-verify is the extraction's fidelity gate; step 9 is close-out only.

E4 interaction (surface to Matei with E4): if AppHeader is deferred (E4 option B), the first post-extraction build contains 45 components → the driver's diff will put AppHeader in `verification.removed` and its card in `upload.deletePaths` — i.e., **deferring AppHeader deletes its card from the design project** until it lands. There is no keep-stale mechanism (forward-sync only, repo is source of truth — NOTES.md:50 adjacency, BATCH5-FRAME doctrine). E4 option A keeps the 46-surface intact (with AppHeader re-graded on its redesigned story, no `changed:[]` shortcut — E4's own caveat).

---

## 7. Where the 46 stories + fixtures land (requirement statement to Designer 4)

Stated as requirements on his tree, not an assumed layout:

1. **Co-location**: each of the 46 `*.stories.tsx` sits beside its component file inside the package `src/`, wherever the component lands. One glob must reach them all: `../src/**/*.stories.@(tsx|jsx)` from `packages/studio-ui/.storybook/` (§1 main.ts). No story file may live outside package `src/`.
2. **Titles are frozen**: the 46 `title:` strings are the DS-pane identity and grouping authority (M3) — byte-verbatim, regardless of where files land. File RENAMES are tolerated by the sync (identity = title, fingerprint = content, M2) but keep them minimal for diff reviewability under E3's verbatim-move-first rule.
3. **Story-file content changes are exactly the import-specifier rewrites** (§2, §3) — nothing else in the corpus changes in the move commit (E3: cleanups are a separate wave).
4. **Fixtures**: `mockWidgetProps.tsx` and `recipeDagFixture.ts` move into a package-internal, **non-exported** module directory (my requirement is only: inside package `src/`, NOT re-exported from the public barrel, importable relatively from the forms/PipelineStage stories — e.g. a `src/storybook/` or `src/__fixtures__/` dir, his pick). They are part of the oracle corpus (coherence §2.12: they "move with the package Storybook") and of the compiled preview closure (story modules bundle them — M6), so they must stay plain TS/TSX with no app imports. `recipeDagFixture`'s `@civ7/studio-server/contract` type import follows E1 (§3).
5. **Tailwind reach**: stories (and `sonner.tsx`) must be inside the package CSS build's content scan (§4 requirement iii to Designer 2) AND inside the SB Vite root's auto-scan (automatic with stories under package `src/` and SB run from the package).
6. **Type surface**: the public types the stories chase (§3) — `RecipeSettings`, `WorldSettings`, `PipelineConfig`, `SelectOption`, the four `RiverLake*` names, `StageView`, plus every `<Name>Props` — must be re-exported (type-only) from the same barrel the components ship from, so a story never needs a deep path.
7. **Barrel completeness is story-enforced**: with §2's bare-name imports, any of the 46 missing from the barrel fails its story's compile in SB and drops the component `[TITLE_UNMAPPED]`-style from the sync surface (filtered against `exportedSet`, M3) — the first driver run's `components: 46` log line is the check.

---

## 8. Falsifier self-audit

| Falsifier | Verdict |
|---|---|
| (a) changes a story title | No — titles byte-verbatim (§2 rule 4, §7 req 2); no `titleMap` |
| (b) flips the anchor shape | No — `shape:"storybook"` untouched; anchor survives as `changed:[46]` (M1, M2) |
| (c) edits `lib/*.mjs` | No — one fork **deleted**, none added; `emit.mjs`/`bundle.mjs` untouched (the pre-existing vendored `--tw-*` patch is carried, not created, and flagged for upstreaming — M8) |
| (d) leaves a converter input manufactured by hand | No — `entry` = real tsup/vite dist, `cssEntry` = real build stylesheet, `.d.ts` = generated barrel, fonts = build outputs; `build-inputs.sh`, `tsconfig.dts.json`, `ds-entry.tsx`, the synthEntry fork all deleted (§4) |

Residual risks, named: (1) `componentSrcMap` prune rests on the compounds mechanics (M4) — mitigated by the subcomponent-log watch item (§6.4) with a one-line re-pin as the fix; (2) bare-name imports need the package tsconfig `paths` self-entry for typecheck (Designer 4) — if he rejects self-referential imports, Option B (relative + a 3-pattern `storyImports.shim` re-pointed to package paths) is the fallback and everything else in this report stands unchanged; (3) the E4-defer → card-deletion interaction (§6, end) needs to be in front of Matei when E4 is decided.
