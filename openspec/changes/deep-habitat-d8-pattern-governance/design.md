# Design: D8 Pattern Governance

## Frame

D8 is the Pattern Governance packet. It resolves how Habitat admits, refuses,
retires, and publishes structural pattern states. Its acceptance threshold is
high: a later implementation agent must not decide lifecycle names, admission
inputs, refusal reasons, public compatibility, write ownership, or downstream
handoffs while editing TypeScript.

Pattern Governance is a repo-maintenance domain. It keeps a candidate pattern
from becoming an active diagnostic, local-feedback signal, or apply transform
until the required owner contracts have accepted that use.

## Current Behavior Diagnosis

Current code is useful but incomplete target evidence:

- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts` exposes
  `candidate`, `registered-advisory`, and `registered-enforced` lifecycles,
  Pattern Authority manifest validation, rule-reference checks, baseline
  contract fields, hook-scope fields, and apply-safety fields.
- `tools/habitat-harness/src/generators/pattern/generator.cjs` writes
  candidate artifacts under the Pattern Authority candidate root and routes
  non-candidate requests into registration.
- `tools/habitat-harness/src/generators/pattern/registration.cjs` validates a
  manifest, checks baseline files and rule-introduction manifests, refuses
  collisions, writes an active Grit check pattern, and appends a `rules.json`
  row.
- `tools/habitat-harness/src/rules/rules.json` has active Grit rules with
  `gritPattern` and often `hookScope`, but the current catalog generally lacks
  `manifestPath`; those rows cannot be treated as complete D8 admission.
- Existing tests cover candidate non-registration, manifest validation,
  placeholder rejection, missing baseline rejection, hook mismatch, and
  collision protection. They do not cover the complete D8 lifecycle model,
  retired patterns, consumer projections, or live D2/D5/D6 projection
  prerequisites.

## Domain Boundary

D8 owns:

- Pattern identity admission.
- Pattern Authority decision records.
- Lifecycle state and capability admission state.
- Admission/refusal/retirement reason taxonomy.
- Manifest acceptance as one admission input.
- Consumer projections that prevent adjacent domains from inferring admission
  from file presence or broad records.

D8 does not own:

- Registry row schema or consumer projections owned by D2.
- Baseline integrity, baseline growth, external exception sources, or baseline
  application owned by D5.
- Grit command acquisition, diagnostic projection, diagnostic catalog identity,
  injected-probe cleanup, or scan-root validation owned by D6.
- Check report assembly, rendering, or exit status owned by D7.
- Protected/generated-zone authority owned by D10.
- Apply transaction behavior owned by D9.
- Hook sequencing and staged-file behavior owned by D11.
- Candidate file creation and generator refusal surfaces owned by D13.
- Host policy owned by G-HOST.

## Vendor Boundary

- Grit owns GritQL syntax, Markdown pattern conventions, pattern samples,
  native `grit check`, and native `grit apply`. Habitat may add Pattern
  Authority metadata, but Grit frontmatter and prose are not Habitat admission
  authority.
- Biome owns formatter/linter/import-sorting behavior and `biome ci` semantics.
  Biome outcomes are not Pattern Governance lifecycle decisions.
- Nx owns generator mechanics, generator schema/default handling, project graph
  plugins, inferred tasks, and task execution. Habitat owns which generator
  requests it supports and which generated outputs are candidates versus
  admitted patterns.

## Target Ontology

Use `Pattern Governance` for the bounded context and `Pattern Authority` for
the durable decision authority and decision record inside that context.

Target state families:

| State | Meaning | Required owner inputs | Consumer meaning |
| --- | --- | --- | --- |
| `candidate-draft` | Proposed pattern output exists. | D13 candidate request plus D8 candidate identity. | Not active, not baselined, not hook-eligible, not apply-capable. |
| `candidate-under-review` | Candidate entered governance review. | Candidate identity plus required decision-input checklist. | Still not active; consumers may only show review status. |
| `manifest-invalid-candidate` | Candidate or promotion input has invalid Pattern Authority metadata. | D8 validation issue set. | Registration refuses before active writes. |
| `diagnostic-admitted` | Pattern is admitted for diagnostic/check use. | D2 governance/Grit facts, D5 baseline projection, D6 diagnostic capability, fixture strategy, false-positive assessment, current-tree disposition. | D7/D6 may consume diagnostic eligibility; D9 cannot consume it as write authority. |
| `local-feedback-admitted` | Diagnostic pattern may be surfaced to local feedback consumers. | `diagnostic-admitted`, explicit hook-scope decision, D11-compatible eligibility input, and D7/D10 inputs where touched. | D11 may present eligible local feedback; D11 still owns hook behavior. |
| `apply-admitted` | Pattern may be offered to D9 for apply consideration. | Explicit D9 apply-safety input, D10/G-HOST path authority where touched, and D8 admission decision. | D9 may evaluate transaction execution; D8 does not approve writes. |
| `refused` | Admission is rejected with a closed reason. | Failed owner input, protected write set, recovery action. | Consumers must not infer active lifecycle from the rejected input. |
| `retired` | Prior admission is withdrawn. | Retirement authority, replacement/disposition, migration guidance. | New enforcement/apply/local feedback use stops unless a new admission decision exists. |

Capability admissions are not synonyms for registry membership. Registration is
D2 vocabulary. Admission is D8 vocabulary.

## Term Disposition

| Current term | D8 target disposition |
| --- | --- |
| `registered-advisory` | Compatibility projection for diagnostic-admitted advisory rule output until D0/D2 approve public rename. |
| `registered-enforced` | Compatibility projection for diagnostic-admitted enforced rule output; local-feedback admission remains a separate D8 decision. |
| `authorityAccepted: boolean` | Boundary compatibility fact; target internals should narrow on lifecycle/admission state. |
| `provingSources` | Compatibility field name. Target language should use validation inputs, acceptance inputs, fixture results, command records, or decision records. |
| `proof` in current code fields | Compatibility field where already public or test-pinned; new D8 target docs should name the engineering object directly. |
| `hookScope` | D2/D11-facing compatibility field; D8 target is local-feedback admission. |
| `applySafety` | D9-facing compatibility field; D8 target is apply admission plus transaction handoff. |
| Grit frontmatter/prose | Vendor metadata only, never D8 authority. |
| Baseline file presence | D5 input only, never D8 authority. |

## Consumed Upstream Contracts

| Owner | D8 consumes | D8 must not do |
| --- | --- | --- |
| D0 | Public-surface compatibility rows for all touched commands, JSON, exports, generator fields, docs, tests, and generated/help surfaces. | Change public surfaces before a concrete D0 row exists. |
| D1 | Command outcome and refusal-family vocabulary for malformed/refused admission exposed to users or command JSON. | Invent a new output family during implementation. |
| D2 | `ruleGovernanceFacts`, `ruleGritFacts`, and `ruleBaselineFacts`. | Read whole registry rows, prose `scope`, or field presence as target authority. |
| D5 | `BaselineAuthorityProjection` or baseline refusal result. | Load, grow, shrink, sort, accept, or refuse baselines locally. |
| D6 | Diagnostic capability, accepted diagnostic identity, fixture/sample result, injected probe result, current-tree diagnostic limitation, and diagnostic non-claims. | Parse raw Grit output or treat diagnostic success as admission by itself. |
| D7 | Check/current-tree outcome projection where D8 uses current-tree state as admission input. | Build reports, derive `CheckReport.ok`, or decide exit semantics. |
| D10/G-HOST | Protected/generated-zone and host-policy decisions for scan roots, probe paths, apply paths, or host-specific gates. | Encode host semantics or protected-zone policy locally. |

## Published Downstream Projections

| Projection | Consumer | Contents |
| --- | --- | --- |
| `PatternAuthorityProjection` | D2, D13, recovery records | Pattern id, manifest path, lifecycle state, admitted capabilities, refusal reason, supersession. |
| `DiagnosticAdmissionProjection` | D6, D7 | Diagnostic admission state, diagnostic identity, fixture strategy reference, false-positive assessment, current-tree disposition, non-claims. |
| `LocalFeedbackAdmissionProjection` | D11 through D7/D10 | Hook/local-feedback eligibility, lifecycle state, D11-owned next action, non-claims. |
| `ApplyAdmissionProjection` | D9 | Apply-admitted/not-apply/refused state, pattern identity, manifest path, D9-owned transaction inputs, protected-zone/host-policy references where needed. |
| `CandidateHandoffProjection` | D13 | Candidate output paths, candidate-only state, registration prerequisites, refusal next action. |
| `PatternRecoveryProjection` | Recovery ledgers and users | Refusal/retirement reason, owner, next allowed action, replacement/disposition. |

Consumers receive projections, not the whole manifest or whole governance state.

## Refusal Taxonomy

D8 refusal reasons are closed for implementation:

- `missing-manifest`.
- `malformed-manifest`.
- `placeholder-manifest`.
- `contradicted-manifest`.
- `orphan-manifest`.
- `manifest-invalid-candidate`.
- `grit-metadata-only`.
- `nx-options-only`.
- `missing-d2-governance-facts`.
- `missing-d5-baseline-authority`.
- `baseline-contract-rejected`.
- `missing-d6-diagnostic-identity`.
- `diagnostic-projection-rejected`.
- `missing-fixture-strategy`.
- `missing-false-positive-model`.
- `current-tree-blocks-registration`.
- `hook-scope-mismatch`.
- `apply-safety-missing`.
- `apply-safety-contradicted`.
- `active-artifact-collision`.
- `retired-pattern-referenced`.
- `public-surface-compatibility-missing`.

Boundary command messages may preserve existing wording where D0 requires it,
but internal D8 implementation should project messages from typed refusal state.

## TypeScript State Model

The later implementation should collapse state space from optional broad records
to discriminated states:

```ts
type PatternAuthorityState =
  | { kind: "candidate-draft"; candidate: CandidatePatternDraft }
  | { kind: "candidate-under-review"; review: PatternReviewInput }
  | { kind: "manifest-invalid-candidate"; refusal: PatternAdmissionRefusal }
  | { kind: "diagnostic-admitted"; admission: DiagnosticAdmissionProjection }
  | { kind: "local-feedback-admitted"; admission: LocalFeedbackAdmissionProjection }
  | { kind: "apply-admitted"; admission: ApplyAdmissionProjection }
  | { kind: "refused"; refusal: PatternAdmissionRefusal }
  | { kind: "retired"; retirement: PatternRetirementDecision };
