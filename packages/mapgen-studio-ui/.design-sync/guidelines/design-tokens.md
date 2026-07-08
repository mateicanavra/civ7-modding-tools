# Design tokens — vocabulary and known linter noise

## The authored token vocabulary (32 names — everything else in the stylesheets is framework plumbing)

All color tokens are HSL channel triplets consumed as `hsl(var(--token))` (or
`hsl(var(--token) / alpha)`). Dark is the default (`:root, .dark`); `.light`
re-skins every color token with the hand-tuned light palette. Never hardcode
hex/oklch values — compose from these.

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
| `--color-border-secondary` · `--color-text-muted` | alias | legacy `hsl(var())` aliases used by the custom scrollbar |

The repo verifies this inventory on every build (`test/designTokens.test.ts`
against `dist/styles.css`): any custom property that is neither in this list
nor Tailwind-owned fails CI, and both the dark and light declarations of every
color token are pinned.

## Known `check_design_system` findings — framework noise, do not chase

Running the design-system check in this project will report, on every sync:

1. **"~80 of ~200 tokens couldn't be classified"** — the unclassifiable names
   (`--tw-*`, `--animate-spin`, `--default-transition-*`, `--tracking-*`, …)
   are Tailwind CSS v4's own `@theme` defaults and `@property`-registered
   engine variables baked into the compiled `_ds_bundle.css`. They are not
   MapGen Studio tokens.
2. **"33 custom properties declared under component-style selectors … move
   them under `:root`"** — these are Tailwind utility-state variables (e.g.
   `--tw-space-y-reverse` inside `.space-y-* :where(& > :not(:last-child))`)
   and the universal reset. They are **required** to be selector-scoped.
   **Do not follow the finding's advice**: hoisting `--tw-*` variables to
   `:root` breaks the `space-*`/`divide-*`/transform/gradient/ring/filter
   utilities.

Also known: the generated `_adherence.oxlintrc.json` token→kind map mislabels
the semantic color tokens as `"other"` (they are colors; the HSL-triplet value
form isn't recognized). Treat the table above as the authority on kinds.

These findings cannot be cleared from this project: the classifier runs
app-side over regenerated artifacts, and the stylesheets here are build
artifacts of `@swooper/mapgen-studio-ui` — **never hand-edit `_ds_bundle.css`,
`styles.css`, or anything under `components/`**; edits are overwritten by the
next sync. The upstream fix request is tracked in the repo
(`openspec/changes/studio-ui-token-noise-disposition/workstream/upstream-feedback.md`,
deferral DEF-017).
