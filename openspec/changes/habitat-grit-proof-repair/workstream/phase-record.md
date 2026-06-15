# Phase Record

## Phase

- Project: Habitat Harness
- Phase: P0/P1 Grit proof repair / `habitat-grit-proof-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-grit-proof-repair` over
  `agent-HR-habitat-effect-grit-adapter` over
  `agent-HR-habitat-repair-chain` over `main`
- Started: 2026-06-14
- Status: selector/current-tree wrapper, native-sample, explicit baseline, and
  supervisor-accepted injected-probe safety/cache repair slices recorded;
  old-mechanism parity has a partial Nx dependency-freshness repair and remains
  open on stale `wrapped-eslint` identity plus generated map-bundle freshness;
  injected row proof, apply, broader downstream realignment, and closure remain
  open

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

- Repo state at implementation slice start: clean worktree on
  `agent-HR-habitat-grit-proof-repair`, Graphite-tracked above the accepted
  adapter and command-trust layers.
- Accepted upstream command-trust layer:
  `1673c1b65 fix(habitat): repair command entrypoint trust`.
- Accepted upstream adapter substrate layer:
  `3ceb93d5c feat(habitat): add Effect Grit adapter substrate`.
- Current implemented corpus:
  - 22 check patterns under `.grit/patterns/habitat/checks/`.
  - 1 apply pattern under `.grit/patterns/habitat/apply/`.
- Native sample proof recorded as
  `HGPR-NATIVE-SAMPLES-2026-06-15`:
  - `GRIT_TELEMETRY_DISABLED=true bun x --no-install grit patterns test --json`
  - exit 0; 23 testable patterns, 45 samples, 0 failures.
  - Native Grit writes human pattern lines plus JSON on stderr for this command;
    this is not Habitat adapter parser proof.
- Harness native sample wrapper proof recorded as
  `HGPR-HARNESS-GRIT-PATTERNS-2026-06-15`:
  - `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts`
  - exit 0; Vitest passed 1 file / 1 test.
- Habitat current-tree wrapper proof recorded as
  `HGPR-HABITAT-GRIT-TOOL-2026-06-15`:
  - `bun run habitat:check -- --json --tool grit-check`
  - exit 0; CheckReport schemaVersion 1, `ok:true`, 22 Grit reports plus
    `baseline-integrity`, all pass with zero diagnostics.
- Wrong-namespace selector proof recorded as
  `HGPR-WRONG-NAMESPACE-2026-06-15`:
  - `bun run habitat:check -- --json --rule grit-check`
  - exit 1; CheckReport schemaVersion 1, `ok:false`,
    `rule-selection-integrity` fails because `grit-check` is a tool id, not a
    rule id.
- Per-rule selector proof recorded as
  `HGPR-PER-RULE-SELECTORS-2026-06-15`:
  - Node batch executed `bun run habitat:check -- --json --rule <rule-id>` for
    all 22 current `ownerTool=grit-check` rule ids.
  - Each command exited 0 with exactly the requested Grit rule as `pass` plus
    `baseline-integrity:pass`.
- Direct raw Grit current-tree acquisition remains explicitly unclaimed as
  `HGPR-RAW-GRIT-UNCLAIMED-2026-06-15`.
- Explicit baseline file inventory is recorded as
  `HGPR-BASELINE-FILES-2026-06-15`:
  - all 22 current `ownerTool=grit-check` ids have committed
    `tools/habitat-harness/baselines/<rule-id>.json` files containing explicit
    `[]`.
  - inventory summary recorded missing=0, extra=0, nonEmpty=0.
- Explicit baseline-integrity wrapper proof is recorded as
  `HGPR-BASELINE-INTEGRITY-2026-06-15`:
  - `bun run habitat:check -- --json --tool grit-check`
  - exit 0; CheckReport schemaVersion 1, `ok:true`, 22 Grit reports plus
    `baseline-integrity`, all pass with zero diagnostics.
- Baseline shrink-only unit behavior is recorded as
  `HGPR-BASELINE-UNIT-2026-06-15`:
  - `bun run --cwd tools/habitat-harness test -- baseline.test.ts`
  - exit 0; Vitest passed 1 file / 3 tests for explicit empty baselines,
    rejection of added entries for existing rules, and allowance only for
    rule-introduction changes.
