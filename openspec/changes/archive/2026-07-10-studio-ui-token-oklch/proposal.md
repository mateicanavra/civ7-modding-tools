## Why

The sibling change `studio-ui-token-value-form` (Step A, shipped 2026-07-08)
modernized `@swooper/mapgen-studio-ui`'s authored color tokens from bare HSL
channel triplets to full `hsl(…)` values consumed as `var(--token)`. That was
explicitly the first of an adjudicated two-step; oklch re-authoring was parked
as "Step B, a separate design pass."

This change executes Step B as an **exact, pixel-preserving conversion** — the
authored palette moves from `hsl(…)` to `oklch(…)` with byte-identical rendered
output — not a palette re-tune. It completes the migration to the color space
that is now canonical in Tailwind v4 and shadcn (both default palettes ship
oklch), which is the same class of win that justified Step A's move to full
values: it removes convention drift on every future component sync from the
design project and gives design agents a palette authored in the color space
their tooling speaks natively.

It does NOT change what any color looks like. Every one of the 38 unique
palette values was verified to render the identical 8-bit sRGB it did as
`hsl(…)` (CSS Color 4 conversion; max float Δ 4.9e-5). A deliberate
palette re-tune — using oklch's perceptual uniformity/wider gamut to *change*
the hand-tuned colors — remains a separate, design-led decision and is
explicitly out of scope here.

## Authority

- Direct user decision (2026-07-08): execute the oklch re-authoring now, as the
  substantive remaining work; keep the hand-tuned colors exactly (pixel-preserving),
  not a re-tune.
- `studio-ui-token-value-form` (archived 2026-07-08): established the two-step
  frame and the `var(--token)` consumption architecture that makes this step a
  clean, isolated value swap; its Step-A/Step-B fork is the direct predecessor.
- `openspec/specs/studio-ui-design-sync/spec.md`: the promoted capability whose
  value-form requirement this delta modifies (color space now oklch).
- `openspec/specs/change-management/spec.md`: this change is implementation
  control downstream of the above; it does not redefine sync architecture.

## What Changes

- **Value form (the flip).** `packages/mapgen-studio-ui/src/styles/theme.css`
  (sole palette owner): the dark (`:root, .dark`) and light (`.light`) palette
  blocks re-author every color value `hsl(H S% L%)` → `oklch(L C H)`, an exact
  pixel-preserving conversion (achromatic values collapse to `oklch(L 0 0)`).
  The `@theme inline` map, aliases, base/component rules, and the single
  `color-mix` site are already `var()`-based and form-agnostic — they do not
  change.
- **Consumers.** None. The 19 TS/TSX consumer sites migrated in Step A already
  reference tokens via `var(--x)` / `color-mix(in oklab, var(--x) N%,
  transparent)`, which are color-function-agnostic. No component or story bytes
  change.
- **Guard re-pin (same commit as the flip).** `test/designTokens.test.ts`
  uses the range-validating `VALUE_GUARDS` contract. The color guard accepts
  canonical `oklch(L C H)` only: each component is a finite unsigned decimal
  with an integer part, `L` is in `[0,1]`, `C` is in `[0,infinity)` (including
  multidigit chroma), and `H` is in `[0,360)`. Percentages, units, `none`, hsl,
  and bare triplets are rejected. The alias/radius/font guards retain their
  existing forms.
  `test/fixtures/token-contract.json` is re-captured from the new build with its
  `$comment` recording the reason; `authored-tokens.json` is unchanged
  (value-free).
- **Canary.** `scripts/light-canary.mjs` owns executable browser/server
  orchestration, screenshots, and color normalization (including `oklch()` and
  `rgb()` to 8-bit rgb). `scripts/light-canary-result.mjs` owns page-observation
  collection with explicit successful Storybook-story/design-sync-export
  markers: the requested Storybook URL, selected finished render, and a
  nonempty `#storybook-root` that Playwright finds visible with nonzero rendered
  geometry; the requested design-sync `?story=`, emitted export list, and a
  matching visible, nonempty, nonzero-geometry `#r0` single-export root. It
  also owns completeness and drift evaluation, cleanup-before-exit finalization,
  fail-closed reporting, and atomic success-only retention after clean runtime
  shutdown. Package-owned `scripts/light-canary-server.mjs` rejects asynchronous
  listen failures, contains resolved file targets within the configured root,
  and settles every acquired canary resource without changing the staged
  DesignSync toolkit's server contract.
  `test/lightCanaryResult.test.ts` is the fast pure helper seam using a fake
  page, while `test/lightCanaryServer.test.ts` exercises server startup and
  cleanup contracts.
  `scripts/light-canary-browser-test.mjs` uses
  the generated Storybook/design-sync pages in Playwright to reject a missing
  export and absent, empty, hidden, or zero-size roots.
  `.design-sync/light-canary-tokens.json` is regenerated.
