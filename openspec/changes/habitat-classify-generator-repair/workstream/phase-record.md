# Phase Record

## Phase

- Project: Habitat Harness
- Phase: classify/generator repair / `habitat-classify-generator-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: `codex/habitat-dra-takeover-frame`
- Started: 2026-06-14
- Status: design packet opened; adversarial review accepted P2
  command-surface dependency finding; repair patched; validation passed; ready
  for Graphite commit

## Objective

- Target movement: make classify/generate trustworthy as the agent front door:
  project ownership, rule scope, target commands, supported generator roots, and
  migration claims align with current resolved evidence.
- Exterior: pattern metadata implementation, Grit proof, baseline semantics,
  hook side effects, Biome behavior, taxonomy policy, domain-specific
  generators, product/runtime behavior.
- Done condition: reviewed OpenSpec packet, accepted classify target/generator
  contract, implementation-ready task list, downstream realignment,
  validation, Graphite commit, clean worktree.

## Authority

- Root router and workflow: `AGENTS.md`, Graphite workflow.
- Product frame: `docs/projects/habitat-harness/dra-takeover-frame.md`.
- Stage 0 ledger:
  `docs/projects/habitat-harness/recovery-claim-ledger.md`.
- H8 historical generator/classify source:
  `openspec/changes/habitat-generators-migrations/**`.
- Pattern generator dependency:
  `openspec/changes/habitat-pattern-generator-metadata-repair/**`.
- Official-doc evidence:
  `docs/projects/habitat-harness/research/official-docs-nx.md`.
- Effect adoption evidence:
  `docs/projects/habitat-harness/research/official-docs-effect.md` and
  `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.

## Current State

- Repo state at phase open: clean worktree on
  `codex/habitat-dra-takeover-frame`.
- `classify` reports static project-local `check` and `test` target commands.
- `@civ7/adapter:test` is emitted by classify and rejected by Nx.
- Four workspace projects currently lack package `test` scripts, making static
  `:test` target emission a class defect.
- `rulesInScope` is owner-level and over-includes broad Habitat-owned rules.
- Project generator refuses unsupported `mod` kind.
- Project generator accepts mismatched `--kind=app --directory=packages/...` in
  dry-run.
- Local Nx is available in this worktree as v22.7.5, and `nx show` probes
  resolve projects/targets; an earlier sidecar no-workspace claim is invalid
  for this packet.
- README and root AGENTS still contain H8-era generator guidance that must be
  realigned with resolved target and pattern metadata contracts.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- current classify ownership and target output are useful but not yet
  resolved-graph-backed;
- official Nx docs support target proof through resolved project/target
  metadata;
- generator support must include kind/root/target proof, not enum membership
  alone;
- pattern-generator metadata remains a separate workstream;
- Effect is a substrate decision if implementation turns target proof into
  command orchestration, provenance capture, service substitution, scoped
  resource work, retry/concurrency policy, or manually recreated tagged failure
  channels.

## Scope

- Expected write set: see `design.md` Write Set.
- Protected paths: pattern generator internals, Grit patterns, baseline engine,
  hook implementation, Biome config, taxonomy policy, product/runtime source,
  generated outputs.
- Owner: `@internal/habitat-harness` classify command, project generator, and
  migration guidance.
- Forbidden owners: Grit semantics, pattern authority metadata, baseline
  contract, hook policy, Biome semantics, domain-specific generator invention.

## Review

- Required lanes:
  - Product/outcome reviewer.
  - Nx graph/target reviewer.
  - Generator reviewer.
  - Evidence/system reviewer.
  - Effect/substrate reviewer.
- Review artifacts:
  - `workstream/review-disposition-ledger.md`
- Blocking findings: accepted P2 command-surface dependency finding patched in
  `workstream/review-disposition-ledger.md`.

## Agent Fleet State

- Active agents: none.
- Completed agents:
  - classify/generator source evidence sidecar.
  - official Nx docs and target-proof sidecar, with local no-workspace claim
    invalidated by current-worktree probes.
  - adversarial design reviewer for product/Nx/generator/evidence/Effect
    lanes.
- DRA owner retains synthesis, proof claims, review disposition, repo state, and
  final acceptance.

## Implementation

- Completed tasks: 1.1-1.4, 2.1-2.5, 2.8, 9.1-9.3, and 9.11.
- Remaining tasks: review, validation, implementation, verification,
  downstream realignment, closure.
- Implementation status: not started.

## Verification

- Commands run for design evidence:
  - `git status --short --branch`
  - `gt status`
  - `bun run openspec -- list`
  - `bun run habitat classify packages/civ7-adapter/src/index.ts`
  - `bun run habitat classify mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
  - `bun run habitat classify package.json`
  - `nx show project @civ7/adapter --json`
  - `nx show target @civ7/adapter:check`
  - `nx show target @civ7/adapter:test`
  - `nx show target mod-swooper-maps:test`
  - `nx show projects --with-target test --json`
  - `nx show target @internal/habitat-harness:biome:ci`
  - `nx --version`
  - `nx g @internal/habitat-harness:project unsupported-mod-probe --kind=mod --dry-run`
  - `nx g @internal/habitat-harness:project misplaced-probe --kind=app --directory=packages/misplaced-app-probe --dry-run`
  - package inventory for projects without `test` scripts
  - official Nx docs refresh for `nx show`, inferred tasks, and generator dry-run
  - `bun run habitat -- --help`
  - `openspec/changes/habitat-oclif-entrypoint-repair/workstream/phase-record.md`
  - adversarial design review over product/Nx/generator/evidence/Effect lanes
  - `bun run openspec -- validate habitat-classify-generator-repair --strict`
  - `bun run openspec:validate`
  - `git diff --check`
  - full-depth-language guardrail scan over this packet
- Evidence boundary: current phase has design evidence and code/document
  diagnosis. It does not prove the classify/generator repair.
  It also does not prove canonical command-surface repair; this packet must
  consume implemented `habitat-oclif-entrypoint-repair` proof before claiming
  canonical `habitat classify` product proof.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Commit this design packet through Graphite.
