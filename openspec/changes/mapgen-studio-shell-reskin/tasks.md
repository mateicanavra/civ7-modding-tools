## 1. Substrate-Elevation Token Reskin

- [ ] 1.1 Reskin `AppBrand.tsx`: floating pill + hover card → `bg-popover`,
  `border`/`border-subtle`, `text-foreground`/`text-muted-foreground`; drop the
  `lightMode` hex ternaries.
- [ ] 1.2 Reskin `ViewControls.tsx`: dock → `bg-popover`, dividers → `bg-border`,
  icon buttons → `text-muted-foreground hover:bg-accent`, active → `bg-muted`.
- [ ] 1.3 Reskin `AppHeader.tsx`: world-settings docks → `bg-popover`, dividers,
  labels → `text-muted-foreground`; setup button onto tokens.
- [ ] 1.4 Reskin `RecipePanel.tsx`: panel → `bg-popover`, section headers,
  borders → `border-subtle`, sunken JSON view → `surface-sunken`, save menu →
  `bg-popover`; dirty ring → `ring-ring`/`border-primary`.
- [ ] 1.5 Reskin `ExplorePanel.tsx`: panel → `bg-popover`, list item active/
  inactive onto tokens, badges → `bg-muted`, range accents → `accent-primary`,
  native selects onto `bg-input-background`/`border-input`.
- [ ] 1.6 Reskin `AppFooter.tsx`: status/live/run docks → `bg-popover`, dividers,
  text tiers onto tokens; dirty/auto-run rings → `ring-ring`/`border-primary`;
  keep semantic status-dot hues.
- [ ] 1.7 Reskin `App.tsx` root background and error strip onto `bg-background`
  and `bg-destructive`/`text-destructive` tokens.

## 2. Primitive Adoption And Tooltips

- [ ] 2.1 Wrap the shell in a single `TooltipProvider`; convert native `title=`
  attributes in the shell (ViewControls, AppFooter, RecipePanel, ExplorePanel)
  to the shadcn `Tooltip`.
- [ ] 2.2 Swap shell primitive call sites (Button, Input, Select, Switch) to
  `@/components/ui` where the prop surface is compatible.

## 3. Dialog And Toast Migration

- [ ] 3.1 Migrate the RecipePanel reset `AlertDialog` to the shadcn `Dialog`.
- [ ] 3.2 Migrate `PresetDialogs.tsx` (error/save/confirm) to the shadcn
  `Dialog`, preserving open/confirm/cancel semantics.
- [ ] 3.3 Migrate `ToastProvider`/`useToast` to the sonner `Toaster` + `toast`,
  mapping `{ variant }` to `toast.success`/`toast.error`/`toast.info`/`toast`.

## 4. Verification

- [ ] 4.1 Verify `bun run check` (tsc --noEmit) is clean.
- [ ] 4.2 Verify `bun run build` succeeds including the worker-bundle check.
- [ ] 4.3 Start the preview, screenshot the shell in dark mode; confirm no
  console errors and that the squint test reads hierarchy (page < dock <
  floating) with the single slate accent.
- [ ] 4.4 Run `bun run openspec -- validate mapgen-studio-shell-reskin --strict`.
