# Habitat Toolkit Stack — Restack Handoff (integrating studio-ui-extraction)

**Audience:** the agent owning the Habitat Toolkit Stack (tip `11dc92211b`). **Trigger:** the studio-ui-extraction stack (PRs #1996–#2006) drains to `main` first; your lane is then the remaining unmerged stack — restack it onto the new post-drain `main`, resolving the 8-file overlap and integrating the studio work without losing either side's intent.

> **The one rule.** Never blindly pick a side on the 8 overlap files. Four of them are delete-vs-modify or full-table conflicts where *both* stacks carry losable intent. **Habitat owns** the projectized task graph + boundary taxonomy + checks. **Studio owns** the extracted `@swooper/mapgen-studio-ui` + `@civ7/studio-contract` packages, their theme single-source, Storybook, and design-sync surfaces. Most conflicts **compose** (Habitat base + Studio delta), not pick-one.

This is the companion to [`STUDIO-REDESIGN-RESTACK-HANDOFF.md`](./STUDIO-REDESIGN-RESTACK-HANDOFF.md) (prior precedent, same directory, mirror genre). Frame per [`REFERENCE.md`](./REFERENCE.md): recover each workstream's **intentional delta**; regenerate generated artifacts rather than hand-resolving them.

### Reference SHAs

| Ref | SHA | What it is |
| --- | --- | --- |
| `main` (authoring time) | `c4ebaf1e1bc8e55888f1a26504858598ac798911` | **PRE studio-drain — NOT your restack base.** The studio stack is not yet an ancestor. After #1996–#2006 land, run `git rev-parse main` yourself; that post-drain tip is what you restack onto, and it will differ from this SHA. |
| studio tip | `4011c4431` | survivor anchor — top of the drained studio stack (`studio-ui-operating-structure`, #2006, +this handoff branch on top) |
| habitat tip | `11dc92211b82fa27bc16787fff5c2884b83c80af` | survivor anchor — top of your stack today |

### Resolution vocabulary (closed set)

| Verb | Meaning |
| --- | --- |
| **UNION** | The two sides' edits are disjoint. Apply both hunks. |
| **COMPOSE** | Take Habitat's version as the base, then re-apply Studio's delta on top. Used where Habitat *restructures* the file and Studio *changes its content*. |
| **CARRY** | One side deletes or moves a file the other side edited. Port that edit's *intent* into the surviving file — never silently drop it, never resurrect the dead path. |
| **REGENERATE** | Generated artifact. Don't hand-merge; compose the sources, rebuild, commit the result. |

`Kind` in §1 is one of: `union` · `compose` · `delete/modify` · `generated`.

---

## 0. What lands on `main` when the studio stack drains

11 branches / PRs #1996–#2006. Only the code branches (B0–B7) can collide with your lane. The docs anchor (#1996) and the trailing package-only branches (#2002/B5, #2005/B8, #2006) touch **none** of your 8 files.

| Body of work | PR · branch | Footprint center | Overlap |
| --- | --- | --- | --- |
| Docs / plan anchor (B0-precursor) | #1996 · `studio-ui-extraction` | `docs/projects/studio-ui-extraction/`, `openspec/changes/studio-ui-extraction/` — all adds | none |
| Contract package `@civ7/studio-contract` (B0) | #1997 · `studio-contract-package` | new `packages/studio-contract/`; studio-server thin `./contract` re-exports; **taxonomy + count pins** | **6 of 8** |
| UI package scaffold + theme source (B1) | #1998 · `studio-ui-scaffold` | new `packages/mapgen-studio-ui/` skeleton; one dark-default `theme.css`; **taxonomy + count pins; vitest project** | 4 of 8 |
| Primitives tier (B2) | #1999 · `studio-ui-primitives` | 16 primitives + lib (cn/useResolvedTheme/LAYOUT) + package `.storybook`; **sonner test deleted (moved)** | 3 of 8 |
| Composites + docks (B3) | #2000 · `studio-ui-composites` | 12 composites + 2 docks into package; app dep prune (clsx/tailwind-merge) | 2 of 8 |
| Forms / RJSF (B4) | #2001 · `studio-ui-forms` | RJSF unit into package; app `@rjsf/*` prune | 2 of 8 |
| Panels + recipe-dag (B5) | #2002 · `studio-ui-panels` | 3 panels + recipe-dag subtree + statusLabels severance | none |
| AppHeader E4a redesign (B6) | #2003 · `studio-ui-appheader` | props-driven AppHeader; app `useSetupControls` container; lucide prune | 2 of 8 |
| Design-sync repoint (B7) | #2004 · `studio-ui-sync-repoint` | design-sync `.design-sync`/`.ds-sync` moved to package; real-dist repoint; app `.storybook` + `build-inputs.sh` **deleted** | 2 of 8 |
| Cleanup wave (B8) | #2005 · `studio-ui-cleanup` | 14 oracle-gated cleanups in package | none |
| Operating structure (templates group) | #2006 · `studio-ui-operating-structure` | `templates/StudioShellLayout` (47th component) | none |

**Overlap concentrates in B0–B4 + B6–B7.** The 4 *hard* conflicts (taxonomy.md, boundary-taxonomy.test.ts, sonnerTheme.test.tsx, app package.json) all originate in **B0–B2**.

---

## 1. The overlap surface — 8 files (single source of truth)

Every file both stacks touch. **This table is canonical**: §5 (per-branch ledger) points here for resolutions; don't resolve from anywhere else. Read the disposition before you open the file — 4 of 8 are traps where a mechanical merge silently drops one side's intent.

| # | Path | Branches | Kind | Disposition |
| --- | --- | --- | --- | --- |
| 1 | `apps/mapgen-studio/package.json` | B0,B2,B3,B4,B6,B7 | compose | **COMPOSE** — Habitat's `project.json` externalization = base; re-apply Studio's dep add/remove; **do not resurrect storybook targets** (see 1a) |
| 2 | `packages/studio-server/package.json` | B0 | union | **UNION** — Habitat nx-block removal + Studio `./live-game` export removal + `@civ7/studio-contract` dep; confirm the generated `project.json` keeps `kind:control` |
| 3 | `vitest.config.ts` | B1 | union | **UNION** — keep both project entries: Studio's new `mapgen-studio-ui` block + Habitat's renamed `habitat` block + `@habitat/cli` alias |
| 4 | `bun.lock` | B0,B1,B2,B3,B4,B6,B7 | generated | **REGENERATE** — compose both package.json + workspace membership, then `bun install`; never textually 3-way-merge (see 4a) |
| 5 | `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts` | B0 | union | **UNION hunks, then DROP** Habitat's dead `storeReset.ts` allowlist entry (see 5a) |
| 6 | `apps/mapgen-studio/test/ui/sonnerTheme.test.tsx` | B2 (delete) | delete/modify | **Studio's delete wins the path; CARRY** Habitat's `.light`/dark-first assertions into the relocated package test (see 6a) |
| 7 | `tools/habitat-harness/test/lib/boundary-taxonomy.test.ts` | B0,B1 | delete/modify | **Habitat's relocation wins the path; CARRY** Studio's +2-package count intent — recompute, do **not** paste `25/24` (see 7a) |
| 8 | `docs/projects/habitat-harness/taxonomy.md` | B0,B1 | compose | **COMPOSE** with Habitat's rewrite as base; re-add Studio's 2 rows in unprefixed style, both `kind:foundation` (verify tag — see 8a) |

### Trap detail

**1a · `apps/mapgen-studio/package.json` — COMPOSE.**
Studio: removes the app-local Storybook surface (`storybook`/`build-storybook` targets + scripts), drops every extracted UI dep (`@radix-ui/*`, `@rjsf/*`, `@fontsource/*`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@storybook/*`), and **adds** `@civ7/studio-contract` + `@swooper/mapgen-studio-ui`. Habitat: deletes the **entire** inline nx block (task config → `project.json`), strips most scripts, relocates `lint:react-compiler` into the `.habitat/` authority tree. → Take Habitat's structural move as the base (inline nx block gone; task config in `project.json`), then re-apply Studio's dependency-graph edits. **Habitat owns WHERE task config lives; Studio owns WHICH deps exist and that Storybook is gone** — so ensure `storybook`/`build-storybook` are **not** carried into the new `project.json` (Studio deleted them; Habitat only relocated task config, it didn't intend to preserve those two targets).

**4a · `bun.lock` — REGENERATE.**
Studio ≈103 ins / 35 del: re-homes UI deps under a new `packages/mapgen-studio-ui` workspace entry, adds contract + ui workspace refs. Habitat ≈28 ins / 16 del: renames `tools/habitat-harness`→`tools/habitat`, `@internal/habitat-harness`→`@habitat/cli`, adds transitive resolutions. → After **all** package.json + workspace membership from both stacks is composed, run `bun install` and commit the regenerated lockfile. Confirm neither side's workspace entries are dropped. `bun.lock`'s branch set is a strict superset of package.json's — it additionally picks up **B1** (scaffold adds the `mapgen-studio-ui` workspace entry), which does not touch `apps/mapgen-studio/package.json`.

**5a · `operationAdoption.test.ts` — UNION with a coupling.**
Studio: single import repoint (`StudioLiveGameEvent`/`StudioOperationEvent`/`StudioOperationsCurrent` now from `@civ7/studio-contract`). Habitat: adds `'apps/mapgen-studio/src/storybook/storeReset.ts'` to an in-test storage-API allowlist (~line 394). The two hunks are disjoint — but **B7 deletes `storeReset.ts`**. After composing, that allowlisted path no longer exists. **Drop Habitat's now-dead allowlist entry**; B7 already made this test pass by deleting the offender (the studio known-failure-set is **7, not 8**). Do not resurrect `storeReset.ts` to satisfy the allowlist. Keep Studio's contract import repoint.

**6a · `sonnerTheme.test.tsx` — CARRY (delete vs modify).**
Studio **deletes** the file: sonner + its theme hook moved into the package, and the test co-locates with the component. Habitat **edits it in place**: light-mode assertions use an explicit `.light` class, and the SSR snapshot flips `data-theme="light"` → `"dark"` (dark-first). → Studio's delete wins *at this path*, but **port Habitat's assertion changes into the relocated `packages/mapgen-studio-ui/test/sonnerTheme.test.tsx`** and make it green. Naive take-delete loses Habitat's theming pins; naive take-modify resurrects a test for a component no longer in the app. This is a **carry**, not just avoid-resurrection.

**7a · `boundary-taxonomy.test.ts` — CARRY (delete vs modify).**
Studio bumps expected counts (`projectCount` +2, `nxProjectCount` +2 = studio-contract + mapgen-studio-ui), file staying at `tools/habitat-harness`. Habitat **deletes** the file at this path — it renamed `tools/habitat-harness`→`tools/habitat`, and the test moved and was rewritten as `validate_boundary_taxonomy_against_workspace_graph.test.ts` under the new root. → Habitat's relocation wins the path; carry Studio's count intent into the relocated test. **Baseline pre-studio is `23/22`; B0 lands `24/23` (studio-contract); B1 lands `25/24` (mapgen-studio-ui).** `25/24` is Studio's *cumulative* target — but you **recompute against the COMBINED** habitat+studio project set, so treat `25/24` as intent, not a literal to paste. At the habitat tip these pins are computed **dynamically** from `taxonomy.projects.length`, so the relocated test may need **no hardcoded integer at all** — verify the moved test's shape; the live-parse audit goes green once rows + tags agree (§2).

**8a · `taxonomy.md` — COMPOSE (full-table).**
Studio: additive — inserts 2 rows in the §2 "Per-project assignment" table: `@civ7/studio-contract` (`packages/studio-contract`, `kind:foundation`) + `@swooper/mapgen-studio-ui` (`packages/mapgen-studio-ui`, `kind:foundation`). Habitat: large rewrite of the same doc — renames every project to unprefixed names (`@civ7/studio-server`→`control-studio-server`, etc.), adds a "Habitat internal boundary tags" section (`habitat:*`/`layer:*`), ~8 habitat sub-projects, and rewrites constraint rows. → Compose with Habitat as base; re-add Studio's 2 rows in Habitat's unprefixed style, both `kind:foundation` (mechanical conflicts on nearly every line — hand-place). **Verify the `mapgen-studio-ui` tag against its real dep edges:** `@civ7/studio-contract` (types/schema only) fits `kind:foundation` cleanly, but `mapgen-studio-ui` is a React UI lib consumed by `kind:app` — check its actual import edges against the `onlyDependOnLibsWithTags` constraint row **before** committing to `kind:foundation`, or the resolved graph edges trip `config-constraint-mismatch`.

---

## 2. Restack: order + the one habitat obligation

**Order**
1. `gt sync --no-restack`; confirm `gt parent` of your bottom branch = `main`; restack the habitat stack onto the **new post-drain `main`** (`git rev-parse main` yourself — the header SHA is the pre-drain base and will have changed).
2. Expect conflicts concentrated in **B0–B4 + B6–B7 territory**: `apps/mapgen-studio/package.json` + `bun.lock` (six/seven branches), the taxonomy pair (B0+B1), `sonnerTheme.test.tsx` (B2 delete), `operationAdoption.test.ts` + `studio-server/package.json` + `vitest.config.ts` (B0/B1).
3. Resolve each of the 8 per the §1 table.
4. After **all** package.json + workspace membership from both stacks is composed: `bun install`, commit the regenerated `bun.lock`.
5. Run the green baseline (§3).

**The ONLY habitat-side obligation for the extraction** — register the two new packages so the boundary-taxonomy audit stays green. A brand-new package that ships a `package.json` HARD-FAILS `auditBoundaryTaxonomy` the moment it lands until its row + tags agree on all three planes:

- [ ] **Add 2 rows to `taxonomy.md`** — `studio-contract` + `mapgen-studio-ui`, unprefixed names, `kind:foundation` (verify `mapgen-studio-ui`'s tag per §1 · 8a).
- [ ] **Give each new package its own `project.json`** — `name` + `tags`. The Nx project name may differ from the npm name (precedent: `packages/studio-server` → project `control-studio-server`, npm `@civ7/studio-server`). Whatever targets they declare (build/test/storybook/design-sync) is the extractor's choice — **habitat requires and forbids none**.
- [ ] **Make tags agree across 3 planes:** (`package.json` `nx.tags` ∪ `project.json` `tags`) ⇄ `taxonomy.md` row ⇄ Nx-graph-resolved tags.
- [ ] **Audit shows zero of:** `missing-taxonomy-project-for-manifest`, `missing-taxonomy-project-for-nx`, `manifest-tag-mismatch`, `nx-tag-mismatch`, `config-constraint-mismatch`.

> **No habitat check inspects studio internals.** There is no habitat structure/command check for mapgen-studio internals, sonner, Storybook, or design-sync (grep for `design-sync` under `tools/habitat` returns nothing — it is entirely app/package-side). The intra-project GritQL `scope:*` rules cover only `mod-swooper-maps` + `mapgen-core`. The entire habitat obligation is the checklist above. Enforcer file paths: Appendix C.

---

## 3. Verification / green baseline

Run post-restack, in order. Green at every survivor tip is your baseline. If any studio semantic pin (Appendix A "Pins") regresses during conflict resolution, you resolved a conflict wrong — **the pins are the falsifiers.**

1. **`bun install`** — after composing both stacks' package.json + workspace membership; commit the regenerated `bun.lock` (never hand-merge lockfile hunks).
2. **Boundary-taxonomy audit** — the only habitat check touching the new packages. Run `auditBoundaryTaxonomy` against the worktree via the habitat-harness CLI (~7s fast-path, not whole-repo grit). Confirm the two new rows resolve clean on all three planes; expect zero of the five reasons in §2.
3. **`nx design-sync:check`** — B7's CI-runnable target (`dependsOn` build/`^build`, `cache:false`, deliberately outside the CI-five). Verdict must stay clean; #2006 adds `StudioShellLayout` (`added:[StudioShellLayout], pendingGrade:[]`).
4. **`@swooper/mapgen-studio-ui` package suite** — incl. `scripts/verify.mjs` (export floor **101** after #2006; 100 after B8), `themeTokens.test.ts` (dist/styles.css token-for-token), `plainCnMarkup`, the relocated `sonnerTheme.test.tsx` (with Habitat's `.light`/dark-first assertions carried in), `appHeaderMarkupPin` (fixture anchored `1eb984728`, advanced once). nx `test dependsOn ['build','^build']` — builds dist first.
5. **`mapgen-studio` app suite** — `operationAdoption.test.ts` (contract import repoint; Habitat's `storeReset` allowlist entry **dropped** — known-failure-set is 7 not 8), `useSetupControls.test.tsx`, `artifactDomainCoverage.test.ts`.
6. **studio-server suite** — `contractTypeboxSpine.test.ts` (layout pins updated to the new contract topology).
7. **source-watch / `bun-source` reverify** — confirm studio-server's `./live-game` removal + new `@civ7/studio-contract` dep leave the export surface + daemon dev (`bun --conditions bun-source`) intact. The contract package must keep `"types": []` and use ONLY plain `oc` + TypeBox + `@standard-schema/spec`; verify **NAMED re-exports only** in studio-server's thin `./contract` subpath (an `export *` of the external → esbuild ships `studioEffectContract === undefined`).

---

## 4. Loose files (working-tree cleanup)

`apps/mapgen-studio/.design-sync/sb-reference/` and `apps/mapgen-studio/storybook-static/` are **SUPERSEDED** generated artifacts of the retired app-local design-sync. The studio tip has **0 tracked files under `apps/mapgen-studio/.design-sync/`** (retired by B7) and **12 under `packages/mapgen-studio-ui/.design-sync/`** (the new home). Nothing was forgotten; nothing needs carrying onto the stack. Let B7's deletion of the tracked app-side design-sync land, and `rm` the untracked artifacts locally. (Also on the checkout: an `M .civ7/outputs/resources` gitlink and the untracked `tools/habitat-harness/` working dir — neither is part of your restack payload.)

---

## Appendix A — Per-branch semantic intent (reference)

Consult a branch here only when a conflict touches a specific pin. Resolutions live in §1; this is the *why*. Each entry: ADDS / DELETES / **Pins to preserve**.

### #1996 · `studio-ui-extraction` (docs anchor, B0-precursor) — overlap: none
Plan-of-record for the whole extraction: freezes the reviewed 46-component classification ledger, records the design + adversarial review, lands the OpenSpec change set that gates the stack. Docs-only.
- **ADDS:** `docs/projects/studio-ui-extraction/{WORKSTREAM,LEDGER,DESIGN}.md` + `ledger/` + `design/` + `close-out/dod-walk.md`; `openspec/changes/studio-ui-extraction/`. **DELETES:** none (23 files, all adds).
- **Pins:** FROZEN counts 38 clean / 6 moderate / 2 app-shaped (AppHeader, PipelineStage); 12 binding adjudications; **E1 RESOLVED = E1-C** (extract `@civ7/studio-contract` as B0, import-type only, no twins); single dark-default authored CSS; B0–B8 sequencing. The *code* branches that execute this plan are the ones that collide.

### #1997 · `studio-contract-package` (B0) — overlap: 6 of 8 (files 1,2,4,5,7,8)
Extract the studio-owned contract into new foundation package `@civ7/studio-contract` (`packages/studio-contract`); move ~15 contract modules + pure closure OUT of `@civ7/studio-server`. Zero behavior change; server still `implementEffect`s the identical contract.
- **ADDS:** `packages/studio-contract/` (barrel owning `studioEffectContract`+`studioCiv7Contract`); ~15 git-mv'd modules (history preserved); thin `./contract` subpath in studio-server carrying only the `Civ7ControlOrpcContract` merge via **NAMED** re-exports; registers the package in the boundary-taxonomy table; bumps audit pins to `24/23`.
- **DELETES:** studio-server `./live-game` subpath (single consumer repointed); ~15 moved modules removed from studio-server/src.
- **Pins:** foundation→foundation discipline (contract uses ONLY plain `oc` + TypeBox + `@standard-schema/spec` — no Effect, no `@orpc/server`); **NAMED re-exports only** (esbuild drops `export *` of externals under code splitting → `studioEffectContract === undefined`); the `Civ7ControlOrpcContract` merge stays server-side; contract `tsconfig "types": []`. This is the branch that seeds the taxonomy/count collision.

### #1998 · `studio-ui-scaffold` (B1) — overlap: 4 of 8 (files 1,3,4,7,8 → net: taxonomy pair + vitest + bun.lock)
Create the empty `@swooper/mapgen-studio-ui` package foundation (`kind:foundation`, no component code) — pinned manifest, single dark-default theme source, strict build pipeline, token-contract fixture pinning dist token-for-token.
- **ADDS:** `packages/mapgen-studio-ui/` scaffold; ONE `src/styles/theme.css` (`:root, .dark {dark}` + `.light {light}`); strict tsup+tsc-dts+tailwind-CLI 4.3.0 build; `token-contract.json` + `themeTokens.test.ts`; `scripts/verify.mjs`; **root vitest project `mapgen-studio-ui`**; taxonomy row + pins bumped `25/24`. **DELETES:** `components.json` (no-generator policy; `@/*` aliases would leak unresolvable specifiers into `.d.ts`).
- **Pins:** `theme.css` is the single palette owner; `@civ7/studio-contract` is a **type-position-only** workspace dep from birth; `./types` is types-only; tailwind CLI pinned exact 4.3.0; nx `test dependsOn ['build','^build']` (reads dist/styles.css); export floor rises per branch.

### #1999 · `studio-ui-primitives` (B2) — overlap: 3 of 8 (files 1,4,6)
Relocate the shared lib foundation (cn, useResolvedTheme/resolveThemeFromDom, LAYOUT, ui/types) + 16 primitives (15 shadcn + FieldRow) with stories into the package; stand up package `.storybook`; rewire every app consumer same-branch (verbatim-move-first, staging rule 0.3).
- **ADDS:** 16 primitives + lib + `src/types/index.ts` (verbatim); package `.storybook`; new package `sonner.tsx` + **moved+rewritten sonnerTheme test** pinning the dark-first dual-class contract; barrel floor 63; app now depends on `@swooper/mapgen-studio-ui`.
- **DELETES:** app `src/components/ui/*` + FieldRow + `ui/types`; app private `useThemeFromClass` twin; **`apps/mapgen-studio/test/ui/sonnerTheme.test.tsx`** (moved into package + rewritten); 15 now-unused deps pruned (12 @radix-ui, cva, 2 @fontsource).
- **Pins:** verbatim-move fidelity; story titles byte-frozen design-sync anchors; **single theme hook** (do NOT reintroduce `useThemeFromClass` or absence-means-light); toast imported from `'sonner'` directly; **dev vite source alias MUST stay exact-match regex** `/^@swooper\/mapgen-studio-ui$/` array form (a prefix key captures theme.css/fonts.css subpaths and 500s the stylesheet); some deps deliberately kept app-side for later branches (clsx/tailwind-merge→B3, typebox/rjsf→B4, lucide/sonner→B7).

### #2000 · `studio-ui-composites` (B3) — overlap: 2 of 8 (files 1,4)
Move the composites+layout tier (12 composites + 2 docks) with stories/tests into the package, verbatim-move-first with a few designed de-couplings, rewire consumers same-branch.
- **ADDS:** composites group (AppBrand, AppFooter, StageViewTabs, ViewControls, WaterStatsSection, OptionSelect, DisclosureHeader, EmptyState, ErrorBanner, Preset{Error,Save,Confirm}Dialog); layout group (LeftDock, RightDock); AppFooter options-via-props transform; WaterStatsSection made generic `<TRef extends WaterStatsLayerRef>`; `plainCnMarkup` fixture (plain→extended cn byte-identical); export floor 63→77. **DELETES:** app `src/ui/utils/cn.ts`; app `src/ui/index.css`; **clsx + tailwind-merge pruned** from app.
- **Pins:** export floor EXACT 77; AppFooter seed policy keeps ONE owner (app wires via props); WaterStatsSection MUST stay generic (contravariance compile error otherwise); plain→extended cn no-op PROVEN by fixture; clsx+tailwind-merge stay pruned.

### #2001 · `studio-ui-forms` (B4) — overlap: 2 of 8 (files 1,4)
Relocate the RJSF forms group into the package as one atomic move + full same-branch app rewire. The 5-module RJSF unit moves atomically to keep the CSP-safe deep-subpath import intact.
- **ADDS:** `forms/` (8 modules); 11 stories + mockWidgetProps; 3 tests; barrel 77→90; package `@rjsf/validator-ajv8` devDep (parity test only). **DELETES:** app `@rjsf/core` + `@rjsf/utils` + `@rjsf/validator-ajv8`; `features/configOverrides/` emptied to configBuilders.ts.
- **Pins:** **`SchemaForm.tsx`'s `import Form from "@rjsf/core/lib/components/Form.js"` deep-subpath stays BYTE-VERBATIM** (root path pulls ajv → `new Function` under CSP; broke claude.ai/design attach per #1993; dist proof: 0 `new Function`, 0 ajv); SchemaForm stays package-internal (not exported); export floor exactly 90; mockWidgetProps self-imports by BARE package name (load-bearing for B7 window-global shim); typebox kept app-side.

### #2002 · `studio-ui-panels` (B5) — overlap: none
Boundary-heaviest branch — move 3 panels (ExplorePanel, GameConsole, RecipePanel) + recipe-dag subtree into the package; execute two designed severances (statusLabels, recipe-dag) so the package owns presentation/label logic while the app keeps constructors/state, rewired same-branch.
- **ADDS:** package `panels/` (+ recipe-dag subtree); new `statusLabels.ts` (contract type-position only); `recipeDagFixture.ts`; 5117-byte byte-parity `recipe-dag-layout.json`; barrel 90→99. **DELETES:** dead `*_PHASES` re-exports; 66 lines from app `runInGame/status.ts` (formatters/union relocated, constructors kept).
- **Pins:** `statusLabels.ts` imports contract in TYPE position only (E1-C fence); `buildRecipeDagLayout` byte-parity to the 5117-byte fixture; **seam directions must not invert** (app aliases/back-imports the package union; package never imports app status modules); barrel floor exact 99.

### #2003 · `studio-ui-appheader` (B6) — overlap: 2 of 8 (files 1,4)
Doctrine-inverting 7th branch — instead of a verbatim move, AppHeader (46th/final component) undergoes a **DESIGNED E4a redesign** into a props-driven view over an `AppHeaderSetupState` view-model + intent callbacks, app-domain logic pushed into an app-side container (`useSetupControls`). Equivalence proven by a markup-pin test, not byte-parity.
- **ADDS:** package AppHeader as props-driven view; app `useSetupControls` (pure `deriveAppHeaderSetupState`, memo, 4 handlers, difficulty double-write); `appHeaderMarkupPin.test.tsx` (7-scenario non-circular pin against parent-tip fixture `1eb984728`); verify floor 99→100. **DELETES:** app `src/ui/components/index.ts`; **lucide-react pruned from app** (AppHeader was its last importer).
- **Pins:** this is a REDESIGN not a verbatim move (**do NOT "restore" AppHeader to consume `setupConfig`**); difficulty double-write stays one functional update with the `?? PlayerDifficulty` fallback; `Civ7StudioSetupConfig` absent from package surface; markup-pin fixture anchored `1eb984728` (do not regenerate circularly; B8 advances it exactly once for the tabindex delta); lucide-react stays pruned.

### #2004 · `studio-ui-sync-repoint` (B7) — overlap: 2 of 8 (files 1,4)
Payoff branch — relocate design-sync tooling (`.design-sync/` + `.ds-sync/`) into the package and repoint sync inputs at the real build artifacts, retiring the reverse-engineer-a-fake-dist pipeline. The design agent now builds from genuine package dist.
- **ADDS:** package `.design-sync/` + `.ds-sync/` (git-mv'd wholesale, `.ds-sync` lib byte-identical R100); `config.json` repointed (entry=dist/index.js, cssEntry=dist/styles.css, buildCmd=nx build); package.json top-level `types` field (converter reads pj.types — without it all 46 → TITLE_UNMAPPED); `design-sync:check` nx target; `light-canary.mjs`. **DELETES:** app `.design-sync/build-inputs.sh`; `ds-entry.tsx` + synthEntry fork + tsconfig.dts.json; **app `.storybook/`** + SB scripts/targets/devDeps; app `src/storybook/storeReset.ts` + `queryStub.ts`.
- **Pins:** config.json Overrides(25)/docsMap(46)/provider/projectId/globalName/shape byte-verbatim frozen; real-artifact repoint is the whole point; package.json top-level `types` must remain; deletion set stays deleted; **known-failure-set is 7 not 8** (operationAdoption persisted-storage test now PASSES because storeReset.ts was deleted — do NOT resurrect that offender — see §1 · 5a).

### #2005 · `studio-ui-cleanup` (B8) — overlap: none
The single designed improvement wave on the verbatim-frozen library — 14 per-item oracle-gated cleanups, each diff provably render-neutral or exactly its stated intent, ZERO story-file changes (46 titles byte-frozen).
- **ADDS:** `forms/fieldIds.ts` (internal, NOT barrel-exported); AppBrand/PresetConfirmDialog regression tests; AppBrand propification; placement-as-prop className seam; GameConsole controlled Radix Popover; ExplorePanel Radix OptionSelect migration; cn normalization (104 sites); React 19 ref-as-prop across 30 components. **DELETES:** hand-rolled GameConsole popup wiring; forwardRef/displayName idiom; PresetConfirmDialog double-fire onClick.
- **Pins:** zero story-file diffs; export floor stays exactly 100 (fieldIds internal); markup-pin advances once only; post-anchor edits demand `--force` full re-grade (story-source-keyed gradeKey can't fire off a stale anchor); placement-as-prop defaults keep exact current classes.

### #2006 · `studio-ui-operating-structure` — overlap: none
Make the design-system operating model concrete in structure — graduate the studio shell into a slot-based `templates/StudioShellLayout` (47th synced component, first member of a new `templates` picker group), restructure cloud DS explorations into subject-nested taxonomy.
- **ADDS:** `templates/StudioShellLayout.tsx` (slot-based, geometry-driven, mirrors StudioShell composition) + `.stories`; `templates` picker group + `groups/templates.md`; verify floor 46→101; living-doc '46'→47. **DELETES:** (cloud DS project only) 3 old flat exploration HTML files.
- **Footprint:** 12 files — all under `packages/mapgen-studio-ui/` except one app README; **two READMEs total (app + package).**
- **Pins:** StudioShellLayout stays slot-based/geometry-driven; 47th component + first `templates` member; verify floor 101; design-sync verdict clean.

---

## Appendix B — Semantic ownership boundary (reference)

The partition the §1 dispositions apply. **Habitat owns the task-graph MECHANISM** (project.json externalization, targets, tags, taxonomy structure/naming, the relocated audit test, recipe artifact guards, lint relocation). **Studio owns the dependency GRAPH + the extracted content** (which workspace packages exist and who depends on them; the theme single-source; Storybook + design-sync surfaces; the contract package boundary).

- **B.1 Package / taskgraph.** Habitat externalizes all task config to `project.json` and deletes inline nx blocks; Studio only edits deps + deletes app-local Storybook targets. → Compose on Habitat's `project.json` base; re-apply Studio's dep add/remove; ensure Storybook targets are not carried into `project.json` (§1 · 1a). Add the `mapgen-studio-ui` vitest project alongside Habitat's habitat-rename (§1 · file 3).
- **B.2 Storybook / theme / UI relocation.** Studio relocates UI + sonner + theme hook + Storybook toolchain into the package and deletes/edits app-local files; Habitat's theming intent (`.light` + dark-first) and the `storeReset` allowlist live in files Studio moves/deletes. → Let Studio's extraction stand, but **carry** Habitat's behavioral edits into the relocated files and drop the dead allowlist entry (§1 · 5a, 6a). Habitat owns the behavioral *contract* its edits express; Studio owns *where the code lives*.
- **B.3 Studio contract extraction.** No semantic contest — Habitat only touches studio-server's nx block; never references `./live-game` or the contract package. → Clean union; re-run the source-watch / `bun-source` conformance checks after (§3.7).
- **B.4 Map-mod-disabled passthrough.** No file-level collision. Studio owns the UI rendering location (GameConsole in the package); Habitat owns the pass-through guarantee. → **A targeted post-merge check, not a merge decision:** verify the map-mod-disabled special rendering still fires from its new home in the package.
- **B.5 Recipe-DAG / taxonomy.** Maximal mechanical overlap (taxonomy.md + the audit test). Habitat owns taxonomy structure/naming + the relocated test + `ensure:studio-recipe-artifacts` guards; Studio owns the FACT that two new foundation packages must be counted/tagged. → §1 · 7a, 8a; the tag-vs-dep-edge verification for `mapgen-studio-ui` is load-bearing.

---

## Appendix C — Habitat enforcer artifacts (reference, do not re-invent)

- `docs/projects/habitat-harness/taxonomy.md` — §2 project table + §3 constraint table = the registration surface.
- `tools/habitat/src/service/model/graph/policy/validate_boundary_taxonomy_against_workspace_graph.policy.ts` — `auditBoundaryTaxonomy`.
- `tools/habitat/scripts/validate-boundary-taxonomy-against-workspace-graph.ts` — CLI entry.
- `tools/habitat/src/validation/validate_boundary_taxonomy_against_workspace_graph-inputs.ts` — manifest tags = union of `package.json` `nx.tags` + `project.json` `tags`.
- `tools/habitat/test/lib/validate_boundary_taxonomy_against_workspace_graph.test.ts` — dynamic `projectCount`/`nxProjectCount` pin (no per-package assertion for the two new packages, so no test edit strictly required; the live-parse audit goes green once rows + tags agree).
- Reference `project.json` shapes: `packages/mapgen-viz/project.json` (bare tags-only lib), `packages/studio-server/project.json` (bare, name≠npm-name), `packages/sdk/project.json` (adds `publish:npm`).
