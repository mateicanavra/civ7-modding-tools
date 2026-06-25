# D2 Domain/Ontology Investigation

## Objective

Review D2 Rule Registry Metadata Contract as a fresh domain/ontology adversary
before any implementation agent refactors source code. The review asks whether
the OpenSpec packet gives later agents a complete domain model, vocabulary,
state model, owner boundary, relationship model, and validation target for rule
registry metadata.

Verdict: D2 is not acceptable yet. The packet correctly identifies the problem
area, but it still leaves implementation agents to decide the ontology behind
rule identity, owner semantics, path coverage, graph aliases, execution
adapters, baseline relations, hook eligibility, generated-zone relations, and
Pattern Governance relations.

## Sources Read

- `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/SKILL.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/axes.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/principles.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/where-defaults-hide.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/representation-choices.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/operationalization.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/maintenance.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/examples.md`
- `/Users/mateicanavra/.agents/skills/ontology-design/references/source-map.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/AGENTS.md`
- `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`
- `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
- `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/review-disposition-ledger.md`
- `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/downstream-realignment-ledger.md`
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/closure-checklist.md`
- Current Habitat code/tests as evidence only:
  - `tools/habitat/src/rules/rules.json`
  - `tools/habitat/src/rules/architecture.ts`
  - `tools/habitat/src/plugin.js`
  - `tools/habitat/src/lib/command-engine.ts`
  - `tools/habitat/src/rules/pattern-authority/manifest.ts`
  - `tools/habitat/src/lib/generated-zones.ts`
  - `tools/habitat/test/lib/classify.test.ts`
  - `tools/habitat/test/lib/rule-selection.test.ts`
  - `tools/habitat/test/lib/enforcement-surface.test.ts`

## Current Domain-Language Problems

1. D2 names "facets" but does not define semantic identity, required fields,
   allowed states, ownership, or relationship endpoints for each facet. A later
   agent could implement optional fields under the same names and still claim
   D2 compliance.

2. `ownerProject` is overloaded. It can mean the responsible Habitat rule
   owner, an Nx project selected for target aliases, a project root used by the
   Nx plugin, or a downstream domain authority. D2 must split these meanings.

3. `ownerTool` is really an execution/diagnostic adapter family in current
   code, not an owner. Tool names such as `grit-check`, `file-layer`,
   `wrapped-test`, `biome`, and `nx-boundaries` should not imply domain
   authority.

4. `scope` is unusable as target language. It currently mixes prose, exact
   path globs, include/exclude semantics, test-scope hints, and routing
   fallbacks. D2 should not keep a naked `scope` field except as a
   compatibility-only public or legacy field under D0 handling.

5. `lane` hides two decisions: command severity/reporting behavior and
   governance lifecycle. "Enforced/advisory" may be valid as a closed
   enforcement disposition, but it must not double as Pattern Authority
   lifecycle or hook eligibility.

6. `manifest` is ambiguous across at least four concepts: Pattern Authority
   Manifest, baseline rule-introduction manifest, package manifest, and
   OpenSpec packet artifact. D2 must require qualified names everywhere.

7. `generatedZone` is current-code shorthand for protected/generated path
   authority. D2 should model a relationship to a Protected Zone declaration
   owned by D10/G-HOST, not define generated-zone authority itself.

8. `hookScope` is too broad. It could mean local feedback eligibility, staged
   scan root approval, Pattern Authority hook decision, or command execution
   policy. D2 should expose only a `local_feedback_eligibility` projection and
   leave hook behavior to D11.

9. `nxTarget` is colon-string shaped and lets graph semantics hide in strings.
   D2 must require a structured graph target reference or graph projection
   consumed from D3. A string may survive only as D0-classified compatibility
   output.

10. `projection` is underdefined. A projection should have a name, consumer,
    source facet set, required completeness state, refusal condition, and
    non-authority boundary. The packet currently says consumers receive
    projections but does not define projection contracts.

11. `malformed metadata` is too vague. D2 needs closed refusal reasons such as
    `missing-rule-identity`, `unknown-execution-adapter`,
    `ambiguous-path-coverage`, `missing-graph-target-reference`,
    `missing-baseline-introduction-reference`,
    `contradicted-pattern-authority-reference`, and
    `unknown-protected-zone-reference`.

12. The current spec has only two scenarios. It does not cover selector
    namespace failures, wrong owner/tool namespace, graph alias projection,
    generated/protected zone relation, Pattern Authority contradiction,
    baseline-introduction mismatch, hook eligibility, or D4 path routing
    handoff.

