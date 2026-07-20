# Takeover Rule Diagnostics Resource Wave 01

```json
{"stage":"post-G.1","unit":"rule-diagnostics-resource","base":"e32c4749df0f8806b2c21d1a3037ea0bb4356416","status":"sealed-local-graphite-layer","mutationLease":null}
```

## Objective

Make rule diagnostics a stable consumed capability before G.2. Callers select
registered diagnostic rule ids and pass one closed scope. The selected provider
captures repository root, rule bindings, acquisition policy, assets, and
lifetime once. Grit remains the concrete implementation; its authored assets
are not claimed to be interchangeable with another provider.

This is a simplification slice. It also deletes the unreachable TypeScript
compiler-API source-rule engine. The formerly empty source projection and its
executor are deleted; source syntax authority belongs to registered Grit or
adjacent command checks.

The compiler API remains where structured TypeScript parsing is an active
capability, including execution-surface import analysis. It is not retained as
a second rule engine or added as a verifier for this boundary.

## Locked Contract

```ts
interface RuleDiagnosticsService {
  readonly runRules: (
    demand: {
      readonly ruleIds: readonly [string, ...string[]];
      readonly scope:
        | { readonly kind: "authored" }
        | { readonly kind: "paths"; readonly paths: readonly string[] };
    }
  ) => Effect.Effect<ReadonlyMap<string, RuleDiagnosticExecutionResult>, never>;
}
```

- `RuleDiagnosticFacts` is the capability projection: id, lane, message, path
  coverage, and authored scan roots.
- `RuleGritFacts` is the provider binding: Grit runner/assets, pattern identity,
  acquisition policy, and the capability facts needed to execute.
- The structural caller selects `rules.diagnostic`, never `rules.grit`.
- The resource returns exactly one terminal result for every demanded
  diagnostic rule id. Missing provider binding is a typed provider-contract
  failure, never a silently absent map row.
- The result is one closed terminal union. Executed evidence,
  not-applicability, provider failure, and dependency refusal cannot be
  combined into contradictory states.
- Empty path scope is meaningful and becomes per-rule
  `no-matched-scan-roots`; the duplicate
  `staged-scope-no-approved-roots` state is deleted.
- Provider failures use capability-level discriminants. Grit wire identities,
  command schemas, catalog entries, and observations remain provider-private.
- Successful pinned-native preflight is lazy once per realized provider layer.
  No process-global cache or ad hoc mutable flag is admitted.
- The existing Grit apply-dry-run dependency remains a named G.2 residual. It
  is not added to `RuleDiagnostics` and no live mutation is admitted.

## Topology

```text
tools/habitat/src/resources/rule-diagnostics/
  resource.ts
  fake.ts
  index.ts
  providers/grit/
    provider.ts
    command.ts
    ...existing Grit implementation
```

There is no `select.ts`: Habitat has one admitted provider and no provider-choice
grammar. The runtime composition root imports the exact concrete layer. A second
runtime path constructs the plain raw-apply collaborator that G.2 deletes. All
other production code consumes the stable resource.

## Categorical Deletions

- `RuleSourceFacts`, `RuleSourceFactsSchema`, `ruleSourceFacts`, and the empty
  `RuleFactsCatalog.source` facet.
- Native source-rule loading/execution and its tests under
  `service/model/source-check/policy/source/`.
- Unused generic aliases over Grit catalog, identity, and outcome models.
- Unused diagnostic consumer-result schema/projection.
- Public Grit-prefixed provider failure discriminants and Grit-specific
  provider failure rendering.
- The old `tools/habitat/src/providers/grit` tree and all compatibility barrels.
- TypeScript compiler-API or custom import-graph enforcement proposals.

## Historical Planned Write Set

This design-time list is retained only as recovery evidence. It includes names
the implementation later deleted or rejected. The final exact path set and
object digest below are the review and mutation authority.

Authority and package surface:

```text
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/rule.json
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/baseline.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
tools/habitat/package.json
tools/habitat/scripts/execution-surface-map.ts
```

Runtime, service, and stable model:

```text
tools/habitat/src/resources/rule-diagnostics/fake.ts
tools/habitat/src/resources/rule-diagnostics/index.ts
tools/habitat/src/resources/rule-diagnostics/resource.ts
tools/habitat/src/resources/rule-diagnostics/select.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/runtime/test-layers.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/impl.ts
tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts
tools/habitat/src/service/model/check/dto/check.schema.ts
tools/habitat/src/service/model/check/policy/structural/context.policy.ts
tools/habitat/src/service/model/check/policy/structural/diagnostic-execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts
tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts
tools/habitat/src/service/model/diagnostics/index.ts
tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/index.ts
tools/habitat/src/service/model/rules/policy/catalog.policy.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/source-check/index.ts
tools/habitat/src/service/model/source-check/policy/source-scope.policy.ts
tools/habitat/src/service/model/source-check/policy/source/index.ts
tools/habitat/src/service/model/source-check/policy/source/module-paths.policy.ts
tools/habitat/src/service/model/source-check/policy/source/source-rules.policy.ts
```

