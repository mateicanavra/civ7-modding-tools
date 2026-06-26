# Require Sanctioned Direct-Control Session Owners

Subject ID: `control-app-surface`

Title: Require Sanctioned Direct-Control Session Owners

Blueprint: `direct-control-session`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/direct-control-session/boundary/check/control-app-surface`

Files:
- `control-app-surface.baseline.json`
- `control-app-surface.pattern.md`
- `control-app-surface.rule.json`
- `control-app-surface.rule.mjs`

Evidence: The pattern prevents caller-local Civ7 direct-control session construction outside sanctioned owners.

Notes:
- none
