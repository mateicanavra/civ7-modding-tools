# D6 Implementation-Start Inventory

Status: source implementation prerequisite artifact for `deep-habitat-d6-diagnostic-pattern-catalog`.

This inventory is the D6 source gate. Source work may begin only for surfaces
with concrete D0 rows, D1 output-family/non-claim citations where the surface is
reported, and live D2 projection citations where D6
consumes registry facts.

## Gate Result

| Gate | Result | Citation |
| --- | --- | --- |
| D0 rows for D6 public/durable surfaces | Complete for the rows listed below. | `docs/projects/habitat-harness/public-surface-compatibility-matrix.md` now has 362 rows, including D6 durable rows. |
| D1 output-family decisions | Complete for check reports, diagnostics, command observations, and refusals. | `openspec/changes/deep-habitat-d1-receipt-contract-boundary/design.md`; `specs/habitat-harness/spec.md`. |
| D2 registry projections | Complete, with the important caveat that D2 splits facts by consumer. | `RuleGritFacts` owns identity/scan execution facts; `RuleLocalFeedbackFacts` owns local-feedback eligibility; `RuleGovernanceFacts` owns manifest references. |
| D15 trigger status | Dormant. | D6 has no proven local representation contradiction requiring shared execution provenance substrate. |

## Surface Inventory

| D6 surface | D0 row(s) | D1 citation | D2/source citation | D6 source authority |
| --- | --- | --- | --- | --- |
| `habitat check --tool grit-check --json` and selected `--rule` JSON cases | `D0-cli-cmd-check`, `D0-cli-cmd-check-flag-json`, `D0-cli-cmd-check-flag-rule`, `D0-cli-cmd-check-flag-tool`, `D0-command-json-type-checkreport`, `D0-command-json-type-rulereport`, `D0-command-json-type-habitatdiagnostic` | D1 design rows for `CheckReport`, `RuleReport`, and `HabitatDiagnostic`; D1 spec requirements “Check Reports Remain Check Output” and “Diagnostics Remain Findings Inside Owning Reports”. | D2 selector/report/command facts are live through `activeRuleSelectorFacts`, `activeRuleReportFacts`, and `activeRuleCommandExecutionFacts`. | D6 may refine diagnostic acquisition/projection feeding report diagnostics. D6 must not redefine final enforcement status or command receipt semantics. |
| Check diagnostic DTO containment | `D0-command-json-type-habitatdiagnostic`, `D0-package-export-symbol-habitatdiagnostic` | D1 diagnostic containment and non-claim rules: diagnostics are findings inside reports, not receipts/proof. | D2 `ruleGritFacts` provides Grit identity and message/lane inputs for diagnostic projection. | D6 may define diagnostic identity/taxonomy before D7 report assembly. |
| Grit adapter failure package exports | `D0-package-export-symbol-gritadapterfailure`, `D0-package-export-symbol-gritadapterfailuretag`, `D0-package-export-symbol-creategritadapterfailure`, `D0-package-export-symbol-gritadapterfailuretags`, `D0-package-export-symbol-isgritadapterfailuretag`, `D0-package-export-symbol-rendergritadapterfailure` | D1 adapter command capture and bounded failure/non-claim language; D1 does not authorize generic proof artifacts. | Current source: `tools/habitat-harness/src/lib/grit-failures.ts`; D2 registry facts are not failure taxonomy authority. | D6 must split diagnostic adapter failure subset from D9 `GritApply*` transaction states and update consumers to the new diagnostic contract. |
| Native Grit command observation | `D0-package-export-symbol-habitatcommandresult`, `D0-package-export-symbol-habitatprocessrequest`, `D0-package-export-symbol-gritparsestatus`, `D0-package-export-symbol-makehabitatcommandresult` | D1 raw process invocation row: bounded streams, exit code, duration, env projection, truncation/hash metadata; not domain correctness or CI proof. | Current source: `tools/habitat-harness/src/lib/habitat-process.ts`. | D6 may project bounded command observations for diagnostic acquisition. D15 remains dormant unless D6 proves the local model cannot represent required observation states. |
| Injected probe public/test-facing result | `D0-package-export-symbol-injectedgritprobeinput`, `D0-package-export-symbol-injectedgritproberesult`, `D0-package-export-symbol-injectedgritprobefailure`, `D0-package-export-symbol-runinjectedgritprobe` | D1 diagnostic containment rules apply: diagnostics remain report findings, not receipts or proof artifacts. | Current source: `tools/habitat-harness/src/lib/grit-injected-probe.ts`; D2 `activeRuleGritFacts` supplies the selected rule. | D6 must replace proof-shaped probe fields with the target diagnostic/probe outcome language and update callers/tests directly. |
| `rules.json` Grit metadata field contract | `D0-durable-data-rules-json-grit-metadata`, `D0-package-export-file-src-rules-rules-json`, `D0-package-export-subpath-rules` | D1 malformed/unsupported/refusal rule: metadata failures surface as explicit refusals or failed reports, not silent pass or proof. | `RuleGritFactsSchema` picks `id`, `lane`, `message`, `gritPattern`, `scanRoots`, `expandIgnoredTestDirectories`; `activeRuleGritFacts` is live in `src/rules/facts.ts`. | D6 must consume D2 projections, not raw `HarnessRule`/whole registry rows and not alternate `ruleId` identity lookup. |
| Hook/local-feedback eligibility near Grit diagnostics | `D0-durable-data-rules-json-grit-metadata`, hook rows only when D11 consumes later | D1 hook traces are local feedback only; D6 must not claim hook sequencing. | D2 `RuleLocalFeedbackFactsSchema` and `activeRuleLocalFeedbackFacts` own local-feedback eligibility separately from `ruleGritFacts`. | D6 may avoid hook eligibility entirely except to avoid false claims; D11 owns staged/local feedback behavior. |
| Pattern Authority manifest reference near diagnostics | `D0-durable-data-rules-json-grit-metadata`, D8 manifest rows when D8 consumes later | D1 non-claim: diagnostics/probes do not prove pattern admission. | D2 `RuleGovernanceFactsSchema` and `ruleGovernanceFacts` own optional `manifestPath` relation. | D6 must not import Pattern Authority lifecycle/admission state into diagnostic catalog entries. |
| Registered native Grit check pattern files | `D0-durable-data-grit-check-pattern-files` | D1 diagnostics stay report findings; native pattern pass is not proof/receipt. | D2 registry `gritPattern` maps durable registry identity to native pattern identity. | D6 may parse observed native identities and reject mismatch; D8 owns admission/governance. |
| Native Grit fixture expectations | `D0-durable-data-grit-native-fixtures` | D1 non-claims: fixture pass is not current-tree cleanliness or CI authority. | `test/grit/grit-patterns.test.ts` exercises native Grit behavior. | D6 may use these as native capability validation, not as architecture-structure tests. |
| Cache/freshness observations | `D0-package-export-symbol-habitatcommandresult`, `D0-package-export-symbol-gritparsestatus` | D1 command capture allows bounded metadata and non-claims; cache observation is not proof of rule correctness. | Current source: `HabitatCommandResult.cachePolicy` and Grit adapter request options. | D6 may model `DiagnosticCacheRequirement`/`DiagnosticCacheObservation`, with injected probes requiring fresh observable execution. |

