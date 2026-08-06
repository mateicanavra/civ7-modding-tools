# Readiness Module Migration Router

Scope: `services/civ7-control/src/service/modules/readiness/**`

Semantic readiness and current-application facts collapse into target
`control.app`; `readiness` is not a target peer module. This directory is
migration corpus only. Preserve partial/unsupported evidence and honest
classification while moving raw health/epoch facts back to the Tuner
resource/provider boundary. Do not add new operations here.
