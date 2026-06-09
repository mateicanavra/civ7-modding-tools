## Why

MapGen Studio's UI has no design system. Color lives in 242 arbitrary hex
utilities across components; three disagreeing dark palettes exist
(`tailwind.config.js`, `src/index.css`, `src/ui/hooks/useTheme.ts`); the declared
accent (indigo `#5e5ce6`) is not the used accent (slate `#4b5563`); theming is
structurally broken (`createTheme()` builds JIT-invisible runtime classes, and a
`lightMode` prop threaded through ~24 files fights OS `prefers-color-scheme`); the
substrate is flat (page/panel/nested ~4% apart, no felt hierarchy); and overlay
motion classes (`animate-in`) are dead (no keyframes installed).

This is the FIRST domino of the MapGen Studio redesign (see
`docs/projects/mapgen-studio-redesign/FRAME.md`). Every later component slice
consumes the system this change establishes. Direction is user-confirmed and
recorded in `apps/mapgen-studio/.interface-design/system.md`: a dense, dark-first
**cartographer's instrument** with an elevated cool-steel **slate** accent, a
robust **substrate-elevation** system as the primary craft lever, and a
**contour-line** focus signature carried by luminance, not chroma.

## What Changes

- Migrate the studio build from Tailwind v3 (config + PostCSS) to **Tailwind v4**
  (CSS-first `@theme`, `@tailwindcss/vite`), removing `tailwind.config.js`,
  `postcss.config.js`, and `autoprefixer`.
- Establish a single **tokenized design system**: HSL design tokens in `:root` +
  `.dark`, including a felt substrate-elevation tier scale and a border
  progression; map them through `@theme` to Tailwind utilities and shadcn aliases.
- Initialize **canonical shadcn/ui** scaffolding: `components.json`, `lib/utils.ts`
  (`cn`), and the New York / CSS-vars / slate base configuration. (Primitive
  components are migrated in a later change.)
- Repair theming: adopt shadcn's single **`.dark` class** strategy with a
  no-flash bootstrap (default dark), replacing the `prefers-color-scheme` + dead
  `createTheme()` mechanism. The legacy `lightMode` prop path is removed as
  components migrate (later changes); this change makes the `.dark` system
  authoritative and lets both coexist without conflict.
- Install a real overlay **motion** layer so the previously dead `animate-in`
  transitions run; commit the single accent and self-host fonts.

This change is **foundation only**. It does not re-skin existing components or
change their behavior; their 242 arbitrary hex classes keep rendering unchanged
until later migration slices retire them.

## Affected Owners

- `apps/mapgen-studio` (build config, `src/index.css`, `src/lib/utils.ts`,
  `components.json`, theme bootstrap)

## Out Of Scope

- Component primitive migration to shadcn, rjsf re-skin, App.tsx decomposition,
  client-state/server-data rework, and the studio server — each its own later
  change in the redesign workstream.
