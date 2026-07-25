# Initiative: Setup Correctness — one vocabulary, honest guards

> **Status:** ACTIVE (opened 2026-07-21). Owner: the pipeline director (FRAME §8).
>
> **Execution ledger (live, 2026-07-21):** branches `agent-DS-init-rails`
> (R1 complete, `3eedaf9e0e`) and `agent-DS-init-primitives` (C1a IconButton+
> Badge `abd71e002c`; C2a rjsf shells+section naming+id scoping `d4a7dce0f8`;
> C2b Disclosure anatomy+useControllableState `77d25d4d3b`; C2c SelectWidget→
> OptionSelect+AppBrand dismissal+array de-any `1418f43a49`; C3a Toaster
> reunification `c5f41f830e`; A1a Tailwind src scan+StrictMode honesty
> `63ca371c1a` — StrictMode exception ledgered as root DEF-020; G1 gate repair
> `edee8f8472`).
> **Open rows:** C1.2 SegmentedControl + Tabs retirement, C1.4 scroll idiom +
> ScrollArea retirement, C1.5 literal sweep, C2.3 ExplorePanel provider
> collapse, C2.9 strategy-envelope collapse, C3.3 tier-policy note, A1.3 palette
> identity contract, A1.4 errorFormat consolidation, A1.5 WaterStats shortLabel,
> S1 sync & seal.
> **Codex Sol adversarial pass: DEAD, not in flight.** Job task-mrv2a6c0-mfesmo
> left no state on disk and returned no verdict, so the gate it held was never
> going to lift on its own. C1.2, C1.4 and C2.3 are hereby UNGATED — re-run an
> adversarial pass over the branch diff if one is wanted, but do not wait on this
> job.
> **Trigger:** Matei's directive after the sync-surface repair — every actor in this
> pipeline's history was us; the tailwind pollution and the toast impossibility were
> self-authored and survived because reviews checked artifacts, not mechanisms.
> Directive: full review of the setup; fix categorical problems, not instances;
> turn on Biome's React lint; verify the component breakdown against how a design
> system should actually compose; resolve everything; end synced.
>
> **Evidence base:** categorical audit workflow `wf_09beb69d-f6a` (2026-07-21):
> 6 lanes + web-researched rubric, 35 findings, 25 P1/P2 **all independently
> verified against the worktree** (0 refuted), 10 P3 advisory. Full corpus in the
> session journal; the load-bearing facts are restated here so this document
> stands alone.

## WHAT (commander's intent)

Make the design-system setup *structurally honest*: every visual idiom the product
uses is a named, exported component (no shadow string-primitives); every component
API composes (compound parts and shared state hooks, not prop ladders and render
hatches); the story surface actually exercises the public contract it claims to
prove; and every recurrence guard that exists on paper actually runs. The unit of
success is **classes eliminated**, not instances patched.

## WHY

Two categorical defects (token-registry pollution, unreachable toast) each
survived many reviews because (a) the defect looked plausible at the artifact
level and (b) no mechanism-level check existed. The audit found the same
signature repeated across the setup: guards that claim CI enforcement but never
run, idioms canonized in comments but not code, docs that assert behavior the
code flipped eras ago, silent fallbacks that ship degraded output with a green
verdict. Fixing the found instances without installing the checks would schedule
the next incident.

## Hard core (violating any of these voids the initiative)

1. **Idiom = component.** A visual idiom used across ≥2 surfaces exists as an
   exported component or it is a defect. String-constant pseudo-primitives are
   banned as a category.
2. **The barrel is honest inventory.** Everything the product's chrome depends on
   is on it; nothing on it is a trap (exported but matching no shipped treatment).
3. **Stories exercise the public contract.** Story value-imports ride the package
   name; a story that needs ambient context the sync cannot supply is a broken
   story, not a converter problem.
4. **A guard that does not run is a lie.** Every recurrence guard lands as an
   executing check (CI target, design-sync-check assertion, lint rule) — prose
   reminders are not guards.
5. **Behavior claims shipped to design agents are derived or tested,** never
   hand-maintained in two prose homes.

## Falsifier

If, after execution, the next real domino (design intent, not cleanup) still
requires hand-editing a vendored artifact, a manual grading fork, or a prose
reminder to stay correct — this initiative failed and the pipeline shape itself
(vendored converter + prose ledger) must be reframed, not re-audited.

---

## Corpus → dominos

