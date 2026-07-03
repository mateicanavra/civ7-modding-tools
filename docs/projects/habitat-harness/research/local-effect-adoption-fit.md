# Local Effect Adoption Fit Evidence Pack

Status: local evidence pack for Habitat Harness repair design.
Date: 2026-06-14.
Scope: current Habitat code and command behavior in this worktree, plus the local official-docs Effect pack at `docs/projects/habitat-harness/research/official-docs-effect.md`.

This is not a final architecture decision and does not approve implementation. Current Habitat code and current command behavior are the local evidence authority. Official Effect docs are used only to map possible capabilities.

## Frame Carried Forward

Habitat's target product is a repo-local executable structural operating system for agents: classify before authoring, generate supported structure, enforce through owner layers, keep baselines shrink-only, provide safe structural transformations where appropriate, and keep records truthful to current behavior. The active DRA takeover frame states this product outcome directly at `docs/projects/habitat-harness/dra-takeover-frame.md:42-54` and diagnoses the product miss as a system closer to "read, enforce, scaffold, and one codemod" than a broader architecture-derived transformation catalog at `docs/projects/habitat-harness/dra-takeover-frame.md:61-66`.

The original hard core still applies: Habitat is enforcement-only, concerns live in one owner layer, baselines shrink only, taxonomy is derived and revisable, and CI is authoritative over hooks (`docs/projects/habitat-harness/FRAME.md:74-93`). The recovery frame adds that current proof beats stale records and codemods require mechanical, fixture-proven, reversible safety (`docs/projects/habitat-harness/dra-takeover-frame.md:119-132`).

Effect is in scope only as a possible implementation substrate for repair design. The local official-docs pack says Effect can make success, error, and requirements visible in types, can keep runtime execution at edges, can model services through Layers, can scope resources, can represent platform commands with argv/env/cwd/stdout/stderr/exit code, can choose collect-all versus fail-fast composition, and can model structured tagged errors (`docs/projects/habitat-harness/research/official-docs-effect.md:35-47`). It also warns that Habitat currently has no Effect dependency and that Effect docs do not define Habitat owner layers, Grit/Biome/Nx safety semantics, baselines, or classify/generate workflow (`docs/projects/habitat-harness/research/official-docs-effect.md:62-66`).

Current command probes run in this worktree on 2026-06-14 reproduced the Stage 0 gaps:

- `bun run habitat -- --help` exited 2 with `Unknown habitat command: --help`.
- `bun run habitat -- check --help` exited 2 without command help.
- `bun run habitat:check -- --json --rule definitely-not-a-rule` exited 0 with only `baseline-integrity`.
- `bun run habitat:check -- --json --tool definitely-not-a-tool` exited 0 with only `baseline-integrity`.
- `bun run habitat:check -- --json --rule grit-check` exited 0 with only `baseline-integrity`.
- `bun run habitat:check -- --json --tool grit-check` exited 0 with 22 Grit rules plus `baseline-integrity`.
- `bun tools/habitat/src/bin/habitat.ts --help` and `bun tools/habitat/src/bin/habitat.ts check --help` exited 0 with oclif help.
- `bun run --cwd tools/habitat test habitat-commands.test.ts` passed 8 mocked command-class tests.

These probes align with the active recovery claim ledger seed at `docs/projects/habitat-harness/recovery-claim-ledger.md:15-24` and with the known contradictions in `docs/projects/habitat-harness/dra-takeover-frame.md:177-196`.

## Current Manual-System Diagnosis

**Command surface and help.** Root scripts route Habitat through `tools/habitat/bin/dev.ts` (`package.json:75-78`). That file builds a manual command map and treats the first argv token as a command name (`tools/habitat/bin/dev.ts:13-22`), then exits 2 for unknown command names (`tools/habitat/bin/dev.ts:24-28`) and invokes individual command classes with `Command.run` (`tools/habitat/bin/dev.ts:30-41`). The source oclif shim is a real oclif entrypoint (`tools/habitat/src/bin/habitat.ts:3-5`) and direct invocation renders help, so the failure is not oclif as a concept; it is the manual dev/root dispatch path. Effect would not automatically fix this. The local fit is indirect: typed command boundary design could make "help dispatch", "unknown command", and "command execution" separate outcomes, but a small oclif runner repair may be simpler.

