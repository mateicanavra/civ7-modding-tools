# Display Module Migration Router

Scope: `services/civ7-control/src/service/modules/display/**`

Display queue and camera meaning collapse into target `control.ui`; map
visibility/explore choreography belongs to target `control.map`. `display` is
not a target peer module. This directory is migration corpus only. Preserve
queued, dispatched, and observed distinctions until both target contracts and
proofs close. Do not add new public operations here.