35 findings collapse into six dominos. Per-domino branches stacked on
`agent-DS-sync-surface-repair` (Graphite law: branch = PR). Rails land first
(FRAME S2–S3: rails before burn-down) so every later domino is born checked.

### R1 — RAILS: lint + executing guards  (branch `agent-DS-init-rails`)

| Row | Finding | Resolution |
| --- | --- | --- |
| R1.1 | Biome react domain off | `linter.domains.react = "recommended"` in root biome.json; fix the one new error (PipelineStage.tsx:411 `noArrayIndexKey` — drop the `-${index}` suffix; key is already compound). NOT `"all"` (166 diagnostics; `useComponentExportOnlyModules` structurally incompatible with CSF stories). |
| R1.2 | Deduping hook rules silently escalates 5 intentional sites warn→error | Convert the 5 documented exhaustive-deps ref-pattern sites (useDeckAutofit ×3, useKeyboardShortcuts:45, DeckCanvas:198) to `biome-ignore` with reason, THEN remove the now-redundant hand-picked hook rules so the domain owns them. |
| R1.3 | Package hardcodes DOM ids (19 sites — instance-unsafe in a multi-instance package) | `useId()` at the ~12 non-story sites; enable `correctness/useUniqueElementIds: error` via override scoped to `packages/mapgen-studio-ui/src/**`, stories excluded. |
| R1.4 | verify.mjs claims "CI's fifth target"; CI never runs it — the toast recurrence guard is unenforced | Wire `verify` into the CI run set; add the meta-assertion (verify fails loudly if the root ci script drops it). |
| R1.5 | Preview esbuild failures silently ship floor cards (bit us once already) | design-sync-check asserts `_preview/<Name>.js` exists for every story-map component; non-zero exit listing gaps. Repo-owned → survives converter re-stage. Upstream feedback: `previewBuildFailed` should force `ok:false`. |
| R1.6 | emit.mjs `--tw-` classifier patch is local-only; a converter re-stage silently drops it (re-pollution) | design-sync-check asserts no `--tw-` name outside the `other` bucket in the emitted README token tables; file the one-liner upstream. Convention recorded: any local `.ds-sync` divergence pairs with a repo-side absence-detector. |
| R1.7 | Story-import contract lives in a comment | Vitest: every `*.stories.tsx` value-import comes from the allowlist (package name, storybook, react, lucide-react, @rjsf/utils, local storybook helpers). |
| R1.8 | Title taxonomy hand-typed ×3, already drifted | Vitest: story `title` matches `^(primitives|composites|forms|layout|panels|templates)/<Component>$`, segment equals export name, prefix agrees with the docsMap group; FieldRow's forms-folder/primitives-title exception is an explicit allowlist entry. Fix `Composites/MapConfigSaveDialog` casing. Correct EXCLUSIONS.md census (45). |
| R1.9 | launch.json invokes dead scripts | Repoint both studio entries at the Nx `dev` target. |
| R1.10 | conventions.md tells design agents AppFooter self-provides TooltipProvider; code relies on the ambient one | Fix the sentence; derive the tooltip-dependent component list from source at check time and diff against conventions.md. |

### C1 — VOCABULARY: promote the shadow primitives  (branch `agent-DS-init-primitives`)

| Row | Finding | Resolution |
| --- | --- | --- |
| C1.1 | Two icon-button systems, diverged, one barrel-invisible (17 raw sites) — the toast class again | `IconButton` in ui/ (cva over the calibrated muted-idle treatment + `active`), both barrels; migrate all raw `<button className={iconButton}>` sites; delete `lib/iconButton.ts`. |
| C1.2 | Segmented control hand-rolled ×3 divergent; Tabs exported, consumed nowhere | `SegmentedControl` composite (role=group, aria-pressed items, size variants covering h-7 labeled + h-6 icon cases); rebuild StageViewTabs + both ExplorePanel groups on it. **Retire Tabs from the barrel** (a trap: matches none of the shipped treatments) with ledger note. |
| C1.3 | Warning-chip literal ×5 verbatim; no Badge | `Badge` in ui/ (variants: warning / neutral / interactive); sweep the 7 chip sites. |
| C1.4 | Three scroll idioms; two sites already fell back to native scrollbars | Make scrollbar theming **global** in theme.css (kill the opt-in class trap); **retire ScrollArea/ScrollBar from the barrel** (zero consumers, unexercised path) with ledger note. Keep Separator (honest, no competing idiom). |
| C1.5 | Sweep residue | rg sweep for other 3+-site verbatim class literals; promote or explicitly ledger each. verify.mjs floor recount after barrel changes. |