## Proposed Domain Ontology

D2 should model the rule registry as a reviewed registry of structural checks
and their consumer-specific metadata, not as a universal rule object.

### Competency Questions

D2 artifacts must be able to answer these questions without source-code
interpretation:

- Given a selector value, is it a known rule id, rule owner id, or execution
  adapter id, and which rules match it?
- Given a rule id, which project is responsible for the rule definition, and
  which graph target or project target should represent it?
- Given a path-routing consumer, is the rule path coverage exact, owner-wide,
  workspace-wide, unresolved, or not applicable?
- Given a check execution consumer, which execution adapter runs the rule and
  what adapter-specific metadata is required?
- Given a baseline consumer, does the rule require a baseline state and a
  rule-introduction manifest reference?
- Given Pattern Governance, does the rule reference an accepted Pattern
  Authority Manifest, and is the registry reference consistent with it?
- Given Local Feedback, is the rule eligible for pre-commit staged execution,
  and what decision authority created that eligibility?
- Given Generated/Protected Zone Authority, does the rule reference a known
  protected zone declaration or a file-name policy, and who owns that
  declaration?

### Accepted Entity Types

| Entity | Meaning | Owner |
| --- | --- | --- |
| `RuleDefinition` | Stable registry identity for one structural check or diagnostic rule. | D2 owns identity and registry metadata completeness. |
| `RuleOwner` | The project or domain responsible for maintaining the rule definition. | D2 records; owning project/domain remains responsible. |
| `ExecutionAdapter` | Mechanism family that executes or acquires diagnostics: native Habitat, wrapped script, wrapped test, Grit check, Biome, Nx boundaries, file-layer guard. | D2 records adapter identity; D6/D7 own diagnostic semantics. |
| `PathCoverage` | Machine-readable path applicability declaration: exact paths/globs, owner-project coverage, workspace coverage, or unresolved. | D2 owns declaration; D4 owns routing decisions. |
| `GraphTargetReference` | Structured project/target dependency target used for Nx graph aliases. | D2 records relation; D3 owns graph truth. |
| `BaselineReference` | Relation from a rule to baseline state and optional rule-introduction manifest. | D2 records relation; D5 owns baseline authority. |
| `PatternAuthorityReference` | Relation from a rule to a Pattern Authority Manifest and lifecycle expectation. | D2 records relation; D8 owns admission/governance. |
| `ProtectedZoneReference` | Relation from a rule to a generated/protected zone declaration or file-name policy. | D2 records relation; D10/G-HOST own zone authority. |
| `LocalFeedbackEligibility` | Local hook/staged execution eligibility declared for a rule. | D2 records metadata; D11 owns hook behavior. |
| `RuleProjection` | Consumer-specific view with required fields, completeness state, refusal reasons, and non-claims. | D2 owns projection contracts. |

### Relationship Ontology

Use typed relationships, not generic `owner`, `scope`, `dependsOn`, or
`manifest` fields.

| Relationship | Endpoints | Meaning |
| --- | --- | --- |
| `defined_by_owner` | `RuleDefinition -> RuleOwner` | The named project/domain maintains the registry row and rule metadata. |
| `executed_by_adapter` | `RuleDefinition -> ExecutionAdapter` | The rule is executed or acquired through the adapter family. |
| `declares_path_coverage` | `RuleDefinition -> PathCoverage` | The rule has machine-readable applicability metadata for routing/classify consumers. |
| `aliases_graph_target` | `RuleDefinition -> GraphTargetReference` | The rule target is represented by a structured graph target reference. |
| `requires_baseline_reference` | `RuleDefinition -> BaselineReference` | The rule participates in baseline authority and must satisfy D5 constraints. |
| `references_pattern_authority` | `RuleDefinition -> PatternAuthorityReference` | The rule registry row is reconciled with a Pattern Authority Manifest. |
| `guards_protected_zone` | `RuleDefinition -> ProtectedZoneReference` | The rule guards a generated/protected zone or forbidden file-name policy. |
| `eligible_for_local_feedback` | `RuleDefinition -> LocalFeedbackEligibility` | The rule may be considered by local feedback surfaces under D11. |
| `projected_for_consumer` | `RuleDefinition -> RuleProjection` | A consumer receives only the fields required by its scenario. |

Relationship attributes must include source field(s), required/optional state,
consumer, owner packet, and refusal reason when the relationship is missing or
contradicted.

### State Ontology

D2 should define closed state families:

