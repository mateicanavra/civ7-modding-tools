# Habitat Effect-First Refactor Domino Plan

Status: hardened planning packet for downstream OpenSpec work.
Created: 2026-06-19.
Controlling backlog: `docs/projects/habitat-harness/deep-refactor/effect-first-repair-backlog.md`.
Branch: `agent-DRA-effect-first-openspec-domino-plan` stacked on `agent-DRA-effect-first-repair-backlog`.

This packet hardens the Effect-first repair backlog into implementation-ready
dominoes. It is intentionally not a source implementation packet. It records
the current Habitat state-space smells, the target file tree, the code that
must be carried forward or removed, and the OpenSpec changes that own each
repair lane.

## Method

Applied inputs:

- Takeover/session-control notes consolidated in
  `effect-first-repair-backlog.md`.
- Repo-local TypeScript refactoring skill: refactoring means collapsing
  reachable state space, not moving code around; illegal states must become
  unrepresentable; escape hatches, one-implementation abstractions, flag soup,
  and public/internal leaks are priority smells.
- Domain/system/solution design skills: name the domain language before
  implementation, move authority to the weakest valid boundary, preserve
  alternatives only until convergence, and separate current state, target state,
  and transition gates.
- Dev prework/milestone hardening prompts: remove hidden ambiguity, record
  exact evidence, split work into reviewable dominoes, state dependencies,
  testing, acceptance, and stop conditions before implementation.
- Local tool evidence packs for Effect, GritQL, Biome, and Nx, plus current
  Husky delegators in `.husky/pre-commit` and `.husky/pre-push`.

## Hard Architectural Conclusions

- Oclif, Husky, and Nx remain host adapters. They are not replaced by Effect.
- Effect is the Habitat core substrate below host adapters: services,
  providers, config, typed errors, resources, clock, filesystem, command
  execution, and test layers.
- Vendor tools are resources and providers, not loose executable names.
- Domain services own Habitat decisions. Providers own external execution.
- `.habitat` is authored data only. Managing code stays under
  `tools/habitat-harness`.
- Runtime Habitat code must use Habitat domain language. Workstream terms such
  as D-number, refactor, migration, proof, and evidence belong only in explicit
  receipt/workstream/verification surfaces.
- Existing public command behavior, JSON shapes, hook semantics, package
  exports, and Nx/Husky entrypoints are public-contract risks. They require
  parity gates before source changes close.

## Tool Boundaries

- Effect: owns typed requirements, tagged error channels, Layers, scoped
  resources, platform Command/FileSystem/Path/Clock usage, bounded concurrency,
  runtime edge discipline, and fake test services.
- GritQL: owns structural pattern matching and Grit apply/check command
  semantics. Habitat owns scan-root admission, parser contracts, baseline
  ratchets, proof records, and apply transaction safety.
- Biome: owns formatting, lint diagnostics, safe/unsafe fix categories,
  reporter behavior, and file-set config. Habitat owns path classification,
  write permission, protected zones, and transaction ordering.
- Nx: owns project graph, task graph, target discovery, affected scope,
  generators, plugin inference, and target metadata. Habitat owns classification
  language and local enforcement records that consume Nx facts.
- Husky: owns Git hook delegation files only. Habitat owns staged state,
  local-feedback transactions, restage policy, and non-claims.

## Exact Effect Service Requirements

All Habitat work below oclif, Nx generator entrypoints, package scripts, and
Husky delegators must be modeled as:

```ts
Effect.Effect<Success, HabitatError, Requirements>
```

`Effect.run*` is allowed only at host adapters, tests, and the named runtime
edge. Feature/domain code may construct Effect programs; it may not run them.

