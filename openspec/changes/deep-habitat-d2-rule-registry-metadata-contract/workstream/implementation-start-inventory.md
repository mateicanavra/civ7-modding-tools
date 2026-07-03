# Implementation Start Inventory: D2 Rule Registry Metadata Contract

## Status

D2 source implementation may start from this branch after this inventory is
committed and validated. This inventory resolves the two explicit D2 source
blockers from the accepted design packet: concrete D0 `surface_id` citations
and D1 malformed-metadata output-family citations.

This inventory also integrates the live `note-to-dra.md` preflight note. D2
registry implementation is TypeBox-first: the canonical registry contract lives
under `tools/habitat-harness/src/rules/`, derives TypeScript types from
standalone TypeBox schemas, validates serialized registry JSON through TypeBox
`Value` or compiled validators, and exposes named projections to consumers.
D2 must not use raw JSON Schema fragments, `Type.Unsafe`, local manual shape
parsers, or raw `JSON.parse(...) as ...` registry authority for ordinary product
schemas.

## Current Source Grounding

Current `tools/habitat-harness/src/rules/rules.json` contains 53 rules and 19
observed rule fields. Current counts:

| Field | Value |
| --- | ---: |
| Total rules | 53 |
| `grit-check` rules | 33 |
| `wrapped-test` rules | 7 |
| `wrapped-script` rules | 3 |
| `habitat-native` rules | 4 |
| `file-layer` rules | 4 |
| `biome` rules | 1 |
| `nx-boundaries` rules | 1 |
| `enforced` rules | 50 |
| `advisory` rules | 3 |

D1 has split the former command-engine responsibilities:

| Current module | D2 relevance |
| --- | --- |
| `tools/habitat-harness/src/lib/rule-selection.ts` | selector logic currently returns selected whole `HarnessRule` rows |
| `tools/habitat-harness/src/lib/check-report.ts` | report construction, staged Grit filtering by `hookScope`, rule execution aggregation |
| `tools/habitat-harness/src/lib/classify.ts` | classify routing currently derives scoped rules from registry rows and prose `scope` |
| `tools/habitat-harness/src/lib/verify-receipt.ts` | D1/D12 receipt boundary; D2 must not touch or redefine verify claims |

## D0 Public-Surface Citations

