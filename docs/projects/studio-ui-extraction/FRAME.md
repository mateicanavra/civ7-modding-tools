# FRAME — MapGen Studio UI Library Extraction

**Status:** frame (defines the work; deliberately not a plan)
**Date:** 2026-07-01
**Decision-holder:** Matei
**Downstream owner:** the extraction workstream agent (kickoff prompt lives beside this file)

This document frames a workstream: why the work exists, what done looks like, what is already known and must not be rediscovered, what is deliberately unknown and is the team's to discover, and the constraints that bound every decision. It prescribes outcomes and invariants, not steps. Where it is silent, the workstream owner decides. Where it reserves a decision, Matei decides. If evidence contradicts something stated here, surface the contradiction — do not silently comply with the frame, and do not silently ignore it.

---

## 1. Why this work exists

MapGen Studio (`apps/mapgen-studio`) is a Vite React app for building Civ7 maps. Its UI surface — 46 components — is synced to a Claude Design project ("Civ7 MapGen Studio", id `531d158d-a7f6-41cb-87a4-f0f8a5e521b0`) so a design agent can produce on-brand designs made of the real components, mapping 1:1 onto shippable code.

The sync consumes a published-package shape: compiled JS bundle, real CSS, `.d.ts` contracts, per-component cards. The app is not a package, so today a shell script (`apps/mapgen-studio/.design-sync/build-inputs.sh`) reverse-engineers that shape from the app's Vite build: it copies a hashed `dist/assets/index-*.css`, splices theme blocks with positional text surgery, and emits best-effort `.d.ts` via a side tsconfig while tolerating a pre-existing type error (TS7056 in `src/lib/orpc.ts`).

That approach already produced a shipped bug class: the light palette was silently dropped and the uploaded design system rendered dark-only for weeks — invisible to the verification gate because the gate also only rendered dark. Guards were added after the fact (`assert_theme_block` fails loud, stale-dist refusal), but guarding a text-surgery script treats symptoms. The root problem is that the synced artifact is a hand-made imitation of a build product.

**The work: make the imitation real.** Extract the synced component surface and the token/theme layer into a standalone workspace package with a genuine build — real `dist/`, generated `.d.ts`, an `exports` map, a CSS entry, and a home for the 46 stories (Storybook topology deliberately open — §5). The app consumes the package; the sync consumes the package; they are the same artifact. The "reconstruct a fake dist from an app" bug class becomes structurally impossible.

## 2. Desired outcome (definition of done)

- The design-synced component surface and the token/theme layer live in one standalone workspace package with a real build: `dist/`, accurate generated `.d.ts` (the TS7056 tolerance is gone), an `exports` map, a CSS/token entry.
- `apps/mapgen-studio` imports the package; the app renders and behaves identically, gated by the existing verification machinery (§6), not by assertion.
- The design sync builds from the package's real artifacts. `build-inputs.sh`, `tsconfig.dts.json`, and the rest of the reverse-engineering scaffolding are **deleted** — not bypassed, not kept as fallback.
- Design project `531d158d` is re-synced from the new shape and all 46 components re-verify — the four portal dialogs via the manual-verification path used for PR #1992 (§3), not by forcing recapture. The design agent's `explorations/` and `scraps/` survive untouched.
- The theme layer is single-sourced: one token entry consumed by the app, Storybook, and the sync, with the light/dark `:root` inversion owned as a deliberate, tested design decision instead of manufactured by text surgery (mechanics in §4; convention choice in §5).
- The sync is CI-runnable from the package build (in this repo that means an Nx target; §8 covers the `project.json` collision).
- The fidelity gate can exercise both theme modes (a light-render canary), or the team has recorded a deliberate decision not to add one — either way, the dark-only-gate blindspot (§4) stops being a silent failure mode.
- Incrementality has improved or has a designed path: today one shared bundle + one shared `styleSha` de-incrementalizes all 46 components on any shared CSS/dep change, which makes every re-sync expensive.

## 3. Explicit non-goals