## D2 Projection Disposition

D6 source work must cite the actual live D2 projections rather than broadening
`ruleGritFacts` by assumption:

| Fact family | Live owner | D6 use |
| --- | --- | --- |
| Grit identity and scan execution facts | `RuleGritFactsSchema`, `ruleGritFacts`, `activeRuleGritFacts` | Diagnostic catalog entry, native request, scan-root decision, observed identity matching. |
| Local feedback eligibility | `RuleLocalFeedbackFactsSchema`, `ruleLocalFeedbackFacts`, `activeRuleLocalFeedbackFacts` | Not D6 core; D11 consumes later. D6 may only avoid false claims where staged scenarios are mentioned. |
| Pattern Authority reference | `RuleGovernanceFactsSchema`, `ruleGovernanceFacts` | Not D6 core; D8 consumes later. D6 may record that manifest references are not diagnostic admission authority. |
| Malformed metadata families | D2 TypeBox registry parser and projection tests | D6 must refuse before native Grit execution when required diagnostic identity/scan facts are absent. |

## Source Start Boundary

D6 source implementation is now limited to diagnostic catalog behavior against
the rows above. The following remain forbidden in D6 source:

- publishing a D15 consumer projection;
- treating Pattern Authority manifest presence as D8 admission;
- importing D9 `GritApply*` transaction states into diagnostic adapter failure
  taxonomy;
- turning hook/local-feedback eligibility into D11 sequencing policy;
- preserving proof-shaped probe fields as target language;
- adding structural architecture tests where GritQL, Biome, Nx boundaries, or
  module-boundary enforcement should own the invariant.
