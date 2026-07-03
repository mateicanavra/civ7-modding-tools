# Classification ledger — the 46 design-synced components (REVIEWED)

Status: **FROZEN 2026-07-01** — reviewed corpus per kickoff §4. Built by 4 parallel slice
builders (every component + story file read in full), adversarially verified by 4 independent
re-derivation passes (**all verified=true**, zero tier changes, zero missed runtime crossings),
cross-group adjudicated by a coherence judge. Contested adjudications (useConfigCollapse
ownership; PHASES-re-export severability) were additionally re-confirmed by direct grep before
freezing. Checkout: `wt-studio-ui-extraction` @ main tip `c4ebaf1e1`.

Evidence corpus (full per-component rows, import surfaces, cleanups, story notes):
[`ledger/build-*.md`](ledger/) (4 slices) · [`ledger/verify-*.md`](ledger/) (corrections) ·
[`ledger/coherence.md`](ledger/coherence.md) (adjudications, shared-kernel map, escalations).
**Read order for design work: this file → coherence.md → the build row you're touching →
its verify corrections.** Where a build row and this file disagree, THIS FILE (which carries
the verify/coherence supersessions) wins.

## 1. Verdict

| Tier | Count | Meaning |
|---|---|---|
| clean | **38** | moves as-is (react / external npm / intra-surface / tokens) |
| moderate | **6** | 1–4 crossings, each with a mechanical remedy |
| app-shaped | **2** | needs a designed split (AppHeader: prop-contract redesign; PipelineStage: directory split) |

Rubric consistency (judge-checked): runtime contract *reach* alone never set a tier; only
*entanglement needing a designed split* did. Identical patterns got identical grades across
groups (14 cn-primitives, 7 rjsf widgets, 2 dock twins, 2 status-formatter consumers,
2 directory-split-adjacent clean groups).

## 2. The 46 rows (post-correction)

Remedy legend: **mv** move-with · **rt** re-home-type · **ip** inject-prop · **sf** split-formatters
(extract pure label formatter type-only over the contract; delete dead PHASES re-export; app keeps
domain constructors) · **E#** gated on escalation. Full evidence: group's build file.

### primitives (16) — all clean · `ledger/build-primitives.md`

| # | Component | Source | Crossings → remedy | Notes |
|---|---|---|---|---|
| 1 | Button | components/ui/button.tsx | `@/lib/utils` cn (v) → mv | cva unpinned ("latest") |
| 2 | Checkbox | components/ui/checkbox.tsx | cn → mv | static-literal cn inline = byte-identical |
| 3 | Dialog | components/ui/dialog.tsx | cn → mv | tw-animate-css; portal story (single 680x360) |
| 4 | DropdownMenu | components/ui/dropdown-menu.tsx | cn → mv | tw-animate; portal (single 420x460) |
| 5 | Input | components/ui/input.tsx | cn → mv | |
| 6 | Label | components/ui/label.tsx | cn → mv | |
| 7 | Popover | components/ui/popover.tsx | cn → mv | tw-animate; portal (single 460x360) |
| 8 | ScrollArea | components/ui/scroll-area.tsx | cn → mv | `.custom-scrollbar` is comment-only here |
| 9 | Select | components/ui/select.tsx | cn → mv | tw-animate; portal (single 420x460) |
| 10 | Separator | components/ui/separator.tsx | cn → mv | column |
| 11 | Switch | components/ui/switch.tsx | cn → mv | |
| 12 | Tabs | components/ui/tabs.tsx | cn → mv | column |
| 13 | Textarea | components/ui/textarea.tsx | cn → mv | column |
| 14 | Tooltip | components/ui/tooltip.tsx | cn → mv | tw-animate; provider contract (absence = silent blank); single 400x240 |
| 15 | Toaster | components/ui/sonner.tsx | none | delete private `useThemeFromClass` → consume package `useResolvedTheme` (repoint sonnerTheme test); Tailwind must scan sonner.tsx (`group-[.toaster]:*`); single + primaryStory |
| 16 | FieldRow | ui/components/fields/FieldRow.tsx | none | React.FC style outlier; homed with forms templates |

### composites (13) — 9 clean, 3 moderate, 1 app-shaped · `ledger/build-composites.md`

