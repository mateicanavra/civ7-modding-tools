# Phase Record

## Phase

- Project: Habitat Harness
- Phase: enforcement surface cleanup / `habitat-enforcement-surface-cleanup`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet opened; reviews received; accepted P1/P2 findings
  patched; OpenSpec and language validation passed for the design packet

## Objective

- Target movement: make structural enforcement proof current, canonical, and
  truthful across root scripts, CI, Habitat commands, wrappers, and stale H6
  records.
- Exterior: product/runtime behavior, Grit pattern semantics, baseline
  key/state implementation, hook mutation policy, generated output.
- Done condition: reviewed OpenSpec packet, accepted proof matrix,
  stale-record plan, validation, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Original Habitat frame: `docs/projects/habitat-harness/FRAME.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- H6 historical source: `openspec/changes/habitat-enforcement-consolidation/**`.
- Current repair dependencies:
  `habitat-oclif-entrypoint-repair`, `habitat-grit-proof-repair`,
  `habitat-scaffold-contract-repair`,
  `habitat-boundary-taxonomy-tightening`.
- Official docs cited in `proposal.md`.
- Effect local research:
  `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- `CLAIM-H6-ONE-PATH` remains mixed in Stage 0.
- Historical H6 says Habitat is the single structural enforcement path.
- Current root `check` and CI route through `habitat:verify`.
- Current root direct diagnostic aliases remain for `mapgen-docs` and
  strict-core domain refactor guardrails.
- Current rule pack still contains wrapped scripts and wrapped tests.
- Current stale owner-tool selector `wrapped-eslint` green-passes with only
  `baseline-integrity`.
- Current `habitat verify` exits 0 locally, with one Nx task read from cache.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- H6 made real consolidation progress, but current proof must distinguish
  canonical Habitat entrypoints from surviving wrappers and diagnostic aliases;
- selector truth is a prerequisite because stale owner-tool proof can still
  green-pass;
- wrapper parser policy is required because direct output and Habitat reports
  can disagree;
- Effect must be reconsidered for implementation slices that would otherwise
  preserve fragile manual command orchestration, proof provenance, cleanup, or
  service-test boundaries;
- stale H6 records must be patched in the same implementation loop.
- `habitat verify` requires a structured `VerifyProof` artifact; terminal
  summaries are not closure evidence.
- CI proof must classify main CI and architecture CI steps separately.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: generated outputs, resources, Grit pattern semantics,
  baseline files except as consumed from baseline repair, product/runtime
  behavior.
- Owner: enforcement-surface taxonomy, root/CI proof policy, wrapper
  disposition, Effect decision gating, stale H6 records.
- Forbidden owners: command selector implementation beyond dependency
  consumption, Grit pattern semantics, baseline contract implementation,
  runtime/product verification.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Command/evidence reviewer.
  - Owner-layer reviewer.
  - Wrapper/parser reviewer.
  - Downstream-record reviewer.
  - Effect substrate reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Review artifacts added after disposition:
  - `workstream/verify-proof-contract.md`
  - `workstream/ci-classification.md`
- Blocking findings: accepted P1/P2 findings have been patched into design;
  validation still required.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - Effect adoption fit reviewer.
  - Enforcement-surface adversarial reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3,
  2.4, 2.5, 2.6, 9.1, 9.2, 9.3, and 9.16.
- Remaining tasks: review, validation, implementation proof design, downstream
  realignment, closure.
- Implementation status: not started.

## Verification

- Commands and inspections run for design evidence:
  - `git status --short --branch`
  - `gt status`
  - `bun run openspec -- list`
  - `jq '.scripts' package.json`
  - `sed -n '90,130p' .github/workflows/ci.yml`
  - `jq -r '.rules[] | [.id, .ownerTool, .ownerProject, .lane, (.detect|join(" "))] | @tsv' tools/habitat-harness/src/rules/rules.json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-script --json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-test --json`
  - `bun tools/habitat-harness/bin/dev.ts check --tool wrapped-eslint --json`
  - `bun run lint:mapgen-docs`
  - `bun run habitat:check -- --json --rule mapgen-docs`
  - `bun run lint:domain-refactor-guardrails:strict-core`
  - `bun run habitat:verify`
  - `bun run resources:status`
  - `sed -n '1,180p' .github/workflows/ci.yml`
  - `sed -n '150,240p' docs/projects/habitat-harness/effect-orchestration-evaluation.md`
  - `sed -n '1,120p' docs/projects/habitat-harness/invariant-corpus.md`
  - `sed -n '1,140p' tools/habitat-harness/src/commands/verify.ts`
  - `sed -n '1,140p' tools/habitat-harness/src/lib/spawn.ts`
  - `sed -n '470,610p' tools/habitat-harness/src/rules/rules.json`
  - full-depth-language guardrail scan over this packet
  - `bun run openspec -- validate habitat-enforcement-surface-cleanup --strict`
  - `bun run openspec:validate`
  - `git diff --check`
- Evidence boundary: current phase has design evidence and diagnosis. It does
  not prove implementation repair.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Commit through Graphite with clean worktree.