Provider relocation and private models:

```text
tools/habitat/src/providers/grit/apply-dry-run.ts
tools/habitat/src/providers/grit/check.ts
tools/habitat/src/providers/grit/constants.ts
tools/habitat/src/providers/grit/diagnostics.ts
tools/habitat/src/providers/grit/env.ts
tools/habitat/src/providers/grit/failure.ts
tools/habitat/src/providers/grit/index.ts
tools/habitat/src/providers/grit/output.ts
tools/habitat/src/providers/grit/request.ts
tools/habitat/src/providers/grit/resource.ts
tools/habitat/src/providers/grit/runner.ts
tools/habitat/src/providers/grit/scan-roots/index.ts
tools/habitat/src/providers/grit/scoped-config.ts
tools/habitat/src/providers/grit/types.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/command.schema.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/constants.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/diagnostics.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/env.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/failure.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/identity.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/outcome.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/request.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/runner.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scan-roots/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scoped-config.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/types.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts
```

Focused tests and support:

```text
tools/habitat/test/lib/check-baseline-provider-boundary.test.ts
tools/habitat/test/lib/check-summaries.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/hooks.test.ts
tools/habitat/test/lib/pattern-apply.test.ts
tools/habitat/test/lib/rule-selection.test.ts
tools/habitat/test/lib/source-rules.test.ts
tools/habitat/test/lib/source-scan-roots.test.ts
tools/habitat/test/lib/structure-check-execution.test.ts
tools/habitat/test/lib/vendor-providers.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/service/check-baseline-manifest-service.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/service/hook-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```

## Seal Receipt

```json
{"branch":"codex/mapgen-runtime-closeout-rule-diagnostics-resource","parent":"e32c4749df0f8806b2c21d1a3037ea0bb4356416","initialCreate":"9b6bde9c29217c53cec68f607617f334a2038b44","paths":99,"preCreateDigest":"a56a1063e724ad652a8105fa4e04516da49d5bc0cebdc7cbf61253b7b413a379","receiptAmendment":"terminal records only","remoteMutation":false}
```

Exact staging and the initial Graphite commit matched the 99-path manifest.
Only this terminal receipt, the live ledger, the gate receipt, and lease closure
were amended afterward. The final commit identity is the branch ref because a
commit cannot contain its own amended hash.

Generated currentness and closeout records:

```text
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-rule-diagnostics-resource-01.md
```

The implementation owner must stop before touching any other path. Generated
execution-surface outputs may change only through the existing generator.

## Initial Exact Review Set

The initial review authority was the 97-path set below plus its external mode/blob
manifest. Deleted paths are represented by zero-mode rows in that manifest;
all three fresh roles reproduced SHA-256 `6db3cf8c646b9d816d8c90c641dde7e70dd1ec9e582d85fee28b4079b3c6471b`.
This set is historical after the accepted review findings; the successor freeze
below becomes mutation authority.

