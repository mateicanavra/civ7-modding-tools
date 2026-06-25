# D8 TypeScript State-Space Investigation

Status: BLOCKING

D8 is not acceptable implementation input yet. The source packet correctly requires Pattern Authority lifecycle separation, but the current OpenSpec packet does not yet specify the complete type model, consumer projections, exact write set, protected paths, or falsifying TypeScript gates required to prevent candidate/registered/apply-safe conflation.

The current disk state incompletely prevents bad promotion by runtime tests and manifest validation. It does not fully prevent conflation at the packet level: the current packet still leaves the concrete state model and implementation boundaries for a later agent to invent, and the live rule registry contains optional Pattern Authority fields without any checked-in `manifestPath` entries proving active Pattern Authority admission.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/solution-design/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/SKILL.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/smell-catalog.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/refactoring-mechanics.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/llm-slop-cleanup.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/paradigms-and-patterns.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/references/worked-examples.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-plan-template.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/.agents/skills/typescript-refactoring/assets/refactor-findings-template.md`
- `AGENTS.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D8-pattern-governance.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/proposal.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/design.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/tasks.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/workstream/phase-record.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/workstream/closure-checklist.md`
- `openspec/changes/deep-habitat-d8-pattern-governance/workstream/review-disposition-ledger.md`
- `tools/habitat/src/rules/pattern-authority/manifest.ts`
- `tools/habitat/src/generators/pattern/generator.cjs`
- `tools/habitat/src/generators/pattern/registration.cjs`
- `tools/habitat/src/generators/pattern/schema.json`
- `tools/habitat/src/rules/architecture.ts`
- `tools/habitat/src/rules/rules.json`
- `tools/habitat/src/plugin.js`
- `tools/habitat/src/lib/baseline.ts`
- `tools/habitat/src/lib/grit-apply.ts`
- `tools/habitat/test/rules/pattern-authority-manifest.test.ts`
- `tools/habitat/test/generators/pattern-generator.test.ts`
- `tools/habitat/test/lib/grit-apply.test.ts`
- `tools/habitat/test/lib/grit-adapter.test.ts`
- `tools/habitat/test/lib/hooks.test.ts`
- `tools/habitat/test/lib/rule-selection.test.ts`

## Current Type/Code Inventory

The current manifest layer already contains a useful discriminant, but it is not the complete Pattern Authority state machine D8 needs.

- `PatternAuthorityLifecycle` is `"candidate" | "registered-advisory" | "registered-enforced"` in `tools/habitat/src/rules/pattern-authority/manifest.ts:5`.
- `CandidatePatternAuthorityManifest` owns `candidateArtifacts`, `registration.accepted: false`, and `requiredForRegistration` at `manifest.ts:67-78`.
- `RegisteredPatternAuthorityManifest` owns normative/proving sources, language, scan roots, fixture strategy, false-positive model, current-tree scan, baseline contract, hook scope, and apply safety at `manifest.ts:80-122`.
- `PatternAuthorityApplySafety` separates `{ kind: "not-apply" }` from `{ kind: "apply"; dryRunCommand; noWriteProof; appliedDiffProof; rollbackProof; typeAndTestProof }` at `manifest.ts:34-43`.
- `PatternAuthorityValidationResult` returns `ok: true`, a broad `manifest`, `state`, and `authorityAccepted: boolean`, or `ok: false` issues at `manifest.ts:176-186`.

The validator catches many contradictions, but the current result shape still leaks a broad manifest and a boolean acceptance flag instead of projecting lifecycle-specific admission states.

- Missing manifest returns `"missing-manifest"` at `manifest.ts:225-236`.
- Candidate manifests are accepted as drafts, with `authorityAccepted: false`, at `manifest.ts:271-285`.
- Registered manifest storage must be canonical at `manifest.ts:288-318`.
- Registered fields are validated as independent sections at `manifest.ts:366-381`.
- Registered contradictions reject pre-commit scope outside enforced lifecycle, blocked current-tree scans, blocked baseline actions, and grit-check/apply-safety conflicts at `manifest.ts:597-645`.
- Rule-pack reference validation rejects orphan or contradictory registered metadata at `manifest.ts:647-758`.

The generator path is still driven by string lifecycle options and file-presence checks.

- `patternGenerator()` normalizes options, validates collisions, then branches on `options.lifecycle !== "candidate"` at `tools/habitat/src/generators/pattern/generator.cjs:3-10`.
- `normalizeOptions()` builds one broad options record with `lifecycle`, `manifestPath`, and optional `hookScope` at `generator.cjs:26-38`.
- `normalizeLifecycle()` validates raw strings at `generator.cjs:41-51`.
- Candidate generation writes a candidate pattern markdown and candidate manifest at `generator.cjs:12-24`.
- `validateNoActiveRegistrationCollision()` uses active Grit pattern path, baseline path, and `rules.json` presence as lifecycle collision checks at `generator.cjs:76-91`.

The registration program correctly fail-closes before promotion writes in several cases, but it does so as runtime sequencing over a broad input record.

- `registeredPatternPromotionProgram(input)` refuses missing `manifestPath` at `tools/habitat/src/generators/pattern/registration.cjs:32-37`.
- It reads and validates the manifest with an invocation-shaped rule reference at `registration.cjs:39-63`.
- It validates baseline contract before active writes at `registration.cjs:64-65` and `registration.cjs:148-223`.
- It rejects existing active pattern/candidate artifacts before writes at `registration.cjs:67-85`.
- It writes only the active Grit pattern and `rules.json` after all checks at `registration.cjs:87-102`.
- It projects a rule-pack entry with `manifestPath` and optional `hookScope` at `registration.cjs:106-123`.

The rule registry and Nx plugin still represent Pattern Authority as optional metadata on a general-purpose rule record.

- `HarnessRule` includes optional `gritPattern?`, `manifestPath?`, `hookScope?`, `generatedZone?`, `forbiddenFileNames?`, and `nxTarget?` at `tools/habitat/src/rules/architecture.ts:16-34`.
- `rules.json` is the shared rule-pack source, but the current file has no `"manifestPath"` entries.
- `plugin.js` treats `ownerTool === "grit-check"` as an alias to the canonical Grit target at `tools/habitat/src/plugin.js:213-217`, regardless of Pattern Authority lifecycle.

Baseline and apply code already define adjacent authority states that D8 should consume through projections instead of re-owning.

- Baseline states are a real union: explicit empty, explicit debt, external exception source, or contract failure at `tools/habitat/src/lib/baseline.ts:53-83`.
- Baseline growth for new rules requires an accepted rule-introduction manifest at `baseline.ts:330-338`, `baseline.ts:423-467`, and `baseline.ts:799-830`.
- Grit apply transaction proof has changed paths, diff evidence, inventory, rollback, gate commands, and non-claims at `tools/habitat/src/lib/grit-apply.ts:74-91`.
- Apply inventory and diff evidence classify pre-approved versus blocked writes at `grit-apply.ts:576-633`.
- Apply request non-claims explicitly do not prove current-tree Grit, baseline shrink, or product runtime at `grit-apply.ts:665-703` and `grit-apply.ts:1081-1119`.

Current tests prove important behavior but not the full D8 packet target.

- Manifest tests accept registered advisory with matching rule reference and candidate drafts without authority acceptance at `tools/habitat/test/rules/pattern-authority-manifest.test.ts:10-60`.
- Manifest tests reject missing, malformed, placeholder, contradicted, orphan, wrong-path, sparse-reference, hook-mismatch, Grit-only, Nx-options-only, and placeholder-baseline states at `pattern-authority-manifest.test.ts:62-263`.
- Generator tests prove candidate writes do not register active enforcement at `tools/habitat/test/generators/pattern-generator.test.ts:20-55`.
- Generator tests prove missing manifest, placeholder manifest, hook mismatch, and missing baseline refuse before promotion writes at `pattern-generator.test.ts:57-207`.
- Generator tests prove registered advisory/enforced/hook-scoped writes after accepted manifest and baseline contract at `pattern-generator.test.ts:139-237`.
- Generator tests assert no candidate or promotion writes for collision/refusal cases at `pattern-generator.test.ts:310-385`.
- Apply tests block unapproved inventory, outside roots, create evidence, and delete evidence; they pre-approve only modification evidence inside approved roots at `tools/habitat/test/lib/grit-apply.test.ts:173-298`.
- Grit adapter and hook tests reject protected scan roots and avoid staged Grit outside approved roots at `tools/habitat/test/lib/grit-adapter.test.ts:221-233`, `tools/habitat/test/lib/hooks.test.ts:315-331`, and `tools/habitat/test/lib/rule-selection.test.ts:121-160`.

## State-Space Smells

1. File-presence lifecycle.
   Candidate/registered distinction is partly enforced by path collisions: candidate artifacts under `tools/habitat/src/rules/pattern-authority/candidates/**`, active patterns under `.habitat/patterns/active/checks/**`, baseline files under `tools/habitat/baselines/**`, and rule-pack entries in `rules.json`. The checks are important, but they are symptoms of state, not the state model. D8 must make file presence a projection of `PatternAuthorityState`, never the authority source.

2. Optional/flag soup in generator input.
   One broad options object carries `lifecycle`, `manifestPath?`, and `hookScope?`. Invalid combinations are representable: registered lifecycle without manifest path, hook scope without enforced lifecycle, candidate with manifest path, candidate with hook scope, or registered apply semantics through a check-owned generator path.

3. Stringly lifecycle and lane translation.
   `registered-enforced` becomes `lane: "enforced"` by repeated string checks in generator and registration code. The D8 packet must specify a single lifecycle-to-consumer projection, not repeated ad hoc translation.

4. Whole-record leakage.
   Registered promotion consumes and passes broad `RegisteredPatternAuthorityManifest` into rule-entry and markdown builders. Consumers should receive smaller projections: rule-pack registration projection, diagnostic catalog projection, baseline introduction projection, hook projection, and apply-safety projection. Whole manifest access lets downstream code accidentally depend on authority fields outside its owner boundary.

5. Candidate/registered conflation.
   Candidate and registered manifests share `PatternAuthorityManifestBase` and a `PatternAuthorityManifest` union, which is fine internally, but `PatternAuthorityValidationResult` exposes both through one `manifest` property plus `authorityAccepted: boolean`. A downstream consumer can forget to narrow and treat "valid draft" as "accepted authority" if the packet does not specify projection-only APIs.

6. Diagnostic/apply safety conflation.
   `applySafety` is present on registered manifests, and the validator rejects `grit-check` with `apply`, but the packet does not yet define separate registered diagnostic and registered apply-approved states. D8 must make "registered diagnostic" and "apply-approved pattern" different variants. A Grit diagnostic catalog entry must not imply apply safety.

7. Runtime refusal instead of typed refusal.
   Promotion refusal is represented by thrown/failed `PatternPromotionFailure` reasons such as missing manifest path, manifest rejected, baseline contract rejected, and unexpected collision. D8 should specify typed refusal results so implementation can test them directly and consumers do not parse error text.

8. Rule-pack optional metadata as authority.
   `HarnessRule.manifestPath?` and `hookScope?` are optional. The current `rules.json` contains Grit rules with `gritPattern` and hook scope, but no `manifestPath`. D8 must prevent "registered by rule-pack row only" from being a valid accepted Pattern Authority state.

9. Protected write set is implicit.
   Promotion currently writes active pattern markdown and `rules.json`; tests also assert it does not write candidate manifests, candidate patterns, or baselines. The packet needs an explicit write/protected path contract before implementation.

10. Apply write safety lives in D9-adjacent mechanics, not Pattern Authority.
   Grit apply has roots, inventory approval, diff evidence, changed paths, rollback, and non-claims. D8 must require an apply-safety admission receipt for apply patterns, but it must not own apply transaction mechanics.

## Target Type Model

D8 should specify these target families or an equivalent closed model before source implementation.

### PatternAuthorityState

```ts
type PatternAuthorityState =
  | CandidatePatternDraft
  | CandidateManifestInvalid
  | RegisteredDiagnosticPattern
  | RegisteredHookScopedPattern
  | RegisteredApplyApprovedPattern
  | RefusedPattern
  | RetiredPattern;
```

Required invariants:

- `CandidatePatternDraft` has candidate artifacts, candidate manifest path, draft source, and `registration: { accepted: false }`. It has no active rule id projection, no baseline projection, no hook projection, and no apply projection.
- `CandidateManifestInvalid` preserves candidate identity and validation issues. It has no write permission beyond candidate artifact repair.
- `RegisteredDiagnosticPattern` has accepted manifest receipt, rule-pack projection, diagnostic catalog projection, current-tree scan decision, fixture strategy, false-positive model, and baseline contract. It has `applySafety: { kind: "not-apply" }`.
- `RegisteredHookScopedPattern` extends registered diagnostic with `hookScope: { decision: "pre-commit"; acceptedCostAndScopeEvidence: ... }` and is only reachable for enforced lifecycle.
- `RegisteredApplyApprovedPattern` is distinct from registered diagnostic/hook states. It requires `ownerTool: "grit-apply"`, apply safety receipt, protected write set, dry-run result, isolated diff evidence, rollback result, formatter/type/test gates, and explicit non-claims.
- `RefusedPattern` is a typed result, not an exception string. It carries one refusal reason family and the protected paths that remained unwritten.
- `RetiredPattern` records prior registered identity, retirement authority, replacement/disposition, and guarantee that enforcement no longer consumes the rule unless explicitly preserved as historical baseline context.

### PatternAdmissionInput

```ts
type PatternAdmissionInput =
  | { kind: "candidate-generation-request"; ruleId: RuleId; patternName: PatternName; ownerProject: ProjectName; openspecChangeId: ChangeId }
  | { kind: "registered-diagnostic-admission"; manifestPath: CanonicalManifestPath; ruleReference: ExpectedRulePackReference; baseline: BaselineIntroductionProjection; diagnostics: DiagnosticProofProjection }
  | { kind: "registered-hook-admission"; manifestPath: CanonicalManifestPath; ruleReference: ExpectedRulePackReference & { hookScope: "pre-commit" }; baseline: BaselineIntroductionProjection; diagnostics: DiagnosticProofProjection; hook: HookScopeReceipt }
  | { kind: "apply-approval-admission"; manifestPath: CanonicalManifestPath; apply: ApplySafetyReceipt; protectedWriteSet: ProtectedWriteSet };
```

This removes optional `manifestPath?` and `hookScope?` from admission call sites. A caller must choose the lifecycle-specific constructor before promotion can run.

### PatternAdmissionResult

```ts
type PatternAdmissionResult =
  | { kind: "candidate-created"; state: CandidatePatternDraft; writes: CandidateWriteSet }
  | { kind: "registered-admitted"; state: RegisteredDiagnosticPattern | RegisteredHookScopedPattern; writes: RegisteredDiagnosticWriteSet }
  | { kind: "apply-approved"; state: RegisteredApplyApprovedPattern; writes: ApplyAuthorityWriteSet }
  | { kind: "admission-refused"; refusal: PatternAdmissionRefusal; protectedPaths: readonly RepoPath[] };
```

Refusal reasons must be typed:

```ts
type PatternAdmissionRefusalReason =
  | "missing-manifest-path"
  | "manifest-unreadable"
  | "manifest-malformed"
  | "manifest-placeholder"
  | "manifest-contradicted"
  | "manifest-orphan"
  | "candidate-active-collision"
  | "registered-candidate-collision"
  | "rule-pack-collision"
  | "baseline-contract-missing"
  | "baseline-contract-mismatch"
  | "baseline-action-blocked"
  | "fixture-strategy-missing"
  | "false-positive-model-missing"
  | "current-tree-blocks-registration"
  | "hook-scope-mismatch"
  | "apply-safety-missing"
  | "apply-safety-forbidden-for-diagnostic"
  | "apply-protected-write-set-rejected";
```

### Consumer Projections

D8 must specify that consumers receive projections, not the whole manifest.

- Pattern generator receives `CandidateGenerationProjection`: candidate paths, draft markdown fields, candidate manifest fields.
- Registration writer receives `RegisteredRulePackProjection`: rule id, owner project, lane, diagnostic pattern name, manifest path, hook scope if accepted, message text source, and baseline reference.
- Diagnostic Pattern Catalog receives `DiagnosticPatternProjection`: pattern name, language, scan roots, fixture strategy, false-positive model, current-tree scan class, and non-claims. It does not receive apply safety fields.
- Baseline Authority receives `BaselineIntroductionProjection`: rule id, baseline path, action, initial keys, comparison base, owner tool/project, and rule-introduction manifest path.
- Local Feedback receives `HookScopeProjection`: only accepted pre-commit hook-scoped enforced rules and approved staged roots.
- Transformation Transaction receives `ApplyPatternProjection`: apply pattern paths, protected write set, apply safety receipt, rollback/type/test/formatter gates, and non-claims. It does not receive diagnostic-only manifest state.
- Recovery/ledger consumers receive `AdmissionReceiptProjection`: accepted/refused/retired state, authoritative sources, proving sources, validation commands, and protected paths.

## Safe Refactor Moves

These are behavior-preserving moves for the later implementation packet. They should be specified in D8 before source edits and executed in small compiler-gated steps.

1. Introduce lifecycle state constructors next to `manifest.ts`.
   Add functions that return `PatternAuthorityState` variants from validated manifests and admission inputs. Keep existing manifest JSON shape initially. Do not change public generator behavior in the same step.

2. Replace `authorityAccepted: boolean` with state-owned acceptance.
   Keep compatibility projection if needed, but internal consumers should switch on `state.kind`. Candidate valid draft, registered diagnostic, hook-scoped, apply-approved, refused, and retired states must not share a boolean acceptance convention.

3. Introduce lifecycle-specific admission inputs.
   Replace broad generator promotion calls with `registered-diagnostic-admission` and `registered-hook-admission` constructors. Missing manifest path becomes unrepresentable for registered constructors.

4. Convert promotion failures to typed refusal results.
   Keep thrown errors only at the Nx generator boundary if D0 compatibility requires it. Internally return `PatternAdmissionResult` with `kind: "admission-refused"` and exact refusal reason.

5. Extract consumer projection builders.
   Move rule-entry construction, Grit markdown construction, baseline contract checks, and hook-scope projection behind small functions that accept projections. This removes whole-record manifest leakage from consumers.

6. Split diagnostic registration from apply approval.
   Add a separate apply-approved state and projection. `grit-check` registered states must only construct `RegisteredDiagnosticPattern` or `RegisteredHookScopedPattern` with `not-apply`. `grit-apply` must require apply safety receipt and protected write set.

7. Make write sets explicit.
   Have candidate generation and registered admission return a typed write set before applying writes. Tests can assert exact intended writes and protected paths before any write is performed.

8. Preserve public behavior at the boundary.
   Existing generator CLI/schema behavior, error text expectations, and JSON manifest shape may remain as compatibility projections until D0 authorizes public changes. The internal state model should still collapse first.

9. Keep baselines and apply transactions owned by adjacent domains.
   D8 should consume D5 baseline projection and D9 apply safety projection. It should not duplicate baseline expansion logic or apply transaction mechanics.

## Write/Protected Set

Later implementation must stay inside this write set unless the D8 packet is explicitly expanded and re-reviewed.

Allowed source write set:

- `tools/habitat/src/rules/pattern-authority/manifest.ts`
- `tools/habitat/src/generators/pattern/generator.cjs`
- `tools/habitat/src/generators/pattern/registration.cjs`
- `tools/habitat/src/generators/pattern/schema.json` only if D0 compatibility disposition covers generator option changes.
- `tools/habitat/src/rules/architecture.ts` only for typed projection consumption, not unrelated rule execution behavior.
- `tools/habitat/src/rules/rules.json` only for adding `manifestPath` metadata required by an accepted registered fixture or test case; no broad registry churn.
- `tools/habitat/test/rules/pattern-authority-manifest.test.ts`
- `tools/habitat/test/generators/pattern-generator.test.ts`
- New narrowly-scoped tests under `tools/habitat/test/rules/` or `tools/habitat/test/generators/` for Pattern Authority admission state and negative type/runtime cases.
- D8 OpenSpec packet files under `openspec/changes/deep-habitat-d8-pattern-governance/**`.
- D8 scratch/phase records under `docs/projects/habitat-harness/openspec-remediation/**`.
- Pattern Authority docs or ledgers explicitly named by the repaired D8 packet.

Allowed runtime write projections for the generator:

- Candidate generation may write:
  - `tools/habitat/src/rules/pattern-authority/candidates/<rule-id>.json`
  - `tools/habitat/src/rules/pattern-authority/candidates/<pattern-name>.md`
- Registered diagnostic/hook admission may write:
  - `.habitat/patterns/active/checks/<pattern-name>.md`
  - `tools/habitat/src/rules/rules.json`
- Registered diagnostic/hook admission may require existing, prewritten:
  - `tools/habitat/src/rules/pattern-authority/<rule-id>.json`
  - `tools/habitat/baselines/<rule-id>.json`
  - the manifest's rule-introduction baseline manifest path under `openspec/changes/<change-id>/workstream/**`

Protected paths:

- `tools/habitat/baselines/**` must not be created, expanded, or edited as a side effect of Pattern Authority admission. Baseline files are D5-owned inputs to D8 admission.
- `.habitat/patterns/active/apply/**` must not be edited by diagnostic registration. Apply patterns require a separate apply-approved state.
- `.habitat/grit.yaml`, `.gritignore`, `.gitignore`, and Grit acquisition configuration must not be changed by D8 admission.
- `tools/habitat/src/lib/grit-apply.ts` and Grit apply transaction tests are protected from D8 implementation unless the packet explicitly invokes the D9/apply workstream.
- `tools/habitat/src/lib/baseline.ts` is protected from D8 implementation unless D5 contract changes are explicitly accepted.
- Product source roots (`apps/**`, `packages/**`, `mods/**`) are protected from D8 implementation except for test fixtures explicitly approved by the packet.
- Generated artifacts (`dist/**`, `mod/**`, generated zones, `.civ7/**`, lockfiles) are protected.
- Existing active Grit pattern files unrelated to the admitted test fixture are protected.
- Existing rule-pack rows unrelated to the admitted pattern fixture are protected.

## Validation Matrix

| Gate | State collapse proved | Required expectation |
| --- | --- | --- |
| Manifest state constructor tests | Candidate, invalid candidate, registered diagnostic, hook-scoped, apply-approved, refused, and retired states are distinct variants | Valid candidate cannot project to registered; registered diagnostic cannot project to apply-safe |
| Negative TypeScript fixture or equivalent `expectTypeOf` test | Illegal admission inputs are unrepresentable | Registered admission without manifest path, hook admission without pre-commit hook, and apply approval without apply receipt fail at compile time |
| `pattern-authority-manifest.test.ts` | Manifest parsing and contradiction checks preserve current behavior | Existing missing/malformed/placeholder/orphan/contradicted tests pass, with new refusal reasons if public-compatible |
| `pattern-generator.test.ts` no-write refusals | Refused admission protects candidate, active pattern, baseline, and rule-pack paths | Missing manifest, placeholder manifest, hook mismatch, baseline missing/mismatch, current-tree blocked, and apply-for-diagnostic all leave protected paths unchanged |
| Candidate generation test | Candidate draft has no enforcement projection | Candidate writes only candidate paths, not active pattern, baseline, `rules.json`, hook scope, or apply projection |
| Registered diagnostic admission test | Accepted manifest plus baseline contract admits only diagnostic enforcement | Active check pattern and `rules.json` row are written; baseline and manifest remain unchanged; rule row has manifest path |
| Hook-scoped admission test | Hook scope is accepted only for enforced registered state | Advisory plus pre-commit refuses; enforced plus matching manifest/invocation projects hook scope |
| Apply safety test | Diagnostic and apply safety are separate states | `grit-check` plus apply safety refuses; `grit-apply` plus missing apply proof refuses; apply-approved state requires protected write set |
| Whole-record leakage test | Consumer projections are narrower than the full manifest | Rule-pack builder, diagnostic builder, baseline projection, hook projection, and apply projection do not accept `RegisteredPatternAuthorityManifest` directly |
| Baseline integration gate | D8 consumes D5 baseline contract without owning expansion | `bun run habitat check --rule baseline-integrity --json` exits 0 or records exact accepted failure; D8 tests do not edit baseline files |
| Protected root gate | D8 does not expand Grit scan/apply roots | Existing protected-root tests for `.civ7`, generated zones, docs root approval, staged roots, and apply diff evidence continue to pass |
| OpenSpec gate | Packet itself names the closed model and write/protected set | `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` passes after spec/tasks/design include these requirements |
| Repo hygiene gate | Only the intended scratch/spec files changed for this investigation | `git diff --check` passes and `git status --short --branch` shows no source edits from this design pass |

Suggested exact later command set:

- `bun run --cwd tools/habitat test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts`
- `bun run --cwd tools/habitat test -- test/lib/grit-apply.test.ts test/lib/grit-adapter.test.ts test/lib/hooks.test.ts test/lib/rule-selection.test.ts`
- `bun run habitat check --rule baseline-integrity --json`
- `bun run habitat classify tools/habitat/src/rules/rules.json`
- `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict`
- `bun run openspec:validate`
- `git diff --check`

## P1/P2 Blockers

### P1: Packet does not yet specify the complete Pattern Authority state model

The OpenSpec starter packet says lifecycle states must exist, but the spec requirement only names "candidate, reviewed, registered, refused, and retired" at `openspec/changes/deep-habitat-d8-pattern-governance/specs/habitat-harness/spec.md:3-13`. It does not specify diagnostic registered versus hook-scoped versus apply-approved variants, nor the required fields/projections per state.

Required repair: add normative requirements for `PatternAuthorityState`, lifecycle-specific admission inputs, typed refusal results, and consumer projections.

### P1: Packet does not yet prevent diagnostic/apply-safe conflation

The source packet explicitly says registered diagnostic pattern is not apply-safe at `D8-pattern-governance.md:105-109`, and current manifest validation rejects `grit-check` plus `applySafety.kind === "apply"` at `manifest.ts:628-645`. The OpenSpec starter packet does not carry that into a complete spec requirement. A later implementation agent could preserve the runtime check but still expose a registered manifest projection that implies apply safety by whole-record leakage.

Required repair: add a distinct `RegisteredApplyApprovedPattern` state and state that diagnostic consumers never receive apply safety fields.

### P1: Packet lacks exact write set and protected paths

`tasks.md:9` says to record a concrete write set later, but D8 cannot authorize implementation while the implementation write/protected set is unresolved. The source packet stop conditions include file-presence lifecycle and optional baseline/hook decisions, so the packet must own this before source edits.

Required repair: copy the write/protected set above into `design.md`, `tasks.md`, and/or `phase-record.md` with no reduced-scope language.

### P1: Current active rule registry does not prove registered Pattern Authority admission

`HarnessRule` can carry `manifestPath?`, but current `rules.json` has no `manifestPath` entries. Existing active Grit rows with `gritPattern` and hook scope therefore cannot be treated as Pattern Authority-registered by current disk state. D8 must not claim current disk already prevents candidate/registered/apply-safe conflation.

Required repair: state that current rule-pack metadata is present-behavior evidence only; later admission must add or validate `manifestPath` through explicit accepted manifests.

### P2: Validation gates are too generic

The current D8 starter packet validation gates include the manifest test, classify, OpenSpec validation, and `git diff --check`, but they do not include negative type-state gates, whole-record leakage gates, apply safety separation gates, or protected write-set tests.

Required repair: add a validation matrix tied to TypeScript state collapse, not only runtime smoke tests.

### P2: Refusal states remain error-message-driven

Promotion currently surfaces failures through `PatternPromotionFailure` messages. Tests assert message substrings such as `requires --manifestPath`, `placeholder-manifest`, and hook mismatch. This is acceptable as an outer compatibility projection, but not as the internal D8 model.

Required repair: specify typed refusal results and require compatibility error messages to be generated from refusal state, not parsed as authority.

### P2: Whole-manifest access is not bounded by consumer projections

Rule-entry and pattern markdown builders currently accept the full registered manifest. That can remain temporarily, but D8 must specify the replacement projections before implementation.

Required repair: require projection builders and tests proving consumers do not accept whole manifests where a narrower projection exists.

Skills used: domain-design, information-design, solution-design, typescript-refactoring.
