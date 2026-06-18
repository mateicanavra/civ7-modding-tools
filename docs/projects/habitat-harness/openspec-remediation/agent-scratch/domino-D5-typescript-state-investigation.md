# D5 TypeScript State-Space Investigation

## Verdict

D5 remains blocked for TypeScript state-model reasons.

The current D5 OpenSpec packet identifies the right smell class, but it does not
yet specify the target discriminated unions, projection contracts, refusal
states, public-surface compatibility gates, or safe implementation sequence in
enough detail to prevent the execution agent from deciding the model later.

The complete target model is: Baseline Authority owns one closed baseline-decision model
and exports bounded projections to D7/D8. It does not expose whole baseline
records, does not let command-engine assemble baseline authority inline, does
not let external exception sources mix optional projection and validation paths,
and does not change public command/package/generator surfaces until D0 rows
authorize that exact surface change.

Skills read:

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- Full repo-local TypeScript refactoring corpus:
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/civ7-systematic-workstream/SKILL.md`

## State-Space Smell Inventory

### 1. Boolean guard result keeps contradictory states reachable

Current code exports:

- `BaselineExpansionGuardResult` as `{ ok: boolean; message: string; reason?: BaselineContractFailureReason }` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:223`.
- `guardBaselineExpansion()` returns failure objects with `ok: false` plus reason, but success returns only `{ ok: true, message }` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:423` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:467`.
- `acceptedRuleIntroductionManifest()` repeats the same boolean-result shape internally at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:799`.

This is the TypeScript refactoring smell "flag/boolean soup" plus optional
property soup. The type permits `ok: true` with `reason`, `ok: false` without
`reason`, and a generic success message that lacks the accepted write facts.
D5's source packet explicitly says this must be tightened into discriminated
states at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:54`.

The current OpenSpec design only says "guard decisions" and "refusals" in prose
at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:36`. It does not define the union. Execution would still choose the discriminant, variants, and fields.

### 2. External exception model permits optional projection and validation combinations

Current code exposes `ExternalExceptionSourceModel` with optional
`projectedKeys`, optional `projectKeys`, and optional `validate` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:109`.

`loadExternalExceptionState()` accepts whichever optional fields happen to be
present, falls back to `[]`, and then emits a single
`external-exception-source` state at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:622`.

Reachable invalid states:

- A source can have neither `projectedKeys` nor `projectKeys`, which silently
  projects an empty set.
- A source can have both fixed keys and a projector, and precedence becomes an
  implementation detail.
- Validation can exist without a projection contract.
- The final `ExternalExceptionBaselineState` records only `sourcePath`, owner,
  migration owner, and keys; it loses the source variant that explains why this
  external source is valid.

The source packet requires external source variants so incomplete
projection/validation combinations cannot exist at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:68`. The OpenSpec packet does not encode those variants.

### 3. Baseline authority leaks whole records and raw mutable diagnostics

`applyBaseline()` accepts `Set<string> | BaselineState` and mutates
`HabitatDiagnostic.baselined` in place at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:153`.

That preserves an old compatibility path (`Set<string>`) alongside the new
baseline state model. It also makes command-engine responsible for interpreting
the side effect rather than consuming a bounded authority projection. D5 should
not allow both "raw set of keys" and "stateful authority object" as equal input
models after the refactor, unless D0 marks `loadBaseline()`/`Set` compatibility
as preserved behind a facade.

The D0 design names this broader smell as command DTO / whole-record leakage:
command JSON types and package exports must be classified before later packets
change them at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md:215` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/design.md:295`.

### 4. Command-engine owns inline baseline decisions that D5 should own

`createCheckReport()` currently loads baseline state, applies baselines, converts
failures to diagnostics, computes new violations, computes `locked`, and emits a
rule report inline at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:273`.

`expandBaselines()` repeats baseline loading, application, expansion guarding,
and writing at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts:345`.

This is duplicated authority and feature envy. Command-engine should consume a
Baseline Authority result, not synthesize the baseline decision from
`BaselineState`, mutated diagnostics, and guard booleans.

The D5 OpenSpec packet still says "Connect baselines to D2 registry facets and
D8 Pattern Governance lifecycle/admission" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:24`, but it does not define the command-engine projection or state owned by D5. That leaves implementation free to move code around without deleting the duplicated state machine.

### 5. Pattern Governance has a parallel baseline contract

Pattern Authority currently has its own baseline states:

