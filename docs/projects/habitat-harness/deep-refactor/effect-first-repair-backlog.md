# Deep Habitat Effect-First Repair Backlog

Status: investigation reference frame and implementation-input backlog.
Created: 2026-06-19.
Branch: `agent-DRA-effect-first-repair-backlog`.
Session takeover target: Codex session `019edd19-0cc0-7093-afc0-450ab853fe20`.

This document consolidates recovered session control notes, current stack
records, source-contract findings, and the Effect-first/domain-design repair
frame required before continuing the Habitat refactor.

It is not a closure record and does not approve new source implementation. It
is the controlling backlog input for design repair, packet cleanup, and any
follow-up implementation work.

Hardened implementation-input packet:
`docs/projects/habitat-harness/deep-refactor/effect-first-refactor-domino-plan.md`.
Systematic workstream control record:
`docs/projects/habitat-harness/deep-refactor/effect-first-systematic-workstream.md`.
Use that packet and the `deep-habitat-effect-*` OpenSpec dominoes for source
planning and execution order; use this backlog as the recovered violation
ledger.

## Evidence Frame

Observed sources:

- Extracted target session chunks:
  `/tmp/takeover-session/deep-habitat-toolkit-019edd19/`.
- Current stack-tip packet index:
  `docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- D0 compatibility matrix:
  `docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
