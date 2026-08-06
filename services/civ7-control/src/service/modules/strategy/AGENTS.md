# Strategy Module Migration Router

Scope: `services/civ7-control/src/service/modules/strategy/**`

Tactical observation, destination analysis, target candidates, formations,
fronts, and civilian routes compose into
`services/civ7-play/src/service/modules/planning`; `strategy` is not a target
peer module. This directory is migration corpus only. Preserve bounded inputs,
relationship uncertainty, read-only behavior, source status, and native failure
mapping until Play planning proof closes.
