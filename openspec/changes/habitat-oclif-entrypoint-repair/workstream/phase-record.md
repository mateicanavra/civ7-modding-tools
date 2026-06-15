# Phase Record

## Phase

- Project: Habitat Harness
- Phase: P0 command trust repair / `habitat-oclif-entrypoint-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame` above
  `agent-F-habitat-recovery-reference`
- Started: 2026-06-14
- Status: Design packet reviewed; accepted findings repaired in draft;
  implementation not started

## Objective

- Target movement: restore truthful command orientation and selector behavior
  for Habitat's canonical root, development, and production entrypoints before
  any downstream Grit proof or pattern backfill relies on them.
- Non-goals: no new Grit rules, no baseline policy change beyond selector
  report rendering, no hook behavior changes, no classify/generator repair, no
  product/runtime architecture changes, no generated artifact hand edits.
- Done condition: reviewed OpenSpec packet, implemented root/dev/prod help
  repair, invalid selector failure repair, real entrypoint tests, stale-record
  realignment, verification commands recorded, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Effect evaluation:
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`,
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`, and
  `docs/projects/habitat-harness/research/official-docs-effect.md`.
- Existing oclif spec:
  `openspec/changes/habitat-oclif-cli/specs/habitat-harness/spec.md`.
- Repo-local oclif precedent: `packages/cli/bin/dev.ts`,
  `packages/cli/bin/run.js`, and `packages/cli/AGENTS.md`.

## Current State

- Repo/Graphite state at phase open: worktree clean on
  `codex/habitat-dra-takeover-frame`.
- Current command evidence:
  - `bun run habitat -- --help` exits 2 with unknown-command output.
  - `bun run habitat -- check --help` exits 2 without help output.
  - Direct source oclif shim help exits 0.
  - Invalid `--rule` and `--tool` selectors exit 0 with only
    `baseline-integrity`.
  - Valid `--tool grit-check` returns 22 Grit rules plus
    `baseline-integrity`.
- Current test evidence: `habitat-commands.test.ts` mocks
  `command-engine.js`, so it cannot prove root/dev/production entrypoints.
- Stale record evidence: `habitat-oclif-cli` phase record claims root/check
  help smoke exits 0; current root probes contradict that claim.

## Scope

- Write set: see `design.md` Write Set.
- Protected paths: `.grit/**`, `tools/habitat-harness/baselines/**`,
  generated `dist/**`, generated `oclif.manifest.json`, hook implementation,
  Nx taxonomy/boundary config.
- Owner: `@internal/habitat-harness` command shell and check selector boundary.
- Forbidden owners: Grit pattern semantics, baseline expansion policy, Biome
  write behavior, Nx graph authority, hook side effects, classify/generator
  surfaces.
- Downstream assumptions: `habitat-grit-proof-repair` and the first Grit pilot
  depend on this repair before trusting command filters.

## Effect Decision

This phase starts with deliberate non-adoption for P0 command repair:

- Oclif remains the command shell.
- Root help failure is localized to the manual dev dispatcher.
- Selector repair must still introduce explicit typed selector outcomes.
- Effect adoption is reopened if typed selector outcomes, command provenance, or
  service-test seams cannot be achieved cleanly in current TypeScript, or if the
  implementation hits a row in the Effect Trigger Matrix from `design.md`.

This decision applies only to this command-surface repair. It does not reject
`habitat-effect-check-pipeline`, `habitat-effect-command-runner`,
`habitat-effect-grit-adapter`, or `habitat-effect-hook-transaction`.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-oclif-entrypoint-repair/`
- Tasks: `openspec/changes/habitat-oclif-entrypoint-repair/tasks.md`
- Validation status: `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`
  passed on 2026-06-14 before final packet commit.

## Review

- Required lanes:
  - Command-surface reviewer.
  - Evidence reviewer.
  - System reviewer.
  - Effect/substrate reviewer.
- Review artifacts:
  - `workstream/reviews/command-surface-review.md`
  - `workstream/reviews/evidence-system-review.md`
  - `workstream/reviews/effect-substrate-review.md`
  - `workstream/review-disposition-ledger.md`
- Blocking findings: none after repair. All accepted P1/P2 findings are
  dispositioned in `workstream/review-disposition-ledger.md`.

## Agent Fleet State

- Active agents: none.
- Completed agents: command-surface, evidence/system, and Effect/substrate
  reviewers.
- DRA owner retains synthesis, proof claims, review disposition, and repo state.

## Implementation

- Completed tasks: 1.1-1.4 design/review gate.
- Remaining tasks: implementation, runtime verification, downstream
  realignment, and Graphite closure tasks remain unchecked.
- Stop conditions triggered: none at phase open.

## Verification

- Commands run for this phase so far:
  - `git status --short --branch`
  - `gt status`
- `bun run openspec -- validate habitat-oclif-entrypoint-repair --strict`
- Results: clean worktree at phase opening; change-specific OpenSpec
  validation passed before final packet commit.
- Evidence boundary: current phase has design evidence only; it does not prove
  command repair.

### Command Proof Record Shape

Implementation verification must record this shape for each command proof:

| Field | Required content |
| --- | --- |
| Proof label | command-surface / selector-failure / JSON compatibility / production-runner / stale-record realignment |
| Invocation | exact argv as executed |
| CWD | working directory |
| Env delta | relevant env additions or proof that none were set |
| Branch/commit | current branch and commit or dirty state at proof time |
| Exit code | numeric process exit code |
| Stdout class | help / JSON CheckReport / human failure / no output, with bounded excerpt when useful |
| Stderr class | empty / expected diagnostic / unexpected output, with bounded excerpt when useful |
| Duration | measured duration or timing source |
| Failure class | none / unknown command / selector failure / production artifact issue / tool failure |
| Production artifact freshness | build command, generated artifact paths, manifest/dist mtime or hash after build, and generated-output drift status when the proof uses `bin/run.js` |
| Non-claims | what the proof does not establish |

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Known stale records to patch during implementation:
  - `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`
  - `docs/projects/habitat-harness/workstream-record.md`
  - `docs/projects/habitat-harness/review-disposition-ledger.md`
  - `docs/projects/habitat-harness/discrepancy-log.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `tools/habitat-harness/README.md` if command UX or selector failure output
    changes

## Next Action

- Commit this design checkpoint, then move to the next Habitat recovery
  design packet.
