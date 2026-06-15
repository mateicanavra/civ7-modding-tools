# Phase Record

## Phase

- Project: Habitat Harness
- Phase: pattern generator metadata repair /
  `habitat-pattern-generator-metadata-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack:
  `agent-HR-habitat-pattern-authority-manifest-validator` over
  `agent-HR-habitat-pattern-generator-metadata-repair` over
  `agent-HR-habitat-scaffold-contract-repair` over
  `agent-HR-habitat-grit-proof-repair` over
  `agent-HR-habitat-effect-grit-adapter` over
  `agent-HR-habitat-repair-chain` over `main`
- Started: 2026-06-14
- Status: Pattern Authority Manifest schema/validator checkpoint in
  implementation; registered manifest promotion remains open

## Objective

- Target movement: generated Grit-backed rules require accepted authority,
  proof, scan-root, false-positive, baseline, and hook-scope metadata before
  entering enforcement.
- Exterior: new Grit pattern semantics, current 22-rule proof backfill, Grit
  adapter implementation, baseline engine repair, classify target repair,
  hooks implementation, product/runtime behavior.
- Checkpoint condition: sparse pattern generation produces candidate-only
  artifacts, registered advisory/enforced generation fails closed before
  writes, stale guidance is realigned, validation passes, Graphite commit is
  complete, and the worktree is clean.
- Current checkpoint condition: Pattern Authority Manifest model and validator
  classify candidate drafts as non-authoritative, accept structured registered
  manifests only from Habitat-owned fields, and reject missing, malformed,
  placeholder, contradicted, orphan, Grit-only, and Nx-options-only authority
  states without writing registered artifacts.
- Full packet done condition remains open: accepted Pattern Authority Manifest
  validation, baseline-manifest consumption, native fixture/current-tree proof,
  hook-scope proof, and registered promotion orchestration.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Grit corpus ledger:
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- H8 historical generator source:
  `openspec/changes/habitat-generators-migrations/**`.
- Baseline dependency:
  `openspec/changes/habitat-scaffold-contract-repair/**`.
- Grit proof dependency:
  `openspec/changes/habitat-grit-proof-repair/**`.
- Official-doc evidence:
  `docs/projects/habitat-harness/research/official-docs-nx.md` and
  `docs/projects/habitat-harness/research/official-docs-gritql.md`.
- Effect adoption evidence:
  `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at implementation open: clean worktree on
  `agent-HR-habitat-pattern-generator-metadata-repair`, based on accepted
  `agent-HR-habitat-scaffold-contract-repair` head
  `deb9b3710 fix(habitat): make baseline contracts explicit`.
- Downstack baseline/command/Grit adapter repairs are current disk state, but
  this packet does not consume them as Pattern Authority Manifest proof.
- Pattern generator now defaults to `lifecycle: "candidate"` and writes only
  candidate draft artifacts under
  `tools/habitat-harness/src/rules/pattern-authority/candidates/`.
- Candidate generation does not write active `.grit` patterns, `rules.json`,
  baselines, or hook scope.
- `registered-advisory` and `registered-enforced` generation fail closed before
  writes until Pattern Authority Manifest validation, baseline-manifest
  consumption, current-tree proof, and registered-promotion Effect decision are
  accepted.
- README, root `AGENTS.md`, recovery claim ledger, Grit corpus ledger, and H8
  generator migration records now describe candidate-only generation and
  registered promotion as still blocked.
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` now defines
  the first Habitat-owned Pattern Authority Manifest model and pure validator
  boundary. It performs no command execution, no filesystem mutation, no
  baseline mutation, no hook decision, and no registered rule promotion.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- the current generator is real but under-governed;
- generated rule hardening is coupled to sparse input;
- official Nx docs support generator mechanics but not Grit semantics;
- official Grit docs support pattern metadata and samples but not Habitat
  authority;
- baseline and hook proof must remain separate owner contracts.
- registered promotion must run the Effect fit decision before growing command,
  no-write, scoped file, scratch-resource, rollback/diff, baseline-manifest, or
  hook-scope orchestration.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: existing Grit check/apply corpus, Grit adapter internals,
  baseline engine internals, hook implementation, Nx taxonomy, Biome config,
  generated outputs, product/runtime source.
- Owner: `@internal/habitat-harness` pattern generator metadata and rule
  authority manifest.
- Forbidden owners: Grit semantics, baseline policy, command shell, hook side
  effects, classify target proof, Nx/Biome ownership.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Evidence/system reviewer.
  - Generator/Nx reviewer.
  - Grit consumer reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Blocking findings: P1/P2 design findings remain patched. No new accepted
  supervisor findings are open for the candidate/refusal or manifest-validator
  checkpoints.

## Agent Fleet State

- Completed agents:
  - generator/source evidence sidecar.
  - official docs research sidecar.
  - adversarial workstream selection reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.
- Active agents for this implementation checkpoint: none. No sidecar output is
  consumed as implementation proof for the candidate/refusal or
  manifest-validator checkpoints.

## Implementation

- Completed tasks for this checkpoint: 1.1-1.4, 2.1-2.5, 4.1, 4.2, 4.5,
  4.8, 6.1, 6.4, 7.1, 7.2, 7.3, 8.1, 8.3, 8.4, 8.9, 8.11, and 8.12.
- Completed tasks for the manifest-validator checkpoint: 3.1, 3.3, 3.5, 3.6,
  6.3, 6.9, and 8.2.
- Remaining tasks: source-artifact storage for registered manifests,
  `rules.json` manifest references, registered advisory/enforced promotion,
  baseline-manifest consumption, native Grit fixture/current-tree proof,
  hook-scope proof, full guardrail scan, registered-promotion Effect decision
  proof, and full packet closure.
- Implementation status: bounded candidate/refusal checkpoint accepted by
  supervisor; bounded manifest-validator checkpoint implemented on
  `agent-HR-habitat-pattern-authority-manifest-validator`.

## Verification

- Commands run for design evidence:
  - `git status --short --branch`
  - `gt log short`
  - `nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth-language guardrail scan over this packet
  - source inspections recorded in `workstream/source-synthesis.md`
  - official Effect docs refresh through `effect.website/docs` for Command,
    Scope, Data/TaggedError, Runtime, Layers, Platform, and FileSystem
- Commands run for implementation checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-generator.test.ts`
    passed: candidate-only artifacts, registered advisory/enforced no-write
    refusal, and duplicate active rule refusal.
  - `bun run nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
    exited 0 and reported only candidate manifest/pattern artifacts under
    `tools/habitat-harness/src/rules/pattern-authority/candidates/`.
  - `bun run nx g @internal/habitat-harness:pattern grit-registered-probe --lifecycle=registered-enforced --dry-run`
    exited 1 before writes with the registered-promotion block.
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec -- validate habitat-generators-migrations --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
- Commands run for manifest-validator checkpoint:
  - `bun run --cwd tools/habitat-harness test -- pattern-authority-manifest.test.ts pattern-generator.test.ts`
    passed: accepted registered manifest with matching rule reference,
    candidate draft classification as non-authoritative, missing manifest,
    malformed manifest, placeholder manifest, contradicted manifest, orphan
    manifest, Grit-only authority refusal, Nx-options-only authority refusal,
    and existing candidate generator behavior.
  - `bun run --cwd tools/habitat-harness check`
  - `bun run --cwd tools/habitat-harness test` hit unrelated 5s Vitest
    default-timeout failures in real command/apply tests and is recorded as
    non-proof.
  - `bun run --cwd tools/habitat-harness test -- --testTimeout=30000` passed
    the full harness suite after the timeout-only non-proof run: 15 files /
    113 tests.
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - `git ls-files --deleted | wc -l`
  - Residue checks: `tools/habitat-harness/injected-probe-roots` absent and
    `mods/mod-swooper-maps/src/recipes/standard/stages/habitat-apply-copy-proof`
    absent before closure proof.
- Evidence boundary: this checkpoint proves candidate generator behavior,
  registered no-write refusal, record truth, and validation. It does not prove
  registered Pattern Authority Manifest acceptance, generated registered rule
  current-tree proof, native Grit row proof, baseline write/shrink behavior,
  hook-scope behavior, classify target proof, or product/runtime behavior.
- Manifest-validator evidence boundary: the new validator proves an in-memory
  typed schema/validation boundary and layer-separation checks only. It does
  not write registered manifests, add `rules.json` references, promote
  registered advisory/enforced rules, consume the baseline manifest, run native
  Grit samples, prove current-tree behavior, add hook scope, or implement
  Effect-backed promotion orchestration.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Finish verification for the manifest-validator checkpoint, commit through
  Graphite, and hold for supervisor review. Do not open another repair lane
  from this packet until the checkpoint is reviewed or sequenced.
