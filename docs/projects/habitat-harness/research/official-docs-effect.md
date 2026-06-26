# Official Effect Documentation Evidence Pack

Retrieval date: 2026-06-14. Source policy: official Effect documentation only for Effect claims. Local Habitat notes are marked separately and are not treated as Effect authority.

## Frame Carried Forward

- Selection: Effect constraints relevant to implementation-ready Habitat changesets: command/effect execution, error modeling, runtime boundaries, service/layer composition, resource safety, concurrency, testability, and safe CLI/codemod orchestration.
- Foreground: constraints that could change how Habitat should structure a slice if Effect is adopted. This is not a final architecture decision.
- Exterior: Effect marketing, examples outside official docs, blogs, package popularity, non-Effect oclif/Nx/Biome/Grit authority, and product/runtime Civ7 behavior.
- Hard core: Habitat remains a repo-local executable structural operating system for agents: classify before authoring, generate supported structure, enforce through owner layers, keep baselines shrink-only, provide safe transformations where appropriate, and keep records truthful to current behavior.
- Falsifier: if adopting Effect would replace Habitat's oclif command shell, weaken existing normalized diagnostics/baseline semantics, or turn wrappers into untyped Promise glue with no explicit error/runtime/service boundary, the Effect lane is not doing useful structural work.

## Sources

- Effect Installation: https://effect.website/docs/getting-started/installation/
- Creating Effects: https://effect.website/docs/getting-started/creating-effects/
- Expected Errors: https://effect.website/docs/error-management/expected-errors/
- Error Channel Operations: https://effect.website/docs/error-management/error-channel-operations/
- Data: https://effect.website/docs/data-types/data/
- Runtime: https://effect.website/docs/runtime/
- Managing Layers: https://effect.website/docs/requirements-management/layers/
- Resource Management Introduction: https://effect.website/docs/resource-management/introduction/
- Scope: https://effect.website/docs/resource-management/scope/
- Effect Platform Introduction: https://effect.website/docs/platform/introduction/
- Command: https://effect.website/docs/platform/command/
- Control Flow Operators: https://effect.website/docs/getting-started/control-flow/
- Basic Concurrency: https://effect.website/docs/concurrency/basic-concurrency/
- Fibers: https://effect.website/docs/concurrency/fibers/
- Queue: https://effect.website/docs/concurrency/queue/
- TestClock: https://effect.website/docs/testing/testclock/
- Code Style Guidelines: https://effect.website/docs/code-style/guidelines/

## Findings