- Current old-mechanism parity probe is recorded as:
  - `HGPR-PARITY-WRAPPED-SCRIPT-2026-06-15`: `bun run habitat:check -- --json
    --tool wrapped-script` exited 0 with CheckReport schemaVersion 1,
    `ok:true`, `mapgen-docs`, `adapter-boundary`,
    `domain-refactor-guardrails`, and `baseline-integrity` all `pass`.
    `adapter-boundary` still reports 8 allowlisted diagnostics while passing.
  - `HGPR-PARITY-WRAPPED-ESLINT-2026-06-15`: `bun run habitat:check --
    --json --tool wrapped-eslint` exited 1 through
    `rule-selection-integrity`; current `rules.json` has no
    `ownerTool: "wrapped-eslint"` entries. This makes the historical H5/H6
    `wrapped-eslint` parity command stale under the repaired selector
    contract.
  - `HGPR-PARITY-WRAPPED-TEST-2026-06-15`: `bun run habitat:check -- --json
    --tool wrapped-test` exited 1. `arch-test-core-purity`,
    `arch-test-rng-authority`, `arch-test-ecology-step-imports`, and
    `baseline-integrity` passed; `arch-test-m11-projection-band`,
    `arch-test-map-bundle-runtime-imports`, and `arch-test-cutover` failed.
  - Parity closure remains blocked; this evidence is current command truth,
    not row-level Grit parity or retirement proof.
- Current old-mechanism parity repair probe is recorded as:
  - `HGPR-NX-TARGET-OWNERSHIP-2026-06-15`: `nx show project` confirms the
    focused `wrapped-test` architecture targets are real Nx targets with
    `dependsOn` declared through project configuration, and the generated
    Habitat per-rule targets are aliases to those owning Nx targets rather
    than recursive Habitat wrappers.
  - `HGPR-PARITY-WRAPPED-SCRIPT-NX-2026-06-15`: `bun run habitat:check --
    --json --tool wrapped-script` remains current-green with 4 reports all
    `pass`.
  - `HGPR-PARITY-WRAPPED-ESLINT-NX-2026-06-15`: `bun run habitat:check --
    --json --tool wrapped-eslint` still exits 1 through
    `rule-selection-integrity`; `wrapped-eslint` is formally stale H5/H6
    command identity, not a current Habitat tool to resurrect in this packet.
  - `HGPR-PARITY-WRAPPED-TEST-NX-2026-06-15`: `bun run habitat:check --
    --json --tool wrapped-test` now runs dependency-fresh Nx-owned commands for
    `arch-test-core-purity`, `arch-test-rng-authority`,
    `arch-test-ecology-step-imports`, `arch-test-m11-projection-band`, and
    `arch-test-cutover`, and those rules pass. The command still exits 1
    because `arch-test-map-bundle-runtime-imports` fails on missing generated
    map bundle output (`studio-current.js`).
  - Discarded generated-output attempt: wiring
    `arch-test-map-bundle-runtime-imports` to an Nx target depending on
    `mod-swooper-maps:build` made `wrapped-test` exit 0 but dirtied generated
    tracked output (`mods/mod-swooper-maps/mod/config/config.xml`,
    `mods/mod-swooper-maps/mod/swooper-maps.modinfo`,
    `mods/mod-swooper-maps/mod/text/en_us/MapText.xml`) and deleted
    `mods/mod-swooper-maps/src/maps/generated/studio-current.ts` in the
    implementation worktree. Those artifacts were restored from `HEAD`; this
    packet treats map-bundle generated-output freshness as a blocker/non-claim,
    not as a green parity repair.
- Dry-run apply proof remains design-seed only until this packet runs the
  required apply row. Accepted adapter isolated-copy dry-run/apply-match
  behavior is substrate proof, not row semantic proof.
- Baseline corpus:
  - `tools/habitat-harness/baselines/adapter-boundary.json` continues to cover
    the non-Grit adapter-boundary rule.
  - 22 explicit `[]` Grit baseline files now exist for the current enforced
    Grit check ids.
