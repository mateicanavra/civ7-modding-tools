# Phase Record

## Phase

- Project: Habitat Harness
- Phase: classify/generator repair / `habitat-classify-generator-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: HR classify/generator repair layer above the accepted
  Pattern Authority Effect decision layer and below the HG pattern stack.
- Started: 2026-06-14
- Status: classify target-truth checkpoint committed; path-aware rule-scope
  checkpoint implemented and locally verified, with the rule-scope precision
  repair pending supervisor review; generator support, migration proof
  boundaries, downstream realignment, and packet closure remain open.

## Objective

- Target movement: make classify/generate trustworthy as the agent front door:
  project ownership, rule scope, target commands, supported generator roots, and
  migration claims align with current resolved evidence.
- Exterior: pattern metadata implementation, Grit proof, baseline semantics,
  hook side effects, Biome behavior, taxonomy policy, domain-specific
  generators, product/runtime behavior.
- Done condition: resolved target truth, path-aware rule scope, generator
  support/refusal, migration proof boundaries, downstream realignment,
  validation, Graphite commit, clean worktree, and supervisor acceptance for
  the packet's claimed proof classes.

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

- Repo state at implementation resume: clean HR worktree on the inserted
  classify/generator repair layer.
- `classify` now consumes resolved Nx project graph metadata for project owner,
  tags, and targets.
- `@civ7/adapter:test` is no longer emitted by classify; it is represented as
  an unavailable project target because Nx metadata does not resolve it.
- Four workspace projects currently lack package `test` scripts, making static
  `:test` target emission a class defect repaired for classify target
  reporting.
- `rulesInScope` is now the compatibility list of structured `scopedRules`;
  scopes distinguish exact-path, project-owner, workspace-gate, and
  unresolved-metadata reasons.
- Exact-path extraction now fails closed for rule scope prose with unmodeled
  exclusions or compound qualifiers instead of scraping a partial glob and
  presenting it as machine-readable path truth.
- Project generator refuses unsupported `mod` kind.
- Project generator accepts mismatched `--kind=app --directory=packages/...` in
  dry-run.
- Local Nx is available in this worktree as v22.7.5, and `nx show` probes
  resolve projects/targets. Official Nx docs support resolved project/target
  metadata and inferred targets as the target-truth source; Habitat uses
  `@nx/devkit` project graph metadata for implementation and `nx show`
  commands as native proof.
- README and root AGENTS still contain H8-era generator guidance that must be
  realigned with resolved target and pattern metadata contracts.

## Source Synthesis

See `workstream/source-synthesis.md`.

Core synthesis:

- current classify ownership, target output, and rule-scope output are now
  structured and evidence-labeled for project owner, tags, existing targets,
  unavailable targets, exact path rules, broad workspace gates, and unresolved
  metadata;
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
- Blocking findings: accepted P2 command-surface dependency finding patched;
  accepted P2 rule-scope precision finding repaired locally and pending
  supervisor review in `workstream/review-disposition-ledger.md`.

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

- Completed tasks: 1.1-1.4, 2.1-2.6, 2.8, 3.1-3.6, 4.1-4.5,
  7.2-7.5, 9.1-9.3, 9.11, and 9.13.
- Remaining tasks: generator support/refusal, migration proof-boundary repair,
  full classify matrix, full Nx target matrix, downstream realignment, final
  verification, and supervisor acceptance.
- Implementation status: target-truth slice committed as a bounded checkpoint;
  path-aware rule-scope slice implemented and in verification. Full packet
  closure remains open.

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
  - official Nx docs refresh for project configuration, inferred tasks,
    `@nx/devkit`, and `createProjectGraphAsync`
  - official Bun docs refresh for workspace script/package-manager role
  - `bun run --cwd tools/habitat-harness test -- classify.test.ts`
  - `bun run --cwd tools/habitat-harness test -- habitat-commands.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run habitat classify packages/civ7-adapter/src/index.ts`
  - `bun run nx show project @civ7/adapter --json`
  - `bun run nx show target @civ7/adapter:test`
  - `bun run --cwd tools/habitat-harness test -- classify.test.ts`
  - `bun run --cwd tools/habitat-harness test -- habitat-commands.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run habitat classify apps/mapgen-studio/src/main.tsx`
  - `bun run habitat classify packages/civ7-adapter/src/index.ts`
  - `bun run habitat classify mods/mod-swooper-maps/src/domain/ecology/ops/features-plan-floodplains/index.ts`
- Evidence boundary: current implementation proves resolved Nx target truth for
  the adapter missing-target case, structured target proof output, unavailable
  target reporting, workspace-only target handling, literal diff target
  preservation, async oclif classify output, exact path rule-scope labeling,
  project-owner labeling, workspace-gate labeling, unresolved metadata labeling
  for Grit rows without parseable scan roots, conservative refusal to treat
  prose exclusions such as `outside packages/civ7-adapter` as exact scan-root
  truth, preservation of pure-glob exact matches, and exclusion of unrelated
  internal exact-path rules. It does not prove full generator support/refusal,
  migration capability, current-tree Grit row proof, baseline behavior, hook
  behavior, or product/runtime behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold the bounded rule-scope checkpoint for supervisor review while the HG
  commit-ordering guardrail remains active; after the commit window opens,
  Graphite-commit this checkpoint before proceeding to generator
  support/refusal unless supervisor review blocks this classify slice.
