# Design: D2 Rule Registry Metadata Contract

## Frame

D2 is a high-fanout design/specification packet. It defines the canonical rule registry metadata contract that later implementation agents use to refactor Habitat's current rule registry. D2 is not a documentation repair and not a source implementation. It is accepted only when implementation can proceed without choosing the registry ontology, target TypeScript state model, projection boundaries, public compatibility strategy, malformed metadata behavior, or downstream handoff semantics.

Current code is evidence, not authority. The target product scenario is repo maintenance: agents and humans need Habitat to classify, check, route, guard, scaffold, refuse, and recover against a coherent registry of structural checks.

## Current Diagnosis

Current `rules.json` has 52 rules and 16 observed fields:

`detect`, `exceptionPath`, `forbiddenFileNames`, `forbids`, `generatedZone`, `gritPattern`, `hookScope`, `id`, `lane`, `message`, `nxTarget`, `ownerProject`, `ownerTool`, `remediate`, `scope`, and `why`.

Observed `ownerTool` counts:

| `ownerTool` | Count |
| --- | ---: |
| `biome` | 1 |
| `file-layer` | 4 |
| `grit-check` | 32 |
| `habitat-native` | 4 |
| `nx-boundaries` | 1 |
| `wrapped-script` | 3 |
| `wrapped-test` | 7 |

Observed `lane` counts:

| `lane` | Count |
| --- | ---: |
| `advisory` | 3 |
| `enforced` | 49 |

The current `HarnessRule` shape mixes identity, reporting prose, execution strategy, path applicability, graph target hints, baseline state, Grit pattern identity, generated-zone references, hook participation, and future Pattern Authority references in one optional-field object. This creates invalid reachable states: Grit rows without patterns, non-Grit rows with Grit fields, file-layer rows without a generated-zone or file-name policy, wrapped tests without structured target references, graph targets parsed from colon strings, and path routing inferred from prose.

Current consumers duplicate authority:

- `architecture.ts` casts raw JSON to `HarnessRule[]` and dispatches execution by `ownerTool`.
- `rule-selection.ts` returns whole rules from selector logic, `check-report.ts` filters staged Grit rules by `hookScope` and emits report rows from the whole record, and `classify.ts` parses `scope` for classify routing.
- `plugin.js` reads `rules.json` independently, hard-codes `OWNER_ROOTS`, silently skips unknown owners, and parses `nxTarget` colon strings.
- `baseline.ts` separately parses rule ids and `exceptionPath` while external exception rules live in code.
- `grit.ts` accepts whole rules, falls back from missing `gritPattern` to `id`, owns scan roots in code, and parses `scope` for ignored tests.
- `generated-zones.ts` owns a separate generated-zone table while rules only store string references.
- Pattern Authority and pattern registration code project from the broad rule row and write the broad shape back into `rules.json`.

## Domain Boundary

### D2 Owns

- Rule identity metadata completeness.
- The canonical versioned registry document contract.
- Target registry term dispositions.
- The rule state model for registry rows.
- Consumer projection contracts.
- The mapping from current registry fields into target facets.
- Malformed metadata failure categories and their D1 output family.
- Compatibility-facade requirements when D0 preserves public legacy surfaces.

### D2 Does Not Own

