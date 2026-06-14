# Phase Record

## Phase

- Project: Habitat Harness
- Phase: scaffold/baseline contract repair /
  `habitat-scaffold-contract-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet drafted; review findings dispositioned; validation
  passed for design/spec acceptance

## Objective

- Target movement: make Habitat baseline state explicit and proof-bearing so
  rule enforcement, Grit proof, and generated pattern rules do not depend on
  hidden missing-file convention.
- Exterior: Grit adapter implementation, oclif shell repair, pattern generator
  authority metadata, hook side effects, Nx/Biome config, generated outputs,
  product/runtime behavior.
- Done condition: reviewed OpenSpec packet, accepted baseline state contract,
  implementation-ready task list, downstream realignment, validation, Graphite
  commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- H2 scaffold source:
  `openspec/changes/habitat-harness-scaffold/**`.
- Grit proof consumer:
  `openspec/changes/habitat-grit-proof-repair/**`.
- Effect Grit adapter baseline boundary:
  `openspec/changes/habitat-effect-grit-adapter/**`.

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Current code treats missing baseline file as empty locked baseline.
- Current code reports locked state from loaded key count plus `exceptionPath`.
- Only `tools/habitat-harness/baselines/adapter-boundary.json` exists.
- Current adapter-boundary proof reports seven baselined diagnostics, while one
  key is present in the Habitat baseline file.
- Current `doc-ambiguity` also uses a non-`none` external exception source:
  `docs/.doc-ambiguity-lint-baseline.json`.
- Current baseline key behavior is `path::message`; older richer key-format
  claims are stale unless separately migrated.
- Current package tests pass but do not prove the baseline contract matrix.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- the shrink-only loop exists but is not a complete explicit contract;
- missing baseline state is the load-bearing gap;
- adapter-boundary is the forcing case for parser-supplied baselined debt;
- generator metadata repair depends on this contract but should remain a
  separate owner unless baseline file format changes require touch points.
- baseline contract implementation must run the manual-vs-Effect adoption gate
  before choosing substrate, because local Effect evidence identifies baseline
  integrity and command provenance as high-fit surfaces.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: `.grit/patterns/**`, Grit adapter implementation, hook
  implementation, Nx/Biome config, generated outputs, product/runtime source.
- Owner: `@internal/habitat-harness` scaffold/baseline contract.
- Forbidden owners: Grit semantics, command shell, hook side effects, generator
  authority metadata, Nx/Biome ownership.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Evidence/system reviewer.
  - Baseline/scaffold reviewer.
  - Generator/Grit consumer reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Blocking findings: accepted P1/P2 findings are dispositioned in
  `workstream/review-disposition-ledger.md`; implementation remains unopened
  until the design layer is committed and the next workstream gate starts.

## Agent Fleet State

- Completed agents:
  - baseline/scaffold evidence sidecar.
  - generator/pattern metadata coupling sidecar.
  - product/outcome reviewer.
  - evidence/system reviewer.
  - baseline/scaffold reviewer.
  - generator/Grit consumer reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed design tasks: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, and 2.4.
- Remaining tasks: validation, implementation, verification, downstream
  realignment, closure.
- Implementation status: not started.

## Verification

- Commands run for design evidence:
  - `git status --short --branch`
  - `gt status`
  - `bun run habitat:check -- --json --rule adapter-boundary`
  - `bun run habitat:check -- --json --rule adapter-boundary --base HEAD`
  - `bun run habitat:check -- --json --rule workspace-entrypoints`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run openspec -- validate habitat-scaffold-contract-repair --strict`
  - `git diff --check`
  - scoped full-depth language and shortcut-language guardrail scans
- Evidence boundary: current phase has design evidence and command/code
  diagnosis. It does not prove the baseline repair.
- Review boundary: review findings have been accepted or invalidated in the
  ledger. Strict OpenSpec validation and repo guardrail checks passed after
  these edits.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Commit the design packet as a clean Graphite layer.
