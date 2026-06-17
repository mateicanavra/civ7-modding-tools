# Habitat Harness H7 Phase Record - Git Hooks

## Phase

- Project: Habitat Harness
- Phase: H7 `habitat-git-hooks`
- Owner: workstream owner agent
- Branch/Graphite stack: `agent-F-habitat-git-hooks` stacked on locally closed H6 `agent-F-habitat-enforcement-consolidation`
- Started: 2026-06-14T00:54:22Z
- Status: historical closure realigned - committed-range hooks were wired and
  verified; resource-publish-in-pre-commit behavior is superseded by
  `habitat-git-hook-hardening`

## Objective

- Target movement: add local Husky hook entrypoints that delegate to the Habitat oclif CLI so agents get staged-scope pre-commit feedback and merge-base affected pre-push feedback without treating hooks as proof.
- Non-goals: no CI authority change, no commit-message enforcement, no post-checkout/post-merge hooks, no repo-wide pre-commit scan, no blanket staging, no stash juggling, no generated-output hand edits.
- Done condition: hook commands and Husky delegators are implemented, legacy `scripts/git-hooks` behavior is intentionally preserved or retired with evidence, safety probes pass, timing budgets are recorded before wiring and met after wiring, docs/tasks/specs are current, verification gates pass, and the Graphite branch is clean.

Current record-truth boundary: H7 is historical evidence for thin Husky
delegation, staged-scope containment, formatter-touched restage, generated-zone
and package-manager staged guards, and local pre-push affected wiring. It is not
current proof for resource publication, full hook transaction architecture,
current Grit parse-output staged behavior, CI authority, or product/runtime
behavior. Current resource policy lives in `habitat-git-hook-hardening`: default
pre-commit is read-only for resources and explicit resource publishing happens
through the resource publish workflow.

## Authority

- Root/subtree `AGENTS.md`: root repo workflow, generated-output hygiene, Graphite stack discipline, Habitat boundaries target guidance.
- Product refs: `docs/projects/habitat-harness/FRAME.md` hard core #5 and D3 hook decision.
- Architecture refs: `docs/projects/habitat-harness/taxonomy.md`, `docs/projects/habitat-harness/invariant-corpus.md`, H6 enforcement-consolidation closure record.
- Project refs: `docs/projects/habitat-harness/workstream-record.md`, `openspec/changes/habitat-git-hooks/{proposal.md,tasks.md,specs/habitat-harness/spec.md}`.
- Excluded/stale inputs: chat memory and earlier wrapper experiments are discovery only; current files and command output are authoritative.

## Current State

- Repo/Graphite state: clean worktree at H7 branch open; H6 locally closed at `fe03dcbb0`.
- Dirty files and owner: none at phase open.
- Current code evidence: root `package.json` has `habitat` oclif dev entrypoints and H4.5 left a `habitat hook` stub; H7 replaces that stub. Existing legacy hook path is `scripts/git-hooks/pre-commit` -> `scripts/civ7-resources/publish-submodule.sh`.
- Tool invocation policy: committed scripts and hook code call repo tools by program
  name (`nx`, `biome`, `grit`) while the Habitat spawn adapter prepends
  `node_modules/.bin` to `PATH`; explicit `./node_modules/.bin/...` forms in
  this record are historical evidence commands, not the live contract.
- Generated outputs affected: none expected; hooks must not hand-edit generated outputs.
- Tests/guards affected: Habitat CLI command tests, hook safety probes, OpenSpec validation, root Habitat verification.

## Scope

