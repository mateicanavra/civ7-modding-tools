# G.2 Generic Fix Admission

```json
{"stage":"2","unit":"G.2","base":"ede4871594fa8ea2203b138adba5f3eb3bf4c7b5","state":"sealed-local-graphite-layer","owner":"takeover DRA","mutationLease":null,"candidatePaths":101}
```

## Outcome

`habitat fix --dry-run` plans only transformations explicitly admitted by
registered rule authority. It accepts no, one, or many rule ids, validates the
whole demand before execution, and observes every admitted rule without
writing. `habitat fix` without `--dry-run` refuses before service or provider
realization.

This slice deletes the hardcoded rule-id table, the duplicate Pattern
Governance/transaction ontology, and every speculative live-write state. It
does not implement mutation, rollback, formatting, gates, provider selection,
or a general fix framework.

## Authority Model

A Grit rule admits fix planning only through this atomic runner record:

```ts
fix: {
  kind: "plan-only";
  pattern: string;
}
```

The closed TypeBox shape binds the admission decision and normalized pattern
asset together. `diagnosticAcquisition` remains diagnostic observation policy
and never grants fix admission. Diagnostic facts omit `fix`; the immutable
catalog publishes a separate `RuleFixFacts` projection.

The existing `runner.files.applyPattern` role is removed rather than retained
as a second, asset-presence admission route.

## Runtime Model

- `RuleFixPlanning` is the stable no-write capability.
- Its demand contains an optional nonempty rule-id tuple. Omission means every
  admitted rule in catalog order; explicit ids are first-seen unique.
- Unknown or registered-but-unadmitted ids refuse the complete explicit
  demand before provider execution.
- The Grit implementation reuses the sealed root planner, scoped catalog and
  user config, pinned native command, closed JSONL parser, and terminal result
  model. It substitutes only the explicitly admitted fix pattern.
- Each admitted rule runs in demand order. Findings are a successful
  observation with truthful affected paths; provider failure or scope refusal
  controls failure exit.
- Provider analysis failures block only when their absolute in-repository path
  is covered by the rule. Ambiguous, escaped, non-exact, and covered paths fail
  closed; broad scan-root parser gaps outside exact authority do not.
- The public oRPC result remains the existing human-oriented
  `{ exitCode, stdout, stderr }`; no receipt schema is added.

The docs-portability apply diagnostic remains unadmitted: the pinned Markdown
parser cannot establish a complete observation over its governed docs corpus.
The runtime-helper transformation is admitted and passes the live public
planning path.

## Deletions

- `tools/habitat/src/service/modules/fix/model/**`
- `fix.applyPatterns` and every live-write/worktree/path-decision type
- `HabitatServiceDeps.gritApplyDryRun` and the raw Grit apply constructor
- hardcoded apply admissions, transaction refs, duplicate transaction inputs,
  and rule-specific output choices
- test-only Pattern Governance validation/view state and its three preserving
  suites

Candidate generation remains candidate-only. Active rules are admitted by
their registered `rule.json`, not by the deleted parallel manifest lifecycle.

## Historical Initial Authorized Set

