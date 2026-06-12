# Recipe DAG → Studio Redesign Handoff Spec

**Audience:** the agent owning the MapGen Studio redesign lane (`design/mapgen-studio-redesign` stack).
**Trigger:** the recipe-DAG visualization stack merged to main (PRs #1587–#1591, 2026-06-12). Your next restack onto main will pick it up.
**Owner intent (verbatim spirit):** the DAG capability should land in the redesigned Studio as a **properly designed feature — an additional tab that shows the recipe DAG** — not as a port of the pre-redesign chrome. Treat the merged code as the *semantic source of truth*; rebuild the *surface* in the redesign's design language.

## 1. What merged (footprint on main)

Five commits, 38 files, ~4,400 insertions. All paths relative to repo root:

| Layer | Paths | Disposition for you |
| --- | --- | --- |
| **Projection contract** | `packages/mapgen-core/src/authoring/recipe-dag.ts` (+ `authoring/index.ts` export, `test/authoring/recipe-dag.test.ts`) | **Preserve as-is.** Public authoring API. |
| **Studio-local server** | `apps/mapgen-studio/src/server/recipeDag/` — `service.ts`, `router.ts`, `contract.ts`, `schema.ts`, `orpc.ts`, `procedure.ts`, `context.ts`, `errors.ts`, `typeboxStandardSchema.ts` | **Preserve as-is.** Effect-oRPC, read-only. |
| **Transport constant** | `apps/mapgen-studio/src/shared/recipeDagOrpc.ts` (`STUDIO_RECIPE_DAG_ORPC_PATH = "/api/recipe-dag/rpc"`) | **Preserve.** |
| **Vite dev mount** | `apps/mapgen-studio/vite.config.ts` — middleware that `ssrLoadModule`s `src/server/recipeDag/orpc.ts` and serves the oRPC path | **Preserve** (re-home if your lane restructures the dev server, keep the path contract). |
| **View semantics** | `apps/mapgen-studio/src/features/recipeDag/` — `layout.ts`, `domainPresentation.ts`, `artifactPresentation.ts`, `client.ts` | **Preserve the modules**; they are pure/headless and UI-framework-light. |
| **View chrome** | `apps/mapgen-studio/src/features/recipeDag/RecipeDagView.tsx` + hooks in `App.tsx` (+105 lines), `ui/components/AppHeader.tsx`, `ui/components/ViewControls.tsx`, `ui/constants/layout.ts` | **Re-express in redesign language.** This is the "old shell" — do not preserve its look or its mount points. |
| **Tests** | `apps/mapgen-studio/test/recipeDag/` — `RecipeDagView.test.tsx`, `layout.test.ts`, `domainPresentation.test.ts`, `artifactPresentation.test.ts`, `orpc.test.ts`; `packages/mapgen-core/test/authoring/recipe-dag.test.ts` | **Behavioral pins.** Keep green; `RecipeDagView.test.tsx` asserts render *semantics* (selection, labels, focus), so port its assertions onto your new tab component rather than deleting it. |
| **Docs / OpenSpec** | `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` (projection section), `openspec/changes/mapgen-recipe-dag-visualization/` | History + reference; no action. |

## 2. The semantic core (what the feature *is*)

These are the invariants the redesigned tab must keep. Everything else is negotiable.

1. **Projection contract.** `buildRecipeDag(stages)` in mapgen-core projects a recipe's stage contracts into `RecipeDag`: phases → stages → steps, artifact `requires`/`provides` refs, artifact edges (`from`/`to` endpoints, `internal` flag), and **diagnostics** (`artifact-provider-missing`, `artifact-provider-duplicate`, `artifact-consumer-missing`). The DAG is derived purely from explicit artifact contracts — no runtime execution, no time axis.
2. **Server boundary.** The client never imports recipe modules. It calls `recipeDag.get({ recipeId })` over effect-oRPC at `STUDIO_RECIPE_DAG_ORPC_PATH`; the service (`service.ts`) owns the recipe-source registry (currently `mod-swooper-maps/standard` and `/browser-test`). Read-only, typed errors via `errors.ts`. Orchestration stays in the Effect layer.
3. **Layout semantics** (`layout.ts`, pure functions): horizontal axis = **dependency rank** (topological), vertical = **phase lanes** with phase-local stage rows (waterfall cascade per phase, explicitly *not* a time dimension); stable orthogonal edge routing where outgoing edges from a shared source use a **bundled trunk before fan-out**; deterministic collision pass for label fanning (`resolveEdgeLabelPositions`).
4. **Domain presentation taxonomy** (`domainPresentation.ts`): artifact IDs parse into semantic domains — morphology, foundation, hydrology, ecology, climate, gameplay — each with a glyph (incl. local Lucide-compatible Stone/Bolt; hydrology = simple Droplet for distance readability) and **lane fills/accents driven by domain, not phase order** (ecology green, hydrology blue, morphology earth-toned, gameplay violet/electric; light + dark variants). Map artifacts classify by *subject* domain — "map" is not a visual domain.
5. **Artifact label semantics** (`artifactPresentation.ts`): strip only redundant domain prefixes; labels share the same domain glyphs as nodes and lanes (one icon contract across all DAG surfaces); the bundled standard-recipe artifact corpus is covered so nothing falls back to a generic package icon.
6. **Interaction semantics** (currently in `RecipeDagView.tsx` — these survive the re-skin):
   - Stage **selection** is separate from step **expansion**; expansion renders as a compact detail shelf; selected stage click-again unselects.
   - Connector **labels are selectable**: selecting an artifact label activates every connector branch carrying that artifact and its connected nodes; labels are projected **per provided artifact** (split connectors show one label on the shared trunk before fan-out).
   - Focus hides unrelated labels; active stages/labels rise above the graph; idle connectors stay slate/charcoal neutral.
   - Context-aware label placement: idle/source views keep split labels near the trunk split; selecting an incoming destination pulls the label toward that branch.
   - Diagnostics surface on the stage nodes (`diagnosticCount`) and in detail views.

## 3. What to re-express (not port)

- The **tab/view switcher**: old code adds `type StudioView = "map" | "dag"` state in the App.tsx monolith plus buttons in `AppHeader`/`ViewControls`. In your decomposed shell this becomes a first-class **DAG tab** in whatever navigation primitive the redesign uses.
- The **stats bar** (`RecipeDagStatsBar`) and the "compact transparent top shell / right-side toolbox" chrome — redesign-language equivalents, not copies.
- Data fetching: old code lazy-fetches on tab activation keyed by `recipeSettings.recipe`, with idle/loading/ready/error state and cancellation (see the `useEffect` in App.tsx). Keep the *behavior* (fetch on activation, cache per recipe, error surface), re-home it in your state layer.
- `ui/constants/layout.ts` tweaks were shell-metric adjustments for the old chrome; ignore them.

## 4. Restack heads-up (mechanical)

- Your lane is based on pre-DAG main; after restack, **7 files collide**: `App.tsx`, `AppHeader.tsx`, `ViewControls.tsx`, `ui/constants/layout.ts`, `vite.config.ts`, `package.json`, `bun.lock`.
- Materially only **`App.tsx`** matters: your decomposition deletes the ~3,000-line monolith that the DAG client mount (+105 lines) hooks into. Resolution: take your deletion, then **re-mount the DAG feature inside the decomposed StudioProviders/StudioShell tree** as the new tab, per §3.
- `vite.config.ts`: keep the recipe-dag oRPC middleware block (additive, independent of your changes). `package.json`/`bun.lock`: union of deps (DAG side added no heavyweight deps; check `lucide-react` presence).
- `features/recipeDag/*`, `server/recipeDag/*`, `shared/recipeDagOrpc.ts`, mapgen-core files: no collision expected — they are new files your lane doesn't touch.
- Gate: `apps/mapgen-studio` vitest project (37 files incl. 5 recipeDag suites) + `packages/mapgen-core` tests must stay green after your restack. `RecipeDagView.test.tsx` will break when you replace the chrome — port its semantic assertions to the new tab component in the same change.

## 5. Non-goals

- No changes to the projection contract or oRPC schema for the re-skin.
- No runtime/execution overlay (the DAG is static authoring structure; a "live run" overlay is a separate future feature).
- The integration lane (this doc's author) will not touch your stack; sequencing questions go to the operator.

## 6. Execution mandate (operator-granted)

This section states your authority and expected mode of work explicitly, so nothing here has to be inferred.

**What is non-negotiable.** The invariants in §2 and every item this doc marks "preserve" in §1 are hard constraints: the projection contract, the server boundary and transport path, the layout/domain/label semantics, the interaction semantics, and the behavioral pins in the test suites. The §5 non-goals are equally binding. Do not weaken, fork, or re-derive any of these.

**Within those bounds, you own the design.** Step fully into design mode and systemic-analysis mode. You are not being asked to transplant the merged code's shape into your shell — you are being asked to decide, as the owner of the Studio design system, what the most **idiomatic, native** expression of this feature is inside the redesigned Studio, and to build that. Where the merged code's structure and your design system disagree about anything outside the §2 invariants, your design system wins.

**Explicit permissions.** You have operator permission to:

- Integrate the feature properly into the design system you manage — its navigation primitives, state layer, theming, component vocabulary — including making reasonable choices and trade-offs to match what you already have.
- **Modularize** the merged code as you see fit: split, re-home, rename, or re-layer `features/recipeDag/*` modules (keeping their exported semantics intact), introduce whatever internal structure your decomposed shell calls for.
- **Take the time to plan and specify before building.** Up-front analysis, a written design/spec, and staged execution are encouraged, not tolerated.

**Expected workflow.** Execute this systematically, the way the repo's other major effort runs: structure the work as a **workstream**, and use the **OpenSpec workstream** machinery (proposal → design → tasks → workstream/phase records under `openspec/changes/`) to plan, record, and verify it. The merged feature's own workstream at `openspec/changes/mapgen-recipe-dag-visualization/` is both prior art for the format and the record of what the feature committed to; your workstream should reference it. Land the work through your lane's normal stacked-branch discipline with gates green at each step (§4 lists the gate expectations).
