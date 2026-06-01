# Phase Record

## Phase

- Project: resource distribution recovery
- Phase: planning and diagnosis
- Owner: Codex workstream owner
- Branch/Graphite stack: `codex/resource-distribution-planning` above
  `codex/morphology-public-config-surface`
- Started: 2026-05-31
- Status: active

## Objective

- Target movement: convert the broad resource regression request into a bounded
  OpenSpec/Graphite workstream with evidence-backed diagnosis, team interfaces,
  a resource-stage architecture pass, per-resource strategy requirements, and
  verification rails.
- Non-goals: no resource tuning, no generated-output hand edits, no runtime
  proof claim in this planning slice.
- Done condition: Wave 1 findings are integrated, downstream slices are named,
  OpenSpec validates, and the planning branch is committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: root router, `mods/mod-swooper-maps/AGENTS.md`,
  `mods/mod-swooper-maps/src/AGENTS.md`, `packages/mapgen-core/AGENTS.md`,
  `packages/mapgen-core/src/AGENTS.md`
- Direct user correction: resources may be their own stage; steps may be
  resource groups with related input/output artifacts.
- Product refs: `.agents/skills/civ7-product-authority/SKILL.md`,
  official resource files as evidence
- Architecture refs: `.agents/skills/civ7-architecture-authority/SKILL.md`,
  `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- Project refs: `openspec/changes/README.md`,
  `openspec/specs/mapgen-normalization-workstreams/spec.md`
- Excluded/stale inputs: generated `mod/` output, archived project notes unless
  used only as discovery evidence

## Current State

- Repo/Graphite state: isolated worktree created at
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-resource-distribution-workstream`;
  branch tracked with Graphite parent `codex/morphology-public-config-surface`.
- Dirty files and owner: primary worktree had pre-existing dirty files
  `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` and
  `NOTE-TO-DRA.md`; this worktree started clean.
- Current code evidence: `placement/plan-resources` uses generic physical
  scoring and numeric candidate offsets; `place-resources` records typed
  adapter outcomes; adapter rejects engine-ineligible resources.
- Generated outputs affected: none in planning slice.
- Tests/guards affected: OpenSpec validation and `git diff --check` for
  planning; downstream stats/tests later.

## Scope

- Write set: `openspec/changes/resource-distribution-planning/**`
- Protected files: generated outputs, lockfiles, primary worktree dirty files
- Owners: workstream owner for synthesis; sidecar agents for evidence packets
- Forbidden owners: generated `mod/`, current code as target authority, resource
  stage refusal without a proven blocker
- Consumer impact: no runtime consumer change in planning slice
- Downstream assumptions: implementation will require per-resource diagnostic
  stats, official corpus facts, resource-stage architecture, and per-resource
  strategy coverage before balance claims

## Spec/Tasks

- Spec/proposal: `openspec/changes/resource-distribution-planning/proposal.md`
- Tasks: `openspec/changes/resource-distribution-planning/tasks.md`
- Validation status: strict change validation and all-record OpenSpec validation
  pass after adding the planning delta.

## Review

- Review lanes:
  - product: pending downstream implementation review
  - architecture: completed pre-implementation review and repair verification
  - spec/workstream: completed pre-implementation review and repair
    verification
  - verification: pending downstream implementation review
- Previously blocking findings:
  - Wave 1 architecture interpretation was too conservative after direct user
    correction; resource-stage design must be actively explored. This is
    repaired in the planning design and OpenSpec delta.
- Accepted review findings:
  - P2 static resource ids were treated as verified while runtime id order
    remained open.
  - P2 downstream slice contracts were not durable enough.
  - P2 all official resources and placeable resources were not reconciled.
  - P2 review state was ambiguous for implementation handoff.
  - P2 resource group examples lacked artifact acceptance rules.
  - P3 dirty paths and gate outputs were not exact enough.
  - P3 rubies hypothesis needed explicit hypothesis labeling.
- Accepted findings repaired:
  - Planning now includes `resource-stage-architecture` as the next architecture
    slice and treats `plan-resources` as current code, not target authority.
  - Static corpus and runtime id verification are separated.
  - Slice contract table now records status, write set, protected paths, review
    lanes, entry conditions, stop conditions, and required evidence.
  - Corpus artifact contract now records placeability and strategy-required
    status.
  - Group-step candidates now require input artifact, output artifact, invariant,
    consumer, and verification boundary.
- Rejected/invalidated/waived/deferred findings: standalone per-resource stages
  are still not accepted by default; resource group steps must be artifact-led.
- Current implementation readiness: no open P1/P2 planning review findings
  remain after repairing stale handoff state; behavior implementation still
  requires downstream OpenSpec slices and review lanes.

## Agent Fleet State