**False-green rule and tool filters.** `selectRules` filters the rule array by owner, rule, and tool and returns the result without validating that a requested selector matched anything (`tools/habitat/src/lib/command-engine.ts:65-70`). `createCheckReport` then appends the built-in `baseline-integrity` report regardless of whether any requested rules were selected (`tools/habitat/src/lib/command-engine.ts:78-139`, especially `tools/habitat/src/lib/command-engine.ts:111-131`) and sets `ok` from whether any report status is `fail` (`tools/habitat/src/lib/command-engine.ts:133-138`). This structurally causes the observed false-green: invalid `--rule`/`--tool` selections can pass by selecting no real rules and one passing built-in. This is a strong Effect-fit area because it is naturally a typed validation failure before report construction, but it can also be repaired manually if the design adds explicit selector result types and tests.

**Check orchestration centralization.** `createCheckReport` currently performs rule selection, timing, baseline loading, rule execution, baseline application, status derivation, baseline integrity, command string assembly, timestamping, and final report assembly in one function (`tools/habitat/src/lib/command-engine.ts:78-139`). This makes ownership boundaries implicit and makes it easy for "report is green" to hide "selection was invalid" or "baseline comparison could not run". Effect Layers could separate `RuleRegistry`, `RuleRunner`, `BaselineStore`, `Git`, `Clock`, and `Reporter`, but the proof requirement is boundary clarity, not Effect syntax.

**Manual process execution.** The shared process wrapper returns only `{ exitCode, stdout, stderr }` (`tools/habitat/src/lib/spawn.ts:5-9`). It invokes `spawnSync` with local PATH injection (`tools/habitat/src/lib/spawn.ts:15-29`) and collapses spawn errors into exit 127 (`tools/habitat/src/lib/spawn.ts:30-34`). The result does not carry argv, cwd, env delta, signal, duration, tool-missing class, timeout class, or parse/proof label. That weakens diagnostics and stale-record repair because downstream code must infer what happened from strings and conventions. This maps closely to the official Effect command evidence: if adopted, `@effect/platform/Command` should preserve argv/env/cwd/stdout/stderr/exit code as command data, not merely wrap this result (`docs/projects/habitat-harness/research/official-docs-effect.md:42-43`).

**Wrapped-rule diagnostics are coarse.** Non-Grit and non-file-layer rules run their `detect` argv and become either no diagnostics on exit 0 or a single whole-rule diagnostic with the tail of stdout/stderr (`tools/habitat/src/rules/architecture.ts:45-57`, `tools/habitat/src/rules/architecture.ts:104-112`). The adapter-boundary parser has custom text parsing and falls back to coarse only when a failing script produced no unbaselined diagnostics (`tools/habitat/src/rules/architecture.ts:60-96`). This preserves "failures never vanish" in some cases, but failure classes remain weak: unavailable script, malformed output, policy violation, and parser mismatch are not distinct.

**Grit check adapter.** The Grit adapter correctly accounts for a known local behavior: `grit check --json` may report findings while exiting 0, so Habitat projects the shared JSON report into rule diagnostics (`tools/habitat/src/lib/grit.ts:49-51`). It runs one cached Grit report (`tools/habitat/src/lib/grit.ts:118-133`) and filters results per pattern (`tools/habitat/src/lib/grit.ts:69-83`). However, JSON parsing is a substring heuristic with silent catch-and-continue behavior (`tools/habitat/src/lib/grit.ts:155-169`), and an unparseable report becomes one diagnostic carrying output tail (`tools/habitat/src/lib/grit.ts:54-66`). That is pragmatic, but it does not distinguish no JSON, wrapper noise, schema drift, missing pattern, empty scan roots, or command failure. Effect fits if it models Grit report acquisition, parse, scan-root provenance, pattern projection, and diagnostic projection as separate typed steps with collect-all evidence.

**Grit apply and safe transforms.** Habitat currently has exactly one allowlisted apply pattern in code (`tools/habitat/src/lib/grit.ts:35`) and `runGritApplyPatterns` loops it with `grit apply`, `--force`, compact output, optional `--dry-run`, and a shared cache env (`tools/habitat/src/lib/grit.ts:86-115`). `runFix` runs that Grit apply path first, then Biome check or write depending on dry-run (`tools/habitat/src/lib/command-engine.ts:173-183`). The code does not model clean-worktree preconditions, diff capture, rollback boundary, no-write proof, target-export existence, or typecheck proof. Effect resource scopes could help with transactional proof if codemods expand, but Effect cannot make a Grit transform safe by itself.

