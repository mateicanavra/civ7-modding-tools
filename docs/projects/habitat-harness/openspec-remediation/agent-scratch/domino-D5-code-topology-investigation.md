# D5 Baseline Authority Code Topology Investigation

## Scope And Verdict

This is a D5 design/specification investigation only. It does not authorize
source implementation, OpenSpec packet edits, baseline JSON edits, generated
artifact edits, or commits.

D5 should not advance from the current packet. The current OpenSpec packet names
Baseline Authority, but it does not yet specify the complete current topology,
write/protected set, D0 compatibility citations, D2 baseline projection
dependency, D7/D8 consumer boundary, or normative state matrix needed for later
source implementation.

The controlling source packet requires these states: explicit empty baseline,
explicit debt baseline, external exception baseline, malformed baseline, missing
baseline, orphan baseline, introduced-rule baseline expansion, and shrink-only
failure. Current code has additional reachable public states that D5 must
classify or explicitly reject before implementation: unsorted baseline,
duplicate key, non-string key, unmodeled external exception, conflicting
baseline state, comparison-base unavailable, base registry missing/malformed,
base baseline unreadable, external source unreadable/malformed, external
projection mismatch, parser-owned baseline bypass, and rule-introduction
manifest missing/mismatch.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/typescript/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D0-scenario-public-contract-inventory.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D7-structural-enforcement-pipeline.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/**`
- `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D5-review.md`
- Current code/tests/docs listed in the topology sections below.

## Current Topology Map

### Baseline Authority Core

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts`

- Public exported failure vocabulary:
  - `BaselineContractFailureReason` at lines 24-43.
  - `BaselineContractFailure` at lines 45-51.
  - Reasons currently include missing, malformed, unsorted, duplicate,
    non-string, orphan, external exception, comparison-source, parser-owned, and
    rule-introduction failures.
- Public exported state vocabulary:
  - `ExplicitEmptyBaselineState` at lines 53-59.
  - `ExplicitDebtBaselineState` at lines 61-67.
  - `ExternalExceptionBaselineState` at lines 69-77.
  - `BaselineState` at lines 79-83.
  - Current state model collapses all malformed/missing/orphan/refusal states
    into `BaselineContractFailure`, so the OpenSpec packet must say whether that
    is target shape or compatibility-only.
- Public registry input/projection adjacency:
  - `BaselineRuleContractInput` at lines 85-88 currently consumes `id` and
    `exceptionPath` from whole rule-ish records. D2 says D5 should consume
    `ruleBaselineFacts`, not parse whole rows long-term.
  - `BaselineContractContext` at lines 100-107 allows registry,
    externalSources, and ruleIntroductionManifests injection.
- Public rule-introduction shape:
  - `RuleIntroductionBaselineManifest` at lines 90-98.
  - `acceptedRuleIntroductionManifest` at lines 799-831 checks only matching
    `ruleId`, `baselinePath`, `initialBaselineKeys`, and `comparisonBase`; it
    does not check `changeId`, `ownerProject`, or `ownerTool` during expansion.
    D5 must decide whether those are contract fields or present compatibility.
- Public functions:
  - `baselinePath` lines 135-137.
  - `loadBaseline` lines 139-146.
  - `violationKey` lines 149-151; key wire shape is `path::message`.
  - `applyBaseline` lines 153-209; mutates diagnostics, validates parser-owned
    bypass and external projection equality.
  - `writeBaseline` lines 211-214; writes sorted JSON arrays.
  - `checkBaselineIntegrity` lines 255-341; validates contract, compares to
    merge-base, rejects existing-rule growth, allows introduced-rule keys only
    with a manifest.
  - `loadBaselineState` lines 343-371; file presence, external source model,
    `exceptionPath`, and missing-file state converge here.
  - `isBaselineLocked` lines 373-375; maps only explicit empty to locked.
  - `baselineFailureDiagnostic` lines 377-388; projects baseline failures into
    command diagnostics with message prefix `Baseline contract failure (...)`.
  - `validateBaselineContract` lines 390-421; finds orphan baseline files and
    loads every registered rule state.
  - `guardBaselineExpansion` lines 423-468; authoring guard result is still
    `{ ok: boolean; message; reason? }`, which the source D5 packet already
    calls out as incomplete.
  - `mergeBase` lines 240-248; also consumed by hooks.
- Internal/default external exception sources:
  - `defaultExternalExceptionSources` lines 483-500 models `adapter-boundary`
    and `doc-ambiguity`.
  - `adapter-boundary` projects keys from
    `scripts/lint/lint-adapter-boundary.sh#ALLOWLIST`.
  - `doc-ambiguity` validates `docs/.doc-ambiguity-lint-baseline.json` and
    currently projects no keys.
- Current JSON baseline file contract:
  - one file per rule under `tools/habitat-harness/baselines/<rule-id>.json`.
  - JSON must be an array of strings, duplicate-free, sorted lexicographically.
  - Current tree has 49 committed baseline JSON files, all explicit empty arrays.
  - Baseline JSON files are not generated artifacts, but they are protected debt
    records and must not be edited in D5 except for deliberately scoped fixtures
    or current-tree validation repairs named by D5.

### Baseline Contract Tests

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/baseline.test.ts`

- Existing scenarios cover explicit empty/locked state lines 28-40.
- Explicit debt application and new unbaselined errors lines 42-64.
- Missing required baseline lines 66-79.
- Malformed/non-array/non-string/duplicate/unsorted files lines 81-100.
- Orphan baseline files lines 102-114.
- External exception source and projection mismatch lines 116-142.
- Parser-owned baselining refusal for explicit Habitat state lines 144-165.
- Existing-rule growth refusal lines 167-185.
- New-rule seeded baseline requiring introduction manifest lines 187-218.
- Graphite child/trusted parent comparison behavior lines 220-271.
- Comparison-source failures lines 273-322.
- Expansion guard refusal before write lines 324-340.

These tests are the required D5 design validation inventory, not implementation
closure by themselves. The packet must name which of these remain current
compatibility, which become target requirements, and which new D5 scenarios fill
the gaps.

### Structural Enforcement Consumer

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`

- Imports baseline functions directly at lines 6-16.
- `createCheckReport` lines 273-343 mixes rule selection, execution, baseline
  load/apply/failure diagnostics, rule status derivation, and built-in
  `baseline-integrity` report construction. D7 owns the future pipeline split;
  D5 owns only the baseline decision/projection that this path consumes.
- Per-rule baseline application:
  - loads state at line 281;
  - applies baseline at line 285;
  - pushes baseline failure diagnostics at lines 286-288;
  - treats unbaselined error diagnostics as failures at lines 289-299;
  - projects `locked: isBaselineLocked(baseline)` at line 305.
- Built-in `baseline-integrity` report:
  - `checkBaselineIntegrity` call lines 314-315;
  - hard-coded rule id `baseline-integrity` lines 317 and 324;
  - `locked: true` line 321;
  - diagnostic messages are `finding.reason` lines 323-329;
  - human `message` says shrink-only additions are valid only when introducing
    the rule at lines 331-333.
- `expandBaselines` lines 345-396 is the `--expand-baseline` authoring path:
  - returns selector failures or `reason: "baseline-contract"` failures;
  - calls `applyBaseline`, `guardBaselineExpansion`, then `writeBaseline`;
  - logs `baseline written: <rule> (<n> entries)` on success.
- `commandSummary` line 1102 exposes `rule pack: <n> rules (+ baseline-integrity
  built-in)`.

D5 must not redesign `CheckReport` construction, selector failures, report
truth equivalence, staged execution, or status derivation; those are D7. D5 must
publish enough baseline authority state so D7 can consume it without reading
baseline internals.

### CLI Public Surface

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/check.ts`

- Command summary/description lines 11-13 mention shrink-only baseline integrity.
- Examples lines 14-18 include `--json` and `--rule`.
- Public flags:
  - `--json` line 21.
  - `--output` line 22.
  - selectors lines 23-25.
  - `--staged` line 26.
  - `--expand-baseline` lines 27-29, described as authoring-only.
  - `--base` lines 30-33, default `main`.
- `--expand-baseline` branches into `expandBaselines` at lines 39-43 and exits
  before report emission.
- Normal check creates and renders `CheckReport` at lines 46-53.

Any D5 change to `--expand-baseline`, `--base`, exit behavior, stdout/stderr
behavior, or help text requires concrete D0 row citation before source work.

### Package Export Surface

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`

- Baseline types exported at lines 1-7:
  - `BaselineContractFailure`
  - `BaselineContractFailureReason`
  - `BaselineContractValidation`
  - `BaselineState`
  - `RuleIntroductionBaselineManifest`
- Baseline functions exported at lines 8-19:
  - `applyBaseline`
  - `baselineFailureDiagnostic`
  - `checkBaselineIntegrity`
  - `guardBaselineExpansion`
  - `isBaselineLocked`
  - `loadBaseline`
  - `loadBaselineState`
  - `mergeBase`
  - `validateBaselineContract`
  - `violationKey`
- Command engine exports `expandBaselines`, `createCheckReport`,
  `renderCheckReport`, and `stringifyCheckReport` at lines 29-44.
- Pattern Authority manifest exports at lines 117-133 include the current D8
  consumer surface.

D5 cannot change these names, signatures, return unions, or exported status
without D0 `package-export` rows and compatibility handling. The likely target
is a facade/versioning plan, not silent export churn.

### Command JSON And Human Report Projection

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/diagnostics.ts`

- `HabitatDiagnostic` JSON fields lines 8-17 include `ruleId`, `path`, optional
  `line`, `message`, `severity`, and `baselined`.
- `RuleReport` lines 21-34 includes `ruleId`, `ownerTool`, `lane`, `status`,
  `locked`, `durationMs`, `diagnostics`, `detect`, `message`, and `remediate`.
- `CheckReport` lines 36-42 includes `schemaVersion: 1`, `command`,
  `startedAt`, `ok`, and `rules`.
- `validateCheckReport` lines 45-66 structurally validates only broad field
  types, not D5-specific decision states.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/messages.ts`

- Human renderer marks baselined diagnostics with `[baselined]` at lines 13-16.
- Locked human message: `this rule is locked (empty baseline): any violation
  fails.` at line 21.
- Debt human message: `baselined violations are tracked debt; NEW violations
  fail the check.` at line 22.

D5 must list these as D0 command-json/human-output compatibility surfaces. If
D5 adds explicit baseline decision fields, changes `locked`, changes
`baselined`, changes `baseline-integrity`, or changes messages, it needs D0
handling and likely D7 report-constructor ownership.

### Command Tests And Fixtures

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`

- Help output includes `--expand-baseline` at lines 19-24.
- Invalid selector JSON must not return only `baseline-integrity` lines 51-102.
- Baseline contract JSON reports missing/malformed/orphan states lines 142-207.
- Invalid expansion selectors fail before writing baselines lines 209-241.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-commands.test.ts`

- `expandBaselines` mock and message shape at lines 38-40.
- `--expand-baseline` command dispatch tested at lines 121-136.

These are current public behavior pins. D5 must name whether it will extend
these tests, preserve them, or leave command behavior to D7.

### Pattern Authority And Generator Consumer

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`

- Current lifecycle union line 5: `candidate`, `registered-advisory`,
  `registered-enforced`.
- Current tree result classes lines 25-29 include `accepted-baseline`.
- Current `PatternAuthorityBaselineAction` line 30:
  `committed-empty | committed-debt | blocked`.
- `RegisteredPatternAuthorityManifest.baselineContract` lines 111-115 includes
  `baselinePath`, `ruleIntroductionManifest`, and `baselineAction`.
- Registered manifest validation calls `validateBaselineContract` at line 377,
  but that local function only validates manifest field presence/enums at lines
  524-551.
- Registered contradictions reject `baselineAction: "blocked"` at lines 620-627.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`

- Promotion validates manifest then calls `validateRegisteredBaselineContract`
  at lines 39-65.
- `validateRegisteredBaselineContract` lines 148-224 independently checks:
  - baseline path equals `tools/habitat-harness/baselines/<rule>.json`;
  - `blocked` cannot register;
  - baseline file and rule-introduction manifest exist;
  - baseline JSON is a string array;
  - `committed-empty` requires empty JSON;
  - manifest `ruleId`, `ownerProject`, `ownerTool`, `baselinePath`,
    `initialBaselineKeys`, `changeId`, and `comparisonBase` are present/matching
    enough for registration.
- This is a current D8/D13 consumer-local baseline contract. D5 should not move
  Pattern Governance lifecycle/admission into D5. D5 should define a one-way
  baseline authority projection/refusal result that D8 later consumes.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/generator.cjs`

- Candidate generation refuses if an active baseline already exists at lines
  76-85.
- Candidate manifest required-for-registration includes `baseline
  rule-introduction manifest` at line 126.
- Candidate markdown states candidate has no baseline at line 134.

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/pattern-generator.test.ts`

- Candidate generation asserts no baseline file is created lines 20-33.
- Registered advisory/enforced promotion requires explicit baseline contract
  lines 139-187.
- Missing baseline file refuses promotion lines 189-207.
- Candidate generation refuses existing active baseline lines 279-301.
- Test helper writes `[]` plus rule-introduction manifest lines 396-417.

Pattern Authority currently consumes baseline state in at least three ways:
manifest schema, registered promotion refusal, and candidate collision refusal.
D5 must decide which of these are D5-owned baseline contract projection facts
versus downstream D8/D13 behavior.

### Rule Registry / D2 Baseline Relation Surface

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`

- Current registry uses `id` and `exceptionPath` for baseline relation.
- `adapter-boundary` declares `exceptionPath` as
  `scripts/lint/lint-adapter-boundary.sh#ALLOWLIST (transitional; migrates to baselines/ in H5)`
  at line 41.

D2 accepted design/spec says D5 consumes `ruleBaselineFacts`, and D2 owns the
registry relation to baseline authority but not shrink-only behavior, debt
lifecycle, expansion authorization, or stale rows. Current D5 must therefore
name its dependency on a D2 baseline projection and avoid claiming D2 registry
schema implementation.

### Nx / Cache Surface

`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js`

- Grit check target inputs include `tools/habitat-harness/baselines/**` at lines
  109-125.
- Aggregate Habitat check inputs include `tools/habitat-harness/baselines/**` at
  lines 159-172.

D5 baseline JSON changes affect graph cache inputs and need D0/Nx target row
awareness. D5 should not redesign Nx target metadata; D3 owns graph target
truth, and D7 owns command validation interpretation.

### Docs And Current Record Surfaces

- `docs/IMPLEMENTED-SURFACE.md`
  lines 11-14, 86-93, 123-129, and 146-162 describe shrink-only baseline
  contracts, locked/debt baselines, pattern promotion baseline contracts, and
  baseline validation coverage.
- `docs/SCENARIOS.md`
  lines 44-60 describe `habitat:check`, baseline application, baseline
  integrity, and JSON output.
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`
  lines 30-32 defines Manage Baselines as D5-owned.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md`
  lines 26-29 identifies Baseline Authority and Pattern Governance boundaries.
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
  line 171 records current P1 baseline claim and non-claims.

D5 packet should list docs/examples as downstream realignment surfaces, but
implementation should update them only when public behavior or accepted
terminology changes.

## Current Baseline File Inventory

Current committed baseline files under
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/baselines/`:

- 49 JSON files.
- All 49 currently contain `[]`.
- External exception sources are not baseline JSON files:
  - `adapter-boundary` projects allowlist keys from
    `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/scripts/lint/lint-adapter-boundary.sh#ALLOWLIST`.
  - `doc-ambiguity` validates
    `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/.doc-ambiguity-lint-baseline.json`.

Baseline JSON edits should be protected by default. D5 may authorize fixture
baseline JSON under tests or temporary injected test directories. Current-tree
baseline JSON edits require an explicit D5 current-tree validation reason, D0 row
citation, and Graphite/cache impact note.

## Current Consumers Of Baseline Authority State

| Consumer | Current read/write | D5 ownership | Downstream owner |
| --- | --- | --- | --- |
| `createCheckReport` | Reads `loadBaselineState`, calls `applyBaseline`, projects failures to diagnostics, adds `baseline-integrity`. | Own baseline decision/refusal projection. | D7 owns pipeline/report construction. |
| `expandBaselines` / `--expand-baseline` | Reads state, applies baseline, guards expansion, writes baseline JSON. | Own authoring guard and shrink-only rule. | D7 owns command orchestration if pipeline changes. D0 owns public flag/output compatibility. |
| `checkBaselineIntegrity` | Reads all baseline JSON, registry ids, merge-base, rule-introduction manifests. | Own shrink-only/current-tree integrity semantics. | D2 owns registry baseline facts; D7 consumes result. |
| Pattern Authority manifest validator | Carries baseline action/path/manifest fields. | Own target baseline projection/refusal vocabulary consumed by D8. | D8 owns lifecycle/admission and whether manifest can register. |
| Pattern generator registration | Independently validates baseline contract and manifest match. | D5 should replace/define the baseline authority projection it may consume. | D8/D13 own generator lifecycle/refusal behavior. |
| Pattern candidate generation | Refuses candidate when active baseline exists. | D5 defines whether active baseline existence is an authority fact or collision input. | D13 owns scaffolding refusal; D8 owns lifecycle. |
| Nx plugin targets | Includes baselines in cache inputs. | D5 owns meaning of baseline file changes. | D3 owns graph metadata/target shape. |
| Hooks | `resolvePrePushBase` uses `mergeBase` with empty baseline context. | D5 owns merge-base utility semantics only if exported baseline API changes. | D11 owns hook behavior and local feedback. |
| Docs/ledgers | Describe shrink-only, explicit baselines, and non-claims. | D5 owns durable baseline contract wording. | D0 owns docs-example compatibility; project ledgers remain downstream records. |

## Proposed D5 Write Set

This is the proposed future implementation write set after D5 packet acceptance,
not authorization for this investigation.

### D5-Owned Source/Test Paths

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts`
  - Baseline state/decision/refusal unions.
  - External exception source model variants.
  - Rule-introduction manifest contract.
  - Shrink-only/current-tree integrity guard.
  - Expansion guard result shape.
  - Baseline authority projection for D7/D8.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/baseline.test.ts`
  - Normative state-machine tests for every D5 state.
  - Guard tests for rule-introduction manifests and comparison-base failures.
  - External exception source variant tests.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/commands/habitat-entrypoints.test.ts`
  - Only baseline-command projection tests required to preserve or version D0
    command JSON/human behavior.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/generators/pattern-generator.test.ts`
  - Only D5 baseline projection consumer tests, not D8 lifecycle redesign.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
  - Only if D5 changes the baseline contract field/projection consumed by D8.
- New focused D5 fixtures under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/fixtures/` or temp-dir test helpers.

### D5-Adjacent Source Paths Requiring Bounded Justification

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts`
  - Only for D0-cited facade/export changes to baseline public API.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
  - Only to consume a D5 baseline authority projection without restructuring
    enforcement pipeline. Any broader report/pipeline extraction belongs to D7.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/commands/check.ts`
  - Only if `--expand-baseline`, `--base`, or help text must change under D0
    compatibility handling.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  - Only to consume a D5 baseline projection/refusal field. D8 owns lifecycle
    states and admission rules.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`
  - Only to replace local baseline validation with a D5-owned projection. D13/D8
    own generator lifecycle/refusal behavior.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/generator.cjs`
  - Only if active-baseline collision must call a D5 projection; otherwise D13.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json`
  - Only if D2-apvalidated `ruleBaselineFacts` implementation is already live and
    D5 must add explicit introduction/baseline references. Otherwise protected.

### D5 Docs/Spec Paths

For the current remediation pass, the packet repair write set should be limited
to OpenSpec packet artifacts when authorized by the owner:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/*.md`

This investigator did not edit those packet files.

Future implementation may update docs only when behavior or accepted target
language changes, and must cite D0 docs-example rows:

- `docs/IMPLEMENTED-SURFACE.md`
- `docs/SCENARIOS.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`

## Protected Set

D5 must protect these paths/owners unless a repaired D5 packet explicitly
amends the write set and re-reviews cross-domino ownership:

- D7 Structural Enforcement redesign:
  - broad extraction/refactor of `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
  - changes to selector semantics, report constructor ownership, staged
    execution, rule execution, Grit acquisition, status derivation, renderer
    truth equivalence, `CheckReport.ok`, and `RuleReport.status`.
- D8 Pattern Governance lifecycle/admission:
  - lifecycle union expansion, fixture strategy, false-positive model,
    hook-scope admission, apply-safety admission, candidate/registered lifecycle
    behavior except as a D5 consumer projection.
- D13 scaffolding/refusal implementation:
  - new generator lifecycle features or broad generator refusal redesign.
- D2 registry schema implementation:
  - registry parser/facet implementation, whole-row migration, graph/routing/Grit
    projection implementation except the D5 consumer interface.
- D3 graph/Nx target behavior:
  - `plugin.js` target shape, aliases, cache stance, graph metadata.
- D11 hooks:
  - pre-commit/pre-push behavior, local-feedback output, staged mutation policy.
- Generated artifacts and lockfiles:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/dist/**`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/oclif.manifest.json`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/bun.lock`
  - generated/mod output paths.
- Current baseline JSON files:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/baselines/*.json`
  - protected except explicit D5 fixtures or named current-tree validation edits.
- Active Grit patterns:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.grit/patterns/habitat/**`
  - protected unless a D8/D13 packet owns admission/generation.
- Non-Habitat product/runtime code under `mods/`, `packages/`, and `apps/`
  unless a D5 test fixture explicitly needs a controlled path.

If a D5 implementation agent cannot keep source edits inside the D5 write set,
D5 does not advance.

## D0 Compatibility Surface List Required Before Source Implementation

D0 is accepted for design/specification only. The durable matrix file
`docs/projects/habitat-harness/public-surface-compatibility-matrix.md` is not
present in this worktree. Before D5 source implementation, the packet must cite
concrete D0 `surface_id` rows for at least these baseline-related surfaces:

### CLI Rows

- `habitat check` verb.
- `habitat check --json`.
- `habitat check --output`.
- `habitat check --rule`, `--owner`, `--tool` selector interaction with
  baseline failures and `baseline-integrity`.
- `habitat check --expand-baseline`.
- `habitat check --base`.
- Root aliases `habitat`, `habitat:check`, and any documented `bun run habitat
  check -- --json` forwarding row.

### Command JSON Rows

- `CheckReport` schemaVersion 1.
- `RuleReport.locked`.
- `RuleReport.status`.
- `RuleReport.diagnostics`.
- `HabitatDiagnostic.baselined`.
- `HabitatDiagnostic.message` for `Baseline contract failure (<reason>): ...`.
- Built-in `baseline-integrity` rule report.
- `rule-selection-integrity` interaction proving invalid selectors do not return
  only `baseline-integrity`.
- `BaselineExpansionResult` stdout/error projection from `--expand-baseline`.

### Human Output Rows

- `[baselined]` diagnostic marker.
- `[locked]` rule marker.
- `this rule is locked (empty baseline): any violation fails.`
- `baselined violations are tracked debt; NEW violations fail the check.`
- `Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.`
- `baseline written: <rule> (<n> entries)`.
- Help text for `--expand-baseline` and `--base`.

### Package Export Rows

- Every baseline type/function exported from `tools/habitat-harness/src/index.ts`:
  `BaselineContractFailure`, `BaselineContractFailureReason`,
  `BaselineContractValidation`, `BaselineState`,
  `RuleIntroductionBaselineManifest`, `applyBaseline`,
  `baselineFailureDiagnostic`, `checkBaselineIntegrity`,
  `guardBaselineExpansion`, `isBaselineLocked`, `loadBaseline`,
  `loadBaselineState`, `mergeBase`, `validateBaselineContract`,
  `violationKey`.
- `expandBaselines` and `createCheckReport` as baseline-adjacent command
  exports.
- Package subpath exports from
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/package.json`,
  especially `"."`, `"./plugin"`, and `"./rules"`.

### Generator / Pattern Rows

- `@internal/habitat-harness:pattern` candidate behavior that creates no
  baseline.
- Registered pattern promotion baseline contract validation.
- Registered manifest `baselineContract` fields:
  `baselinePath`, `ruleIntroductionManifest`, `baselineAction`.
- Candidate refusal when an active baseline already exists.
- Pattern generator refusal messages for missing baseline file, blocked baseline
  action, and manifest mismatch.

### Nx / Root Script / Hook Rows

- `@internal/habitat-harness` inferred `grit:check`,
  `habitat:check`, `habitat:check:all`, and `habitat:rule:*` targets that include
  `tools/habitat-harness/baselines/**` as inputs.
- Root scripts that call Habitat or Habitat-owned Nx targets.
- Hook/pre-push use of `mergeBase` if D5 changes exported merge-base behavior.

### Docs Example Rows

- `tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md` baseline and pattern
  registration examples.
- `tools/habitat-harness/docs/SCENARIOS.md` `Run The Full Habitat Rule Pack` and
  `Promote A Grit Rule After Authority Is Accepted`.
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md`
  Manage Baselines row.
- `docs/projects/habitat-harness/recovery-claim-ledger.md` CLAIM-P1-BASELINE.

Until those rows exist and are cited, D5 may be accepted only for
design/specification, not source implementation.

## Current D5 Packet Blockers

### P1 Blockers

1. **The spec delta does not encode the full baseline state model.**
   The current spec has one broad requirement with only two scenarios. It omits
   explicit empty, explicit debt, external exception source, malformed JSON,
   non-array, non-string, duplicate, unsorted, missing baseline, orphan baseline,
   unmodeled external exception, external source unreadable/malformed, external
   projection mismatch, parser-owned bypass, comparison-base unavailable, base
   registry/base baseline failures, existing-rule growth refusal,
   introduced-rule expansion, and rule-introduction manifest mismatch.

2. **D5/D8 ownership remains ambiguous.**
   The packet says D5 will connect baselines to D8 Pattern Governance lifecycle/admission. That can
   mean D5 edits D8 lifecycle/admission or D5 depends on D8. The only safe direction is:
   D5 publishes baseline authority decisions/refusals; D8 consumes them and owns
   lifecycle/admission.

3. **D5/D2 dependency is underspecified.**
   D2 says baseline consumers receive `ruleBaselineFacts` and do not infer
   admission from file presence or whole registry rows. Current D5 packet says
   it depends on D2, but does not name the required D2 projection, malformed
   baseline relation input, or implementation block while D2 projections are not
   live.

4. **No baseline authority projection is specified for D7/D8 consumers.**
   Current consumers read internals or duplicate checks. The packet must define
   the exact D5 output contract: baseline state, baseline refusal, applied
   diagnostic decision, expansion guard decision, integrity finding, and
   Pattern Governance registration-consumer projection.

### P2 Blockers

1. **Write set/protected set are absent from the packet.**
   `proposal.md` says the write set is in `design.md`; `design.md` says an
   executor must have one before implementation. It does not name source files,
   tests, fixtures, docs, baseline JSON rules, or protected downstream owners.

2. **Validation gates are too broad or mismatched.**
   The source packet requires `bun run habitat check --rule baseline-integrity
   --json`, but current D5 uses broad `bun run habitat check --json`. Broad
   check can fail for unrelated rules and does not isolate baseline authority.
   The packet also omits injected bad-case matrix requirements.

3. **D0 compatibility is delegated but not enumerated.**
   The packet says D0 compatibility rules apply but does not list the D5 surfaces
   that need D0 rows. This blocks implementation because command JSON, human
   output, package exports, generator behavior, Nx cache inputs, and docs examples
   are all touched or at risk.

4. **Rule-introduction manifest contract is incomplete.**
   Current code exports fields `changeId`, `ruleId`, `ownerProject`,
   `ownerTool`, `baselinePath`, `initialBaselineKeys`, and `comparisonBase`, but
   expansion only checks some of them while pattern registration checks a
   different subset. D5 must choose one target contract and one consumer
   projection.

5. **External exception source variants are not specified.**
   Current model allows optional `projectedKeys`, optional `projectKeys`, and
   optional `validate`, which can create incomplete projection/validation
   combinations. The packet must define allowed variants and required fields.

6. **Baseline JSON edit policy is missing.**
   Current tree has 49 explicit empty baseline files. D5 must say whether future
   implementation may edit none, only fixtures, or specific current-tree baseline
   files with a validation reason. Without that, accidental debt edits are possible.

7. **Current command report projection is not inventoried.**
   D5 changes can alter `locked`, `baselined`, failure diagnostic messages,
   `baseline-integrity`, and exit status. The packet does not list these current
   projections or assign D5 versus D7 ownership.

### P3 Blockers

1. **Design-time versus implementation-time validation is blurred.**
   The packet lists source/test commands as if current design work can close them.
   D5 design acceptance should require OpenSpec validation and topology/state
   completeness. Source tests become later implementation gates.

2. **Downstream realignment is too generic.**
   The ledger has one row for later domino packets. It should separately name D7
   Structural Enforcement Pipeline and D8 Pattern Governance, with exact D5
   projection each consumes and what they must not own.

3. **Terminology remains too vague.**
   Terms such as orphan and removed-entry handling, baseline state lifecycle, owner/rule/governance
   relation, matched baseline entry, and owning remediation path are not defined.
   Replace them with closed states and fields.

4. **Closure checklist can pass despite semantic incompleteness.**
   The checklist says normative SHALL language with scenarios is enough. It must
   require normative scenario coverage for every source-packet state and every
   currently reachable D5 public failure state, or it will accept a thin spec.

## Required Packet Repairs Before D5 Advances

- Add a normative D5 state matrix in `design.md` covering baseline file state,
  external exception state, integrity comparison state, expansion state, and
  consumer projection state.
- Expand `specs/habitat-harness/spec.md` into separate requirements/scenarios:
  explicit baseline files, external exception sources, malformed/missing/orphan
  refusals, shrink-only integrity, rule introduction, expansion guard, parser
  bypass refusal, D2 baseline facts, D7/D8 projection consumption, and D0
  compatibility gating.
- Replace D5/D8 wording with a one-way contract:
  D5 publishes baseline authority decisions/refusals; D8 consumes them and owns
  pattern lifecycle/admission.
- Name the future implementation write set and protected set from this scratch,
  or a stricter subset.
- Enumerate D0 compatibility rows required before source implementation.
- Name D2 `ruleBaselineFacts` as the upstream registry relation and state that
  source implementation remains blocked until D2 provides live projections or
  D5 explicitly stays on current compatibility input with a migration stop
  condition.
- Replace broad validation with:
  - design-time: `bun run openspec -- validate deep-habitat-d5-baseline-authority --strict`,
    `bun run openspec:validate`, `git diff --check`;
  - later implementation: `bun run --cwd tools/habitat-harness test --
    test/lib/baseline.test.ts`, focused command/generator tests only if public
    projections change, `bun run habitat check --rule baseline-integrity --json`,
    and injected bad-case validation for missing/malformed/orphan/growth/introduced
    rule cases.

## Non-Claims

- This investigation does not accept D5.
- This investigation does not edit D5 packet files or Habitat source.
- This investigation does not validate current baseline code is correct.
- This investigation does not accept D7 or D8.
- This investigation does not claim broad `habitat check --json` is a valid D5
  closure validation.
- This investigation does not authorize baseline JSON edits.

Skills used: domain-design, information-design, solution-design, civ7-open-spec-workstream, typescript.
