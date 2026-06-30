# Design: MapGen Studio Design-Sync — Storybook Shape Flip (Stage 2)

Every decision below is settled. The storybook-shape mechanics are governed by
the staged contract `apps/mapgen-studio/.ds-sync/storybook/SKILL.md`; this design
records the repo-specific target shape and the decisions that contract leaves to
the operator.

## 1. What "storybook shape" changes (and what it does not)

The bundle the Claude Design agent builds with is **identical** in both shapes:
the compiled `dist/` of `apps/mapgen-studio`, bundled into
`window.MapGenStudio.*`. Stage 2 changes only the **verification oracle** and the
**preview source**:

| Concern | Package shape (today) | Storybook shape (target) |
|---|---|---|
| Preview source | hand-authored `.design-sync/previews/*.tsx` | each `*.stories.tsx` module, compiled whole (fixtures/decorators/helpers come along), imports redirected to the bundle |
| Verification | absolute rubric grade of one rendered preview | **screenshot pair**: the story in a reference Storybook ‖ the generated preview, graded match/close/mismatch until they match |
| Oracle artifact | none | `.design-sync/sb-reference/` (reference Storybook; never uploaded) |
| Re-sync skip basis | content hashes in `_ds_sync.json` | same `_ds_sync.json`, keyed to story-file `srcSha` + preview-affecting config |

The component bundle, `componentSrcMap`, `docsMap`, group categories, and the
project (`531d158d-…`) are carried forward unchanged. This is why the flip is a
cutover: the 46 stories were authored title-matched to the export names, so the
converter's title→export pairing resolves without a `titleMap` for the common
case.

## 2. Config target shape

`.design-sync/config.json` is edited, not rewritten — every existing key is
preserved except the additions below (per the storybook-shape field table,
`.ds-sync/storybook/SKILL.md` §2.3):

- `shape`: `"package"` → `"storybook"`.
- `storybookStatic`: `".design-sync/sb-reference"` (so re-syncs and compare find
  the reference with no flags).