| Service | Owner | Required capability | Test requirement |
|---|---|---|---|
| `HabitatConfig` | `src/config/**` | repo root, harness root, `.habitat` root, cache roots, vendor command policy, hook mode, CI/local mode, timeout policy, telemetry mode, host policy source | fake config layer with explicit roots and modes |
| `CommandRunner` | `src/providers/command/**` | argv-array execution, cwd, env delta, stdout/stderr bounds, exit code, signal, duration, output digest, redaction, interruption | deterministic fake command observations |
| `HabitatFileSystem` | `src/resources/**` | read, write, mkdir, rm, stat, readdir, JSON read/write, protected path checks, scoped temp dirs | fake filesystem or temp-scoped layer with finalizer proof |
| `HabitatClock` | `src/resources/**` | monotonic duration and wall-clock timestamps through Effect Clock/TestClock | TestClock-backed layer |
| `HabitatReporter` | `src/resources/**` | stdout/stderr/report events, bounded output, JSON/text rendering hooks | event-capturing fake layer |
| `ResourceScope` | `src/resources/**` | temp dirs, caches, locks, snapshots, subprocess lifetime, cleanup finalizers | finalizer-order tests |

`src/runtime/**` owns only Effect program execution, layer assembly, and
host-edge run functions. `src/resources/**` owns scoped filesystem, clock, temp,
cache, write-set, and lock resources. It does not own process execution.

Expected failures use tagged variants under `HabitatError`:

- `ConfigError`
- `CommandError`
- `FileSystemError`
- `VendorError`
- `DomainError`
- `PublicContractError`
- `InvariantViolation`

Each error variant carries stable `code`, reader-safe message, structured
context, owner layer, and captured cause when translating a vendor or platform
failure.

## Exact Vendor Provider Requirements

Each vendor/resource provider has one public service, one live Layer, one fake
Layer, and one error family. Providers may normalize external behavior; feature
domains decide Habitat policy.

| Provider | Target owner | Required operations | Error family |
|---|---|---|---|
| `WorkspaceToolProvider` | `src/providers/workspace-tools/**` | resolve workspace-local binaries, materialize typed command requests, expose tool metadata without synchronous runtime execution | `WorkspaceToolProviderError` |
| `GitProvider` | `src/providers/git/**` | branch, head, status, merge-base, staged/unstaged diff, tracked files, `ls-tree`, show object, write-set facts | `GitProviderError` |
| `GritProvider` | `src/adapters/grit/provider/**` | pattern discovery, scan-root admission, check, dry-run apply, pattern tests, cache acquisition, diagnostics/output parsing | `GritProviderError` |
| `BiomeProvider` | `src/providers/biome/**` | format write, check read-only, CI read-only, safe fix write, reporter parse, safe/unsafe fix classification, file-set discovery | `BiomeProviderError` |
| `NxProvider` | `src/providers/nx/**` | project graph, target metadata, affected scope, `show project`, `show projects --with-target`, sync check, generator metadata | `NxProviderError` |
| `HuskyHookProvider` | `src/providers/husky/**` | hook name validation, hook environment facts, delegation receipt, non-claim labeling | `HuskyProviderError` |

Provider tests must compose fake Layers through Effect requirements. They must
not patch module imports or pass loose dependency bags into feature code.

## Runtime Boundary Rules

Allowed direct-use zones:

- `src/commands/**`
- `src/generators/**`
- `src/plugin/**`
- `src/runtime/**`
- `src/config/**`
- `src/resources/**`
- `src/providers/**`
- tests and fixtures

Forbidden in migrated domain/feature modules:

- `Effect.run*`
- `spawnSync`, `execSync`, `Bun.spawn`, and `node:child_process`
- direct `node:fs` mutation or ambient temp directory creation
- direct `process.env` or repo-root reconstruction
- `Date.now` and `new Date`
- raw vendor stderr parsing
- generic expected `throw new Error`

Each implementation packet must state its expected remaining static matches at
closure.

## Prioritized Smell Inventory

