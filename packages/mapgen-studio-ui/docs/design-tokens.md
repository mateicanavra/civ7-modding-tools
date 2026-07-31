# Design tokens — vocabulary and known linter noise

## The authored token vocabulary — everything else in the stylesheets is framework plumbing

All color tokens carry full CSS color values (`oklch(…)`) and are consumed as
`var(--token)`. The palette is authored in oklch — an exact, pixel-preserving
conversion of the earlier hand-tuned `hsl()` values (same rendered sRGB),
aligned with the Tailwind v4 / shadcn canonical color space. Opacity composes
with `color-mix(in oklab, var(--token) N%, transparent)` — never
`hsl(var(--token) / alpha)`. Dark is the default (`:root, .dark`); `.light`
re-skins every color token with the hand-tuned light palette. Never hardcode
raw color literals (hex/hsl/oklch) — compose from these tokens.

| Token | Kind | Role |
|---|---|---|
| `--background` / `--foreground` | color | page substrate (the map-canvas backdrop) / primary text |
| `--card` / `--card-foreground` | color | panel surface — one felt step above the page |
| `--popover` / `--popover-foreground` | color | floating layers — a step above panels |
| `--primary` / `--primary-foreground` | color | the one accent: elevated cool-steel slate |
| `--secondary` / `--secondary-foreground` | color | quiet secondary surface |
| `--muted` / `--muted-foreground` | color | de-emphasized surface / text |
| `--accent` / `--accent-foreground` | color | ghost/hover surface |
| `--destructive` / `--destructive-foreground` | color | destructive actions |
| `--success` · `--warning` | color | status signals |
| `--border` · `--border-subtle` · `--border-strong` | color | hairline ladder: findable / within-surface divider / emphasis+focus |
| `--input` · `--input-background` | color | control border / inset control fill (darker than its panel) |
| `--ring` | color | focus contour — a luminance step, not a hue |
| `--elevation-1` · `--elevation-2` | color | felt elevation tiers (panel / floating) |
| `--surface-sunken` | color | nested cards: between page and panel |
| `--radius` | radius | 0.25rem default (inputs, buttons, tags) |
| `--font-sans` · `--font-mono` | font | Inter / JetBrains Mono — the only two families |
| `--color-border-secondary` · `--color-text-muted` | alias | legacy `var(--other-token)` aliases used by the custom scrollbar |

The repo verifies this vocabulary on every build
(`test/designTokens.test.ts` against `dist/styles.css`): every custom property
must be authored (pinned with a kind, both palettes required for colors),
`@property`-registered engine plumbing, or a snapshotted Tailwind default —
anything else fails CI, and this table is asserted to name every authored
token, so it cannot silently drift from the fixture.

## Curated token surface — what the design-system check should see

Since 2026-07-18 the package build curates the compiled stylesheet into a
truthful token surface (`scripts/curate-token-surface.mjs`, the successor to
the first-pass `annotate-token-kinds.mjs`):

1. **The `@layer properties` fallback block is stripped.** Tailwind v4 emits
   a trailing `@supports`-guarded block declaring every `--tw-*` engine var
   on `*, ::before, ::after, ::backdrop` — an emulation of `@property`
   initial values for browsers without `@property` support. Every supported
   consumer registers those vars via the `@property` rules that remain, so
   removal is render-neutral — and it keeps ~78 engine-plumbing names out of
   the app-side token discovery, which reads every custom-property
   declaration in the stylesheet.
2. **Every remaining declaration carries a `/* @kind <kind> */` annotation**
   (the classification input the app accepts): authored tokens carry their
   fixture kind, Tailwind `@theme` defaults an honest kind (`other` where
   nothing fits), and the `--tw-*` vars still assigned inside utility bodies
   an explicit `other`.

Expected check state after a sync: **no unclassified tokens** — the registry
should hold the authored tokens plus Tailwind's `@theme` defaults, and a
small `other`-kind residue of utility-internal `--tw-*` vars. A
"selector-scoped custom properties" finding may still name those utility
vars (e.g. `--tw-space-y-reverse` inside `.space-y-* :where(…)`): they are
**required** to be selector-scoped. **Do not follow the finding's advice in
any form** — a live hoist of `--tw-*` variables to `:root` breaks the
`space-*`/`divide-*`/transform/gradient/ring/filter utilities, and an
"inert" registration (`:root` defaults shadowed by the `@property` rules)
is just as wrong for a different reason: the scanner registers every
`:root`-declared name as a design token, which puts the whole `--tw-*`
engine namespace into the token registry and turns each utility class that
assigns a registered name into a bogus "theme" entry. Declaring nothing is
the mechanism: what is not declared at `:root` is not registered.

Scope note: the repo guard pins `dist/styles.css` (the package's compiled
stylesheet). If the check's findings ever shift without a matching repo-side
diff, the delta happened in the app-side bundling step — treat it as app-side,
not something to chase in the repo.

The selector-scoped residue cannot be cleared from this project: the
classifier runs app-side over regenerated artifacts (`_adherence.oxlintrc.json`
is regenerated output, not a configurable input — hand-edits to it do not
survive the next self-check), and the stylesheets here are build artifacts of
`@swooper/mapgen-studio-ui` — **never hand-edit `_ds_bundle.css`,
`styles.css`, or anything under `components/`**; edits are overwritten by the
next sync. The upstream fix request is tracked in the repo
(`openspec/changes/archive/2026-07-08-studio-ui-token-noise-disposition/workstream/upstream-feedback.md`;
deferral DEF-017 in the root ledger `docs/system/DEFERRALS.md` — distinct from
the engine-refactor project's own DEF-017).
