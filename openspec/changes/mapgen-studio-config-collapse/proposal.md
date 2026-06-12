# Config objects collapse/expand + sticky auto-expand + per-object header

## Why

The config form renders every stage, group, and subgroup fully expanded — a
wall of fields with no overview. The user wants config objects collapsed by
default with manual expand, an optional sticky auto-expand-on-scroll mode
(scroll reaches a title bar → it expands; scroll past → it collapses and the
next expands, cascading into nested objects), and a per-object header/action
row that will eventually host object-local actions (Reset to Defaults, Show
JSON) now sitting in the global config toolbar. We own all three rjsf
templates, so nothing blocks full customization.

## Target Authority Refs

- `docs/projects/mapgen-studio-redesign/pass-4-design-fixes.md` (E3)
- `apps/mapgen-studio/.interface-design/system.md` (§Pass-4 amendment:
  config objects collapse)
- `openspec/changes/mapgen-studio-config-collapse/design.md` (mechanics)

## What Changes

- **Per-object header anatomy** in the object/array templates: chevron +
  title as one disclosure button, plus a trailing action zone (the array
  template's existing Add button moves into it — the first object-local
  action on the new anatomy).
- **Collapse state** via an optional `collapse` member on the rjsf
  formContext (absent ⇒ templates render expanded with no chevrons, so
  template unit tests and any bare `SchemaForm` use are unaffected). State
  lives in a `useConfigCollapse` hook owned by `RecipePanel`, keyed by JSON
  pointer — pointers are identical in focused and unfocused modes, so
  expansion survives mode switches. Default collapsed everywhere; the focused
  stage root defaults expanded (focusing a stage means "show me this one").
- **Sticky auto-expand toggle** (`ListCollapse` icon, `aria-pressed`,
  default OFF) in the config actions row. When ON, scroll position drives the
  expansion chain (design.md §sticky engine); manual chevrons still work
  between scrolls.
- Tests: template-level collapse scenarios (header renders collapsed, content
  on expand, no chevrons without context) + a pure unit for the active-chain
  computation.

## Impact

- Affected specs: `mapgen-studio`
- Affected code: `apps/mapgen-studio/src/features/configOverrides/
  {rjsfTemplates.tsx,SchemaConfigForm.tsx,useConfigCollapse.ts}`,
  `apps/mapgen-studio/src/ui/components/RecipePanel.tsx`, tests under
  `apps/mapgen-studio/test/config/`
