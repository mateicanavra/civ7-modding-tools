# Adversarial verification — ds-group "panels-layout"

Verifier: independent re-derivation from source at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction`.
Every import surface in the six rows was re-read from the files; every one-hop
module the rows lean on (status.ts x2, clientState.ts, useRecipeDagQuery.ts,
layout.ts, domainPresentation.ts, artifactPresentation.ts, riverLakeInspector.ts,
useResolvedTheme.ts, ui/constants/*, ui/types/index.ts, useConfigCollapse.ts,
SchemaConfigForm.tsx→SchemaForm.tsx, OptionSelect.tsx, components/ui barrel,
ui/components barrel, ds-entry.tsx, .design-sync/config.json + NOTES.md,
.storybook/preview.tsx, lib/utils.ts, src/index.css, package.json) was opened.

## VERDICT: verified = TRUE

No tier changes. No missed runtime boundary crossing outside the shipping
surface. All cited file:line evidence reproduced. Corrections below are
remedy-scope, evidence-magnitude, and externalDeps-completeness issues.

## Confirmed exactly (spot list)

- ExplorePanel: imports :7-18 lucide (10), :19 react, :20 `../../components/ui`
  Tooltip, :21-24 `import type` riverLakeInspector (2 types), :25 LAYOUT,
  :26-34 7 option types, :35-36 DisclosureHeader/WaterStatsSection. LAYOUT used
  :373 (EXPLORE_PANEL_WIDTH=260 at ui/constants/layout.ts:21). Auto-select
  effect :216-220; IIFE grouping :335-351; per-render icon fns :300-333;
  template-literal badges :291-298; cn-clobber comment :512-518; native range
  :665-675, selects :686-696/:707-717, opacity range :724-733; props :40-131.
  ui/types/index.ts: zero imports (pure types) — confirmed.
  riverLakeInspector.ts: single import, `import type … from "@swooper/mapgen-viz"`
  (:1-9), 641 lines — confirmed type-only.
- GameConsole: :1 server types → props :82/:90; :2-12 lucide (9); :14 barrel
  Button+Tooltip; :15 mapConfigSave/status (value); :16 clientState type-only;
  :17-20 runInGame/status (value). statusOpen :125; document listeners :130-150;
  title+aria-label+TooltipContent triples :322-323/:351, :370-371/:383,
  :398-399/:409, :418-419. status.ts:7 (mapConfigSave) and status.ts:6
  (runInGame) VALUE-import contract phase constants — confirmed.
  clientState.ts:41 `RunInGameCurrentRelation` 3-value union; clientState.ts:1-9
  value-imports setupConfig + configMigrations — confirmed.
- RecipePanel: :9 server type → props :75; :10 lucide (7); :12-30 barrel;
  :31 SchemaConfigForm; :32 useConfigCollapse (react + type-only rjsfTemplates —
  confirmed); :33 status; :34 LAYOUT (PANEL_WIDTH=340 layout.ts:19, used :228);
  :35 types; :36-37 DisclosureHeader/OptionSelect. Identity .map :267-270 and
  :285-288 vs OptionSelect.tsx:9 `ReadonlyArray<{value,label}>` — structurally
  identical, cleanup is render-identical as claimed. Passthrough lambda :455.
  SchemaForm.tsx: `@rjsf/core/lib/components/Form.js` + typebox validator —
  externalDeps claim (@rjsf/core + @rjsf/utils + typebox in package
  dependencies; validator-ajv8 not dragged) confirmed.
- PipelineStage: :1 contract type; :2 lucide (4); :4 EmptyState direct-file
  (barrel DOES export it — ui/components/index.ts); :5 useResolvedTheme (56
  lines, react-only useSyncExternalStore DOM reader — confirmed); :6-17 sibling
  value imports; :18 `import type { RecipeDagLoadStatus }` ←
  useRecipeDagQuery.ts:20, which VALUE-imports @tanstack/react-query + lib/orpc
  (:2-4). layout.ts:1 contract-typed, 619 lines; domainPresentation.ts 280
  lines lucide-only (10 value icons + createLucideIcon); artifactPresentation.ts
  81 lines sibling-only. buildRecipeDagLayout runs at render :78. 6 private
  subcomponents. No Radix Tooltip (native title only) — confirmed. NOTES.md
  Batch-3 bullet documents the TS7056-via-orpc declaration-graph path —
  confirmed. Diagnostics index key :517. recipeDagFixture typed against
  contract — confirmed. config.json override `{cardMode:single,
  viewport:"1080x620"}` — confirmed; panels get `{cardMode:"column"}`.
- LeftDock/RightDock: sole import `import type { ReactNode } from "react"` (:1);
  aria-labels :27; static classes :28; not in ui/components barrel; exported at
  ds-entry.tsx:20/:21 — all confirmed. Stories: `args: {} as unknown as
  *DockProps` :15, render-owned scene, Stage/SamplePanel scaffolds :23-47,
  WithPanel :49 — confirmed.
- TooltipProvider: components/ui/tooltip.tsx does NOT embed a provider;
  .storybook/preview.tsx wraps `TooltipProvider delayDuration={300}` and calls
  it mandatory — "requires global TooltipProvider" claims confirmed.
- Global CSS: `.custom-scrollbar` + `select { appearance:none; background-image:
  … }` resets confirmed in src/index.css (~:205-240). Extended cn confirmed at
  lib/utils.ts:12-18.
- package.json: @radix-ui/react-popover 1.1.16 present (GameConsole's "Radix
  Popover is already a dependency" confirmed).

## CORRECTIONS

### C1 — GameConsole + RecipePanel: the "runtime contract drag" through the
### status modules is SEVERABLE, and whole-module `move-with` is itself a
### dependency-direction defect

Evidence:
- The ONLY value use of `@civ7/studio-server/contract` in both modules is an
  import immediately re-exported: mapConfigSave/status.ts:7-9
  (`import { MAP_CONFIG_SAVE_DEPLOY_PHASES } … export { … }`) and
  runInGame/status.ts:6-8 (`RUN_IN_GAME_PHASES`). Repo-wide grep: ZERO
  consumers of either re-export outside those two lines. Dead weight.
- The three formatters the UI components consume
  (formatMapConfigSaveDeployPhaseLabel status.ts:20-35;
  formatRunInGamePhaseLabel status.ts:38-67; runInGamePrimaryActionLabel
  status.ts:76-90) are pure switches over the phase string — they need only
  contract TYPES.
- The modules' other exports are app operation-domain machinery
  (create/updateMapConfigSaveDeployStatus, kindFor*, isSaveDeployTerminal,
  saveDeployResultFromTerminalStatus, formatRunInGameDiagnostics,
  stableRunInGameStringify, runInGameRequiresProcessRestart) consumed by SIX
  app files: app/StudioShell.tsx, app/hooks/useRunInGame.ts,
  app/hooks/useRunInGameTerminalToast.ts, app/hooks/useSaveDeploy.ts,
  app/operationAdoption.ts, features/runInGame/clientState.ts (clientState.ts:9
  value-imports stableRunInGameStringify).

Consequences for the rows:
- `move-with` on `../../features/mapConfigSave/status` (GameConsole crossing 2,
  RecipePanel crossing 2) and `../../features/runInGame/status` (GameConsole
  crossing 3) would relocate app operation-domain constructors into the
  published UI package and force 6 app files to import domain logic from the UI
  library — exactly the dependency-direction smell the directive marks as a
  defect. Correct remedy: SPLIT — extract only the pure label formatters
  (type-only over the contract) into the package, or inject them as props;
  delete the two dead PHASES re-export lines; the domain constructors stay
  app-side.
- GameConsole risk 3 ("move-with remedy makes @civ7/studio-server a runtime
  dependency of the published package") is overstated: the runtime dep only
  materializes if the dead re-export lines travel. Formatter-only extraction
  leaves the contract reference type-only. The rows' framing of the drag as
  "RUNTIME contract dependency one hop away" is literally true today but the
  inseverability it implies is false.

### C2 — ExplorePanel crossing 1 drag: "co-owned by 15+ app files" is ~3x
### overstated

Actual consumers of the ui/constants layer (grep on the module path AND on
every exported name): 5 files — ui/components/AppFooter.tsx:12,
ui/components/ExplorePanel.tsx:25, ui/components/RecipePanel.tsx:34 (all three
inside the sync surface), plus app/hooks/useViewportLayout.ts:10 and
ui/hooks/useViewState.ts:8. Outside-surface co-ownership is 2 files, not 15+.
This makes the `move-with` remedy cheaper than the row implies (only 2 app
imports to repoint). Remedy stands; evidence corrected.

### C3 — externalDeps under-report through the components/ui barrel
### (categorical: ExplorePanel, GameConsole, RecipePanel)

components/ui/index.ts line 13 is `export { toast } from "sonner"` and the
barrel value re-exports every primitive module. Any `from "../../components/ui"`
import therefore drags sonner + all @radix-ui primitive packages + cva at
module-graph/runtime level, not just the named primitive. Specific omissions:
GameConsole/RecipePanel import Button (→ @radix-ui/react-slot +
class-variance-authority) unlisted; RecipePanel drags @radix-ui/react-select
via OptionSelect unlisted. Intra-surface (the primitives group ships anyway),
so no boundary change — but the per-component externalDeps fields are not the
true runtime closure.

## MISSED CROSSINGS / OMISSIONS

1. PipelineStage.tsx:182 and :475 use the global `.custom-scrollbar` class
   (src/index.css) — the same "global CSS must travel or the panel renders
   off-brand" dependency the ExplorePanel row flags (its risk 4); the
   PipelineStage row omits it entirely.
2. GameConsole.tsx:271 `@max-3xl:hidden` is a Tailwind container query — it
   only activates inside an ancestor `@container` (the app header's center
   column). Stories' `Bar` scaffold and any package consumer without a
   container never hide the seed suffix. Host-context coupling unnoted in the
   row.
3. (note-level) runInGame/status.ts:23 already defines
   `RunInGameActionRelation`, an identical `"current"|"stale"|"unknown"` union
   to clientState's `RunInGameCurrentRelation` (clientState.ts:41). The
   `re-home-type` remedy for GameConsole crossing 4 can collapse the duplicate
   (alias/retire one) instead of re-homing a second copy — otherwise the
   package ends up owning a twin of a union the app still exports.

## Tier review

- ExplorePanel / GameConsole / RecipePanel: moderate — CONFIRMED. All value
  crossings are label formatters or a geometry constant; remedies mechanical.
  GameConsole "heaviest moderate" framing stands (and softens further once C1's
  severability is applied).
- PipelineStage: app-shaped — ACCEPTED, borderline. All its remedies are
  mechanical (one-line type re-home, portable siblings, contract types as
  peer), which reads like a heavy moderate; what preserves app-shaped is the
  designed split of the recipeDag feature dir (view+presentation move,
  useRecipeDagQuery + prunePipelineExpansion stay) — no other row requires
  splitting a directory. Note: prunePipelineExpansion.ts has ZERO imports (pure
  function, consumers: app/hooks/useViewportLayout.ts… actually
  app-side hooks) so "stays app-side" is a choice, not a constraint.
- LeftDock / RightDock: clean — CONFIRMED (verbatim movable).

## Minor notes

- Line-count citations (742/569/556/671/35) follow the Read-tool convention;
  `wc -l` gives 741/569/555/670/34 (no trailing newline). Immaterial.
- NOTES.md corroborates the RJSF-fixture-drift claim (RecipePanel storyNotes)
  and the TS7056 declaration-graph claim (PipelineStage) — both bullets exist
  in .design-sync/NOTES.md (Batch 3 bullet; RecipePanel mock bullet).
- GameConsole stories: hang-off never opened (defaultStatusOpen absent from
  args) — confirmed; the "not oracle-covered" risk framing is accurate.
- RecipePanel stories: two stories over `satisfies Omit<RecipePanelProps,
  "recipeCollapsed"|"configCollapsed">` (:85), schema fixture :35-59, types
  import @/ui/types :4 — all confirmed.
