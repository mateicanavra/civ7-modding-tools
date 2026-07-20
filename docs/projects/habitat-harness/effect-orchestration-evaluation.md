# Habitat Effect Orchestration Evaluation

**Status:** active design investigation
**Created:** 2026-06-14
**Owner:** DRA Habitat recovery owner
**Frame:** `docs/projects/habitat-harness/dra-takeover-frame.md`
**Related claim row:** `CLAIM-P1-EFFECT-FIT` in
`docs/projects/habitat-harness/recovery-claim-ledger.md`
**Mode:** active design/specification decision record

This record exists because "Habitat does not currently use Effect" is not a
valid reason to preserve manual internals if those internals structurally
produce false-green checks, brittle proof, weak tests, untyped process failures,
or uncontrolled side effects. Effect must be evaluated as a first-class repair
substrate wherever its native capabilities match the failure mode.

## Frame

### Selection

Evaluate whether Habitat's command, check, fix, hook, baseline, Grit, Biome,
Nx-command invocation, and proof-record orchestration should remain as manual
TypeScript functions or move behind an Effect-based execution core. Nx itself
remains the graph, target, `dependsOn`, affected-scope, and cache authority;
Effect may only own typed command execution/provenance around Nx calls when a
slice proves that is the right substrate.

### Foreground

- Typed error channels instead of string/stderr and thrown-error control flow.
- Explicit command provenance: argv, cwd, env, stdout, stderr, exit code,
  elapsed time, and proof label.
- Service injection for Git, filesystem, command runner, clock, baseline store,
  reporter, and repo graph.
- Resource safety for temp directories, spawned processes, caches, file locks,
  dry-run sandboxes, and hook side effects.
- Deliberate collect-all versus fail-closed orchestration per command.
- Tests that prove real entrypoints and unit behavior without depending on the
  developer's current repo state.

### Exterior

- Using Effect as authority for GritQL semantics, Biome safe-fix semantics, Nx
  graph behavior, or Habitat architecture policy.
- Replacing product outcome work with an Effect migration for its own sake.
- Preserving oclif or replacing oclif as an assumption. The command-shell shape
  is a design question if evidence shows the current shell contributes to the
  product miss.

### Hard Core

1. Habitat's product outcome controls: classify first, generate supported
   structure, enforce through owner layers, shrink baselines only, provide safe
   transformations, and keep records truthful.
2. Current manual internals are not protected. They must earn preservation with
   evidence.
3. Effect adoption is justified only where it improves proof, safety,
   testability, or ownership clarity for the recovery program.
4. If adopted, Effect must make failures more explicit, not wrap existing
   untyped behavior in a new abstraction.

### Falsifier

Reframe away from Effect for a repair area if a current-code design can provide
typed errors, command provenance, resource cleanup, service injection, and proof
quality with less moving machinery; or if an Effect prototype cannot preserve
Habitat command behavior while reducing the failure surface.

## Historical Manual-System Diagnosis - 2026-06-14

This diagnosis preserves the pre-v2 selector and report state that motivated
the Effect evaluation. Its `--tool` and CheckReport v1 references are not
current command authority.