- **No live/bidirectional sync.** The DesignSync tool is batch-publish (`finalize_plan` → `write_files`/`delete_files`); that is the tool's contract, not a defect this workstream can fix.
- **Not a fix for the portal-dialog capture limitation.** Four Radix dialogs (`Dialog`, `PresetConfirmDialog`, `PresetErrorDialog`, `PresetSaveDialog`) hard-fail forced recapture with `sb-error: "no storybook root content"` because their stories render in the open state (`open: true` / `defaultOpen`) and portal everything out of `#storybook-root`. That is a Storybook-oracle issue, orthogonal to extraction. (If a cheap in-root-container story fix falls out naturally, take it — but it is not a gate.)
- **Not a redesign of the components.** This is a boundary move with a fidelity gate. Behavior improvements are allowed under the rules in §6, but visual/API redesign is out of scope.
- **Not a general design-system program.** One package, one consumer app, one sync pipeline.

## 4. What is known (hard-earned; do not rediscover)

### The sync surface (verified 2026-07-01, worktree `wt-mapgen-studio-theming`)
- `apps/mapgen-studio/.design-sync/config.json`: `shape: "storybook"`, pinned `projectId 531d158d-…`, `storybookConfigDir: .storybook`, curated synth entry `.design-sync/ds-entry.tsx`, `componentSrcMap` — the **authoritative, hand-enumerated 46-component manifest** (name → source path; unlisted components silently don't sync, and every entry's path changes in this extraction), `docsMap` (inert for path-derived groups — verify before porting), 25 per-component overrides, `provider: TooltipProvider` (tooltip-using previews render a silent blank cell without it), `buildCmd: bash .design-sync/build-inputs.sh`, `cssEntry: dist/assets/_ds-compiled.css`.
- Vendored converter scripts: `apps/mapgen-studio/.ds-sync/` (`resync.mjs` driver: build → diff → validate → capture; `package-build.mjs`; `storybook/compare.mjs`). `.design-sync/NOTES.md` (28KB) holds accumulated corrections — read it early.
- The uploaded bundle: 46 component cards in 5 groups (primitives 16, composites 13, forms 11, panels 4, layout 2). The 46 CSF stories under `src/` are the screenshot fidelity oracle; the sync grades preview-vs-storybook pairs.
- Re-sync cost is O(46) and structural: single bundle, single `styleSha`. Any shared CSS change re-fingerprints everything.
- Upload mechanics: batch-publish, ≤256 files per write, sentinel fencing, `deletes: []` preserved `explorations/` + `scraps/` on the last upload. The project now contains the design agent's own outputs — readable back via `get_file`; that manual round-trip (design agent explores → we harvest into code) is a capability to preserve.
- The upload format itself (cards, `.d.ts`, `.prompt.md`, bundle, styles `@import` closure, `_ds_sync.json` anchor) is fully specified in the bundled `design-sync` skill — the format is the **contract**; the package is a better path to it, not a new contract.

### Theming
- The studio is dark-first at runtime (the default theme users see) but light-default in CSS authoring: `src/index.css` `:root` = the full hand-tuned light palette, `.dark` = the dark override. The uploaded bundle inverts this (dark `:root` + `.light`), and today that inversion exists only inside `build-inputs.sh` — it is part of the text surgery this workstream retires.
- The dark-only verification blindspot: the Storybook gate renders dark and grades against dark, so a broken light theme ships silently. A light-render canary is a wanted (unbuilt) guard — extraction is the natural moment to add one.
- `useResolvedTheme()` (`src/ui/hooks/useResolvedTheme.ts`) reads the theme actually on `<html>` and is robust to both class conventions. `PipelineStage` depends on it.

### Coupling audit (spot-verified 2026-07-01)
- Component homes: `src/components/ui/` (shadcn primitives, ~15 + stories), `src/features/configOverrides/` (rjsf widgets/templates), `src/features/presets/` (`PresetDialogs.tsx`), `src/ui/components/` (~12 composites + `fields/`) — plus 3 presentational shells in `src/app/` (`ErrorBanner`, `LeftDock`, `RightDock`; verified import-clean) and `PipelineStage` (below).
- **Zero** store/query/client coupling in those homes (no zustand/orpc/tanstack imports). Exactly **2** `@civ7/studio-server` imports there, both type-only (`GameConsole.tsx`, `RecipePanel.tsx`) — tractable; a types-only dev/peer dependency is one option, but the package's dependency policy is the team's to design (§5).
- `PipelineStage` lives *outside* the homes (`src/features/recipeDag/PipelineStage.tsx`); presentational, props-driven, type-only imports from `@civ7/studio-server/contract` and from `./useRecipeDagQuery`; its data hooks stay in the app. It also calls `useResolvedTheme` — a boundary decision, not a blocker.
- The real "moderate" knot: `AppHeader.tsx` imports domain functions from `src/features/civ7Setup/setupConfig.ts` (~305 lines of game-setup domain logic with **value** imports from `@civ7/studio-server/contract`). That logic must be relocated or injected — it must not ride into a UI package.
- Prior tiering (~38 clean / ~5–7 moderate / ~1 app-shaped) is a spot-checked prior, good enough to frame scope. It is **not** the classification ledger — the team builds that (§5).

