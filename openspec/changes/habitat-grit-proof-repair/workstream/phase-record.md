# Phase Record

## Phase

- Project: Habitat Harness
- Phase: P0/P1 Grit proof repair / `habitat-grit-proof-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: Design packet reviewed; accepted findings repaired in draft;
  implementation not started

## Objective

- Target movement: make the current Grit tranche a truthful executable proof
  surface before new Grit pilot work begins.
- Exterior: no new Grit rule semantics, no generated-output hand edits, no
  runtime Civ7 claim, no selector implementation beyond the dependency on
  `habitat-oclif-entrypoint-repair`.
- Done condition: reviewed OpenSpec packet, proof matrix, injected-violation
  harness, baseline disposition, apply safety proof, stale-record realignment,
  verification commands recorded, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Grit corpus ledger: `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- Official docs packs:
  - `docs/projects/habitat-harness/research/official-docs-gritql.md`
  - `docs/projects/habitat-harness/research/official-docs-biome.md`
  - `docs/projects/habitat-harness/research/official-docs-nx.md`
  - `docs/projects/habitat-harness/research/official-docs-effect.md`
- Local evidence packs:
  - `docs/projects/habitat-harness/research/local-grit-corpus-extraction.md`
  - `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
- Historical H5/H6 records:
  - `openspec/changes/habitat-grit-catalog/**`
  - `openspec/changes/habitat-enforcement-consolidation/**`

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Recent local commit before phase open:
  `4f7672876 docs(habitat): design command trust repair`.
- Current implemented corpus:
  - 22 check patterns under `.grit/patterns/habitat/checks/`.
  - 1 apply pattern under `.grit/patterns/habitat/apply/`.
- Fresh native sample proof:
  - `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
  - 23 reports, 45 samples, all success/pass.
- Fresh Habitat current-tree wrapper proof:
  - `bun run habitat:check -- --json --tool grit-check`
  - schemaVersion 1, `ok:true`, 23 passing reports including
    `baseline-integrity`.
- Fresh selector contradiction:
  - `bun run habitat:check -- --json --rule grit-check`
  - schemaVersion 1, `ok:true`, only `baseline-integrity`.
- Fresh raw Grit acquisition probe:
  - direct raw current-tree command was interrupted after useful design-probe
    bound and produced no captured proof.
- Fresh dry-run apply proof:
  - `bun run habitat:fix -- --dry-run`
  - Grit processed 234 files and found 0 matches; Biome checked 2343 files and
    applied no fixes.
- Fresh old-mechanism probes:
  - wrapped-script: 4 pass.
  - wrapped-test: 7 pass.
  - wrapped-eslint: 1 pass.
- Fresh Nx scheduling probe:
  - `bun run nx run @internal/habitat-harness:grit:check --outputStyle=static`
    passed from Nx cache.
- Baseline corpus:
  - only `tools/habitat-harness/baselines/adapter-boundary.json` exists.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: generated output paths, `.civ7/outputs/**`, product/runtime
  source unrelated to probes, Nx/Biome/taxonomy config unless a separate
  workstream owns it.
- Owner: `@internal/habitat-harness` proof model and current Grit tranche.
- Forbidden owners: new rule semantics, product/runtime proof, generated
  output edits, Grit ownership of Nx/Biome/file-layer responsibilities.

## Effect Decision

This phase starts as a proof repair over current TypeScript. It does not adopt
Effect merely to record proof. Effect is reopened before dependent code changes
if implementation needs new manual machinery for:

- Grit command provenance;
- JSON parse/schema failure classes;
- scan-root service seams;
- dry-run/apply transactions;
- cleanup/finalizers;
- fake-service adapter tests.

The authoritative trigger list is the Effect Trigger Matrix in `design.md`.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-grit-proof-repair/`
- Tasks: `openspec/changes/habitat-grit-proof-repair/tasks.md`
- Proof matrix: `workstream/grit-proof-matrix.md`
- Command proof log: `workstream/command-proof-log.md`
- Validation status: `bun run openspec -- validate habitat-grit-proof-repair --strict`
  passed on 2026-06-14 after review repairs.

## Substrate Decision Table

This table must be completed and accepted by the Effect/substrate lane before
implementation tasks 4, 6, or adapter tests begin.

| Concern | Current-code capability | Required proof | Chosen substrate | Trigger result | Evidence path | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| Injected violation harness | pending | exact rule id, path control, cleanup | pending | blocked | pending | Effect/substrate |
| Grit command provenance | pending | argv/cwd/env/cache/duration/failure class | pending | blocked | pending | Effect/substrate |
| Parse/schema classification | pending | no JSON, malformed JSON, wrapper noise, schema drift, empty roots, pattern miss | pending | blocked | pending | Effect/substrate |
| Apply transaction | pending | clean precheck, target export preflight, dry-run, diff, rollback, cleanup | pending | blocked | pending | Effect/substrate |
| Fake-service tests | pending | fake command/fs/baseline/clock or accepted no-fake rationale | pending | blocked | pending | Effect/substrate |

## Review

- Required lanes:
  - Grit corpus reviewer.
  - Evidence/system reviewer.
  - Effect/substrate reviewer.
- Review artifacts:
  - `workstream/reviews/grit-corpus-review.md`
  - `workstream/reviews/evidence-system-review.md`
  - `workstream/reviews/effect-substrate-review.md`
  - `workstream/review-disposition-ledger.md`
- Blocking findings: none after repair. All accepted P1/P2 findings are
  dispositioned in `workstream/review-disposition-ledger.md`.

## Agent Fleet State

- Active agents: none.
- Completed agents: Grit corpus, evidence/system, and Effect/substrate
  reviewers.
- DRA owner retains synthesis, proof claims, review disposition, and repo state.

## Implementation

- Completed tasks: 1.1-1.4 design/review gate.
- Remaining tasks: implementation, verification, downstream realignment, and
  closure tasks remain unchecked.
- Stop conditions triggered: raw current-tree Grit acquisition proof is
  unresolved; this is a design input, not an implementation blocker yet.
  Explicit empty Grit baselines are the chosen repair disposition for current
  enforced Grit checks.

## Verification

- Commands run for this phase so far:
  - `git status --short --branch`
  - `rg --files .grit/patterns/habitat`
  - `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
  - `bun run habitat:check -- --json --tool grit-check`
  - `bun run habitat:check -- --json --rule grit-check`
  - raw `grit --json check` probe over declared roots, interrupted
  - `bun run habitat:fix -- --dry-run`
  - wrapped-script/wrapped-test/wrapped-eslint JSON probes
  - `bun run nx run @internal/habitat-harness:grit:check --outputStyle=static`
  - `find tools/habitat-harness/baselines -maxdepth 1 -type f`
  - `bun run openspec -- validate habitat-grit-proof-repair --strict`
  - full-depth-language guardrail scan over Habitat initiative docs
- Evidence boundary: current phase has design evidence only. It does not prove
  injected violations, baseline disposition, or apply safety.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Known stale records to patch during implementation:
  - `openspec/changes/habitat-grit-catalog/tasks.md`
  - `openspec/changes/habitat-grit-catalog/workstream/phase-record.md`
  - `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md`
  - `docs/projects/habitat-harness/workstream-record.md`
  - `docs/projects/habitat-harness/recovery-claim-ledger.md`
  - `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  - `docs/projects/habitat-harness/review-disposition-ledger.md`
  - `docs/projects/habitat-harness/discrepancy-log.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `tools/habitat-harness/README.md` if user-facing proof or generator
    guidance changes

## Next Action

- Run OpenSpec validation for the draft packet.
- Send Grit corpus, evidence/system, and Effect/substrate review agents.
- Patch accepted P1/P2 findings before implementation is declared ready.