```text
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/rule.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/baseline.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-rule-diagnostics-resource-01.md
tools/habitat/package.json
tools/habitat/scripts/execution-surface-map.ts
tools/habitat/src/providers/grit/apply-dry-run.ts
tools/habitat/src/providers/grit/check.ts
tools/habitat/src/providers/grit/constants.ts
tools/habitat/src/providers/grit/diagnostics.ts
tools/habitat/src/providers/grit/env.ts
tools/habitat/src/providers/grit/failure.ts
tools/habitat/src/providers/grit/index.ts
tools/habitat/src/providers/grit/output.ts
tools/habitat/src/providers/grit/request.ts
tools/habitat/src/providers/grit/resource.ts
tools/habitat/src/providers/grit/runner.ts
tools/habitat/src/providers/grit/scan-roots/index.ts
tools/habitat/src/providers/grit/scoped-config.ts
tools/habitat/src/providers/grit/types.ts
tools/habitat/src/resources/rule-diagnostics/fake.ts
tools/habitat/src/resources/rule-diagnostics/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/command.schema.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/constants.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/diagnostics.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/env.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/failure.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/identity.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/outcome.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/request.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/runner.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scan-roots/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scoped-config.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/types.ts
tools/habitat/src/resources/rule-diagnostics/resource.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/runtime/test-layers.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/impl.ts
tools/habitat/src/service/model/check/dto/check.schema.ts
tools/habitat/src/service/model/check/policy/structural/context.policy.ts
tools/habitat/src/service/model/check/policy/structural/diagnostic-execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/index.ts
tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-scan-root.schema.ts
tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts
tools/habitat/src/service/model/diagnostics/index.ts
tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/catalog.policy.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/source-check/index.ts
tools/habitat/src/service/model/source-check/policy/source-scope.policy.ts
tools/habitat/src/service/model/source-check/policy/source/index.ts
tools/habitat/src/service/model/source-check/policy/source/module-paths.policy.ts
tools/habitat/src/service/model/source-check/policy/source/source-rules.policy.ts
tools/habitat/src/service/modules/fix/module.ts
tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts
tools/habitat/src/service/modules/hook/router/pre-push.router.ts
tools/habitat/test/lib/check-baseline-provider-boundary.test.ts
tools/habitat/test/lib/check-summaries.test.ts
tools/habitat/test/lib/config.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/hooks.test.ts
tools/habitat/test/lib/pattern-apply.test.ts
tools/habitat/test/lib/rule-diagnostics.test.ts
tools/habitat/test/lib/rule-selection.test.ts
tools/habitat/test/lib/source-rules.test.ts
tools/habitat/test/lib/source-scan-roots.test.ts
tools/habitat/test/lib/structure-check-execution.test.ts
tools/habitat/test/lib/vendor-providers.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/service/check-baseline-manifest-service.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/service/hook-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```


## Proof Oracle

1. TypeScript rejects provider-shaped demand at the stable resource.
2. Structural check selects generic diagnostic facts and never imports or
   selects Grit.
3. Authored, nonempty path, and empty path scope each produce exact terminal
   results; no demanded diagnostic id disappears.
4. All provider failure states cross into the public report under generic
   discriminants while malformed and incomplete output remain distinct.
5. Concurrent commands share one successful preflight within a realized live
   provider; separate provider realizations each preflight once.
6. Fix dry-run behavior remains unchanged and live writes remain refused.
7. The compiler-API source engine and old provider root have zero live source
   occurrences.
8. The registered provider-import rule catches alias, relative, type-only,
   side-effect, and re-export imports. Only the exact runtime composition and
   temporary G.2 raw-apply roots may import the concrete provider.
9. Focused tests, full Habitat check/boundaries/build/test, differential Biome,
   strict OpenSpec, live provider execution, the complete registered Grit
   matrix, execution-map regeneration, diff hygiene, and process/ref/inherited
   censuses pass at the frozen tree.

## Exterior

- no G.2 fix admission or live mutation;
- no A.2/domain rules;
- no ast-grep interchangeability claim;
- no RuntimeResource/Profile/bootgraph substrate;
- no provider registry, compatibility barrel, compiler-API verifier, or second
  source engine;
- no historical record rewriting merely because old paths remain as evidence.

## Initial Review Outcome

```json
{"digest":"6db3cf8c646b9d816d8c90c641dde7e70dd1ec9e582d85fee28b4079b3c6471b","roles":{"typescript-state-space":"changes-requested","architecture-authority":"changes-requested","product-runtime-library":"pass"},"accepted":["TS-001","TS-002","TS-003","ARCH-001","AUTH-001"],"repair":"one closed terminal union; fail-closed missing rows; one demand snapshot; private adapter module; current authority nouns"}
```

All five findings are in scope. The repair changes no G.1 wire/acquisition law,
adds no selector or compiler verifier, and reopens all three permanent roles with
fresh sessions because the shared result/provider surface affects each axis.

## Initial Proof Receipt

```json
{"ownerGates":"pass","habitatTests":"418/418","openSpec":"371/371","gritMatrix":"75/80 pass; four known enforced product rows and one known advisory incomplete row","emptyStaged":"80/80 typed not-applicable","differentialBiome":{"headErrors":59,"currentErrorsOnHeadFiles":55,"newStableContractErrors":1,"formatOrImportErrors":0},"executionSurfaces":609,"ruleJsonSurfaces":123,"generatedDeterministic":true,"knownExteriorRows":["habitat-studio-run-runtime-authority-closure","validate_boundary_taxonomy_against_workspace_graph"]}
```

The full Habitat runner remains red only on pre-existing Studio runtime closure,
taxonomy, and repository-wide hygiene rows. Their concrete failures are outside
this slice: three named Studio rules, the unregistered Studio workspace taxonomy
row, and inherited repository Biome findings. Candidate-scoped proof is green;
the single new Biome plugin finding is the explicit closed Effect type on the
stable resource contract rather than a formatter/import defect or hidden alias.