| Surface | Current evidence | Failure dynamic | Effect-fit hypothesis |
| --- | --- | --- | --- |
| Rule selection | `selectRules` filters arrays and returns an empty list for unknown `--rule`/`--tool`; `createCheckReport` then appends `baseline-integrity` and can return ok. See `tools/habitat/src/lib/command-engine.ts:65` and `tools/habitat/src/lib/command-engine.ts:78`. | Missing requested rule is not a typed failure; it is indistinguishable from a valid empty filtered set plus built-in integrity. | Typed `RuleSelectionError` and validation before report construction would make unknown filters fail closed and testable. |
| Check orchestration | `createCheckReport` mixes selection, baseline loading, rule execution, status derivation, baseline integrity, timestamps, and report assembly in one function. See `tools/habitat/src/lib/command-engine.ts:78`. | Ownership boundaries blur; adding proof classes or typed failures requires touching a central imperative block. | Effect services could separate `RuleRegistry`, `BaselineStore`, `RuleRunner`, `Clock`, and `Reporter` while preserving one command output. |
| Process execution | `run` wraps `spawnSync` and returns `{ exitCode, stdout, stderr }`; spawn errors become `127` without structured tags. See `tools/habitat/src/lib/spawn.ts:15`. | Tool missing, signal termination, parse failure, timeout, and nonzero exit are all string/result conventions. | Effect command services can model `ToolUnavailable`, `CommandFailed`, `OutputParseFailed`, and `Interrupted` separately while preserving stdout/stderr. |
| Grit scan | `runGritRule` loads one cached shared report, parses JSON by substring, then filters by pattern. See `tools/habitat/src/lib/grit.ts:45`, `tools/habitat/src/lib/grit.ts:118`, and `tools/habitat/src/lib/grit.ts:155`. | Current design can hide scan-root, parse, cache, and pattern-selection failures behind projected diagnostics unless every case is hand-modeled. | Effect can make Grit report acquisition, parsing, cache scope, and pattern projection separate typed steps with collect-all diagnostics. |
| Grit apply | `runGritApplyPatterns` hardcodes one allowlisted pattern, always uses `--force`, and treats dry-run as an argv switch. See `tools/habitat/src/lib/grit.ts:86`. | Apply safety depends on surrounding convention rather than a proof-friendly transaction model. | Effect resource scopes could own clean-worktree checks, dry-run no-write checks, applied diff capture, rollback boundaries, and command provenance. |
| Baseline integrity | Missing baseline means empty locked baseline by code comment and `loadBaseline`; merge-base failure returns no findings. See `tools/habitat/src/lib/baseline.ts:7`, `tools/habitat/src/lib/baseline.ts:25`, and `tools/habitat/src/lib/baseline.ts:76`. | Some baseline semantics are encoded in comments and return conventions, not typed policy outcomes. | Effect is useful if it turns merge-base absence, malformed JSON, missing baseline policy, and added-key findings into explicit policy results. |
| Hook side effects | Pre-commit publishes resources before staged checks. See `tools/habitat/src/lib/hooks.ts:58`. | Mutation happens before proof gates and before staged-file scope is established. | Effect resource/finalizer model could stage side effects after validations or make publish a separate scoped command with explicit proof and cleanup. |
| Hook staged checks | The hook parses staged files, formats, restages touched files, runs Grit, and returns ad hoc stderr strings. See `tools/habitat/src/lib/hooks.ts:69`, `tools/habitat/src/lib/hooks.ts:90`, and `tools/habitat/src/lib/hooks.ts:106`. | Local workflow safety depends on manual sequencing and string construction. | Effect can encode staged-file state, partial-staging refusal, formatter write set, restage, and Grit JSON parse as typed steps with fail-closed sequencing. |
| Command tests | Command-class tests mock the entire command engine and do not execute root/dev/prod entrypoints. See `tools/habitat/test/commands/habitat-commands.test.ts:11`. | Tests can prove oclif flag plumbing while missing root help and production-runner failures. | Effect service injection would allow command-level tests to use real entrypoints with fake services, reducing the need for broad module mocks. |
| Repo-local precedent | `effect` is already used in `packages/civ7-control-orpc`, `packages/studio-server`, `apps/mapgen-studio`, and `packages/cli`; Habitat itself lacks it. See package search output and `tools/habitat/package.json`. | Effect is not alien to the repo, but Habitat has not adopted it, so dependency and style boundaries need explicit design. | Existing repo patterns can inform a Habitat slice, but Habitat must still prove its own command semantics and not cargo-cult runtime architecture. |

## Local Fit Synthesis

`docs/projects/habitat-harness/research/local-effect-adoption-fit.md` confirms
that Effect should remain a first-class implementation-substrate option, but not
as a blanket rewrite. The strongest local fits are:

- Typed selector and policy failures, especially unknown `--rule`, `--runner`,
  and owner filters that must never produce a green report through
  `baseline-integrity` alone.
