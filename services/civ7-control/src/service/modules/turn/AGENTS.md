# Turn Module Migration Router

Scope: `services/civ7-control/src/service/modules/turn/**`

Guarded turn completion and its actor-facing reconciliation move to
`services/civ7-play/src/service/modules/turn`. This current directory is
migration corpus only. Preserve fresh admission, native dispatch, observed turn
advance, uncertainty, no-repeat, and refusal until Play owns matching proof.
The target consumes only the public control client.