- Rule metadata completeness: `complete`, `incomplete`, `contradicted`,
  `compatibility-only`.
- Path coverage: `exact-path`, `owner-project`, `workspace`, `unresolved`,
  `not-applicable`.
- Execution adapter family: `habitat-native`, `grit-check`, `file-layer`,
  `wrapped-script`, `wrapped-test`, `biome`, `nx-boundaries`.
- Enforcement disposition: `enforced`, `advisory`. Do not call this `lane`
  unless D2 explicitly accepts `lane` as a compatibility name.
- Projection readiness: `available`, `refused-missing-required-metadata`,
  `refused-contradicted-metadata`, `not-owned-by-d2`.
- Pattern reference state: `none`, `candidate-reference`,
  `registered-advisory-reference`, `registered-enforced-reference`,
  `contradicted-reference`.
- Baseline reference state: `not-baselined`, `baseline-empty`,
  `baseline-debt`, `baseline-blocked`, `missing-introduction-reference`,
  `mismatched-introduction-reference`.
- Local feedback eligibility: `not-eligible`, `pre-commit-eligible`,
  `refused-unknown-staged-scope`.

## Rejected Names And Why

| Name | Disposition | Reason |
| --- | --- | --- |
| `scope` | Reject as target language; keep only as D0 compatibility field. | It conflates prose, glob paths, routing states, and consumer fallback logic. |
| `ownerTool` | Reject as target authority language. | It names an execution adapter family, not an owner. |
| `lane` | Reject unless explicitly narrowed to `enforcement_disposition`. | It hides enforcement behavior and governance lifecycle behind one word. |
| `manifest` | Reject unqualified. | It conflates Pattern Authority, baseline introduction, package, and OpenSpec artifacts. |
| `generatedZone` | Reject as D2-owned target term. | Protected/generated zone authority belongs to D10/G-HOST; D2 should record a reference. |
| `hookScope` | Reject as target domain term. | It conflates Pattern Governance decision, local feedback eligibility, and execution scope. |
| `nxTarget` | Reject as unstructured target relation. | Colon strings hide graph semantics and can preserve current parsing bugs. |
| `owner/root` | Reject unqualified. | Owner authority, project root, source root, and graph root are different concepts. |
| `metadata facet` | Retain only with a facet contract. | Without required fields and owners it is just optional-soup language. |
| `projection` | Retain only as `RuleProjection` with consumer, fields, states, and refusals. | The packet currently uses the term without operational semantics. |
| `proof`, `proofClass`, `evidence` | Reject for D2 target ontology except source-evidence labels. | D1 already narrowed proof-shaped language to compatibility/non-claim contexts. |
| `handoff` | Avoid in D2 except downstream ledger language. | D2 is a registry metadata contract, not a workflow handoff record. |

## Invariant Terms That Must Appear In D2 Artifacts

- `RuleDefinition`
- `RuleOwner`
- `ExecutionAdapter`
- `PathCoverage`
- `GraphTargetReference`
- `BaselineReference`
- `PatternAuthorityReference`
- `ProtectedZoneReference`
- `LocalFeedbackEligibility`
- `RuleProjection`
- `metadata completeness state`
- `projection refusal reason`
- `compatibility-only field`
- `structured graph target reference`
- `qualified manifest reference`
- `consumer-specific projection`
- `D0 surface row`
- `D1 receipt/command-record boundary`
- `D3 graph authority`
- `D4 routing authority`
- `D5 baseline authority`
- `D8 Pattern Governance authority`
- `D10/G-HOST protected-zone authority`
- `D11 local-feedback authority`

## Terms That Must Not Appear Unqualified

- `scope`
- `owner`
- `tool`
- `lane`
- `manifest`
- `generated zone`
- `hook scope`
- `target`
- `proof`
- `evidence`
- `handoff`
- `fallback`
- `shim`
- `best effort`
- `silent skip`
- `metadata`
- `facet`
- `projection`
- `artifact`
- `current code owns`

If any of these terms appears, D2 should either qualify it with the ontology
above or mark it as D0 compatibility/current-evidence language.

## P1 Blockers

### P1-1: D2 lacks a target ontology for rule metadata

The packet says "typed facets" but never defines the accepted entity types,
relationships, states, identity rules, or consumer competency questions. This
lets implementation agents encode the current `HarnessRule` optional field bag
with stronger TypeScript types while leaving the domain model unchanged.

Required repair: add a `Target Ontology` section to `design.md` with the entity,
relationship, and state ontology from this scratch record, adjusted if a later
review finds better standard names.

