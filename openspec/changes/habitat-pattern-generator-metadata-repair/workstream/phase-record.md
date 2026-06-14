# Phase Record

## Phase

- Project: Habitat Harness
- Phase: pattern generator metadata repair /
  `habitat-pattern-generator-metadata-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet drafted; P1/P2 review findings dispositioned; validation
  required before implementation-ready acceptance

## Objective

- Target movement: generated Grit-backed rules require accepted authority,
  proof, scan-root, false-positive, baseline, and hook-scope metadata before
  entering enforcement.
- Exterior: new Grit pattern semantics, current 22-rule proof backfill, Grit
  adapter implementation, baseline engine repair, classify target repair,
  hooks implementation, product/runtime behavior.
- Done condition: reviewed OpenSpec packet, accepted manifest/state-machine
  contract, implementation-ready task list, downstream realignment, validation,
  Graphite commit, clean worktree.

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

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Pattern generator requires only `ruleId`.
- Pattern generator writes pattern file, empty baseline, and `rules.json` entry
  together.
- Generated rule defaults to enforced lane and pre-commit hook scope.
- Current rule metadata lacks structured authority/proof fields.
- README describes pattern generation without the accepted metadata gate.

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
- Blocking findings: P1/P2 findings accepted and patched into design, spec,
  tasks, source synthesis, and review ledger.

## Agent Fleet State

- Completed agents:
  - generator/source evidence sidecar.
  - official docs research sidecar.
  - adversarial workstream selection reviewer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, and 2.5.
- Remaining tasks: review, validation, implementation, verification,
  downstream realignment, closure.
- Implementation status: not started.

## Verification

- Commands run for design evidence:
  - `git status --short --branch`
  - `gt log short`
  - `bun run nx g @internal/habitat-harness:pattern grit-dra-metadata-probe --dry-run`
  - `bun run openspec -- validate habitat-pattern-generator-metadata-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth-language guardrail scan over this packet
  - source inspections recorded in `workstream/source-synthesis.md`
  - official Effect docs refresh through `effect.website/docs` for Command,
    Scope, Data/TaggedError, Runtime, Layers, Platform, and FileSystem
- Evidence boundary: current phase has design evidence and code/document
  diagnosis. It does not prove the generator metadata repair.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Run guardrail scans and commit the packet through Graphite.