| Adjacent owner | D2 handoff | Boundary |
| --- | --- | --- |
| D0 Public Contract Inventory | D0 `surface_id` rows for touched public/durable surfaces | D2 cannot preserve, version, facade, deprecate, refuse, document-only, or generated-only a public surface without D0 citation. |
| D1 Command/Receipt Boundary | D1 command records, check reports, diagnostics, refusal records, and non-claims | D2 malformed metadata uses D1 output families and does not invent proof/evidence artifacts. |
| D3 Workspace Graph Boundary | `ruleGraphFacts` declarations | D3 owns resolved Nx graph truth, target availability, and graph error classification. |
| D4 Orientation And Routing | `ruleRoutingFacts` | D4 owns user-facing orientation and next-action guidance. |
| D5 Baseline Authority | `ruleBaselineFacts` | D5 owns baseline load state, shrink-only behavior, stale/debt rows, and expansion refusal. |
| D6 Diagnostic Pattern Catalog | `ruleGritFacts` and diagnostic identifiers | D6 owns diagnostic normalization and adapter failure taxonomy. |
| D7 Structural Enforcement Pipeline | selector/routing/execution/baseline/Grit/generated-zone inputs | D7 owns check aggregation, enforcement status, and false-green prevention. |
| D8 Pattern Governance | `ruleGovernanceFacts` | D8 owns Pattern Authority lifecycle, admission, fixtures, false-positive model, and governance acceptance. |
| G-HOST and D10 | `ruleFileLayerFacts` references | G-HOST/D10 own host policy, protected-zone authority, regeneration authority, and guard/refusal behavior. |
| D11 Local Feedback | local-feedback eligibility facts | D11 owns hook behavior, staged feedback, and local-output semantics. |
| D13 Scaffolding And Refusal | scaffold/governance relation facts | D13 owns generator support and unsupported-shape refusals. |

## Target Ontology

Use standard engineering terms first. Attach special terms only where Habitat owns an invariant.

| Entity | Meaning | Owner |
| --- | --- | --- |
| `RuleDefinition` | Stable registry identity for one structural check or diagnostic rule. | D2 |
| `RuleOwner` | Project/domain responsible for maintaining the rule definition. | D2 records; owning project/domain maintains. |
| `ExecutionAdapter` | Mechanism family that executes a rule or acquires diagnostics. | D2 records; D6/D7 consume. |
| `PathCoverage` | Machine-readable path applicability declaration. | D2 records; D4 consumes. |
| `GraphTargetReference` | Structured project/target metadata used by graph/Nx consumers. | D2 records; D3 consumes. |
| `BaselineReference` | Relation from a rule to baseline authority. | D2 records; D5 consumes. |
| `GritPatternReference` | Relation from a rule to Grit pattern identity and scan metadata. | D2 records; D6/D8 consume. |
| `PatternAuthorityReference` | Relation from a rule to Pattern Authority manifest state. | D2 records; D8 owns admission. |
| `ProtectedZoneReference` | Relation from a rule to generated/protected-zone declaration. | D2 records; G-HOST/D10 consume. |
| `LocalFeedbackEligibility` | Declaration that a rule may participate in local feedback. | D2 records; D11 consumes. |
| `RuleProjection` | Consumer-specific view with fields, completeness state, refusal reason, and boundary. | D2 |

## Target Type Model

D2 chooses a versioned registry document parsed into closed rule states. Implementation uses TypeBox schemas as the source of truth for this serialized registry contract, derives TypeScript types from those schemas, and validates external/serialized registry data through TypeBox validation before any consumer receives projections:

```ts
interface RuleRegistryDocumentV1 {
  schemaVersion: 1;
  rules: readonly RuleRegistryRecord[];
}
```

`ownerTool` remains the compatibility selector vocabulary and the internal discriminant for D2. Introducing a second `ruleKind` while preserving `ownerTool` would create a synchronization state without enough benefit. D0 may later version or facade the public name; D2 implementation must not rename it publicly without D0 rows.

Target state families:

```ts
type RuleRegistryRecord =
  | HabitatNativeRule
  | WrappedScriptRule
  | WrappedTestRule
  | GritCheckRule
  | FileLayerRule
  | BiomeRule
  | NxBoundariesRule;
```

Every rule includes identity and human report facts:

- `id`
- `ownerProject`
- `ownerTool`
- `lane`
- `forbids`
- `why`
- `message`
- `remediate`

Variant constraints:

| Variant | Required target facts | Invalid states eliminated |
| --- | --- | --- |
| `habitat-native` | command execution facts, routing, graph, baseline state | built-in/native rule without an execution/report contract |
| `wrapped-script` | command execution facts, routing, graph, baseline state | shell rule with missing command metadata |
| `wrapped-test` | structured `GraphTargetReference`/execution target | wrapped test with missing or colon-parsed `nxTarget` |
| `grit-check` | `GritPatternReference`, scan metadata, local-feedback eligibility, governance relation | Grit rule without `gritPattern`, hidden id fallback, global optional `hookScope` |
| `file-layer` | exactly one of `ProtectedZoneReference` or forbidden-file-name policy | file-layer rule with neither or both generated-zone and file-name policy |
| `biome` | workspace target execution, graph alias facts | special-case alias outside registry facts |
| `nx-boundaries` | workspace target execution, graph alias facts | special-case alias outside registry facts |

Raw `scope` is not a target authority field. It may survive only as D0-classified compatibility prose or generated legacy view.

## Registry Field Inventory

| Current field or table | Current consumers | Current problem | Target facet/status | Required D0/D1 condition | Bad case |
| --- | --- | --- | --- | --- | --- |
| `id` | all consumers | only string-checked in some paths | target-retained `RuleDefinition.id` | D0 rows if public row shape changes | duplicate, empty, or non-string id fails registry load |
| `ownerProject` | selector, classify, plugin, reports | conflates maintainer, graph owner, and project root | target-retained `RuleOwner.id`; graph root separately declared | D0 rows for command JSON/export compatibility | unknown owner without graph relation refuses graph projection |
| `ownerTool` | selector, execution, graph aliases, hooks | names adapter, not owner | target-retained compatibility discriminant as `ExecutionAdapter` | D0 rows if name/output changes | unknown adapter fails before execution |
| `lane` | reports, Pattern Authority projection | conflates enforcement disposition and governance lifecycle | target-renamed internally to `enforcementDisposition`; public `lane` compatibility only | D0 rows if output/export changes | unsupported lane fails registry load |
| `scope` | classify, Grit ignored tests, human docs | prose used as machine authority | compatibility-only prose; replaced by `PathCoverage` and `GritScanFacet` | D0 rows for classify output/docs examples | routing consumer cannot read `scope` |
| `detect` | execution, reports | command string mixed with registry state | execution/report facet; may be legacy facade | D0 rows for check JSON/report compatibility | command execution variant without command facts fails |
| `forbids`, `why`, `message`, `remediate` | reports/docs | human prose can leak into authority | report/human-output facts only | D0 rows for human/JSON output | projection rejects these as routing/graph/baseline authority |
| `exceptionPath` | baseline | sentinel and hidden external exceptions | `BaselineReference` state | D1 check-report/diagnostic family for malformed state | external exception without declared source fails baseline projection |
| `nxTarget` | plugin, wrapped tests | colon-string graph authority | structured `GraphTargetReference`; compatibility-only input during migration | D0 rows for Nx metadata/export changes | malformed target ref fails graph projection |
| `gritPattern` | Grit, Pattern Authority | optional on broad row; fallback to id exists | required `GritPatternReference.pattern` for `grit-check` | D1 metadata failure if missing | missing pattern fails before Grit execution |
| `hookScope` | staged execution, Pattern Authority | global optional field | `LocalFeedbackEligibility` on Grit state | D1/D11 boundary for hook output | hook-eligible non-Grit rule fails registry load |
| `manifestPath` | Pattern Authority/generator | optional future field; ambiguous manifest term | qualified `PatternAuthorityReference.manifestPath` | D8 owns admission; D1 failure output if contradicted | registered reference without manifest path fails governance projection |
| `generatedZone` | file-layer, generated-zone table | string link to code table discovered at execution | `ProtectedZoneReference` to G-HOST/D10 declaration | D1 refusal/recovery family for unknown zone | unknown zone refuses before silent pass |
| `forbiddenFileNames` | file-layer | optional peer to generated zone | file-layer policy variant | D1 diagnostic/refusal family | file-layer with both generated zone and forbidden names fails |
| `generatedZones` code table | file-layer | zone authority split from registry | downstream-owned declaration consumed by D2 reference | G-HOST/D10 own policy | D2 cannot define protected-zone policy locally |
| `OWNER_ROOTS` in `plugin.js` | Nx plugin | duplicate graph owner/root authority | replaced by `ruleGraphFacts`/D3 graph truth | D0 rows for Nx target metadata | unknown owner cannot be silently skipped |

