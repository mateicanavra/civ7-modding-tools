# Phase Record

## Phase

- Project: Habitat Harness
- Phase: scaffold/baseline contract repair /
  `habitat-scaffold-contract-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `agent-HR-habitat-scaffold-contract-repair`
  stacked above `agent-HR-habitat-grit-proof-repair` at
  `7681f7c16 fix(habitat): prove live Grit apply boundary`
- Started: 2026-06-14
- Status: implementation verification complete on
  `agent-HR-habitat-scaffold-contract-repair`; Graphite checkpoint complete

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

- Repo state at implementation start: clean worktree on
  `agent-HR-habitat-scaffold-contract-repair`.
- Seed code treated a missing baseline file as an empty locked baseline and
  reported `locked` from loaded key count plus `exceptionPath`.
- Current implementation replaces that behavior with typed baseline states:
  `explicit-empty`, `explicit-debt`, `external-exception-source`, and
  `contract-failure`.
- The accepted downstack Grit proof baseline slice already committed 22 empty
  Grit baseline files. Those files are current disk evidence and useful
  explicit-file corpus; they were not proof that the broader baseline contract
  was closed before this packet.
- This branch now materializes committed empty baseline files for all current
  registered non-external rules. Current inventory: 41 registered rules, 39
  explicit baseline files, and 2 modeled external exception sources.
- Current modeled external exception sources:
  - `adapter-boundary`:
    `scripts/lint/lint-adapter-boundary.sh#ALLOWLIST`;
  - `doc-ambiguity`: `docs/.doc-ambiguity-lint-baseline.json`.
- `adapter-boundary.json` is intentionally removed instead of grown because
  growing that existing-rule Habitat baseline would violate shrink-only; its
  parser/allowlist debt is now checked by external-source projection equality.
- Current baseline key behavior remains `path::message`; older richer
  key-format claims are stale unless separately migrated.
- `--expand-baseline` consumes the accepted selector boundary before write,
  refuses missing/malformed contract state, refuses existing-rule growth before
  write, and has no public manifest source for introduced-rule seeded writes.
  Lower-level fake-input tests prove the manifest gate: introduced-rule seeded
  writes require a matching accepted manifest.

## Substrate Decision

- Decision date: 2026-06-15.
- Decision: repair this packet with a plain TypeScript typed state module and
  explicit dependency seams, not a new Effect baseline subsystem.
- Evidence: current repair work is local synchronous baseline parsing,
  registry/file validation, comparison-source classification, and CheckReport
  diagnostic projection. It does not need scoped resources, long-lived
  runtimes, process lifecycle management, retries, concurrency, or cleanup
  finalizers beyond the already accepted Grit adapter substrate.
- Official Effect docs remain relevant as guardrails: typed errors,
  services/layers, runtime-edge discipline, and scoped resources are valuable
  when the problem has those failure modes. This slice can express the required
  typed contract states, injected test inputs, and command/report compatibility
  directly without wrapping existing sync code in Effect.
- Reopen trigger: stop and re-evaluate Effect before commit if baseline repair
  expands into shared command-runner provenance, temporary resources,
  asynchronous process orchestration, or scattered thrown/string failure
  plumbing that the local typed boundary cannot keep explicit.

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
- Blocking findings:
  - Design P1/P2 findings are patched into the implementation contract.
  - `SUP-SCAFFOLD-P2-RESIDUE-2026-06-15` is repaired in draft: source-tree
    `habitat-apply-copy-proof` residue was identified as apply-test probe
    residue, cleanup hooks were added around the responsible focused test, and
    the path was absent after rerun.
  - `SUP-SCAFFOLD-P1-ES01-2026-06-15` is repaired in draft: `ES-01` now has an
    engine-level fake Git test proving that trunk/base can make a downstack rule
    look new, while supplying the trusted stack parent through the existing
    `--base`/baseline `base` comparison input refuses the same child-added key
    as existing-rule growth. Automatic Graphite parent discovery remains a
    non-claim for this packet.

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

- Completed tasks:
  - 1.1-1.4 design/review gate;
  - 2.1-2.4 source refresh/current evidence;
  - 3.1-3.8 typed baseline state and substrate decision;
  - 4.1-4.6 explicit current rule state;
  - 5.1-5.8 mutation/integrity contract;
  - 6.1-6.8 unit/integration tests;
  - 7.1-7.7 downstream realignment;
  - 8.1-8.17 verification gates.
- Remaining tasks: supervisor review.
- Implementation status: code, records, verification, downstream realignment,
  and Graphite checkpoint complete.

## Verification

