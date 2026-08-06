# Diplomacy Module Migration Router

Scope: `services/civ7-control/src/service/modules/diplomacy/**`

Diplomatic and first-meet decisions are actor-facing gameplay and move to
`services/civ7-play/src/service/modules/diplomacy`. This current directory is
migration corpus only. Do not extend it. Preserve native eligibility, dispatch,
relationship-safe readback, refusal, and uncertainty until the Play contract
and proof close. The target consumes only the public control client.
