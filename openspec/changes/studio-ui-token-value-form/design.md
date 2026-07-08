# Design — studio-ui token value-form migration

## Frame

The problem is not "the checker is wrong" and not "make findings go away." The
design system ships its authored tokens in a legacy value dialect — bare HSL
channel triplets consumed as `hsl(var(--token))` — and that dialect is the root
cause of (a) perpetual color misclassification, (b) drift tax against the shadcn
/ Tailwind v4 convention on every sync, and (c) an inverted consumption rule
that already produced one silent-transparent bug class. The solution modernizes
the dialect and leaves the checker alone. This design records the one real fork
(value format) and the alpha-mechanism adjudication; both were decided with
stated reasons, not averaged.

## Ownership map (the decision spine)

| Surface | Owner | Can this change touch it? |
|---|---|---|
| Authored token values + `@theme inline` map: `packages/mapgen-studio-ui/src/styles/theme.css` | this repo (`@swooper/mapgen-studio-ui`) | **Yes — sole palette owner; the whole flip lives here** |
| TS/TSX consumers (`sonner.tsx`, `PipelineStage.tsx`, `StudioShellLayout.stories.tsx`, app `CanvasStage.tsx`) | this repo (Studio UI package + `apps/mapgen-studio`) | **Yes — migrate to `var(--x)` / `color-mix`** |
| Token guard + fixtures (`test/designTokens.test.ts`, `token-contract.json`) | this repo | **Yes — re-pin value-shapes; `authored-tokens.json` unchanged** |
| Knowledge/disposition docs (`docs/design-tokens.md`, `.design-sync/NOTES.md`, `DEFERRALS.md`, sibling `upstream-feedback.md`) | this repo | **Yes — value-form vocabulary + explorations rule** |
| Compiled `dist/styles.css` (`@property` `--tw-*` rules + `@theme` defaults + authored tokens) | Tailwind v4 build | No content changes — fidelity gate; rebuilt only |
| Classifier / `_adherence.oxlintrc.json` / `_ds_bundle.*` / synced `components/**` / `conventions.md` | claude.ai/design app + Claude Code binary | No — regenerated / app-contract; feedback + falsifier only |

## Decision 1 — value format: full `hsl()` values consumed as `var()`, not blanket oklch