- Commands run for seed/design evidence:
  - `git status --short --branch`
  - `gt status`
  - `bun run habitat:check -- --json --rule adapter-boundary`
  - `bun run habitat:check -- --json --rule adapter-boundary --base HEAD`
  - `bun run habitat:check -- --json --rule workspace-entrypoints`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run openspec -- validate habitat-scaffold-contract-repair --strict`
  - `git diff --check`
  - scoped full-depth language and shortcut-language guardrail scans
- Commands run for implementation evidence:
  - `bun run --cwd tools/habitat-harness test -- baseline.test.ts` -> pass,
    13 tests, including explicit trusted comparison-base proof for `ES-01`.
  - `bun run --cwd tools/habitat-harness check` -> pass.
  - `bun run habitat:check -- --json --rule workspace-entrypoints` -> exit 0,
    CheckReport schemaVersion 1, `workspace-entrypoints` pass/locked with an
    explicit committed `workspace-entrypoints.json` baseline file, and
    `baseline-integrity` pass.
  - `bun run habitat:check -- --json --rule adapter-boundary` -> exit 0,
    CheckReport schemaVersion 1, `adapter-boundary` pass with external
    allowlist-projected baselined diagnostics and `baseline-integrity` pass.
  - `bun run habitat:check -- --json --rule doc-ambiguity` -> exit 0,
    CheckReport schemaVersion 1, modeled external source accepted and
    `baseline-integrity` pass.
  - `bun run --cwd tools/habitat-harness test -- habitat-commands.test.ts` ->
    pass, 8 tests.
  - `bun run --cwd tools/habitat-harness test -- habitat-entrypoints.test.ts`
    -> pass, 8 tests, including reversible missing/malformed/orphan baseline
    probes and invalid-selector no-write snapshots.
  - `bun run habitat:check -- --expand-baseline --rule
    arch-test-map-bundle-runtime-imports --base HEAD` -> exit 1, refused
    existing-rule growth before write; `arch-test-map-bundle-runtime-imports`
    baseline remained `[]`.
  - `bun run --cwd tools/habitat-harness test -- grit-apply.test.ts` -> pass,
    20 tests, after cleanup hooks were added.
  - `find mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof
    -maxdepth 8 -print` -> no such file after focused apply test rerun.
  - `bun run --cwd tools/habitat-harness test` -> pass, 13 files / 100 tests.
  - `bun run openspec -- validate habitat-scaffold-contract-repair --strict`
    -> pass.
  - `bun run openspec -- validate habitat-grit-proof-repair --strict` -> pass
    for touched downstream record language.
  - `bun run openspec -- validate habitat-harness-scaffold --strict` -> pass
    for touched historical H2 record language.
  - `bun run openspec -- validate habitat-generators-migrations --strict` ->
    pass for touched historical H8 record language.
  - `bun run openspec:validate` -> pass, 181 items.
  - `git diff --check` -> pass.
  - Baseline corpus script over
    `tools/habitat-harness/baselines/*.json` -> 39 files, all explicit
    baseline files contain `[]`.
  - `ES-01` repaired proof boundary: lower-level baseline API and the public
    `--base` option are the explicit trusted comparison-base mechanism. A
    Graphite child that needs downstack protection must supply the trusted
    stack parent as the base; this packet does not discover Graphite parents
    automatically.
  - Full-depth language guardrail scan over Habitat initiative docs and touched
    OpenSpec records -> remaining hits are seed/historical records, intentional
    spec language, or current rows explicitly pointing proof to this packet.
- Deleted-tracked-file guard:
  - `git ls-files --deleted` reports only
    `tools/habitat-harness/baselines/adapter-boundary.json`.
  - This deletion is intentional: `adapter-boundary` now consumes a modeled
    external exception source instead of growing an existing-rule Habitat
    baseline file.
- Residue proof:
  - `tools/habitat-harness/injected-probe-roots` absent after final harness
    tests.
  - `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof`
    absent after final harness tests.
- Evidence boundary:
  - Unit behavior: typed state, malformed/orphan/missing failures, external
    projection equality, parser-owned baseline rejection, comparison-source
    failures, and manifest-gated introduced-rule seeded writes.
  - Habitat wrapper behavior: selected current `workspace-entrypoints`,
    `adapter-boundary`, and `doc-ambiguity` checks plus refused existing-rule
    baseline expansion.
  - Baseline proof: explicit empty file inventory for current non-external
    rules, modeled external sources for the two current exception paths, and
    shrink-only existing-rule write refusal.
  - Record truth: stale H2/H8/workstream/Grit consumer rows realigned to the
    current contract.
- Non-claims:
  - no Grit row semantic closure, injected proof, raw direct Grit acquisition,
    pattern generator authority metadata repair, generated-output freshness,
    hook proof, automatic Graphite stack-parent discovery, or product/runtime
    proof;
  - no public command path currently accepts introduced-rule seeded baseline
    writes because no accepted manifest source is wired to `--expand-baseline`;
    the lower-level contract is tested for future generator/metadata owners.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold for supervisor review before opening the next repair-chain packet.