- Verified: Effect programs carry three implementation-shaping types: success, error, and requirements. Official docs describe `Effect<Success, Error, Requirements>` and say the error type and required dependencies are captured by the `Effect` type. Habitat implication: any Effect adoption should make rule/check results, failure classes, and required services explicit in signatures instead of hiding them behind raw `Promise` or thrown errors. Sources: Expected Errors; Fibers.
- Verified: Effect creation APIs distinguish infallible delayed work from fallible work. `Effect.sync` is for synchronous work expected not to throw; thrown errors become defects. The async docs warn that plain `Promise<Value>` does not type errors, and docs expose `promise` versus `tryPromise` as separate constructors. Habitat implication: external tool calls, file IO, Grit/Nx/Biome process execution, and codemods are fallible and should use checked error channels, not `sync`/`promise` as if they cannot fail. Sources: Creating Effects.
- Verified: `Effect.runPromise`, `runSync`, and related runners are runtime-edge operations. Runtime docs state `Effect.runPromise` is an alias through the default runtime and that `runPromise`/`runSync` should be used at program edges. Habitat implication: do not scatter `Effect.run*` through rule libraries; keep execution at oclif command entrypoints, hook entrypoints, or a small adapter. Source: Runtime.
- Verified: `ManagedRuntime.make(layer)` converts a Layer into a runtime for services and must be disposed in the official example. Habitat implication: if Habitat builds long-lived services for command execution, filesystem, clock, telemetry, or repo context, the slice needs explicit runtime lifecycle ownership and disposal. Source: Runtime.
- Verified: Layers are the official dependency graph mechanism. Docs say Layers construct services, manage dependencies during construction, and keep service interfaces focused; `Effect.Service` can define dynamic, static, or scoped services with declared dependencies. Habitat implication: the five Habitat owner layers should not be mirrored blindly as Effect Layers, but Effect services are a good fit for injectable infrastructure such as `CommandRunner`, `FileSystem`, `Git`, `BaselineStore`, `Clock`, and `Reporter`. Source: Managing Layers.
- Verified: Effect docs support test substitution through Layers. The Layer docs show a test filesystem layer and `Effect.provide` removing environmental requirements. Habitat implication: implementation slices should introduce tests that provide fake command/filesystem/baseline services rather than touching the real repo or spawning real tools for unit tests. Source: Managing Layers.
- Verified: Resource management is a first-class constraint. Docs state resources should be released even when exceptions occur; `ensuring` runs finalizers on success, failure, or interruption; `acquireRelease` ties release to scope closure. Habitat implication: any Effect-based hook, codemod, temp workspace, process, or file-lock path needs scoped acquisition/release and interruption-safe cleanup. Sources: Resource Management Introduction; Scope.
- Verified: `@effect/platform` is the official cross-platform abstraction surface for Node, Deno, Bun, and browser layers; the docs list Command, FileSystem, Path, Runtime, and Terminal as stable modules. Habitat implication: repo-local Bun/Node CLI orchestration should prefer platform abstractions only where they reduce unsafe process/IO glue. Source: Effect Platform Introduction.
- Verified: `@effect/platform/Command` creates command objects with process name, args, and environment; docs show access to `exitCode`, `stdout`, and `stderr`, custom env, stdin, inherited stdout, and `NodeRuntime.runMain` with error handling, signal handling, and teardown. Habitat implication: if adopted, wrap `nx`, `biome`, `grit`, and `bun` invocations as data-rich command effects that preserve argv/env/cwd/stdout/stderr/exit code for truthful diagnostics. Source: Command.
- Verified: Effect composition defaults matter for Habitat rule orchestration. Docs show sequential composition by default, opt-in concurrent composition, bounded concurrency by numeric `concurrency`, short-circuiting for failing collections, and collection modes such as `either`/`validate` to gather failures. Habitat implication: rule execution must choose fail-fast versus collect-all deliberately: structural reports likely need collect-all diagnostics; destructive fix/codemod phases may need fail-fast. Sources: Control Flow Operators; Basic Concurrency.
- Verified: Fibers are lightweight concurrent units with interruption and auto-supervision, and queues provide back-pressure. Habitat implication: background checks or parallel rule execution should remain parent-scoped and bounded; do not introduce detached long-running fibers in hooks/CLI unless the lifecycle is explicit. Sources: Fibers; Queue.
- Verified: `TestClock` allows deterministic time in tests by advancing manually and running scheduled effects. Habitat implication: retries, polling, hook timeouts, process backoff, or debounce logic should be designed behind `Clock`/`TestClock` seams so tests do not sleep in real time. Source: TestClock.
- Verified: Effect error modeling supports structured errors. Data docs list `Error` and `TaggedError` constructors for custom error types and say tagged errors support structured handling; `catchTag` requires a readonly `_tag`. Habitat implication: normalized diagnostics should map from typed/tagged failures such as `ToolUnavailable`, `CommandFailed`, `BaselineExpanded`, `UnsafePartialStaging`, or `UnsupportedKind`, rather than string matching stderr. Sources: Data; Error Channel Operations.

## Implications For Habitat Changesets

