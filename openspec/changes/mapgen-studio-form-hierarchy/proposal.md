## Why

Measured in the running app (2026-06-11): rjsf field **labels** and **helper
descriptions** render at the same size (11px) and the same color
(`text-muted-foreground`, rgb(143,143,153)). With no typographic separation, the
recipe form reads as a wall of indistinguishable gray text — the single biggest
contributor to the user's "squished" verdict that is not geometry.

Separately, the field template renders its error live region whenever rjsf's
`errors` prop is truthy — but `errors` is a React **element** (the ErrorList
wrapper), which is *always* truthy, so the form mounts ~40 empty
`role="alert"` live regions (confirmed via DOM query: 40 alert nodes, all empty).
Screen readers register every one of them.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (issues 4–5)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-2 amendment: labels a full tier above descriptions; §Type named scale)
- `openspec/changes/mapgen-studio-a11y-fixes` (error-association contract this change must preserve: `id="${id}__error"` + widget `aria-describedby`)

## What Changes

- **Label tier split** in `rjsfTemplates.tsx`: field labels move from
  `text-muted-foreground` to **`text-foreground`** (keeping `text-data font-medium`),
  while descriptions/help/gs-comments stay on the muted tier. Labels become
  scannable anchors; prose recedes.
- **Same split in the hand-rolled field set** (`src/ui/components/fields/styles.ts`
  and friends) so non-rjsf fields (world panel etc.) match.
- **Empty-alert fix**: the `role="alert"` error region renders only when
  `props.rawErrors?.length` is non-empty (rjsf's documented raw error strings),
  not when the always-truthy `errors` element exists. The error id/association
  contract from `mapgen-studio-a11y-fixes` is preserved exactly for fields that DO
  have errors — widgets already gate `aria-describedby` on `rawErrors`, so ids
  stay in lockstep.

## Out Of Scope / Parity Guarantees

- No schema, validation, value, or submission behavior changes; presentation +
  live-region mounting only.
- No font-size changes — the named scale (`text-data`/`text-label`) is untouched;
  this is a color/weight hierarchy change.
- Geometry (widths, heights, scroll) is C1.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-form-hierarchy --strict`
- tsc + mapgen-studio vitest project green
- Visual proof on :5173: labels visibly separate from helper prose (dark + light);
  DOM query shows zero empty `role="alert"` nodes; a forced validation error still
  renders an associated alert region.
