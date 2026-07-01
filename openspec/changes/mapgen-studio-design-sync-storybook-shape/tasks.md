# Tasks: MapGen Studio Design-Sync — Storybook Shape Flip (Stage 2)

Ordered implementation steps. Each block is closeable. Runs on a branch stacked
on `studio-storybook-workbench` (the Stage-1 branch / PR #1991), or on `main`
once #1991 merges. Never stage the foreign `.civ7/outputs/resources`.

## 0. Branch and readiness baseline

- [x] Confirm Stage 1 is present (46 stories, green `build-storybook`); create
      the Stage-2 Graphite branch + worktree stacked on `studio-storybook-workbench`
      (or `main` if #1991 has merged); commit this change set as the first commit.
      — Branch `mapgen-studio-design-sync-storybook-shape` on `studio-storybook-workbench`;
      46 stories present; frame committed + validated `--strict`.
- [x] Confirm the toolchain: a chromium binary is reachable
      (`DS_CHROMIUM_PATH` for system Chrome); the staged `.ds-sync/` converter +
      `storybook/` scripts are present; `.ds-sync` node deps (esbuild,
      ts-morph, playwright) installed.
      — Chrome at `/Applications/Google Chrome.app/...`; `.ds-sync/` has all
      storybook-shape lib modules (`preview-gen-storybook`, `source-storybook`,
      `story-imports`, `remote-diff`); `non-storybook/` is doc-only (no runtime
      import). Bundled skill not re-stageable (moved path) → drive staged scripts.

## 1. Reference Storybook + config flip

- [x] Ensure `.gitignore` ignores `.design-sync/sb-reference/`,
      `.design-sync/.cache/`, `.design-sync/learnings/`, `.ds-sync/`,
      `ds-bundle/`, and the `.design-sync/node_modules` symlink.
      — added `.design-sync/sb-reference/`; the rest already present.
- [x] Build the studio `dist/` + compiled CSS (`bash .design-sync/build-inputs.sh`).
- [x] Build the reference Storybook once into
      `apps/mapgen-studio/.design-sync/sb-reference` (`storybook build -c
      .storybook -o .design-sync/sb-reference`); verify `iframe.html` > 10 KB.
      — iframe.html 18 KB; index.json 134 entries (88 stories + 46 autodocs).
- [x] Flip `config.json`: `shape: "storybook"`, add `storybookStatic`,
      `storybookConfigDir`, `buildCmd`; preserve `projectId`/`pkg`/`globalName`/
      `componentSrcMap`/`docsMap`/`overrides`. No `titleMap` needed — Stage-1
      titles pair to export names (last title segment = component name).

## 2. Build + validate self-heal (storybook §3)

- [x] `package-build.mjs --out ./ds-bundle` → fix `[TAG]` errors → rebuild until
      exit 0. Two `[GENERAL]` fixes (see NOTES.md): (1) `[TITLE_UNMAPPED]` 46/46 —
      app has no published exports → committed thin fork
      `.design-sync/overrides/source-storybook.mjs` asserting `synthEntry`
      (`cfg.libOverrides`); (2) `previews: 0 generated (46 user-owned)` — the
      package-shape `.design-sync/previews/*.tsx` shadowed story generation →
      retired (git rm). Now `46/46 public exports`, `previews: 46 generated`.
      (3) 27/46 previews failed to COMPILE — stories importing components from a
      barrel dir (`@/components/ui`, `@/ui/components/fields`) or a multi-component
      file (`@/features/configOverrides/*`) bundled the path from source →
      "is a directory". Fix: `cfg.storyImports.shim = ["components/ui",
      "features/configOverrides", "ui/components/fields"]` → root-global shim.
      Now all 46 compile (`_preview/*.js` = 46).
- [x] `package-validate.mjs ./ds-bundle` → exit 0. "✓ bundle is complete
      (7 warning(s), non-blocking)": 7 `[RENDER_BLANK]` on bare form controls
      (Checkbox/Input/Textarea + CheckboxWidget/NumberWidget/TextWidget/
      TextareaWidget) — heuristic (PNG <5KB); the compare vs reference Storybook
      is the real judge (legit-small input vs actual blank).
- [x] Confirm decorator bundling succeeded (no `! preview decorator bundle
      failed`); set `cfg.provider` only if it failed, and re-verify a themed
      component if so. — Decorator bundle failed on `tailwindcss` (preview.tsx CSS
      import) → set `cfg.provider = {TooltipProvider, delayDuration:300}` (dark
      theme via dark-default CSS; no QueryClient/Toaster needed for static,
      prop-driven components). "decorator auto-detect skipped — cfg.provider set".

## 3. Compare + grade all 46 (storybook §4)

- [x] Scope the first `compare.mjs` run to a solo set; flush any global issue
      (provider/css/fonts) via a config fix + full rebuild before roster-wide
      capture. — Solo set (Button, Select, ViewControls, WaterStatsSection, Input,
      CheckboxWidget): all globals flushed (the 4 build fixes above); all 6 graded
      **match** (image-judged, exhaustive). `[RENDER_BLANK]` confirmed false
      positive (bare inputs render + match). Select overlay: preview renders open
      dropdown correctly, storybook clipped the portal → match w/ note.
- [x] Capture + grade the roster in size-gated batches (fan-out): 40 captured in
      one controlled run; 36 needs-grade fanned out to 5 grading-only Workflow
      subagents (no browser → parallel-safe). Result: **0 mismatches, 0 flagged**;
      1 framing-only `close` (SchemaConfigForm — taller form clipped by shorter
      preview frame; all content/styling matches). The 4 dialog `sb-error`s
      (Dialog + 3 preset dialogs) are the compare's `#storybook-root` scoping vs
      Radix portal-to-body — **manually verified** via full-page reference render
      (all 4 render correct modals) → graded `match` w/ note. Toaster `blank`
      render-check flag = legitimately-empty notification host (both sides agree),
      graded `match`.
- [x] §4d roster receipt (`resync.mjs`): **`ok:true`**, `shape:"storybook"`,
      `anchor:"shape_changed"`, all stages green, `learningsUnmerged:[]`,
      `pendingGrade:[]`, `removed:[]`, `canary:[]`. All 46 carried forward. Upload
      scope: all 46 (`bundle/styling/aux:true`); `deletePaths:[]` from the diff →
      shape-changed groups need list_files delete-reconciliation at upload.

## 4. Re-sync upload (atomic path)

- [x] Fetch the project's `_ds_sync.json` → `.design-sync/.cache/remote-sync.json`;
      run `resync.mjs` (atomic path, pinned `projectId`). Verdict `ok:true`;
      `deletePaths:[]` from the diff (shape_changed) → reconciled via `list_files`.
- [x] `DesignSync.finalize_plan` → approved (`plan_531d158da7f641cb_3859a004f066`)
      → uploaded: sentinel → 184 component files + 52 misc + 75 fonts → **76 stale
      package-shape files deleted** (the 5 removed group trees) → sentinel re-arm →
      `_ds_sync.json` last. Post-upload `list_files`: 46 storybook-shape cards in
      `composites`/`forms`/`layout`/`panels`/`primitives`; **no stale groups**;
      **`explorations/` preserved**. `report_validate` sent (46 total, 1 bad =
      Toaster heuristic).

## 5. Documentation: NOTES + runbook

- [x] Append a storybook-shape section to `.design-sync/NOTES.md` (the 4 global
      fixes, reference-build command, chromium path, re-sync routine, the
      `[RENDER_BLANK]` false-positive note).
- [x] Write/extend the runbook (`apps/mapgen-studio/README.md`): how Storybook
      works here + adding a story, the design-sync (storybook shape) + re-sync
      command + what-re-verifies table + grading + fix-in-preview-layer rule, and
      "developing normally" with the honest boundaries. Self-contained for agent
      or human.

## 6. Review lanes

- [x] Review lanes (design.md §8) discharged via inline verification, each
      confirmed against evidence: **cutover-integrity** — no `titleMap` needed,
      no story re-authoring (git parity check empty), the 4 fixes are
      config/fork not re-authoring; **isolation/parity** — 0 component-source or
      story edits in the write set; **sync-safety** — existing `projectId`
      reused, atomic path, post-upload `list_files` shows `explorations/`
      preserved and no stale groups; **runbook-clarity** — README covers run /
      use / two-way sync / develop-normally with the honest boundaries.

## 7. Verification gates + closure

- [x] Verification gates recorded (see table below).
- [x] `bun run openspec -- validate mapgen-studio-design-sync-storybook-shape
      --strict` → valid.
- [x] `git status` shows only the expected write set (config, NOTES, override,
      gitignore, README, tasks + 46 retired previews) — no component edits, no
      story re-authoring, no foreign `.civ7/outputs/resources`.
- [x] Committed (`21d953c84`); submitted as **draft PR #1992** (base =
      `studio-storybook-workbench`); repo clean.

## Validation results (Stage 2 closeout)

Branch `mapgen-studio-design-sync-storybook-shape` on `studio-storybook-workbench`
(→ `main`); commits: frame `e304415ca` → implementation `21d953c84`. Draft
[PR #1992](https://github.com/mateicanavra/civ7-modding-tools/pull/1992).

| Gate | Expected | Actual | Oracle |
|---|---|---|---|
| reference Storybook | `iframe.html` > 10 KB | **18 KB, 134 index entries** | storybook build |
| `package-build.mjs` | exit 0, 46 previews | **exit 0; 46/46 public exports; 46 previews compiled** | converter build |
| `package-validate.mjs` | exit 0, no `[FONT_MISSING]` | **exit 0; 1 heuristic blank (Toaster, false-positive)** | render-check |
| screenshot grading | all match/close | **46/46: 45 match + 1 framing-only close; 0 mismatch** | image grading (solo + 5-agent fan-out) |
| portal dialogs | verified | **4 sb-error → manually verified via full-page reference render** | full-page chromium render |
| `resync.mjs` receipt | `ok:true`, `pendingGrade:[]` | **`ok:true`, `pendingGrade:[]`, `learningsUnmerged:[]`** | driver verdict |
| upload | 46 cards, explorations preserved | **46 storybook-shape cards; 5 stale groups deleted; `explorations/` preserved** | post-upload `list_files` |
| openspec `--strict` | valid | **valid** | OpenSpec CLI |
| write-set parity | no component/story edits | **0 component or story edits; no foreign files** | git |

Non-claims: verification proves the graded screenshot pairs match and the
project was re-synced; it does not prove pixel-identity for ungraded
sibling/tail stories (sibling-trusted / verified-by-upload), nor any in-game or
runtime behavior. The 4 portal dialogs are preview-verified (reference portals
outside the compare's captured root).