- Command runner provenance for every `git`, `grit`, `biome`, `nx`, `bun`,
  `eslint`, and shell-script invocation used as proof.
- Service injection that lets tests execute real command/report paths with fake
  Git, filesystem, command runner, clock, baseline, and reporter services.
- Resource scopes for temp dirs, Grit caches, hook side effects, formatter
  writes, codemod dry-run sandboxes, applied-diff capture, and cleanup on
  interruption.
- Explicit orchestration modes: collect-all diagnostics for `check`, fail-closed
  sequencing for `fix`, hooks, and unsafe transforms.
- Grit adapter hardening around command execution, JSON parsing, scan-root
  provenance, pattern projection, dry-run no-write proof, and apply
  transactions.

The same local fit evidence also protects against over-adoption:

- Oclif help failure is currently localized to the manual root/dev dispatcher;
  direct source oclif help works. P0 command help can use a targeted
  command-surface repair if it still proves help, unknown-command, root/dev/prod,
  typed-selector, and entrypoint-test properties.
- Effect cannot supply GritQL, Biome, Nx, baseline, taxonomy, classify, or
  codemod safety semantics. It can only make Habitat's orchestration of those
  proofs explicit and testable.
- Any slice that only wraps current sync/spawn code without tagged failures,
  services, command provenance, and runtime-edge discipline is rejected.

## Effect-Fit Opportunities

| Opportunity | Why Effect may help | Required proof before adoption |
| --- | --- | --- |
| Typed command runner | Official Effect docs support typed error channels and `@effect/platform/Command` with argv/env/cwd/stdout/stderr/exit-code access. This maps directly to Habitat proof records. | Prototype `CommandRunner` for `nx`, `grit`, and `biome` that preserves current stdout/stderr and distinguishes missing tool, nonzero exit, parse failure, and interruption. |
| Rule-selection gate | The historical false-green selector bug is a typed validation failure before check execution; current selectors are `--rule` and `--runner`. | Tests proving unknown rule/runner exits nonzero with one CheckReport v2 `selector-refused` row and never returns only `baseline-integrity` for a requested missing selector. |
| Check report pipeline | `check` wants collect-all diagnostics; `fix` wants fail-closed sequencing. Effect makes collection mode explicit. | A design that labels collect-all versus fail-closed behavior per command and proves report JSON compatibility. |
| Baseline store | Missing file, malformed JSON, merge-base absence, added entries, and new-rule exceptions are distinct policy results. | Typed baseline policy table and tests for each policy outcome, including merge-base failure semantics. |
| Grit adapter | Grit's docs leave JSON schema and dry-run guarantees under-specified, so Habitat needs a robust adapter with typed parse/proof behavior. | Adapter tests for parse noise, no JSON, empty results, pattern misses, scan-root provenance, and dry-run no-write proof. |
| Hook transaction | Hooks are high-risk because they mix publish, staged scope, formatter writes, restage, Grit checks, and pre-push affected scope. | Design side effects as scoped operations with explicit ordering; prove publish is retained, delayed, or removed by policy. |
| Test seams | Current command tests mock the engine and therefore missed entrypoint behavior. Effect Layers can substitute services while executing real command paths. | Test plan that covers root/dev/prod entrypoints plus unit tests with fake command/fs/git services. |

## Effect Non-Fit And Risks

| Risk | Why it matters | Mitigation or rejection condition |
| --- | --- | --- |
| Migration theater | A broad Effect rewrite can consume effort without moving product outcome. | Open only slices tied to a named repair claim and proof gap. |
| Added abstraction without typed value | Wrapping existing `SpawnResult` promises or sync functions in `Effect` without typed errors/services would preserve the failure dynamic. | Reject any slice whose design does not introduce tagged errors, service boundaries, and command provenance. |
| CLI shell churn | oclif may be the right outer adapter even if internals use Effect; replacing it requires separate command-surface proof. | Treat shell replacement as an explicit design fork, not an incidental consequence of adoption. |
| Dependency/version drift | Habitat package currently lacks `effect`; other repo packages use `effect` `3.21.x`. | Pin the dependency in the Habitat package only through an accepted slice and verify Bun/Node behavior. |
| Proof delay | Effect adoption might block P0 command repair if attempted as a sweeping rewrite. | Stage adoption so P0 truthfulness is not delayed unless evidence proves manual repair would preserve the root cause. |
| Wrong authority | Effect cannot prove Grit, Biome, Nx, or architecture semantics. | Keep owner-layer proof separate in ledgers and OpenSpec records. |

