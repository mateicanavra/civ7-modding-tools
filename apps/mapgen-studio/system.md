# mapgen-studio — Design System (extracted)

> Extracted from the current codebase (`src/**/*.tsx`, `src/index.css`, `tailwind.config.js`, `src/ui/hooks/useTheme.ts`) on 2026-06-08.
> This captures the **current** design language as-built. It is the baseline the shadcn migration must preserve (density, dark-first palette, border-only depth) while formalizing tokens.

## 1. Design DNA

A **dense, dark-first developer tool**. Think pro audio / DAW / data-explorer, not a marketing app. Information density is the point: micro-typography (10–11px), tight 4px spacing rhythm, hairline borders instead of shadows, and a restrained near-monochrome palette with a single cool accent. Map visualization (deck.gl) is the hero; chrome recedes.

- **Mood**: technical, quiet, high-density, focused.
- **Hierarchy mechanism**: borders + background-tier shifts (not shadow, not color).
- **Personality risk today**: reads as *commodity dark dashboard* — defaults dominate (gray accent, flat focus rings, no motion). The craft work is to make density feel *intentional*, not cramped.

## 2. Color

Two hand-maintained palettes (`light` / `dark`) live in **three** places that disagree (see audit): `tailwind.config.js`, `src/index.css` CSS vars, and `src/ui/hooks/useTheme.ts`. The values below are the de-facto source of truth (`useTheme.ts`, matched by hardcoded hex frequency in components).

### Dark (primary — app defaults to dark)
| Role | Value | Notes |
|---|---|---|
| bg / page | `#0a0a0f` | deck.gl backdrop tint |
| bg / panel | `#141418` | cards, headers |
| bg / panel-alt | `#111114` | |
| bg / nested | `#0f0f12` | inputs, nested cards |
| bg / hover | `#1a1a1f` | |
| bg / active | `#222228` | secondary buttons, tags |
| border / default | `#2a2a32` | **the workhorse hairline** (31 uses) |
| border / subtle | `#222228` | dividers (20 uses) |
| border / strong | `#3a3a44` | input focus border (14 uses) |
| text / primary | `#e8e8ed` | (36 uses — most frequent hex) |
| text / secondary | `#8a8a96` | labels (19 uses) |
| text / muted | `#5a5a66` | placeholders, help (14 uses) |
| accent / interactive | `#4b5563` | primary button, switch-on, active tag (19 uses) |
| accent (system var) | `#5e5ce6` | indigo — declared in CSS but **barely used** |

### Light
| Role | Value |
|---|---|
| bg / page | `#f5f5f7` |
| bg / panel | `#ffffff` |
| border / default | `#e5e7eb` / `#e5e5e5` (drifts) |
| text / primary | `#1f2937` (26 uses) |
| text / secondary | `#6b7280` (17 uses) |
| accent | `#4b5563` |

### Semantic / status
- error/destructive: `text-rose-400`, `bg-red-500`, `text-red-600` (inconsistent — rose vs red).
- success: `text-emerald-500`. info: `text-blue-500`.

**Observation:** the *declared* accent (`#5e5ce6` indigo) is not the *used* accent (`#4b5563` slate). The brand is effectively neutral-slate. This is the single biggest "commodity" tell.

## 3. Typography

- **Sans**: Inter (400/500/600/700). **Mono**: JetBrains Mono. Both via Google Fonts `@import` in `index.css` (render-blocking — flag).
- **Scale (actual, by frequency):**
  | Token | Size | Uses | Role |
  |---|---|---|---|
  | — | **11px** | 44 | body / field text / values (the default) |
  | — | **10px** | 38 | labels, uppercase eyebrows, captions |
  | — | 12px | 7 | section subtitles |
  | — | 13px | 4 | |
  | text-sm (14px) | 14 | 4 | dialog titles |
  | — | 9px | 3 | dense badges |
- **Weights**: `font-medium` (28), `font-semibold` (14). No bold in UI chrome.
- **Pattern**: uppercase + `tracking-wider` + 10px for eyebrow labels (e.g. AppHeader "Config", "Resources").
- **Type is set in arbitrary `text-[11px]` values**, not a named scale — every size is ad-hoc.

## 4. Spacing

- **Base unit: 4px.** Rhythm is tight.
- Scale by frequency: `gap-2`(8px, 47×) ≫ `px-3`(12px, 27×) > `py-2`(8px, 14×) > `gap-1`(4px, 13×) > `gap-1.5`(6px) > `py-2.5`(10px) > `p-2`/`p-2.5`(8/10px).
- **Effective scale: 4, 6, 8, 10, 12, 16 px.** Above 16px is rare (panel padding only).
- Field rows: `py-1` (4px) vertical, `gap-3` label↔input. Cards: `p-2.5` (10px). Nested cards: `p-2` (8px).

