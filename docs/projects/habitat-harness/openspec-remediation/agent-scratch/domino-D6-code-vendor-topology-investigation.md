# D6 Code/Vendor Topology Investigation

## Verdict

D6 has enough code and vendor surface to be specified as a complete OpenSpec
change packet before implementation, but the packet is still not complete on
current disk. A concurrent repair pass has substantially expanded
`proposal.md` and `design.md`; this report treats those changes as existing
parallel work, not authored here. Even after that repair, `spec.md`, `tasks.md`,
and `workstream/phase-record.md` still lag the real topology and actual gates.

Implementation should remain blocked until the packet normatively covers the
state families below, cites the current vendor behavior, repairs its validation
commands, and disposition records accept or reject the D6 findings.

## Sources Read

Mandatory skill sources read in full:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`

Repo and D6 packet sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D6-diagnostic-pattern-catalog.md`
- All files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d6-diagnostic-pattern-catalog/`
- Concurrent D6 final-review scratch files present after the investigation began:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-final-domain-ontology-review.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D6-typescript-validation-final-review.md`

Code, pattern, and test sources read:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-failures.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-injected-probe.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/habitat-process.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/workspace-tools.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
- All 32 files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/checks`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/apply/docs_local_checkout_paths_rewrite.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-adapter.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/grit/grit-patterns.test.ts`

Official/native vendor sources used:

- [Grit CLI Reference](https://docs.grit.io/cli/reference)
- [Testing GritQL](https://docs.grit.io/guides/testing)
- [GritQL language overview](https://docs.grit.io/language/overview)
- [GritQL functions](https://docs.grit.io/language/functions)
- [GritQL patterns](https://docs.grit.io/language/patterns)

## Worktree Note

Initial `git status --short --branch` and `gt status` showed branch
`codex/habitat-docs-durability-pattern` clean. After running validation and
current-check commands, the worktree contained concurrent D6 edits to
`proposal.md` and `design.md` plus two untracked D6 final-review scratch files.
Those edits are not modified or reverted by this report.

## Current Code Map

### Execution Materialization

`workspace-tools.ts` maps `grit` to the workspace `bun run --cwd <repo> grit`
execution plane. Direct `grit --version` is not available in this shell, while
`bunx --bun grit --version` reports `grit 0.1.1`. D6 validation commands should
use Habitat/root workspace entrypoints, not assume a globally installed Grit
binary.

### Process Receipt Layer

`habitat-process.ts` owns generic process execution receipt fields:

- `HabitatCommandKind` includes `grit-check`, `grit-apply`, and
  `grit-pattern-test`.
- `GritParseStatus` is currently
  `unparsed | parsed | no-json | malformed | schema-drift | unsupported-mode`.
- `CommandCachePolicy` models `default | disabled | isolated` plus optional
  observable status.
- `HabitatCommandResult` captures argv, cwd, env delta, git state, scan roots,
  bounded stdout/stderr captures, parse status, failure tag, and non-claims.

D6 should project from this receipt layer. It should not expose full
`HabitatCommandResult` as the downstream D6 contract unless D0/D1 explicitly
authorize that public surface.

### Grit Adapter Flow

`grit.ts` is the current hub. It does more than one D6 concern:

1. Selects rule groups:
   - source Grit rules use JSON `grit check`;
   - docs Grit checks use text `grit check`;
   - `docs_local_checkout_paths` uses `grit apply ... --dry-run --force --output standard` as a diagnostic.
2. Derives and validates scan roots.
3. Builds Grit command requests and cache environment.
4. Parses JSON output, text output, and apply dry-run output.
5. Projects native results onto Habitat rule diagnostics.
6. Emits adapter failures as ordinary diagnostics with rendered text.

Important current line-level anchors:

- `runGritRules()` splits docs/source/apply-backed paths around `grit.ts:126`.
- `runGritRuleGroup()` validates scan roots, runs `gritCheckProgram()`, and maps parse failures to rule diagnostics around `grit.ts:165`.
- `runDocsApplyBackedGritRules()` uses apply dry-run diagnostics around `grit.ts:215`.
- `gritCheckRequest()` builds `["--json", "check", "--level", "error", ...scanRoots]` or text `["check", "--level", "error", ...scanRoots]` around `grit.ts:428`.
- `parseGritCheckOutput()` requires an exact JSON object in one output stream and fails wrapper text as `GritMalformedJson` around `grit.ts:536`.
- `projectGritResults()` matches `local_name` or `check_id` and currently falls back through `rule.gritPattern ?? rule.id` around `grit.ts:600`.
- `validateScanRoots()` returns `string | null` for empty, outside-repo, missing, generated, protected, and unapproved roots around `grit.ts:682`.

### Failure Taxonomy

`grit-failures.ts` defines a single broad `GritAdapterFailureTag` family:

- D6 diagnostic adapter states: `GritToolUnavailable`, `GritCommandFailed`,
  `GritNoJson`, `GritMalformedJson`, `GritSchemaDrift`,
  `GritUnexpectedResultShape`, `GritEmptyScanRoots`,
  `GritPatternProjectionMiss`, `GritUnexpectedPatternIdentity`,
  `GritCacheProvenanceMissing`, `GritAdapterInternalContractViolation`.
- D9 apply transaction states currently mixed into the same type:
  `GritApplyDirtyWorktree`, `GritApplyDryRunMismatch`,
  `GritApplyUnexpectedFile`, `GritApplyMissingTargetExport`,
  `GritApplyRollbackFailed`.

This is the clearest owner-boundary smell. D6 can retain a compatibility facade
if D0 requires it, but the D6 target model needs a diagnostic-only subset.

### Injected Probe Flow

`grit-injected-probe.ts` creates scoped temporary probe/control files, runs
`runGritRules()` with fresh cache and `requireObservableCacheStatus`, verifies
exact diagnostic projection, verifies the control path did not match, compares
git state before/after, and cleans up acquired files.

Current probe constraints include:

- rule must be a registered `grit-check` rule;
- metadata paths must match requested probe/control paths;
- `patternIdentity` must match `rules.json`;
- scan roots must allow injected probe roots;
- probe paths must be inside scan roots;
- probe paths must include a probe-owned `__habitat` path segment;
- probe paths must not already exist or be ignored by Git;
- optional final dirty status can fail the probe.

The current public result still uses `proofClass: "injected-violation"`. D6
should treat that as compatibility wording only if D0/D1 require it.

### Rule And Pattern Inventory

`rules.json` currently has 32 `ownerTool: "grit-check"` rows:

- 31 enforced source/test Grit checks.
- 1 advisory docs check, `docs-local-checkout-paths`, with
  `gritPattern: "docs_local_checkout_paths"`.

The `.grit/patterns/habitat/checks` directory contains 32 Markdown pattern
files. The source checks primarily use `language js(typescript)` and embedded
positive/negative fixtures. `docs_local_checkout_paths.md` uses
`language markdown`.

The apply directory contains `docs_local_checkout_paths_rewrite.md`, whose
frontmatter level is `none` and whose GritQL body uses a JavaScript function to
rewrite local absolute docs paths to repo-relative docs paths.

## Vendor Facts D6 Must Respect

Grit owns these native concepts. Habitat should wrap them only where D6 needs
bounded command/diagnostic projection.

- The Grit CLI reference defines `grit check` as checking the current directory
  for pattern violations. It accepts target paths that default to `.` and
  supports options including `--fix`, `--level`, `--no-cache`, and
  `--refresh-cache`.
- Grit's top-level `--json` flag is documented as supported only on some
  commands. The docs do not give Habitat an official stable JSON schema for
  `grit check`; Habitat's parser is therefore an adapter contract and must fail
  closed when output is not exact JSON.
- `grit apply` is the native write/rewrite command. It accepts a pattern or
  workflow plus paths and supports `--dry-run`, `--force`, and `--output`.
  Habitat may use apply dry-run as a diagnostic observation, but D6 must label
  that as `standard-apply-dry-run`, not as a normal `grit check` result or apply
  safety.
- `grit patterns test` is the native fixture oracle for all defined patterns,
  with `--filter` available for subsets. This is native pattern correctness, not
  current-tree structural cleanliness and not Pattern Governance admission.
- Official Grit pattern Markdown conventions make the filename the pattern name,
  the first heading the title, the first non-heading paragraph the description,
  the first fenced block the GritQL body, and frontmatter `level`/`tags`
  metadata available to diagnostics.
- Official JavaScript functions inside GritQL are documented as alpha, sandboxed,
  unable to access the filesystem/network, and usable as replacement values. D6
  should record this as a vendor limitation for the docs rewrite diagnostic path
  rather than inventing a Habitat-specific rewrite runtime.

## Owner Boundaries

| Concern | D6 position | Owner |
| --- | --- | --- |
| Rule identity and Grit metadata facts | D6 consumes only projected facts | D2 Rule Registry Metadata |
| Pattern fixture syntax and semantics | D6 observes native results | Grit |
| Diagnostic catalog entry identity | D6 owns | D6 |
| Native command request/output contract | D6 owns bounded projection | D6 plus process receipt compatibility |
| Scan-root acceptance/refusal | D6 owns diagnostic decision | D6 |
| Adapter acquisition and adapter failure | D6 owns diagnostic subset | D6 |
| Final report assembly, command `ok`, selector behavior | D6 must not own | D7 |
| Baseline classification | D6 must not own | D5 |
| Candidate/registered/admitted pattern lifecycle | D6 must not own | D8 |
| Apply/fix transaction safety and rollback | D6 must not own | D9 |
| Hook/staged-file sequencing | D6 must not own | D11 |
| Broad execution provenance substrate | D6 may trigger only with a local DTO failure | D15 |

## Write Set And Protected Set

Current expanded `design.md` names a mostly correct later implementation write
set. This investigation confirms it:

Allowed later D6 source/test candidates:

- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/lib/grit-failures.ts` for diagnostic subset/facade
- `tools/habitat-harness/src/lib/grit-injected-probe.ts`
- Grit-scoped projections in `tools/habitat-harness/src/lib/habitat-process.ts`
  only if D15 is not triggered
- `tools/habitat-harness/src/lib/workspace-tools.ts` only for command
  materialization proof if D0/D1 require it
- `tools/habitat-harness/src/rules/rules.json` only after live D2 Grit facts
  are the source of truth
- `.grit/patterns/habitat/checks/**` only for diagnostic fixture/capability
  repairs, not governance admission
- `tools/habitat-harness/test/lib/grit-adapter.test.ts`
- `tools/habitat-harness/test/lib/grit-injected-probe.test.ts`
- `tools/habitat-harness/test/grit/grit-patterns.test.ts`
- D6 OpenSpec/workstream/docs surfaces required by accepted packet repairs

Protected from D6:

- D5 baseline authority and baseline JSON except D5-approved D6 fixtures.
- D7 report assembly and command-wide exit/status policy.
- D8 Pattern Governance lifecycle and admission.
- D9 apply/fix transaction implementation and D9 apply failure taxonomy, except
  compatibility references needed to split D6 ownership.
- D11 hook/staged-file orchestration.
- D13 generators/manifests.
- D15 shared execution substrate unless D6-local DTOs are proven insufficient.
- Generated outputs and lockfiles unless regenerated by the repo process.

## State Matrix Gaps

| State family | Current code evidence | Current packet gap |
| --- | --- | --- |
| Catalog entry identity | Rules carry `ruleId` and `gritPattern`; projection falls back to `ruleId`. | `spec.md` does not normatively define `diagnosticCatalogEntryId`, `patternIdentity`, missing identity refusal, or native identity precedence. |
| Command output contract | JSON check, text check, and apply dry-run all exist. | `spec.md` does not split `json-report`, `standard-text-report`, and `standard-apply-dry-run` scenarios. |
| Scan roots | Empty/outside/missing/generated/protected/unapproved/docs/injected/test expansion exist in code/tests. | `spec.md` has no refusal-state matrix; `tasks.md` only says "normalization and failure states". |
| Adapter failure | Broad tag list exists and is rendered as diagnostic text. | `spec.md` does not require structured failure projection or forbid D9 `GritApply*` states in D6. |
| Parse result | `ok` union with optional fields exists. | Packet needs a normative closed acquisition union in spec/tasks, not only design prose. |
| Projection | Exact/duplicate/wrong/missing/outside pattern tests exist. | `spec.md` does not specify projection miss and unexpected identity scenarios. |
| Cache/freshness | Fresh isolated temp cache and missing observable cache tests exist. | `spec.md` does not distinguish ordinary unknown-allowed from probe proof missing-required. |
| Injected probe | Scoped probe, control, cleanup, protected path, mirror root, adapter failure tests exist. | `spec.md` has no injected probe requirement or scenarios. |
| Vendor fixture oracle | `grit patterns test --json` is tested. | Packet must state this proves native pattern fixtures only, not wrapper/current-tree cleanliness. |
| Current-tree wrapper | `habitat check --tool grit-check --json` currently fails with `GritMalformedJson`. | Packet must carry this as an implementation bad case/gate, not list generic `habitat check --json`. |

## Validation Gates Observed

Commands run:

- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`: passed, change is valid.
- `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts`: passed, 3 files and 31 tests.
- `bun run habitat check --tool grit-check --json`: failed with exit 1. Source Grit checks projected `GritMalformedJson` because Habitat requires exact JSON and observed wrapper text. The docs advisory rule also reported one `docs-local-checkout-paths` finding.
- `grit --version`: failed, command not found.
- `bunx --bun grit --version`: passed, `grit 0.1.1`.

Packet command issues:

- `tasks.md`, `proposal.md`, and `phase-record.md` still list
  `test/lib/diagnostics.test.ts`, but that file is missing.
- The actual focused Grit gate includes `test/lib/grit-injected-probe.test.ts`
  and `test/grit/grit-patterns.test.ts`.
- `tasks.md` still says `bun run habitat check --json`; D6 should use
  `bun run habitat check --tool grit-check --json` and define expected behavior
  for the known `GritMalformedJson` bad case.
- `phase-record.md` still records branch `codex/deep-habitat-openspec-remediation`,
  while this worktree is on `codex/habitat-docs-durability-pattern`.

## Findings

### P1: `spec.md` is still a scaffold, not the D6 contract

The expanded `design.md` now names many of the right state families, but the
actual OpenSpec spec still has only one requirement with two broad scenarios.
That means OpenSpec validation can pass while implementation agents still have
to invent identity, command output contracts, scan-root refusal states, adapter
failure subsets, cache/freshness states, projection miss states, and injected
probe outcomes.

Repair: expand `specs/habitat-harness/spec.md` into normative requirements and
scenarios for each state family in the matrix above. The scenarios must include
bad cases, not only happy-path findings and generic cannot-run failure.

### P1: Validation gates in packet control files are factually wrong

The packet still names `test/lib/diagnostics.test.ts`, which is missing. It
omits the actual focused Grit gates that passed in this investigation:
`test/lib/grit-injected-probe.test.ts` and `test/grit/grit-patterns.test.ts`.
It also lists `bun run habitat check --json` instead of the Grit-specific
current-tree command D6 cares about.

Repair: update `tasks.md`, `workstream/phase-record.md`, and proposal validation
text to use exact commands:

- `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts test/lib/grit-injected-probe.test.ts test/grit/grit-patterns.test.ts`
- `bun run habitat check --tool grit-check --json`
- `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`
- `bun run openspec:validate`
- `git diff --check`
- `git status --short --branch` when injected probe cleanup is part of the claim

### P1: Current-tree Grit wrapper behavior is a live blocker, not a footnote

`bun run habitat check --tool grit-check --json` currently exits 1 with
`GritMalformedJson` for source Grit checks because Habitat's JSON parser refuses
wrapper text around JSON. The D6 source packet already called out
`GritMalformedJson` projection risk. The OpenSpec packet must make this a
first-class current-tree wrapper bad case.

Repair: add a spec scenario requiring adapter failure projection when native
`--json` output is not exact JSON. The packet should not claim current-tree Grit
diagnostics pass until that behavior is fixed or explicitly non-claimed.

### P1: D6 must preserve vendor-owned command distinctions

The current adapter has three different native contracts: JSON `grit check`,
text `grit check`, and `grit apply --dry-run --output standard`. Official Grit
docs support those as distinct command concepts. Treating the docs apply-backed
diagnostic as just another check result would let D6 invent a harness around
Grit instead of respecting native behavior.

Repair: require a closed `outputContract` family in spec: `json-report`,
`standard-text-report`, and `standard-apply-dry-run`. Add scenarios for docs
apply-backed diagnostics that explicitly state they do not prove apply
transaction safety.

### P2: The packet has not synchronized current concurrent repairs into tasks and ledgers

The expanded `proposal.md` and `design.md` are much closer to the needed D6
packet, but `tasks.md`, `spec.md`, `phase-record.md`, `review-disposition-ledger.md`,
and `downstream-realignment-ledger.md` still reflect scaffold state. That leaves
implementation sequencing and acceptance state ambiguous.

Repair: after final review disposition, update tasks and ledgers to name the
accepted findings, exact repaired requirements, blocked/unblocked status, and
downstream surfaces. The review ledger should stop saying only "pending design
review" once D6 final review findings exist.

### P2: Adapter failure state is still rendered as text before it is machine data

`renderGritAdapterFailure()` writes a structured-looking marker into a diagnostic
message, and `findAdapterFailure()` later recovers state with a regex. That is a
compatibility behavior, not a target D6 model.

Repair: require structured adapter failure projection in `spec.md`. Message
rendering can remain as D0-compatible output, but machine behavior must not
depend on parsing diagnostic prose.

### P2: The packet needs a D2 live-facts dependency, not whole-rule leakage

Current `runGritRules()` and `projectGritResults()` consume full `HarnessRule`
rows and use `rule.gritPattern ?? rule.id`. The expanded design rejects that,
but the spec/tasks do not make it a falsifiable implementation gate.

Repair: add a task and scenario requiring D6 to consume D2 Grit facts and refuse
missing/malformed `patternIdentity` before native command execution. Add a bad
case where fallback to `ruleId` fails the test.

### P2: Cache/freshness semantics need to be packet-level, not caller convention

Injected probes rely on `cacheMode: "fresh"` and
`requireObservableCacheStatus: true`; ordinary diagnostics can tolerate unknown
workspace cache only with non-claims. This is a state distinction, not a boolean
option preference.

Repair: add `DiagnosticCacheRequirement` and `DiagnosticCacheObservation`
requirements to the spec, with scenarios for fresh observed, workspace unknown
allowed, and required observation missing.

### P3: Pattern files are native fixture assets, not governance records

The 32 Markdown files in `.grit/patterns/habitat/checks` match official Grit
pattern-file conventions and are validated by native `grit patterns test`.
Their existence and fixture success should not be treated as Pattern Governance
admission, baseline acceptance, or hook eligibility.

Repair: explicitly state that native pattern fixture success is a D6 diagnostic
capability fact only. D8 owns admission.

### P3: Phase record branch/worktree metadata is stale

`workstream/phase-record.md` says branch
`codex/deep-habitat-openspec-remediation`, but the actual branch is
`codex/habitat-docs-durability-pattern`.

Repair: update the phase record as part of packet repair so continuation agents
do not operate on stale branch assumptions.

## Exact Packet Repair Recommendations

1. Update `specs/habitat-harness/spec.md` with separate requirements for:
   diagnostic catalog identity, scan-root decisions, native command request and
   output contracts, adapter acquisition, adapter failure subset, diagnostic
   projection, cache/freshness, injected probe outcomes, consumer projections,
   and prohibited inferences.
2. Replace broad scenarios with concrete good and bad cases:
   clean result, findings result, empty scan roots, generated/protected roots,
   docs root allowed only for docs rules, injected root refused outside probe
   mode, missing pattern identity, unexpected pattern identity, no JSON,
   malformed/wrapper JSON, schema drift, cache provenance missing, apply dry-run
   docs finding, injected control match, and probe cleanup dirty.
3. Repair `tasks.md` into implementation slices that match the design sequence:
   D0 rows, live D2 Grit facts, D6 model types, diagnostic failure subset,
   structured failure projection, acquisition union, scan-root union,
   cache/freshness union, projection from D2 facts, injected probe outcome, then
   compatibility deletion.
4. Repair validation commands in all packet/control files. Remove the missing
   `test/lib/diagnostics.test.ts` gate and add the actual adapter, injected
   probe, and native pattern-test gates.
5. Add explicit current-tree behavior gate for
   `bun run habitat check --tool grit-check --json`, including the current
   `GritMalformedJson` bad case as either repaired expectation or non-claim.
6. Update `workstream/phase-record.md` with the current branch, exact write set,
   protected set, and the actual validation gate results.
7. Update `review-disposition-ledger.md` with per-D6 findings from final review
   and this topology/vendor investigation. Accepted P1/P2 findings should block
   source implementation.
8. Update `downstream-realignment-ledger.md` to name D7, D8, D9, D11, and D15
   assumptions affected by D6 state-family decisions.
9. Add a D15 trigger clause to the spec, not only design prose: D15 is dormant
   unless D6-local DTOs cannot represent required command observation without
   mutating shared process receipt semantics.
10. Re-run `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict`,
    `bun run openspec:validate`, and `git diff --check` after packet repair.

## Skills Used

Skills used: domain-design, information-design, solution-design,
civ7-open-spec-workstream, typescript-refactoring.
