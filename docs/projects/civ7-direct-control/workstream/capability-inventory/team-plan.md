# Capability Inventory Team Plan

## Objective

Use parallel evidence lanes to map App UI, Tuner, typed/catalog generation, and
automation/playability potential without duplicating work or turning exploratory
commands into premature product commitments.

## Axes

- Objective precision: exploratory but bounded by durable report outputs.
- Coupling: mostly parallel, with owner synthesis at the end.
- Autonomy: agents may inspect source, resources, and runtime docs; live
  mutation should stay conservative.
- Context distribution: partitioned by surface; shared frame is the
  investigation brief and direct-control package.
- Verification mode: process-traced through artifacts, then outcome-checked by
  owner consolidation.

## Agents And Interfaces

| Lane | Output Path | Accountable For |
|---|---|---|
| App UI Surface Investigator | `app-ui-surface-report.md` | App UI globals, methods, read/write candidates, map/studio/debug commands |
| Tuner Surface Investigator | `tuner-surface-report.md` | Tuner gameplay globals, methods, read/write candidates, map/gameplay/control commands |
| Type Catalog Investigator | `type-generation-report.md` | Runtime introspection, official resources, `packages/civ7-types`, codegen options |
| Automation Playability Investigator | `automation-playability-report.md` | LLM/agent play feasibility, required reads/actions, blockers, safe control model |

## Handoff Contract

Each report must include:

- Evidence sources and commands searched.
- Capability tables grouped by domain.
- `wrap now`, `raw command`, `research later`, and `avoid` recommendations.
- Type-generation implications.
- Unknowns and reframe triggers.

The owner owns consolidation, conflict resolution, and commit hygiene.