## Facet Contract

| Facet | Owns | Required fields | Forbidden fields | Refusal if missing/contradicted | Consumers |
| --- | --- | --- | --- | --- | --- |
| Identity | rule id, owner id, adapter id, enforcement disposition | `id`, `ownerProject`, `ownerTool`, `lane` | prose-only identity | `registry-identity-metadata-missing` | all projections |
| Report | human/report copy only | `forbids`, `why`, `message`, `remediate` | routing/graph/baseline authority | `registry-report-metadata-invalid` | D1/D7 reports |
| Selector | selector namespace facts | `id`, `ownerProject`, `ownerTool` | `scope`, prose, command strings | `rule-selection-integrity` or unknown selector result | check/classify selectors |
| PathCoverage | machine applicability | path globs, project-owner, workspace-gate, or explicit unresolved state | raw `scope` as authority | `unresolved-routing-metadata` | classify, D4, D7 |
| GraphTargetReference | declared graph target metadata | owner project/root relation, alias policy, structured dependency target | `OWNER_ROOTS`, colon parsing | `graph-metadata-contract-failure` | D3, plugin, classify target listing |
| BaselineReference | registry relation to baseline authority | baseline file/external/no-baseline state, introduction reference where required | file-presence-only admission | baseline contract failure through D5/D1 | D5, D7, D8 |
| GritPatternReference | Grit pattern and scan metadata | pattern name, scan roots/exclusions, hook eligibility | pattern id fallback, Grit prose/frontmatter | `grit-metadata-contract-failure` | D6, D7, D8 |
| ProtectedZoneReference | generated/protected-zone or file-name policy relation | zone id plus host declaration link, or forbidden filename policy | local protected-zone policy | `generated-zone-metadata-contract-failure` | G-HOST, D10, D7, D13 |
| PatternAuthorityReference | registry-to-governance relation | manifest path/status projection when registered | governance admission decision | `pattern-authority-contract-failure` | D8, D13 |
| LocalFeedbackEligibility | local staged feedback eligibility declaration | not eligible, pre-commit eligible, or refused staged scope | hook execution behavior | `local-feedback-metadata-failure` | D11, hooks |

## Consumer Projection Matrix

| Projection | Consumers | Includes | Excludes | Failure mode | Downstream |
| --- | --- | --- | --- | --- | --- |
| `ruleSelectorFacts` | check, classify selector paths, rule selection tests | ids, owner ids, adapter ids, selector namespace, matched ids | `scope`, `detect`, prose | D1-aligned selector failure; not zero executed rules | D7 |
| `ruleReportFacts` | check report, diagnostics, docs examples | id, owner adapter, enforcement disposition, detect/report text | routing, graph, baseline decisions | D1 check report diagnostic/failure | D1, D7 |
| `ruleCommandExecutionFacts` / `ruleGritFacts` / `ruleFileLayerFacts` | command execution, Grit adapter, file-layer adapter, D7 pipeline | consumer-specific execution facts for command, Grit, and file-layer rules | synthetic execution DTOs, whole rule row, graph-only fields | D1 command outcome/refusal or adapter-specific metadata failure before execution | D7 |
| `ruleRoutingFacts` | classify, D4 | path coverage state, matched glob/source, unresolved reason | raw `scope` prose, report text | `unresolved-routing-metadata` | D4 |
| `ruleGraphFacts` | Nx plugin, D3, classify target list | owner/root relation, alias policy, structured dependency target | `OWNER_ROOTS`, `nxTarget` string parsing | `graph-metadata-contract-failure` | D3 |
| `ruleBaselineFacts` | baseline, D5, D7 | rule id, baseline state, exception source, introduction manifest relation | whole row, file presence alone | D5/D1 baseline contract failure | D5 |
| `ruleGritFacts` | Grit adapter, D6, D8 | pattern name, scan roots, exclusions, manifest reference if registered | pattern id fallback, Grit prose, local feedback eligibility | `grit-metadata-contract-failure` | D6, D8 |
| `ruleFileLayerFacts` | file-layer, G-HOST, D10, D13 | zone id, host declaration link, forbidden-file policy | generated-zone policy decisions | `generated-zone-metadata-contract-failure` | G-HOST, D10, D13 |
| `ruleGovernanceFacts` | Pattern Authority, generator, D8, D13 | Pattern Authority reference, lifecycle expectation, accepted-state projection | admission decision, fixture sufficiency | `pattern-authority-contract-failure` | D8, D13 |
| `ruleLocalFeedbackFacts` | hooks, D11 | pre-commit eligibility and staged-scope metadata | hook output behavior | `local-feedback-metadata-failure` | D11 |

