# Unit Module Migration Router

Scope: `services/civ7-control/src/service/modules/unit/**`

Unit decisions, checks, requests, and reconciliation move to
`services/civ7-play/src/service/modules/unit`. This current directory is
migration corpus only. Preserve exact native command selection, admitted input,
dispatch evidence, postcondition interpretation, uncertainty, no-repeat, and
refusal until Play owns matching proof. The target consumes only the public
control client.
