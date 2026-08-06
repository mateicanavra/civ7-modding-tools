# World Module Migration Router

Scope: `services/civ7-control/src/service/modules/world/**`

World/map plot, grid, surface, visibility, and summary observations collapse
into target `control.map`; current-game facts collapse into `control.game`.
`world` is not a target peer module. This directory is migration corpus only.
Preserve bounded native reads, visibility policy, omission/probe reporting, and
failure honesty until both target proofs close. Do not add new public behavior.
