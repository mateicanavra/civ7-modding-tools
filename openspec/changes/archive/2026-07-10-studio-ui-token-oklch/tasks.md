## 1. OpenSpec Change (docs-only, this commit)

- [x] 1.1 Author `proposal.md`, `design.md`, `tasks.md`, and the
  `specs/studio-ui-design-sync/spec.md` delta (MODIFY the value-form requirement:
  oklch is the canonical authored color space; a color-space migration SHALL be
  pixel-preserving). The name/kind/scope partition requirement is untouched.
- [x] 1.2 `bun run openspec -- validate studio-ui-token-oklch --strict`;
  `git diff --check`.

## 2. Atomic value-form flip (package, ONE commit — mid-states are mutually invalid)

- [x] 2.1 Build the CSS Color 4 converter; prove all 38 unique palette values
  round-trip to byte-identical 8-bit sRGB (max float Δ < 5e-5). Achromatic →
  `oklch(L 0 0)`.
- [x] 2.2 `packages/mapgen-studio-ui/src/styles/theme.css`: re-author every
  color value in the dark (`:root, .dark`) and light (`.light`) blocks
  `hsl(H S% L%)` → `oklch(L C H)` (comments preserved). The `@theme inline` map,
  aliases, base rules, and `color-mix` site are already `var()`-based — unchanged.
  Update the palette-block prose comment to describe the oklch form.
- [x] 2.3 Re-pin the guard in the SAME commit: `test/designTokens.test.ts`
  uses `VALUE_GUARDS`; `VALUE_GUARDS.color` accepts canonical `oklch(L C H)`
  only with finite unsigned decimal components and a required integer part;
  validate `L` in `[0,1]`, `C` in `[0,infinity)` (including multidigit chroma),
  and `H` in `[0,360)`. Re-capture
  `test/fixtures/token-contract.json` from the new build and update its
  `$comment`; leave `authored-tokens.json` unchanged (value-free).
- [x] 2.4 Split canary ownership explicitly: `scripts/light-canary.mjs` owns
  executable browser/server orchestration, screenshots, and `normColor` oklch
  (and rgb) -> 8-bit rgb resolution; `scripts/light-canary-result.mjs` owns
  successful-story/export collection markers (requested URL + selected finished
  Storybook render + a nonempty, Playwright-visible, nonzero-geometry
  `#storybook-root`; requested design-sync `?story=` + emitted export list + a
  matching nonempty, Playwright-visible, nonzero-geometry `#r0`), complete-result/
  drift evaluation, cleanup-before-exit finalization, and fail-closed reporting.
  `test/lightCanaryResult.test.ts` is the fast pure fake-page helper seam.
  `scripts/light-canary-browser-test.mjs` exercises the generated Storybook and
  design-sync pages with Playwright: missing export plus absent, empty, hidden,
  and zero-geometry roots fail rather than producing a false green.
  Regenerate the committed `.design-sync/light-canary-tokens.json`.

## 3. Knowledge surfaces (docs)

- [x] 3.1 `docs/design-tokens.md`: value-form section → full `oklch(…)` consumed
  as `var(--token)`; note the pixel-preserving conversion + canonical-space
  rationale; keep the two noise-finding classes.
- [x] 3.2 `.design-sync/NOTES.md`: value-form section covers the two-step arc
  (hsl → oklch), records "no exploration surgery for the oklch step."
- [x] 3.3 `docs/system/DEFERRALS.md` DEF-017: form is now oklch (still a full
  color function; falsifier outcome unaffected).

## 4. Local verification

- [x] 4.1 `nx run mapgen-studio-ui:test` green with the re-pinned oklch
  value guard and canary lifecycle coverage (206/206).
- [x] 4.2 `nx run mapgen-studio-ui:build` completed the package Tailwind CLI
  build and `nx run mapgen-studio:build` completed the dependent app Vite build
  with exit 0; both emitted CSS over the oklch token map.
- [x] 4.3 `nx run mapgen-studio-ui:design-sync:check` completed with exit 0.
  Its machine-readable local receipts are
  `ds-bundle/.resync-verdict.json` (`ok: true`, `anchor: "ok"`,
  `verification.changed: []`, `verification.added: []`,
  `verification.removed: []`, `verification.pendingGrade: []`) and
  `ds-bundle/.sync-diff.json` (`upload.components: []`,
  `upload.bundle: false`, `upload.styling: true`, `upload.aux: true`,
  `upload.deletePaths: []`). Grades carry with 0 changed; the local delta is
  styling plus auxiliary artifacts, not styling-only.
- [x] 4.4 Ran `node scripts/light-canary.mjs .design-sync` from
  `packages/mapgen-studio-ui` after `nx run mapgen-studio-ui:design-sync:check`:
  `Button`, `Tabs`, `ErrorBanner`, `AppFooter`, `GameConsole`,
  `WaterStatsSection`, and `PipelineStage` each emitted its requested successful
  Storybook-story/design-sync-export markers with `html class="light"` and
  `tokenDrift=NONE`; the regenerated committed JSON records those markers plus
  empty drift arrays. Ran
  `bun run --cwd packages/mapgen-studio-ui test -- test/designTokens.test.ts test/lightCanaryResult.test.ts test/lightCanaryServer.test.ts`:
  3 files and 38/38 tests passed. Those focused tests route valid multidigit
  chroma plus malformed, empty, hsl, and out-of-range mutations through the
  built-stylesheet artifact guard; exercise fake-page collector outcomes; and
  prove case-mismatched design-sync selection fails, invalid observations and
  drift report only after deferred cleanup, simultaneous failures remain
  observable, asynchronous server-listen failures reject, symlink targets stay
  contained by the configured root, and every acquired canary resource settles
  before cleanup failures surface. Collection,
  drift, cleanup, and atomic replacement failures do not replace the last
  complete retained canary result. Ran
  `bun run --cwd packages/mapgen-studio-ui test:light-canary-browser`: the real
  Playwright regression against generated fixtures passed the missing-export,
  case-mismatched-export, absent-root, empty-root, duplicate-root, hidden-root,
  and zero-geometry-root cases. The
  committed JSON is valid and ends with a newline.
- [x] 4.5 `bun run openspec -- validate studio-ui-token-oklch --strict`;
  `git diff --check`.

## 5. Sync + upload (GATED on the user's explicit upload go-ahead)

- [x] 5.1 `design-sync:check`; upload the current local state with
  `_ds_sync.json` last and `deletes: []`. The initial Step-B upload moved the
  styling and auxiliary partitions (`styleSha: 038266...`,
  `auxSha: 5e3039...`) without component or exploration changes. After the
  branch restacked over prerequisite PR #2058, the prerequisite's package-barrel
  ordering changed the generated bundle only (`bundleSha12: 26fc014c4139`). A
  fresh check reported 47 unchanged components, no pending grades, and no
  deletes. The closing atomic resync wrote all 326 managed paths, fenced by
  `_ds_needs_recompile`, then wrote `_ds_sync.json` alone and last. The final
  remote anchor matches the local build exactly; explorations, screenshots,
  templates, and server-generated files remain intact.
- [x] 5.2 **Falsifier check:** the regenerated
  `_adherence.oxlintrc.json` continues to classify authored semantic OKLCH
  colors as `"color"`. Residual misclassification is confined to the known
  Tailwind `--tw-*` framework noise recorded in DEF-017.
- [x] 5.3 Appended the live upload and post-restack reconciliation outcomes to
  the `ds-sync-token-noise-disposition` memory file.
- [x] 5.4 Archive this change after the gated upload lands and its delta is
  promoted per the change-management spec.
