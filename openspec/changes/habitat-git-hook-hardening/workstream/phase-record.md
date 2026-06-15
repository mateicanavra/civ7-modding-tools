# Phase Record

## Phase

- Project: Habitat Harness
- Phase: git hook hardening / `habitat-git-hook-hardening`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-hook-pre-push-proof`
- Started: 2026-06-14
- Status: resource-publish and staged-mutation checkpoints supervisor-accepted;
  pre-push base/range checkpoint implemented and locally verified for
  supervisor review

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
- Focused hook tests exercise resource-state classification, staged mutation
  boundaries, and pre-push base selection through a fake command/filesystem/hash
  boundary; broader hook transaction proof remains open.
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

- Completed tasks for the accepted resource checkpoint: 3.1, 3.2, 3.3, 3.4,
  3.5, 3.6, 3.7, 5.1, 6.2, 6.3, 6.4, 6.10, 7.1, 7.2, 7.3, 7.4, 8.6, 8.9,
  and 8.12, plus previously completed design/source tasks.
- Completed tasks for this staged-mutation checkpoint: 2.5, 6.5, 6.6, 6.7,
  and 6.8.
- Completed tasks for this pre-push checkpoint: 6.9 and 8.7.
- Remaining tasks: full hook transaction model, full fake-service matrix,
  pre-commit current-tree staged probe matrix, historical H7 record
  realignment, aggregate verification, and packet closure.
- Implementation status: pre-push base/range checkpoint implemented and
  locally verified for supervisor review.

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
- New implementation evidence for the staged-mutation checkpoint:
  - `bun run biome --version` exited 0 and reported Biome `2.4.16`; the
    staged-mutation tests preserve the existing `biome format --write
    --no-errors-on-unmatched` and `biome check --no-errors-on-unmatched`
    command contracts.
  - `bun run --cwd tools/habitat-harness test -- hooks.test.ts` exited 0 with
    15 tests, including generated-zone and package-manager artifact file-layer
    ordering, partial-staging refusal before format, formatter-touched restage
    only, malformed Grit JSON refusal, and Grit finding refusal.
  - `bun run --cwd tools/habitat-harness check` exited 0.
  - `bun run habitat hook pre-commit` exited 0 with `resources: clean`,
    staged file-layer pass, no staged Biome-supported files, no staged
    TypeScript/JavaScript Grit paths, and no resource publish path.
  - `bun run openspec -- validate habitat-git-hook-hardening --strict` exited
    0.
  - `bun run openspec:validate` exited 0 with 181 items passed.
  - `git diff --check` exited 0.
  - scratch/proof residue scan over the previously observed generator/apply
    proof paths and Habitat baseline backup files returned no paths.
- New implementation evidence for the pre-push checkpoint:
  - `bun run --cwd tools/habitat-harness test -- hooks.test.ts` exited 0 with
    20 tests. New tests prove explicit `--base` bypasses Graphite/merge-base
    probes, Graphite parent output selects the default affected base,
    non-Graphite fallback uses `git merge-base HEAD main`, literal `main`
    fallback is used when both merge-base probes fail, and Nx affected failures
    propagate with base provenance.
  - `bun run --cwd tools/habitat-harness check` exited 0.
  - `bun run habitat hook pre-push --base HEAD` exited 0 and rendered `habitat
    hook pre-push: repo Nx affected base=HEAD`; Nx reported no tasks were run
    for the empty explicit range.
- Evidence boundary: the accepted resource checkpoint proves the default
  pre-commit resource publish removal, typed resource-state classification,
  fail-closed remediation for dirty/uninitialized/locked/unstaged states,
  clean/staged-gitlink continuation, root/dev pre-commit clean-resource command
  behavior, and adjacent record truth. This staged-mutation checkpoint proves
  focused unit behavior for file-layer ordering before mutation, partial
  staging refusal, formatter-touched restage scope, and Grit parse/finding
  fail-closed behavior. This pre-push checkpoint proves unit behavior for
  Graphite parent, non-Graphite merge-base, literal-main fallback, explicit
  base override, Nx command provenance, and Nx failure propagation; it also
  proves the explicit-base wrapper path on an empty current-tree range. It does
  not prove full hook transaction safety, pre-commit current-tree staged probe
  behavior, CI authority, broad Nx affected coverage, or product/runtime
  behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold the pre-push base/range checkpoint for supervisor review. Do not claim
  full hook transaction architecture, current-tree staged probe closure, CI
  authority, broad Nx affected coverage, or packet closure from this slice.