```

Expected refactor moves:

- Introduce lifecycle-specific constructors before moving consumers.
- Keep existing manifest JSON shape as compatibility until D0 rows authorize
  public schema changes.
- Replace internal `authorityAccepted: boolean` decisions with state narrowing.
- Convert generator/promotion failure sequencing to typed admission results,
  with boundary errors projected from those results where compatibility
  requires thrown generator errors.
- Add projection builders so rule entry, diagnostic catalog, baseline relation,
  hook/local feedback, apply transaction, and recovery consumers cannot access
  whole manifests.
- Separate diagnostic admission from apply admission. A `grit-check` diagnostic
  state cannot carry apply-ready projection.

## Write Set

Allowed later D8 source implementation files:

- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`.
- `tools/habitat-harness/src/generators/pattern/generator.cjs`.
- `tools/habitat-harness/src/generators/pattern/registration.cjs`.
- `tools/habitat-harness/src/generators/pattern/schema.json`, only with D0/D13
  compatibility handling.
- `tools/habitat-harness/src/index.ts`, only for D0-approved exports.
- `tools/habitat-harness/src/rules/architecture.ts`, only for typed projection
  consumption after D2 compatibility.
- `tools/habitat-harness/src/rules/rules.json`, only when D2/D8 admission
  authorizes a specific test fixture or migration row.
