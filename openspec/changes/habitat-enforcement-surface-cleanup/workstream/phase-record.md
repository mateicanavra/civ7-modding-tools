# Phase Record

## Phase

- Project: Habitat Harness
- Phase: enforcement surface cleanup / `habitat-enforcement-surface-cleanup`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-enforcement-inventory-proof`
- Started: 2026-06-14
- Status: root/CI/rule-owner/plugin-target inventory proof checkpoint in
  implementation; broader enforcement-surface cleanup remains open.

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
- Current root `check` and CI route through the Nx graph. Root `lint` is the
  graph-owned Habitat structural-check lane; root `verify` is the
  package-owned verifier aggregate. There is no root `habitat:verify` script.
- Current root direct diagnostic aliases remain for `mapgen-docs` and
  strict-core domain refactor guardrails.
- Current rule pack still contains wrapped scripts and wrapped tests.
- Current stale owner-tool selector `wrapped-eslint` green-passes with only
  `baseline-integrity`.
- Current `habitat verify --base HEAD --json` emits a schemaVersion 1
  `VerifyProof` artifact and exits 1 before Nx affected because Habitat check
  currently fails on unrelated `biome-ci` and
  `arch-test-map-bundle-runtime-imports`. This is whole-command truth for the
  direct Habitat CLI verify path, not verify closure.

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

- Completed tasks before implementation: 1.1-2.6, 6.1, 6.2, 7.4, 7.5,
  9.1-9.3, 9.12-9.14, and 9.16. The structured `habitat verify --json`
  proof checkpoint is supervisor-accepted.
- Completed in this checkpoint: 3.1, 3.2, 9.4, 9.5, and 9.6 for the
  root/CI/rule-owner/plugin-target inventory proof boundary.
- Remaining tasks: wrapper disposition/parity, stale selector proof,
  verify composition decision, downstream realignment, packet closure, and
  supervisor review.
- Implementation status: inventory-proof checkpoint ready for local
  verification and Graphite commit.

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
  - `bun run verify`
  - `bun run lint`
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
  not prove full enforcement-surface cleanup.

## Verify Proof Checkpoint

- Implementation adds `habitat verify --json` as a structured proof artifact
  path without changing the existing human transcript mode.
- Supervisor acceptance: accepted for the bounded proof-artifact outcome.
- Manual non-adoption of Effect is accepted for this bounded slice because the
  implementation is local data assembly over existing synchronous command
  boundaries: typed `VerifyProof` data, explicit final exit code, selected
  real rule ids excluding built-ins, conservative cache-state modeling, bounded
  stdout/stderr fields, and post-run Git/resource state. It does not add
  parallel orchestration, resource acquisition/finalizers, retry policy,
  cleanup ownership, or new command-runner abstraction.
- Unit coverage:
  - `habitat-commands.test.ts` proves `verify --json` calls
    `createVerifyProof` and emits JSON instead of falling through to the human
    transcript.
  - `verify-proof.test.ts` proves Nx stdout/stderr are embedded truthfully and
    that a global Nx cache phrase does not mark every task as `cache-hit`.
    It also proves the failed-Habitat-check path emits
    `nxAffected.status: "skipped"`, `skipReason: "habitat-check-failed"`, and
    `exitCode: null` instead of presenting a not-run Nx command as a failed Nx
    execution.
- Current command proof:
  - `bun run habitat -- verify --base HEAD --json` exits 1 with
    `command.exitCode: 1`, selected real rule ids, failing count 2, advisory
    count 1, `nxAffected.status: "skipped"`, `skipReason:
    "habitat-check-failed"`, `nxAffected.exitCode: null`, and clean resources
    status because Nx was not run after the failing Habitat check.
- Non-claims: no green `habitat verify` closure, no CI execution proof, no
  broad Nx affected coverage, no wrapper parity closure, no selector closure
  beyond consumed command-surface behavior, no Grit row semantics, no baseline
  migration, and no product/runtime proof.

## Enforcement Inventory Checkpoint

- Implementation adds focused executable inventory coverage in
  `enforcement-surface.test.ts`.
- Proof classes:
  - Root structural script inventory: root `check`, `ci`, `lint`, `verify`,
    `habitat*`, and structural `lint:*` / `check:*` scripts are classified as
    graph-owned aggregate, graph-owned Habitat lint, package diagnostic,
    direct Habitat CLI/mutation, direct legacy diagnostic, or Habitat rule
    alias.
  - CI step classification: `.github/workflows/ci.yml` is checked for the main
    `bun run ci` graph step, strict-core diagnostic step, Habitat JSON
    diagnostics artifact step, upload step, and absence of stale
    `habitat:verify` wiring.
  - Rule owner inventory: the typed rule pack is checked for current
    `ownerTool` counts.
  - Habitat-owned Nx target inference: `src/plugin.js` is invoked directly to
    prove the currently inferred Habitat project targets and rule aliases.
- Non-claims: no wrapper direct-vs-Habitat parity, no invalid selector proof,
  no wrapper retirement, no downstream realignment closure, no CI execution
  proof, no Grit row semantics, no baseline semantics, and no product/runtime
  proof.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Finish focused verification, commit this inventory-proof checkpoint through
  Graphite, and stop for supervisor review.