- First slice, if any, should be an explicit adoption slice: add Effect dependencies, define an internal runtime adapter, and prove no change to existing CLI behavior. Current Habitat is oclif-based and has no `effect` dependency.
- Keep oclif as the command shell unless a separate decision changes that. Effect should live inside reusable libraries and entrypoint adapters, not as a new command framework.
- Define typed boundaries before porting behavior: `CommandRunner`, `RepoFileSystem`, `BaselineStore`, `GitState`, `Reporter`, and `Clock` are candidate services. Avoid wrapping existing Promise code without changing error/service/test boundaries.
- Model external tool execution as structured command effects: explicit argv/env/cwd, captured stdout/stderr/exit code, and typed failure. This directly supports truthful records and normalized JSON diagnostics.
- Preserve Habitat's current semantics while porting: classify-first output, owner-layer target guidance, shrink-only baselines, advisory versus enforced lanes, safe formatter restaging, and generated-zone rules remain Habitat/OpenSpec authority, not Effect authority.
- For rule orchestration, choose composition mode per phase: collect all diagnostics for `check`, fail closed for unsafe `fix`/codemod ambiguity, bound parallelism for expensive multi-tool checks, and keep spawned work parent-scoped.
- For tests, prefer service/layer injection and TestClock over real shell/process/sleep paths. Integration tests can still run real Habitat commands, but unit tests should not need the repo's actual Git/filesystem/process state.
- For resources, require scoped cleanup for temporary files, spawned processes, locks, runtime services, and codemod sandboxes. Failure and interruption paths need proof, not just success-path tests.

## Non-Applicable Areas

- Local applicability note: `tools/habitat/package.json` currently declares oclif/Nx dependencies and no `effect` or `@effect/platform` dependency; `rg` over `tools/habitat`, `docs/projects/habitat-harness`, root `package.json`, and the Habitat package found no Effect imports or dependency strings. Therefore official Effect docs are not directly descriptive of current Habitat implementation behavior; they are applicable only to future adoption/design work.
- Effect docs do not define Habitat's five owner layers, taxonomy, ratchet invariant, baseline expansion rules, or classify/generate workflow. Those remain governed by `docs/projects/habitat-harness/FRAME.md`, `taxonomy.md`, rule-pack code, and OpenSpec changes.
- Effect docs do not establish Grit/Biome/Nx safety semantics. They can shape orchestration wrappers, but they do not prove that a codemod is safe or that a baseline is shrink-only.
- Official docs surfaced `@effect/platform/Command` and platform runtime guidance, not a requirement to use `@effect/cli`. Do not infer a CLI framework migration from these sources.
- Effect's resource/concurrency/test primitives are useful only if Habitat introduces long-lived resources, process orchestration, retries, or service injection. Pure schema/data-only changes do not need Effect.

## Uncertainties

- Version pinning is unresolved. The official docs are current as retrieved, but a changeset must verify the exact `effect`, `@effect/platform`, and platform runtime versions available in the repo's Bun/Node environment.
- Documentation status has a minor ambiguity: the platform nav is grouped under "Platform Unstable", while the Platform Introduction page lists Command/FileSystem/Path/Runtime/Terminal as stable modules. Treat Command as officially documented and listed stable, but verify package release notes before committing critical infrastructure to it.
- Official docs do not answer whether `@effect/platform/Command` is a better fit than the repo's current hand-rolled process wrappers in every Habitat path. That requires a local spike against `bun run habitat check`, `fix`, and hook behavior.
- Current Habitat code does not use Effect, while other repo packages do. This pack did not audit those other packages except to avoid confusing their Effect usage with Habitat usage.
- No official Effect doc found in this pass defines Habitat-style codemod transactionality, dry-run reporting, or patch safety. Those properties must remain Habitat-specific invariants with local proof.

## Stop/Reframe Triggers

- Stop if an Effect changeset changes user-visible Habitat behavior before first proving parity against existing commands.
- Stop if Effect is used only as Promise wrapping without typed errors, services, runtime-edge discipline, or improved test seams.
- Stop if `Effect.run*` appears throughout rule implementations instead of at CLI/hook/framework boundaries.
- Stop if command orchestration loses stdout/stderr/exit-code fidelity, cwd/env provenance, or normalized diagnostic mapping.
- Stop if background fibers, spawned processes, temp files, or runtimes can outlive the command/hook scope without explicit cleanup.
- Reframe if adopting Effect requires replacing oclif, weakening the five-layer owner model, expanding baselines outside the rule-introduction gate, or turning Habitat into a generic framework rather than repo-local structural enforcement.
