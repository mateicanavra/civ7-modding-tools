# Next Packet

## Active Objective

Implement `civ7-direct-control-surface`: a canonical repo-owned direct Civ7
tuner-socket control boundary used by CLI, Studio, and future tools.

## Current State

- Branch: `codex/civ7-direct-control-workstream`
- OpenSpec change: `openspec/changes/civ7-direct-control-surface/`
- Project artifacts: `docs/projects/civ7-direct-control/`
- Pre-existing dirty files to preserve:
  - `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
  - `NOTE-TO-DRA.md`

## Next Exact Action

If work resumes after compaction, inspect `git status --short --branch`, preserve
the listed user dirty files, then stage and commit the Graphite branch.
Implementation and verification are complete: `@civ7/direct-control` owns the
socket boundary, CLI and Studio call it, the bridge code path is removed, the
native restart/begin loop is implemented, and the Tuner API inventory is
recorded.

## Stop Conditions

- Direct Civ7 socket behavior cannot satisfy command/state/health/reconnect.
- FireTuner or Steam is proven required for the needed command set.
- Duplicate transport ownership cannot be removed without wider product
  decision.
