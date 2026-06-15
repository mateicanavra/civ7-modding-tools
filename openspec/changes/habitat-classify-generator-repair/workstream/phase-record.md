# Phase Record

## Phase

- Project: Habitat Harness
- Phase: classify/generator repair / `habitat-classify-generator-repair`
- Owner: DRA Habitat recovery owner
- Branch/Graphite stack: HR classify/generator repair layers above the accepted
  Pattern Authority Effect decision layer. HG descendants may be moved by
  supervisor coordination only.
- Started: 2026-06-14
- Status: classify target-truth, path-aware rule-scope, and generator
  support/refusal checkpoints accepted; generator scratch Nx discovery and
  generated target-matrix proof accepted; migration proof-boundary checkpoint
  supervisor-accepted; committed scratch discovery test coverage
  supervisor-accepted; classify matrix test coverage implemented in the
  current slice; downstream realignment and packet closure remain open.

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
- Classify matrix coverage now spans adapter, mod, foundation, app, tooling,
  plugin, generated-zone, and workspace-level paths. Missing paths are
  classified by path ownership without pretending to prove filesystem
  existence, and multi-path diffs are classified per changed path in stable
  path order.
- Exact-path extraction now fails closed for rule scope prose with unmodeled
  exclusions or compound qualifiers instead of scraping a partial glob and
  presenting it as machine-readable path truth.
- Project generator refuses unsupported `mod` kind.
- Project generator now accepts only the canonical uniform project contracts:
  `plugin` under `packages/plugins/plugin-<name>` with `@civ7/plugin-<name>`,
  `foundation` under `packages/<name>` with `@civ7/<name>`, and `app` under
  `apps/<name>` with package name `<name>`.
- Project generator refuses unsupported non-uniform kinds, mismatched
  kind/root pairs, mismatched package names, non-empty roots, and workspace
  package-name collisions before writes.
- Generated scratch projects for all three supported uniform kinds are
  discoverable by Nx from the normal HR implementation worktree and expose the
  accepted `build`, `check`, and `test` targets. The scratch project roots were
  removed with targeted cleanup after proof and are not committed fixtures.
- Committed generator scratch discovery coverage now creates supported scratch
  projects through the repo-local Nx generator, proves Nx discovers each
  generated project with the accepted `build`, `check`, and `test` targets, and
  removes only the exact scratch roots.
- Current migration metadata declares a no-op baseline migration. It proves
  migration wiring only: the registered implementation returns no file changes,
  and `nx migrate --run-migrations=<run-file>.json --skip-install` executes
  the no-op with no workspace changes. Convention migrations still require a
  named source shape, target shape, file operation plan, and idempotence proof.
- Local Nx is available in this worktree as v22.7.5, and `nx show` probes
  resolve projects/targets. Official Nx docs support resolved project/target
  metadata and inferred targets as the target-truth source; Habitat uses
  `@nx/devkit` project graph metadata for implementation and `nx show`
  commands as native proof.
- Native Nx target-existence proof now covers representative emitted and
  refused targets across adapter, foundation, app, tooling, plugin,
  generated-zone, and mod rows. Emitted project targets resolve through
  `bun run nx show target`; unavailable targets such as `@civ7/adapter:test`
  and `@civ7/types:test` are reported by classify as missing and rejected by
  Nx.
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
- generator support now has a kind/root/package/tag refusal contract for
  uniform kinds, and normal-worktree scratch proof shows generated supported
  projects are discovered by Nx with the accepted target matrix;
- current migration proof is explicitly wiring-only, with convention migration
  capability remaining a separate future proof class;
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
  accepted P2 rule-scope precision finding supervisor-accepted in
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

- Completed tasks: 1.1-1.4, 2.1-2.6, 2.8, 3.1-3.6, 4.1-4.5, 5.1-5.7,
  6.1-6.3, 7.1-7.10, 9.1-9.9, 9.11, and 9.13.
- Remaining tasks: stale guidance scan, downstream realignment, final
  verification, and supervisor acceptance.
