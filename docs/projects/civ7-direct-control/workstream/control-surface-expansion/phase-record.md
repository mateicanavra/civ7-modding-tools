# Phase Record

## Phase

- Project: Civ7 Direct Control
- Phase: control-surface-expansion
- Owner: Codex
- Branch/Graphite stack: `codex/civ7-direct-control-surface` on top of
  `codex/civ7-control-api-inventory`
- Started: 2026-05-31
- Status: opened; design/spec wave in progress

## Objective

- Target movement: expand `@civ7/direct-control` from direct socket ownership
  into the first-class developer/player/agent control surface described by the
  capability inventory.
- Non-goals: FireTuner clone, Windows bridge fallback, broad in-game console,
  automatic replay of state-changing commands, uncontrolled gameplay mutation,
  or generated-output hand edits.
- Done condition: OpenSpec changes, implementation, tests, live proof where
  available, docs, cleanup dispositions, Graphite commits, and zero-context
  closure packet.

## Authority

- Root/subtree `AGENTS.md`: root router plus `packages/civ7-direct-control/AGENTS.md`,
  `packages/cli/AGENTS.md`, `packages/civ7-types/AGENTS.md`, and any app/package
  router before touching those files.
- Product refs: direct user goal; `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md`;
  `docs/projects/civ7-direct-control/workstream/capability-inventory/capability-inventory.md`;
  `civ7-product-authority`.
- Architecture refs: `civ7-architecture-authority`; `civ7-open-spec-workstream`;
  current `civ7-direct-control-surface` OpenSpec change and
  `remove-firetuner-bridge-legacy`.
- Project refs: capability-inventory reports, discovery reports, owner runtime
  probes, and package/CLI/Studio implementation from the downstack branch.
- Excluded/stale inputs: Windows/FireTuner bridge transport as a runtime path;
  FireTuner remains reference-client evidence only.

## Current State

- Repo/Graphite state: branch created with `gt create --no-interactive codex/civ7-direct-control-surface`.
- Dirty files and owner: pre-existing user/watcher files
  `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` and
  `NOTE-TO-DRA.md`; do not stage or modify.
- Current code evidence: `@civ7/direct-control` owns LSQ/CMD transport,
  App UI snapshot, Tuner readiness, restart/begin, classified errors, and log
  proof helpers. CLI/Studio already call the package boundary.
- Generated outputs affected: none expected; `dist/`, deployed Mods, and
  official resources are evidence only.
- Tests/guards affected: direct-control package tests/check/build, CLI game
  command tests/check/build, Studio build/endpoints where touched, OpenSpec
  validation, live Civ proof where available.

## Scope

- Write set: `packages/civ7-direct-control/**`, focused `packages/cli/src/commands/game/**`
  and tests, `apps/mapgen-studio/**` only if integrating new direct-control
  reads/actions, `packages/civ7-types/**` only for reviewed declaration paths,
  `openspec/changes/**`, and project/system docs.
- Protected files: pre-existing user dirty files, generated outputs, official
  resource outputs, deployed Mods, logs, lockfiles unless changed by package
  manager commands, and unrelated project docs.
- Owners: direct-control package owns transport, state-role API, wrapper
  contracts, catalog schema/generator, and capability reference. CLI/Studio own
  presentation and endpoint shape only.
- Forbidden owners: caller-local socket implementations, external bridge paths,
  generated outputs, broad `shared` buckets, and FireTuner/Windows supervisors.
- Consumer impact: developers get structured reads/actions through one package;
  CLI/Studio consume the same boundary; LLM-agent use gets explicit safety and
  observability constraints.
- Downstream assumptions: mutating wrappers require validator-first contracts
  and before/after proof; no automatic retry of mutation after failure.

## Spec/Tasks

- Spec/proposal: to be created under `openspec/changes/<change-id>/`.
- Tasks: to be split by accepted OpenSpec slice.
- Validation status: pending.

## Review

- Review lanes: peer technical, adversarial, product/developer, player/LLM-agent,
  verification.
- Blocking findings: pending.
- Accepted findings repaired: none yet.
- Rejected/invalidated/waived/deferred findings: none yet.

## Agent Fleet State

- Active agents: pending.
- Completed agents: none in this phase.
- Assigned write sets: artifact reports first; implementation lanes only after
  OpenSpec review.
- Latest evidence by agent: pending.
- Open findings by agent: pending.
- Running/stale status: no stale agents intentionally retained from prior phase.
- Integration owner: Codex.

## Implementation

- Completed tasks: branch opened; phase packet started.
- Remaining tasks: agent investigation, OpenSpec changes, review, implementation,
  verification, docs, cleanup, commit.
- Stop conditions triggered: none.

## Verification

- Commands run: `git status --short --branch`, `gt log short`, relevant skill
  reads, capability/package/code inspections.
- Results: branch opened; existing user dirty files identified and preserved.
- Skipped gates and rationale: package/source gates not run before implementation.
- Evidence boundary: current claims are repo/source evidence plus prior recorded
  live proof; this phase must collect fresh proof for new mutating wrappers where
  Civ state allows it.

## Realignment

- Downstream docs/specs/issues updated: pending.
- Tests/guards updated: pending.
- Deferrals/triage updated: pending.
- Downstream realignment ledger: pending.

## Next Action

- Exact next step: create agent briefs and OpenSpec slice drafts from the
  capability inventory.
- First files to inspect: capability-inventory reports, current direct-control
  package, CLI game commands, official UI operation callers, `packages/civ7-types`.
- Stop condition: direct socket control is proven unable to perform a required
  first-class capability at all.