### Repo conventions
- Bun workspaces (`apps/*`, `packages/*`, `packages/plugins/*`, `mods/*`, `tools/*`) orchestrated by **Nx** (root `nx.json`; per-package config inline under a package.json `"nx"` key). `apps/mapgen-studio/project.json` does **not** exist on main — the habitat lane owns introducing it (§8).
- Package build convention: **tsup** (`mapgen-viz` is the simplest exemplar: `tsup src/index.ts --format esm --dts`, private, single-entry exports; `mapgen-core` shows the multi-subpath exports pattern). A bespoke `bun-source` exports condition (source-run for the dev daemon) exists in 4 server-side packages — decide deliberately whether a UI package needs it; do not cargo-cult it.
- **No precedent** for a workspace package that ships CSS, a Tailwind preset, or its own Storybook. This package sets that convention — expected, not a smell.
- The app is Tailwind **v4 CSS-first** (`@import "tailwindcss"`, `@theme inline`, no `tailwind.config.*`). Note: `src/ui/index.css` still carries v3-style `@import "tailwindcss/base|components|utilities"` lines of unverified liveness (§5).
- Package naming is genuinely mixed (`@civ7/*` dominant; `@swooper/*` for the mapgen family; `@mateicanavra/*` for the two npm-published packages) — naming is reserved to Matei (§5).
- OpenSpec tooling is live in-repo: root `openspec/` (`changes/`, `specs/`, `config.yaml`), `bun run openspec` / `openspec:validate`, `@fission-ai/openspec`.

### The bug-class lesson (the "why" behind the whole workstream)
Hand-rolled positional text surgery that returns empty on any refactor, behind `set -euo pipefail` that can't see an empty pipe; a dark-only capture gate that cannot detect a broken light theme. Generalized: **never treat a silent-empty transform as success, and a gate that only looks at one rendering mode can only verify that mode.** The extraction succeeds when neither failure is expressible anymore.

## 5. What is deliberately unknown (the team's investigation — do not fill these by assumption)

- **The extraction manifest.** Derive the real per-component ledger from `componentSrcMap` + the ds-bundle groups, classify each component's coupling tier with evidence, and get it reviewed. The §4 audit is a prior, not the ledger.
- **Package name, location, and publishing policy** (workspace-private vs npm registry). Surface options with trade-offs to Matei; do not decide unilaterally.
- **Package dependency policy.** May the UI package type-depend on `@civ7/studio-server`, or should those few types be vendored, re-declared, or injected? Small surface (2 imports), but it shapes the public API.
- **The build recipe for a CSS-shipping React package**: tsup vs Vite lib mode; how Tailwind v4 utilities are compiled for the package's own dist vs consumed by the app's build; whether the package ships compiled CSS, source CSS, or both; how fonts travel. No in-repo precedent exists — design it, and let the design-sync contract (real bundle + real CSS closure) be a forcing function.
- **Storybook topology**: package-owned Storybook vs the app's Storybook importing the package, and what happens to the app-context bits in `.storybook/preview.tsx` (theme toolbar/decorator, stub QueryClient, `resetStudioStores()`, Toaster). The 46 stories are the fidelity oracle — wherever they live, the oracle must survive the move.
- **Design-sync end-state shape**: keep `shape: "storybook"` pointed at the package's Storybook, or move to the package shape now that a real package exists. Read both shape sub-skills of the `design-sync` skill before choosing (§7 contacts say where that skill lives); the chosen shape must preserve the verified-screenshot gate.
- **Theme distribution**: whether `useResolvedTheme` moves into the package (PipelineStage needs it) or theme becomes injected; which class convention the package canonicalizes and how the other is derived (see §2 — the inversion becomes a designed artifact).
- **Migration of `.design-sync/` metadata**: how `docsMap`, `groups/`, `overrides`, and NOTES.md content map onto the package world.
- **Liveness of the v3-style Tailwind imports** in `src/ui/index.css` — verify, then keep or delete with evidence.
- **What incrementality improvement is actually buyable** (bundle partition? per-group styleSha? batch additions?) — investigate against the converter's real mechanics; do not promise beyond what `resync.mjs` supports.

