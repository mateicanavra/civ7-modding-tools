# D11 Local Feedback Code/Vendor Topology Investigation

Status: investigation/review input only. This document is not D11 acceptance input, does not update the packet index, and does not close any D11 review lane.

Current-disk note: while this investigation was being written, other D11 repair work landed in the active worktree. I re-read the updated D11 `proposal.md`, `design.md`, `tasks.md`, and spec delta before finalizing this scratch. The repaired `proposal.md` and `design.md` now cover much of the code/vendor topology contract; the blocking findings below focus on the latest disk state, especially stale `tasks.md`, underspecified spec delta, missing concrete D0 rows, and workstream/control-record drift.

## Source Authority Read Register

Primary instructions and skills read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/failure-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`

Repo and packet sources read or targeted for D11-relevant contract facts:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D11-local-feedback.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d11-local-feedback/**`
- Upstream accepted design/specification packets: D0, D1, D3, D6, D7, D9, and D10 under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/`
- Live hook code/tests: `tools/habitat-harness/src/lib/hooks.ts`, `tools/habitat-harness/src/commands/hook.ts`, `tools/habitat-harness/src/lib/command-engine.ts`, `tools/habitat-harness/src/index.ts`, `tools/habitat-harness/test/lib/hooks.test.ts`, `.husky/pre-commit`, `.husky/pre-push`

Official/native vendor sources consulted:

- Nx affected docs: https://nx.dev/docs/features/ci-features/affected
- Nx command reference: https://nx.dev/docs/reference/nx-commands
- Biome git hooks recipe: https://biomejs.dev/recipes/git-hooks/
- Biome CLI reference: https://biomejs.dev/reference/cli/
- Husky docs: https://typicode.github.io/husky/
- Git hooks docs: https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- Grit CLI reference: https://docs.grit.io/cli/reference

Repo state at entrance: active worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`, branch `codex/d11-local-feedback-packet`, clean before writing this scratch file.

## Current Flow Map

### Husky Entrypoints

- `.husky/pre-commit` is a one-line native hook delegator: `bun run habitat hook pre-commit`.
- `.husky/pre-push` is a one-line native hook delegator: `bun run habitat hook pre-push`.
- Husky/Git should remain a runner boundary. D11 owns what `habitat hook <name>` does after invocation; it should not make Husky into a policy authority.

### CLI Entrypoint

- `tools/habitat-harness/src/commands/hook.ts` defines the Oclif command `habitat hook [name]` with optional `--base`.
- The command imports `runHook` from `../lib/command-engine.js`, not directly from `../lib/hooks.js`.
- `tools/habitat-harness/src/lib/command-engine.ts` re-exports `runHook` from `./hooks.js`.
- `tools/habitat-harness/src/index.ts` exports `runHook` from `command-engine`.

This makes `runHook` a package-export/public-surface candidate on at least two planes: command behavior and package export compatibility.

### Pre-Commit Sequence In Current Code

Current `runPreCommit` in `tools/habitat-harness/src/lib/hooks.ts` performs:

1. Write banner `habitat hook pre-commit` and the legacy local-feedback notice.
2. Classify resource state with `classifyResourcesState`.
3. If resources are not allowed, return `resource-blocked` before file-layer, Biome, Grit, or resource publishing.
4. Read staged paths from `git diff --cached --name-status -z`, ignoring deleted paths and including both old/new paths for rename/copy.
5. Run staged file-layer check via `bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json`.
6. If file-layer fails, stop before Biome/Grit.
7. Compute Biome candidate paths by extension.
8. Refuse partial staging by checking `git diff --name-only -z -- <biomePaths>`.
9. Hash Biome candidate files, run `biome format --write --no-errors-on-unmatched <biomePaths>`, then restage only hash-changed paths with `git add -- <touched>`.
10. Run `biome check --no-errors-on-unmatched <biomePaths>`.
11. Compute staged Grit scan roots by extension plus `validateScanRoots(..., { requireExisting: false })`.
12. If roots exist, run `bun tools/habitat-harness/bin/dev.ts check --staged --tool grit-check --json`.
13. Parse whole `CheckReport` JSON from stdout/stderr and use `report.ok`; regex-detect selected Grit adapter parse failures inside diagnostic messages.
14. Return `grit-command-failed`, `grit-parse-failed`, `grit-finding`, or `pass`.