| D2-touched surface | Required D0 `surface_id` citations | Compatibility stance |
| --- | --- | --- |
| Check command selector surface | `D0-cli-cmd-check`, `D0-cli-cmd-check-flag-json`, `D0-cli-cmd-check-flag-owner`, `D0-cli-cmd-check-flag-rule`, `D0-cli-cmd-check-flag-tool`, `D0-cli-cmd-check-flag-staged` when staged selection is touched | Preserve selector command behavior unless D2 explicitly routes a malformed registry metadata failure through D1. `check --rule` narrows to registered rules only; it does not register candidate patterns. |
| Check JSON output | `D0-command-json-type-checkreport`, `D0-command-json-type-rulereport`, `D0-command-json-type-habitatdiagnostic`, `D0-command-json-cmd-check-json-selector-failure` | D2 may affect registry facts used in `RuleReport`, but CheckReport is not a verify receipt, CI proof, product proof, or arbitrary prose-stability promise. |
| Check human output | `D0-human-output-cmd-check-line-human-report` | Human output remains human-oriented. Any machine parsing must cite command-json rows. |
| Classify command surface | `D0-cli-cmd-classify`, `D0-cli-cmd-classify-arg-path` | D2 supplies routing facts; D4 owns the full classify contract. |
| Classify JSON output | `D0-command-json-type-classifyresult`, `D0-command-json-type-rulerouting`, `D0-command-json-type-classifiedtarget`, `D0-command-json-type-unavailableclassifiedtarget`, `D0-command-json-field-classifiedtarget-source`, `D0-command-json-type-classifydiffresult` if diff classification is touched | `RuleRouting` is the direct D2-facing classify DTO. These rows do not prove rules execute, targets run, or unavailable targets are runnable. |
| Classify DTO exports | `D0-package-export-symbol-classifyresult`, `D0-package-export-symbol-rulerouting`, `D0-package-export-symbol-classifiedtarget`, `D0-package-export-symbol-unavailableclassifiedtarget`, `D0-package-export-symbol-pathclassification`, `D0-package-export-symbol-rulecoveragekind` | Package export existence does not freeze every field as public-stable. D2 must keep command DTO compatibility explicit. |
| Registry package/export surface | `D0-package-export-subpath-root`, `D0-package-export-subpath-rules`, `D0-package-export-file-src-rules-rules-json`, `D0-package-export-subpath-plugin`, `D0-package-export-file-src-plugin-js` | `./rules` and `rules.json` are generated/registry-derived. D2 owns registry authority; it must not treat generated output as hand-editable API. |
| Registry symbols exported from `src/index.ts` | `D0-package-export-symbol-harnessrule`, `D0-package-export-symbol-rules`, `D0-package-export-symbol-rulebyid`, `D0-package-export-symbol-executerule` | Preserve or facade these D2-owned compatibility rows until a packet-approved versioning/deprecation path changes them. None authorizes whole-row leakage internally after projections exist. |
| Pattern Authority registry relations | `D0-package-export-symbol-patternauthoritymanifest`, `D0-package-export-symbol-candidatepatternauthoritymanifest`, `D0-package-export-symbol-registeredpatternauthoritymanifest`, `D0-package-export-symbol-patternauthorityrulereference`, `D0-package-export-symbol-patternauthoritymanifestschemaversion`, `D0-package-export-symbol-validatepatternauthoritymanifest` plus adjacent validation issue/result/options rows if touched | D8 owns Pattern Authority schema and admission. D2 cites these only for registry relationship fields. |
| Nx inferred harness and owner targets | `D0-nx-target-target-boundaries`, `D0-nx-target-target-biome-format`, `D0-nx-target-target-biome-check`, `D0-nx-target-target-biome-ci`, `D0-nx-target-target-grit-check`, `D0-nx-target-target-generated-check`, `D0-nx-target-target-habitat-check-all`, `D0-nx-target-target-tools-habitat-harness-habitat-check`, `D0-nx-target-target-mods-mod-swooper-maps-habitat-check`, `D0-nx-target-target-packages-mapgen-core-habitat-check`, `D0-nx-target-target-packages-civ7-control-orpc-habitat-check`, `D0-nx-target-target-packages-sdk-habitat-check` | Target visibility does not prove target success. D2 must remove independent graph metadata authority only through `ruleGraphFacts`. |
| Per-rule `habitat:rule:*` targets | Every `D0-nx-target-target-habitat-rule-*` row, including refused rows such as `D0-nx-target-target-habitat-rule-arch-test-intelligence-bridge-bundle-runtime-imports` | Cite specific rows when a single rule target is touched; cite the family only for global target-generation changes. Candidate patterns are not registered rules. |
| Pattern generator registry writes/refusals | `D0-generator-generator-pattern-name`, `D0-generator-generator-pattern-schema`, `D0-generator-generator-pattern-factory`, `D0-generator-generator-pattern-refusal`, `D0-package-export-file-generators-json`, `D0-package-export-file-src-generators` when package/generator files are touched | Candidate output is not a registered rule, baseline, hook scope, or proof. Registered promotion remains D8/D13-gated. |
| Hooks and local feedback | `D0-cli-cmd-hook`, `D0-cli-cmd-hook-arg-name`, `D0-cli-cmd-hook-flag-base`, `D0-cli-cmd-check-flag-staged`, `D0-hook-hook-pre-commit`, `D0-hook-hook-pre-push`, `D0-hook-hook-unknown-refusal`, `D0-hook-hook-pre-commit-line-local-feedback-ci-authority`, `D0-hook-hook-pre-commit-line-pass`, `D0-hook-hook-pre-push-line-local-feedback-ci-authority`, `D0-hook-hook-pre-push-line-affected-base`, `D0-human-output-cmd-hook-line-local-feedback-authority` | D2 may cite only eligibility metadata. Hook pass is local feedback, not CI, packet closure, product approval, or Graphite readiness. |
| Hook refusal and stale docs guardrails | `D0-cli-cmd-hook-flag-dry-run-refused`, `D0-human-output-cmd-hook-line-unknown-hook-refusal`, `D0-human-output-cmd-hook-line-partial-staging-refusal`, `D0-docs-example-doc-phase2-d11-local-feedback-hook-dry-run-refused` | D2 must not assume `habitat hook --dry-run` exists. |
| D2-adjacent docs examples | `D0-docs-example-doc-agents-tooling-defaults-classify-before-editing-example`, `D0-docs-example-doc-agents-tooling-defaults-pattern-generator-example`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-classify-a-path-before-editing-path-classify-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-classify-a-diff-or-patch-patch-classify-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-the-full-habitat-rule-pack-root-check-command`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-draft-a-new-grit-rule-candidate-pattern-generator-example`, `D0-docs-example-doc-tools-habitat-harness-docs-scenarios-run-local-hooks-hook-command-examples`, `D0-docs-example-doc-tools-habitat-harness-docs-capabilities-command-surface-root-usage-table`, `D0-docs-example-doc-tools-habitat-harness-docs-capabilities-hooks-husky-delegation-examples`, `D0-docs-example-doc-tools-habitat-harness-docs-implemented-surface-cli-and-entrypoints-command-list` | Docs rows are document-only. Use non-doc rows for source/API claims. |

## D1 Malformed-Metadata Output Families

