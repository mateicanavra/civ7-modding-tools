## Context

This is a presentation + accessibility slice on top of the already-decomposed,
already-tokenized studio shell. The hard-core behavior registry (architecture/10 §7)
is untouched: run-in-game engine, live-poll staleness/backoff, localStorage schema,
browserRunner gating, map-config path jail, and the oRPC seam are not in scope here.

## Key Decisions

### Diagnostics must be in the DOM, not hover-only

The Radix Tooltip renders `TooltipContent` lazily on hover/focus, so any text placed
*only* there is absent from server-rendered static markup and from the initial
accessibility tree. Operational diagnostics (request ids, failure reasons, recovery
hints) are exactly the content a screen-reader user and the static-markup parity
tests need. **Decision:** mirror each diagnostic onto its visible trigger via
`aria-label` (the accessible name) and an in-DOM `title` (present in static markup +
a native hover affordance), keeping the Tooltip as the sighted hover hint. This is
additive: the Tooltip content is unchanged, the trigger simply now also carries the
same text.

### Footer owns its TooltipProvider

Three of the static-markup parity tests mount `AppFooter` bare (no ancestor
`TooltipProvider`), which makes a Radix `Tooltip` throw. The shell already provides
one. **Decision:** render the footer's body inside its own `TooltipProvider`. Radix
permits nested providers, so the shell path is unaffected; the bare-mount tests no
longer crash. This is the minimal, parity-safe fix — it does not touch the run-in-game
or live plumbing.

### OptionSelect adapter over the Radix token Select

The token-driven `src/components/ui/select` is a Radix listbox with a composed
`Trigger/Content/Item` API and `value`/`onValueChange`, whereas the migrated call
sites used the legacy native `Select` with `value`/`onChange`/`options`. **Decision:**
a thin `OptionSelect` adapter exposes the simple `value`/`onValueChange`/`options`
shape so the chrome call sites migrate without restructuring. Radix disallows empty
`value`s, so an empty selection maps to a reserved sentinel internally and round-trips
back to `""` — the visible placeholder/no-selection behavior is preserved, and the
emitted values are identical.

### rjsf widgets: presentation re-skin, value plumbing preserved

The rjsf override widgets re-point at the `src/components/ui` primitives. The
`SelectWidget` moves from a native `<select>` with `<option>` children to the Radix
Select via the same sentinel mapping, while the enum→typed-value `map` and
`emptyValue` normalization stay byte-for-byte — so the authored config the form emits
is unchanged. Checkbox/Switch already used `onCheckedChange`; the only behavioral
nuance is coercing the checkbox's `boolean | "indeterminate"` to a strict boolean.

### Empty stage = "awaiting matter" (system.md craft lever #3)

The backdrop is the page substrate token (`bg-background`, named in the tokens as the
deck.gl backdrop), with the vignette and grid drawn in `--muted-foreground` at low
alpha (luminance, not chroma). The empty state gains a centered contour-framed panel
labelled "Awaiting matter" over a coarse graticule so the stage reads as a ready
survey console rather than dead space. `lightMode` is dropped from the chrome but
still forwarded to `DeckCanvas` (it governs scene rendering, out of scope).

## Risks / Trade-offs

- **Radix Select vs native select keyboard model.** The migrated dropdowns now use the
  Radix listbox interaction model instead of the OS-native `<select>`. This is a
  deliberate design-system alignment; values and `aria-label`s are preserved. The rjsf
  select keeps identical emitted values via the enum map.
- **`title` + `aria-label` duplication.** Carrying both is intentional: `title` gives
  static-markup presence + a native hover tooltip; `aria-label` is the accessible name.
  The Radix Tooltip remains the primary sighted hint.

## Out Of Scope

- Container/presentational store-reading split of the panels.
- Any change to the legacy native `Select` still used by the `fields/*` components.
- Deck.gl scene rendering / `lightMode` math.