Side effects:

- Biome may rewrite files.
- D11 restages only formatter-touched Biome paths by content hash.
- D11 does not call the resource publisher from hook execution; it only prints publisher/status/init/unlock recovery commands.
- D11 reads repo state before/after when a trace is supplied.

### Pre-Push Sequence In Current Code

Current `runPrePush` performs:

1. Write legacy local-feedback notice.
2. Capture pre-state when a trace is supplied.
3. Resolve base from explicit `--base`, else `gt branch info --no-interactive` parent, else `mergeBase("main")`, else literal `main`.
4. Run `nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base <base> --head HEAD --outputStyle=static`.
5. Return `pass` only when the Nx command exits 0; otherwise `affected-failed`.

Current risks:

- The literal `main` fallback is an observed fallback path. D11 must decide whether it is acceptable local-feedback behavior or a blocked base-resolution state after D3/D0 compatibility.
- Pre-push target truth is currently hard-coded in D11 code. D3 owns graph target facts; D11 may only consume a D3 target plan/projection once available.

## Public-Surface Inventory

D11 must not authorize source changes until D0 rows and D1 handling exist for every touched public/durable surface below.

| Surface | Current path | Plane(s) | D11 concern |
| --- | --- | --- | --- |
| `.husky/pre-commit` | `.husky/pre-commit` | hook runner / repository automation | Stable delegator command; changes affect native Git hook behavior. |
| `.husky/pre-push` | `.husky/pre-push` | hook runner / repository automation | Stable delegator command; changes affect native Git hook behavior. |
| `habitat hook` command | `tools/habitat-harness/src/commands/hook.ts` | CLI verb, command behavior, help output | `name` argument and `--base` are public command surfaces. |
| `--base` flag | `tools/habitat-harness/src/commands/hook.ts` | CLI flag / pre-push behavior | D11 must define compatibility and intended use; current description says probes and CI diagnostics. |
| `runHook` facade | `tools/habitat-harness/src/lib/command-engine.ts`, `tools/habitat-harness/src/index.ts` | package export | Currently exported publicly through `index.ts`; D0/D1 required before rename/narrow/facade. |
| `runPreCommit`, `runPrePush`, `createHookTrace`, `HookTrace`, trace interfaces | `tools/habitat-harness/src/lib/hooks.ts` | package-internal or package-export risk, test-facing API | Tests import directly; D0 must classify public vs internal before target schema changes. |
| Human output notice | `tools/habitat-harness/src/lib/hooks.ts` | human output, tests/docs | Current wording uses legacy local-feedback language; D1 treats it as compatibility-only. D11 should replace only through D0/D1 handling. |
| Outcome strings and command phase strings | `tools/habitat-harness/src/lib/hooks.ts` | machine/test trace | Need closed trace contract if retained. |
| Hook test expectations | `tools/habitat-harness/test/lib/hooks.test.ts`, `tools/habitat-harness/test/commands/habitat-commands.test.ts` | public behavior characterization | Tests pin current text, commands, sequence, and trace fields. |

The expected durable D0 matrix file `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/public-surface-compatibility-matrix.md` is absent in this worktree. That absence alone blocks D11 source implementation for all touched hook surfaces.

## Vendor/Native Constraint Notes

### Git/Husky

