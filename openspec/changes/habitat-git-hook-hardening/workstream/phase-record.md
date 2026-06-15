# Phase Record

## Phase

- Project: Habitat Harness
- Phase: git hook hardening / `habitat-git-hook-hardening`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-hook-resource-policy`
- Started: 2026-06-14
- Status: resource-publish policy checkpoint implemented and verified locally,
  with supervisor acceptance pending

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
- `runPreCommit()` no longer runs `scripts/civ7-resources/publish-submodule.sh`
  in the default pre-commit path.
- Pre-commit now classifies resource state read-only before file-layer, Biome,
  or Grit phases and fails closed for dirty, uninitialized, locked, or
  unstaged-gitlink resources with explicit remediation commands.
- Clean resources and clean staged resource gitlinks continue through local
  staged hook checks without publishing.
- Focused hook tests exercise resource-state classification through a fake
  command/filesystem boundary; broader hook transaction proof remains open.
- H7 phase record says hooks are closed locally, but Stage 0 classifies
  `CLAIM-H7-HOOKS` as mixed with blockers.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- H7 created useful hook infrastructure but did not settle resource publish
  side-effect policy under the recovery proof standard;
- resource publishing is a stronger mutation than formatter restage because it
  can push remote state;
- default pre-commit should inspect resources but leave publishing to the
  explicit `bun run resources:publish` path;
- this checkpoint does not adopt a new Effect hook transaction layer because it
  removes the hidden publish side effect and adds a typed read-only classifier
  with injected command/filesystem tests; broader hook transaction orchestration
  still requires the packet's Effect/equivalent proof decision before closure.

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

- Completed tasks for this checkpoint: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6,
  3.7, 5.1, 6.2, 6.3, 6.4, 6.10, 7.1, 7.2, 7.3, 7.4, 8.6, 8.9, and
  8.12, plus previously completed design/source tasks.
- Remaining tasks: full hook transaction model, full fake-service matrix,
  generated-zone and package-manager artifact probe proof, partial-staging and
  formatter-restage proof, Grit hook parse/finding proof, pre-push base/range
  proof, historical H7 record realignment, aggregate verification, and packet
  closure.
- Implementation status: resource-publish policy checkpoint implemented;
  pending Graphite commit and supervisor review.

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
- New implementation evidence for this checkpoint:
  - `bun run --cwd tools/habitat-harness test -- hooks.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run resources:init` initialized `.civ7/outputs/resources` through the
    repo resource command path after the existing path proved to be an empty
    non-checkout directory.
  - `bun run resources:status` exited 0 and reported the resources submodule
    clean at the recorded gitlink.
  - `bun run habitat hook pre-commit` exited 0 with `resources: clean`, ran
    the staged file-layer check, reported no staged Biome-supported files and
    no staged TypeScript/JavaScript Grit paths, and passed without invoking the
    resource publish script.
  - `bun run openspec -- validate habitat-git-hook-hardening --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - exact scratch/proof residue scan for `apps/hr-scratch-discovery-app`,
    `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof`,
    `packages/hr-scratch-discovery-foundation`, and
    `packages/plugins/plugin-hr-scratch-discovery-plugin` returned no paths.
  - stale hook-resource guidance scan over root AGENTS, Habitat README, and
    resources-submodule docs
- Evidence boundary: this checkpoint proves the default pre-commit resource
  publish removal, typed resource-state classification, fail-closed remediation
  for dirty/uninitialized/locked/unstaged states, clean/staged-gitlink
  continuation, root/dev pre-commit clean-resource command behavior, and
  adjacent record truth. It does not prove full hook transaction safety, Grit
  hook parse/finding behavior, pre-push range behavior, CI authority, or
  product/runtime behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Commit the resource-publish policy checkpoint through Graphite and hold for
  supervisor review.