The load-bearing fix is the **consumption architecture** (full color values +
`var(--x)` consumption + `@theme inline` without wrappers), NOT the color space.
shadcn's own official migration wraps existing values in `hsl()`; oklch is
optional/cosmetic for upgraded projects ("Upgraded projects are not affected …
can continue using the old colors"). The decision splits cleanly:

- **Step A (this change): wrap → `hsl()` full values, consume via `var()`.**
  `--primary: 216 18% 44%` → `--primary: hsl(216 18% 44%)`; the `@theme inline`
  map drops the `hsl()` wrapper (`--color-primary: var(--primary)`); the two
  aliases carry a bare `var(--other-token)`. Rendered colors are byte-identical
  (a lossless HSL rewrap) → zero pixel drift → the 47-component compare grades
  carry honestly; the classifier reads a real color function; JS consumes
  `var(--x)` directly; the explorations rule un-inverts.
- **Step B (deferred, separate design pass): re-author the palette in oklch.**
  The palette comments describe a hand-tuned "cartographer's instrument"
  lightness ladder; re-authoring it in oklch is a *design* decision (wider
  gamut, perceptual uniformity), not a mechanical one. It is explicitly out of
  scope here (see Decision 3).

Rationale (why A-then-B, not blanket oklch): a blanket oklch conversion buys
nothing visually — a lossless conversion produces the same sRGB pixels — while
adding conversion-rounding risk in the 47-component compare and silently
re-semanticizing a hand-tuned artifact. Full `hsl()` values capture 100% of the
classifier / convention / JS wins at zero visual risk. Falsifier for this
adjudication: if the app classifier special-cased oklch only. That is already
refuted — `#000` classifies as a color, so any full color value suffices.

Guard consequence (mechanical, decided): `test/designTokens.test.ts`
`VALUE_SHAPES.color` becomes `/^hsl\(\d{1,3}(?:\.\d+)? \d{1,3}(?:\.\d+)?% \d{1,3}(?:\.\d+)?%\)$/`
(full-hsl form — kept strict, no union with bare triplets) and
`VALUE_SHAPES.alias` becomes `/^var\(--[\w-]+\)$/`. This tightens the value-shape
leg; it does not touch the name/kind/scope partition (see Decision 4).

## Decision 2 — alpha mechanism: `color-mix(in oklab, var(--x) N%, transparent)`

All 14 opacity sites (1 in CSS at `theme.css` `hsl(var(--popover) / 0.95)`; 13
in TS/TSX) adopt `color-mix(in oklab, var(--x) N%, transparent)`. Reasons:

- It matches exactly what Tailwind v4 emits for opacity modifiers (verified in
  the built `dist/styles.css`), so the authored alpha form and the
  utility-generated alpha form are identical.
- It works identically in hand-written CSS and in TS-built inline styles, which
  is required because the alpha sites span both.
- Its browser support floor equals Tailwind v4's own floor — evergreen for any
  environment that already runs the build output.

Rejected alpha mechanisms (decided, not left open): `--alpha()` is compile-time
only and cannot express a runtime TS inline style; relative-color syntax
(`hsl(from …)`) has a newer support floor and mixed serialization across
engines. Neither is used.

## Decision 3 — oklch re-authoring is Step B, explicitly deferred

Step B is not an "optional" tail of this change and not a fallback — it is a
distinct, design-led change with its own trigger: **a deliberate
palette-evolution pass** (someone wants wider-gamut, perceptually-tuned colors).
Until that pass is chartered, the palette stays in `hsl()`. Nothing in Step A
depends on it, and Step A leaves the palette in a form (full values + `var()`)
from which an oklch re-author is a clean, isolated diff. This change does not
soften, pre-stage, or partially perform Step B.

## Decision 4 — relationship to the existing `studio-ui-design-sync` spec

The existing spec (added by `studio-ui-token-noise-disposition`) pins the
authored/framework partition by **name, kind, and scope** only; it does not
normatively pin token value form. This change's delta is therefore purely
**ADDED**: a value-form requirement layered on top. The partition requirement
survives unchanged and is not weakened — the guard still fails on any stray
custom property and on any scope mismatch; the value-shape re-pin only makes the
per-kind value assertion stricter. `authored-tokens.json` (the name→kind
fixture) is untouched because it carries no values.

## Review lanes

Three lanes gate the implementation (B2–B4) before it ships, executed as a
fan-out fold at the stack tip:

1. **Owner lane** — design review against this frame: dialect modernization (not
   checker-fixing); the zero-pixel-drift invariant; no hand-edits to synced or
   generated artifacts; Step B stays out.
2. **Correctness / cleanup fan-out** — independent finder angles over the flip
   diff: every color value wrapped in both palette blocks; every `@theme inline`
   entry and CSS rule unwrapped to `var(--x)`; the two aliases repointed; all 14
   alpha sites on `color-mix`; the silent-failure hot spot (`sonner`'s
   `--normal-bg`, which takes an invalid string if a site is missed) covered;
   the guard value-shape regexes kept strict (no bare-triplet union).
3. **Adversarial augmentation** — attack the claims the first two lanes take on
   trust: pre/post render compare proving zero drift; the pre-commit trial-build
   gate proving both compiles emit valid `color-mix` over the new map; the
   `tokenKinds` falsifier (authored colors must classify as `"color"`);
   sync-contract semantics (forced re-grade correctness; the two remote-only
   explorations snapshotted before edit — the only irreversible edge); and an
   OpenSpec cross-consistency check that the delta is additive and does not
   weaken the partition requirement.

## Rejected alternatives

- **Blanket oklch conversion (Step B folded into Step A)** — buys nothing
  visually, adds rounding risk across the 47-component compare, and
  re-semanticizes a hand-tuned ladder. Deferred, not adopted.
- **Leave the legacy dialect ("the checker is wrong")** — rejected on
  drift-tax + silent-transparent bug-class grounds; documenting around the
  dialect does not remove the recurring cost.
- **`--alpha()` for opacity** — compile-time only; cannot express TS inline
  styles.
- **Relative-color syntax for opacity** — newer support floor + mixed
  serialization.
- **Chasing findings #1/#2 to zero / editing the classifier** — contract-enforced
  noise, unreachable from the repo; DEF-017 disposition stands.
