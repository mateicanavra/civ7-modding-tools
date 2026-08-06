# Government Module Migration Router

Scope: `services/civ7-control/src/service/modules/government/**`

Government and celebration choices compose into
`services/civ7-play/src/service/modules/progression`; `government` is not a
target peer module. This directory is migration corpus only. Preserve exact
option admission, dispatch, readback, refusal, and uncertainty until the Play
progression proof closes. Do not add exports or dependencies here.