- Injected-proof P1 cleanup incident, recorded 2026-06-15:
  - Supervisor disk review found `git status --short` reporting 240 deleted
    tracked files under protected product/source directories, including
    `mods/mod-swooper-maps/src/domain/ecology/**` and
    `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/**`.
  - Root cause: DRA raw diagnostic code outside the accepted probe harness
    created exact native-sample paths and then removed broad real source
    directories with recursive cleanup (`domain/ecology` and
    `recipes/standard/stages/foundation`) instead of deleting only owned probe
    artifacts.
  - Repair evidence: `git diff --name-only --diff-filter=D | wc -l` reported
    240 before restore; `git diff --name-only --diff-filter=D -z | xargs -0
    git restore --source=HEAD --` restored the deleted tracked files; follow-up
    `git ls-files --deleted | wc -l` reported 0.
  - Repaired boundary: injected probes must now use an explicit probe-owned
    `__habitat...` path segment, source-shaped probe paths are rejected before
    file creation, and focused unit tests prove pre-existing probe directories
    plus sibling files survive cleanup.
  - Follow-up P2 cache repair: the first draft made fresh temporary Grit cache
    allocation global for every `gritCheckProgram()` call. That was rejected as
    broader than the P1 cleanup repair and a public command-surface regression
    risk. The repaired adapter now keeps ordinary current-tree wrapper checks
    on the normal workspace cache policy and requires injected/proof callers
    that create ephemeral files to opt into `cacheMode: "fresh"` plus
    observable freshness.
  - Supervisor acceptance after re-review: `SUP-INJECT-P1-01` path ownership
    and cleanup repair and `SUP-INJECT-P2-02` cache-policy repair are accepted
    for the safety/cache slice at `e2a6fd029`.
  - Remaining non-claims: injected row proof, all-row injected proof,
    cleanup-to-clean-worktree for a full row run, safe probe path controls
    beyond the accepted unit/adapter boundary, row semantic proof, and packet
    closure remain open.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: generated output paths, `.civ7/outputs/**`, product/runtime
  source unrelated to probes, Nx/Biome/taxonomy config unless a separate
  workstream owns it.
- Owner: `@internal/habitat-harness` proof model and current Grit tranche.
- Forbidden owners: new rule semantics, product/runtime proof, generated
  output edits, Grit ownership of Nx/Biome/file-layer responsibilities.

## Effect Decision

This repair packet did not add new manual Grit orchestration. The
Effect/substrate trigger fired for Grit command provenance, exact JSON
parse/schema failure classes, scan-root service seams, dry-run/apply
transactions, cleanup/finalizers, and fake-service adapter tests. Those concerns
were moved into and accepted through `habitat-effect-grit-adapter` at
`3ceb93d5c`.

This packet may consume the accepted adapter contract for command/result,
selector/current-tree wrapper, injected-probe, proof-artifact, and isolated-copy
apply evidence. It must still prove row semantics, baselines, target exports,
and downstream realignment in this packet.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-grit-proof-repair/`
- Tasks: `openspec/changes/habitat-grit-proof-repair/tasks.md`
- Proof matrix: `workstream/grit-proof-matrix.md`
- Command proof log: `workstream/command-proof-log.md`
- Validation status:
  - `bun run openspec -- validate habitat-grit-proof-repair --strict` passed on
    2026-06-15 after selector/current-tree record updates.
  - `bun run openspec:validate` passed on 2026-06-15 with 181 items.

## Substrate Decision Table

This table must be completed and accepted by the Effect/substrate lane before
implementation tasks 4, 6, or adapter tests begin.

| Concern | Current-code capability | Required proof | Chosen substrate | Trigger result | Evidence path | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| Injected violation harness | accepted adapter substrate; row probes pending in this packet | exact rule id, path control, cleanup | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `openspec/changes/habitat-effect-grit-adapter/workstream/phase-record.md` | supervisor / Effect-substrate |
| Grit command provenance | accepted adapter substrate; row proof pending in this packet | argv/cwd/env/cache/duration/failure class | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/habitat-process.ts`; adapter phase record | supervisor / Effect-substrate |
| Parse/schema classification | accepted adapter substrate; row proof pending in this packet | no JSON, malformed JSON, wrapper noise, schema drift, empty roots, pattern miss | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/grit.ts`; adapter tests | supervisor / Effect-substrate |
| Apply transaction | accepted adapter substrate; target-export and semantic proof pending in this packet | clean precheck, pattern-owned approval/failure intake, isolated-copy dry-run diff proof, rollback, cleanup | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/src/lib/grit-apply.ts`; adapter phase record | supervisor / Effect-substrate |
| Fake-service tests | accepted adapter substrate; row probes pending in this packet | fake command/fs/baseline/clock or accepted no-fake rationale | `habitat-effect-grit-adapter` | accepted at `3ceb93d5c` | `tools/habitat-harness/test/lib/*` adapter tests | supervisor / Effect-substrate |

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
- Blocking findings: SUP-INJECT-P1-01 and SUP-INJECT-P2-02 are
  supervisor-accepted for the safety/cache slice at `e2a6fd029`; they no
  longer block the public wrapper cache-policy repair claim for that slice.
  Injected row proof, all-row proof, and packet closure remain open. Earlier
  accepted P1/P2 findings are dispositioned in
  `workstream/review-disposition-ledger.md`.

