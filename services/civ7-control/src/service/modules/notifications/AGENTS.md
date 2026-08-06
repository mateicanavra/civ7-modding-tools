# Notifications Module Migration Router

Scope: `services/civ7-control/src/service/modules/notifications/**`

Notification attention, dismissal, and advisor-warning outcomes move to
`services/civ7-play/src/service/modules/notifications`. This current directory
is migration corpus only. Preserve queue interpretation, exact dispatch,
bounded observation, sent-versus-observed distinction, uncertainty, and refusal
until the Play proof closes. The target consumes only the public control client.
