## 1. Tailwind v4 migration

- [ ] 1.1 Add `tailwindcss@4`, `@tailwindcss/vite`, `tw-animate-css`; remove
  `autoprefixer`. Add the `@tailwindcss/vite` plugin to `vite.config.ts` (do not
  touch the existing `/api` middleware).
- [ ] 1.2 Delete `tailwind.config.js` and `postcss.config.js` (CSS-first v4); fold
  the still-live bits (font families, `pulse-subtle`) into CSS.
- [ ] 1.3 Rewrite `src/index.css` head to `@import "tailwindcss"` +
  `@import "tw-animate-css"` + `@custom-variant dark`.

## 2. Token system

- [ ] 2.1 Define the cartographer's-instrument HSL tokens in `:root` (light) and
  `.dark` (dark) per `apps/mapgen-studio/.interface-design/system.md`: background/
  foreground, card/popover, muted, primary (elevated steel slate),
  primary-foreground, border/input, ring (contour luminance), destructive, radius.
- [ ] 2.2 Add the felt **substrate-elevation** tier scale (page→panel→nested→
  floating) and a **border progression** (subtle/default/strong) — the primary
  craft lever; widen the lightness steps so the squint test shows hierarchy.
- [ ] 2.3 Map tokens through `@theme inline` to Tailwind color/radius utilities and
  shadcn aliases. Preserve the legacy `--color-*` vars (focus/scrollbar/select
  still reference them) by re-pointing them at the new tokens.

## 3. shadcn scaffolding

- [ ] 3.1 Add `components.json` (New York, CSS vars, base color slate, path
  aliases) and `src/lib/utils.ts` exporting `cn` (clsx + tailwind-merge).

## 4. Theming repair + craft foundation

- [ ] 4.1 Add a no-flash `.dark` bootstrap (inline head script, default dark,
  localStorage-backed) and make `.dark` authoritative; keep a
  `prefers-color-scheme` fallback for first paint during coexistence.
- [ ] 4.2 Replace the global `:focus-visible` outline with the contour-ring focus
  signature (ring token, luminance step). Self-host Inter + JetBrains Mono
  (remove the render-blocking Google Fonts `@import`).

## 5. Verify

- [ ] 5.1 `tsc --noEmit` clean; `vite build` succeeds; worker-bundle check passes.
- [ ] 5.2 App renders in dark and in light (via `.dark` toggle) with no regression
  to existing hex-styled components; capture a screenshot diff of the live app.