- **Knowledge surfaces.** `docs/design-tokens.md` (oklch value-form),
  `.design-sync/NOTES.md` (value-form section covers the two-step arc),
  `docs/system/DEFERRALS.md` DEF-017 (records the form is now oklch — still a
  full color function; falsifier outcome unaffected).
- **Spec.** The value-form requirement in `studio-ui-design-sync` is MODIFIED to
  name oklch as the canonical authored color space and to require that a
  color-space migration be pixel-preserving.

## What Does Not Change

- Rendered pixels (byte-identical), the compiled `dist/styles.css` structure,
  the design-app classifier, and findings #1 (`--tw-*` / `@theme` defaults) and
  #2 (selector-scoped custom props): contract-enforced noise; DEF-017 stands.
- The remote DS-project explorations: they consume tokens via `var(--x)`
  (form-agnostic), so — unlike Step A — this step requires **no exploration
  surgery**. The gated upload is package artifacts only.
- A palette re-tune in oklch (changing the hand-tuned colors): out of scope,
  design-led.

## Affected Owners

- `packages/mapgen-studio-ui/src/styles/theme.css` (palette owner)
- `packages/mapgen-studio-ui/test/designTokens.test.ts`,
  `test/lightCanaryResult.test.ts`, `test/lightCanaryServer.test.ts`,
  `test/fixtures/token-contract.json`
- `packages/mapgen-studio-ui/scripts/light-canary.mjs`,
  `scripts/light-canary-result.mjs`, `scripts/light-canary-browser-test.mjs`,
  `scripts/light-canary-server.mjs`,
  `.design-sync/light-canary-tokens.json` (regenerated)
- `packages/mapgen-studio-ui/docs/design-tokens.md`,
  `packages/mapgen-studio-ui/.design-sync/NOTES.md`, `docs/system/DEFERRALS.md`
- `openspec/changes/studio-ui-token-oklch/**`

## Forbidden Owners

- `packages/mapgen-studio-ui/dist/**`, `styles.css`, `_ds_bundle.*`,
  synced `components/**`, `_adherence.oxlintrc.json`
- `packages/mapgen-studio-ui/.ds-sync/**` staged skill scripts,
  `.design-sync/conventions.md`
- The live DS project's synced artifacts (read-only by contract); any `--tw-*`
  hoist to `:root`
- Any color *re-tune* (changing rendered colors) — this change is
  pixel-preserving only

## Dependencies

- Requires: `studio-ui-token-value-form` (this is Step B of that two-step; the
  `var(--x)` consumption it shipped makes the value swap isolated). Base is
  current `main`.
- Enables: a future oklch palette re-tune becomes a pure design pass over
  already-oklch values.

## Consumer Impact

- Rendered colors are byte-identical → the 47-component compare grades carry
  with zero churn (design-sync:check verify: 47 verified-by-upload, 0 changed).
  No portal-dialog manual re-grade is triggered (no story bytes move).
- Design agents inherit a palette authored in the canonical oklch color space.

## Verification Gates

- `nx run mapgen-studio-ui:test` green with the re-pinned, range-validating
  oklch value guard; built-artifact mutations cover malformed syntax, empty
  values, hsl, valid multidigit chroma, and values outside the declared ranges.
- Conversion proof: every unique palette value round-trips to byte-identical
  8-bit sRGB (converter report; max float Δ < 5e-5). Package Tailwind CLI and
  app Vite builds emit valid CSS over the new map.
- `light-canary` 7/7 successful story/export markers and zero drift after
  regenerating the committed tokens json; the real-browser collector regression
  rejects a missing design-sync export and absent, empty, hidden, and zero-size
  render roots.
- `design-sync:check` green; grades carry (0 changed). The local upload delta
  has styling and auxiliary artifacts, so it is not styling-only.
- `bun run openspec -- validate studio-ui-token-oklch --strict`; `git diff --check`.
- **Falsifier:** after the gated upload and the app self-check regenerates
  `_adherence.oxlintrc.json`, authored colors still classify `"color"` (oklch is
  a full color function). If they regress to `"other"`, record in DEF-017.

## Stop Conditions

- Any palette value fails byte-exact round-trip → stop; do not ship a drifted
  conversion.
- Any pixel drift in the grade compare beyond zero → stop; the flip is lossless.
- Any step would require a color re-tune or hand-editing a synced/generated
  artifact → stop.
