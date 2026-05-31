# Project: Civ7 Direct Control

**Status:** Implementation complete; Graphite closure pending
**Timeline:** 2026-05-31 -> completion of `civ7-direct-control-surface`
**Teams:** Codex owner plus peer investigation, spec, implementation, and review agents

## Scope & Objectives

This project turns the direct Civ7 tuner-socket discovery into a durable
repo-owned developer control surface. The target outcome is that a macOS
developer can control a running Civ7 instance without Windows, Steam relaunches,
or the FireTuner UI, while CLI, Studio, and future tools all call one canonical
boundary.

The project treats FireTuner as a reference client unless evidence proves it is
required at runtime. Direct socket control remains the primary path while it can
run JavaScript commands, select states, report health, reconnect after game
restart, and prove effects with fresh runtime evidence.

## Selection And Salience

- In scope: direct tuner-socket protocol, command execution, state discovery and
  selection, health, reconnect behavior, CLI and Studio integration, verification,
  documentation, and cleanup of obsolete local bridge assumptions.
- Foregrounded: developer experience and proof boundaries. The implementation
  must be easy to call from tools and honest about what each gate proves.
- Exterior: a FireTuner clone, Windows process supervision, Steam account
  workarounds, broad game-automation UX, and a TUI. These re-enter scope only if
  direct socket control falsifies.

## Structural Alternative Considered

A supervised FireTuner or hybrid Windows bridge was rejected for repo-owned
runtime control after direct socket parity was confirmed. The chosen boundary
lives in this repo because the live evidence shows Civ7 itself listening on the
tuner port, accepting App UI restart/begin commands, and exposing post-Begin
Tuner gameplay canaries directly.

## Deliverables

- [x] Workstream artifacts under `docs/projects/civ7-direct-control/workstream/`
  with agent reports, evidence, reviews, and handoff state.
- [x] OpenSpec change `civ7-direct-control-surface` with proposal, design,
  tasks, spec deltas, review disposition, verification notes, and closure state.
- [x] Canonical code boundary for Civ7 direct control, called by CLI and Studio.
- [x] Focused tests for socket protocol, state selection, command execution,
  health, reconnect semantics, and caller integration.
- [x] Runtime proof packet when Civ7 is available, including fresh log evidence
  for restart or other state-changing claims.

## Reframe Trigger

Reframe if direct socket control cannot reliably satisfy the core developer
scenarios after Civ7 restart, or if evidence shows Steam/FireTuner is required
for commands the repo must support.

## Links & References

- OpenSpec change: `openspec/changes/civ7-direct-control-surface/`
- Discovery brief: `workstream/discovery/investigation-brief.md`
- Team plan: `workstream/discovery/team-plan.md`
