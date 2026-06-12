## Why

Observed live (2026-06-11): the explore panel's view toolbar renders **Render**
and **Space** as loose rows of icon-only buttons floating next to 10px eyebrow
labels. Without a container boundary, the option sets read as decoration rather
than as mutually-exclusive controls, and the active state (a subtle background
shift on one tiny icon) is easy to miss. Discoverability relies entirely on
hover tooltips.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-2-design-fixes.md` (issue 8)
- `apps/mapgen-studio/.interface-design/system.md` (substrate elevation: inputs
  inset on `input-background`; contour-by-luminance active states)

## What Changes

- The Render and Space option clusters in `ExplorePanel`'s view toolbar become
  **segmented controls**: each cluster wraps in an inset container
  (`bg-input-background`, hairline border, 2px padding), and the active segment
  lifts one substrate tier (`bg-muted text-foreground`) — the same
  inset-input / raised-active language the rest of the instrument uses.
- Per-option tooltips, `aria-label`s, and `aria-pressed` semantics are preserved
  exactly; the eyebrow labels (RENDER / SPACE) stay.
- Standalone toggles in the same toolbar (fit, edges, debug) are NOT grouped —
  they are independent actions, not exclusive options; their styling is untouched.

## Out Of Scope / Parity Guarantees

- No behavior change: same options, same callbacks, same selected-state wiring.
- No new icons or relabeling; this is container/affordance styling only.

## Verification Gates

- `bun run openspec -- validate mapgen-studio-explore-toolbar --strict`
- tsc + mapgen-studio vitest project green
- Visual proof on :5173 (dark + light): Render/Space read as bounded segmented
  controls with an unambiguous active segment.
