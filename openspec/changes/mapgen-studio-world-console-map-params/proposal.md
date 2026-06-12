# World console is map-parameter-only — Resources leaves the UI (plumbing stays)

## Why

The user removed Resources from the map console: it is not a parameter the
studio pipeline consumes today, so authoring it from the World bar promises
an effect the map doesn't deliver. The original ask ("clean it up all the
way through") was explicitly revised mid-flight: **do not delete the backend
plumbing** — another stack carries the resources vertical (placement S3
demand planners / S5 resource-start support / A2 live resource-policy
evidence), and the `MapInfo.StudioResourcesMode` wire was deliberately
reserved for it. The codex-stack design doc records the intent verbatim:
"Studio `resourcesMode` is carried as `MapInfo.StudioResourcesMode` in
browser runs only (currently informational; not consumed by the pipeline)."
Verified before this change: no reader of `StudioResourcesMode` exists on
any branch; the only touch points are the worker write and that doc note.

This slice also codifies the zone boundary that settles "where does this
control go" questions: **a control belongs to the World console iff the map
pipeline reads it to generate the map; a setting only the Civ7 session
reads belongs to Game setup.** Players stays in the World bar because
`playerCount` is a pipeline input (worker → `PlayersLandmass1/2` → landmass
balancing/placement in the standard runtime); leader/civ/difficulty/speed
have no pipeline reads and stay in the Game-setup disclosure. Resources,
having no pipeline read TODAY, gets no authoring control — when the
resources vertical starts consuming `StudioResourcesMode`, the same rule
re-admits the select.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-5-design-fixes.md` (X1 frame —
  the falsifier "if the user treats resource mode as game setup, move one
  select" fired in the third direction: it is neither game setup nor a live
  map parameter)
- `apps/mapgen-studio/.interface-design/system.md` (Pass-5 amendment —
  zone-boundary rule)

## What Changes

- `AppFooter.tsx`: the Resources label + select leave the footer. The
  History affordance drops its resources line too (label, `aria-label`,
  tooltip) — the tooltip describes the last run in the console's own
  vocabulary, and resources is no longer part of it. Footer reads:
  World · status · History · Size · Players · Seed · reroll · auto-run ·
  Run.
- **Nothing else.** `WorldSettings.resources`, defaults, persistence,
  fingerprints, run-request fields, proof identity, and the worker's
  `StudioResourcesMode` write all stay byte-identical — runs keep carrying
  `resources: "balanced"` exactly as before (behavior parity).
- Tests: the footer asserts the Resources combobox is gone and the gating /
  History assertions adjust.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/ui/components/AppFooter.tsx`,
  `apps/mapgen-studio/test/runInGame/AppFooter.test.tsx`
