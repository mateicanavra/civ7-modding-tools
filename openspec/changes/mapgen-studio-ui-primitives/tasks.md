## 1. Dependencies And Tokens

- [x] 1.1 Add the Radix primitive packages (`@radix-ui/react-label`, `-select`,
  `-switch`, `-checkbox`, `-tooltip`, `-dialog`, `-dropdown-menu`, `-popover`,
  `-tabs`, `-separator`, `-scroll-area`, `-slot`) and `sonner`.
- [x] 1.2 Add the named type-scale tokens (`--text-data` 11px, `--text-label`
  10px with line heights) to the `@theme inline` block in `src/index.css`.
- [x] 1.3 Extend the `cn` tailwind-merge instance with a `font-size` class group
  for `text-data`/`text-label` so a later `text-*` color utility cannot clobber
  the size.

## 2. Primitive Components

- [x] 2.1 Add `button.tsx` (cva variants, asChild slot, h-8/h-7 sizes, primary
  fill, contour focus ring).
- [x] 2.2 Add `input.tsx` and `textarea.tsx` (inset substrate, h-7, 11px,
  border-strong focus).
- [x] 2.3 Add `label.tsx`.
- [x] 2.4 Add `select.tsx` (Radix listbox, dense trigger, popover-tier content).
- [x] 2.5 Add `switch.tsx` (36×20, primary fill) and `checkbox.tsx` (primary
  fill).
- [x] 2.6 Add `tooltip.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `popover.tsx`
  (floating layers with shadow + 8px radius).
- [x] 2.7 Add `tabs.tsx` (active = steel contour rule), `separator.tsx`
  (border-subtle), `scroll-area.tsx` (quiet hairline thumb).
- [x] 2.8 Add `sonner.tsx` (Toaster bound to tokens, theme read from the `.dark`
  class, no next-themes / no prefers-color-scheme).

## 3. Barrel And Verification

- [x] 3.1 Barrel-export the library from `src/components/ui/index.ts` (re-export
  `toast` from sonner for convenience).
- [x] 3.2 Verify `bun run check` (tsc --noEmit) is clean.
- [x] 3.3 Verify `bun run build` succeeds including the worker-bundle check.
- [x] 3.4 Render the primitives in a temporary gallery harness against the
  running preview; confirm no console errors and that computed dimensions/colors
  match the tokens (primary `hsl(216 18% 44%)`, Button h-8, Input h-7, 11px type).
- [x] 3.5 Run `bun run openspec -- validate mapgen-studio-ui-primitives
  --strict`.