- Implementation status: target-truth slice committed as a bounded checkpoint;
  path-aware rule-scope slice committed and supervisor-accepted; generator
  support/refusal slice committed and supervisor-accepted; generator scratch
  discovery/target-matrix command proof recorded as the current local
  checkpoint and supervisor-accepted; migration proof-boundary slice
  committed and supervisor-accepted; committed generator scratch discovery test
  coverage committed and supervisor-accepted; classify matrix test coverage
  committed and supervisor-accepted; Nx target-existence proof matrix
  implemented in the current slice. Full packet closure remains open.

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
- Commands run for generator contract implementation evidence:
  - `bun run --cwd tools/habitat-harness test -- project-generator.test.ts`
  - `bun run --cwd tools/habitat-harness check`
  - `bun run nx g @internal/habitat-harness:project generator-plugin-probe --kind=plugin --dry-run`
  - `bun run nx g @internal/habitat-harness:project generator-foundation-probe --kind=foundation --dry-run`
  - `bun run nx g @internal/habitat-harness:project generator-app-probe --kind=app --dry-run`
  - `bun run nx g @internal/habitat-harness:project unsupported-mod-probe --kind=mod --dry-run`
  - `bun run nx g @internal/habitat-harness:project misplaced-probe --kind=app --directory=packages/misplaced-app-probe --dry-run`
  - `bun run nx g @internal/habitat-harness:project adapter --kind=foundation --dry-run`
  - `bun run nx g @internal/habitat-harness:project hr-proof-plugin --kind=plugin`
  - `bun run nx g @internal/habitat-harness:project hr-proof-foundation --kind=foundation`
  - `bun run nx g @internal/habitat-harness:project hr-proof-app --kind=app`
  - `bun run nx show project @civ7/plugin-hr-proof-plugin --json`
  - `bun run nx show project @civ7/hr-proof-foundation --json`
  - `bun run nx show project hr-proof-app --json`
  - `bun run nx show target` for `build`, `check`, and `test` on each
    generated proof project
  - targeted cleanup of `packages/plugins/plugin-hr-proof-plugin`,
    `packages/hr-proof-foundation`, and `apps/hr-proof-app`, followed by clean
    `git status --short --branch`
  - `bun run --cwd tools/habitat-harness test -- migration-boundary.test.ts project-generator.test.ts`
  - temporary migration run file `migrations.hr-proof-noop.json` with package
    `./tools/habitat-harness`
  - `bun run nx migrate --run-migrations=migrations.hr-proof-noop.json --skip-install`
    -> pass; reported no changes
  - targeted deletion of `migrations.hr-proof-noop.json`, followed by clean
    source status except the committed test/record edits
  - `bun run --cwd tools/habitat-harness test -- project-generator.test.ts`
    -> pass; generated supported `plugin`, `foundation`, and `app` scratch
    projects through `bun run nx g @internal/habitat-harness:project`, proved
    `nx show project --json` discovery and `build`/`check`/`test` targets for
    each generated project, then removed the exact scratch roots
  - `bun run --cwd tools/habitat-harness test -- classify.test.ts`
    -> pass; classify matrix covers adapter, mod, foundation, app, tooling,
    plugin, generated-zone, and workspace-level paths, plus missing-path and
    multi-path diff behavior
  - `bun run habitat classify packages/civ7-adapter/src/index.ts`,
    `packages/config/src/index.ts`, `apps/mapgen-studio/src/main.tsx`,
    `tools/habitat-harness/src/plugin.js`,
    `packages/plugins/plugin-graph/src/index.ts`,
    `packages/civ7-types/generated/foo.d.ts`, and
    `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
    -> emitted only resolved project targets plus `bun run lint`; adapter and
    Civ7 types test targets were recorded as unavailable
  - `bun run nx show target` probes for `@civ7/adapter:check`,
    `@civ7/config:test`, `mapgen-studio:test`,
    `@internal/habitat-harness:test`, `@civ7/plugin-graph:test`,
    `@civ7/types:check`, `mod-swooper-maps:check`, and
    `mod-swooper-maps:test` -> resolved; probes for `@civ7/adapter:test` and
    `@civ7/types:test` rejected with missing-target output
  - `bun run nx show projects --with-target test --json` and
    `bun run nx show projects --with-target check --json` -> current resolved
    project inventory used as native Nx target-existence evidence
- Evidence boundary: current implementation proves resolved Nx target truth for
  the adapter missing-target case, structured target proof output, unavailable
  target reporting, workspace-only target handling, literal diff target
  preservation, async oclif classify output, exact path rule-scope labeling,
  project-owner labeling, workspace-gate labeling, unresolved metadata labeling
  for Grit rows without parseable scan roots, conservative refusal to treat
  prose exclusions such as `outside packages/civ7-adapter` as exact scan-root
  truth, preservation of pure-glob exact matches, and exclusion of unrelated
  internal exact-path rules. The classify test matrix now covers adapter, mod,
  foundation, app, tooling, plugin, generated-zone, and workspace-level paths,
  plus missing path and multi-path diff behavior. It also proves the project
  generator's uniform kind/root/package/tag contract and fail-closed refusal
  for unsupported kinds,
  mismatched roots, mismatched package names, non-empty roots, and workspace
  package-name collisions. It also proves through command evidence that scratch
  projects generated from the normal HR implementation worktree are discovered
  by Nx and expose `build`, `check`, and `test` targets for `plugin`,
  `foundation`, and `app`, and adds committed test coverage for that scratch
  discovery boundary. It proves only no-op migration wiring, not convention
  migration capability. It does not prove current-tree Grit row proof, baseline
  behavior, hook behavior, or product/runtime behavior.

## Realignment

- Downstream realignment ledger:
  `workstream/downstream-realignment-ledger.md`.

## Next Action

- Hold for supervisor review of the committed Nx target-existence proof matrix
  checkpoint before proceeding to stale guidance, downstream realignment, or
  packet closure work.