- `tools/habitat-harness/test/rules/pattern-authority-manifest.test.ts`.
- `tools/habitat-harness/test/generators/pattern-generator.test.ts`.
- New focused D8 tests under `tools/habitat-harness/test/rules/` or
  `tools/habitat-harness/test/generators/`.
- D8 OpenSpec and remediation records under `$D8_CHANGE/**` and
  `$REMEDIATION_DIR/**`.
- Pattern Authority docs/ledgers explicitly named by the D8 implementation
  plan.

Runtime write projections:

- Candidate generation may write candidate Pattern Authority files under the
  candidate root only.
- Diagnostic/local-feedback admission may write an active Grit check pattern
  and the corresponding rule registry row only after D2/D5/D6/D8 gates pass.
- Apply admission may publish an apply-admission projection for D9; D9 owns
  actual apply transaction behavior.

## Protected Paths

- `tools/habitat-harness/baselines/**` unless D5 explicitly owns the edit.
- Existing `.grit/patterns/habitat/checks/**` except a D8-approved admitted
  test fixture or migration row.
- `.grit/patterns/habitat/apply/**` unless D9 owns the edit.
- `.grit/grit.yaml`, `.gritignore`, `.gitignore`, and Grit acquisition config.
- `tools/habitat-harness/src/lib/baseline.ts`.
- `tools/habitat-harness/src/lib/grit.ts`.
- `tools/habitat-harness/src/lib/grit-apply.ts`.
- `tools/habitat-harness/src/lib/command-engine.ts`.
- `tools/habitat-harness/src/lib/hooks.ts`.
- `tools/habitat-harness/src/plugin.js`, Nx project graph config, and root Nx
  target config unless D3/D0 authorize the change.
