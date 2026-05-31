## Why

The repo has evidence that Civ7 itself exposes the FireTuner-compatible socket
on port 4318 and accepts commands directly. Studio has already used this path
for restarts, while CLI still had older external-control assumptions.
That split leaves developer control fragile and duplicated.

This change creates one canonical Civ7 direct-control boundary for CLI, Studio,
and future tools.

## Target Authority Refs

- Direct user decision: developer control should work from macOS without
  Windows, Steam relaunches, or the FireTuner UI when direct socket control is
  sufficient.
- `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`: project
  frame, hard core, exteriors, and reframe trigger.
- `docs/projects/civ7-direct-control/workstream/discovery/investigation-brief.md`:
  evidence policy and investigation questions.
- Root `AGENTS.md`: repo docs, OpenSpec, Graphite, generated-output, and direct
  control ownership rules.
- `.agents/skills/civ7-operational-debugging/`: runtime proof boundaries for
  FireTuner/Civ7 control claims.

## What Changes

- Introduce a canonical repo-owned Civ7 direct-control surface that owns tuner
  socket protocol, state discovery, command execution, health, error
  classification, reconnect behavior, and runtime verification helpers.
- Route CLI and Studio runtime control through that surface instead of owning
  transport behavior locally.
- Retain FireTuner as reference-client and protocol evidence, not a required
  runtime dependency, unless discovery falsifies direct control.
- Remove older external control paths once direct-control parity is confirmed.

## Requires

- `codex/firetuner-socket-studio-restart`
- Discovery reports under `docs/projects/civ7-direct-control/workstream/discovery/`

## Enables Parallel Work

- Future command catalog/type/autocomplete expansion.
- Future Studio developer-control UI or service integration.
- Future runtime proof automation once the canonical boundary exists.

## Forbidden Non-Goals

- No FireTuner clone.
- No Windows process supervisor or Steam account workaround as the primary path.
- No duplicate CLI-only or Studio-only socket ownership.
- No silent fallback from direct socket to alternate runtime transports.
- No broad game automation UI or TUI in this slice.

## Consumer Impact

- CLI restart/control behavior moves toward the same direct Civ7 transport used
  by Studio.
- Studio keeps its restart outcome but stops owning the low-level socket path.
- Older external-control behavior is removed from repo-owned runtime control
  rather than retained as a fallback lane.

## Stop Conditions

- Direct socket control cannot satisfy run-command, state selection, health, or
  reconnect scenarios.
- Evidence proves FireTuner or Steam is required for the needed command set.
- The implementation cannot avoid duplicate transport ownership without a wider
  public-contract decision.

## Verification Gates

- New focused tests for the canonical direct-control boundary.
- CLI command tests for the routed behavior.
- Studio API/build tests for routed restart behavior.
- `bun run openspec -- validate civ7-direct-control-surface --strict`
- `bun run openspec:validate`
- `git diff --check`
- Live Civ7 proof when available, with fresh socket and `Scripting.log` evidence.