- Git hooks are native local scripts. A nonzero pre-commit/pre-push hook exit aborts the local Git action; hook success is still local-only and bypassable by native Git mechanisms.
- Husky uses Git's `core.hooksPath`, follows native hook organization, and supports POSIX shell hooks. Husky should remain a delegator to `habitat hook`, not a Habitat policy owner.
- Biome's own git-hook recipe notes that Husky does not provide staged-file lists and is commonly paired with a staged-file tool. This repo currently gets staged paths directly from Git inside `hooks.ts`, so D11 must specify that Git is the staged-path source.

### Biome

- Biome `check` runs formatter, linter, and import sorting; `format` runs the formatter.
- Biome supports explicit file paths and hook recipes using `--no-errors-on-unmatched`.
- Biome has native `--staged` support, but current D11 code does not use it. It feeds explicit paths from Git and restages formatter-touched files itself.
- D11 may orchestrate explicit Biome path execution and restaging, but it must not redefine Biome formatting/check semantics. Restage scope must stay limited to formatter-touched staged Biome candidates unless D0/D1 and D11 explicitly version that policy.

### Grit

- Grit CLI distinguishes `grit check` from `grit apply`. `grit check` reports pattern violations; `grit apply` can modify files and has `--dry-run`, `--force`, interactive, output, cache, and path options.
- D11 currently does not call native Grit directly; it calls `habitat check --staged --tool grit-check --json`.
- D11 must consume D6/D7 structured diagnostic/check projections. It should not parse rendered Grit failure text or infer Grit adapter failure from regexes over diagnostic messages once upstream projections exist.

### Nx

- Nx affected uses Git history plus the Nx project graph. Official docs define `base` and `head` inputs; the default base is `main` and default head is the current file system. The current D11 code explicitly runs `--base <resolved> --head HEAD`.
- D3 owns target availability, dependency declaration resolution, graph read/refusal states, and affected target truth. D11 may choose when to invoke a local pre-push affected command, but it must consume D3 target-plan/base/provenance facts rather than hard-code graph truth.

## Write/Protected Set For Later D11 Implementation

Later D11 may own only the local-feedback orchestration surfaces:

- `tools/habitat-harness/src/lib/hooks.ts`
- `tools/habitat-harness/src/commands/hook.ts`
- `tools/habitat-harness/src/lib/command-engine.ts` only for D0/D1-compatible hook facade/export handling
- `tools/habitat-harness/src/index.ts` only if D0 classifies the hook exports and authorizes facade/preserve/version handling
- `tools/habitat-harness/test/lib/hooks.test.ts`
- `tools/habitat-harness/test/commands/habitat-commands.test.ts` only for CLI dispatch/help compatibility
- `.husky/pre-commit`
- `.husky/pre-push`
- Adjacent hook docs/examples only after D0/D1 public-surface handling exists

Protected paths for D11:

- D0 compatibility matrix and D1/D3/D6/D7/D9/D10 packet/control files, except downstream ledger/index dependency notes explicitly authorized by the workstream owner.
- D7 check implementation internals except consuming a published `LocalFeedbackCheckProjection`.
- D6 Grit/native diagnostic acquisition/projection internals.
- D9 transformation transaction implementation and rollback/apply safety internals.
- D10 generated/protected-zone declaration and guard-policy implementation.
- D3 workspace graph target/base/affected truth implementation.
- Generated outputs, `dist/**`, lockfiles, `mod/**`, Nx cache, official resources, and unrelated Civ7/MapGen domains.

## Dependency Map