| Priority | Smell | Exact evidence | State-space defect | Collapse move | Public-contract risk | Required tests/commands |
|---|---|---|---|---|---|---|
| P0 | Library-local runtime execution | `tools/habitat-harness/src/lib/workspace-tools.ts` `materializeHabitatCommand()` calls `Effect.runSync`; `src/lib/effect-runtime.ts` exposes `runHabitatEffect()` | Any library can become its own runtime edge and bypass shared lifecycle/error policy | Keep `Effect.run*` only in runtime adapters; replace materialization with provider service calls | Package consumers import `materializeHabitatCommand`; hooks and spawn depend on it | Static guard for `Effect.run*`; `bun run --cwd tools/habitat-harness check`; public export audit |
| P0 | Process execution duplication | `src/lib/spawn.ts`; `src/lib/habitat-process.ts`; `src/lib/hook-runtime/command-runner.ts`; `src/lib/baseline-core/context.ts` | Multiple command result shapes hide exit, signal, env, cwd, cache, timing, and failure distinctions | One `CommandRunner` Effect service with live/fake layers; provider-specific command builders consume it | CLI, hooks, baseline integrity, verify, graph, and Grit can change stdout/stderr/exit behavior | Command parity for `check`, `fix --dry-run`, `verify`, `graph --json`, hooks; fake CommandRunner unit matrix |
| P0 | Direct mutable IO in domain modules | `rules/registry/load.ts`; `baseline-core/state.ts`; `baseline-core/integrity.ts`; `workspace-graph/inventory.ts`; `adapters/grit/request.ts`; `adapters/grit/scan-roots/index.ts`; `hook-runtime/staged-worktree.ts`; `check/render.ts`; `graph.ts` | Domain functions can read/write current checkout or temp dirs outside resource scopes | Move fs/time/temp writes into `FileSystemProvider`, `WorkspaceProvider`, `ResourceScope`; keep pure parse functions | Baseline writes, report output, graph temp cleanup, registry load, Grit cache paths | Fake FS tests, malformed JSON tests, temp finalizer tests, final clean worktree proof |
| P0 | Direct clock use | `habitat-process.ts`; `check/execution.ts`; `check/report.ts`; `check/selection.ts`; `commands/verify.ts`; `hook-runtime/runtime.ts` | Time becomes nondeterministic data and cannot be tested or replayed | Use Effect `Clock`/`TestClock` behind `HabitatClock` service | Duration fields in reports/receipts/hooks may change shape or precision | TestClock unit tests, golden shape checks, no direct `Date.now` outside providers |
| P0 | Error model split | Generic `throw new Error` in `rules/registry/load.ts`, `rules/registry/graph.ts`, `workspace-graph/states.ts`, `baseline-core/state.ts`, `baseline-core/integrity.ts`, `check/report.ts`, `check/render.ts`, generators, plugin | Expected failures, defects, refusals, and user errors share one thrown string channel | Introduce tagged domain errors and refusal data; render only at adapter/report boundaries | Error messages and exit codes are user-visible | Tagged error unit matrix; CLI invalid registry/baseline/selector parity |
| P0 | Public barrel leaks internals | `tools/habitat-harness/src/index.ts` exports runtime, process, workspace tool provider, registry internals, Grit failure helpers, rule execution, host policy schema; `rules/registry/index.ts`, `lib/classify.ts`, `lib/host-policy.ts` use broad barrels | Any internal type becomes de facto public contract and blocks refactor | Create explicit public contract exports; move test/internal imports to internal paths; forbid `export *` from internal modules | External package imports may break; package `exports` points at `src/index.ts` | Public-surface compatibility matrix update; `rg` callsite audit; package build/typecheck |
| P1 | Option/flag soup instead of services | `HookRuntime` has optional `runCommand`, `pathExists`, `fileHash`, `nowMs`, `reporter`, `resourcePolicy`, `trace`; Grit options include optional process layer/cache/diagnostic flags; baseline context takes optional `runCommand`/paths/registry | Objects can represent partially provided runtimes and untested combinations | Replace option bags with request discriminated unions and provided services/layers | Existing tests may rely on ad hoc injection | Fake layer tests for hooks/Grit/baseline; constructors reject invalid states |
| P1 | One-implementation abstractions | `WorkspaceToolProvider` wraps a fixed map and is also materialized sync; `NxWorkspaceGraphProjectReader` is the only reader class; `HookReporter` is a one-method object | Extra abstraction increases states without capability boundaries | Convert to functions where pure or service tags where provider-owned; remove one-method interfaces unless identity/lifecycle exists | Test helpers and package exports may import them | Type-only callsite audit; refactor tests for live/fake services |
| P1 | Vendor names used as domain ownership | `rules/registry/schema.ts` `ownerTool` combines authority and executable; `check/report.ts` emits `ownerTool`; workspace tools still map render/tool labels such as `format-check`; pattern validation has `ownerTool` | Records cannot distinguish domain authority, provider, and proof class | Replace with `domainAuthorityId`, `providerId`, `capabilityId`, and render-facing tool labels where needed | CheckReport v1 includes `ownerTool`; changing it is a compatibility event | D0 public JSON decision; if preserved, map new internals back to v1 label |
| P1 | Hook local feedback is manual transaction code | `lib/hooks.ts`; `hook-runtime/*`; `.husky/pre-commit`; `.husky/pre-push` | Staged state, resource publish, formatter writes, restage, Grit scan, and pre-push affected state are mutable steps with nullable helper injection | `LocalFeedback` domain service plus `GitProvider`, `BiomeProvider`, `GritProvider`, `NxProvider`, scoped write-set resource | Hooks are local-only but can mutate staged index | Staged/unstaged/partial/restage tests; hook non-claim receipt; pre-push base proof |
| P1 | Grit Effect island is not a provider model | `adapters/grit/runner.ts`; `adapters/grit/request.ts`; `habitat-process.ts`; `workspace-tools.ts` | Grit has more structure than other vendors, but provider concepts are not reusable | Enclose Grit under `adapters/grit/**` with a nested provider surface for version, command, config, parse, cache, failure, proof | Current Grit CheckReport behavior and apply dry-run behavior | Grit parser matrix, scan-root matrix, native pattern tests, current-tree check |
| P1 | Nx graph and workspace inventory mix direct APIs and direct fs | `workspace-graph/reader.ts` calls `createProjectGraphAsync`; `workspace-graph/inventory.ts` crawls package JSON; `states.ts` throws on invalid alias dependency | Graph truth, package inventory, target naming, and fallback inventory can diverge | `NxProvider` owns graph/target facts; `WorkspaceInventory` is a separate read-only provider | Classify output and verify target plans | H8 classify matrix; `nx show projects --with-target`; workspace graph tests |
| P1 | Baseline policy mixes Git process, fs, registry parsing, and domain decisions | `baseline-core/context.ts`; `baseline-core/state.ts`; `baseline-core/integrity.ts`; `check/report.ts` | Baseline state can be read, compared, and written through different pathways | `BaselineAuthority` domain service consumes `GitProvider`, `RuleRegistry`, `FileSystemProvider` | Shrink-only and rule-introduction behavior are public workflow contracts | Baseline growth/refusal tests; `--expand-baseline` parity; malformed base registry tests |
| P2 | `.habitat` authored-data fence is prose-heavy | `.habitat/rules/**`, `.habitat/baselines/**`, `.habitat/patterns/**`; D14A spec; `rules/patterns/schema.ts` | Future code can introduce executable or vendor-topology files under `.habitat` | Add static authored-artifact guard and TypeBox read-edge validation | Existing Grit compatibility view may need allowance | Injected file-kind violations; `bun run habitat:check -- --tool file-layer` |
| P2 | Product/host vocabulary leakage risk | Host policy declarations and generic source can admit Civ7, MapGen, recipe, stage, op, step, domain terms | Generic Habitat can become product parser by accident | Static allowlist: host declarations/examples only; no generic runtime parser terms | Host policy docs and records intentionally mention host names | Literal scan guard; host declaration fixture tests |
| P2 | Architecture enforcement owner drift | Existing invariants split across GritQL, Biome, Nx, file-layer, tests, docs | Tests can become the only guard for structural invariants | Per-invariant owner map and injected violation proof | New guardrails can make existing debt visible | Grit/Biome/Nx/Habitat rule proof and non-claims |

