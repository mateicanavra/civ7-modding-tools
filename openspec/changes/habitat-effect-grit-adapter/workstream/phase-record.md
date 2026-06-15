# Phase Record

## Phase

- Project: Habitat Harness
- Phase: Effect Grit adapter substrate / `habitat-effect-grit-adapter`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet reviewed; accepted findings repaired; implementation not started

## Objective

- Target movement: provide the typed Grit command/parse/projection/probe/apply
  substrate required for truthful Grit proof repair and future pattern
  workstreams.
- Exterior: no new Grit pattern semantics, no oclif shell replacement, no
  product/runtime Civ7 proof, no Nx/Biome ownership transfer, no hook behavior
  changes.
- Done condition: reviewed OpenSpec packet, accepted design selection,
  implementation of typed adapter services, parser/projection tests, injected
  harness API, apply transaction substrate, downstream realignment, validation,
  Graphite commit, clean worktree. Live dependency adoption remains unclaimed
  until dependency/platform parity passes.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Claim ledger: `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- Grit corpus ledger:
  `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- Effect evaluation:
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`.
- Official source packs:
  - `docs/projects/habitat-harness/research/official-docs-effect.md`
  - `docs/projects/habitat-harness/research/official-docs-gritql.md`
  - `docs/projects/habitat-harness/research/official-docs-biome.md`
  - `docs/projects/habitat-harness/research/official-docs-nx.md`
- Local evidence:
  - `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
  - `openspec/changes/habitat-grit-proof-repair/workstream/reviews/effect-substrate-review.md`

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- Current Habitat Grit adapter is synchronous, process-string based, and lacks
  typed command provenance.
- Current `grit.ts` caches one shared report and parses JSON by whole-output or
  brace-substring heuristic.
- Current apply path uses `--force` against live roots and has no transaction
  proof.
- `habitat-grit-proof-repair` accepted P1/P2 findings that block injected
  harness, adapter seams, raw acquisition, parser tests, and apply proof until
  this substrate or an equivalent typed adapter is accepted.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- Effect is provisionally selected in this design because it directly supplies
  typed errors, layers, command execution, scopes/finalizers, and test
  substitution for the exact Grit adapter failure modes.
- Grit remains the source of structural pattern matching and rewrite behavior;
  Habitat owns stable proof records and local baseline/apply policy.
- Biome and Nx remain separate owner layers; the adapter records their command
  results and cache/provenance boundaries when they participate in proof.

## Scope

- Expected write set: see `design.md` Write Set and `proposal.md` Affected
  Owners.
- Protected paths: generated outputs, product/runtime source outside controlled
  probes, Nx/Biome/taxonomy config, hook behavior, and new pattern semantics.
- Owner: `@internal/habitat-harness` Grit adapter substrate.
- Forbidden owners: new architecture rules, product runtime behavior, generated
  artifacts, and command-shell replacement.

## Substrate Decision

Decision: provisionally select Effect for the Grit adapter substrate, with a
Grit-scoped command-result contract included in this packet. Live dependency
adoption and live path switching remain blocked until review and
dependency/platform parity pass.

Why this shape:

- current `SpawnResult` cannot provide the command proof fields the Grit repair
  requires;
- current parser/projection behavior is too weak for proof expansion;
- injected probes and apply transactions require scoped cleanup/finalizers and
  fakeable services;
- a broad shared command-runner migration would enlarge the phase before the
  Grit adapter proves the contract.

Extraction trigger:

- open `habitat-effect-command-runner` if Biome, Nx, hook, baseline, or
  command-surface work proves it needs the same command-result contract outside
  the Grit adapter.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Effect/substrate reviewer.
  - Grit adapter reviewer.
  - Evidence/system reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
  - `workstream/reviews/` after reviewer wave
- Blocking findings: none after review disposition; accepted P2/P3 findings are
  repaired in the design packet and tracked in the review ledger.

## Agent Fleet State

- Active agents: none.
- Completed research agents:
  - official Effect docs evidence;
  - official GritQL docs/source evidence;
  - official Biome docs evidence;
  - official Nx docs evidence;
  - local Habitat substrate explorer.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1 design packet draft, 1.2 review lanes, 1.3 disposition,
  and 1.4 design validation.
- Remaining tasks: dependency/platform parity, runtime boundary, adapter
  services, parser/projection, injected harness, apply transaction,
  verification, realignment, closure.
- Implementation status: not started.

## Verification

- Commands run for this phase so far:
  - `git status --short --branch`
  - `gt status`
  - `bun run openspec -- list`
  - source and skill refresh commands listed in active session logs
  - official docs browsing for Effect, GritQL, Biome, and Nx
  - `bun run openspec -- validate habitat-effect-grit-adapter --strict`
  - `bun run openspec -- validate habitat-grit-proof-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth language scan over Habitat initiative docs
- Evidence boundary: current phase has design evidence and source synthesis. It
  does not prove dependency/platform parity or adapter behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.
- Existing Grit proof records patched in this checkpoint:
  - `openspec/changes/habitat-grit-proof-repair/workstream/review-disposition-ledger.md`
  - `openspec/changes/habitat-grit-proof-repair/workstream/phase-record.md`
  - `docs/projects/habitat-harness/effect-orchestration-evaluation.md`

## Next Action

- Commit this reviewed design checkpoint through Graphite with a clean worktree.
- Next implementation action: refresh source/dependency evidence, inspect
  repo-local Effect precedent, and prove dependency/platform parity before any
  live adapter path switch.