- `storybookConfigDir`: `".storybook"` (the studio's Storybook config dir).
- `buildCmd`: the command the re-sync driver re-runs before the converter —
  builds the studio `dist/` + the compiled CSS the converter needs (the existing
  `bash .design-sync/build-inputs.sh`, which already emits `dist/`, `dist/types`,
  and the dark-default `_ds-compiled.css`).
- `titleMap`: added **only** for a story whose title does not already match its
  export name; the Stage-1 titling makes this the exception, not the rule. A
  `{title: null}` entry excludes a non-visual component — not expected here (all
  46 are visual).
- `cardMode`/`viewport`/`primaryStory` `overrides`: carried forward from package
  shape (the overlay/wide-card handling is shape-independent and already correct).
- `provider`: **left unset initially.** `.storybook/preview` decorators are
  auto-bundled as the preview wrapper, so the theme/Tooltip/QueryClient/Toaster
  context the stories rely on rides along without distillation. Set `cfg.provider`
  only if decorator bundling fails (`! preview decorator bundle failed`), and if
  set, scoped-compare a themed component afterward (an incomplete distillation
  silently regresses previews the decorators rendered fine).

## 3. The reference Storybook (the oracle)

- Built **once** with `npx storybook build -c apps/mapgen-studio/.storybook -o
  apps/mapgen-studio/.design-sync/sb-reference` — directly, **not** via the
  repo's `build-storybook` script (wrong output dir). For this repo the sync runs
  with cwd = `apps/mapgen-studio` and `.design-sync/` is package-local, so the
  `-o` target is the package-relative `.design-sync/sb-reference` (the contract's
  "repo-root" guidance maps to the package root here — see NOTES.md "Config home
  = the package").
- Verified by `iframe.html` existing and > 10 KB (an `index.json`-only output is a
  failed build).
- Rebuilt **only** when stories or the DS source change. Long build → run through
  the shell tool's background mode and await the completion notification (never a
  bare `&`, never a `pgrep` poll loop).

## 4. Verification flow (build → self-heal → compare → grade)

Synchronous, stopping at the first non-zero exit; compare runs only once build +
validate are clean:

1. `build-inputs.sh` (or `DS_SKIP_VITE=1` if `dist/` is current) → `dist/`,
   `dist/types`, `_ds-compiled.css`.
2. Build the reference Storybook (§3).
3. `package-build.mjs --out ./ds-bundle` → self-heal `[TAG]` errors to exit 0
   (shared tags per `../non-storybook/SKILL.md` §3; storybook tags
   `[SB_REFERENCE_MISSING]`/`[TITLE_UNMAPPED]`/`! preview build failed` per
   storybook §3).
4. `package-validate.mjs ./ds-bundle` → exit 0.
5. `compare.mjs --out ./ds-bundle --storybook-static .design-sync/sb-reference`
   → captures each story per-story (`?story=<Export>`) beside its reference
   render; grade from the images.

Chromium: no Playwright browser is installed in this repo — set
`DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`
(NOTES.md records that Homebrew `chromium` is a stale wrapper).

**Fix decision tree — global first (storybook §4a):** most/all components wrong
the same way → a `config.json` fix + full rebuild (provider, css, fonts). One
component `mismatch`/`unpaired` → author an owned `.design-sync/previews/<Name>.tsx`
(copy the generated cache wrapper minus its marker line) — the **only** lever for
a compiled-story preview; never edit the component. `sb-error` (story doesn't
render in Storybook either) → `cfg.overrides.<Name>.skip` + a NOTES.md reason.

**Grading (storybook §4):** grade the **primary** story from the images; on a
clean component (no error/portal/blank flags) mark siblings `match` with
`basis: "sibling-trusted"`. Grade exhaustively for the solo set, overlays, and
any component with a warning. `[FONT_MISSING]` is invisible to the compare images
— resolve it from the build log, never from "both panels look the same."

## 5. Scale and fan-out

46 components × ≤6 stories/component ≈ up to ~88 captured stories. The first
compare is scoped to a solo set (global-issue flush); the roster-wide work is
size-gated into scoped batches (storybook §4c) — each batch's components are
captured and **graded by the agent working them**, so the grading fans out. The
§4d roster receipt is the single mandatory full-roster settlement; it carries
graded work forward rather than recapturing. Fan-out subagents must not change
`--max-stories` mid-wave. The pinned `projectId` routes the whole run through the
**atomic re-sync path** (`resync.mjs` §7): verify everything once, upload at the
end.

## 6. Upload (atomic re-sync path)

- Pinned `projectId` → atomic path: nothing uploads until all 46 are verified;
  then one pass uploads the bundle, cards, and `_ds_sync.json`.
- `deletePaths` is **scoped** — the project holds a user-authored `explorations/`
  design (`RecipePanel flat and flush.html`) plus server-regenerated
  `_ds_manifest.json` / `_adherence.oxlintrc.json`; the atomic path's scoped
  deletes preserve all of them. A blanket delete is a stop condition.
- The `DesignSync.finalize_plan` approval is the user's final gate before any
  bytes land in the live project.

## 7. The runbook (second deliverable)

A self-contained runbook (extending `apps/mapgen-studio/README.md`, plus a
focused section/doc if the README grows unwieldy) covering, with zero ambiguity
for agents **and** humans:

- **How Storybook works here:** co-located CSF stories, the decorator/preview
  layer, the no-daemon/no-`/rpc` isolation, the Nx targets.
- **How to use it:** run the workbench, build it, where stories live, how to add
  a story for a new component.
- **The two-way sync loop:** Storybook is the oracle; the one-command re-sync
  (`resync.mjs`) flow; how to read the compare sheets and grade; what re-verifies
  when you change a component vs. a story vs. styling; how a new component joins
  the sync (componentSrcMap/docsMap/ds-entry + a story).
- **How to develop normally:** the everyday loop with all of the above in place
  (edit component → see it in Storybook → re-sync when ready), and the protected
  boundaries (no component edits to satisfy the sync; reuse the project; never
  delete `explorations/`).

## 8. Review lanes (run before/with implementation)

- **Cutover-integrity reviewer:** confirms the flip consumed the 46 stories
  without re-authoring; every story title paired to an export with no/minimal
  `titleMap`; any owned preview override is a recorded, justified exception.
- **Isolation / parity reviewer:** confirms no component implementation was
  edited to make a screenshot pair match; mismatches fixed in the preview/config
  layer only.
- **Sync-safety reviewer:** confirms the existing `projectId` is reused (no new
  project), the upload is the atomic path, and `deletePaths` preserves
  `explorations/`.
- **Runbook-clarity reviewer:** confirms an agent and a human can each, from the
  runbook alone, run the workbench, perform a re-sync, and develop normally
  without further context.

## 9. Non-claims

- Stage 2 proves the graded screenshot pairs match; it does not prove
  pixel-identity for ungraded sibling/tail stories (those are sibling-trusted /
  verified-by-upload per the contract).
- It does not prove any in-game or runtime behavior.
- OpenSpec validation proves artifact shape only.