No consumer may receive `RuleRegistryRecord` directly unless D2 amends this matrix with a named exception and reason. Current `HarnessRule` exports are compatibility facade candidates, not internal authority.

## Term Disposition

| Current term | Target term | Status | Forbidden interpretation |
| --- | --- | --- | --- |
| `ownerTool` | `ExecutionAdapter` with public compatibility name | retained as discriminant/selector vocabulary | domain owner |
| `ownerProject` | `RuleOwner.id` | retained but narrowed | graph root or downstream authority |
| `lane` | `enforcementDisposition` | compatibility-only public name unless D0 preserves | Pattern Authority lifecycle |
| `scope` | `PathCoverage` plus report prose | rejected as target authority | routing, Grit scan, graph, baseline, governance authority |
| `nxTarget` | `GraphTargetReference` | target-renamed internally; compatibility-only migration input | colon-string graph truth |
| `gritPattern` | `GritPatternReference.pattern` | retained for Grit state | optional fallback to id |
| `manifestPath` | `PatternAuthorityReference.manifestPath` or `BaselineReference.introductionManifestPath` when qualified | unqualified term rejected | generic manifest authority |
| `generatedZone` | `ProtectedZoneReference.zoneId` | compatibility-only field name unless D0 preserves | D2-owned protected-zone policy |
| `hookScope` | `LocalFeedbackEligibility` | target-renamed internally; compatibility-only public name | D11 hook behavior |
| `file-layer` | `ExecutionAdapter.file-layer` | retained as adapter id | protected-zone authority |
| `wrapped-test` | `ExecutionAdapter.wrapped-test` | retained as adapter id | graph target authority |
| `wrapped-script` | `ExecutionAdapter.wrapped-script` | retained as adapter id | structured diagnostics |
| `detect` | execution command plus report compatibility | split internally | universal execution/report state |
| `why`, `forbids`, `message`, `remediate` | report facts | retained as human/report facts | machine authority |
| `proof`, `evidence` | not a D2 product term | rejected except source-evidence prose | product type/code name |

## D0 And D1 Dependency Inventory

Before D2 source implementation starts, the implementation packet must cite concrete D0 `surface_id` rows for:

| Surface class | Current examples | D2 risk |
| --- | --- | --- |
| CLI JSON/human output | `habitat check -- --json`, `habitat classify` | report fields, selector failures, routing states, malformed metadata failures |
| Package exports | `HarnessRule`, `rules`, `ruleById`, `executeRule` from `tools/habitat-harness/src/index.ts` | registry type/facade compatibility |
| Nx inferred target metadata | `nx show project @internal/habitat-harness`, `habitat:rule:*` targets | graph alias and dependency target shape |
| Generator output | pattern generator writes to `rules.json` | registry schema and manifest reference shape |
| Hook/local feedback output | staged Grit selection and file-layer checks | hook eligibility and malformed metadata wording |
| Docs/examples | Habitat scenarios and implemented-surface docs | public guidance for supported registry behavior |

Concrete implementation-start citations are recorded in `workstream/implementation-start-inventory.md`. D2 rows may use `blocked-pending-d0-row` placeholders only in historical design artifacts, never as implementation closure evidence.

Malformed metadata must use D1 output families:

| Failure family | D1 family |
| --- | --- |
| selector namespace or identity failure | check report / selector failure diagnostic |
| routing metadata missing or contradicted | classify/check diagnostic or refusal before route claim |
| graph metadata missing or unknown owner/root | command outcome/check diagnostic before target claim |
| baseline reference missing/contradicted | check report diagnostic through D5 baseline contract |
| Grit/generated-zone/governance metadata missing | command outcome/refusal or diagnostic before execution |
| unsupported protected-zone or scaffold relation | D1 refusal record consumed by D10/D13 |

D2 must not invent a separate `proof`, `evidence`, or generic artifact result shape for these cases.

## Implementation Write Set

Later D2 implementation may touch these paths after D0 rows exist:

- `tools/habitat-harness/src/rules/architecture.ts`
- `tools/habitat-harness/src/rules/rules.json`
- New registry owner modules under `tools/habitat-harness/src/rules/`
- `tools/habitat-harness/src/lib/rule-selection.ts`
- `tools/habitat-harness/src/lib/check-report.ts`
- `tools/habitat-harness/src/lib/classify.ts`
- `tools/habitat-harness/src/lib/verify-receipt.ts`
- `tools/habitat-harness/src/plugin.js`
- `tools/habitat-harness/src/lib/baseline.ts`
- `tools/habitat-harness/src/lib/grit.ts`
- `tools/habitat-harness/src/lib/grit-injected-probe.ts`
- `tools/habitat-harness/src/lib/generated-zones.ts`
- `tools/habitat-harness/src/rules/pattern-authority/manifest.ts`
- `tools/habitat-harness/src/generators/pattern/generator.cjs`
- `tools/habitat-harness/src/generators/pattern/registration.cjs`
- `tools/habitat-harness/src/index.ts`
- Focused tests under `tools/habitat-harness/test/`

Protected during D2 source implementation unless an amended packet re-reviews them:

- Downstream D3-D15/G-HOST behavior/spec rewrites beyond dependency metadata.
- Generated artifacts and lockfiles.
- Non-Habitat product code outside the listed write set.
- Baseline JSON content except test fixtures or explicitly required D2 metadata migration with D5 awareness.
- `.grit` active patterns except generator tests/fixtures required for D2 compatibility.

## Safe Refactor Sequence

1. Introduce registry parser/model and compatibility facade without changing command behavior.
2. Add projection functions and tests against current data.
3. Migrate selector/report consumers to projections.
4. Migrate classify routing away from prose `scope`.
5. Migrate Nx plugin graph facts, including JS runtime boundary.
6. Migrate baseline, Grit, injected-probe, generated-zone, Pattern Authority, hook, and generator consumers one projection at a time.
7. Remove consumer-local inference and fallback paths after equivalent projections are covered.
8. Update docs/tests only where public behavior or accepted terminology changes.

Every slice must have compiler/test gates before the next slice. Deletion of fallback inference is required; moving code without deleting invalid states does not satisfy D2.

## Rejected Alternatives

- **Add more optional fields to `rules.json`.** Rejected because it expands optional soup and leaves invalid combinations reachable.
- **Make D2 own all registry-adjacent truth.** Rejected because graph, routing, baseline, governance, protected-zone, hook, diagnostics, and scaffolding each have separate owners.
- **Let every consumer build its own projection.** Rejected because that preserves the current split-authority bug.
- **Rename `ownerTool` immediately.** Rejected for D2 because it is current public selector/report vocabulary; internal narrowing is allowed, public rename needs D0.
- **Keep prose `scope` and improve parsing.** Rejected because prose cannot be a stable authority surface.

## Acceptance Standard

D2 can be accepted for design/specification only when:

- The review ledger imports all prior D2 P1/P2 findings.
- The D2 packet specifies the registry field inventory, target ontology, facet contract, projection matrix, term dispositions, D0/D1 prerequisites, write/protected sets, validation gates, and downstream rows.
- Fresh final D2 review finds no unresolved accepted P1/P2 findings.
- OpenSpec validation passes.

D2 is not implementation-complete until source code is refactored in implementation and all D0/D1/D2 validation gates pass.