## Target File Tree

The implementation train SHOULD converge on this tree. Old files are either
converted to adapter/public-contract entrypoints or deleted after their logic is
relocated. They are not kept as alternate implementation paths.

```text
tools/habitat-harness/src/
  bin/
    habitat.ts
  commands/
    base/
      HabitatCommand.ts
    check.ts
    classify.ts
    fix.ts
    graph.ts
    hook.ts
    verify.ts
  runtime/
    index.ts
    habitat-runtime.ts
    layers.ts
    run.ts
    test-layers.ts
  config/
    index.ts
    habitat-config.ts
    schema.ts
    sources.ts
    paths.ts
  errors/
    index.ts
    habitat-error.ts
    provider-errors.ts
    domain-errors.ts
    render.ts
  resources/
    index.ts
    scope.ts
    clock.ts
    filesystem.ts
    temp-dir.ts
    cache.ts
    write-set.ts
    workspace-lock.ts
  providers/
    index.ts
    command/
      index.ts
      command-runner.ts
      request.ts
      observation.ts
      result.ts
      errors.ts
      live.ts
      test-layer.ts
    fs/
      index.ts
      provider.ts
      live.ts
      test-layer.ts
    clock/
      index.ts
      provider.ts
      live.ts
      test-layer.ts
    reporter/
      index.ts
      provider.ts
      live.ts
      test-layer.ts
    git/
      index.ts
      provider.ts
      commands.ts
      errors.ts
      test-layer.ts
    grit/
      index.ts
      provider.ts
      commands.ts
      output.ts
      scan-roots.ts
      apply-transaction.ts
      errors.ts
      test-layer.ts
    biome/
      index.ts
      provider.ts
      commands.ts
      errors.ts
      test-layer.ts
    nx/
      index.ts
      provider.ts
      graph.ts
      targets.ts
      affected.ts
      generators.ts
      errors.ts
      test-layer.ts
    husky/
      index.ts
      provider.ts
      errors.ts
    workspace-tools/
      index.ts
      provider.ts
      logical-tools.ts
      test-layer.ts
  domains/
    command-contract/
      index.ts
      schema.ts
      render.ts
      public-compatibility.ts
    proof-contract/
      index.ts
      receipts.ts
      non-claims.ts
      bounded-output.ts
    rule-registry/
      index.ts
      schema.ts
      load.ts
      facts.ts
      graph-facts.ts
    rule-selection/
      index.ts
      selectors.ts
      errors.ts
    structural-check/
      index.ts
      request.ts
      execution.ts
      report.ts
      render.ts
    baseline-authority/
      index.ts
      schema.ts
      state.ts
      integrity.ts
      expansion.ts
    workspace-graph-integration/
      index.ts
      classify.ts
      routing.ts
      target-plan.ts
    diagnostic-pattern-catalog/
      index.ts
      command.ts
      outcomes.ts
      identity.ts
    pattern-governance/
      index.ts
      schema.ts
      validation.ts
      admissions.ts
    transformation-transaction/
      index.ts
      worktree.ts
      apply.ts
      rollback.ts
    local-feedback/
      index.ts
      hooks.ts
      staged-state.ts
      outcomes.ts
    protected-zone-authority/
      index.ts
      guard.ts
      scan-root.ts
      recovery.ts
    scaffolding/
      index.ts
      project.ts
      pattern.ts
      refusals.ts
  public/
    index.ts
    check-report.ts
    classify.ts
    verify.ts
    generators.ts
  generators/
  plugin/
  index.ts
  plugin.ts
```