**Biome/Nx orchestration.** Biome is invoked through `runFix` as a sequential command after Grit (`tools/habitat/src/lib/command-engine.ts:173-183`). Nx affected verification is one command result (`tools/habitat/src/lib/command-engine.ts:189-202`), and the Nx plugin infers targets with static command strings (`tools/habitat/src/plugin.js:25-179`). A fresh `nx show project @habitat/cli --json` showed these inferred targets exist for the harness project, including `grit:check`, `biome:*`, `boundaries`, `generated:check`, and `habitat:check`. Effect may harden command provenance, but Nx target existence and graph semantics must remain proven through Nx output, not Effect.

**Baseline handling.** Baseline comments define the ratchet model, including missing file equals empty baseline and locked rule semantics (`tools/habitat/src/lib/baseline.ts:7-19`). `loadBaseline` implements missing file as `new Set()` and throws generic `Error` for non-array JSON (`tools/habitat/src/lib/baseline.ts:25-30`). Baseline expansion writes sorted JSON directly (`tools/habitat/src/lib/baseline.ts:44-47`). Integrity compares against a merge-base and returns no findings when no merge-base is available (`tools/habitat/src/lib/baseline.ts:76-80`), then detects additions and new-rule exceptions through JSON and string inclusion (`tools/habitat/src/lib/baseline.ts:85-100`). Current live baseline files are only `tools/habitat/baselines/adapter-boundary.json:1-3`. The structural gap is not just code style: policy states, missing baseline semantics, malformed baseline, missing merge-base, and new-rule exception are distinct proof claims but are represented as comments, booleans, generic throws, and empty arrays.

**Hooks and side effects.** Husky delegates pre-commit and pre-push to Habitat (`.husky/pre-commit:1`, `.husky/pre-push:1`). In pre-commit, Habitat runs `scripts/civ7-resources/publish-submodule.sh` before collecting staged paths or running staged checks (`tools/habitat/src/lib/hooks.ts:58-69`). It then runs a staged file-layer Habitat check (`tools/habitat/src/lib/hooks.ts:71-85`), refuses partially staged Biome-supported files (`tools/habitat/src/lib/hooks.ts:87-104`), hashes files, formats, restages touched files only (`tools/habitat/src/lib/hooks.ts:106-123`), runs Biome check (`tools/habitat/src/lib/hooks.ts:128-133`), and runs Grit over staged TS/JS paths with its own JSON parse heuristic (`tools/habitat/src/lib/hooks.ts:138-160`). Pre-push chooses a Graphite parent when available and otherwise falls back to merge-base (`tools/habitat/src/lib/hooks.ts:169-202`). This is a high-fit area for resource and side-effect scoping: the current design is disciplined but manually sequenced, and the resource-publish side effect is intentionally contentious in the recovery frame (`docs/projects/habitat-harness/dra-takeover-frame.md:189-190`).

**Diagnostics and errors.** Normalized diagnostics are currently `{ ruleId, path, line?, message, severity, baselined }` (`tools/habitat/src/lib/diagnostics.ts:1-17`), and rule status is only `pass`, `fail`, or `advisory-findings` (`tools/habitat/src/lib/diagnostics.ts:19`). Schema validation checks shape, not failure class or cause (`tools/habitat/src/lib/diagnostics.ts:44-66`). This is enough for current CheckReport shape, but weak for repair design because "tool unavailable", "selector invalid", "baseline policy conflict", "parse failed", and "rule found violation" all have to be encoded as messages or separate ad hoc control paths.

**Tests.** The oclif command tests mock the entire command engine (`tools/habitat/test/commands/habitat-commands.test.ts:11-28`) and therefore prove flag plumbing, not actual root/dev/prod entrypoints. They passed locally, while root help and subcommand help failed. The Grit pattern test runs native `grit patterns test --json` through `spawnSync` and checks outcomes/samples (`tools/habitat/test/grit/grit-patterns.test.ts:29-55`), which is good for pattern fixture syntax but does not by itself prove current-tree scan roots, Habitat baseline semantics, or apply safety. The classify test covers representative paths and required target strings (`tools/habitat/test/lib/classify.test.ts:5-38`) while `projectTargets` constructs target names statically (`tools/habitat/src/lib/command-engine.ts:278-293`), so target-existence proof still has to come from Nx.