| # | Component | Tier | Source | Crossings → remedy | Notes |
|---|---|---|---|---|---|
| 17 | AppBrand | clean | ui/components/AppBrand.tsx | none | placeholder content + hover-only a11y → E3 cleanup wave |
| 18 | AppFooter | moderate | ui/components/AppFooter.tsx | seedPolicy (v) → **ip** (SUPERSEDES build's "inline": 3 app hooks co-own the range) | self-provides TooltipProvider (strip per policy); options data → E2; positioning-as-chrome → E3; column |
| 19 | AppHeader | **app-shaped** | ui/components/AppHeader.tsx | setupConfig (v, 2-hop RUNTIME contract) → **ip** intent-callbacks; Civ7StudioSetupConfig (t) → E1 | cannot move verbatim → **E4**; domain precedence rules in-component; column |
| 20 | StageViewTabs | moderate | ui/components/StageViewTabs.tsx | viewStore StageView (t) → rt (store imports back) | barrel gap; positioning → E3; column |
| 21 | ViewControls | clean | ui/components/ViewControls.tsx | none | plain-cn consumer → unify (expected no-op, verify) |
| 22 | WaterStatsSection | moderate | ui/components/WaterStatsSection.tsx | riverLakeInspector 2 types (t) → rt narrow structural | story types chase ×4; label heuristics in UI → E3; slice(0,4) truncation |
| 23 | OptionSelect | clean | ui/components/OptionSelect.tsx | none | barrel gap; sentinel round-trip sound |
| 24 | DisclosureHeader | clean | ui/components/DisclosureHeader.tsx | none | plain-cn consumer → unify; documents the clobber hazard in-source; column |
| 25 | EmptyState | clean | ui/components/EmptyState.tsx | none | plain-cn; 2 direct-file importers to normalize (PipelineStage + CanvasStage); column |
| 26 | ErrorBanner | clean | app/ErrorBanner.tsx | none | zero imports; text-xs vs text-data → E3; positioning → E3 |
| 27 | PresetErrorDialog | clean | features/presets/PresetDialogs.tsx | none | presets dir splits (components out / plumbing stays); single 680x420 |
| 28 | PresetSaveDialog | clean | same file | none | store-prev-value pattern is CORRECT, keep; single 680x460 |
| 29 | PresetConfirmDialog | clean | same file | none | Cancel double-fire (onClick inside DialogClose) — behavior-only fix; single 680x340 |

### forms (11) — all clean · `ledger/build-forms.md`

| # | Component | Source | Crossings → remedy | Notes |
|---|---|---|---|---|
| 30–36 | TextWidget, TextareaWidget, NumberWidget, SelectWidget, CheckboxWidget, SwitchWidget, TagSelectWidget | features/configOverrides/rjsfWidgets.tsx | none | TagSelectWidget cn flip is the ONE render-affecting cn case (conflicting bg/border pairs currently resolved by stylesheet order) → E3 |
| 37 | BrowserConfigFieldTemplate | features/configOverrides/rjsfTemplates.tsx | none | `${id}__error` contract → extract shared id builder; column |
| 38 | BrowserConfigObjectFieldTemplate | same file | none | index-keyed run blocks (remount hazard) → re-key; column |
| 39 | BrowserConfigArrayFieldTemplate | same file | none | `as any` probe; no-collapse branch outside oracle; column |
| 40 | SchemaConfigForm | features/configOverrides/SchemaConfigForm.tsx | none | app-branded copy → neutral + fallback prop; KEEP `@rjsf/core` deep-subpath CSP fix (pinned hazard); fallback state not oracle-covered; column |

Home splits with the move: `configBuilders.ts` stays app-side (mapgen-core plumbing, in no
component graph); `SchemaForm/pathUtils/schemaPresentation/typeboxRjsfValidator(+test)/useConfigCollapse`
move. The five moving modules + widgets/templates form ONE cohesive unit (DOM/ARIA string
contracts) — never split.

### panels + layout (6) — 2 clean, 3 moderate, 1 app-shaped · `ledger/build-panels-layout.md`

| # | Component | Tier | Source | Crossings → remedy | Notes |
|---|---|---|---|---|---|
| 41 | ExplorePanel | moderate | ui/components/ExplorePanel.tsx | LAYOUT (v) → mv (constants split; only 2 app imports repoint); ui/types 7 opts (t) → mv; riverLakeInspector 2 types (t) → rt | auto-select effect writes parent state; native select/range ← global CSS resets; ~40-prop API (record-only); column |
| 42 | GameConsole | moderate | ui/components/GameConsole.tsx | status ×2 (v) → **sf** (SUPERSEDES move-with); server types (t) → E1; RunInGameCurrentRelation (t) → rt + collapse union twin | hand-rolled popup (Radix Popover candidate, un-oracle'd); triple hover-text; `@max-3xl:hidden` needs host `@container` (document); column |
| 43 | RecipePanel | moderate | ui/components/RecipePanel.tsx | status (v) → **sf**; server type (t) → E1; LAYOUT (v) → mv; ui/types (t) → mv | ships-with-forms coupling (cannot extract ahead of forms group); column |
| 44 | PipelineStage | **app-shaped** | features/recipeDag/PipelineStage.tsx | RecipeDagResult (t, public prop) → E1; RecipeDagLoadStatus (t) → rt (kills TS7056/orpc d.ts path); siblings ~980 ln (v) → mv | designed dir split (useRecipeDagQuery + prunePipelineExpansion stay); layout output must stay byte-identical; `.custom-scrollbar` dep; memoization wave → E3; single 1080x620 |
| 45 | LeftDock | clean | app/LeftDock.tsx | none | type-only react import; aria-label → prop; dock-twin unification only behind preserved named exports |
| 46 | RightDock | clean | app/RightDock.tsx | none | mirror of LeftDock |

## 3. Binding adjudications (supersede build rows)

From `ledger/coherence.md` §2 (grep re-confirmed where contested):

1. **Status modules split, not move** — `features/{mapConfigSave,runInGame}/status.ts`: the only
   value use of `@civ7/studio-server/contract` is a dead import+re-export (zero consumers
   repo-wide; grep-confirmed at freeze). Extract the 3 pure label formatters type-only; domain
   constructors (6 app-file consumers) stay. The "runtime contract dependency" evaporates.
2. **seedPolicy → inject-prop**, never inline (second-owner desync hazard).
3. **useConfigCollapse → package** (only consumers move with it; grep-confirmed). The
   `data-config-*`/`configContentId` DOM contract becomes intra-package — still document as a
   versioned string convention.
4. **One cn** — extended `cn` (`src/lib/utils.ts`) is the package's only class merger; plain
   `ui/utils/cn.ts` deleted; manual joins normalized. Only TagSelectWidget is render-affecting.
5. **One theme hook** — `useResolvedTheme` is the package theme-read API; sonner's private twin
   deleted; sonnerTheme test + app consumers repoint.
6. **One TooltipProvider policy** — ambient provider, loudly documented (absence = silent
   blank); strip AppFooter's inline provider.
7. **Union twins collapse** — `RunInGameActionRelation` ≡ `RunInGameCurrentRelation`: package
   owns one union, app aliases; never a third copy.
8. **Package barrel is value-clean** — no `toast` re-export from the primitives entry (app
   `useToast` repoints to sonner); barrel covers all 46 incl. today's six gaps; `ds-entry.tsx`
   retires.
9. **CSS pipeline is categorical** — package CSS entry owns the `@theme inline` token block,
   `tw-animate-css` (promote to real dependency), and the unlayered globals
   (`.custom-scrollbar`, native select/input resets); Tailwind content scan includes story
   files AND sonner.tsx; pin cva/clsx/tailwind-merge before publishing.
10. **externalDeps are honest only at the package boundary** — per-row dep lists under-report
    the barrel's full runtime closure; fix once via the curated value-clean barrel.
11. **Story-side chases are four** — AppFooter/RecipePanel (ui/types), AppHeader (setupConfig),
    WaterStatsSection (riverLakeInspector ×4) — plus the `@` alias rewrite for all 46.
12. **Package Storybook preview = TooltipProvider + Toaster only** — storeReset/queryStub stay
    app-side; mockWidgetProps + recipeDagFixture move.

## 4. Shared-kernel ownership

Full 25-module table with basis: `ledger/coherence.md` §3. One-line digest — **package:**
extended cn, ui/types, useResolvedTheme, components/ui + barrel, FieldRow, story fixtures.
**app:** ui/utils (config/formatting), app hooks, seedPolicy, setupConfig, clientState,
riverLakeInspector, viewStore, preview helpers, components.json. **split:** ui/constants
(LAYOUT → package; options/defaults per E2), both status modules (formatters → package),
presets, configOverrides (all but configBuilders), recipeDag (view+presentation → package),
index.css (tokens/globals → package CSS entry). **delete:** plain cn, ds-entry.tsx.
No module is claimed by both sides.

## 5. Escalations — reserved to Matei (design-phase checkpoint)

- **E1** — `.d.ts` policy for `@civ7/studio-server` contract types (3 sites): types-only peer
  dep (zero drift, direction smell) vs re-home structural types (clean direction; trivial for
  unions, HEAVY for the DAG shape — reverse drift risk).
- **E2** — Civ7 domain data (`ui/constants` options/defaults engine ids): ship in package
  (zero churn, directive defect) vs options-via-props (clean, public-API + story-args churn).
- **E3** — batching of ALL oracle-gated visual cleanups: recommended verbatim-move-first
  (changed:[] fidelity proof), one designed cleanup wave after — fidelity-risk call is Matei's.
- **E4** — AppHeader cannot move verbatim (inject-prop redesign changes its public API):
  approve the designed split for v1, or ship 45 components first and follow with AppHeader.

## 6. What the package IS — product description + client demands

**The package** is the MapGen Studio design system as a real library: 46 exported components
(15 shadcn-derived primitives + FieldRow; 13 app composites; the rjsf form suite; 4 panels;
2 docks), one value-clean barrel, one types barrel, one compiled CSS entry that owns the theme
tokens (dark-default `:root` + `.light`), the extended `cn`, `useResolvedTheme`, and the
46-story CSF corpus + fixtures. Props-driven throughout: no store, no transport, no server
runtime, no Civ7 engine coupling beyond what E1/E2 decide. Built with a real build
(dist + generated `.d.ts` + exports map), which retires `build-inputs.sh` and the synthEntry
converter fork.

**Client demands:**

- **The app** demands: every current import site resolvable from the package (46 components +
  types + LAYOUT + formatters + useResolvedTheme + cn), the package CSS importable into
  `index.css`, unchanged rendered output (ZERO_DRIFT), and its app-side halves of the splits
  (status constructors, configBuilders, preview helpers, viewStore, setupConfig) left working
  with imports repointed (~25 app-side files touch: 17 ui/types importers + 2 constants +
  2 EmptyState-direct + useToast + sonnerTheme test + StudioProviders/DeckCanvas).
- **Storybook** demands: the 46 stories relocate with titles VERBATIM (grouping authority for
  the sync), the `@` alias recreated or specifiers rewritten, fixtures (mockWidgetProps,
  recipeDagFixture) resolvable, a preview of exactly TooltipProvider + Toaster, and token CSS
  loaded — including story-file classes in the Tailwind scan.
- **design-sync** demands: a compiled ESM dist entry exporting all 46 + TooltipProvider (the
  `--entry` the storybook shape bundles), a `types` barrel (retiring the synthEntry fork —
  re-keys all 46 grades, coinciding with the move's own re-key), the flat compiled stylesheet
  with dark-default `:root` + `.light`, woff2 fonts, story titles unchanged, card overrides
  preserved, and the same-shape repoint keeping the anchor (changed:[46], not discarded).
  Uploads to project `531d158d…` remain gated on Matei's explicit go-ahead.

## 7. Contracts to document in the package

- TooltipProvider ambient requirement (absence = silent blank, no console error).
- `data-config-header`/`data-config-pointer` + `configContentId` string convention (intra-package
  after adjudication 3, still queried by string).
- `${id}__error` widget↔template ARIA id convention (extract one id-builder).
- GameConsole `@max-3xl:hidden` requires an ancestor `@container` (host-context coupling).
- `@rjsf/core/lib/components/Form.js` deep subpath = pinned CSP fix; re-verify on every rjsf bump.
- PipelineStage layout determinism: `buildRecipeDagLayout` output is the oracle's subject.
