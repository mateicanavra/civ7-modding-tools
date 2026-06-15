# Effect Official Docs Evidence Pack For Habitat Grit Adapter

Retrieval date: 2026-06-14.

## Objective

Decide, from verified or corroborated official-source evidence, whether Effect can simplify and strengthen the Habitat Harness command/Grit proof substrate without weakening the product outcome.

This is not a generic library endorsement. The question is whether Effect's documented capabilities should become an implementation dependency, design constraint, or non-blocking compatibility point for Habitat's Grit adapter and command runner.

## Frame

- **In scope:** Effect capabilities relevant to typed command execution, structured error/provenance capture, parser/schema discipline, resource boundaries around Grit apply/check, command proof records, service injection, cancellation/interruption, and tests.
- **Foreground:** official Effect documentation, exact source URLs, and how each documented capability maps to Habitat's current substrate needs.
- **Exterior:** Effect marketing, blogs, unofficial examples, package popularity, non-Effect alternatives, product/runtime Civ7 semantics, and claims that Effect itself proves Grit/Biome/Nx correctness.
- **Hard core:** Habitat remains a repo-local executable structural operating system for agents. Its product outcome is stable command behavior, truthful proof records, ratcheted structural enforcement, and safe remediation. Effect is acceptable only if it strengthens those properties without replacing Habitat's oclif command surface or weakening current parity gates.
- **Falsifier:** if adopting Effect changes Habitat command names/flags/exit codes/stdout/stderr/JSON shape before parity proof, hides Grit/Biome/Nx evidence behind opaque failures, or becomes Promise wrapping without typed errors/services/scopes, then Effect is not strengthening this substrate.

## Source Map

Official Effect documentation used:

- The Effect Type: https://effect.website/docs/getting-started/the-effect-type/
- Creating Effects: https://effect.website/docs/getting-started/creating-effects/
- Using Generators: https://effect.website/docs/getting-started/using-generators/
- Expected Errors: https://effect.website/docs/error-management/expected-errors/
- Error Channel Operations: https://effect.website/docs/error-management/error-channel-operations/
- Data: https://effect.website/docs/data-types/data/
- Runtime: https://effect.website/docs/runtime/
- Managing Layers: https://effect.website/docs/requirements-management/layers/
- Resource Management Introduction: https://effect.website/docs/resource-management/introduction/
- Scope: https://effect.website/docs/resource-management/scope/
- Effect Platform Introduction: https://effect.website/docs/platform/introduction/
- Command: https://effect.website/docs/platform/command/
- Schema Introduction: https://effect.website/docs/schema/introduction/
- Schema Getting Started: https://effect.website/docs/schema/getting-started/
- Configuration: https://effect.website/docs/configuration/
- Basic Concurrency: https://effect.website/docs/concurrency/basic-concurrency/
- Fibers: https://effect.website/docs/concurrency/fibers/
- TestClock: https://effect.website/docs/testing/testclock/

Local Habitat context read as repository evidence, not Effect authority:

- `agent-F-habitat-effect-core:docs/projects/habitat-harness/FRAME.md`
- `agent-F-habitat-effect-core:openspec/changes/habitat-effect-native-core/design.md`
- `agent-F-habitat-effect-core:openspec/changes/habitat-effect-native-core/workstream/frame.md`
- `agent-F-habitat-effect-core:openspec/changes/habitat-effect-native-core/specs/habitat-effect-runtime-substrate/spec.md`
- `agent-F-habitat-effect-core:openspec/changes/habitat-effect-native-core/specs/habitat-effect-command-programs/spec.md`
- `agent-F-habitat-effect-core:openspec/changes/habitat-grit-catalog/design.md`
- `agent-F-habitat-effect-core:tools/habitat-harness/src/lib/{grit,spawn,command-engine,baseline,hooks,generated-zones,diagnostics}.ts`

## Findings With Provenance