## 6. Constraints and invariants

- **The upload format is the fixed contract.** Everything upstream of it may change; the format may not. Validation (`package-validate` clean) and screenshot-verified grading do not move.
- **The design project is sacred ground.** Never mint a new project; `531d158d` is pinned. Never delete `explorations/` or `scraps/`. Uploads are plan-approved and scoped.
- **Fidelity gate over assertion.** Every "renders identically" claim goes through the oracle (stories + compare + re-verify of all 46). A drift that isn't the known portal-dialog class is a stop-and-diagnose event — it is information about hidden coupling, never noise to re-grade around.
- **Behavior bar**: parity is the baseline, but do not encode bad practices the current code happens to contain. Where a behavior improvement is clearly right *and testable*, make it — and design the test first. Tests target behavior, not structure; structural hygiene belongs to lint (Habitat), not to tests.
- **Classification before structure.** No target interfaces, no file layout, no package API until the classification ledger exists and has been reviewed. The point is to avoid enshrining accidental complexity as authoritative architecture.
- **Standard-issue stance.** This is a normal React component-library extraction inside a normal TypeScript monorepo. Nothing here is special-case; where something genuinely is, that is a discovery to surface loudly — not a pattern to quietly entrench.
- **One owner at the end.** If the work starts growing compatibility shims, dual paths, or "temporary" re-exports to keep both worlds alive, the shape is wrong. The end state has exactly one home for these components.
- **Lane discipline**: new Graphite branch + dedicated worktree off `main`; never touch foreign `codex/*` or habitat lanes (read-only is fine); check `git diff --cached` before every commit (worktrees are shared with other lanes); submit finished branches as **draft** PRs (`gt submit --draft --no-interactive`, confirm `gt parent` = main, set title/body via `gh pr edit`); commit footer `Co-Authored-By:` per repo convention and PR-body footer `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

## 7. The team: how this gets worked

This workstream is run by one **owner agent** who fans out sub-agent teams at every stage of the work (illustratively: investigation, design, implementation, review, polish — the stages themselves are the owner's to define). Two anchors define how that team operates:

- **Prompt design.** The owner designs every sub-agent brief deliberately: each brief frames (lens, focus, falsifier, pointers) rather than carrying detail dumps or pre-assigned steps. Sub-agents inherit the curated skill pack, not the owner's whole context.
- **The design-sync context.** The team exists inside the story in §1: months of design-sync work built the 46-component surface, the Storybook oracle, and the verification discipline. The extraction serves that pipeline. Any design choice that makes the sync weaker (less verified, less deterministic, less incremental) is wrong even if the package is elegant.

**Capability gathering is the team's first job**, not something this frame pre-decides. The owner introspects the installed skill plugins (dev, cognition, habitat, nx, vercel, codex; `meta:introspect` enumerates them) and assembles a curated skill pack — split into core skills read in full vs entry points navigated on demand. Likely coverage — to be confirmed and extended by introspection, not trusted from this list: systematic-workstream execution, TypeScript refactoring and package/API design, structural code-quality review, Graphite/worktree mechanics, the `design-sync` skill (read **both** shape sub-skills; the contacts list below says where it lives), Vite/Storybook, React best practices, and Nx.

**Contacts — where knowledge lives:**
- This frame, and the memories/PRs it distills (PRs #1991 workbench, #1992 storybook-shape flip, #1993 TypeBox validator, #1994 theming coherence).
- `apps/mapgen-studio/.design-sync/` — `config.json`, `NOTES.md`, `AUTHORING-BRIEF.md`, `conventions.md` (the accumulated operational truth of the sync).
- `apps/mapgen-studio/.ds-sync/` — the converter itself; read it before proposing to change what it consumes.
- The `design-sync` skill — bundled with the **DesignSync tool itself**, not with any installed plugin: load the DesignSync tool and the skill surfaces with it (plugin introspection will not find it). It specifies the upload-format contract and both sync shapes.
- The design project (`https://claude.ai/design/p/531d158d-a7f6-41cb-87a4-f0f8a5e521b0`) — including `explorations/`, the downstream consumer's own voice.
- Review capacity: Claude review agents, `review-code-quality`-style structural review, and Codex review/rescue as an independent second reviewer.
- **Matei** — decision-holder for: package naming/publishing policy, scope changes, anything that contradicts this frame, and anything outward-facing (uploads to the design project).

