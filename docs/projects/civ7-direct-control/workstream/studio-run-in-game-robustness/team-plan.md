# Team Plan

## Team Shape

This is a specified, high-reliability, process-traced team. Work is partially
parallel but converges through a single owner because code changes touch shared
runtime and Studio launch boundaries.

## Roles And Interfaces

- Owner: synthesizes evidence, updates OpenSpec/workstream state, implements or
  integrates code, verifies, and commits through Graphite.
- Direct-control lifecycle agent: maps runtime classification failures and
  proposes direct-control contract/test changes.
- Studio/Vite robustness agent: maps Run in Game request lifecycle, Vite
  reload causes, dev-server identity, and operation status needs.
- Verification agent: builds a failure-mode test matrix and checks proof gaps
  against OpenSpec task state.
- Product/UX recovery agent: designs the smallest developer-facing recovery
  surface that makes phases, uncertainty, and next actions clear.

## Artifact Contract

Agents write one markdown artifact each under this directory. Each artifact
must include:

- findings ordered by severity;
- evidence references with file paths/functions/commands;
- proposed code or spec changes;
- tests/proof required;
- risks or non-goals.

The owner consolidates findings into `review-disposition-ledger.md`,
`proof-ledger.md`, and OpenSpec task updates.