**System dynamics.** The dominant reinforcing failure loop is: stale closure record says green, command or selector behavior is trusted, invalid or under-proven commands pass, and future agents use that green state as proof. The recovery reference names this false-confidence loop, bypass loop, stale-authority loop, duplicate-enforcement drift loop, baseline-ratchet confidence loop, and hook side-effect loop at `docs/projects/habitat-harness/adversarial-audit-recovery-reference.md:114-123`. Current manual code participates in those loops where it collapses failure classes into strings/exit codes, centralizes selection and report construction, and lets old command tests miss real entrypoint behavior.

## Effect-Fit Opportunities

**Typed selector and policy failures.** The strongest local fit is not "Effect everywhere"; it is making pre-check validation failures unrepresentable as green reports. Candidate typed failures include `UnknownRule`, `UnknownTool`, `UnknownOwner`, `NoRulesSelectedForRequestedFilter`, `BaselineMalformed`, `BaselineExpansionRejected`, and `MergeBaseUnavailable`. Effect's typed error channel and tagged errors are directly relevant per the official pack (`docs/projects/habitat-harness/research/official-docs-effect.md:35-36`, `docs/projects/habitat-harness/research/official-docs-effect.md:47`).

**Command runner with proof provenance.** Habitat repeatedly invokes `git`, `grit`, `biome`, `nx`, `bun`, `eslint`, and shell scripts. An Effect-based `CommandRunner` backed by `@effect/platform/Command` could make argv, cwd, selected env, stdout, stderr, exit code, duration, and typed failure available to reports and records. This would address current `SpawnResult` weakness without changing oclif as the outer command shell.

**Service injection for tests.** Effect Layers could let tests execute real command/report paths while substituting fake Git, filesystem, command runner, clock, baseline store, and reporter services. That directly targets the current test gap where command tests mock the command engine and miss `bin/dev.ts` root behavior (`tools/habitat/test/commands/habitat-commands.test.ts:11-28`).

**Resource scopes for mutation and cleanup.** Current `runGraph` manually creates and removes a temp directory in `finally` (`tools/habitat/src/lib/command-engine.ts:205-219`), and hooks/codemods have broader mutation concerns. Effect resource scopes and finalizers fit temporary dirs, Grit cache lifetimes, file locks, dry-run sandboxes, spawned processes, applied-diff capture, and hook publish decisions. This is useful where cleanup and interruption behavior matter, not for static schema/data-only checks.

**Explicit orchestration modes.** `check` wants collect-all diagnostics; `fix`, codemods, and unsafe hook mutations generally need fail-closed sequencing. Official Effect docs support deliberate collection/concurrency modes (`docs/projects/habitat-harness/research/official-docs-effect.md:44-45`). That maps to Habitat if a design labels which phases collect all failures and which stop on first unsafe condition.

**Grit adapter hardening.** Effect can help split Grit execution into typed phases: command run, JSON parse, schema validation, scan-root proof, pattern projection, empty-result policy, baseline application, and diagnostic rendering. It should not replace native Grit samples or invent Grit safety. Its value is in preserving local proof classes and preventing parse/scan/pattern mismatches from becoming vague tail-output messages.

**Hook transaction design.** Pre-commit currently mixes resource publishing, staged file discovery, file-layer checks, partial-staging refusal, formatting, restaging, Biome check, and Grit check. Effect fits if the repair design wants a typed state machine for staged files and side effects, with explicit ordering and cleanup. It does not decide whether `publish-submodule.sh` belongs in pre-commit; it can only make the decision enforceable and testable.

**Repo-local adoption precedent.** Effect is already present elsewhere in the repo: `packages/civ7-control-orpc/package.json:62-63`, `apps/mapgen-studio/package.json:109-110`, `packages/studio-server/package.json:45-46`, and `packages/cli/package.json:46`. Habitat itself does not depend on Effect (`tools/habitat/package.json:48-52`). Adoption would be new to Habitat but not alien to the workspace.

## Effect Non-Fit/Risks

**Oclif help repair may not need Effect.** Direct `src/bin/habitat.ts` help works while root `bin/dev.ts` help fails. That suggests a targeted command-entrypoint repair may be enough for P0 command help. Effect should not be used as a broad rewrite to avoid fixing the actual dispatcher.

**Effect is not authority for Habitat semantics.** Effect docs do not define GritQL matching, Biome safe writes, Nx graph truth, baseline shrink policy, owner layers, classify target correctness, or codemod safety. The official-docs pack explicitly marks these as non-applicable (`docs/projects/habitat-harness/research/official-docs-effect.md:62-66`). Any adoption design that claims those semantics from Effect is overclaiming.