### P1-2: Owner authority remains ambiguous

`Rule Registry Metadata owner` is named, but the packet does not say what D2
owns versus D3/D4/D5/D8/D10/D11. `ownerProject`, `ownerTool`, owner roots, graph
targets, and Pattern Governance references can still be read as shared
authority.

Required repair: add an owner boundary matrix. D2 owns registry metadata
identity, metadata completeness, and projection contracts. It does not own graph
truth, routing decisions, baseline authority, Pattern Governance admission,
protected-zone authority, local hook behavior, or command receipt semantics.

### P1-3: `scope` remains a hidden fallback state

The source packet rejects prose `scope` as authority, but the OpenSpec scaffold
does not replace it with `PathCoverage`. Current tests already show exact path,
project owner, workspace gate, and unresolved metadata states. D2 must decide
which of these are metadata declarations and which are D4 routing outcomes.

Required repair: replace all target `scope` language with `PathCoverage` and a
closed path coverage state model. Keep legacy `scope` only as compatibility-only
input or output governed by D0.

### P1-4: Projection contracts are not operational

The current spec requires "smallest typed registry projection" but does not name
projection shapes, required fields, refusal conditions, or downstream owners.
A whole-rule object could still cross boundaries if the executor argues it is
the easiest projection.

Required repair: define `RuleSelectorProjection`, `PathCoverageProjection`,
`GraphTargetProjection`, `ExecutionAdapterProjection`, `BaselineProjection`,
`PatternAuthorityProjection`, `ProtectedZoneProjection`, and
`LocalFeedbackProjection`. Each needs consumer, required entity relationships,
closed refusal reasons, and explicit non-claims.

### P1-5: Manifest language is contradicted by current code and adjacent domains

Current code has Pattern Authority Manifests and baseline rule-introduction
manifests. Other Habitat code also reads package manifests. The packet's
unqualified `manifest` and `introduction manifest relation` phrasing will cause
implementation drift.

Required repair: require qualified manifest references:
`PatternAuthorityManifestReference` and
`BaselineIntroductionManifestReference`. Forbid unqualified `manifest` in
proposal/design/spec/tasks/ledgers.

### P1-6: Scenario coverage is too thin for implementation readiness

The spec has only a routing scenario and an insufficient metadata scenario. It
does not prove selector identity, graph alias references, adapter metadata,
baseline reference, Pattern Authority contradiction, protected-zone relation,
or local feedback eligibility.

Required repair: expand spec scenarios for every competency question listed
above, including bad cases and exact refusal reasons.

## P2 Blockers

### P2-1: Validation gates do not record expected status, bad case, cache stance, and non-claims

D1's accepted packet defines a validation results recording contract. D2 only
lists commands. That is not enough for a later implementation agent to know what
each command proves or fails to prove.

Required repair: copy the D1-style validation gate table into D2 phase-record
with expected status, oracle, injected bad case, cache/freshness stance, and
non-claims for each gate.

### P2-2: Tasks are broad implementation headings, not zero-guess actions

Tasks 2.1-2.3 are correct directionally but too broad. They do not force field
inventory, term disposition, projection matrix, refusal enum, or downstream
ledger updates before source edits.

Required repair: split tasks into field inventory, term disposition,
ontology/schema design, projection contract design, refusal-state design,
tests/fixtures, validation result recording, and downstream realignment.

### P2-3: Downstream ledger names buckets, not contract changes

The downstream realignment ledger says "Later domino packets" and "D0
compatibility matrix" but does not name which projection each downstream packet
consumes.

Required repair: name D3, D4, D5, D6, D7, D8, D10, D11, D13, and G-HOST where
relevant, with exact projection names and whether the downstream packet is
blocked, consumes, or must be amended.

### P2-4: Current-code evidence is not separated from target language

The packet says current code is evidence only, but then carries target-suspect
names from current code. The term disposition table is missing.

Required repair: add a term disposition table to `design.md` marking each
current field as `target-retain`, `target-rename`, `compatibility-only`,
`domain-owned-elsewhere`, or `reject`.

## Concrete Repair Recommendations

### `proposal.md`

- Change the summary from "typed rule metadata facets" to "a reviewed
  `RuleDefinition` metadata ontology and consumer projection contract."
- Replace unqualified owner/tool/hook/baseline/generated-zone/governance facts
  with the entity names from this review.