## Successor Repair Proof

```json
{"findingsClosed":["TS-001","TS-002","TS-003","ARCH-001","AUTH-001"],"candidatePaths":99,"habitatTests":"419/419","openSpec":"371/371","gritMatrix":"75/80 pass; four known enforced product rows and one known advisory incomplete row","emptyStaged":"80/80 typed not-applicable","differentialBiome":{"headErrors":59,"currentErrorsOnHeadFiles":55,"newStableContractErrors":1,"formatOrImportErrors":0},"executionSurfaces":610,"ruleJsonSurfaces":123,"generatedDeterministic":true,"packageProviderExports":["makeGritApplyDryRunService","makeGritRuleDiagnosticsLayer"]}
```

The repair collapses independent result/disposition products into one terminal
union, snapshots demand once, and turns every missing demanded row into typed,
diagnostic-bearing contract failure. The provider adapter is private; active
authority names RuleDiagnostics as the capability. Root also deleted the one
repair-introduced `Effect.fn` wrapper rather than carrying a new lint exception.

## Successor Review Outcome 02

```json
{"digest":"95e8bef00762292f910936fccd60bbbdd90455ee3af557df32490d6517a56452","roles":{"typescript-state-space":"changes-requested","architecture-authority":"changes-requested","product-runtime-library":"pass"},"accepted":["TS-004","TS-005","ARCH-002"],"repair":"binding authority before output; first-seen unique demand; dynamic and inline-type coverage with exact static provider edges"}
```

The product role also adjudicated the one overlapping-matrix preflight anomaly.
The exact rule and quiescent matrix passed, and twenty concurrent direct native
version probes returned exact output. Live matrices remain sequential proof;
no global lock, retry, or cross-process cache is admitted without an isolated
recurrence.

## Successor Repair Proof 02

```json
{"findingsClosed":["TS-004","TS-005","ARCH-002"],"candidatePaths":99,"repairPaths":3,"habitatTests":"419/419","gritMatrix":"75/80 stable named rows","emptyStaged":"80/80 typed not-applicable","providerImportForms":{"forbidden":"static, type-only, side-effect, re-export, dynamic, inline-type, deep-private","allowed":"provider internals and three exact public-module static edges"},"candidateBiomeErrors":56,"newErrorLevelFindings":0,"executionSurfaces":610,"ruleJsonSurfaces":123}
```

Provider reconciliation now rejects unsolicited rows for unbound demand,
duplicate ids execute once in first-seen order, and boundary authority governs
the actual package surface rather than whole files. The path set remains 99.

The provider-import coverage claim in this historical receipt was invalidated
by exact review 03: stable-resource relative paths still bypassed its regexes.

## Final Review Outcome 03

```json
{"digest":"c53bc5f3894830e7257533ada1143f01dfda1b588bebbe5b3806f04db3c94f8f","roles":{"typescript-state-space":"pass","architecture-authority":"changes-requested","product-runtime-library":"pass"},"accepted":["ARCH-002"],"repair":"one shared relative-or-prefixed provider path law across all four import forms"}
```

Architecture reproduced `./providers/grit/...` bypasses for static, re-export,
dynamic, and inline-type imports. TypeScript/state-space and product/runtime
passed the exact object with no other P0-P3 finding.

## Final Authority Repair Proof 03

```json
{"findingClosed":"ARCH-002","candidatePaths":99,"repairPaths":1,"syntheticFiles":9,"forbiddenFindings":5,"admittedCases":4,"liveRegisteredRule":"pass","stagedPaths":0}
```

All four source matchers now use the same relative-or-prefixed provider path
law. Pinned-native proof rejects five forbidden forms and ignores only the
three exact public static edges plus provider-internal imports. No runtime or
provider behavior changed.

## Affected Architecture Review Outcome 04

```json
{"digest":"0f665eeb9859ed086d95b48b4834deab02d0d9acadbf846f00d3c8126e8da683","roles":{"architecture-authority":"changes-requested"},"passed":["ARCH-001","ARCH-002"],"accepted":["AUTH-001"],"repair":"one live fleet-state row"}
```

The repaired import boundary passed its pinned-native forbidden/allowed matrix.
The reviewer found one obsolete phase label in the live ledger table, which
contradicted the controlling header and could cause a resumed DRA to repeat all
three review roles.

## Final Authority Repair Proof 04

```json
{"findingClosed":"AUTH-001","candidatePaths":99,"repairPaths":1,"semanticRuntimeBlobsChanged":0,"nextReview":"fresh affected architecture role","stagedPaths":0}
```