**Migration theater risk.** A large Effect rewrite could reproduce the current failure dynamic: impressive infrastructure, stale records, and unproven product movement. The repair target is truthful executable structure, not a new abstraction.

**Wrapper-without-value risk.** If Habitat simply wraps existing sync process calls and generic thrown errors in `Effect.sync` or `Effect.promise`, it would preserve untyped failure classes while adding cognitive load. The official pack warns fallible work should use checked error channels and that runtime execution belongs at program edges (`docs/projects/habitat-harness/research/official-docs-effect.md:36-38`).

**Dependency/version risk.** Habitat has no Effect dependency today. Other packages use `effect` 3.21.x, but an adoption slice still needs a Habitat package dependency decision, exact version pinning, Bun/Node proof, and lockfile discipline. The official pack leaves version pinning unresolved (`docs/projects/habitat-harness/research/official-docs-effect.md:70`).

**Testability can be improved without Effect.** The command-class tests could be supplemented with real `bun run habitat` and production-runner smoke tests using normal process tests. Effect service injection may improve unit seams, but it is not required to test root help.

**Concurrency is not the immediate bottleneck.** `createCheckReport` is sequential, and the Grit adapter intentionally performs one shared Grit scan. Parallel rule execution could help later, but current known gaps are truthfulness, error typing, and side-effect containment. Introducing fibers before lifecycle proof would add risk.

**Schema compatibility risk.** Stronger error classes may require extending CheckReport or adding internal-only error types. If the public JSON contract changes, that is a separate compatibility decision. Current report validation is simple and schemaVersion 1 (`tools/habitat/src/lib/diagnostics.ts:36-66`).

## Candidate Effect Adoption Slices

1. `habitat-effect-adoption-spike` - design/proof only. Prototype a bounded internal `CommandRunner` and tagged error model without changing user-visible Habitat behavior. Acceptance: root/dev/prod command parity commands still pass or fail exactly as the repaired command-surface spec requires; command provenance is richer than current `SpawnResult`; no architecture decision is claimed.

2. `habitat-effect-command-runner` - replace the shared spawn wrapper behind existing call sites. Scope: `git`, `nx`, `biome`, `grit`, and script invocations. Acceptance: typed failures for missing tool, nonzero exit, parse failure, and interruption; stdout/stderr/exit/cwd/env/argv preserved; current report rendering unchanged unless an accepted schema change says otherwise.

3. `habitat-effect-check-pipeline` - move rule selection, baseline loading, rule execution, baseline application, and report assembly into typed pipeline steps. Acceptance: unknown `--rule`/`--tool` cannot return only `baseline-integrity`; baseline policy outcomes are explicit; collect-all diagnostics remain intact for valid checks.

4. `habitat-effect-grit-adapter` - model Grit check/apply as typed command, parse, projection, baseline, and transform-proof steps. Acceptance: native Grit samples remain authoritative; current-tree scan proof is separate; parse noise/no JSON/schema drift/pattern misses are tested; apply mode proves dry-run no-write, applied diff, rollback boundary, and typecheck/test handoff.

5. `habitat-effect-hook-transaction` - rebuild pre-commit/pre-push sequencing around explicit staged-file state and scoped side effects. Acceptance: resource publish is explicitly retained, delayed, or removed with proof; partial-staging refusal is deterministic; formatter restages only touched files; Grit/Biome command provenance is preserved; no hook side effect can outlive the hook scope without an explicit record.

6. `habitat-no-effect-p0-repair` - a deliberate non-adoption slice for P0 command trust if targeted oclif and selector validation repairs can provide typed-enough failures without Effect. Acceptance: records state why Effect is deferred, which triggers reopen it, and which typed-error/provenance/test properties the manual repair still had to provide.

## Required Proof Gates

- **Command-surface parity/proof:** real `bun run habitat -- --help`, `bun run habitat -- check --help`, production runner help after clean build, unknown command, valid command, and root package scripts. Command-class tests alone are insufficient.

- **Unknown selector failure:** unknown `--rule`, `--tool`, and `--owner` must exit nonzero or otherwise produce an explicitly failing normalized diagnostic. A requested selector must never pass by returning only `baseline-integrity`.

- **CheckReport compatibility:** valid checks must preserve schemaVersion 1 compatibility unless a separate accepted contract changes it. New typed internals must render stable diagnostics and human output.

