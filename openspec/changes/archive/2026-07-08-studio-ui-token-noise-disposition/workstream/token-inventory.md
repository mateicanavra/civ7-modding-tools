# Token inventory — extracted from the current `_ds_bundle.css`

> Provenance: archived verbatim from the 2026-07-02 handoff packet
> (`2026-07-02_ds-sync-tailwind-fix.zip` →
> `scraps/design_handoff_ds_sync_token_noise/token-inventory.md`), the exact
> allow/deny material behind this change. The repo's live equivalents are
> `packages/mapgen-studio-ui/test/fixtures/authored-tokens.json` and
> `test/fixtures/framework-tokens.json`, verified against `dist/styles.css`
> on every build. Note: the KEEP list below (section B) mixes authored tokens
> with Tailwind-emitted scale defaults; the committed fixtures partition those
> apart (32 authored / 26 snapshot / 78 `@property`) — see tasks.md 2.1.

Source: MapGen Studio DS project, compiled `_ds_bundle.css` (Tailwind CSS v4.3.0).
Extraction: brace-tracking scan of every `--name:` declaration + every `@property` at-rule.

## Summary counts
| Metric | Count |
|---|---|
| Unique custom-property names declared | 136 |
| `@property`-registered (`--tw-*` composition vars) | 78 |
| Names appearing at `:root` / `:host` | 58 |
| Names appearing under utility/class/`&` selectors | 53 |
| Names appearing in the universal `*, ::before, ::after` reset | 78 |

Prefix groups: `--tw-*` = 78 · `--color-*` = 9 · `--tracking-*` = 5 · `--default-*` = 4 ·
`--font-*` = 4 · `--container-*` = 2 · `--text-*` = 2 · `--animate-*` = 1 · `--blur-*` = 1 ·
`--leading-*` = 1 · (other / authored semantic) = 29.

---

## A. EXCLUDE from the authored-token scan — Tailwind generated plumbing

### A1. `@property`-registered composition/animation vars (78) — the "selector-scoped" finding
These are declared inside utility rules and reset on `*`. They must NOT move to `:root`.
```
--tw-animation-delay, --tw-animation-direction, --tw-animation-duration, --tw-animation-fill-mode,
--tw-animation-iteration-count, --tw-backdrop-blur, --tw-backdrop-brightness, --tw-backdrop-contrast,
--tw-backdrop-grayscale, --tw-backdrop-hue-rotate, --tw-backdrop-invert, --tw-backdrop-opacity,
--tw-backdrop-saturate, --tw-backdrop-sepia, --tw-blur, --tw-border-style, --tw-brightness,
--tw-contrast, --tw-divide-y-reverse, --tw-drop-shadow, --tw-drop-shadow-alpha, --tw-drop-shadow-color,
--tw-drop-shadow-size, --tw-duration, --tw-enter-blur, --tw-enter-opacity, --tw-enter-rotate,
--tw-enter-scale, --tw-enter-translate-x, --tw-enter-translate-y, --tw-exit-blur, --tw-exit-opacity,
--tw-exit-rotate, --tw-exit-scale, --tw-exit-translate-x, --tw-exit-translate-y, --tw-font-weight,
--tw-gradient-from, --tw-gradient-from-position, --tw-gradient-position, --tw-gradient-stops,
--tw-gradient-to, --tw-gradient-to-position, --tw-gradient-via, --tw-gradient-via-position,
--tw-gradient-via-stops, --tw-grayscale, --tw-hue-rotate, --tw-inset-ring-color, --tw-inset-ring-shadow,
--tw-inset-shadow, --tw-inset-shadow-alpha, --tw-inset-shadow-color, --tw-invert, --tw-leading,
--tw-opacity, --tw-outline-style, --tw-ring-color, --tw-ring-inset, --tw-ring-offset-color,
--tw-ring-offset-shadow, --tw-ring-offset-width, --tw-ring-shadow, --tw-rotate-x, --tw-rotate-y,
--tw-rotate-z, --tw-saturate, --tw-sepia, --tw-shadow, --tw-shadow-alpha, --tw-shadow-color,
--tw-skew-x, --tw-skew-y, --tw-space-y-reverse, --tw-tracking, --tw-translate-x, --tw-translate-y,
--tw-translate-z
```

### A2. Tailwind `@theme` framework defaults (~12) — part of the "unclassified" finding
Emitted into the compiled `:root`/`@theme` block; framework-owned, not authored here.
```
--animate-spin, --blur-sm, --default-font-family, --default-mono-font-family,
--default-transition-duration, --default-transition-timing-function, --leading-relaxed,
--tracking-tight, --tracking-normal, --tracking-wide, --tracking-wider, --tracking-widest
```
(If using Option B / repo annotation instead of exclusion:
font → `--default-font-family`, `--default-mono-font-family`, `--tracking-*`, `--leading-relaxed`;
spacing → `--blur-sm`; other → `--animate-spin`, `--default-transition-duration`,
`--default-transition-timing-function`.)

---

## B. KEEP — genuine authored tokens (must still classify correctly)
These are the real design tokens; the exclusion in Option A must not catch them.

**Colors / semantic surfaces** (currently mis-tagged `"other"` in `_adherence.oxlintrc.json`):
```
--background, --foreground, --card, --card-foreground, --popover, --popover-foreground,
--primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground,
--accent, --accent-foreground, --destructive, --destructive-foreground, --success, --warning,
--border, --border-subtle, --border-strong, --input, --input-background, --ring, --surface-sunken
```
**Palette colors:** `--color-*` (9).
**Radius:** `--radius`.
**Shadow / elevation:** `--elevation-1`, `--elevation-2`.
**Spacing:** `--spacing`, `--container-sm`, `--container-lg`.
**Type scale:** `--text-*`, `--font-sans`, `--font-mono`, `--font-weight-medium`, `--font-weight-semibold`.

---

## C. Known miscategorizations in `_adherence.oxlintrc.json` (secondary cleanup)
Auto-generated map with a flawed name heuristic. Representative errors:
```
--tw-translate-y        : "color"   → should be excluded (or "other"); cf. --tw-translate-x: "spacing"
--tw-backdrop-blur      : "color"   → other
--tw-duration           : "color"   → other
--tw-gradient-position  : "color"   → other
--background            : "other"   → color
--primary               : "other"   → color
--destructive           : "other"   → color
--foreground/--card/--popover/--secondary/--muted/--accent/--border/... : "other" → color
```
Fix the generator (framework-prefix exclusion + real color detection), or correct by hand if
the file is not generated.
