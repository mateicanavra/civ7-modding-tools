## 1. OpenSpec Change (docs-only, this commit)

- [x] 1.1 Author `proposal.md`, `design.md`, `tasks.md`, and the
  `specs/studio-ui-design-sync/spec.md` delta (ADD the value-form requirement;
  the name/kind/scope partition requirement from
  `studio-ui-token-noise-disposition` survives unchanged).
- [x] 1.2 Validate `bun run openspec -- validate studio-ui-token-value-form
  --strict`; `git diff --check`; commit as the first stack branch.

## 2. Atomic value-form flip (package + app, ONE branch — mid-states are mutually invalid)

- [x] 2.1 `packages/mapgen-studio-ui/src/styles/theme.css` (sole palette owner):
  wrap every bare color triplet in the dark (`:root, .dark`) and light
  (`.light`) palette blocks in `hsl()`; drop the `hsl()` wrapper on the 27
  `@theme inline` entries (`hsl(var(--x))` → `var(--x)`); repoint the two
  aliases (`--color-border-secondary`, `--color-text-muted`) to bare
  `var(--other-token)`; consume `var(--x)` in the five base/component rules;
  convert the single CSS alpha site (`hsl(var(--popover) / 0.95)`) to
  `color-mix(in oklab, var(--popover) 95%, transparent)`.
- [x] 2.2 Migrate the 19 TS/TSX consumer sites across four files to `var(--x)`,
  with the 14 alpha sites on `color-mix(in oklab, var(--x) N%, transparent)`:
  `src/components/ui/sonner.tsx` (3 plain — `--normal-bg` is the silent-failure
  hot spot); `src/components/panels/recipe-dag/PipelineStage.tsx` (6, incl. the
  exported `PIPELINE_EDGE_INK`, gradients, and 4 SVG alpha);
  `src/components/templates/StudioShellLayout.stories.tsx` (2 alpha — expect
  these story bytes to change, moving their sourceKeys/gradeKeys);
  `apps/mapgen-studio/src/app/CanvasStage.tsx` (7, all alpha).
- [x] 2.3 Re-pin the guard in the SAME commit as the flip:
  `test/designTokens.test.ts` `VALUE_SHAPES.color` → the full-`hsl()` regex
  (kept strict, no bare-triplet union), `VALUE_SHAPES.alias` → `/^var\(--[\w-]+\)$/`;
  re-capture `test/fixtures/token-contract.json` from the new build and update
  its `$comment` with the re-capture reason; leave `authored-tokens.json`
  unchanged (it is value-free).
- [x] 2.4 Regenerate the committed `.design-sync/light-canary-tokens.json` by
  re-running `scripts/light-canary.mjs` once (no script change — it is a
  symmetric string compare). (Executed with one adjudicated deviation: the
  symmetric-serialization premise was falsified — the reference build minifies
  hsl()→hex — so the comparison was minimally normalized to resolved colors;
  see design.md-adjacent record in PR #2049 and DEF-017.)
- [x] 2.5 **Pre-commit trial-build gate:** confirm both compiles — the package
  Tailwind CLI and the app Vite build — emit valid
  `color-mix(in oklab, var(--x) N%, transparent)` over the new map for
  opacity-modifier utilities before committing. If the app compile misbehaves,
  STOP and reassess (do not commit a half-migrated theme).

## 3. Knowledge surfaces + disposition revisions (docs-only branch)

- [x] 3.1 `packages/mapgen-studio-ui/docs/design-tokens.md`: rewrite the
  value-form section (full `hsl()` values consumed as `var(--token)`; alpha =
  `color-mix`); delete the mooted oxlint HSL-triplet note; keep the two
  noise-finding classes (still true).
- [x] 3.2 `.design-sync/NOTES.md`: invert the explorations rule (bare
  `var(--token)` is now correct; `hsl(var(--token))` is the broken legacy form)
  and append the migration bullet.
- [x] 3.3 `docs/system/DEFERRALS.md` DEF-017: note upstream-feedback item 2
  (triplet recognition) mooted by the migration; findings #1/#2 disposition
  unchanged; add the trigger "post-upload check re-run shows `tokenKinds` now
  labels authored colors correctly — else the value-form hypothesis is
  falsified."
- [x] 3.4 Append the addendum to
  `openspec/changes/studio-ui-token-noise-disposition/workstream/upstream-feedback.md`.

## 4. Sync + upload + remote surgery (GATED on the user's explicit upload go-ahead)

- [x] 4.1 Build + `design-sync:check`; **force re-grade** per the NOTES
  internals-wave rule (`compare.mjs --force`; four portal dialogs via the manual
  full-page path) — this wave changes component internals and two story files.
- [x] 4.2 `light-canary` 7/7 zero drift; negative proof (mutate one token
  value-shape → `designTokens` trips).
- [x] 4.3 **Snapshot first**, then edit the remote-only explorations in the
  live DS project (four carriers post-restructure, not two — 141 sites):
  `DesignSync get_file` each → save under
  `.design-sync/.cache/exploration-snapshots/` BEFORE any edit (they have no
  repo copies — the only irreversible edge); rewrite `hsl(var(--x))` →
  `var(--x)` and `hsl(var(--x) / a)` → `color-mix`; screenshot-verify.
- [x] 4.4 Atomic upload (`_ds_sync.json` last, `deletes: []`).
- [x] 4.5 **Falsifier check:** after the app self-check regenerates
  `_adherence.oxlintrc.json` (or via a fresh design-check run), fetch it —
  authored colors should now classify as `"color"`. If still `"other"`, the
  value-form hypothesis is wrong; record in DEF-017 and do NOT iterate further
  repo-side.

## 5. Verification and closure

- [x] 5.1 Package suite + typecheck green at the stack tip with the re-pinned
  value-shapes.
- [x] 5.2 Both builds green; the app Vite build emits valid `color-mix` over the
  new map.
- [x] 5.3 `design-sync:check` 47/47 grades match post-force-regrade; `light-canary`
  7/7.
- [x] 5.4 `bun run openspec -- validate studio-ui-token-value-form --strict` and
  `git diff --check` green across the stack.
- [x] 5.5 Append the outcome to the `ds-sync-token-noise-disposition` memory file
  after ship.
- [x] 5.6 Archive this change after the gated upload lands and its delta is
  promoted per the change-management spec.