## Candidate Adoption Slices

| Candidate id | Scope | Dependencies | Acceptance shape |
| --- | --- | --- | --- |
| `habitat-effect-orchestration-evaluation` | Design-only evaluation from official docs, current code, local precedent, and adversarial review. | Stage 0 ledgers and current command probes. | Decision packet: adopt now, adopt after P0, adopt only for hooks/fix, or reject with evidence. |
| `habitat-effect-command-runner` | Introduce typed command runner/service and command-result model behind existing command engine. | Accepted evaluation; command-surface repair design. | Root/dev/prod command behavior preserved or repaired; structured failures and command provenance available to reports. |
| `habitat-effect-check-pipeline` | Refactor rule selection, baseline policy, and rule execution into typed steps. | Command runner; baseline contract repair. | Unknown selectors fail truthfully; collect-all report semantics explicit; JSON report compatibility proven. |
| `habitat-effect-grit-adapter` | Typed Grit check/apply adapter with scan roots, parse results, dry-run no-write proof, and apply transaction records. | Grit proof repair and official Grit docs. | Native samples, current-tree scan, injected violation, dry-run/apply proof, rollback story. |
| `habitat-effect-hook-transaction` | Rebuild hook sequencing around typed staged-file state, side-effect policy, formatter writes, restage, and Grit checks. | Hook hardening decision and Biome/Grit proof repairs. | Publish side effect is explicitly retained/delayed/removed; partial staging and write set proof are deterministic. |
| `habitat-no-effect-p0-command-repair` | Deliberate non-adoption slice for the oclif root/dev/prod command-surface repair if the design can provide typed selector failures, real entrypoint tests, and command provenance without adding Effect. | Accepted Effect evaluation and P0 command trust packet. | Records explain why Effect is deferred for this slice, what typed/provenance properties the manual repair still provides, and which triggers reopen Effect adoption. |

## Historical Selection - 2026-06-14

This dated section records the v1 decision as historical evidence. It is not
the current report-contract authority.

`habitat-effect-grit-adapter` is the first provisionally selected Effect
adoption packet for this recovery program. Design review findings have been
dispositioned, and live dependency adoption remains unclaimed until the packet
completes its dependency/platform parity tasks.

Decision boundary:

- Provisionally adopt Effect for the Grit adapter substrate: typed adapter failures,
  services/layers, scoped cleanup/finalizers, command-result provenance, parser
  boundaries, injected-probe cleanup, and apply transactions.
- Keep oclif as the command shell and keep CheckReport schemaVersion 1 as the
  command/report boundary.
- Fold the first typed command-result contract into the Grit adapter rather than
  opening a broad shared command-runner migration first.
- Open `habitat-effect-command-runner` later only if another workstream proves
  the same command-result contract is needed outside Grit.
- Do not move GritQL semantics, Biome formatting semantics, Nx scheduling/cache
  semantics, baseline policy, hooks, generated-output policy, or product
  runtime proof into Effect.

### Historical P0 Command Repair Outcome - 2026-06-15

`habitat-oclif-entrypoint-repair` implements the deliberate
`habitat-no-effect-p0-command-repair` path for the command-surface slice:

- oclif remains the command shell for root, development, source, and production
  entrypoints;
- `RuleSelectionResult` and `RuleSelectorFact` provide typed selector outcomes
  for unknown owner/rule/tool, wrong selector namespace, and valid selectors
  with an empty intersection;
- invalid check selectors render schemaVersion 1 `rule-selection-integrity`
  reports in JSON mode and fail non-zero in human mode;