This was the bounded family set authorized before implementation and is retained
as historical scope evidence. Root owns this packet, live records, ADR
integration, final finding disposition, Git, and Graphite.

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/{rule.json,apply.pattern.md}
.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/rule.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/{pattern.md,rule.json}
tools/habitat/package.json
tools/habitat/src/cli/commands/fix.ts
tools/habitat/src/generators/scaffold/model/pattern.ts
tools/habitat/src/nx-plugin.ts
tools/habitat/src/resources/authority-paths.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/{fix-planning.ts,index.ts,provider.ts}
tools/habitat/src/resources/rule-fix-planning/{index.ts,resource.ts}
tools/habitat/src/runtime/{layers.ts,service-context.ts}
tools/habitat/src/service/base.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/{authority-paths.policy.ts,catalog.policy.ts,facts.policy.ts}
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/{contract.ts,module.ts,router.ts,model/**}
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/generators/pattern-generator.test.ts
tools/habitat/test/lib/{pattern-apply.test.ts,rule-diagnostics.test.ts,rule-fix-planning.test.ts}
tools/habitat/test/rules/{pattern-manifest.test.ts,pattern-views.test.ts,registry/**}
tools/habitat/test/service/{fix-service.test.ts,hook-service.test.ts}
tools/habitat/test/support/habitat-service-deps.ts
tools/habitat/{README.md,docs/AUTHORING-NEXT.md,docs/CAPABILITIES.md,docs/DOMAIN-MAPPING.md,docs/GAPS.md,docs/IMPLEMENTED-SURFACE.md,docs/SCENARIOS.md}
```

No OpenSpec history is rewritten to make it look current. The takeover frame,
this packet, adjacent active authority, and the new durable ADR own the
superseding G.2 decision.

## Proof

1. Registry laws: `fix` is Grit-only, atomic, normalized, referenced, omitted
   from diagnostic facts, and published once in fix facts.
2. Selection laws: omitted, one, many, duplicate, unknown, unadmitted, and
   mixed demands; invalid explicit demands spawn nothing.
3. Runtime laws: every admitted id has one terminal result; findings succeed;
   provider/scope failures fail; live intent realizes neither service nor Grit.
4. Focused TypeScript/Vitest and both changed Habitat rules.
5. Habitat check, boundaries, build, full test, differential Biome, strict
   OpenSpec, lint, diff hygiene, JSONL uniqueness, and clean process/status
   censuses.
6. Live default and selected multi-rule dry-runs leave the repository bytewise
   unchanged; live intent refuses before provider execution.
7. Freeze one exact candidate and review it with fresh sessions in the
   permanent TypeScript/state-space, architecture/authority, and
   product/runtime/library roles.

## Historical Initial Pre-Freeze Receipt

```json
{
  "candidate": { "paths": 73, "tracked": 68, "untracked": 5, "deleted": 23, "staged": 0 },
  "tests": { "focused": 118, "full": 394, "openspec": 371 },
  "static": { "typecheck": "pass", "boundaries": "pass", "build": "pass", "lint": "pass", "diffCheck": "pass" },
  "habitatCheck": {
    "rules": 122,
    "passing": 114,
    "failing": [
      "prohibit_foundation_duplicate_math_helper_redefinitions",
      "grit-studio-run-launch-source-boundary",
      "grit-studio-run-operation-identity-owner",
      "grit-swooper-run-manifest-generator-boundary",
      "habitat-studio-run-runtime-authority-closure",
      "ensure_docs_checkout_paths_are_portable",
      "validate_boundary_taxonomy_against_workspace_graph",
      "enforce_formatting_and_import_hygiene"
    ]
  },
  "differentialBiome": { "introduced": 0, "headErrors": 31, "currentErrors": 28, "headInfos": 15, "currentInfos": 12, "headDigest": "c7fcc6a2e353c5f95446b11cb584014bed7f8401d2acaa4fa3f41aae7549eb30", "currentDigest": "69101db12bff847bccebf700f108b65c46c9cfc5fcfc2a9ef0b1c2c2a4ff3705" },
  "executionSurface": { "surfaces": 591, "ruleJson": 123, "deterministicDigest": "75c9bd6c8bf90a1f1698c4a6a2a640191e7a80b9e9c5e25642cc66e9be83e95e" },
  "live": { "default": "pass", "selected": "pass", "duplicateRunsOnce": "pass", "atomicRefusals": "pass", "liveMutationRefusal": "pass", "noWriteDigest": "b9db9b68428b4bb1b3a5d7ebdfb505d5c8a7e32d367fa206f84fb3d7c211454f" }
}
```

## Stop Conditions

Stop if implementation infers admission from diagnostic acquisition, file
presence, remediation prose, or a rule id; reloads the registry; adds a live
write-capable type; exposes Grit through the stable resource; adds a provider
selector or compiler verifier; or carries A.2/product work into this layer.

## Exact Review 01

```json
{"digest":"38d174b0a2e13412bb2856163b975df0338cdef9ec586c52631134dc9997831e","roles":{"typescript-state-space":"changes-requested","architecture-authority":"changes-requested","product-runtime-library":"changes-requested"},"accepted":["G2-TS-001","G2-RUNTIME-001","G2-RUNTIME-002","G2-AUTH-001","G2-AUTH-002"],"repair":"canonical cross-volume path truth; installed picomatch coverage; exact finding scope; sole fix projection; delete obsolete registered pattern-manifest lifecycle","physicalPlacement":"pass"}
```

## Historical First Successor Repair Proof

```json
{"candidate":{"paths":83,"tracked":77,"untracked":6,"deleted":23,"staged":0},"repairs":["shared lexical/canonical cross-volume containment","canonical AnalysisLog paths with complete picomatch coverage","exact admitted coverage for observed findings","one deeply frozen RuleFixFacts projection","deleted registered Pattern Governance lifecycle"],"tests":{"focused":{"passed":111,"skippedWindows":2},"full":{"passed":397,"skippedWindows":2},"openspec":371},"static":{"typecheck":"pass","boundaries":"pass","build":"pass","lint":"pass","diffCheck":"pass"},"differentialBiome":{"introduced":0,"headErrors":31,"currentErrors":28,"headInfos":15,"currentInfos":12,"currentDigest":"d72779012ccbc35e445d9b3316c1c7d881d2854c09d97fddf3d205a22367a58c"},"habitatCheck":{"rules":122,"passing":114,"failing":"same eight classified exterior rows as initial receipt"},"executionSurface":{"surfaces":592,"ruleJson":123,"jsonDigest":"733f3a8e97b21b425fc55b41c86c3e16e654806370617a02f3467c241fa2baa7"},"live":{"matrix":"pass","noWriteDigest":"0ce34640fa9f41835c6696dc6a08621550153260e34fa2365863bcffef56330a"},"judgment":{"operationKinds":"retain distinct check/fix/generate/migrate mutability classes; runner.fix remains plan admission, not duplicate operation authority"},"reviewCohort":["g2_successor_ts_review_02","g2_successor_arch_review_02","g2_successor_product_review_02"]}
```

## Historical First Successor Exact Candidate Set

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json
.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/scaffold-pattern.schema.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-generic-fix-admission-01.md
docs/system/ADR.md
tools/habitat/README.md
tools/habitat/docs/AUTHORING-NEXT.md
tools/habitat/docs/CAPABILITIES.md
tools/habitat/docs/DOMAIN-MAPPING.md
tools/habitat/docs/GAPS.md
tools/habitat/docs/IMPLEMENTED-SURFACE.md
tools/habitat/docs/SCENARIOS.md
tools/habitat/generators.json
tools/habitat/src/cli/commands/fix.ts
tools/habitat/src/generators/scaffold/model/pattern.ts
tools/habitat/src/generators/scaffold/model/schema.ts
tools/habitat/src/generators/scaffold/pattern/support/schema.ts
tools/habitat/src/nx-plugin.ts
tools/habitat/src/resources/authority-paths.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-planning.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/path.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scan-roots/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scoped-config.ts
tools/habitat/src/resources/rule-fix-planning/index.ts
tools/habitat/src/resources/rule-fix-planning/resource.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/authority-paths.policy.ts
tools/habitat/src/service/model/rules/policy/catalog.policy.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/rules/policy/path-coverage.policy.ts
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/contract.ts
tools/habitat/src/service/modules/fix/model/dto/index.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply-record.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply-request.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-management.schema.ts
tools/habitat/src/service/modules/fix/model/dto/shared.schema.ts
tools/habitat/src/service/modules/fix/model/dto/transaction-input.schema.ts
tools/habitat/src/service/modules/fix/model/dto/transaction-refusal.schema.ts
tools/habitat/src/service/modules/fix/model/policy/index.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-admission.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-admissions.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-render.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-authority-paths.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-refusal.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-rule-reference.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-state.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-validation.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-view.policy.ts
tools/habitat/src/service/modules/fix/model/policy/transaction-input.policy.ts
tools/habitat/src/service/modules/fix/module.ts
tools/habitat/src/service/modules/fix/router.ts
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/generators/pattern-generator.test.ts
tools/habitat/test/lib/classify.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/pattern-apply.test.ts
tools/habitat/test/lib/rule-fix-planning.test.ts
tools/habitat/test/rules/pattern-manifest.test.ts
tools/habitat/test/rules/pattern-views.test.ts
tools/habitat/test/rules/registry/contract.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/rules/registry/manifest-contract.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```

## Successor Exact Review 02

```json
{"digest":"62ad709cdf8a2046fafc1eee251a753e2ba7ba0215b4462dc51f72c1d8dc09ba","roles":{"typescript-state-space":"pass","architecture-authority":"pass","product-runtime-library":"changes-requested"},"accepted":["G2-RUNTIME-001","G2-DOCS-001"],"repair":"resolve an existing CreateFile leaf before parent reconstruction; mechanically archive the byte-identical superseded pattern-generator metadata change with no spec merge"}
```

## Second Successor Repair Proof

```json
{"candidate":{"paths":101,"tracked":86,"untracked":15,"deleted":32,"staged":0},"repairs":["existing CreateFile leaves use final-component realPath","broken or ambiguous leaves fail closed","parent-plus-basename is admitted only after leaf absence","superseded completed OpenSpec change archived byte-identically with --skip-specs"],"tests":{"focused":{"passed":107,"skippedWindows":2},"full":{"passed":397,"skippedWindows":2},"openspec":370},"static":{"typecheck":"pass","boundaries":"pass","build":"pass","lint":"pass","diffCheck":"pass"},"habitatCheck":{"rules":122,"passing":114,"failing":"same eight classified exterior rows"},"authority":{"threeGoverningRules":"pass","archivedFiles":9,"archivedBytes":"identical","activeObsoleteChange":false},"executionSurface":{"surfaces":592,"ruleJson":123,"jsonDigest":"733f3a8e97b21b425fc55b41c86c3e16e654806370617a02f3467c241fa2baa7"},"biome":{"priorSuccessorIntroduced":0,"repairTouchedFiles":"2 existing errors and 8 infos; no formatter or import fix"},"live":{"matrix":"pass","noWriteDigest":"16ca186fe97c0cf53d5cc2ccc9998b5b921bc2fe18f8524bcf26ee222e00292c"},"reviewCohort":["g2_final_ts_review_03","g2_final_arch_review_03","g2_final_product_review_03"]}
```

## Final Affected Review 03

```json
{"digest":"e687107ca3307e4a240826979303f75068cecc559da0b048e5dfccbc6d2fd9cf","roles":{"typescript-state-space":"pass","architecture-authority":"changes-requested","product-runtime-library":"pass"},"accepted":["G2-ARCH-001"],"repair":"remove the archived OpenSpec id default; keep candidate ownership optional and explicit"}
```

## Third Successor Repair Proof

```json
{"candidate":{"paths":101,"tracked":86,"untracked":15,"deleted":32,"staged":0},"repair":{"paths":5,"defaultRemoved":true,"omittedOwnerSerialized":false,"explicitOwnerRoundTrips":true,"activeArchivedIdReferences":0},"tests":{"generator":11,"typecheck":"pass","biome":"clean","diffCheck":"pass"},"schema":{"regeneratedTwice":true,"digest":"730683bc248d57204d90642e5e63393688b57ed1bfb77073c0bcd36499b70d63"},"reviewCohort":["g2_terminal_ts_review_04","g2_terminal_arch_review_04","g2_terminal_product_review_04"],"pathSet":"unchanged from Second Successor Exact Candidate Set"}
```

## Terminal Exact Review 04

```json
{"digest":"bc4f8bd3e8e3f21e1fa527c8e0b979d6bf1f1eeaac1e05cfb3c6b026787e79d1","roles":{"typescript-state-space":"pass","architecture-authority":"pass","product-runtime-library":"changes-requested"},"accepted":["G2-TERM-RUNTIME-001"],"repair":"prove at the public patternGenerator boundary that obsolete lifecycle and empty or null ownership inputs reject before any tree write"}
```

## Fourth Successor Repair Proof

```json
{"candidate":{"paths":101,"tracked":86,"untracked":15,"deleted":32,"staged":0},"repair":{"paths":1,"boundary":"patternGenerator","invalidInputs":["registered-advisory","registered-enforced","openspecChangeId-empty","openspecChangeId-null"],"treeUnchanged":true,"generatedArtifacts":0},"tests":{"generator":13,"typecheck":"pass","biome":"clean","diffCheck":"pass"},"reviewCohort":["g2_terminal_product_rereview_05"],"pathSet":"unchanged from Second Successor Exact Candidate Set"}
```

## Product Affected Re-review 05

```json
{"digest":"f7ef5b54c12924fa9b370c94293c319f3da165e7da4af6a721db03bc5f01c3eb","roles":{"product-runtime-library":"pass"},"dispositions":{"G2-TERM-RUNTIME-001":"pass"},"p0p3":0,"deltaFromPriorFreeze":"one boundary-test blob plus three current record blobs"}
```

The fresh materially affected reviewer proved all other 97 candidate blobs
equal the terminal three-role freeze and independently passed the 13-test
public-boundary matrix. One final fresh architecture/authority session reviews
only record currentness and authorizes the bounded terminal receipt mutations.

## Final Authority Closeout 06

```json
{"digest":"006a93d69b76d2744537bbe544556505ff79d6e53b6efbfba8a4b0c8bb74e3d3","roles":{"architecture-authority":"pass"},"p0p3":0,"deltaFromPassedProductFreeze":"three current record blobs only","authorizedMutation":"exact 101-path local Graphite seal plus terminal receipt updates in those same three records"}
```

## Seal Receipt

```json
{"branch":"codex/mapgen-runtime-closeout-generic-fix-admission","parent":"ede4871594fa8ea2203b138adba5f3eb3bf4c7b5","initialCreate":"c28b04ec00686d3d642c32face32a57fa0fb9468","paths":101,"preCreateDigest":"ca3d649796fb13aa90872d8b9050dfda8e45c4972218cfa42518fa3d60a3ff0e","preCreateTree":"695595db68c8b729253465df18f33a859330f82a","receiptAmendment":"three terminal record blobs only","remoteMutation":false}
```

Exact staging and the initial Graphite commit matched the 101-path manifest.
Only this terminal receipt, the live ledger, and lease closure were amended
afterward. Final identity is the observed branch ref because a commit cannot
contain its own amended hash.

## Second Successor Exact Candidate Set

```text
.habitat/AUTHORITY-TOOL-SEPARATION.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/apply.pattern.md
.habitat/civ7/mapgen/sdk/core/rules/prohibit_runtime_helper_redeclarations/rule.json
.habitat/habitat/toolkit/_blueprints/generator/generate_generator_schema_contracts/scaffold-pattern.schema.json
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/pattern.md
.habitat/habitat/toolkit/_blueprints/rule-diagnostics/prohibit_rule_diagnostics_provider_imports/rule.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-anatomy.md
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.json
docs/projects/habitat-harness/execution-surface-map/execution-surface-map.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-generic-fix-admission-01.md
docs/system/ADR.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/design.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/proposal.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/specs/habitat-harness/spec.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/tasks.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/workstream/downstream-realignment-ledger.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/workstream/effect-promotion-decision.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/workstream/phase-record.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/workstream/review-disposition-ledger.md
openspec/changes/archive/2026-07-13-habitat-pattern-generator-metadata-repair/workstream/source-synthesis.md
openspec/changes/habitat-pattern-generator-metadata-repair/design.md
openspec/changes/habitat-pattern-generator-metadata-repair/proposal.md
openspec/changes/habitat-pattern-generator-metadata-repair/specs/habitat-harness/spec.md
openspec/changes/habitat-pattern-generator-metadata-repair/tasks.md
openspec/changes/habitat-pattern-generator-metadata-repair/workstream/downstream-realignment-ledger.md
openspec/changes/habitat-pattern-generator-metadata-repair/workstream/effect-promotion-decision.md
openspec/changes/habitat-pattern-generator-metadata-repair/workstream/phase-record.md
openspec/changes/habitat-pattern-generator-metadata-repair/workstream/review-disposition-ledger.md
openspec/changes/habitat-pattern-generator-metadata-repair/workstream/source-synthesis.md
tools/habitat/README.md
tools/habitat/docs/AUTHORING-NEXT.md
tools/habitat/docs/CAPABILITIES.md
tools/habitat/docs/DOMAIN-MAPPING.md
tools/habitat/docs/GAPS.md
tools/habitat/docs/IMPLEMENTED-SURFACE.md
tools/habitat/docs/SCENARIOS.md
tools/habitat/generators.json
tools/habitat/src/cli/commands/fix.ts
tools/habitat/src/generators/scaffold/model/pattern.ts
tools/habitat/src/generators/scaffold/model/schema.ts
tools/habitat/src/generators/scaffold/pattern/support/schema.ts
tools/habitat/src/nx-plugin.ts
tools/habitat/src/resources/authority-paths.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/apply-dry-run.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/check.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/fix-planning.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/output.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/path.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/provider.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scan-roots/index.ts
tools/habitat/src/resources/rule-diagnostics/providers/grit/scoped-config.ts
tools/habitat/src/resources/rule-fix-planning/index.ts
tools/habitat/src/resources/rule-fix-planning/resource.ts
tools/habitat/src/runtime/layers.ts
tools/habitat/src/runtime/service-context.ts
tools/habitat/src/service/base.ts
tools/habitat/src/service/model/rules/dto/registry.schema.ts
tools/habitat/src/service/model/rules/policy/authority-paths.policy.ts
tools/habitat/src/service/model/rules/policy/catalog.policy.ts
tools/habitat/src/service/model/rules/policy/facts.policy.ts
tools/habitat/src/service/model/rules/policy/path-coverage.policy.ts
tools/habitat/src/service/model/rules/repositories/registry.repository.ts
tools/habitat/src/service/modules/fix/contract.ts
tools/habitat/src/service/modules/fix/model/dto/index.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply-record.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply-request.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-apply.schema.ts
tools/habitat/src/service/modules/fix/model/dto/pattern-management.schema.ts
tools/habitat/src/service/modules/fix/model/dto/shared.schema.ts
tools/habitat/src/service/modules/fix/model/dto/transaction-input.schema.ts
tools/habitat/src/service/modules/fix/model/dto/transaction-refusal.schema.ts
tools/habitat/src/service/modules/fix/model/policy/index.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-admission.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-admissions.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-render.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-apply-transaction.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-authority-paths.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-refusal.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-rule-reference.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-state.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-validation.policy.ts
tools/habitat/src/service/modules/fix/model/policy/pattern-view.policy.ts
tools/habitat/src/service/modules/fix/model/policy/transaction-input.policy.ts
tools/habitat/src/service/modules/fix/module.ts
tools/habitat/src/service/modules/fix/router.ts
tools/habitat/test/commands/habitat-commands.test.ts
tools/habitat/test/generators/pattern-generator.test.ts
tools/habitat/test/lib/classify.test.ts
tools/habitat/test/lib/grit-provider.test.ts
tools/habitat/test/lib/pattern-apply.test.ts
tools/habitat/test/lib/rule-fix-planning.test.ts
tools/habitat/test/rules/pattern-manifest.test.ts
tools/habitat/test/rules/pattern-views.test.ts
tools/habitat/test/rules/registry/contract.test.ts
tools/habitat/test/rules/registry/facts.test.ts
tools/habitat/test/rules/registry/manifest-contract.test.ts
tools/habitat/test/service/fix-service.test.ts
tools/habitat/test/support/habitat-service-deps.ts
```