- `PatternAuthorityCurrentTreeResultClass = "zero-findings" | "accepted-baseline" | "findings-block-registration"` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts:25`.
- `PatternAuthorityBaselineAction = "committed-empty" | "committed-debt" | "blocked"` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts:30`.
- `baselineContract` carries `baselinePath`, `ruleIntroductionManifest`, and `baselineAction` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts:111`.

Those states are not wrong as Pattern Governance product language, but D5 must
define the one-way projection boundary. Pattern Governance may say "registration
is blocked" or "manifest declares committed empty/debt"; it must not re-decide
baseline shrink-only, external exception projection equality, or introduced-rule
seed authorization.

The prior review already caught the D5/D8 ownership ambiguity. The TypeScript
version is sharper: D5 must publish a bounded baseline authority projection that
D8 consumes, and D8 must not consume `BaselineState` or maintain a second
baseline-debt validator.

### 6. Parser-owned baseline bypass is a first-class state but not a target model

`applyBaseline()` treats pre-baselined diagnostics as valid only for
external-exception states and rejects them for explicit Habitat baselines with
`parser-owned-baseline-without-contract` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts:190`.

That is a useful refusal, but D5 does not specify it as a target state. The
current spec delta has only "existing debt is checked" and "new debt appears" at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:7`.

If D5 does not name parser-owned bypass as a required refusal state, an
implementation can keep parser-owned baselining alive as an alternate transport
or fold it into a generic "new debt" message, losing the authority boundary.

### 7. Public compatibility is acknowledged but not controlled through D0 rows

D5 affects package exports from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts:1`, command JSON/human output in `createCheckReport()`, `--expand-baseline` behavior in `expandBaselines()`, baseline JSON files, and Pattern Governance manifest/generator baseline fields.

D0 requires concrete matrix rows before later packets change command behavior,
command JSON, package exports, generator behavior, hook output, or examples at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:3`.

The D5 packet only says D0 compatibility must be dispositioned at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:50`. It does not enumerate required D0 rows or block individual source-surface changes behind them. No implemented
`docs/projects/habitat-harness/public-surface-compatibility-matrix.md` exists in
this worktree, so D5 implementation must stay blocked for public-surface changes
until those rows exist.

## Target Type And State Model Recommendations

### Baseline load state

D5 should specify a closed baseline load union with variant-owned fields. The
names below are recommendations; the important requirement is the state shape and
ownership.

```ts
type BaselineLoadState =
  | {
      kind: "explicit-empty";
      ruleId: RuleId;
      baselinePath: BaselinePath;
      keys: readonly [];
      debtState: "locked-empty";
    }
  | {
      kind: "explicit-debt";
      ruleId: RuleId;
      baselinePath: BaselinePath;
      keys: readonly BaselineKey[];
      debtState: "tracked-debt";
    }
  | {
      kind: "external-exception";
      ruleId: RuleId;
      source: ExternalExceptionSource;
      projection: BaselineProjection;
      debtState: "tracked-external-exception";
    }
  | BaselineRefusal;
```

Do not use `locked: boolean` as the primary state. `explicit-empty` and
`explicit-debt` already encode the lock behavior. A derived helper can project
`locked` for D0-preserved command output.

### External exception source model

The optional-field model should collapse into variants:

```ts
type ExternalExceptionSource =
  | {
      kind: "fixed-projection";
      ruleId: RuleId;
      sourcePath: SourcePath;
      owner: BaselineOwner;
      migrationOwner: BaselineOwner;
      projectedKeys: readonly BaselineKey[];
      validation: "source-readable" | "schema-checked";
    }
  | {
      kind: "computed-projection";
      ruleId: RuleId;
      sourcePath: SourcePath;
      owner: BaselineOwner;
      migrationOwner: BaselineOwner;
      project: (context: BaselineProjectionContext) => BaselineProjectionResult;
    };

type BaselineProjectionResult =
  | { kind: "projection-accepted"; keys: readonly BaselineKey[] }
  | BaselineRefusal;
```

If a source needs both validation and computation, that should be one
`computed-projection` function returning either accepted projection or refusal.
There should be no state where validation exists without projection, projection
falls back to `[]`, or both fixed and computed projections compete.

### Baseline application decision

D5 should define the result of applying authority to diagnostics without exposing
mutable diagnostics as the authority surface:

```ts
type BaselineApplicationDecision =
  | {
      kind: "applied-explicit-baseline";
      ruleId: RuleId;
      matchedKeys: readonly BaselineKey[];
      newViolationKeys: readonly BaselineKey[];
      staleBaselineKeys: readonly BaselineKey[];
      locked: boolean; // compatibility projection only, derived from state
    }
  | {
      kind: "applied-external-exception";
      ruleId: RuleId;
      matchedProjectedKeys: readonly BaselineKey[];
      projectionSource: SourcePath;
      newViolationKeys: readonly BaselineKey[];
    }
  | BaselineRefusal;
```

This lets command-engine ask Baseline Authority for a decision, then map that
decision to D1/D0 command output. It also makes stale rows explicit instead of
leaving "orphan and removed-entry handling" as prose.

### Expansion guard decision

Replace `BaselineExpansionGuardResult` with a union:

```ts
type BaselineExpansionDecision =
  | {
      kind: "expansion-accepted-for-introduced-rule";
      ruleId: RuleId;
      acceptedKeys: readonly BaselineKey[];
      comparisonBase: GitRef;
      introductionManifest: RuleIntroductionBaselineManifest;
    }
  | {
      kind: "expansion-refused";
      ruleId: RuleId;
      attemptedKeys: readonly BaselineKey[];
      reason: BaselineExpansionRefusalReason;
      message: string;
    };

type BaselineExpansionRefusalReason =
  | "comparison-base-unavailable"
  | "base-rule-registry-missing"
  | "base-rule-registry-malformed"
  | "base-baseline-unreadable"
  | "existing-rule-growth"
  | "rule-introduction-manifest-missing"
  | "rule-introduction-manifest-mismatch";
```

The success variant must own `acceptedKeys`, `comparisonBase`, and manifest
identity. A success state with a failure `reason` must be unrepresentable.

### Baseline refusal

Do not use one generic failure object for all baseline states. D5 should name a
closed refusal family and state which refusals are contract failures, comparison
failures, projection failures, parser-owned bypass failures, and expansion
failures.

```ts
type BaselineRefusal =
  | {
      kind: "baseline-refusal";
      family: "baseline-file-contract";
      reason:
        | "missing-baseline"
        | "malformed-baseline"
        | "unsorted-baseline"
        | "duplicate-baseline-key"
        | "non-string-baseline-key"
        | "orphan-baseline";
      ruleId?: RuleId;
      path: string;
      message: string;
    }
  | {
      kind: "baseline-refusal";
      family: "external-exception-contract";
      reason:
        | "unmodeled-external-exception"
        | "external-exception-source-unreadable"
        | "external-exception-source-malformed"
        | "external-exception-projection-mismatch";
      ruleId: RuleId;
      sourcePath: string;
      message: string;
    }
  | {
      kind: "baseline-refusal";
      family: "parser-owned-bypass";
      reason: "parser-owned-baseline-without-contract";
      ruleId: RuleId;
      message: string;
    }
  | {
      kind: "baseline-refusal";
      family: "comparison-source";
      reason:
        | "comparison-base-unavailable"
        | "base-rule-registry-missing"
        | "base-rule-registry-malformed"
        | "base-baseline-unreadable";
      ruleId?: RuleId;
      message: string;
    }
  | {
      kind: "baseline-refusal";
      family: "rule-introduction";
      reason:
        | "baseline-growth-existing-rule"
        | "rule-introduction-manifest-missing"
        | "rule-introduction-manifest-mismatch";
      ruleId: RuleId;
      attemptedKeys: readonly BaselineKey[];
      message: string;
    };
```

The exact family names can change, but the packet must prevent generic
`BaselineContractFailureReason` from becoming a catch-all that hides which
consumer owns the next action.

### D2 input and D7/D8 output projections

D5 must consume D2 through `ruleBaselineFacts` only. It must not accept a whole
rule row, raw `exceptionPath`, or file-presence-only state as authority. D2 says
`ruleBaselineFacts` includes rule id, baseline state, exception source, and
introduction manifest relation while excluding the whole row at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:189`.

D5 should publish two bounded consumer projections:

```ts
type StructuralEnforcementBaselineProjection =
  | {
      kind: "enforcement-baseline-projection";
      ruleId: RuleId;
      application: BaselineApplicationDecision;
      diagnostics: readonly BaselineDiagnosticProjection[];
    };

type PatternGovernanceBaselineProjection =
  | {
      kind: "governance-baseline-projection";
      ruleId: RuleId;
      baselineAction:
        | "committed-empty"
        | "committed-debt"
        | "blocked-by-baseline-refusal";
      baselinePath: string;
      ruleIntroductionManifestPath?: string;
      refusal?: BaselineRefusal;
    };
