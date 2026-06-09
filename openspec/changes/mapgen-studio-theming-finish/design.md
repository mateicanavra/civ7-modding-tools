# Design — mapgen-studio-theming-finish

## Context

`system.md` mandates a single `.dark`-class theming strategy with NO `createTheme`,
NO `lightMode` prop, and NO raw-hex palette. Prior slices established the tokens and
reskinned the chrome onto them, but left the legacy runtime theme machinery in place
(threaded for "call-site compatibility"). This slice removes the machinery so the
token system is the sole theming mechanism.

## The one legitimate runtime light/dark boolean

`useThemePreference().isLightMode` is retained, but its scope is now narrowed to a
single concern: the deck.gl background grid color.

- The chrome (HTML/SVG) is themed by CSS tokens that re-resolve when the `.dark`
  class flips — it never needs a JS boolean.
- `DeckCanvas` draws the background grid into a WebGL/`<canvas>` surface with a
  literal RGBA tuple (`lightMode ? [0,0,0,16] : [255,255,255,12]`). A canvas pixel
  cannot read a CSS class, so this genuinely needs the runtime boolean. It is a
  *render input*, threaded `StudioProviders → StudioShell → CanvasStage →
  DeckCanvas`, and explicitly NOT a chrome theming prop. Touching it would change
  Deck.gl output (hard core §7), so it is preserved verbatim.

This is why "delete every `lightMode`" is interpreted as "delete every chrome-theming
`lightMode`": the canvas path is out of the theming-repair scope by construction.

## Why the removed chrome props were safe to drop

Each consumer (`AppHeader`/`RecipePanel`/`ExplorePanel`/`AppFooter`/`AppBrand`/
`ViewControls`/`PresetDialogs`/`SchemaConfigForm`) already carried a "Token-driven
chrome; theme follows the single `.dark` class" body from a prior reskin slice. The
`theme`/`lightMode`/`isLightMode` props they still *accepted* were inert — not read
in any styling branch (verified by grep: the only reads were re-forwarding to a
child that also ignored them). Removing an inert prop is a no-op at runtime, so
parity holds.

`createTheme()` specifically produced `bg-[${hex}]` / `text-[${hex}]` classes via
runtime string interpolation. Tailwind's JIT scanner cannot see interpolated
arbitrary values, so those classes never existed in the compiled CSS — the "theme
object" was already non-functional. Deleting it removes a latent bug, not a working
code path.

## rjsf form chrome: `getFormTheme(lightMode)` → token bundle

The config form is the highest-traffic live surface (re-rendered on every keystroke
in a field). `getFormTheme` branched on `lightMode` to return raw-hex class bundles.
It is replaced by one module-level `FORM` constant of token classes:

| former bundle key | token class |
| --- | --- |
| card | `bg-card border-border` |
| nested | `bg-muted/40 border-border-subtle` |
| divider | `border-border` |
| label | `text-muted-foreground` |
| muted | `text-muted-foreground/70` |
| text | `text-foreground` |
| borderSubtle | `border-border-subtle` |
| button | `bg-muted text-foreground border-border hover:bg-accent` |

The former `buttonActive` (`bg-[#4b5563] text-white`) had no call site in the
templates and is dropped. Raw sizes map to the named scale: `text-[11px]`→`text-data`
(11px, matching line-height token), `text-[12px]`→`text-xs`, and the error color
`text-rose-400`→`text-destructive` (the committed rose token from `system.md`).

## Dead-code removal scope

- The `String/Number/Boolean/Select/Array` field components and `fields/styles.ts`
  (`getInputStyles(lightMode)`) had zero importers outside the `fields/` directory —
  the live config form is driven by the token-based rjsf widgets, not these. They
  are the *only* consumers of the legacy `ui/components/ui/*` primitives (the
  parallel pre-shadcn `Input/Select/Checkbox/Switch/...` carrying `lightMode`), so
  both sets are deleted together. `FieldRow` (token-free, used by `rjsfTemplates`)
  is kept.
- The `ui/components/index.ts` barrel that re-exported the deleted `./ui` was itself
  unreferenced; it is trimmed rather than left dangling.

## Casts (`as unknown as`) — scope note

Task item 4 asked to centralize "query→view `unknownRecord` casts behind the
`readErrorData`-style accessor where reasonable." The remaining casts in
`useSetupDataQueries.ts` (`body.configurations as unknown as …`,
`body.catalog as unknown as Civ7SetupCatalog`) are SUCCESS-body projections from the
contract output type to the local view type — a *different* shape from
`ORPCError.data` recovery, which `readErrorData<T>()` already centralizes (delivered
in `mapgen-studio-rigor`). Forcing the success-body casts through `readErrorData`
would be semantically wrong, and a generic `as unknown as` wrapper would add
indirection without added safety. They are therefore left as-is; this is the
"where reasonable" boundary.

## Parity statement

Presentation-only. No control value, run-in-game flow, live-poll cadence, or
localStorage schema is touched. Dark mode renders identically (same tokens). Light
mode now resolves through the real token branch instead of JIT-invisible interpolated
hex — a correction, not a behavior change.