## Agent Fleet State

- Active agents: none.
- Closed advisory sidecar: `Pascal`
  (`019ec99a-1a96-7472-9a93-ae229fcdff78`) was queued during this slice for a
  separate Bun/Nx/Grit tool-resolution investigation and then closed before
  commit. Its output was not read, consumed, or used as proof or implementation
  input for this Graphite layer.
- Completed agents: Grit corpus, evidence/system, and Effect/substrate
  reviewers.
- DRA owner retains synthesis, proof claims, review disposition, and repo state.

## Implementation

- Completed tasks:
  - 1.1-1.4 design/review gate.
  - 2.3-2.4 native sample and current-tree wrapper command/output records.
  - 3.1-3.5 selector and current-tree proof slice after accepted command-trust
    and adapter layers.
  - 4.6 and 6.9 adapter-acceptance dependency gates for injected harness and
    destructive apply proof.
  - 7.1-7.5 substrate decision recorded as accepted
    `habitat-effect-grit-adapter` dependency.
  - 9.2-9.5 native samples, harness native wrapper, valid tool selector, and
    wrong-namespace selector command gates.
  - 5.1-5.5 explicit Grit baseline files, tests, baseline-integrity proof,
    shrink-only growth policy proof, and H5/H6 baseline wording realignment.
  - 8.1-8.2 H5/H6 downstream records patched for the baseline historical/current
    split.
  - 9.7 explicit Grit baseline behavior proof suite.
- Remaining tasks: matrix fields 2.1-2.2 and 2.5-2.7, injected violation
  harness, apply codemod proof, broader downstream realignment, parity and
  scheduling probes, remaining verification, Graphite commit, and closure.
- Stop/non-claim state: direct raw current-tree Grit acquisition remains
  unresolved and explicitly unclaimed; wrapper proof controls only the Habitat
  current-tree wrapper claim. Explicit empty Grit baselines are accepted only as
  the current file inventory, baseline-integrity wrapper pass, and unit
  shrink-only policy proof. This slice does not prove injected violations, raw
  direct acquisition, live baseline writes, apply safety, parity retirement, or
  product/runtime behavior.
- Current injected-proof implementation state after SUP-INJECT-P1-01 and
  SUP-INJECT-P2-02 repair:
  tracked source deletions restored; focused cleanup/path-control tests pass;
  normal public wrapper checks are no longer forced through fresh temporary
  cache; the supervisor accepted this safety/cache boundary. Injected proof
  execution and row claims remain future packet work, not accepted by the
  safety/cache review.
