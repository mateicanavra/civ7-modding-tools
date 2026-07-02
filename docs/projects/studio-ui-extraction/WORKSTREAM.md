# WORKSTREAM — MapGen Studio UI Library Extraction

**Status:** **EXECUTING** — checkpoint COMPLETE 2026-07-01 (Q2/E1–E4 all decided; D3–D6 below); B0 SHIPPED 2026-07-01 (draft PR #1997, gates green, 14-agent fan-out review folded); B1 SHIPPED 2026-07-01 (draft PR #1998, scaffold + theme single-source + token fixture, review folded — no-generator policy, nx test→build edge); B2 SHIPPED 2026-07-02 (draft PR #1999, foundation + 16 primitives + full app rewire, review folded — dev-only vite alias made exact-match regex after a string key prefix-captured the theme.css/fonts.css subpath imports and 500'd `vite dev`; app storybook targets now declare their dist deps); stack per openspec `studio-ui-extraction` tasks.md: B0 `@civ7/studio-contract` → B1 scaffold → B2–B6 moves → B7 sync repoint → B8+ cleanup wave
**Owner:** extraction workstream agent (this document is the owner's operating picture)
**Normative anchor:** [FRAME.md](./FRAME.md) — scope, DoD, non-goals, reserved decisions. This doc never overrides the frame; contradictions get escalated to Matei.
**Branch/worktree:** `studio-ui-extraction` (parent `main`), worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-studio-ui-extraction`
**Base:** `main` @ `c4ebaf1e1` (frame PR #1995)

---

## 1. Verified preconditions (2026-07-01)

- Frame §8 precondition **satisfied**: PRs #1991, #1992, #1993, #1994 all `MERGED` to main 2026-07-01 (verified via `gh pr view`). #1995 (frame) also merged. Main tip `c4ebaf1e1` contains the Storybook workbench, the storybook-shape sync flip, the TypeBox validator, and the theming fix.
- Graphite branch `studio-ui-extraction` created off `origin/main`, tracked with `gt parent` = main.
- FRAME.md found **on main** — no off-main copy needed.

## 2. Decision-holder directive (Matei, 2026-07-01, mid-kickoff)

Recorded verbatim in intent; supersedes the frame's narrower "no API redesign" reading of §3 while keeping the fidelity gate:

> Assume a lot of the code was written before we had good best practices. Lean into React best practices and clean up any clear issues with crossing boundaries — especially around dependencies. Treat this as making a clean, proper React components package/app. Do **not** over-index on how things currently are; focus on making it good and better. The only thing we care about is making it componentized and modular so we can build better in the future. Don't let the past influence the future in a negative way for no reason.

Operational consequences:
- **Boundary hygiene and dependency direction are in scope**, not merely tolerated-if-cheap. Components that reach into app guts get their boundaries fixed as part of extraction, not wrapped.
- **API shape may improve** where current shape is an accident of app history (prop bags, leaked domain types, value imports that should be injected). Improvements follow the frame's behavior bar: testable, test designed first where behavior changes.
- **Visual fidelity remains the gate**: the 46-story oracle + re-sync compare machinery still decides "renders identically". Cleanups must not change rendered output (or where they deliberately do, that is a stop-and-justify event, surfaced before shipping).
- The frame's "one owner at the end" invariant is strengthened by this directive: no compatibility shims, no dual paths.

## 3. The design-sync contract (read in full from the bundled skill — main + both shape sub-skills)

The `design-sync` skill is bundled with the DesignSync tool (not any plugin); extracted and archived for this workstream in the session scratchpad (`design-sync-SKILL.md`, `ds-subskill-storybook-source-shape.md`, `ds-subskill-package-source-shape.md`). Load-bearing facts:

1. **The upload format is the contract; the converter is the deterministic path to it.** Layout: `_ds_bundle.js` (+ `@ds-bundle` header), `styles.css` (designs receive ONLY its transitive `@import` closure), `components/<group>/<Name>/{.html,.jsx,.d.ts,.prompt.md}` with `@dsCard` first line, `_preview/`, `_vendor/`, `fonts/`, `_ds_sync.json` anchor. `lib/emit.mjs` and `lib/bundle.mjs` are app-contract surface — never forked.
2. **The storybook shape already presumes a package.** The converter bundles a *compiled dist entry* (`--entry <built-dist-entry>`) into `_ds_bundle.js`; Storybook is "the fidelity oracle, not the runtime". `build-inputs.sh` exists solely to fake that dist from the app's Vite build. A real package dist is the designed-for input — this confirms the frame's premise rather than contradicting it.
3. **Grades follow sources.** Grade contract keys: story files, owned previews (`.design-sync/previews/`), config keys `provider`/`storyImports`/`extraEntries`/`overrides`/`titleMap`, committed lib forks. Moving component/story files re-keys everything → the extraction triggers a full O(46) recapture + regrade. Expected, priced in; the portal-dialog four go through the manual-verification path (frame §3).
4. **Owned previews import stories as `@ds-stories/<repo-relative path>`** — location-independent w.r.t. the preview file, but pinned to the story's repo-relative path: story file moves must be reflected there (or pairing breaks visibly).
5. **Config is strictly validated** — unknown/removed keys fail the run with a named fix. Keys the extraction touches: `pkg`, `entry`/`buildCmd`, `cssEntry`, `componentSrcMap` (every path changes), `storybookConfigDir`/`storybookStatic` (if Storybook moves), `titleMap` (if story titles change — avoid), `docsMap`, `overrides` (carry as-is).
6. **Our upload path is atomic** (projectId `531d158d…` pinned before run start): one pass after everything verifies; deletes come *verbatim* from `.sync-diff.json` `upload.deletePaths` (anchor-diff based, so `explorations/` + `scraps/` — never anchor-recorded — never appear in deletePaths; plan delete-globs additionally must not cover them). `_ds_sync.json` is the absolute final write. Any upload to the live project requires **Matei's go-ahead** (frame §6).
7. **Package shape has no reference render** — absolute-rubric grading + floor cards. Storybook shape keeps the screenshot-verified gate. The frame requires the chosen end-state shape to preserve the verified-screenshot gate → strong prior for **staying `shape: "storybook"`**, with the package's real dist as `--entry` and its real CSS as `cssEntry`. (Final call in the design phase; both sub-skills read.)
8. **Incrementality mechanics**: `_ds_sync.json` envelope `{shape, styleSha, renderHashes, sourceKeys, keyRecipe, scriptsSha, sourceHashes, auxSha, bundleSha12}`; single `styleSha` per bundle. Any improvement claim must be tested against `lib/sync-hashes.mjs` + `resync.mjs` reality (frame §5 warns: do not promise beyond what resync.mjs supports).
9. **Re-sync ritual** (for the final re-verify): refresh staged scripts → re-run `buildCmd` **and** rebuild `.design-sync/sb-reference` together → fetch anchor via `DesignSync(get_file, "_ds_sync.json")` → `resync.mjs --remote` → act on verdict → conventions-header validation pass → atomic upload. `[REFERENCE_STALE?]` = forgot to rebuild the reference.
10. **Conventions header**: `.design-sync/conventions.md` (readmeHeader) is validated (never rewritten) on re-syncs; every named class/token/component must exist in the built artifacts. After extraction, its claims must be re-validated against the package build.

## 4. Curated skill pack

Enumerated via `meta:introspect` over installed plugins (dev ~48, cognition 14, habitat 6, nx 7, hq, meta, docs, design, mapgen, codex + official marketplace). Confirmed: no `design-sync` skill in any plugin — it ships with the DesignSync tool (extracted above). Vercel React skills confirmed inside the **dev** plugin.

**Core — owner reads in full; every sub-agent brief names its subset:**
| Skill | Why core |
|---|---|
| `design-sync` (+ both shape sub-skills) | THE contract this extraction serves — read in full (owner) ✅ |
| `habitat:systematic-workstream` | execution anchor: sealed sources, decision model before mechanics, proof ledger |
| `dev:graphite` | stack mechanics, lane discipline (supplements standing memory) |
| `dev:typescript` + `dev:refactor-typescript` | package/API design + safe extraction moves |
| `dev:vercel-composition-patterns` + `dev:vercel-react-best-practices` | the clean-React bar Matei's directive sets |
| `dev:review-code-quality` | structural review bar for the review fan-outs |
| `nx:link-workspace-packages` + `nx:nx-workspace` | workspace wiring for the new package |
| `dev:vite` | app + Storybook build integration; lib-mode option |

**Entry points — navigated on demand:**
`dev:git-worktrees`, `dev:bun`, `dev:api-design`, `dev:architecture` (OpenSpec-adjacent change discipline), `dev:typebox`, `cognition:solution-design` (design-phase alternatives), `cognition:testing-design` (behavior-bar test design), `habitat:workstream-review-loops`, `codex:codex-cli-runtime` + `codex:rescue` (independent second reviewer), `dev:pr-comments`, `nx:nx-generate`, `dev:turborepo` (n/a — repo is Nx; noted to avoid cargo-culting).

## 5. Open questions ledger (frame §5 → investigation state)

| # | Question | State |
|---|---|---|
| Q1 | Extraction manifest + per-component tiers | **ANSWERED — [LEDGER.md](./LEDGER.md) frozen 2026-07-01**: 38 clean / 6 moderate / 2 app-shaped (AppHeader + PipelineStage); 4 build slices + 4 adversarial verifies (all verified=true) + coherence adjudication; 25-module shared-kernel ownership map; 4 escalations E1–E4 reserved to Matei |
| Q2 | Package name / location / publishing policy | **reserved to Matei** — added facts: naming split `@swooper/*` (mapgen domain) vs `@civ7/*` (infra); no `kind:ui` tag in the enforced Nx boundary taxonomy (new tag = formal taxonomy revision, or fit `kind:foundation`); zero peerDependencies exist anywhere in the workspace (React peer-dep precedent is ours to set) |
| Q3 | Dependency policy re `@civ7/studio-server` | evidence in: 2 bare type-only imports (GameConsole, RecipePanel) + 1 `/contract` type-only (PipelineStage) + **runtime value deps one hop behind GameConsole/RecipePanel** (`features/mapConfigSave/status.ts`, `features/runInGame/status.ts` value-import contract phase tables) and two hops behind AppHeader (`setupConfig.ts`). Props also leak server types (`GameConsoleProps`, `RecipePanelProps`). **Ledger correction: the status-module runtime drag is SEVERABLE** — the only contract value uses are dead import+re-export lines with zero consumers (grep-confirmed); remedy = split-formatters (type-only), so only the E1 `.d.ts` policy decision remains |
| Q4 | Build recipe | evidence in: converter consumes only CSS + fonts + `.d.ts` tree + (future) real ESM entry — all standard tsup/vite-lib outputs EXCEPT the bespoke dark-default `:root` + `.light` CSS artifact (must be deliberately authored) and the Tailwind v4 content-scan scope (package CSS must cover story/preview-only utilities). House exemplar: tsup ESM + `--dts`, exports map w/ `types` (the `types` barrel is also what retires the `synthEntry` fork). Tailwind v4 has NO `@source` precedent in-repo |
| Q5 | Storybook topology | evidence in: `.storybook/` is app-hosted, viteFinal hand-mirrors app aliases; preview.tsx ties: index.css (needed by all), TooltipProvider (8 stories), Toaster (1), QueryClient stub (needed by ZERO stories), `resetStudioStores` (**the one un-movable import; its invariant is vacuous for the 46** — no storied component reads stores). Stories: CSF3, alias-only imports, zero per-story decorators/parameters. SB 9.1.20, addon-docs only |
| Q6 | Sync end-state shape | strong prior: stay `storybook`; **anchor survives** a same-shape re-point (changed:[46], not anchor loss) — a shape flip to `package` would discard the anchor (`shape_changed`). Config-only repoint verified sufficient (pkg/entry/cssEntry/buildCmd + delete fork/libOverrides + storyImports.shim update); `cfg.tsconfig` + `docsMap` resolve PKG_DIR-relative (silent breakage on move — must re-point) |
| Q7 | Theme distribution | evidence in: single live stylesheet `src/index.css` (:root light 76–113, `.dark` 115–146, `@theme inline`, 27 color tokens + text-data/text-label type scale used in 35 files); runtime = class on `<html>` (index.html pre-paint script + StudioProviders writes both classes; SB decorator toggles `.dark`); exactly 2 convention-agnostic readers: `useResolvedTheme` (DeckCanvas + PipelineStage) and a **byte-equivalent private duplicate** in sonner.tsx (`useThemeFromClass`) — unify. `.custom-scrollbar` + tw-animate-css utilities must travel with the package. index.html flash-guard keeps hardcoded hex copies (documented manual-sync) |
| Q8 | `.design-sync/` metadata migration | evidence in: 25 overrides are card-rendering-only (carry as-is); `docsMap` inert for grouping (story titles are the authority — keep titles verbatim to preserve DS-pane identity); NOTES.md is append-only with superseded bullets (read bottom-up); AUTHORING-BRIEF.md describes the retired package-shape pipeline (not a runbook); `.design-sync/previews/` is empty (zero owned previews — no `@ds-stories` path rewrites needed!); `storyImports.shim` patterns are app-path-specific and must be updated on re-point |
| Q9 | v3-style Tailwind imports liveness | **ANSWERED: dead.** `src/ui/index.css` has zero importers ever (`git log -S` verified), and `tailwindcss/base|components` are unresolvable subpaths in installed tailwindcss@4.3.0. Delete the whole file (it's the Magic Patterns prototype stylesheet). Also stale: `system.md:54` Google-Fonts claim |
| Q10 | Buyable incrementality improvement | **REFRAMED with evidence**: the frame's "any shared CSS change de-incrementalizes all 46" is FALSE for grading (grades/captures carry; styleSha is upload-partition-only). The real cost axis: any styleSha/bundleSha12 flip forces the full 46-card chromium render-check + whole-surface re-upload — and full-writes-per-upload is skill doctrine anyway. Improvement question becomes: is the render-check tiering (skip/sample/full in resync.mjs) already the designed path? Likely yes — document rather than build |

## 5a. Grounding corrections to the frame (to surface to Matei — none block; frame anticipated the prior being incomplete)

1. **Incrementality axis** (Q10 above) — the bug class is real but lives on render-check+upload, not grading.
2. **Coupling prior undersold**: three composites carry *runtime* contract deps 1–2 hops out (Q3 above); the "exactly 2 type-only imports" claim holds only for the bare specifier.
3. **`componentSrcMap` values are dead** under storybook shape (key set = subcomponent-root pins only); story titles are the real manifest+grouping authority.
4. **`buildCmd` is declarative** — no `.ds-sync` script executes it; deleting `build-inputs.sh` is config+runbook change, zero converter code.
5. **The `source-storybook.mjs` fork exists only because the app publishes no `exports`/`types`** — a real package with a `types` barrel retires the fork (its deletion re-keys all 46 grades — one-time, coincides with the move's own re-key).
6. **Fresh grounding gifts**: zero owned previews exist (no `@ds-stories` migration); the app worktree needs `bun install` before typechecks; `.ds-sync/` is committed-vendored in this repo (NOTES' "ephemeral" claim is stale); Chromium via `DS_CHROMIUM_PATH` (Homebrew wrapper is stale); `[RENDER_BLANK]` on bare form controls is a known false positive.

## 5b. Clean-package defect inventory (from grounding; per-component detail in LEDGER.md)

- Two divergent `cn()` implementations: `src/lib/utils.ts` (extendTailwindMerge, registers `text-data`/`text-label` — load-bearing) vs `src/ui/utils/cn.ts` (plain twMerge; used by DisclosureHeader/EmptyState/ViewControls — exposed to the clobbering bug). Unify on the extended one; delete the plain one.
- `sonner.tsx` ships a private byte-equivalent duplicate of `useResolvedTheme`'s DOM logic (`useThemeFromClass`) — symptom of unsettled dependency direction between the two component trees; unify in the package.
- `cva`, `clsx`, `tailwind-merge` declared at `"latest"` — pin for the package.
- `src/ui/index.css` dead (delete); `--animate-pulse-subtle` token+keyframes have zero users; two dead prototype token names (`--color-border-secondary`, `--color-text-muted`) survive only as `.custom-scrollbar` repointers.
- `ui/components/index.ts` barrel omits StageViewTabs and OptionSelect (consumers deep-path them); `ui/utils` barrel over-drags config.ts+formatting.ts into three composites.
- `src/features/configOverrides/` must split: 4 component files are import-clean, but `configBuilders.ts` in the same dir is app plumbing (value-imports @swooper/mapgen-core) consumed by app hooks/stores.
- Props leak server types: `GameConsoleProps`, `RecipePanelProps` reference `@civ7/studio-server` types in the public API.
- `@rjsf/core/lib/components/Form.js` deep subpath import (the CSP fix from #1993) — a published package must pin/document or wrap it.

## 6. Sequencing

1. **Grounding** (running): 6 parallel readers → reports in session scratchpad → distilled here.
2. **Classification ledger** ✅ (2026-07-01): 4 builders → 4 adversarial verifiers (verified=true ×4) → coherence judge; frozen as [LEDGER.md](./LEDGER.md) with the evidence corpus in [ledger/](./ledger/). Binding adjudications supersede raw build rows (LEDGER §3).
3. **Design** ✅ (2026-07-01): 4 parallel designers (reports in [design/](./design/)) → synthesis [DESIGN.md](./DESIGN.md) with 9 cross-axis adjudications → 3-lens adversarial review (27 findings incl. 2 blockers, ALL folded; record: [design/review-findings.md](./design/review-findings.md)) → OpenSpec change `studio-ui-extraction` validates strict. Q4/Q5/Q6 ANSWERED (tsup+strict-tsc+tailwind CLI; package-hosted SB; same-shape config-only repoint, anchor survives). **Next gate: Matei checkpoint (DESIGN §4).**
4. **Execution**: one change set per Graphite branch, stacked; implementation fan-out where independent; review fan-out + Codex second-reviewer on substantial diffs.
5. **Verification**: package build green (no TS7056 tolerance), app rewire renders identically (oracle), full 46 re-verify via resync driver locally; light-render canary decision (frame §2).
6. **Close-out**: DoD walk (frame §2) with evidence; Matei go-ahead → re-sync upload of `531d158d`; runner worktree move-up + relaunch.

## 7. Decisions record

- **D1 (2026-07-01):** Workstream branch/worktree topology: single stack rooted at `studio-ui-extraction` (docs/grounding artifacts first branch; subsequent change sets stack on it).
- **D2 (2026-07-01):** Matei's clean-package directive recorded (§2 above) as the governing interpretation of the frame's behavior bar.
- **D3 (2026-07-01, Matei checkpoint):** Q2 = `@swooper/mapgen-studio-ui` at `packages/mapgen-studio-ui`; E2 = options-via-props (data app-side); E3 confirmed; E4 = redesign now. Full record: DESIGN.md §4a.
- **D4 (2026-07-01, Matei checkpoint):** E1 REDIRECTED — the studio server becomes a fully contained boundary shipping its own types (no client-maintained twins, no clients reaching in; "every package fully contained"). oRPC/Effect-oRPC contract-first investigation → plan at design/e1-contract-boundary.md; gates B1. **RESOLVED by D5.**
- **D5 (2026-07-01, Matei):** **E1-C APPROVED** ("Approve E1-C (Recommended)") — extract `@civ7/studio-contract` (`packages/studio-contract`, `kind:foundation`) as precursor branch B0: ~15 files (the 8 `src/contract` modules + pure closure) move out of `packages/studio-server`; the effect-orpc merge stays in the server's thin `./contract` subpath; server `implementEffect`s the identical contract; UI package `import type`s the contract (no twins, no parity fence — the dist grep is the fence); ~18 app import sites repoint. Full plan: [design/e1-contract-boundary.md](./design/e1-contract-boundary.md); folded into DESIGN.md §4a + the openspec change (tasks §0b).
- **D6 (2026-07-01, Matei):** deferral — **server-exported client factory**. `@civ7/studio-server` should ship a runtime-light `./client` subpath exporting a preassembled typed client factory (RPCLink + `createORPCClient`, typed `ContractRouterClient<StudioContract>`), so no consumer hand-assembles its client (today the app's one seam is `apps/mapgen-studio/src/lib/orpc.ts`, kept verbatim in B0). ADDITIVE to E1-C, not a replacement: the UI package still needs a foundation-tier home for its DTO/prop types (type-only imports count in the boundary lint), the browser needs contract runtime VALUES (`RUN_IN_GAME_PHASES`, normalizers, status schemas), and the design-sync converter needs a dependency-clean `.d.ts` tree — all owned by `@civ7/studio-contract`. Out of scope for this workstream; queue as a follow-up initiative.
- (open) D7+: further decisions land here with reasons.

## 8. Risks / falsifier watch (frame §9 live tally)

- Tiering prior wrong (components reading stores/clients) → **SETTLED clean**: zero store/orpc/query readers among the 46 (all props-driven); prior "~1 app-shaped" undercounted by one (AppHeader's grade is earned — verify-composites), otherwise 38/6/2 matches the plan.
- Package build can't feed the sync contract → **contract fact #2 strongly suggests the opposite**; still verified end-to-end before design freezes.
- Drift beyond portal-dialog class at re-verify → stop-and-diagnose.
- Wrapper/shim accretion during rewire → boundary is wrong; redraw, don't shim (reinforced by D2).
- Sync slower/less verified post-extraction → back up and redesign.
