# Lifecycle Module Migration Router

Scope: `services/civ7-control/src/service/modules/lifecycle/**`

Setup/start and current-game lifecycle facts collapse into target
`control.game`; current-application readiness belongs to target `control.app`.
`lifecycle` is not a target peer module. This directory is migration corpus
only. Preserve native setup identity, mutation order, dispatch uncertainty,
bounded readback, and post-start evidence. Actor/run-specific retry and
no-repeat policy belongs to Play or MapGen-runs, not foundational control.
