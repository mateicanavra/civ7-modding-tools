# Phase Record

## Phase

- Project: Habitat Harness deep refactor
- Phase: Effect substrate architecture
- Owner: Effect-first planning lane
- Branch/Graphite stack: `agent-DRA-effect-first-openspec-domino-plan` stacked on `agent-DRA-effect-first-repair-backlog`
- Started: 2026-06-19
- Status: design packet opened

## Objective

- Target movement: approve the exact architecture and file tree for the
  Effect-first implementation train.
- Non-goals: source implementation, command contract changes.
- Done condition: accepted design with no unresolved P1/P2 findings.

## Current State

- Key source smells: local `Effect.runSync`, duplicate process runners, direct
  IO/time/env in domain modules, broad public barrels, mixed `ownerTool`
  authority.

## Verification

- Commands run: pending packet validation.
- Evidence boundary: design-only.
