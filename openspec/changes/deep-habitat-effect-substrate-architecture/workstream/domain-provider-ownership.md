# Domain And Provider Ownership

## Ownership Rule

Domain services decide Habitat policy. Providers acquire external facts or
execute external capabilities. Resources manage scoped lifecycle. Public
contracts render or preserve externally visible shapes. A module may compose
these layers, but it must not own two categories at once.

## Runtime Edge Contract

All reusable Habitat programs below oclif commands, Husky delegators, Nx
generators/plugins, package scripts, and tests return:

```ts
Effect.Effect<Success, HabitatError, Requirements>
```

Allowed `Effect.run*` zones:

- `src/service/impl.ts` and `src/service/runtime/**`
- `src/commands/**`
- `src/bin/**`
- `src/generators/**`
- `src/plugin/**`
- tests and fixtures

Forbidden `Effect.run*` zones after migration:

- `src/domains/**`
- `src/providers/**`
- `src/resources/**`
- migrated reusable logic formerly under `src/lib/**`, `src/base/**`, or
  `src/substrate/providers/grit/**`

Current known runtime-edge violations that later source packets must collapse:

- `src/lib/workspace-tools.ts` uses `Effect.runSync` inside a reusable helper.

The architecture target is explicit execution at real edges: substrate runtime
exports `HabitatSubstrateLive`, service runtime composes the service
implementer over service context layers, host/framework entrypoints can execute
service programs, and tests run programs with explicit fake layers. Domains,
providers, and resources return Effect programs; the generic runtime runner is
not an accepted end-state API.

## Service Contract Rules

Each service/provider introduced by later source packets must define:

- one service tag or explicit service constructor;
- one live Layer;
- one fake/test Layer;
- typed request and result data;
- a tagged error family or a documented subset of `HabitatError`;
- public-contract mapping when the old surface is still visible.

Loose dependency bags are not accepted as the replacement substrate. Optional
test hooks are replaced by fake Layers or request variants.

## Provider Catalog

| Provider/resource | Target path | Owns | Does not own | Live requirements | Fake/test requirement |
|---|---|---|---|---|---|
| `CommandRunner` | `src/providers/command/**` | argv-array execution, cwd/env delta, stdout/stderr bounds, exit/signal, timing, redaction, interruption | vendor semantics or Habitat policy | process execution, timeout policy, bounded output, clock | deterministic command observations and failure matrix |
| `WorkspaceToolProvider` | `src/providers/workspace-tools/**` | logical tool-to-command materialization and workspace-local binary policy | running commands | `HabitatConfig`, command metadata | fake logical tool table |
| `GitProvider` | `src/providers/git/**` | branch/head/status, staged and unstaged diff, merge-base, tracked files, object reads, write-set facts | hook policy or proof receipt decisions | `CommandRunner`, `HabitatConfig` | fake repository state and command observations |
| `GritProvider` | `src/substrate/providers/grit/**` | Grit command construction, pattern discovery, scan-root admission facts, check/apply/test execution, cache acquisition, diagnostic/output parsing | pattern governance decisions or baseline policy | `CommandRunner`, `HabitatConfig`, `ResourceScope`, `HabitatFileSystem` | fake Grit outputs, parser fixtures, scan-root matrix |
| `BiomeProvider` | `src/providers/biome/**` | check/format command construction, reporter parsing, safe/unsafe fix classification, file-set discovery | staged restage policy or protected-zone authority | `CommandRunner`, `HabitatConfig`, `HabitatFileSystem` | fake reporter diagnostics and write/no-write outcomes |
| `NxProvider` | `src/providers/nx/**` | project graph, target metadata, affected scope, generator metadata, sync-check facts | Habitat classify wording or target-plan policy | Nx devkit or command-backed graph access, `HabitatConfig` | fake graph and target metadata |
| `HuskyHookProvider` | `src/providers/husky/**` | hook name validation, hook environment facts, delegator receipt, non-claim labels | local feedback transaction policy | `HabitatConfig`, hook environment | fake hook env/delegation facts |
| `HabitatFileSystem` | `src/resources/filesystem.ts`, `src/providers/fs/**` | read/write/mkdir/rm/stat/readdir, JSON read/write, protected path checks | domain decisions about what should be written | platform fs, path service, config roots | fake fs or temp-scoped layer |
| `HabitatClock` | `src/resources/clock.ts`, `src/providers/clock/**` | wall-clock and monotonic duration | report semantics | Effect Clock | TestClock-backed layer |
| `HabitatReporter` | `src/providers/reporter/**` | stdout/stderr/report events, bounded output, JSON/text rendering hooks | domain outcome construction | console/std streams | event-capturing reporter |
| `ResourceScope` | `src/resources/**` | temp dirs, caches, locks, snapshots, subprocess lifetime, cleanup finalizers | vendor semantics | Effect Scope finalizers and config roots | finalizer-order tests |