### C2 — COMPOSITION: compound APIs + state shape  (branch `agent-DS-init-compounds`)

| Row | Finding | Resolution |
| --- | --- | --- |
| C2.1 | **P1** Disclosure-header ×3 shapes; trigger anatomy nests interactive content; render hatch yields role=button with button descendants | Compound rework: `Disclosure.Row` (row chrome) / `Disclosure.Trigger` (native button: chevron+icon+title, aria-expanded/controls) / `Disclosure.Actions` (sibling cluster). Delete the `render` prop. Migrate RecipePanel Config header (drops role=button div + stopPropagation) and rjsfTemplates' CollapsibleHeader. |
| C2.2 | Optional-controlled pattern hand-rolled ×7 | `useControllableState` in lib/, replace all 7 copies (behavior-identical). |
| C2.3 | ExplorePanel = 44-prop controlled monolith | Collapse to sectioned view-model objects behind a provider interface (composition-patterns §state); app injects one model. Exact shape at S2; prop names stable within sections where possible. |
| C2.4 | rjsf FieldTemplate wraps containers in dead shells at every depth (the live wrapper chain Matei inspected) | Container branch in BrowserConfigFieldTemplate: object/array → return children (keep the rawErrors live region); clean chain per depth = `divide-y > section > header + body`. DOM-depth pin test. |
| C2.5 | `<section data-config-section>` nameless at every depth (role generic; no landmark nav) | `configSectionLabelId(pointer)` helper; title span gets the id; all three section emitters get `aria-labelledby`. Axe check (region-name + nested-interactive) wired as a failing test over SchemaConfigForm + Disclosure stories. |
| C2.6 | SelectWidget re-implements OptionSelect (duplicate sentinel machinery) | SelectWidget composes OptionSelect (`triggerClassName`/id pass-through; enum value-map stays in the widget); delete the second sentinel. README states forms→composites composition is sanctioned. |
| C2.7 | AppBrand hover popover survived the E3 hand-rolled-popup sweep | Rebuild on Radix (Popover or HoverCard) — Escape/outside dismissal, portal stacking, touch. Confirm it is the last `useState+onMouseEnter` floating layer (sweep). |
| C2.8 | ArrayFieldTemplate as-any chains (advisory) | Type as v6 `ArrayFieldTemplateItemType`; fix configWidgets registry typing. |
| C2.9 | The `{strategy, config}` collapse rule never fires on real generator output — `isConfigWrapper` rejects any node carrying a `description`, and the schema generator stamps "Strategy selection for operation …" onto every strategy envelope. Zero collapses today because main's schema has zero envelopes; the peer mapgen stack introduces three, at which point authors get an extra "Config" level (two of them empty) plus a disabled single-option "Strategy" select. | Detect the envelope structurally (`keys == [strategy, config]`) rather than by description absence; keep the parent's description and collapse `config`. Pin it with a fixture built from real arity-1 `anyOf` generator output, not a hand-written ideal — the rule was written for a shape it had never actually seen. Separately decide whether an arity-1 strategy union should render a control at all. **Latent until the peer stack lands; fix now so it lands correct.** |

### C3 — STORY ORACLE: reunify story and card  (branch rides `agent-DS-init-compounds` or its own if thick)

