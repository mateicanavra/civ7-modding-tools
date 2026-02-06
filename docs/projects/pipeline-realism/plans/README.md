# pipeline-realism plans

This directory contains the canonical execution plan for the Pipeline Realism remediation work.

## Canonical (Execution Source)

- `PLAN-no-legacy-foundation-morphology-refactor-2026-02-05.md`

## Execution Posture

- Forward-only: no legacy compatibility, no shims, no dual paths.
- Evidence + numeric gates are blocking (determinism + diagnostics + Phase B formulas).

## Execution Workflow (Orchestrated)

This work is intended to be executed via one long-running worker agent (YARSI) on a Graphite stack:

- Milestone base branch: `agent-YARSI-PRR-milestone-pipeline-realism-remediation`
- Prep slice (docs/runbooks): `agent-YARSI-PRR-p00-prep-execution-ready-docs-runbooks`
- Then proceed slice-by-slice per the checklist in the canonical plan doc.