| Dependency | D11 must consume | D11 must not do | Current packet state |
| --- | --- | --- | --- |
| D0 | Concrete rows for hook command, flags, human output, package exports, Husky delegators, docs/examples, test-pinned output. | Change public surfaces without row id and closed compatibility handling. | D11 mentions D0, but the durable matrix is absent. |
| D1 | `HookTrace`/local-feedback trace family, canonical non-claims, refusal/recovery relationship vocabulary, legacy hook notice handling. | Use legacy authority terminology as target language. | D11 mentions D1 only generally; no surface inventory or non-claim ids. |
| D3 | Pre-push base/target-plan/affected graph facts and graph refusal states. | Hard-code or repair graph target truth. | Proposal has a D3 note but D3 is not in `Requires`/tasks dependency gates. |
| D6 | Hook-eligible diagnostic projections and adapter/projection failure states. | Parse Grit JSON/text or own diagnostic taxonomy. | D6 is now named in repaired proposal/design; tasks/spec/control records still need to mirror it. |
| D7 | `LocalFeedbackCheckProjection`, check outcome/refusal/protected-zone projection, pass/fail rendering input. | Infer check semantics from raw JSON/human output. | D11 says consume D7 but does not name projection or unavailable-projection stop behavior. |
| D9 | Local-feedback-safe transaction states and recovery instructions if hook ever renders fix/apply state. | Recompute apply safety, rollback status, path approval, or gate semantics. | D11 says consume D9 but does not define where D9 applies to current hook scope. |
| D10 | Protected mutation decisions/refusals and recovery instructions for staged paths through D7/local-feedback-safe projection. | Match protected/generated paths locally after D10 exists. | D11 says consume D10 but does not name D10-origin refusal stop sequencing. |

## Findings Against Current D11 Packet

### P1: Tasks And Spec Still Lag Behind The Repaired Proposal/Design

The current `proposal.md` and `design.md` have been substantially repaired: they now name D0/D1/D3/D6/D7/D9/D10 dependencies, public surfaces, write/protected sets, state models, vendor boundaries, restage policy, pre-push graph boundaries, and stop conditions. `tasks.md` and `specs/habitat-harness/spec.md` still reflect the old underspecified packet state. `tasks.md` still omits D3/D6, still uses broad implementation tasks, and still contains the unsafe help gate. The spec still has one broad requirement and two scenarios.

Repair: update `tasks.md`, spec delta, phase record, downstream ledger, and closure checklist to mirror the repaired proposal/design before D11 can be accepted.

### P1: D0/D1 Compatibility Is Blocking, And D0 Matrix Rows Are Absent

D11 touches hook human output, `HookTrace`, `runHook`, `habitat hook`, `--base`, `.husky/*`, tests, and possibly package exports. D0 says later packets must cite rows before redesigning hook output, exports, command flags, scripts, or docs. The durable matrix file is absent in this worktree, so there are no row ids to cite.

Repair: D11 must remain source-blocked until concrete D0 rows exist for all hook surfaces. The packet can design target behavior, but every source task that changes a public/durable surface must say `blocked pending D0 row`.

### P1: Dependency Gates Are Incomplete In Tasks/Control Records And Could Permit False Local Passes

The repaired proposal/design now name D3 and D6, but current `tasks.md` still cites only D0/D1/D7/D9/D10 and the workstream records still do not mirror the full dependency set. That leaves two implementation-control gaps:

- Grit diagnostic projection unavailable could still be treated as a parse/text problem instead of a blocked local-feedback dependency.
- D3 graph facts unavailable could still let pre-push fall through to current literal `main`/hard-coded target behavior.

Repair: add D3 and D6 to tasks and workstream dependency gates. Add a normative rule in the spec and validation tasks: if a required upstream projection for a D11 stage is unavailable, the hook must produce blocked local feedback, not success.

### P1: Current Code Duplicates Upstream Authority In D11-Owned Hook Logic

Current `hooks.ts` duplicates or locally interprets:

- D6/D7 diagnostic semantics by parsing `CheckReport` and regex-matching Grit adapter failure text.
- D7/D10 staged protected-zone semantics by treating file-layer command failure as the only structured gate without specifying the D10-origin refusal projection.
- D6 scan-root eligibility by calling `validateScanRoots` in hook-local `hookGritScanRoots`.
- D3 graph target truth by hard-coding pre-push Nx target names and base fallback behavior.