- Product source roots under `apps/**`, `packages/**`, and `mods/**` except
  explicit D8 fixtures.
- Generated artifacts, lockfiles, `dist/**`, `mod/**`, `.civ7/**`, and vendor
  caches.

## Validation Matrix

Design-time gates:

| Gate | Expected result | Non-claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d8-pattern-governance --strict` | D8 change validates. | Does not implement source behavior. |
| `bun run openspec:validate` | Full OpenSpec corpus validates. | Does not prove Habitat behavior. |
| `git diff --check` | Diff hygiene passes. | Does not prove design completeness. |
| Complete-standard wording audit over `$D8_CHANGE/**` and D8 scratch | No active reduced-standard guidance. | Historical finding text may remain only when marked as non-guidance. |
| Fresh final D8 rereviews | No unresolved P1/P2. | Design/specification acceptance only. |

Later implementation gates:

- `bun run --cwd tools/habitat-harness test -- test/rules/pattern-authority-manifest.test.ts test/generators/pattern-generator.test.ts`.
- D8 type-state tests proving candidate, invalid, admitted, refused, and
  retired states cannot be confused.
- Tests proving registered diagnostic state does not expose apply-ready
  projection.
- Tests proving consumers receive projections, not whole manifests.
- D5-focused `bun run habitat check --rule baseline-integrity --json` where
  registered pattern admission touches baselines.
- Native Grit pattern sample tests only for pattern files touched by the D8
  implementation; this validates vendor pattern syntax/behavior, not D8
  admission.
- `bun run habitat classify tools/habitat-harness/src/rules/rules.json` and
  `bun run habitat classify tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
  as routing observations with non-claims.
- `git status --short --branch` and `gt status` for stack hygiene.

## Non-Claims

- A valid candidate is not an admitted pattern.
- Manifest validation is necessary but not sufficient for admission.
- Existing Grit pattern files are not Pattern Authority decisions.
- Existing rule rows without `manifestPath` are compatibility facts, not
  complete D8 admissions.
- Baseline file presence is not baseline authority.
- Diagnostic success is not apply permission.
- Hook scope does not prove D11 local-feedback behavior.
- Apply admission does not execute or approve writes; D9 owns transaction
  execution.