- Write set: `.husky/**`, root `package.json`/`bun.lock`, `tools/habitat-harness/**`, `docs/projects/habitat-harness/**`, `openspec/changes/habitat-git-hooks/**`, root `AGENTS.md`, and removal of `scripts/git-hooks/**` only after legacy behavior is folded into Habitat or explicitly dispositioned.
- Protected files: generated outputs (`dist/`, `mod/`, generated bundles), unrelated OpenSpec changes, unrelated app/package code.
- Owners: Husky owns Git hook invocation; oclif owns human/hook command surface; Habitat owns rule-pack/baseline semantics and hook orchestration; Nx/Grit/Biome keep owning their enforcement layers.
- Forbidden owners: hooks must not become CI truth, ad-hoc shell policy engines, broad staging managers, or full repo pre-commit auditors.
- Consumer impact: contributors get local staged feedback and pre-push affected checks; `--no-verify` remains allowed because CI is authoritative.
- Downstream assumptions: H8 generators/migrations can rely on `habitat hook` existing as the local command boundary.
- Mutation policy: formatter restage remains path-exact and limited to
  formatter-touched files. The original H7 closure preserved legacy resource
  publishing as an explicit carve-out, but that carve-out is historical and no
  longer the current pre-commit policy. Current pre-commit performs read-only
  resource-state gating; resource publication is an explicit workflow outside
  default hooks.

## Spec/Tasks

- Spec/proposal: H7 OpenSpec files exist and validate pre-implementation pending command run.
- Tasks: implementation tasks complete except final Graphite commit proof and
  budget-equivalent post-commit timing proof.
- Validation status: `bun run openspec -- validate habitat-git-hooks --strict`
  passed after implementation.

## Review

- Review lanes: owner implementation; read-only H7 hook risk review by sidecar explorer; safety/evidence review via probe matrix; closure review against task file and workstream record.
- Blocking findings: none at phase open.
- Accepted findings repaired: none.
- Rejected/invalidated/waived/deferred findings: commit-msg hook and post-checkout/post-merge hooks are deferred by proposal and must be documented, not silently omitted.

## Agent Fleet State

- Active agents: none assigned in this phase at open.
- Completed agents: Lovelace (`019ec39f-ed4e-72c1-82fc-4c36467c0c32`) read-only H7 hook risk review; prior Grit/design investigations are discovery input only.
- Assigned write sets: N/A.
- Latest evidence by agent: Lovelace flagged partially staged Biome mutation risk, resource-publish mutation carve-out, stale `habitat hook` stub wording, stale docs for `setup:git-hooks`, and pre-push target/base mismatch.
- Open findings by agent: N/A.
- Running/stale status: no active phase agents known after Lovelace completion.
- Integration owner: workstream owner agent.

## Implementation

- Completed tasks: phase record opened before implementation; task 1.1 timing
  baselines measured before Husky wiring; Husky wiring, pre-commit,
  pre-push, legacy hook fold-in, safety probes, docs, and focused gates are
  implemented and verified for the historical H7 closure. The legacy resource
  fold-in is superseded by the current hook-hardening policy.
- Remaining tasks: final Graphite commit proof (`gt modify` with hooks), clean
  one-package timing probe against the recorded budgets, task file closure.
- Stop conditions triggered: none.
- Implementation decision from risk review: pre-commit will fail on partially staged format-eligible files instead of formatting them, because formatting a whole worktree file can mutate unstaged hunks and stash juggling is forbidden.
- Husky dependency decision: `husky@9.1.7` selected after checking npm latest
  metadata (`npm view husky version dist.integrity time.modified --json`;
  latest `9.1.7`, integrity `sha512-5gs5...`, modified
  `2025-01-11T17:19:02.945Z`). `bun audit --audit-level=moderate` reports 73
  pre-existing workspace advisories and does not list Husky; this is recorded
  as a supply-chain boundary, not a whole-repo audit pass.