- **Command provenance:** each external tool invocation used for proof must retain argv, cwd, env delta, stdout, stderr, exit code, duration, and failure class. This must be available to records or diagnostics where relevant.

- **Baseline policy matrix:** tests must cover missing baseline file, empty baseline, nonempty baseline, malformed baseline JSON, merge-base unavailable, existing-rule expansion, new-rule expansion, and baseline shrink.

- **Grit proof classes:** native pattern fixture proof, current-tree scan, injected violation, Habitat baseline behavior, dry-run/apply proof, and old-mechanism parity are separate claims. Green `grit:check` does not prove transform safety.

- **Biome/Nx owner proof:** Effect orchestration must not replace Biome/Nx proof. Biome safe-write/read-only lanes must be proven with Biome commands and config; Nx target existence and graph guidance must be proven with resolved Nx output.

- **Hook side-effect proof:** pre-commit must prove staged scope, partial-staging refusal, formatter touched-file restage, Grit parse/finding behavior, resource publish policy, and failure ordering. Pre-push must prove Graphite parent or merge-base selection.

- **Service-injection tests:** if Effect is adopted, unit tests should provide fake command, Git, filesystem, baseline, and clock services while integration tests execute real root/dev/prod entrypoints.

- **Runtime-edge discipline:** `Effect.run*` or runtime construction must stay at oclif, hook, or bin boundaries. Rule libraries should return effects or typed results, not run their own runtimes.

- **Records truth:** any adoption or non-adoption slice must update stale Habitat records that previously overclaimed help, selector, Grit, hook, or product proof.

## Open Questions

- Should oclif remain the outer command shell while Effect, if adopted, lives only behind command-engine services? Current evidence suggests the source oclif shim works and the manual dev dispatcher is the failing surface, but this still needs a repair design decision.

- Should missing baseline files remain an accepted "empty locked baseline" contract, or should every locked rule require an explicit committed empty baseline file? Current code implements the former; recovery records question whether that is sufficiently explicit.

- What is the user-facing shape of invalid selectors: oclif parse error, normalized CheckReport failure, or both? The answer affects command UX and JSON contract compatibility.

- How much command provenance belongs in public CheckReport versus internal proof logs? Putting every argv/env/cwd detail in the report may be useful for truthfulness but could churn the schema.

- Should hook resource publishing remain in pre-commit, move after cheap validations, become an explicit command, or be removed from hooks? Effect can scope this, but cannot decide the policy.

- Which Grit apply candidates are mechanical enough to justify an Effect-backed transaction, and which should be generator-owned or manual? The existing single apply pattern is under-proven, not proof that broad apply-mode adoption is safe.

- Should Habitat depend directly on `effect` and `@effect/platform`, or should any shared command runner live in a separate internal package used by Habitat later? This affects package ownership and versioning.

- Do current repo-local Effect patterns in `packages/studio-server`, `packages/civ7-control-orpc`, `apps/mapgen-studio`, and `packages/cli` provide conventions Habitat should follow, or are those runtime/service domains too different from structural CLI enforcement?

## Stop/Reframe Triggers

- Stop if an Effect slice wraps existing Promise/sync/spawn code without introducing typed errors, service boundaries, command provenance, and test seams.

- Stop if Effect adoption delays P0 command-surface truthfulness without evidence that a targeted manual oclif/selector repair would preserve the same root cause.

- Stop if adoption replaces oclif or changes command UX without a separate accepted command-shell design and root/dev/prod proof.

- Stop if `Effect.run*` appears throughout rule implementations instead of staying at CLI, hook, or runtime adapter boundaries.

- Stop if stdout/stderr/exit code, cwd/env, scan roots, or baseline policy details become less visible than they are today.

- Stop if Effect is used to claim Grit, Biome, Nx, or Habitat architecture semantics that only those tools or local docs/code can prove.

- Stop if fibers, spawned processes, temp dirs, Grit caches, file locks, or hook side effects can outlive the command/hook scope without explicit cleanup and tests.

- Stop if adoption broadens into a framework rewrite without one named repair claim, one write set, and one proof packet per slice.

- Reframe if two candidate repair areas in a row can provide typed failures, command provenance, service injection, and resource cleanup with simpler local TypeScript and less risk than Effect.

- Reframe if Effect package/runtime behavior in the repo's Bun/Node environment cannot be pinned and proven before touching Habitat's command path.