- Add a "D2 Owns / D2 Does Not Own" section.
- Add a hard stop condition: D2 cannot proceed if any target artifact uses
  unqualified `scope`, `ownerTool`, `lane`, `manifest`, `generatedZone`,
  `hookScope`, or `nxTarget`.
- Add D0/D1 dependency language: D0 governs compatibility-only public names;
  D1 governs receipts/command records and proof-shaped compatibility language.

### `design.md`

- Add `Competency Questions`, `Target Ontology`, `Relationship Ontology`,
  `State Ontology`, `Projection Contracts`, and `Term Disposition` sections.
- Define identity rules for `RuleDefinition`: stable id, alias/rename policy,
  non-reuse, deprecation/supersession, and collision handling.
- Define `RuleProjection` contracts with consumers and refusal reasons.
- Replace `Naming And Language Decisions` with a concrete table; broad guidance
  is not enough.
- Add a write-set/protected-path expectation for later implementation, even if
  this packet does not implement source code.

### `specs/habitat-harness/spec.md`

- Replace the single broad requirement with separate requirements for:
  selector identity, path coverage, graph target references, execution adapter
  metadata, baseline references, Pattern Authority references,
  protected-zone references, local feedback eligibility, projection refusal,
  and compatibility-only legacy fields.
- Add scenarios for wrong selector namespace, unresolved path coverage,
  missing graph target reference, Pattern Authority contradiction, missing
  baseline-introduction reference, unknown protected zone reference, and
  pre-commit eligibility not implying CI or verification authority.
- Use normative SHALL language for closed refusal states and projection
  minimality.

### `tasks.md`

- Add a pre-implementation task to inventory all current registry fields and
  classify each field under the term disposition table.
- Add a task to author the projection matrix before TypeScript edits.
- Add a task to create malformed metadata fixtures for each projection refusal.
- Add a task to update D0 matrix citations for any public or exported field name
  preserved, versioned, facaded, deprecated, refused, document-only, or
  generated-only.
- Add a task to record validation results in the D2 phase record.
- Add a task to update downstream ledgers packet-by-packet, not as "later
  domino packets."

### `workstream/phase-record.md`

- Add current status: "not accepted; domain/ontology P1/P2 blockers pending."
- Add D0/D1 prerequisite state, explicitly: D0 and D1 are accepted for
  design/specification only; D2 implementation still needs concrete D0 rows for
  public surfaces it changes.
- Add validation gate rows with command, expected status, oracle, bad case,
  cache/freshness stance, and non-claims.
- Add non-claims: D2 does not prove graph target execution, D4 routing
  correctness, D5 baseline authority, D8 pattern admission, D10 zone authority,
  D11 hook correctness, or source implementation.

### `workstream/review-disposition-ledger.md`

- Add each P1/P2 finding from this scratch record as accepted/blocking unless
  a later reviewer explicitly rejects it with evidence.
- Do not mark the per-domino adversarial gate complete until proposal, design,
  spec, tasks, phase record, downstream ledger, and closure checklist all cite
  the repaired ontology.

### `workstream/downstream-realignment-ledger.md`

- Replace "Later domino packets" with exact rows:
  - D3 consumes `GraphTargetProjection`.
  - D4 consumes `PathCoverageProjection` and selector facts.
  - D5 consumes `BaselineProjection`.
  - D6/D7 consume `ExecutionAdapterProjection` and rule identity.
  - D8 consumes `PatternAuthorityProjection`.
  - D10/G-HOST consume `ProtectedZoneProjection`.
  - D11 consumes `LocalFeedbackProjection`.
  - D13 consumes rule owner/projection state only if scaffolding/generator
    registration uses D2 metadata.

### `workstream/closure-checklist.md`

- Add checklist items for accepted ontology, term disposition, projection
  matrix, closed refusal reasons, expanded scenarios, validation recording
  contract, and downstream projection rows.
- Keep D2 blocked until all P1/P2 findings are repaired.

## Stop Condition

D2 must remain not acceptable while any of these are ambiguous:

- whether `ownerProject` means rule maintainer, graph project, target owner, or
  domain authority;
- whether `ownerTool` means execution adapter or owner;
- whether `scope` is a legacy prose field, a path coverage declaration, or a D4
  routing result;
- whether `lane` is enforcement disposition, governance lifecycle, or output
  severity;
- which qualified manifest type is being referenced;
- which projection each downstream packet consumes;
- which refusal reason applies when required metadata is missing or
  contradicted.

If these decisions remain open, D2 has not met the domain/ontology bar and
should not authorize source implementation.
