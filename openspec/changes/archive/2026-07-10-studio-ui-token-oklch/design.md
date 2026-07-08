# Design — studio-ui-token-oklch

## The load-bearing decision: pixel-preserving conversion, NOT a re-tune

`studio-ui-token-value-form`'s design.md parked oklch on three stated grounds.
Each resolves cleanly for a *conversion* (as opposed to a *re-tune*):

1. **"Silently re-semanticizing a hand-tuned artifact."** This is the real
   concern, and it applies only to a re-tune (using oklch to *change* the
   colors). An exact conversion changes the authored form while preserving the
   rendered color to the byte — the hand-tuned relationships are untouched.
   This change is a conversion; a re-tune stays out of scope and design-led.
2. **"Conversion-rounding risk in the 47-component compare."** Eliminated by
   verification, not assertion: every unique palette value is round-tripped
   `hsl → sRGB(8-bit) [truth]` vs `oklch(rounded) → sRGB(8-bit)` and required to
   match byte-for-byte, with float sRGB and oklab deltas held < 5e-5 so that
   downstream `color-mix(in oklab, …)` and gradients over the tokens are
   unaffected. Result: 38/38 exact, max float Δ 4.9e-5. Precision is chosen
   per value as the minimum decimals that achieve exact round-trip.
3. **"Buys nothing visually."** True, and not the justification. Classification
   was already fixed by Step A (full `hsl()` classifies `"color"`). Step B's win
   is convention/ecosystem alignment — the same category that justified Step A's
   move to full values — now that oklch is the Tailwind v4 / shadcn default
   color space. It removes drift tax on future syncs and gives design agents a
   palette in the color space their tooling authors natively.

Falsifier for choosing conversion-now over deferring: if any palette value
could not be represented in oklch without pixel drift, stop. (Refuted: all 38
in-sRGB-gamut values convert exactly.)

## Target-shape decisions (no optional/fallback language)

- **Color space:** oklch is the canonical authored color space for all color
  tokens. Not "hsl or oklch"; the guard accepts oklch only.
- **Conversion:** CSS Color 4 / Ottosson matrices (sRGB↔linear↔OKLab↔OKLCH),
  the exact math browsers implement, so the emitted value renders identically.
  Achromatic values (computed chroma rounding to 0) are authored `oklch(L 0 0)`.
- **Precision:** minimal per-value decimals proven to round-trip byte-exact
  (L/C ≤ 5 dp, H ≤ 3 dp observed); no fixed padding.
- **Guard grammar and ranges:** canonical authored values use exactly
  `oklch(L C H)` with finite unsigned decimal components and a required integer
  part. The guard accepts `L` in `[0,1]`, unbounded nonnegative `C` (so
  multidigit chroma remains valid), and `H` in `[0,360)`; it rejects
  percentages, units, `none`, empty values, malformed values, hsl, and bare
  triplets.
- **Consumers/explorations:** unchanged — `var(--x)` is form-agnostic. This
  step deliberately touches only token *definitions*.
- **Alpha:** unchanged — `color-mix(in oklab, var(--x) N%, transparent)`, which
  reads the token as a color regardless of its authored function.

## Owners touched

Studio design-system package palette owner (`theme.css`), its repo-owned token
guard + value fixture, the both-modes canary instrument, and the synced/knowledge
docs. Within the canary, `scripts/light-canary.mjs` owns browser/server lifecycle,
navigation, screenshots, and color normalization;
`scripts/light-canary-result.mjs` owns observable story/export collection,
complete-result and drift evaluation, and cleanup-before-exit finalization. A
successful result is retained atomically only after runtime cleanup succeeds. A
Storybook success marker requires the requested URL id, selected finished
runtime render, and exactly one `#storybook-root` with children that Playwright
finds visible with nonzero rendered geometry; a design-sync success marker
requires the requested `?story=`, emitted export list, and a matching visible,
nonempty, nonzero-geometry `#r0` single-export root. The pure
`test/lightCanaryResult.test.ts` isolates helper outcomes with a fake page.
Package-owned `scripts/light-canary-server.mjs` rejects asynchronous listen
failures and settles all acquired canary resources;
`test/lightCanaryServer.test.ts` exercises those contracts without changing the
staged DesignSync toolkit.
`scripts/light-canary-browser-test.mjs` exercises the same collectors in a real
Playwright browser against the generated Storybook and design-sync pages,
including missing export plus absent, empty, hidden, and zero-geometry roots.
No stage/step/recipe/adapter/projection/SDK owners: this is a Studio design-token
surface change with no MapGen pipeline reach.

## Review lanes (before ship)

- **Conversion-correctness lane:** independent audit of the converter math and
  its byte-exact round-trip proof (the single point where a wrong matrix or
  precision choice would silently drift color).
- **Guard/canary re-pin lane:** the `VALUE_GUARDS.color` contract validates both
  canonical unsigned-decimal oklch syntax and the declared `L`/`C`/`H` ranges,
  while the canary `normColor` resolver matches the emitted form. Built-artifact
  proof covers valid multidigit chroma plus malformed, empty, hsl, and
  out-of-range values. The collector records successful story/export markers
  only after runtime selection completes and their observable roots are
  nonempty, Playwright-visible, and nonzero-geometry. The browser regression
  proves an absent requested export plus absent, empty, hidden, and zero-size
  roots fail before drift evaluation.
- **Visual-grade lane:** `design-sync:check` confirms grades carry with zero
  churn (0 changed); the local upload delta is styling plus auxiliary artifacts,
  not styling-only.

## Verification story

Byte-exact conversion verification → package + app builds green → full suite green with
the re-pinned, range-validating oklch guard → real-browser collector regression
→ light-canary 7/7 →
design-sync:check green (0 grade churn) → openspec strict + `git diff --check`.
The gated upload adds the live falsifier re-check (authored colors still
`"color"`).