```

D7 consumes enforcement projection. D8 consumes governance projection. Neither
receives `BaselineState`, the whole rule record, raw diagnostics, or raw manifest
records unless a D0 row explicitly preserves that as a public/package surface.

## Safe Refactor Sequence For Later D5 Implementation

1. **D0 gate before public changes.** Add or cite D0 rows for baseline package
   exports, check command JSON/human output, `--expand-baseline`, baseline JSON
   files, Pattern Authority manifest baseline fields, generator baseline outputs,
   and docs examples. Without concrete rows, D5 source implementation may only
   add internal types behind preserved behavior.

2. **Characterize current behavior.** Run and extend
   `bun run --cwd tools/habitat-harness test -- test/lib/baseline.test.ts` with
   missing, malformed, duplicate, unsorted, orphan, external projection mismatch,
   parser-owned bypass, comparison-source failure, existing-rule growth,
   introduced-rule success, manifest missing, and manifest mismatch cases. Add
   command-level characterization for baseline-integrity JSON output before
   changing command projection.

3. **Introduce internal target unions without changing exports.** Add the closed
   `BaselineLoadState`, `ExternalExceptionSource`, `BaselineApplicationDecision`,
   `BaselineExpansionDecision`, and `BaselineRefusal` types in the Baseline
   Authority module. Keep legacy exports as compatibility facades until D0 rows
   decide whether to preserve, version, facade, deprecate, or refuse them.

4. **Collapse external exception optionals first.** Replace
   `ExternalExceptionSourceModel` optional `projectedKeys`/`projectKeys`/`validate`
   with source variants. Remove the `[]` fallback. Compile and run baseline
   tests.

5. **Collapse expansion guard booleans.** Replace `BaselineExpansionGuardResult`
   and `acceptedRuleIntroductionManifest()` boolean results with
   `BaselineExpansionDecision`. Update `expandBaselines()` through a compatibility
   adapter if D0 requires old output messages. Compile and run baseline tests.

6. **Add Baseline Authority application projection.** Replace command-engine's
   inline `loadBaselineState()` plus `applyBaseline()` interpretation with one
   Baseline Authority function that returns `BaselineApplicationDecision`.
   Command-engine maps the decision to reports; it does not decide baseline
   authority. Compile and run command and baseline tests.

7. **Delete legacy `Set<string>` baseline application path or isolate it behind
   a D0 facade.** If `loadBaseline()` remains public, keep it as a compatibility
   projection that calls the new authority model. Do not let internal command or
   governance code use `Set<string>` as authority.

8. **Introduce D8 projection last.** Map D5 decisions into the
   Pattern Governance baseline projection. Keep D8 lifecycle/admission ownership
   outside D5. Add Pattern Authority tests proving D8 cannot bypass D5 refusal
   states.

9. **Run gates after each logical move.** Required gates: focused baseline tests,
   focused Pattern Authority tests, relevant command tests, `bun run habitat
   check --rule baseline-integrity --json`, OpenSpec validation, and `git diff
   --check`. Each move must reduce state space or delete duplicated authority.

## P1 Blockers In Current D5 Packet

### P1-1: D5 does not specify the target TypeScript state model

The D5 source packet requires collapsing boolean guard results and optional
external exception models into unions at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:73`. The current OpenSpec design does not define those unions. It says later execution must have no model decision to invent at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:5`, but then leaves the actual model unspecified.

This blocks D5 because execution can still choose:

- whether `locked` remains a boolean or becomes derived from state;
- whether `BaselineContractFailure` remains a catch-all or splits into refusal families;
- whether external exceptions are fixed-projection or computed-projection variants;
- whether command-engine consumes a projection or keeps applying mutable diagnostics inline;
- whether D8 receives a D5 projection or keeps its own baseline-action model.

D5 cannot advance while these remain implementation decisions.

### P1-2: The OpenSpec spec delta has two scenarios, but the source state space has many required states

The current spec has only:

- existing debt checked;
- new debt appears.

See `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/specs/habitat-harness/spec.md:7`.

It must instead have normative scenarios for at least:

- explicit empty baseline;
- explicit debt baseline;
- missing baseline;
- malformed baseline JSON;
- non-array, non-string, duplicate, and unsorted baseline rows;
- orphan baseline;
- modeled external exception source;
- external exception projection mismatch;
- unmodeled external exception;
- parser-owned baseline bypass;
- comparison-base unavailable;
- base registry missing/malformed;
- base baseline unreadable;
- existing-rule growth;
- introduced-rule expansion accepted with manifest;
- introduced-rule manifest missing;
- introduced-rule manifest mismatch;
- stale baseline key/shrink-only handling;
- D7 projection;
- D8 projection.

Without those scenarios, implementation can pass the spec while preserving the
current contradictory state space.

### P1-3: D5 public-surface changes are not concretely blocked behind D0 rows

D0 says later packets stop before implementation if a surface lacks a D0 row at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/specs/habitat-harness/spec.md:22`. The D5 packet says D0 compatibility disposition is needed, but it does not enumerate the required D0 rows and no matrix exists in this worktree.

