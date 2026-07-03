# Require Sanctioned Direct-Control Session Owners

Subject ID: `require_sanctioned_direct_control_session_owners`

Title: Require Sanctioned Direct-Control Session Owners

Blueprint: `direct-control-session`

Primary category: `boundary`

Secondary categories: none

Artifact kind: `check`

Lifecycle: `steady`

Admission: `admitted`

Authority path: `.habitat/civ7/platform/blueprints/direct-control-session/boundary/check/require_sanctioned_direct_control_session_owners`

Files:
- `require_sanctioned_direct_control_session_owners.baseline.json`
- `require_sanctioned_direct_control_session_owners.pattern.md`
- `require_sanctioned_direct_control_session_owners.rule.json`

Evidence: The pattern prevents caller-local Civ7 direct-control session construction outside sanctioned owners.

Notes:
- none