Some current delegation is appropriate: calling `habitat check --staged --tool file-layer --json` delegates to check/file-layer code, and calling `habitat check --staged --tool grit-check --json` delegates acquisition. The target repair is to consume structured projections from D6/D7/D10/D3 instead of parsing raw reports/text or revalidating ownership.

Repair: D11 design should identify each current duplicate path and assign it to a later migration step: preserve under compatibility until upstream live projections exist, then delete local interpretation.

### P1: The Normative Spec Is Underspecified For Unsafe Hook Success

The spec has one broad requirement and two scenarios. It does not cover resource states, staged path collection, file-layer refusal, partial staging, formatter restage scope, Biome check failure, Grit malformed/finding states, pre-push base resolution, Nx affected failure, unsupported hook names, trace records, D0/D1 compatibility, or unavailable upstream authority.

Repair: split spec requirements by hook stage and public surface. Add scenarios for every stop condition and bad case listed in the source domino.

### P2: Validation Gates Include An Invalid/Unsafe Help Command

Current D11 gates list `bun run habitat hook pre-commit -- --help`. The current Oclif command has `name` and `--base`; there is no hook dry-run flag, and help should be validated through `bun run habitat hook --help` or a D0-classified equivalent. A command that names `pre-commit` risks executing a live hook rather than inspecting help, depending on argument forwarding behavior.

Repair: replace with non-executing help gates and focused unit/command tests. If D11 wants `--dry-run`, classify and design it as a new D0 public command contract first.

### P2: Restage Policy Is Correctly Narrow In Code And Repaired In Design, But Missing From Spec/Tasks

Current code hashes only Biome candidate paths and runs `git add -- <touched>` only for hash-changed formatter paths. Tests assert that foreign staged paths are not restaged. The repaired design makes this a D11 target contract, but the spec and tasks do not yet require it.

Repair: add a D11 spec requirement and validation tasks that formatter restage scope is exactly formatter-touched staged paths and that any broader restage or stash behavior is refused unless D0/D1 and D11 explicitly redesign it.

### P2: Resource State Model Is Repaired In Design But Not Yet In Spec/Tasks

The source domino calls out `ResourceState.kind` plus `allowPreCommit` contradiction risk. Current code uses constructors for failures but still exposes `allowPreCommit` on all variants. The repaired design now defines `ResourcePreCommitDecision`; the spec and tasks still do not make resource-state variants and bad-case tests mandatory.

Repair: add closed resource-state requirements and tests for `not-configured`, `clean`, `staged-gitlink`, `dirty-submodule`, `unstaged-gitlink`, `locked`, and inspection/uninitialized failures with recovery instructions.

### P2: Pre-Push Base Resolution Is Repaired In Design But Not Yet In Spec/Tasks

Current code has implicit states: explicit base, Graphite parent, merge-base with main/origin main through `mergeBase`, and literal `main` fallback. The repaired design defines provenance states and D3 availability boundaries; the spec and tasks still do not require those states or validation cases.

Repair: add spec scenarios and tests for explicit base, Graphite parent, merge-base fallbacks, literal fallback, D3 graph unavailable, D3 target unavailable, and Nx affected failure. Do not allow a missing D3/Graphite/base authority to become an unqualified pass.

### P2: Trace Schema Compatibility Is Still Unresolved Outside Design

`HookTrace` records command argv/cwd/env/exit/duration, pre/post repo snapshots, outcomes, paths, restaged paths, and base. Tests pin some of this. The repaired design treats `HookTrace` / `LocalFeedbackTrace` as D1-constrained and D0-classified, but the spec and tasks do not define compatibility rows, trace field preservation/versioning, or non-claim validation.

Repair: D11 should either preserve current `HookTrace` under D0/D1 compatibility or define `LocalFeedbackTrace` as a versioned/facaded target. It should not silently drift fields.

### P3: Current Help Text Still Carries Old H7 Language

