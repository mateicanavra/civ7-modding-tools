# Phase Record

## Phase

- Project: Habitat Harness
- Phase: git hook hardening / `habitat-git-hook-hardening`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet reviewed, accepted P2 findings patched, validation
  passed, and ready for Graphite commit

## Objective

- Target movement: make Git hooks trustworthy local feedback surfaces by
  settling resource-publish policy, staged mutation boundaries, Grit/Biome/Nx
  proof classes, Effect substrate decision, and stale H7 record correction.
- Exterior: generated resources content, product/runtime behavior, Grit pattern
  semantics, baseline semantics, Biome config policy, Nx taxonomy policy, broad
  command-surface repair.
- Done condition: reviewed OpenSpec packet, accepted hook transaction/resource
  policy contract, implementation-ready task list, downstream realignment,
  validation, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Original Habitat frame: `docs/projects/habitat-harness/FRAME.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Recovery reference:
  `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md`.
- H7 historical source: `openspec/changes/habitat-git-hooks/**`.
- Resource workflow: `docs/process/resources-submodule.md`.
- Official-doc evidence:
  `docs/projects/habitat-harness/research/official-docs-biome.md`,
  `docs/projects/habitat-harness/research/official-docs-effect.md`.
- Local substrate evidence:
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Husky delegators are installed and point to Habitat hook commands.
- `runPreCommit()` runs resources publish before staged path collection and
  before file-layer/Biome/Grit local validation.
- The resources publish script may commit in the resources submodule, push
  `origin main`, and stage the monorepo submodule pointer.
- Existing hook command tests mock `runHook`; they do not prove real hook
  side-effect behavior.
- H7 phase record says hooks are closed locally, but Stage 0 classifies
  `CLAIM-H7-HOOKS` as mixed with blockers.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- H7 created useful hook infrastructure but did not settle resource publish
  side-effect policy under the recovery proof standard;
- resource publishing is a stronger mutation than formatter restage because it
  can push remote state;
- local staged validation should precede any external publish;
- Effect is a required decision point for hook transaction orchestration.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: generated resources content, generated outputs, Grit
  patterns, baseline files, Biome config, Nx taxonomy, product/runtime code.
- Owner: Habitat hook command, Husky delegators, hook docs, resource publish
  policy records.
- Forbidden owners: product/runtime behavior, Grit semantics, baseline
  semantics, Biome semantics, Nx graph policy.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Hook transaction reviewer.
  - Resource publishing reviewer.
  - Biome/Grit/Nx ownership reviewer.
  - Effect/substrate reviewer.
  - Evidence/system reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Blocking findings: accepted P2 findings patched into this packet; no
  unresolved accepted P1/P2 design findings.

## Agent Fleet State

- Active agents: adversarial reviewer completed.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, and 2.4.
- Remaining tasks: review, validation, implementation, verification,
  downstream realignment, closure.
- Implementation status: not started.

## Verification

- Commands and inspections run for design evidence:
  - `git status --short --branch`
  - `gt status`
  - `sed -n '1,260p' tools/habitat-harness/src/lib/hooks.ts`
  - `sed -n '1,260p' scripts/civ7-resources/publish-submodule.sh`
  - `sed -n '1,240p' docs/process/resources-submodule.md`
  - `git config --get core.hooksPath`
  - `sed -n '1,80p' .husky/pre-commit`
  - `sed -n '1,80p' .husky/pre-push`
  - source inspections recorded in `workstream/source-synthesis.md`
  - adversarial design review recorded in
    `workstream/review-disposition-ledger.md`
  - `bun run openspec -- validate habitat-git-hook-hardening --strict`
  - `bun run openspec:validate`
  - full-depth-language guardrail scan over this packet
  - `git diff --check`
- Evidence boundary: current phase has design evidence and code/document
  diagnosis. It does not prove hook hardening implementation.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Commit design packet through Graphite.