## 5. Radius

- `rounded` (4px, 28×) = default for inputs/buttons/tags.
- `rounded-lg` (8px, 15×) = cards, dialogs, dropdowns, toasts.
- `rounded-full` (8×) = pill tags, switch track.
- `rounded-md` (6px, 2×) = rare/inconsistent.
- **Effective scale: 4 / 8 / full.** (6px and config's `xl`/`2xl` are noise.)

## 6. Depth

- **Border-only.** 148 border utilities vs **7** shadows. Shadows appear only on floating layers (dialog `shadow-xl`, toast `shadow-lg`, dropdown `shadow-lg`).
- Tiering by **background lightness step** (page → panel → nested) + 1px hairline. This is the core depth language.
- `backdrop-blur-sm` (11×) on the floating header/setup bar — glassy chrome over the map.

## 7. Motion

- **Minimal.** `transition-colors` (29×) is ~all of it; `transition-transform` (5×) for chevron rotation; one `animate-pulse-subtle` (2s) for running state.
- Durations: 150ms (fast) / 200ms (normal), declared as CSS vars but mostly implicit Tailwind defaults.
- `animate-in fade-in-0 zoom-in-95` strings appear on dialog/toast/tooltip **but no `tailwindcss-animate` plugin is installed** — these classes are dead (no keyframes). Motion is effectively absent on overlays.

## 8. Component patterns

| Pattern | Spec (as-built) |
|---|---|
| **Button** | h-8 default / h-7 sm / h-7 icon; `px-3`; `rounded`; `text-sm`/`text-xs`; variants default(slate)/outline/secondary/ghost/link/destructive; CVA-driven. Focus ring `ring-1 ring-gray-400`. |
| **Input / Textarea / Select** | h-7; `text-[11px]`; `px-2.5`; `rounded`; 1px border; focus = border color shift + `ring-1`. Native `<select>` with custom chevron. |
| **Switch** | 36×20 track, 16px thumb, `rounded-full`, peer-checked slides; on = `#4b5563`. |
| **Checkbox** | 16px, `rounded`, Check icon on check. |
| **Field row** | `flex justify-between gap-3 py-1`; label `text-[11px] min-w-[96px]` secondary color, input flex-1. |
| **Card (stage section)** | `rounded-lg border p-2.5`, header (semibold) + `border-t` divider + content. |
| **Nested card / array item** | `rounded-md border p-2`, deeper bg tier. |
| **Tag / pill** | `rounded-full border px-2 py-1 text-[11px]`, active = slate fill. |
| **Dropdown menu** | hand-rolled: trigger button + `fixed inset-0` click-catcher + absolutely-positioned `rounded-lg border shadow-lg` list of `text-[11px]` rows. |
| **Dialog** | hand-rolled overlay `bg-black/50` + centered `max-w-[320px] rounded-lg border p-5 shadow-xl`. |
| **Toast** | bottom-center stack, `rounded-lg border shadow-lg`, icon + 12px message + dismiss. |
| **Eyebrow label** | uppercase, `tracking-wider`, 10px, muted. |

## 9. Theming mechanism (as-built — flag)

- Dark mode is delivered by a **`lightMode` boolean prop threaded through 24 files** + a `Theme` object from `createTheme()`, NOT by Tailwind `dark:` variants.
- Tailwind `darkMode` is unset → defaults to `media` (`prefers-color-scheme`). So `dark:` utilities (13 scattered uses) and the `lightMode` prop **fight each other**; a user who picks "light" while their OS is dark gets mixed results.
- `createTheme()` builds classes via **runtime string interpolation** (`` `bg-[${p.bg.page}]` ``) — Tailwind JIT cannot see these, so most of those classes never get generated. (See audit; this is a real bug, not just smell.)

## 10. Target north star (for the redesign)

Keep the DNA — dense, dark-first, border-tiered, micro-type, single accent — but:
1. Make the accent **intentional** (commit to indigo `#5e5ce6` or a deliberate slate; stop declaring one and using another).
2. Formalize the 11/10px type, 4px spacing, 4/8 radius, border-tier depth as **named tokens** (shadcn HSL CSS vars + `@theme`).
3. Replace `lightMode`-prop theming with shadcn's `.dark` class strategy (single switch, no prop drilling).
4. Add real overlay motion (`tailwindcss-animate` / tw-v4 `tw-animate-css`) so dialogs/toasts/dropdowns animate as the dead `animate-in` classes intended.