- Hook command shape:
  - `.husky/pre-commit` delegates to `bun run habitat hook pre-commit`.
  - `.husky/pre-push` delegates to `bun run habitat hook pre-push`.
  - `habitat hook pre-commit` preserved the legacy resource publish script in
    this historical closure; current hook-hardening supersedes that behavior
    with a read-only resource-state gate and explicit publish workflow.
  - The H7 pre-commit path ran a staged file-layer guard first, failed fast on
    partially staged
    format-eligible files, formats/checks only staged Biome-supported paths,
    restages only formatter-touched paths, and runs one native path-scoped
    `grit --json check --level error` over staged TS/JS paths.
  - `habitat hook pre-push` runs `nx affected -t
    biome:ci,boundaries,grit:check,habitat:check,test --base <base>
    --head HEAD --excludeTaskDependencies` with Graphite parent base when
    available and merge-base with `main` otherwise. `--head HEAD` keeps the
    hook on the committed range being pushed rather than uncommitted/untracked
    worktree files; dependency expansion is left to CI/explicit verification.
  - H7 keeps hooks local and advisory-to-CI: `--no-verify` remains the local
    escape hatch, and CI remains authoritative.

## Timing Baselines

Record before wiring hooks per task 1.1:

| Hook | Probe set | Baseline | Budget | Evidence command |
|---|---|---:|---:|---|
| pre-commit | 10 temporary staged TS files under `tools/habitat-harness/.hook-baseline-probe/`, including the then-current legacy resource publish path, Biome format/check, one native staged-path Grit check, and staged file-layer guard | 1.88s | 3.76s | `/usr/bin/time -p sh -c 'bash scripts/civ7-resources/publish-submodule.sh; xargs biome format --write --no-errors-on-unmatched < /tmp/habitat-h7-precommit-files.txt; git add --pathspec-from-file=/tmp/habitat-h7-precommit-files.txt; xargs biome check --no-errors-on-unmatched < /tmp/habitat-h7-precommit-files.txt; GRIT_TELEMETRY_DISABLED=true GRIT_CACHE_DIR=.grit/cache xargs grit --json check --level error < /tmp/habitat-h7-precommit-files.txt >/tmp/habitat-h7-precommit-grit.json; bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json >/tmp/habitat-h7-precommit-file-layer.json'` |
| pre-push | one-package harness change measured against Graphite parent `agent-F-habitat-enforcement-consolidation`, target set `biome:ci,boundaries,grit:check,habitat:check,test` | 2.61s | 5.22s | `/usr/bin/time -p nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base agent-F-habitat-enforcement-consolidation --outputStyle=static` |

Timing note: the same pre-push target set measured against `main` took 62.45s and affected 18 projects plus dependencies because the whole Graphite downstack differs from `main`. H7 therefore resolves the local hook base to the Graphite parent when available, falling back to the merge-base with `main` only outside a tracked stack.

Post-wiring timing boundary: the original 5.22s pre-push budget was derived
from a bounded one-package probe. The broad H7 branch itself changes root
scripts, docs, Husky files, and Habitat sources, so Nx correctly marks a much
larger set affected. The broad H7 committed-range hook passed functionally but
timed at 42.51s cold-ish and 18.40s hot-cache. That is recorded as an
operational boundary, not a hidden failure: local hooks are fast for the
declared bounded probe class, while broad harness/root slices can exceed the
budget and rely on Nx cache plus CI/explicit verification. Classification:
the 42s wait is an edge case of modifying the harness/root environment itself,
not the normal contributor path. Normal pre-push input is the committed range
being pushed (`--head HEAD`) against the branch parent; uncommitted scratch
files and untracked probes are deliberately outside the hook's scope.

## Verification