| D2 malformed metadata family | D1 family to use | D1 citation |
| --- | --- | --- |
| Selector identity failures: missing/duplicate/non-string `id`, unknown owner/project/tool, wrong selector namespace | `CheckReport` / selector failure diagnostic in JSON mode; explicit refusal in human mode | D1 spec `Check Reports Remain Check Output` scenarios `Invalid selector in JSON mode` and `Contradictory check report`; D1 spec `Refusals And Recovery Instructions Are Explicit`; D1 design execution inventory rows `CheckReport`, `validateCheckReport`, `RuleReport`, `HabitatDiagnostic` |
| Routing metadata failures: missing/contradicted `PathCoverage`, prose `scope` used as authority | classify/check diagnostic or refusal before route claim | D1 design `Contract Family Decisions` sections `Check Report`, `Diagnostics`, `Refusal And Recovery`; D1 spec `Diagnostics Remain Findings Inside Owning Reports` and `Refusals And Recovery Instructions Are Explicit` |
| Graph metadata failures: missing target reference, unknown owner/root, colon-string graph authority | command outcome or check diagnostic before target claim | D1 design execution inventory rows `CheckReport`, `RuleReport`, `HabitatDiagnostic`, `ClassifiedTarget.proof`; D1 `Contract Family Decisions` `Check Report`, `Diagnostics`, `Refusal And Recovery` |
| Baseline relation failures: malformed `exceptionPath`, missing/contradicted introduction relation | check report diagnostic through D5 baseline contract | D1 spec `Diagnostics Remain Findings Inside Owning Reports`, scenario `Baseline contract failure`; D1 design rows `CheckReport`, `RuleReport`, `HabitatDiagnostic` |
| Grit metadata failures: missing `gritPattern`, id fallback, invalid scan/hook metadata | command outcome/refusal or diagnostic before Grit execution; hook-local failures use `HookTrace` | D1 spec `Check Reports Remain Check Output`, `Hook Traces Are Local Feedback Only`, `Refusals And Recovery Instructions Are Explicit`; D1 design rows `CheckReport`, `RuleReport`, `HabitatDiagnostic`, hook trace/local feedback rows |
| Generated-zone/file-layer metadata failures: unknown `generatedZone`, neither/both zone and forbidden-file policy | D1 refusal record or diagnostic before silent pass/execution; hook path uses local-feedback trace | D1 design `Contract Family Decisions` `Refusal And Recovery`; D1 spec `Refusals And Recovery Instructions Are Explicit`; D1 spec `Hook Traces Are Local Feedback Only` for staged/local feedback |
| Governance / Pattern Authority metadata failures: missing/contradicted manifest relation | downstream-owned D8/D13 refusal/failure constrained by D1; no proof/evidence artifact | D1 design Pattern Authority compatibility rows; D1 spec `Refusals And Recovery Instructions Are Explicit` and `Legacy Public DTOs Use Explicit Compatibility Handling` if proof-shaped names are touched |
| Local-feedback eligibility failures: invalid `hookScope`, hook-eligible non-Grit row, contradicted staged scope | `HookTrace` / local-feedback trace with `local-feedback-only`, or explicit refusal | D1 design `HookTrace`, hook local-feedback notice, pre-commit/pre-push feedback rows; D1 spec `Hook Traces Are Local Feedback Only` and `Refusals And Recovery Instructions Are Explicit` |

Most D2 malformed registry failures cite the D1 `CheckReport` /
`RuleReport` / `HabitatDiagnostic` family. Use D1 refusal semantics when the
failure is unsupported, unsafe, ambiguous, or would otherwise silently skip
execution. Use `HookTrace` only when malformed metadata is surfaced through
local feedback or staged hook execution.

## Source Implementation Boundary

D2 implementation starts with these product constraints:

- Create the canonical registry owner under `tools/habitat-harness/src/rules/`.
- Define `RuleRegistryDocumentV1` as standalone TypeBox schemas plus derived
  `Static` types.
- Validate registry JSON with TypeBox `Value` or compiled validators at the
  serialized registry boundary.
- Expose consumer-specific projections: selector, report, execution, routing,
  graph, baseline, Grit, generated-zone, governance, and local-feedback facts.
- Keep existing D0-cited package exports as compatibility facades until D2
  explicitly migrates or versions them.
- Remove local fallback inference after projections cover the same facts.
- Do not pass whole raw registry rows across consumer boundaries once a named
  projection exists.
- Do not use raw JSON Schema fragments, `Type.Unsafe`, schema-walking, or
  ad hoc `JSON.parse(...) as ...` registry authority for ordinary Habitat
  product schemas.

## Immediate Source Slices

1. Introduce TypeBox registry schema/parser and compatibility facade.
2. Add parser/projection tests for all 53 current rules plus malformed fixtures.
3. Migrate selector/report consumers to projections.
4. Migrate classify routing away from prose `scope`.
5. Migrate plugin graph facts and remove owner-root / colon-string authority.
6. Migrate baseline, Grit, injected-probe, generated-zone, Pattern Authority,
   hook, and generator consumers one projection at a time.

Source implementation is not complete until the fallback paths named in D2
tasks are deleted or explicitly retained as D0-cited compatibility facades.