| Row | Finding | Resolution |
| --- | --- | --- |
| C3.1 | Toaster dual-bookkeeping: story relies on the global decorator; sync patched by a permanent hand-owned preview fork + manual grading | Story self-mounts `<Toaster/>`; remove Toaster from StoryProviders (its comment says it exists only for this story); delete `.design-sync/previews/Toaster.tsx`; retire the manual grading path. |
| C3.2 | sonner story imports toast from "sonner"; MapConfigSaveDialog story imports relatively | Both ride the package barrel (R1.7's test then pins the class). |
| C3.3 | Primitive stories are zero-arg showcases; no play functions (advisory) | Record the tier policy in EXCLUSIONS.md/README — deliberate, not drift. No churn beyond the note this pass. |

### A1 — APP: close the fossilized workarounds  (branch `agent-DS-init-app`)

| Row | Finding | Resolution |
| --- | --- | --- |
| A1.1 | Dev serves package SOURCE while Tailwind scans package DIST — silent utility dropout in dev | Point `@source` at package src (superset, never stale); drop the dist scan. |
| A1.2 | StrictMode structurally never active; comment encodes false React semantics | Enable StrictMode in dev; harden the deck.gl mount for double-mount (guard device/canvas init) — or if not feasible this pass, tracked exception with checkback, and fix the false comment either way. |
| A1.3 | App-side hex palettes tunneled into WaterStatsSection as color-as-data; 2 of 3 fields dead | Contract becomes palette identity: package owns id→CSS mapping (`--viz-cat-*` tokens or classes); delete dead `inactiveColor`/`debugColor`. Guard: no exported package prop typed as CSS color string. |
| A1.4 | formatErrorForUi copy-forked, drifted; three helper homes (advisory) | Superset impl into `src/shared/errorFormat.ts`; delete the fork; collapse `src/ui/utils` into shared so exactly one helper home exists. |
| A1.5 | WaterStatsSection hard-codes app-domain key heuristics (advisory) | `shortLabel` rides `WaterStatsLayerRef.presentation` (app owns domain naming); delete `formatLayerButtonLabel` heuristics from the package. |

### G1 — GATE REPAIR: the guards our own dominos left red  (`edee8f8472`, complete)

Found by the restack-feasibility sweep, not by a gate — which is the finding
behind the finding: these had been red since the commits that broke them, and
nothing surfaced it until someone asked an unrelated question.

| Row | Finding | Resolution |
| --- | --- | --- |
| G1.1 | `appHeaderMarkupPin` failed 2/2. R1's `useUniqueElementIds` compliance swapped AppHeader's hardcoded panel id for `useId()`, and C1a moved ViewControls onto IconButton — the byte-exact fixture was never advanced. The test still claimed to prove the E4a redesign was a markup no-op, a premise our own stack had deliberately falsified. | Generated ids normalized (distinct `useId` values get distinct stable tokens, so `aria-controls` → `id` linkage still pins while hook ordering does not); fixture regenerated and every delta reviewed tag-by-tag (no attribute lost; IconButton gains `type=button` + focus/disabled affordances; the Badge-wrapped Re-apply keeps an identical class set); premise rewritten as a regression pin; `UPDATE_MARKUP_PIN=1` gives the next deliberate advance a supported path instead of hand-editing 53KB of JSON. |
| G1.2 | 7 controller tests died on `adoptSavedBaseline`/`installCanonicalConfig` "is not a function", and `check:test` reported 4 type errors. Splitting `setCanonicalConfig` into an install path and a baseline-only path widened two hook arg types without updating the hand-built test factories. The gate that catches this **already existed and was simply not run**. | Factories supply both operations; assertions follow the split instead of merely compiling — save-to-current adopts the baseline and never reinstalls, a failed save adopts nothing, whole-envelope installs never travel the working-edit path. That contract shipped untested; it is now pinned. |

### S1 — SYNC & SEAL  (after all dominos green)

Full resync driver + grading (Toaster grades via the standard path for the first
time — C3.1 is its own falsifier), atomic upload with the byte-verify refetch,
anchor + NOTES + DEFERRALS + memory seal, draft PRs, runner/primary advance.
Design-side deletions (`Tabs`, `ScrollArea` cards) ride the sync's deletePaths.

## Sequencing

R1 → C1 → C2 (+C3) → A1 → S1. R1 first: every later domino lands on a repo where
the guards already run. C1 before C2: the compound rework consumes the new
primitives (Disclosure.Actions renders IconButtons; SegmentedControl replaces
hand-rolls the C2 files touch).

## Judgment calls taken (protective belt; reversible, recorded)

- **Tabs + ScrollArea retired, Separator kept.** The line: retire what misleads
  (competing shipped idiom exists), keep what is honest. Re-adding later is one
  export + one story.
- **Scroll idiom = globally themed native scrollbars,** not ScrollArea adoption
  (smallest diff, kills the opt-in failure mode entirely).
- **ExplorePanel API break is sanctioned** — the package is repo-internal and the
  44-prop flat surface is itself the defect. Design-side compositions re-learn
  the API from the synced .d.ts/prompt on next use.
- **react domain at "recommended", not "all"** — measured: +1 real defect at
  recommended; +160 noise at all.

## Verification gates (per FRAME S3/S6)

Per domino: package build + typecheck + 204-test suite + the NEW guards green;
C2 additionally: axe pass on SchemaConfigForm/Disclosure stories + live DOM
inspection of the config panel (the wrapper chain Matei captured must be gone).
Initiative close: full design-sync check green with **zero manual grading paths**
and the export floor recounted.