Non-target directories:

- Canonical domain target path is `tools/habitat-harness/src/domains/**`.
  `tools/habitat-harness/src/domain/**` is forbidden and must not be created.
- `src/lib/**`: staging only; no new feature ownership.
- `src/base/**`: drained into `src/commands/base/**`.
- `src/adapters/**`: drained into provider/domain homes. An adapter facade can
  remain only when a packet names the owner and closure action.
- `src/rules/**`: drained into `src/domains/rule-registry/**`,
  `src/domains/rule-selection/**`, `src/domains/pattern-governance/**`,
  `src/domains/diagnostic-pattern-catalog/**`, or architecture guard code.

## Carry Forward Or Delete

Carry forward:

- Existing oclif command names and flags in `src/commands/**`.
- Root scripts: `habitat`, `habitat:check`, `habitat:fix`, `openspec`, and Nx
  target entrypoints.
- Husky files as delegators to `bun run habitat hook ...`.
- CheckReport schema version 1 unless a separate compatibility packet changes
  it.
- D14A `.habitat` authored registry, baselines, and active pattern records.
- TypeBox schemas at read/write boundaries, with schema parse moved to domain
  services where appropriate.
- Existing Grit parser/failure facts that are already correct, relocated under
  `adapters/grit/provider` or `domains/diagnostic-pattern-catalog`.