The fleet row now names the final authority repair and reopens only the
materially affected architecture role. No implementation or product claim
changed.

## Final Architecture Review Outcome 05

```json
{"digest":"66db105c9e94ec7fb95e8dd5251ea09b2ba3600e1d0a36df8e3781e56a1d12cc","roles":{"architecture-authority":"pass"},"dispositions":{"AUTH-001":"pass","ARCH-001":"pass","ARCH-002":"pass"},"p0p3":0,"deltaFromPriorFreeze":"four current record paths only"}
```

The fresh affected reviewer proved every runtime, code, and authority-pattern
blob equals the previously passed freeze. The live state and fleet row agree;
the complete candidate has zero unresolved P0-P3 and may enter exact staging.

## Successor Exact Candidate Set

The successor review authority is the complete sorted 99-path set below plus
its external mode/blob manifest. Deleted paths receive zero-mode rows. This
list, not the historical planned or initial-review set, controls review and
later exact staging.

```text
.habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ambient_rng_in_authored_generation/support.pattern.md
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md
.habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/rule.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/baseline.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-rule-diagnostics-resource-01.md
tools/habitat/package.json
tools/habitat/scripts/execution-surface-map.ts
tools/habitat/src/providers/grit/apply-dry-run.ts
tools/habitat/src/providers/grit/check.ts
tools/habitat/src/providers/grit/constants.ts
tools/habitat/src/providers/grit/diagnostics.ts
tools/habitat/src/providers/grit/env.ts
tools/habitat/src/providers/grit/failure.ts
tools/habitat/src/providers/grit/index.ts
tools/habitat/src/providers/grit/output.ts
tools/habitat/src/providers/grit/request.ts
tools/habitat/src/providers/grit/resource.ts
tools/habitat/src/providers/grit/runner.ts
tools/habitat/src/providers/grit/scan-roots/index.ts
tools/habitat/src/providers/grit/scoped-config.ts
tools/habitat/src/providers/grit/types.ts
tools/habitat/src/resources/rule-diagnostics/fake.ts
tools/habitat/src/resources/rule-diagnostics/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/command.schema.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/command.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/constants.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/diagnostics.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/env.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/failure.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/identity.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/outcome.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/request.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/runner.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scan-roots/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scoped-config.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/service.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/types.ts
tools/habitat/src/resources/rule-diagnostics/resource.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/runtime/test-layers.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/impl.ts
tools/habitat/src/service/model/check/dto/check.schema.ts
tools/habitat/src/service/model/check/policy/structural/context.policy.ts
tools/habitat/src/service/model/check/policy/structural/diagnostic-execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/execution.policy.ts
tools/habitat/src/service/model/check/policy/structural/index.ts
tools/habitat/src/service/model/check/policy/structural/source-execution.policy.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-catalog.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-command.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-identity.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-outcome.schema.ts
tools/habitat/src/service/model/diagnostics/dto/diagnostic-scan-root.schema.ts
tools/habitat/src/service/model/diagnostics/errors/diagnostic-provider.errors.ts
tools/habitat/src/service/model/diagnostics/index.ts
tools/habitat/src/service/model/diagnostics/policy/rule-runtime/architecture.policy.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/catalog.policy.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/source-check/index.ts
tools/habitat/src/service/model/source-check/policy/source-scope.policy.ts
tools/habitat/src/service/model/source-check/policy/source/index.ts
tools/habitat/src/service/model/source-check/policy/source/module-paths.policy.ts
tools/habitat/src/service/model/source-check/policy/source/source-rules.policy.ts
tools/habitat/src/service/modules/fix/module.ts
tools/habitat/src/service/modules/hook/model/policy/procedure-operations.policy.ts
tools/habitat/src/service/modules/hook/router/pre-push.router.ts
tools/habitat/test/lib/check-baseline-provider-boundary.test.ts
tools/habitat/test/lib/check-summaries.test.ts
tools/habitat/test/lib/config.test.ts
tools/habitat/test/lib/grit-provider-current-tree-execution.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/hooks.test.ts
tools/habitat/test/lib/pattern-apply.test.ts
tools/habitat/test/lib/rule-diagnostics.test.ts
tools/habitat/test/lib/rule-selection.test.ts
tools/habitat/test/lib/source-rules.test.ts
tools/habitat/test/lib/source-scan-roots.test.ts
tools/habitat/test/lib/structure-check-execution.test.ts
tools/habitat/test/lib/vendor-providers.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/service/check-baseline-manifest-service.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/service/hook-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```