- Current parity state:
  `wrapped-script` is current-green, the named `wrapped-eslint` probe is a
  repaired-selector unknown-tool failure and formally stale H5/H6 command
  identity, and `wrapped-test` is partially repaired through Nx-owned targets
  but remains current-red on `arch-test-map-bundle-runtime-imports` generated
  output freshness. Task 9.8 and any H5/H6 retirement/parity claim remain open
  until the generated map-bundle output owner path is repaired or formally
  re-scoped.

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
  - `nx run @internal/habitat-harness:grit:check --outputStyle=static`
  - `find tools/habitat-harness/baselines -maxdepth 1 -type f`
  - `bun run openspec -- validate habitat-grit-proof-repair --strict`
  - full-depth-language guardrail scan over Habitat initiative docs
  - `GRIT_TELEMETRY_DISABLED=true bun x --no-install grit patterns test --json`
    (`HGPR-NATIVE-SAMPLES-2026-06-15`)
  - `bun run --cwd tools/habitat-harness test -- grit-patterns.test.ts`
    (`HGPR-HARNESS-GRIT-PATTERNS-2026-06-15`)
  - `bun run habitat:check -- --json --tool grit-check`
    (`HGPR-HABITAT-GRIT-TOOL-2026-06-15`)
  - `bun run habitat:check -- --json --rule grit-check`
    (`HGPR-WRONG-NAMESPACE-2026-06-15`)
  - Node batch executing
    `bun run habitat:check -- --json --rule <rule-id>` for all 22 current
    Grit check ids (`HGPR-PER-RULE-SELECTORS-2026-06-15`)
  - inventory capture for 22 explicit `[]` Grit baseline files
    (`HGPR-BASELINE-FILES-2026-06-15`)
  - `bun run habitat:check -- --json --tool grit-check`
    (`HGPR-BASELINE-INTEGRITY-2026-06-15`)
  - `bun run --cwd tools/habitat-harness test -- baseline.test.ts`
    (`HGPR-BASELINE-UNIT-2026-06-15`)
  - `bun run --cwd tools/habitat-harness check` passed after baseline test
    addition.
  - `bun run --cwd tools/habitat-harness test` passed after baseline test
    addition; 13 files / 80 tests.
  - `bun run openspec -- validate habitat-grit-proof-repair --strict` passed
    after record updates.
  - `bun run openspec -- validate habitat-grit-catalog --strict` passed after
    H5 baseline-record realignment.
  - `bun run openspec -- validate habitat-enforcement-consolidation --strict`
    passed after H6 baseline-record realignment.
  - `bun run openspec:validate` passed with 181 items.
  - `git diff --check` passed.
  - P1 cleanup incident repair:
    - `git status --short --branch` showed 240 deleted tracked files before
      restore.
    - `git diff --name-only --diff-filter=D | wc -l` showed `240` before
      restore.
    - `git diff --name-only --diff-filter=D -z | xargs -0 git restore
      --source=HEAD --` restored deleted tracked files from branch `HEAD`.
    - `git diff --name-only --diff-filter=D | wc -l` and
      `git ls-files --deleted | wc -l` showed `0` after restore.
    - `bun run --cwd tools/habitat-harness test --
      grit-injected-probe.test.ts` passed: 1 file / 6 tests.
    - `bun run --cwd tools/habitat-harness test -- grit-adapter.test.ts
      grit-injected-probe.test.ts` passed: 2 files / 21 tests.
    - `bun run --cwd tools/habitat-harness check` passed.
    - `bun run --cwd tools/habitat-harness test` passed: 13 files / 84 tests.
    - `bun run habitat:check -- --json --tool grit-check >
      /tmp/habitat-grit-check-workspace-cache-repair-commit-rerun.json` passed
      when run standalone with
      CheckReport schemaVersion 1, `ok:true`, 22 Grit rules plus
      `baseline-integrity`, all `pass`, zero diagnostics,
      `sha256=27a8f3586dd8833a067c8d1cd7bafe3e790cf49a8bccbe834b31b7bdd1f4061b`,
      and max per-rule duration `2206ms` under the narrowed normal workspace
      cache policy. This is public wrapper compatibility evidence, not
      injected-row proof.
    - `bun run openspec -- validate habitat-grit-proof-repair --strict`
      passed.
    - `git diff --check` passed.
  - Old-mechanism parity probe, current failed state:
    - Capture wrapper executed `bun run habitat:check -- --json --tool
      wrapped-script`, `wrapped-eslint`, and `wrapped-test` on clean
      `agent-HR-habitat-grit-proof-repair` at `e2a6fd029`, with artifacts under
      `/tmp/habitat-grit-proof-repair-parity-e2a6fd029/`.
    - `wrapped-script` exited 0; schemaVersion 1; `ok:true`; 4 reports all
      `pass`; artifact
      `sha256=8dd858c5376769c63f659d71a0a03e2c8033fd2ea36add9c253366293616566d`.
    - `wrapped-eslint` exited 1; schemaVersion 1; `ok:false`;
      `rule-selection-integrity` failed on unknown tool id; artifact
      `sha256=860cc7788738f3b8e08e7247f41965a8b1d13c0adf504e8a050a3eb16ace8b3d`.
    - `wrapped-test` exited 1; schemaVersion 1; `ok:false`; 7 reports with 3
      failures; artifact
      `sha256=8b9915407ea08a2bdd75a3caa8da01a2eb095dfebf75cc8d07a3edb7a194e423`.
    - Batch summary artifact:
      `/tmp/habitat-grit-proof-repair-parity-e2a6fd029/summary.json`,
      `sha256=ec170888eff50373aba0489063548ce3a044ea92f434ccb6552e4d50b8c0282e`.
  - Old-mechanism parity repair probe, partial current state:
    - `nx show project mod-swooper-maps --json` and
      `nx show project @swooper/mapgen-core --json` captured the focused
      architecture targets and Habitat per-rule alias targets in
      `/tmp/habitat-wrapped-test-nx-target-contract.json`,
      `sha256=fa37cf050bd618c1512584ebabca9bad73ab5197eefe417c76e92f5fd44e6de5`.
    - `bun run habitat:check -- --json --tool wrapped-script` exited 0 with
      schemaVersion 1, `ok:true`, and 4 passing reports; artifact
      `/tmp/habitat-wrapped-script-nx-parity.json`,
      `sha256=f3cf6aee2cae8a33b6533ab9f910d4aafc000ae3f3c8ac55f847decab7253107`.
    - `bun run habitat:check -- --json --tool wrapped-eslint` exited 1 with
      schemaVersion 1, `ok:false`, and `rule-selection-integrity` for unknown
      tool id; artifact `/tmp/habitat-wrapped-eslint-nx-parity.json`,
      `sha256=7b4ad169d53eb3bd32be9f64e2c52b8772409ce962c7d2fc6d66b30b4afd6472`.
    - `bun run habitat:check -- --json --tool wrapped-test` exited 1 with
      schemaVersion 1, `ok:false`; 5 dependency-fresh Nx-owned wrapped-test
      reports and `baseline-integrity` passed, while
      `arch-test-map-bundle-runtime-imports` failed on missing generated
      `studio-current.js`; artifact `/tmp/habitat-wrapped-test-nx-narrow.json`,
      `sha256=fd78e97fd8da5fdda5474d8203190b1aeb0c8180a0916a80c49e754429b90ceb`.
    - `git status --short --branch` after the narrowed repair probe showed
      only intentional implementation/packet edits; `git ls-files --deleted |
      wc -l` showed `0`.