- Active agents: none
- Completed agents:
  - `Ampere` (`019e7cba-57f8-7461-93c4-ba46e8bede00`): official corpus evidence
  - `Helmholtz` (`019e7cba-7e27-7540-9100-6e71e515e90e`): regression hotspot/root-cause evidence
  - `Bacon` (`019e7cba-9948-7813-9f26-3d2aa3b1a43b`): architecture/OpenSpec evidence
  - `Harvey` (`019e7cba-bf5c-73b0-b7b3-7beda5764876`): verification/runtime evidence
  - `Herschel` (`019e7cc5-98bd-7551-8c2c-ca2ab5613815`): spec/workstream review
  - `Jason` (`019e7cc6-499d-7391-9118-a55e8f4f197c`): architecture review
- Assigned write sets: none; Wave 1 was read-only
- Latest evidence by agent:
  - `Ampere`: 55 static file-order resources; rubies appears in static slot
    currently treated as id `44`; lotus is `FEATURE_LOTUS`; SDK constants are
    stale/incomplete for v2 resources.
  - `Helmholtz`: top regression candidate is `c2e9735aa`; current planner picks
    exact resource types by numeric signature before Civ7 feasibility checks.
  - `Bacon`: current authority supports `resources` as a concern, but user
    correction requires resource-stage design rather than conservative refusal.
  - `Harvey`: verification rails and log paths identified; OpenSpec gates can
    run in this worktree by placing the primary worktree `node_modules/.bin`
    on `PATH`.
  - `Herschel`: static/runtime id separation, placeability fields, resource
    group artifact rules, stage correction, and OpenSpec validity are
    substantively repaired; stale handoff state required cleanup.
  - `Jason`: no P1/P2 findings after architecture repair verification.
- Open findings by agent:
  - Confirm runtime `GameInfo.Resources` id order against static `0..54`.
  - Add telemetry to group placement outcomes by status, reason, and resource id.
  - Prove final resource group steps from artifact boundaries.
- Running/stale status: all Wave 1 agents completed
- Integration owner: Codex workstream owner

## Implementation

- Completed tasks:
  - Created isolated worktree and Graphite planning branch.
  - Initialized `.civ7/outputs/resources` submodule in the worktree.
  - Spawned Wave 1 read-only agents with framing-design prompts.
  - Recorded root-cause evidence from placement planner and adapter path.
  - Integrated Wave 1 findings and direct user correction into planning files.
  - Ran review wave and repaired accepted findings.
- Remaining tasks:
  - Commit planning slice.
- Historical stop conditions resolved:
  - `bun run openspec -- list` failed before dependency setup because
    `node_modules` is absent in the new worktree; final gates use the primary
    worktree's `node_modules/.bin` on `PATH`.

## Verification

- Commands run:
  - `git status --short --branch`
  - `gt ls`
  - `git submodule update --init .civ7/outputs/resources`
  - `bun run openspec -- list`
  - `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec -- validate resource-distribution-planning --strict`
  - `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec:validate`
  - `git diff --check`
- Results:
  - Graphite branch is tracked above current stack top.
  - Official resources submodule initialized.
  - OpenSpec validation initially failed because `resource-distribution-planning`
    had no `specs/` delta.
  - `resource-distribution-planning` strict validation now passes.
  - all OpenSpec records now pass strict validation.
  - `git diff --check` passed.
- Skipped gates and rationale: none for planning gates.
- Evidence boundary: planning evidence only; no behavior proof yet.

## Wave 1 Evidence Pack

- Official corpus: 55 static file-order resources from `resources.xml` and
  `resources-v2.xml`; runtime id order remains unverified.
- Rubies hypothesis: `RESOURCE_RUBIES` appears in static file-order slot
  currently treated as id `44`; valid on plains hills, tropical flat/hill, and
  desert hills. It likely survives because numeric signature selection can hit
  the upper catalog range and rubies have multiple eligible habitats. Promote
  this only after per-resource rejection telemetry confirms it.
- Lotus: `FEATURE_LOTUS` aquatic feature, not a resource; current visibility is
  ecology/feature proof.
- Root cause: deterministic exact intents are planned without official habitat
  constraints, then `adapter.placeResourceIntent()` rejects exact type/tile
  mismatches through `ResourceBuilder.canHaveResource`.
- Test gap: existing tests do not model live Civ7 resource habitat rejection by
  default; stats lack per-resource counts.
- Verification: game restart path is
  `bun run --filter @mateicanavra/civ7-cli dev -- game restart --agent Codex --wait`;
  bridge requests must include `AGENT=<agent-name>`.

## Realignment

- Downstream docs/specs/issues updated: planning OpenSpec change
- Tests/guards updated: pending downstream slices
- Deferrals/triage updated: not applicable
- Downstream realignment ledger:
  `openspec/changes/resource-distribution-planning/workstream/downstream-realignment-ledger.md`

## Next Action

- Exact next step: commit planning slice, then open
  `resource-distribution-root-cause` and `resource-stage-architecture`.
- First files to inspect:
  - `.civ7/outputs/resources/Base/modules/base-standard/data/resources.xml`
  - `.civ7/outputs/resources/Base/modules/base-standard/data/resources-v2.xml`
  - `mods/mod-swooper-maps/src/domain/placement/ops/plan-resources/**`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/placement/**`
- Stop condition: do not implement resource tuning until downstream OpenSpec
  slices exist and review lanes are dispositioned.