## Config And Direct-Use Rules

`HabitatConfig` owns repo root, harness root, `.habitat` root, cache roots,
vendor command policy, hook mode, CI/local mode, timeout policy, telemetry mode,
and host-policy source. Direct `process.env`, direct repo-root reconstruction,
and ambient cache/temp roots are allowed only in `src/config/**`, host adapters,
and provider live layers.

Direct live Node APIs are allowed only at acquisition/provider edges:

- process execution: `src/providers/command/**`;
- filesystem mutation/read: `src/providers/fs/**`, `src/resources/**`, and
  config acquisition;
- time: `src/providers/clock/**` and `src/resources/clock.ts`;
- temp/cache/locks/write sets: `src/resources/**`;
- vendor-specific stderr/stdout parsing: owning vendor provider only.

Migrated domain modules must not import `node:fs`, `node:child_process`, read
`process.env`, call `Date.now`/`new Date`, create temp dirs, or parse raw vendor
stderr.

## Domain Catalog

| Domain service | Target path | Owns | Consumes |
|---|---|---|---|
| `CommandContract` | `src/domains/command-contract/**` | command output schemas, v1 compatibility mapping, text/JSON rendering decisions | public schemas, reporter |
| `ProofContract` | `src/domains/proof-contract/**` | receipts, non-claims, bounded evidence, verification state language | Git/Nx providers, command observations |
| `RuleRegistry` | `src/domains/rule-registry/**` | registry schema, load/parse, rule facts, graph facts, registry expected failures | FileSystem, config |
| `RuleSelection` | `src/domains/rule-selection/**` | selector grammar, empty-intersection refusals, selected-rule state | RuleRegistry |
| `StructuralCheck` | `src/domains/structural-check/**` | check request planning, rule execution composition, report assembly | RuleRegistry, RuleSelection, BaselineAuthority, providers |
| `BaselineAuthority` | `src/domains/baseline-authority/**` | baseline state, shrink/growth policy, expansion decisions, integrity findings | GitProvider, FileSystem, RuleRegistry |
| `WorkspaceGraphIntegration` | `src/domains/workspace-graph-integration/**` | classify routing, target plan policy, project-path/diff state language | NxProvider, Workspace inventory facts |
| `DiagnosticPatternCatalog` | `src/domains/diagnostic-pattern-catalog/**` | diagnostic pattern identity, command/outcome model, catalog facts | GritProvider, RuleRegistry |
| `PatternGovernance` | `src/domains/pattern-governance/**` | manifest schema, apply safety, admission state, views, lifecycle | FileSystem, GritProvider, RuleRegistry |
| `TransformationTransaction` | `src/domains/transformation-transaction/**` | dry-run/apply transaction planning, rollback, worktree write-set record | GritProvider, GitProvider, FileSystem, ResourceScope |
| `LocalFeedback` | `src/domains/local-feedback/**` | pre-commit/pre-push policy, staged/unstaged/restage decisions, local-only non-claims | HuskyHookProvider, GitProvider, BiomeProvider, GritProvider, NxProvider |
| `ProtectedZoneAuthority` | `src/domains/protected-zone-authority/**` | protected path declarations, recovery decisions, scan-root guard output | FileSystem, Host policy config |
| `Scaffolding` | `src/domains/scaffolding/**` | project/pattern generator decisions, refusal model, authored-artifact fence | NxProvider, FileSystem, PatternGovernance |

## Identity Compatibility

New internals use separate identity fields:

- `domainAuthorityId`
- `providerId`
- `capabilityId`

`ownerTool` remains only where the public contract requires it, especially
`CheckReport` v1 and D0 package/command rows that already expose the field.
`CommandContract` owns the facade from the new identity model back to
`ownerTool`.

## Error Ownership

Expected failures must be typed as `HabitatError` variants and rendered only at
adapter/public-contract boundaries.

| Variant | Owner | Examples |
|---|---|---|
| `ConfigError` | `src/config/**` | missing repo root, invalid cache root, invalid hook mode |
| `CommandError` | `src/providers/command/**` | spawn failure, timeout, interrupted command, bounded output overflow |
| `FileSystemError` | `src/resources/**`, `src/providers/fs/**` | read/write/stat/json parse failure, protected path write refusal |
| `VendorError` | `src/providers/{git,grit,biome,nx,husky}/**` | vendor unavailable, unexpected reporter shape, graph unavailable |
| `DomainError` | `src/domains/**` | invalid selector, baseline growth refusal, malformed registry, graph dependency mismatch |
| `PublicContractError` | `src/domains/command-contract/**`, `src/public/**` | incompatible output change, unsupported contract version |
| `InvariantViolation` | owning domain/provider | impossible internal state after schema validation |

Implementation packets must not introduce generic `throw new Error` for any
expected user/tool/config/refusal state. Defects may still throw only where the
packet explicitly classifies them as impossible internal invariants.