`commands/hook.ts` description says hook wiring is intentionally deferred until `habitat-git-hooks`, but `.husky/*` now delegates to `habitat hook`. This may be stale human-output compatibility text rather than target D11 language.

Repair: classify through D0, then update command help only if compatibility handling permits.

## Repair Recommendations By Artifact

### `proposal.md`

Current status: largely repaired on latest disk. Keep the repaired D0/D1/D3/D6/D7/D9/D10 dependency table, public-surface list, write/protected set, validation split, and stop conditions. Reviewers should verify the D0 matrix absence is represented as a source blocker, not as implementation-ready state.

### `design.md`

Current status: substantially repaired on latest disk. Remaining design-level improvement is optional: add a compact "proper delegation vs duplication" table that names each current local interpretation path and the upstream projection that replaces it. This would make later source deletion less guessy, but the current design already states the key boundaries.

### `specs/habitat-harness/spec.md`

Add normative requirements and scenarios for:

- local-feedback non-claims and D1 non-claim ids;
- unsupported hook refusal;
- resource blocked before later stages;
- staged clean resource gitlink allowance and dirty/unstaged/locked refusal;
- staged path source from Git;
- D10/D7 protected-zone refusal stops downstream hook work;
- partial staging refusal before formatting/restaging;
- formatter restages only formatter-touched staged paths;
- Biome format/check failure stops appropriately;
- D6/D7 Grit projection clean/findings/adapter-failed/malformed/unavailable states;
- pre-push explicit base, Graphite parent, merge-base, and unavailable-base behavior;
- D3 unavailable graph/target plan blocks local feedback;
- Nx affected nonzero is local feedback failure, not CI authority;
- HookTrace/LocalFeedbackTrace compatibility and non-claims.

### `tasks.md`

- Replace broad implementation tasks with ordered implementation slices and prerequisites.
- Add a pre-implementation inventory task for D0 row ids and D1 handling.
- Add a dependency readiness task for D3/D6/D7/D9/D10 projections.
- Add unit tests for each stage and bad case rather than only `hooks.test.ts` as a broad gate.
- Replace `bun run habitat hook pre-commit -- --help` with non-executing help tests.
- Add `git status --short --branch` before/after any live hook or fixture that can write/restage.

### Workstream Records

- Update `phase-record.md` branch field to the active branch `codex/d11-local-feedback-packet`.
- Add validation result recording table with expected status, actual status, oracle, bad case, freshness/cache stance, and non-claims.
- Keep the review ledger blocking until D11 final review lanes accept the repaired packet.
- Downstream ledger should name D3/D6/D7/D9/D10 projection facts and D0 row blockers, not generic docs/tests.

## Verdict

Blocking.

The latest D11 proposal/design are directionally strong and cover most code/vendor topology concerns. The D11 packet is still not acceptance-ready because `tasks.md`, the spec delta, and workstream records have not caught up, and because concrete D0 compatibility rows are absent. In the current disk state, a later executor could still rely on stale tasks/spec and let hooks pass after unavailable D3/D6/D7/D10 authority, preserve regex/text parsing as diagnostic truth, broaden formatter restaging, or change hook public surfaces without D0/D1 compatibility rows.

The missing contracts are:

- concrete D0 rows for hook command/export/human-output/Husky/docs surfaces;
- D1 HookTrace/local-feedback trace and non-claim handling in spec/tasks/control records;
- D3 pre-push base/target-plan availability and unavailable-graph blocking behavior in spec/tasks;
- D6 diagnostic projection availability for staged Grit local feedback in spec/tasks;
- D7 `LocalFeedbackCheckProjection` consumption and refusal semantics in spec/tasks;
- D10 D11-safe protected-mutation refusal projection in spec/tasks;
- exact restage/partial-staging/base-resolution contracts in spec/tasks;
- workstream phase/ledger/checklist alignment with the repaired proposal/design.

D11 should remain blocked until those are repaired in the packet. Source implementation should not start from the current tasks/spec/control artifacts.