- Effect evaluation:
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md`.
- Local official-doc packs:
  `docs/projects/habitat-harness/research/official-docs-effect.md`,
  `official-docs-gritql.md`, `official-docs-biome.md`, and
  `official-docs-nx.md`.
- Current source on stack tip under `tools/habitat-harness/src`.
- Root workflow and hook surfaces: `package.json`, `tools/habitat-harness/package.json`,
  `.husky/pre-commit`, and `.husky/pre-push`.

Evidence rules:

- User notes from the target session are control input, not commentary to
  average away.
- Current source and current stack records beat stale downstack records.
- Official vendor docs constrain vendor semantics, but Habitat owns its local
  orchestration, proof, and domain contracts.
- Observed evidence and inferred design synthesis stay separate.
- D15 remains a command-observation trigger protocol. It is not a blanket
  substrate migration gate.

## Recovered Session Control Notes

The target session repeatedly reset the work around these control demands:

- Preparation before source implementation: frame, corpus, D0 matrix rows,
  concrete citations, and packet boundaries must exist before source changes.
- D1/D2/D14A cleanup means deleting wrong architecture, not preserving process
  artifacts under better names.
- Process vocabulary such as proof, evidence, migration, refactor, domino, and
  D-number terms must not leak into runtime DTOs, schemas, or product-facing
  code unless the command surface explicitly owns a receipt/proof scenario.
- Existing stack tools are the substrate: Oclif for CLI entrypoints, TypeBox
  for boundary schemas already in the harness, Effect for typed errors,
  services, resources, config, and command/resource orchestration, GritQL for
  syntax pattern checks/transforms, Biome for format/lint/safe-fix semantics,
  Nx for project/task graph and target proof, and Husky only as a hook
  delegator.
- Runtime checks and shell command construction must not be manually rebuilt
  where Oclif, TypeBox, Effect, Nx, Grit, Biome, or Git already own the
  semantic surface.
- Architecture should be enforced through durable mechanisms such as Habitat
  rules, GritQL, Biome, Nx boundaries, project metadata, and generated checks,
  not brittle tests that merely guard an accidental implementation shape.
- `.habitat` owns checked-in authored Habitat artifacts. Managing code remains
  under `tools/habitat-harness`. Executable native TypeScript rules or
  vendor-named directories inside `.habitat` violate the authored-artifact
  boundary unless a later accepted packet deliberately authorizes them.
- Generic Habitat source must not bake in Civ7, MapGen, recipe, domain, stage,
  op, or step semantics. Such concepts require a future accepted authoring
  packet and explicit command/API surface.
- D14 is a fence/refusal layer. D15 is dormant unless a consuming packet records
  a concrete impossible local command-observation state.
- Agents must keep records current, close dead review agents, and not advance
  from stale green claims while accepted P1/P2 findings or current-source
  contradictions remain.

## Current Stack State

Observed on the stack tip:

- Current branch is `agent-DRA-habitat-domain-language-cleanup`.
- Current Habitat DRA stack is linear through D15:
  D14A, D14, D15, and the domain-language cleanup branch are above the current
  implementation layers.
- The stack-tip packet index now records D14A source submitted as draft PR
  #1853, D14 implementation boundary complete pending submission, and D15
  dormant.
- The main checkout that launched this investigation was downstack on
  `agent-DRA-d14a-authored-artifact-authority`; its records are stale by
  construction relative to the stack tip.

Outstanding record repairs:

- D14A is a source implementation layer but still lacks a standard adjacent
  workstream bundle under
  `openspec/changes/deep-habitat-d14a-authored-artifact-authority/workstream/`.
  It needs a phase record, review disposition ledger, downstream realignment
  ledger, and closure checklist with exact command/status/cache/non-claim
  evidence.
- The D0 matrix row for D14A CLI smoke still needs reconciliation against the
  claimed D14A validation on the stack.
- Phase 2 provenance paths and operational worktree fixtures must remain
  provenance only, not executable truth for future agents.
- Any downstack branch view must be treated as historical unless the same row is
  checked against the stack tip.

## Primary Diagnosis

The remaining failure is not one isolated bad module. Habitat has an incomplete
domain substrate.

Effect has been introduced, but mostly as a Grit adapter island:

- `tools/habitat-harness/package.json` now depends on `effect`,
  `@effect/platform`, and `@effect/platform-node`.
- Historical `src/lib/effect-runtime.ts`/`src/substrate/runtime/run.ts`
  centralized one `runHabitatEffect` edge. The current stack drains that generic
  runner; substrate runtime exports layers only, and execution belongs at
  service runtime, host/framework entrypoints, and tests with explicit fake
  layers.
- `src/lib/habitat-process.ts` defines `HabitatProcess` as a Context/Layer
  service and uses `@effect/platform/Command`.
- `src/adapters/grit/request.ts` uses `Effect.acquireRelease` for fresh Grit
  cache directories.

That is useful but insufficient. Large parts of the toolkit still route
fallible vendors, filesystem, Git state, clocks, config, hooks, baselines, and
command execution through manual sync functions, string conventions, direct
`Date.now`, direct filesystem calls, ad hoc options bags, and local runtime
escape hatches.

The repair target is therefore:

> Habitat must be Effect-first below the CLI/hook entrypoint boundary. Domain
> services, vendor providers, resources, configuration, typed errors, and
> capability objects must be explicit and composable. Vendor tools remain
> semantic authorities for their own domains, but each vendor is exposed to
> Habitat as an acquired/provided resource with typed commands, config, failure
> modes, and proof output.

## Violation Backlog

### V1 - Authority Records Drift From Current Stack Truth

Observed:

- Downstack packet records can say implementation is pending while stack-tip
  branches have submitted implementation PRs.
- D14A source is complete enough to be submitted, but its adjacent workstream
  evidence bundle is missing.
- Historical worktree paths still appear in project records and can be mistaken
  for current operational truth.

Repair demand:

- Treat the stack tip as the record authority for source status.
- Add D14A workstream records with exact validation commands, outcomes,
  freshness/cache stance, and non-claims.
- Mark historical checkout paths as provenance-only anywhere they remain.

Proof gate:

- `gt log short --stack`, `git status --short --branch`, packet index rows, D0
  matrix validation rows, and adjacent workstream records agree.

### V2 - Effect Adoption Is Too Narrow For The Toolkit

Observed:

- Effect is live in Habitat dependencies and in the Grit/process adapter path.
- Hook runtime, baseline context, command rules, general spawn execution, many
  filesystem operations, clocks, and config paths are still non-Effect.
- `materializeHabitatCommand` runs an Effect program synchronously inside a
  library helper rather than leaving runtime execution at the edge.

Repair demand:

- Redesign Habitat around a single Effect runtime boundary beneath Oclif/Husky.
- Move fallible services into Effect requirements: command runner, Git, FS,
  clock, config, reporter, workspace graph, baseline store, vendor providers.
- Ban library-local `Effect.run*` except approved service runtime,
  host/framework, and test edges.

Proof gate:

- Static scan shows domain services do not call `spawnSync`, direct
  process/env/time/filesystem mutation, or `Effect.run*` outside provider/runtime
  modules.

### V3 - Vendor Tools Are Not First-Class Resources And Providers

Observed:

- `WorkspaceToolProvider` materializes names such as `grit`, `biome`, `nx`, and
  `eslint`, but it is not yet a complete provider model for version, capability,
  config, health, command families, resource acquisition, or failure taxonomy.
- Hooks still call `biome`, `nx`, and Habitat subprocesses through sync command
  execution.
- Baseline and verification code call Git through raw command functions.

Repair demand:

- Define vendor providers as resources:
  `GritProvider`, `BiomeProvider`, `NxProvider`, `GitProvider`,
  `HuskyHookProvider`, and `WorkspaceToolProvider`.
- Each provider must expose typed capabilities, command construction,
  config/version discovery, resource/cache policy, failure tags, and proof
  projections.
- Vendor semantics remain bounded: Nx owns graph/task metadata, Grit owns
  pattern matching/apply CLI behavior, Biome owns format/lint/safe-fix behavior,
  Husky owns hook delegation only, and Habitat owns orchestration/proof.

Proof gate:

- Unit tests provide fake vendor Layers. Integration tests prove pinned vendor
  commands and official-doc constraints with real tools.

### V4 - Error Semantics Are Still Uneven

Observed:

- Grit has tagged failures, but other domains still use generic `Error`, exit
  codes, strings, nullable states, or diagnostics-as-control-flow.
- Tool unavailable, command failed, parse failed, schema drift, invalid selector,
  baseline refusal, protected-zone refusal, staged-state refusal, and config
  failure are not represented by one coherent error taxonomy.

Repair demand:

- Create a Habitat error taxonomy using `Data.TaggedError` or equivalent Effect
  tagged errors per domain.
- Separate expected failures from defects.
- Render errors only at CLI/hook/report boundaries.
- Preserve cause/provenance without leaking huge streams into public receipts.

Proof gate:

- Every command path can map expected errors to stable human output and stable
  JSON/receipt shapes without string-matching stderr.

### V5 - Config Is Not A First-Class Domain Capability

Observed:

- Repo root, cache dirs, tool paths, hook resource policy, telemetry toggles,
  base refs, scan roots, and CI/local mode are constructed in scattered modules.
- Effect `Config` is not yet the configuration substrate for Habitat.

Repair demand:

- Introduce `HabitatConfig` as an Effect-provided service backed by `Config`
  where appropriate.
- Keep config sources explicit: repo defaults, package pins, env overrides,
  command flags, `.habitat` authored data, and host declarations.
- Do not let vendor names or host product concepts become implicit config
  hierarchy under `.habitat`.

Proof gate:

- Tests can provide config Layers; command receipts can state relevant selected
  config without leaking secrets.

### V6 - Domain Services And Provider Details Are Mixed

Observed:

- Rule registry records and `ownerTool` carry a blend of authority, execution
  tool, owner project, scope, reporting, and proof hints.
- Check/report and hooks mix domain decisions with vendor command execution and
  rendering.

Repair demand:

- Split domain services from provider resources.
- Domain services own language and decisions:
  `RuleRegistry`, `RuleSelection`, `StructuralCheck`, `BaselineAuthority`,
  `WorkspaceGraphIntegration`, `DiagnosticPatternCatalog`, `PatternGovernance`,
  `TransformationTransaction`, `LocalFeedback`, `ProtectedZoneAuthority`,
  `Scaffolding`, and `ProofContract`.
- Provider resources execute external capability:
  `CommandRunner`, `GitProvider`, `FileSystem`, `Clock`, `NxProvider`,
  `GritProvider`, `BiomeProvider`, `Reporter`, `ConfigProvider`.

Proof gate:

- Each capability object declares exactly one domain authority and one provider
  path. No record type must carry ambiguous ownership.

### V7 - Process/Proof Vocabulary Still Reappears In Product Surfaces

Observed:

- The session repeatedly removed proof/evidence/migration/refactor/D-number
  concepts from runtime code, then reopened similar vocabulary elsewhere.
- Some source exports and receipt-like records still blur command proof,
  runtime DTOs, and architecture process artifacts.

Repair demand:

- Runtime/product code must use Habitat domain terms, not workstream process
  labels.
- Proof vocabulary belongs in receipts, workstream records, and verification
  artifacts only where those are the explicit command contract.

Proof gate:

- GritQL or Biome/Habitat static checks reject process-vocabulary leakage in
  runtime modules, except allowlisted receipt/proof modules.

### V8 - `.habitat` Boundary Needs Continued Hardening

Observed:

- D14A moves authored registry, baselines, and active patterns under
  `.habitat`.
- Managing code remains under `tools/habitat-harness`.
- Session notes warned against executable native TS rules and vendor-forward
  hierarchy under `.habitat`.

Repair demand:

- `.habitat` remains checked-in authored data, not managing SDK code.
- Active Grit pattern placement is allowed only according to proven tool support
  and current D14A/D14 contracts.
- Vendor names under `.habitat` must be justified as authored artifact format,
  not as organizing language for Habitat's domain model.

Proof gate:

- Static checks enforce `.habitat` file kinds, executable-code refusal, and
  approved authored artifact schema.

### V9 - Generic Habitat Still Risks Host/Product Leakage

Observed:

- D14 notes rejected MapGen recipe/domain/op/stage/step parser semantics in
  generic Habitat.
- Host policy declarations exist, but future scaffold or authoring work can
  easily reintroduce product-specific literals.

Repair demand:

- Generic Habitat only handles generic structure, host declarations, and
  explicit refused authoring surfaces.
- MapGen/Civ7 authoring concepts require a future accepted packet with command
  API, schema, examples, and compatibility rows.

Proof gate:

- Static scan blocks Civ7/MapGen/recipe/domain/stage/op/step literals in generic
  modules outside approved host declaration or example scopes.

### V10 - Architecture Enforcement Is Still Too Test-Shaped

Observed:

- The session repeatedly rejected brittle architecture tests as the primary
  enforcement mechanism.
- Current enforcement is spread across Habitat rules, Grit patterns, Nx targets,
  Biome, tests, and docs.

Repair demand:

- Assign each architecture invariant to the right enforcement owner:
  GritQL for syntax-shape patterns, Biome for format/lint/safe fixes, Nx for
  graph/target/import boundary proof, Habitat file-layer for generated/protected
  zones, and tests for behavior and fixtures.
- Tests may verify enforcement behavior, but must not be the only guard for a
  structural invariant that should be a rule.

Proof gate:

- Every invariant in the repair plan has an enforcement owner, an injected
  violation test, and a non-claim statement.

### V11 - Hook Runtime Is Local Feedback, Not Proof Or CI

Observed:

- Husky delegates directly to `bun run habitat hook pre-commit` and
  `pre-push`.
- Hook code orchestrates staged paths, file-layer checks, Biome formatting,
  restage, pattern checks, and Nx affected.
- Hooks are local-only and CI remains authoritative.

Repair demand:

- Rebuild hook runtime as an Effect-scoped local-feedback transaction.
- Git staged identity, partial-staging refusal, formatter write set, restage,
  Grit scan, and pre-push affected scope are separate typed steps.
- Hook records cannot be used as packet closure or product proof.

Proof gate:

- Hook tests prove staged scope, partial staging refusal, formatter touched-file
  restage, command provenance, base selection, and local-only non-claims.

### V12 - D15 Boundary Must Be Clarified Against Effect-First Substrate

Observed:

- D15 is dormant for shared command-observation substrate unless a consuming
  packet triggers it.
- Effect-first repair now requires a broader resource/error/service/config
  substrate across Habitat.

Repair demand:

- Keep the distinction explicit:
  D15 gates a specific command-observation contract, not all Effect-first
  domain/service/provider refactoring.
- If the Effect-first command result model would change the shared command
  observation contract consumed by D6/D7/D9/D11/G-HOST, open the D15 trigger
  with concrete rows.
- If the work only moves internals behind services/providers while preserving
  public DTOs and packet-local observations, it belongs in a new Effect-first
  substrate packet, not D15 by default.

Proof gate:

- The design packet states whether it preserves or changes D15-owned command
  observations and cites exact D0/D1 rows either way.

## Target Effect-First Architecture

Entry boundaries:

- Oclif remains the CLI shell unless a separate command-shell packet changes
  it.
- Husky remains a shell hook delegator only.
- Root Nx scripts remain the repo workflow entrypoints.
- Command bodies and hook bodies call Effect programs through a small runtime
  adapter.

Runtime substrate:

- `HabitatRuntime`: composes Node platform, repo config, clock, filesystem,
  command runner, reporter, Git, and vendor providers.
- `CommandRunner`: executes structured command requests and returns typed
  command results with argv, cwd, env delta, stdout/stderr captures, exit,
  signal/interruption, duration, stream digests, cache/proof labels, and failure
  tags.
- `HabitatConfig`: owns repo root, cache roots, tool path policy, hook policy,
  local/CI mode, telemetry toggles, timeout policy, and host declaration source.
- `HabitatErrors`: shared tagged-error vocabulary plus domain-specific tagged
  errors.
- `HabitatResources`: scoped temp dirs, caches, locks, probes, sandboxes,
  subprocesses, formatter/apply write sets, and cleanup finalizers.

Domain services:

- `CommandContract`: CLI flags, public JSON surfaces, compatibility rows, and
  command rendering.
- `ProofContract`: receipt/proof/non-claim language and bounded stream policy.
- `RuleRegistry`: authored registry schema and rule facts.
- `RuleSelection`: owner/rule/tool selector validation and selection results.
- `StructuralCheck`: check orchestration and collect-all diagnostics.
- `BaselineAuthority`: shrink-only baseline policy and rule-introduction
  manifests.
- `WorkspaceGraphIntegration`: Nx graph/project/target facts consumed by
  Habitat classification.
- `DiagnosticPatternCatalog`: pattern diagnostic acquisition contracts.
- `PatternGovernance`: active/candidate/apply admission and pattern metadata.
- `TransformationTransaction`: dry-run/live-write/rollback/write-set states.
- `LocalFeedback`: hook-only staged feedback and local non-claims.
- `ProtectedZoneAuthority`: generated/protected/host path decisions.
- `Scaffolding`: supported project generation and unsupported-kind refusals.

Vendor providers:

- `GritProvider`: pattern test/check/apply commands, scan roots, cache policy,
  parse contracts, dry-run/apply proof, and Grit failure tags.
- `BiomeProvider`: read-only CI/check, format/write, safe/unsafe-fix boundaries,
  file include policy, reporter policy, and Biome failure tags.
- `NxProvider`: resolved project graph, target existence, affected scope,
  plugin inference proof, cache/target metadata, and Nx failure tags.
- `GitProvider`: status, staged files, merge-base, show, add/restage, diff,
  worktree cleanliness, and Git failure tags.
- `HuskyHookProvider`: hook name/delegation context only. It does not own staged
  paths, Biome, Grit, Nx, or proof semantics.

Capability objects:

- `RuleCapability`: rule id, domain authority, provider, scan roots, proof
  class, baseline policy, and non-claims.
- `DiagnosticCapability`: acquisition command, parser, schema, status model, and
  rendering contract.
- `ApplyCapability`: admitted transform, dry-run proof, write-set approval,
  rollback/cleanup, and live-write refusal states.
- `HookCapability`: staged scope, side effects, local-only non-claims, and
  command ordering.
- `BaselineCapability`: baseline state, comparison base, introduction manifest,
  shrink/growth decision, and recovery instructions.

## Repair Plan

### Slice A - Record Repair And Authority Cleanup

Scope:

- Add D14A workstream records.
- Reconcile D0 matrix validation rows for D14A.
- Mark Phase 2 worktree paths as provenance-only where still ambiguous.

Exit:

- Stack-tip records agree with `gt log short --stack`.

### Slice B - Effect-First Substrate Design Packet

Scope:

- Write an OpenSpec packet for the Habitat Effect-first substrate.
- Define domain services, provider resources, config, errors, resource scopes,
  capability objects, and D15 interaction.
- No source behavior changes.

Exit:

- Domain-design, investigation-design, and tool-doc review lanes have no
  unresolved P1/P2 findings.

### Slice C - Static Inventory And Guardrails

Scope:

- Inventory `spawnSync`, direct `Date.now`/`new Date`, direct fs mutation,
  direct env reads, generic throws, library-local `Effect.run*`, vendor command
  construction, and process vocabulary in runtime modules.
- Classify each occurrence as provider-owned, domain violation, or allowed edge.

Exit:

- Guardrail checks exist or are scheduled for each recurring violation class.

### Slice D - Core Runtime, Config, And Error Taxonomy

Scope:

- Introduce shared `HabitatRuntime`, `HabitatConfig`, `CommandRunner`,
  `HabitatErrors`, and test Layers.
- Preserve public command behavior.

Exit:

- Unit tests provide fake Layers.
- Entry commands still pass parity smoke checks.

### Slice E - Vendor Provider Migration

Scope:

- Promote Grit's existing Effect island into a provider shape.
- Add Nx, Biome, Git, and Husky provider boundaries without claiming their
  semantics as Habitat semantics.

Exit:

- Vendor provider tests prove command construction, version/config discovery,
  failure mapping, and proof output.

### Slice F - Check/Baseline/Hook Domain Migration

Scope:

- Move check orchestration, baseline policy, and hook runtime behind Effect
  domain services.
- Preserve public JSON contracts unless a compatibility packet changes them.

Exit:

- Unknown selector, baseline refusal, protected-zone refusal, hook partial
  staging, Biome write, Grit parse, and Nx affected states are typed outcomes.

### Slice G - `.habitat` And Generic Habitat Enforcement

Scope:

- Enforce `.habitat` authored-data shape.
- Block executable `.habitat` code unless explicitly accepted.
- Block generic Habitat host/product vocabulary leaks outside approved scopes.

Exit:

- Injected violations fail through Habitat/Grit/Biome/Nx enforcement, not only
  prose review.

### Slice H - D14/D15 And Future Authoring Reframe

Scope:

- Reconfirm D14 as fence/refusal.
- Reconfirm D15 as command-observation trigger only.
- Define the future MapGen/Civ authoring packet preconditions without
  implementing product-specific parser semantics now.

Exit:

- Future work cannot accidentally treat D14 or D15 as broad authorization.

## Minimum Proof Suite Before Source Continuation

Repository and stack:

- `git status --short --branch`
- `gt log short --stack`
- `gt status`

Docs/spec:

- OpenSpec validation for any new or changed packet.
- D0 matrix row checks for touched public command/JSON/export/root-script/Nx
  surfaces.
- Workstream phase record with command, expected status, actual status,
  freshness/cache stance, proof class, and non-claim.

Static/domain:

- Scan for forbidden process vocabulary in runtime modules.
- Scan for forbidden host/product vocabulary in generic Habitat modules.
- Scan for library-local `Effect.run*`.
- Scan for direct vendor/process/fs/time/env use outside provider modules.

Behavior:

- Root/dev/prod Habitat help and command smoke.
- `habitat check --json` valid and invalid selector cases.
- `habitat fix --dry-run` and live-write refusal.
- Grit pattern tests plus injected violation path.
- Biome read-only and write-mode separation.
- Nx resolved target/affected proof.
- Hook pre-commit staged/partial/restage/path tests.

## Stop Conditions

Stop and reframe if:

- A repair wraps existing sync/promise code in Effect without typed errors,
  service requirements, resource scoping, config, and test Layers.
- A vendor provider claims semantics owned by Nx, Grit, Biome, Git, or Husky.
- Runtime code gains process/proof/refactor/D-number vocabulary without an
  explicit receipt/proof command contract.
- `.habitat` gains executable managing code or unapproved vendor topology.
- Generic Habitat gains MapGen/Civ authoring parser concepts.
- D15 is used as a default migration permission rather than a concrete
  trigger-accepted command-observation packet.
- A green test is used as proof for an invariant that should be enforced by a
  Habitat/Grit/Biome/Nx rule.
- Workstream records are updated from downstack stale views without checking
  stack-tip source truth.

## Team Review Lanes For The Next Pass

Use an orchestrator plus specialists, with one accountable owner:

- Session-control lane: recovered notes, phase map, stale claims, and user
  guardrails.
- Record/Graphite lane: stack topology, packet index, D0 matrix, PR/branch
  state, and worktree hygiene.
- Source/domain lane: code authority map, public exports, D14/D15 boundaries,
  and generic-vs-host leakage.
- Effect substrate lane: services, providers, config, resources, errors, and
  capability objects.
- Vendor lane: Effect, GritQL, Biome, Nx, Husky docs and pinned local command
  behavior.
- Enforcement lane: GritQL/Biome/Nx/Habitat guardrails and injected violation
  proof.

Each lane must return observed evidence, inferred conclusions, repair demands,
and unverified claims separately.