- Nx generator and plugin entrypoint metadata, with reusable logic moved behind
  provider/domain services.

Delete or collapse:

- `src/lib/spawn.ts` as a general command runner after callers use
  `CommandRunner`/providers.
- `materializeHabitatCommand()` and library-local `Effect.runSync` in
  `workspace-tools.ts`.
- Direct `Date.now`/`new Date` in domain modules.
- Direct fs/temp/env access in domain modules.
- Generic `throw new Error` for expected user/tool/config/refusal states.
- Broad `export *` barrels and root exports that expose internal runtime,
  provider, registry, and rule execution surfaces.
- `ownerTool` as a mixed authority/provider model inside new internals.
- Hook option-bag injection for runtime dependencies.
- Product/host/process vocabulary in generic runtime modules outside explicit
  host declaration or receipt scopes.

## Domino Graph

| Order | OpenSpec change | Purpose | Depends on |
|---|---|---|---|
| 1 | `deep-habitat-effect-record-authority-repair` | Repair stale/ambiguous records before implementation | Current backlog |
| 2 | `deep-habitat-effect-substrate-architecture` | Approve exact target substrate, tree, exports, and migration spine | 1 |
| 3 | `deep-habitat-effect-static-inventory-guardrails` | Add direct-use and language guardrails before source migration | 2 |
| 4 | `deep-habitat-effect-runtime-config-errors` | Build shared runtime, config, error, resource, command services | 2, 3 |
| 5 | `deep-habitat-effect-command-result-model` | Replace uneven command outcomes with typed request/result/error observations | 4 |
| 6 | `deep-habitat-effect-vendor-providers` | Promote Grit and add Git/Biome/Nx/Husky provider boundaries | 4, 5 |
| 7 | `deep-habitat-effect-public-surface-facade` | Create explicit `src/public/**` facade before moving internals | 4, 6 |
| 8 | `deep-habitat-effect-rule-registry-domain` | Move registry, rule facts, graph facts, and selection to domains | 4, 7 |
| 9 | `deep-habitat-effect-check-baseline-cutover` | Move structural check and baseline authority to domains | 5, 6, 8 |
| 10 | `deep-habitat-effect-orientation-workspace-graph` | Move classify/orientation and workspace graph integration to domains/providers | 5, 6, 8 |
| 11 | `deep-habitat-effect-diagnostic-pattern-governance` | Move diagnostic catalog and pattern governance to domains | 5, 6, 8 |
| 12 | `deep-habitat-effect-transformation-transaction-domain` | Move pattern apply, protected zones, and transaction recovery to domains | 5, 6, 11 |
| 13 | `deep-habitat-effect-grit-apply-cutover` | Rework Grit check/apply paths onto Grit provider and transaction domain | 5, 6, 11, 12 |
| 14 | `deep-habitat-effect-hook-runtime-cutover` | Replace hook runtime local seams with Effect services while preserving Husky delegation | 5, 6, 9, 13 |
| 15 | `deep-habitat-effect-verify-graph-cutover` | Move verify, proof receipts, and Nx affected execution onto providers/domains | 5, 6, 10 |
| 16 | `deep-habitat-effect-scaffolding-authoring-fence` | Move generators and authoring fences behind domain/provider contracts | 8, 11, 12 |
| 17 | `deep-habitat-effect-artifact-language-enforcement` | Enforce `.habitat`, public/internal, and generic-host language fences | 3, 7-16 |
| 18 | `deep-habitat-effect-d14-d15-authoring-reframe` | Clarify D14/D15 boundaries and future authoring preconditions | 1, 2, 17 |
| 19 | `deep-habitat-effect-public-surface-guards` | Remove staging facades, narrow exports, and lock architectural guards | 7-18 |