- invalid `--expand-baseline` selections fail before baseline authoring;
- command proof remains phase-record evidence rather than an Effect command
  service.

This is not a global rejection of Effect. The trigger matrix in
`habitat-oclif-entrypoint-repair/design.md` remains active for future
check-pipeline or command-runner policy failures, and
`habitat-effect-grit-adapter` remains the selected Effect adoption surface for
Grit adapter hardening.

This provisional selection is controlled by:

- `openspec/changes/habitat-effect-grit-adapter/proposal.md`
- `openspec/changes/habitat-effect-grit-adapter/design.md`
- `openspec/changes/habitat-grit-proof-repair/workstream/reviews/effect-substrate-review.md`
- official Effect/GritQL/Biome/Nx evidence packs under
  `docs/projects/habitat-harness/research/`

### Historical Grit Adapter Implementation Checkpoint - 2026-06-15

`habitat-effect-grit-adapter` implements the selected Grit substrate and is
supervisor-accepted for the Grit-scoped adapter boundary:

- Effect runtime edge is centralized in the Habitat runtime bridge.
- `HabitatProcess` records command provenance, output digests, Git state,
  cache policy, failure tags, and non-claims through live/fake services.
- Workspace-owned tools resolve through repo-local Bun/Nx-aware command planes
  rather than ambient `PATH`.
- The Grit check adapter uses exact JSON parsing, typed failure tags, scan-root
  validation, and CheckReport schemaVersion 1 projection.
- The injected-probe harness creates scoped probes, runs the real Habitat Grit
  adapter path, asserts exact rule projection, and cleans up probes.
- The apply transaction supports structured pattern-owned inventory and an
  isolated transaction-copy diff proof for compact Grit apply output. The diff
  proof records changed paths and digests without claiming symbol/import
  semantics or live worktree apply.

This checkpoint proves the selected Effect substrate for Habitat's Grit adapter
slice. It does not prove Grit row closure, all-row injected violations,
baseline shrink behavior, live worktree apply, Nx scheduling/cache behavior,
Biome semantics beyond selected gates, or product/runtime Civ7 behavior.

### Current CheckReport Authority

Habitat's current check boundary is CheckReport v2. Typed rule dispositions,
diagnostics, lanes, and statuses are validated at the service-model owner; Grit
selection uses `--runner grit`, and an unknown runner is represented by one v2
`selector-refused` row. The dated schemaVersion 1 decisions above remain useful
Effect-adoption history but do not define current command or report behavior.

## Required Decision Before Implementation

For each repair workstream touching command/check/fix/hook orchestration, decide
one of:

1. **Repair current internals.** Allowed only if the design provides typed
   failures, command provenance, resource cleanup, service/test seams, and
   truthful proof without Effect.
2. **Adopt Effect behind the existing command shell.** Preferred if Effect
   improves internals while preserving oclif and root script expectations.
3. **Reconsider the command shell.** Allowed only with a command-surface design
   that proves root/dev/prod behavior, help output, unknown command behavior,
   and migration impact.
4. **Defer Effect with trigger.** Allowed only when the trigger, owner, and
   blocked surface are recorded.

## Review Gates

- Product reviewer: adoption must move Habitat toward executable structural
  operation, not framework churn.
- System reviewer: identify feedback loops changed by typed errors,
  service injection, and resource scopes.
- Evidence reviewer: verify proof classes stay separate and current behavior is
  not hidden by abstraction.
- Command reviewer: root/dev/prod entrypoints, help, unknown selectors, and
  reports must become more truthful.
- Grit/Biome/Nx reviewers: Effect orchestration must not claim tool semantics
  those docs do not support.

## Immediate Next Evidence

- Reconcile `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`
  into every command/check/fix/hook/Grit implementation packet.
- Inspect existing Effect patterns in `packages/civ7-control-orpc` and
  `packages/studio-server` before drafting an implementation slice.
- Run a proof spike only after the evaluation accepts a candidate slice and
  names the exact write set.
