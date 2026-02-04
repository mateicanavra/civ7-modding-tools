# Morphology 4-Stage Split — Investigation Plan

## Goal
Split the Standard recipe’s Morphology truth pipeline from:
- `morphology-pre` / `morphology-mid` / `morphology-post`

to:
- `morphology-coasts`
- `morphology-routing`
- `morphology-erosion`
- `morphology-features`

This is a **hard cutover** in-repo: no long-lived compatibility for old stage keys.

## Target End-State (Ideal)

### Stage: `morphology-coasts`
- Steps: `landmass-plates`, `rugged-coasts`
- Knobs: `seaLevel`, `coastRuggedness`, `shelfWidth`
- Artifacts:
  - publish-once mutable handles: `artifact:morphology.topography`, `artifact:morphology.substrate`
  - derived snapshots: `artifact:morphology.coastlineMetrics`

### Stage: `morphology-routing`
- Steps: `routing`
- Knobs: none (reserved for future basin/outlet expansion)
- Artifacts:
  - `artifact:morphology.routing`

### Stage: `morphology-erosion`
- Steps: `geomorphology`
- Knobs: `erosion`
- Artifacts:
  - none new; mutates topography/substrate in-place

### Stage: `morphology-features`
- Steps: `islands`, `volcanoes`, `landmasses`
- Knobs: `volcanism`
- Artifacts:
  - `artifact:morphology.volcanoes`, `artifact:morphology.landmasses`

## Invariants (Must Hold)
- Truth vs projection unchanged: engine-facing stamping remains in `map-morphology` guarded by no-water-drift.
- Artifact ids unchanged (`artifact:morphology.*`).
- Op ids unchanged (`morphology/*`).
- Viz `dataTypeKey` unchanged (`morphology.*`, `map.morphology.*`).
- Full step ids will change (stage id is in the full step id). We preserve legibility via author-facing labels.

## Investigation Questions

### Contract / Boundaries
- Where are publish-once artifacts published today? Ensure split does not create multiple publishers.
- What steps mutate `ctx.buffers.heightfield` and how does that interact with downstream stages?
- Are there any hidden dependencies across the old stage boundaries (tests, scripts, UI expectations)?

### Config / Schema
- Where are stage ids enumerated in strict schemas?
- Where are stage knobs applied today, and how do they map to the new stage split?

### Studio / Viz
- Where does Studio derive stage names (authored uiMeta vs parsing `stepId`)?
- What breaks when full step ids change (retention, selection, old dumps)?
- What minimal label layer keeps authors oriented (stageLabel/stepLabel)?

### Tests
- Which tests hardcode stage ids or full step ids?
- Which tests should be upgraded to assert semantics (earthlike, shelf, routing/erosion invariants) instead of ids?

### Docs
- Which canonical docs reference the old stage braid?
- What needs an ADR vs what belongs in the domain reference docs?

## Agent Assignments (Docs-Only)
All agent output is committed under `docs/projects/morphology-4stage-split/agents/`.

- Agent A: Stage-id + config-key blast radius inventory.
- Agent B: Studio/viz coupling and label strategy inventory.
- Agent C: Decision packet drafts (boundaries + Studio labels) and migration slices.

## Definition Of Done (Spike)
- We have a complete file-path indexed impact inventory.
- We have decision-ready migration options with recommended defaults.
- We have a staged implementation plan broken into Graphite slices.