## Decisions

### Decision 1: Effect Is Core Substrate, Not Host Shell

Options considered:

- Replace oclif/Husky/Nx entrypoints.
- Keep current host entrypoints and move reusable Habitat logic below them into
  Effect programs and services.

Choice: keep host entrypoints and move the core below them.

Rationale: oclif, Husky, and Nx already own stable repo contracts. Effect docs
support runtime-edge discipline, service/layer injection, and resource scopes;
they do not require a CLI framework replacement.

Risk: adapter boundaries can become thin wrappers over inconsistent internals.
Mitigation: source migration is blocked until `deep-habitat-effect-runtime-config-errors`
adds shared services and static guards reject local runtime/process shortcuts.

### Decision 2: Providers Are Separate From Domain Services

Options considered:

- One general workspace tool abstraction.
- Vendor providers plus domain services.

Choice: vendor providers plus domain services.

Rationale: Grit, Biome, Nx, Git, and Husky own different semantics. One generic
tool map hides those differences and inflates reachable states.

Risk: provider count increases module count. Mitigation: each provider must
own a real external resource or command family; otherwise use a pure function.

### Decision 3: Public Surface Is Explicit

Options considered:

- Keep broad root barrels during the refactor.
- Define public contracts and move internals to internal/domain/provider paths.

Choice: define public contracts first.

Rationale: the root barrel currently turns internals into external obligations.
The refactor cannot safely relocate runtime/providers while those exports stay
unclassified.

Risk: external consumers may rely on internal exports. Mitigation: the public
surface packet requires a callsite census and D0 matrix update before removals.

## Verification Spine

Planning artifacts:

- `bun run openspec -- validate <change-id> --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch`
- `gt status`

Source implementation gates, assigned to later packets:

- `bun run --cwd tools/habitat-harness check`
- `bun run --cwd tools/habitat-harness test`
- `bun run habitat:check -- --json`
- `bun run habitat fix -- --dry-run`
- `bun run habitat verify -- --base <Graphite parent>`
- H8 classify path/diff matrix
- Hook pre-commit staged/partial/restage/local-only matrix
- Grit parser/scan-root/projection/apply matrix
- Baseline malformed/growth/introduction matrix
- Static scans for `Effect.run*`, direct fs/env/time/process, `export *`,
  process vocabulary, and host/product vocabulary

## Stop Conditions

- Any implementation starts from a packet with unresolved P1/P2 design findings.
- A source change wraps old sync code in Effect without typed errors, service
  requirements, resource scopes, and fake test layers.
- A provider claims semantics owned by another vendor.
- CheckReport, classify, verify, hook, or package export behavior changes
  without an explicit public-contract spec.
- `.habitat` gains managing code or executable TypeScript.
- Generic Habitat gains MapGen/Civ7 authoring parser semantics.
- D15 is treated as broad authorization rather than a command-observation
  trigger with concrete rows.