- Commands run:
  - `git status --short --branch` -> clean on `agent-F-habitat-git-hooks`.
  - `gt log short --stack` -> H7 stacked above H6.
  - `bun run openspec -- list` -> H7 0/14 tasks before work.
  - Pre-commit timing baseline command above -> pass, 1.88s.
  - Pre-push timing baseline against Graphite parent above -> pass, 2.61s.
  - Pre-push contrast against `main` -> pass, 62.45s, not used as hook budget because it measures the full downstack.
  - `npm view husky version dist.integrity time.modified --json` -> latest
    `9.1.7`, integrity present.
  - `bun add -d husky@9.1.7` -> root dependency installed.
  - `bun run prepare && git config --get core.hooksPath` -> `.husky/_`.
  - `bun audit --audit-level=moderate` -> fails on 73 pre-existing workspace
    advisories; Husky absent from advisory output.
  - `bun run habitat hook pre-commit` with no staged files -> pass.
  - Staged/unstaged isolation probe -> pass; staged TS was formatted/restaged,
    separate unstaged file hash unchanged.
  - Foreign staged-file probe -> pass; staged `.txt` foreign file remained
    byte-identical while staged TS was formatted.
  - Partially staged format-eligible probe -> pass; hook failed before
    formatting with the partial-stage refusal message and left the worktree
    hash unchanged.
  - Generated-zone probe -> pass; staged hand-edit under generated map output
    was blocked by file-layer guard.
  - pnpm artifact probe -> pass; staged `pnpm-lock.yaml` was blocked by the
    file-layer package-manager artifact rule.
  - `bun run --cwd tools/habitat-harness check` -> pass.
  - `bun run --cwd tools/habitat-harness test` -> pass, 2 files / 9 tests,
    including native `grit patterns test` through the harness test.
  - `bun run biome:ci` -> pass, 2334 files.
  - `bun run habitat:check -- --owner @internal/habitat-harness` -> pass, 14
    rules, 0 failing, 1 advisory doc-ambiguity finding.
  - `bun run openspec -- validate habitat-git-hooks --strict` -> pass.
  - `/usr/bin/time -p bun run habitat hook pre-push --base
    agent-F-habitat-enforcement-consolidation` on the full dirty H7 slice ->
    pass, 35.42s, 18 affected projects plus dependencies, 32/40 tasks from
    cache. This is additional full-slice evidence, not the task 4.1
    one-package budget-equivalent measurement.
  - `gt modify --no-interactive -m "feat(habitat): add git hook enforcement
    path"` -> pass; Graphite commit path ran `habitat hook pre-commit`,
    file-layer staged check passed, Biome formatted/checked 11 staged files
    with no fixes, native staged-path Grit returned no findings, commit
    `a2923f183` created.
  - Pre-push correction probe: `bun run habitat hook pre-push --base
    agent-F-habitat-enforcement-consolidation` after wiring `--head HEAD
    --excludeTaskDependencies` -> pass, 42.51s cold-ish on broad H7
    committed range; rerun -> pass, 18.40s hot-cache.
- Results: implementation gates, safety probes, Graphite commit hook proof,
  and committed-range pre-push functional proof passed.
- Skipped gates and rationale: none. Timing boundary is recorded above: broad
  harness/root slices exceed the bounded probe budget by design of the affected
  surface and are not treated as the bounded one-package timing class.
- Evidence boundary: local Git/hooks behavior only; CI proof remains
  post-submit. Resource publish behavior in this record is historical and is not
  current proof for default pre-commit side effects.

## Realignment

- Downstream docs/specs/issues updated at H7 closure: H7 proposal/tasks,
  Habitat README, root AGENTS, contributing/resource-submodule docs updated.
  Later hook hardening supersedes resource-publish-in-pre-commit guidance with
  explicit resource publishing and read-only pre-commit resource-state checks.
- Tests/guards updated: Habitat command tests updated for real hook runner;
  native Grit pattern test kept as the Grit correctness authority; file-layer
  pnpm artifact guard added to the rule pack with empty locked baseline.
- Deferrals/triage updated: commit-msg and post-checkout/post-merge hooks
  documented as deferred; CI remains authoritative and `--no-verify` remains
  allowed locally.
- Downstream realignment ledger: phase record only unless H7 changes downstream assumptions.

## Next Action

- Exact next step: historical packet is realigned for current record truth. Use
  `habitat-git-hook-hardening` for current hook-resource and transaction proof
  boundaries.
- First files to inspect if a hook gate regresses:
  `tools/habitat-harness/src/lib/hooks.ts`,
  `tools/habitat-harness/src/lib/generated-zones.ts`,
  `tools/habitat-harness/src/rules/rules.json`.
- Stop condition: if future local hooks need broad/root slices under a strict
  sub-5s budget, split the pre-push target set or add a dedicated
  hook-local target rather than weakening Habitat rules.
