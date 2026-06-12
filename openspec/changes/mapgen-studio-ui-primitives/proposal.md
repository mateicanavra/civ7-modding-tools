## Why

The MapGen Studio redesign needs a single canonical primitive library before
component decomposition and the rjsf re-skin can proceed. The current
`src/ui/components/ui/*` primitives encode the commodity pattern the redesign
replaces: hardcoded hex palettes (`#4b5563`, `#0f0f12`, `dark:` variants) and a
`lightMode` boolean prop threaded per call. They cannot consume the
token-and-`.dark`-class design system established by the foundation slice.

This slice builds the token-driven shadcn primitives at
`apps/mapgen-studio/src/components/ui/` so later slices have a real instrument
to assemble from.

## What Changes

- Add a canonical shadcn primitive library at
  `apps/mapgen-studio/src/components/ui/`: button, input, textarea, label,
  select, switch, checkbox, tooltip, dialog, dropdown-menu, popover, tabs,
  separator, scroll-area, and sonner (toast).
- Build every primitive ON the existing token system (`bg-background/card/
  popover`, `border/border-subtle/border-strong`, `text-foreground/
  muted-foreground`, `primary`, `ring`, `input-background`) and the `cn`
  helper. No new hardcoded palettes, no `createTheme`, no `lightMode` prop, no
  `prefers-color-scheme` theming.
- Preserve the as-built dense dimensions and the contour-focus signature:
  Button `h-8`/`h-7`, Input `h-7` 11px, Switch 36×20, 4px default radius / 8px
  floating surfaces, focus = the `--ring` luminance contour.
- Add the named type-scale tokens (`--text-data` 11px, `--text-label` 10px) the
  primitives consume, and teach `cn`'s tailwind-merge instance about them so a
  later color utility cannot clobber the size.
- Add the Radix primitive packages and `sonner` as dependencies.
- Barrel-export the library from `src/components/ui/index.ts`.

This change is ADDITIVE: it does not swap any existing call site. The legacy
`src/ui/components/ui/*` primitives remain until the migration slice.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/components/ui/**` (new),
  `apps/mapgen-studio/src/index.css` (additive type-scale tokens),
  `apps/mapgen-studio/src/lib/utils.ts` (tailwind-merge type-scale group),
  `apps/mapgen-studio/package.json` (Radix + sonner deps).
- No change to map generation, deck.gl, recipe semantics, run-in-game, the
  live-runtime poll, localStorage schema, or browserRunner gating.
