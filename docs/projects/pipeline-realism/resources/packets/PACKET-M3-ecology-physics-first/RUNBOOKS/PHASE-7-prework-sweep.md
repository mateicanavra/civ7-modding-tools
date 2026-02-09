# Runbook: Phase 7 (Prework Sweep)

## Goal

Eliminate "black ice" before implementation begins:
- no ambiguous contracts
- no unresolved decisions that would fork the implementation
- no missing artifact ids/schemas

## Inputs / Sources of Truth

- Packet:
  - `../TOPOLOGY.md`
  - `../CONTRACTS.md`
  - `../DECISIONS.md`
- Issues:
  - `docs/projects/pipeline-realism/issues/LOCAL-TBD-PR-M3-*.md`

## Outputs

- Zero remaining prework prompts (none in issue bodies).
- Any remaining uncertainties are either:
  - removed (decision made), or
  - captured as an explicit decision entry in `../DECISIONS.md`.

## Agent Assignments (Phase 7)

- Orchestrator: run the sweep and fix any doc drift.
- GATES: propose the static scan allowlist approach for "no-fudging" enforcement.

## Gates

- `rg -n "^## Prework Prompt \\(Agent Brief\\)$" docs/projects/pipeline-realism/issues | rg "PR-M3"` is empty.
- `rg -n "TBD" ../` is empty except `LOCAL-TBD` id references.

## Do Not Do

- Do not "leave it for implementation" if it would change topology/contracts.