- **Verified: Effect values carry success, error, and requirement types.** The official `Effect<Success, Error, Requirements>` type captures successful result, expected error, and contextual dependency requirements, and Effect values model synchronous, asynchronous, concurrent, and resourceful computations. (source: https://effect.website/docs/getting-started/the-effect-type/, retrieved 2026-06-14)

- **Verified: Effect execution belongs at runtime/program edges.** Runtime docs describe Effect programs as descriptions that require a runtime to execute; `Runtime.runPromise` is explicitly effectful and "should only be used at the edges of your program." (source: https://effect.website/docs/runtime/, retrieved 2026-06-14)

- **Verified: expected errors are tracked in the error channel.** The Expected Errors docs show `Effect.fail` and state that Effect keeps possible errors as a union in the program type. The Data docs document `Data.TaggedError`, which adds `_tag` fields for structured handling with `catchTag`/`catchTags`. (sources: https://effect.website/docs/error-management/expected-errors/, https://effect.website/docs/data-types/data/, https://effect.website/docs/error-management/error-channel-operations/, retrieved 2026-06-14)

- **Verified: `Effect.gen` is official workflow composition, not just syntax sugar.** The docs say `Effect.gen` lets code look synchronous while handling asynchronous tasks, errors, and complex control flow with explicit `yield*` over effects. (source: https://effect.website/docs/getting-started/using-generators/, retrieved 2026-06-14)

- **Verified: Effect distinguishes non-failing synchronous work from fallible work.** `Effect.sync` is for operations you are sure will not fail; thrown errors become defects. The Creating Effects docs also separate fallible constructors such as `try`/`tryPromise`. (source: https://effect.website/docs/getting-started/creating-effects/, retrieved 2026-06-14)

- **Verified: resource finalization is first-class and interruption-aware.** Resource docs state `Effect.ensuring` runs a finalizer on success, failure, or interruption. Scope docs document scopes/finalizers and `acquireRelease` patterns for scoped resource lifetimes. (sources: https://effect.website/docs/resource-management/introduction/, https://effect.website/docs/resource-management/scope/, retrieved 2026-06-14)

- **Verified: `@effect/platform` officially documents command execution primitives.** Platform introduction says `@effect/platform` provides platform-independent abstractions for Node.js, Deno, Bun, and browsers, and lists `Command`, `FileSystem`, `Path`, `Runtime`, and `Terminal` as stable modules. Command docs show `Command.make`, command output as strings or exit codes, custom environment variables, inherited stdout, and Node/Bun/Deno platform layers. (sources: https://effect.website/docs/platform/introduction/, https://effect.website/docs/platform/command/, retrieved 2026-06-14)

- **Verified: Schema is an official parse/validation layer.** Schema docs describe `effect/Schema` as defining schemas that validate and transform data in TypeScript, including decoding, encoding, asserting, JSON Schema generation, and `ParseError` returns for decode/encode failures. (sources: https://effect.website/docs/schema/introduction/, https://effect.website/docs/schema/getting-started/, retrieved 2026-06-14)

- **Verified: Config/Context/Layers are official dependency and configuration primitives.** The Effect type's `Requirements` are stored in `Context`; Layer docs show service tags, `Layer.succeed`, `Effect.Service`, `Effect.provideService`, and service construction with declared dependencies. Configuration docs show typed config composition, defaults/fallbacks, sensitive values, and test config providers. (sources: https://effect.website/docs/getting-started/the-effect-type/, https://effect.website/docs/requirements-management/layers/, https://effect.website/docs/configuration/, retrieved 2026-06-14)

- **Verified: cancellation/interruption and child-fiber lifetime are documented.** Runtime docs state default runtime flags include interruption. Basic Concurrency and Fibers docs describe `interrupt`, `onInterrupt`, interruption of concurrent effects, and auto-supervision where child fibers attached to the parent scope terminate with the parent. (sources: https://effect.website/docs/runtime/, https://effect.website/docs/concurrency/basic-concurrency/, https://effect.website/docs/concurrency/fibers/, retrieved 2026-06-14)

- **Verified: testing support includes controllable time and injectable services.** TestClock docs state tests can control time with `TestClock.adjust`/`setTime` so scheduled effects run without waiting for real time. Layer docs show replacing service implementations with `provideService` or test layers. (sources: https://effect.website/docs/testing/testclock/, https://effect.website/docs/requirements-management/layers/, retrieved 2026-06-14)

## Plausible Application To Habitat

These are applications inferred from official capabilities plus local Habitat design/code. They are not official Effect claims.

- **Typed errors:** Habitat can model command-infrastructure failures as tagged errors: `ToolUnavailable`, `ToolJsonParseFailed`, `BaselineMalformed`, `UnsafePartialStaging`, `GritApplyFailed`, `GeneratedZoneRestoreFailed`, and `InternalReportSchemaViolation`. Rule violations should remain report data, not fatal Effect errors, unless the command cannot produce a valid report.

- **`Effect.gen`:** Habitat's `check`, `fix`, `graph`, hook, and generated-zone flows have multi-step orchestration with fallible tool calls, parse boundaries, temp dirs, and output rendering. `Effect.gen` can make those workflows linear while preserving typed errors and service requirements.

- **Scope/resource safety:** Habitat's current branch code has manual cleanup paths for graph temp directories, Grit cache dirs, formatter restaging, generated-zone snapshots, and hook subprocesses. Effect scopes/finalizers fit the requirement that cleanup complete even on failure/interruption. This is especially relevant before expanding Grit apply or introducing async subprocess handling.

- **Process/command execution:** `@effect/platform/Command` can represent `grit`, `biome`, `nx`, `git`, and `bun` invocations as command values with explicit process name, args, environment, output, and exit data. That directly supports truthful command proof records. Habitat still has to own cwd policy, parse Grit JSON, and derive failure from findings because local Grit evidence says raw `grit check` can exit 0 with findings.

- **Schema:** Grit JSON, Habitat `CheckReport`, classify diff results, baseline files, and generated-zone definitions are parsing boundaries. Effect Schema can replace ad hoc JSON parse/shape checks where the boundary is reused or safety-critical. It is not necessary for pure internal TypeScript types that already have stable tests.

- **Config/Context/Layers:** Habitat service interfaces map cleanly to layers: workspace paths, process runner, Git, Grit, Biome, Nx, baseline store, rule registry, hook runner, generated-zone verifier, and clock. This improves unit tests by substituting fake services without touching the real repo, Git index, or subprocesses.

- **Cancellation/interruption:** If command execution becomes asynchronous, cancellation has product value only if it also preserves proof truth: child processes/fibers must be parent-scoped, finalizers must run, and command output must not claim success after an interrupted or partially applied operation.

- **Testing:** Fake layers and `TestClock` can remove sleeps and real subprocess dependence from unit tests for retry/backoff/debounce/timeouts. Native Grit pattern tests and end-to-end command parity tests should remain as integration proof.

## Risks And Costs

- **Added abstraction:** Effect adds a runtime, fiber, scope, service/layer, and typed-error model. If used only to wrap existing Promises or `spawnSync`, it increases complexity without improving proof quality.

- **Dependency footprint:** A real adoption likely adds at least `effect`, `@effect/platform`, and a platform package such as `@effect/platform-node` or `@effect/platform-bun`. Official docs show platform support, but exact package versions, peer resolution, and repo Bun/Node behavior still need in-repo proof.

- **Learning curve:** `Effect.gen`, error channels, scoped resources, and Layer wiring require team/agent discipline. The risk is scattering `Effect.run*` or losing the oclif adapter boundary.

- **CLI mismatch risk:** Habitat's command contract depends on deterministic stdout/stderr placement, JSON shape, and exit codes. Effect runtime helpers or platform command streaming can accidentally move output timing or failure representation unless the oclif adapter remains responsible for final rendering.

- **Grit support gap:** Official Effect docs do not provide a Grit adapter, Grit JSON schema, codemod transaction semantics, or proof that Grit apply is safe. Those remain Habitat-specific invariants and tests.

- **Process concurrency risk:** Effect makes concurrency easier, but Habitat's Grit/Biome/Nx/Git surfaces are not automatically safe for fan-out. Bounded concurrency must be an explicit design choice after parity, not a default refactor side effect.

- **Schema normalization risk:** Effect Schema parse errors are useful, but Habitat's external JSON/proof records must stay stable and user-facing. Raw `ParseError` output should be normalized into Habitat diagnostics or typed command failures.

- **Platform documentation nuance:** The docs navigation groups platform pages under "Platform Unstable", while the Platform Introduction page lists Command/FileSystem/Path/Runtime/Terminal as stable modules. Treat Command as officially documented and stable-listed, but verify package release notes and exact versions before making it critical infrastructure.

## Constraints / Invariants To Encode

- Do not make Effect a product acceptance gate. Habitat's product outcome is command/proof correctness; Effect is a substrate mechanism that must prove parity.

- Keep oclif as the command shell. Effect programs live below command adapters; adapters own flag parsing, final stdout/stderr, `--output`, and exit-code mapping.

- Keep `Effect.run*` at host boundaries: oclif command classes, hook entrypoints, Nx generator/migration factories, or one small Habitat runtime bridge. Core libraries return `Effect` values or pure results.

- Separate rule findings from infrastructure failures. Findings are `CheckReport` data; infrastructure failures are typed Effect errors.

- Use argument-array command execution only. No shell interpolation. Preserve argv, cwd, env, stdout, stderr, exit code, and parse/projection provenance in proof records.

- Use scopes/finalizers for temp dirs, cache locks, generated-zone snapshots/restores, async child processes, background fibers, and any Grit apply transaction boundary.

- Preserve existing Grit adapter semantics: one native JSON scan per check process, `--level error`, cache/env policy, JSON parse from stdout or stderr, projection by `local_name` or `check_id`, and derived pass/fail from findings rather than raw exit code.

- Adopt Schema only at real external boundaries, not as a blanket rewrite of plain internal types.

- Unit-test service logic with fake layers; retain native Grit pattern tests and command parity integration tests.

## Open Questions / Uncertainties

- **Exact dependency set:** official docs prove capabilities, not the exact package versions to use in this repo. Fast verification: in the Habitat worktree, add candidate versions with Bun, inspect peer output, and prove dev plus built oclif commands execute.

- **Platform package choice:** docs support Node/Deno/Bun platform layers. Habitat's built oclif runner is Node-oriented while local scripts run through Bun. Fast verification: run the same minimal command/file/path program under Bun dev and built Node invocation.

- **Command parity:** official docs do not prove stdout/stderr/exit-code parity against current `spawnSync`. Fast verification: golden parity tests for `check --json`, `fix --dry-run`, `graph --json`, hook pre-commit/pre-push, and Grit parse-failure cases.

- **Grit apply transactionality:** Effect Scope can clean up resources, but Grit itself is not documented by Effect. Fast verification: local transactional wrapper tests with dry-run, successful apply+format, apply failure, format failure, and restore/dirty-worktree proof.

- **Schema ergonomics:** Effect Schema can parse, but raw parse errors may not match Habitat's JSON contract. Fast verification: convert one Grit report parser behind a compatibility adapter and compare diagnostics.

## Decision Table

| Capability | Confirmed official capability | Habitat decision | Rationale |
|---|---|---|---|
| Typed errors / tagged failures | `Effect` has an expected error channel; docs show unions of expected errors; `Data.TaggedError` supports tagged structured errors and `catchTag` handling. | **Adopt in this workstream** | Directly strengthens command failures, provenance, and adapter-level exit-code mapping. Keep rule violations as data. |
| `Effect.gen` workflow composition | Official docs describe generator-based composition for async tasks, errors, and control flow. | **Adopt in this workstream** | Fits multi-step command/Grit orchestration while preserving typed failures and service dependencies. Avoid in tiny pure functions. |
| Scope / resource safety | Docs support finalizers on success/failure/interruption and scoped acquire/release. | **Adopt in this workstream** | Load-bearing for temp dirs, Grit apply boundaries, generated-zone restore, cache locks, child processes, and hook cleanup. |
| Process / command execution | `@effect/platform` officially documents stable `Command` and platform layers for Node/Deno/Bun/browser environments. | **Adopt in this workstream, behind `HabitatProcess`, after parity proof** | Strong fit for truthful argv/env/stdout/stderr/exit records. Habitat must preserve cwd policy and CLI output behavior. |
| Schema parsing / validation | `effect/Schema` supports decoding, encoding, asserting, JSON Schema, and `ParseError` boundaries. | **Design-compatible but not required** | Useful for Grit JSON/report/baseline boundaries, but not necessary for first adoption if manual validators are stable. Adopt boundary-by-boundary. |
| Context / Layers / service injection | Docs show Context requirements, service tags, `Layer.succeed`, `Effect.Service`, `provideService`, and layer-managed dependencies. | **Adopt in this workstream** | Matches Habitat's need for fakeable Git/FS/process/Grit/Biome/Nx/baseline services and runtime-bound infrastructure. |
| Config | Docs support typed config composition, defaults, fallback, sensitive values, and mocked providers. | **Design-compatible but not required** | Habitat has limited config needs today. Use when env/tool policy becomes shared service config; do not force it into static rule data. |
| Cancellation / interruption | Runtime and concurrency docs cover interruption, `onInterrupt`, and auto-supervised child fibers. | **Adopt in this workstream as a quality gate for async/scoped work** | Needed if command runner introduces async processes/fibers. Not a product feature unless cleanup/proof semantics are preserved. |
| Testing: fake layers | Layer docs show service substitution with `provideService` and test implementations. | **Adopt in this workstream** | Directly improves command runner/Grit adapter tests without real Git/process/filesystem side effects. |
| Testing: `TestClock` | TestClock docs allow manual time control for sleeps/timeouts/schedules. | **Design-compatible but not required** | Adopt only where retries, polling, debounce, timeout, or backoff is introduced. |

## Synthesis

Official Effect documentation confirms native support for the substrate problems Habitat is trying to repair: typed error channels, effectful workflow composition, scoped resources/finalizers, services/layers, platform command execution, schema parsing, cancellation/interruption, and test seams.

The evidence supports **narrow adoption for the Habitat command runner and Grit adapter substrate**, especially for typed errors, service/layer boundaries, scoped resources, and command execution provenance. It does **not** support treating Effect as a product-outcome blocker: official docs do not prove Grit safety, Habitat command parity, baseline shrink-only behavior, or codemod transactionality. Those remain local Habitat invariants requiring parity tests and proof records.

Recommended decision: adopt Effect as an implementation dependency for the Effect-native Habitat core workstream only if the first slice proves dependency installation, dev/built command execution, and no behavior change. Do not block Habitat's product outcome on Effect; block only on the substrate parity gates the workstream declares.

## Suggested Next Edits

- file: `openspec/changes/habitat-effect-native-core/workstream/phase-record.md` -> change: add this note as the official-doc evidence input for Effect capability claims.
- file: `openspec/changes/habitat-effect-native-core/specs/habitat-effect-runtime-substrate/spec.md` -> change: require the runtime bridge to keep `Effect.run*` at adapter boundaries and dispose scoped resources before command completion.
- file: `openspec/changes/habitat-effect-native-core/specs/habitat-effect-process-baselines/spec.md` -> change: require command proof records to preserve argv/env/cwd/stdout/stderr/exit code plus parse/projection provenance.
- file: `openspec/changes/habitat-effect-native-core/specs/habitat-effect-check-orchestration/spec.md` -> change: require Grit JSON parser parity before replacing the existing parser with Effect Schema or typed parser effects.
- file: `tools/habitat-harness/test/**` -> change: add fake-layer parity tests before migrating live command paths.
