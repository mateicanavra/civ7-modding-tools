# City Module Migration Router

Scope: `services/civ7-control/src/service/modules/city/**`

City decisions are actor-facing gameplay and move intact to
`services/civ7-play/src/service/modules/city`. This current directory is
migration corpus only. Do not extend it. Preserve production, town-focus,
population-placement, admission, dispatch, postcondition, and no-repeat
semantics until Play owns matching contract and proof. The target module calls
only the public control client for foundational native operations; it never
receives Tuner, providers, or control-private ports.