This is a P1 because the recommended D5 state collapse touches exported types and
functions from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/index.ts:1`, command JSON/human output, `--expand-baseline`, generator/Pattern Authority baseline fields, and docs examples. A later implementation agent could silently drift public surfaces under the cover of a "refactor" unless D5 blocks each surface change behind concrete D0 rows.

### P1-4: D5 still leaves D7/D8 consumer projections undefined

D2 defines that consumers must use projections and that `ruleBaselineFacts`
excludes whole rule rows at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md:180`. D5 must continue that pattern by defining its own D7/D8 projections. The current packet only says "D5 publishes baseline authority projection/refusal results for D7 and D8" at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:24`.

That phrasing leaves D5/D8 authority ambiguous and allows whole-record leakage.
It must be replaced by a one-way contract: D5 consumes D2 `ruleBaselineFacts`,
publishes Baseline Authority projection/refusal states, D7 consumes the
enforcement projection, and D8 consumes the governance projection while owning
Pattern Authority lifecycle/admission.

## P2 Blockers In Current D5 Packet

### P2-1: Tasks remain broad verbs instead of compiler/test-gated refactor slices

Tasks 2.1-2.3 say to define ownership, connect baselines, and specify lifecycle
at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:14`. They do not sequence:

- introduce internal unions;
- collapse external exception optionals;
- collapse expansion guard booleans;
- extract command-engine baseline authority;
- add D7/D8 projections;
- remove legacy/whole-record authority paths;
- run gates after each slice.

This leaves behavior-preserving slice design to implementation.

### P2-2: Validation gate is too broad for baseline-integrity validation

The source packet requires `bun run habitat check --rule baseline-integrity --json` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D5-baseline-authority.md:130`. The current proposal/tasks/phase record use broad `bun run habitat check --json` at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:74`, `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/tasks.md:21`, and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/workstream/phase-record.md:24`.

The broad command can fail or pass for unrelated structural reasons. D5 needs
the focused built-in rule validation plus injected bad cases.

### P2-3: Refusal terminology is too generic to guide implementation

The packet uses "baseline state lifecycle", "orphan and removed-entry handling", "baseline decision",
"owning remediation path", and "owner/rule/governance relation" without closed
states at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:23`.

D5 should replace those terms with state names and variant fields:

- matched explicit debt key;
- matched external exception projection;
- unmatched new violation;
- stale/orphan baseline key;
- parser-owned bypass refusal;
- existing-rule growth refusal;
- introduced-rule accepted expansion;
- introduction manifest missing/mismatch refusal;
- D7 baseline diagnostic projection;
- D8 governance baseline projection.

### P2-4: Write set is still promised but not listed

The proposal says the expected implementation write set is named in design at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/proposal.md:51`. The design says the executor must have a concrete write set before implementation at `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d5-baseline-authority/design.md:52`, but does not list one.

D5 should list candidate implementation paths and protected paths before source
work starts. Expected write set likely includes:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/baseline.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/command-engine.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/pattern/registration.cjs`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/lib/baseline.test.ts`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`
- focused command/generator tests if public projection changes.

Protected paths should include generated outputs, baseline JSON content except
explicit fixture updates, unrelated D7/D8 behavior, and non-Habitat source.

## Advancement Criteria

D5 can advance to implementation-ready only after the packet itself specifies:

- closed baseline load, application, expansion, external exception, and refusal
  state models;
- D2 input projection and D7/D8 output projection contracts;
- D0 row prerequisites for every public surface touched;
- normative scenarios for all source-packet states and current-code refusal
  states;
- behavior-preserving implementation slices with compiler/test gates after each
  logical move;
- focused baseline-integrity validation and injected bad-case matrix.

Until then, an implementation can still represent contradictions. Under the
TypeScript refactoring approval bar, that means D5 does not advance.