- Evidence boundary: current implementation slice proves native Grit sample
  success and Habitat wrapper selector/current-tree zero-finding projection
  through CheckReport schemaVersion 1 on the branch that contains the accepted
  command-trust and Effect adapter layers. It also proves explicit empty Grit
  baseline files exist for the 22 current Grit checks, `baseline-integrity`
  accepts them, and unit shrink-only policy rejects added entries for existing
  rules. It records the current failed old-mechanism parity state and a partial
  Nx dependency-freshness repair for wrapped-test. It does not prove raw direct
  Grit current-tree acquisition, injected violations, live baseline writes,
  apply safety, semantic target exports, generated-output freshness,
  parity retirement, broader downstream realignment, or product/runtime Civ7
  behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Known stale records to patch during implementation:
  - `openspec/changes/habitat-grit-catalog/tasks.md` patched for baseline
    historical/current split; other H5 proof realignment remains open.
  - `openspec/changes/habitat-grit-catalog/workstream/phase-record.md` patched
    for baseline historical/current split; other H5 proof realignment remains
    open.
  - `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md`
    patched for baseline historical/current split; other H6 retirement proof
    realignment remains open.
  - `docs/projects/habitat-harness/workstream-record.md`
  - `docs/projects/habitat-harness/recovery-claim-ledger.md`
  - `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`
  - `docs/projects/habitat-harness/review-disposition-ledger.md`
  - `docs/projects/habitat-harness/discrepancy-log.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `tools/habitat-harness/README.md` if user-facing proof or generator
    guidance changes

## Next Action

- After the explicit baseline slice is committed via Graphite, continue with
  the injected-violation harness using the accepted adapter contract.
- For apply proof, consume the isolated transaction-copy diff evidence as
  command/apply safety proof only; keep target-export and symbol/import
  semantic proof in this Grit proof packet.