The team writes its **own** workstream frame/record under `docs/projects/studio-ui-extraction/` (repo convention: `FRAME.md` + `workstream-record.md`-style artifacts; see `docs/projects/habitat-harness/` for the pattern) before any execution. Context gathering, skill building, and classification are readiness work — not license to start changing code.

## 8. Sequencing and environment

- **Precondition:** the studio Graphite stack — #1991 → #1992 → #1993/#1994, all currently open drafts — must land on `main` before this workstream branches. Extraction off a main that lacks the Storybook workbench, the storybook-shape sync, and the theming fix would fork the very surface being extracted. If the stack has not landed, stop and say so.
- **Nx collision:** `apps/mapgen-studio/project.json` does not exist on main; the habitat lane owns introducing it. The CI `design-sync` target this workstream wants must **compose with** that file, not race it. A target invocation was sketched during the design-sync work (running `resync.mjs` against the app shape) but never landed anywhere in the repo — treat it as lost and derive the CI target fresh against the package.
- **After any Studio landing** — the precondition stack *and* this workstream's own stack at close-out — the parked studio runner worktree (find it via `git worktree list`) gets moved up to the new tip (detached) and relaunched via `scripts/restart-mapgen-studio.sh --no-build` — standing preference, cheap, easy to forget.
- A Civ7 game update can silently disable the deployed mod; irrelevant to this workstream except as a reminder that "Run in Game" failures during testing may be environmental.

## 9. Falsifiers — how we'd know this frame is wrong

- Classification finds components that read stores/clients directly → the tiering prior is wrong; re-scope before designing anything.
- A real package build cannot produce what the sync's contract needs (esbuild-consumable ESM + a single coherent CSS closure) → the "package is a better path to the same contract" premise fails; redesign rather than force.
- Re-verification shows drift beyond the portal-dialog class → hidden coupling the audit missed; the manifest and tiering need revisiting.
- The app rewire needs a growing pile of wrappers/shims to compile → the package boundary is drawn in the wrong place.
- The sync gets *slower or less verified* post-extraction → the workstream has optimized for package elegance over its actual purpose; back up.

## 10. Pointers

| What | Where |
|---|---|
| Sync config + manifest (46) | `apps/mapgen-studio/.design-sync/config.json` (`componentSrcMap`) |
| Operational notes (read early) | `apps/mapgen-studio/.design-sync/NOTES.md` |
| The script to delete | `apps/mapgen-studio/.design-sync/build-inputs.sh` (+ `tsconfig.dts.json`) |
| Converter / re-sync driver | `apps/mapgen-studio/.ds-sync/resync.mjs` (+ `package-build.mjs`, `storybook/compare.mjs`) |
| Fidelity oracle | 46 `*.stories.tsx` under `apps/mapgen-studio/src/` + `.storybook/` |
| Token source | `apps/mapgen-studio/src/index.css` (`:root` light ~76–113, `.dark` ~115–146) |
| Theme resolver | `apps/mapgen-studio/src/ui/hooks/useResolvedTheme.ts` |
| The moderate knot | `src/ui/components/AppHeader.tsx` ← `src/features/civ7Setup/setupConfig.ts` |
| The app-shaped edge | `src/features/recipeDag/PipelineStage.tsx` |
| Package exemplars | `packages/mapgen-viz` (simple tsup), `packages/mapgen-core` (multi-subpath exports) |
| OpenSpec | `openspec/` + `bun run openspec:validate` |
| Design project | `https://claude.ai/design/p/531d158d-a7f6-41cb-87a4-f0f8a5e521b0` |
| Prior art PRs | #1991, #1992, #1993, #1994 (draft stack, landing precondition) |
