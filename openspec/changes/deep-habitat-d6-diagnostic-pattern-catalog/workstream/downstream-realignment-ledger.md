# Downstream Realignment Ledger: D6 Diagnostic Pattern Catalog

## Status

D6 is accepted for design/specification after final after-observed-identity
rereview. Downstream rows below record the D6 design/specification contract each
owner may consume. They do not authorize D6 source implementation.

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D0 Command Surface Inventory | source-blocking prerequisite | Add concrete D0 rows before D6 source implementation touches command JSON, package exports, human adapter-failure messages, docs/examples, test-facing exports, injected-probe fields, or retained compatibility names. |
| D1 Receipt Contract Boundary | source-blocking prerequisite where touched | D6 may use D1 target command-outcome and limitation vocabulary in design. Source changes that alter command outcome families, limitations, retained verification-artifact-shaped compatibility fields, or adapter artifacts must cite D1 decisions. |
| D2 Rule Registry Metadata Contract | source-blocking prerequisite | D6 design consumes accepted D2 `ruleGritFacts`. Source implementation must wait for live projections covering `ruleId`, `patternIdentity`, scan metadata, exclusions, hook eligibility where relevant, and malformed Grit facet output families. |
| D5 Baseline Authority | protected owner | D6 normalized diagnostics may carry baseline-owned fields only as D5-owned projections. D6 must not decide baseline growth, shrink, debt acceptance, or baseline application. |
| D7 Structural Enforcement Pipeline | downstream consumer | D7 consumes D6 `DiagnosticRunOutcome` and normalized diagnostic projections to assemble final `CheckReport`/enforcement reports. D7 must not infer Pattern Governance admission, baseline authority, or apply safety from D6. |
| D8 Pattern Governance | downstream consumer | D8 consumes D6 diagnostic capability, native Grit fixture result references, injected probe outcomes, and limitations. D8 owns candidate/registered/admitted/refused/retired lifecycle and any hook/apply governance decision. |
| D9 Transformation Transaction | downstream consumer with hard non-inference | D9 may consume diagnostic identity and limitations as context. D9 must establish dry-run, live-write, rollback, formatter, dirty-worktree, changed-path, and apply-safety states through its own packet. |
| D11 Local Feedback | later consumer | D11 may consume D6 staged diagnostic projections after D11 defines hook sequencing and local feedback language. D6 does not own staged-file behavior or hook orchestration. |
| D13 Scaffolding And Refusal Contracts | reference-only downstream | D13 may reference D6 diagnostic capability surfaces when generating or refusing supported pattern outputs. D13 owns generator/manifest creation and supported project-shape refusal contracts. |
| D15 Execution Provenance Trigger | dormant unless triggered | D15 remains dormant unless D6 records an exact state that D6-local DTOs cannot represent without changing shared command-process public semantics. Shared command-observation substrate migration is not a D6 default. |
| Native Grit pattern corpus | vendor-owned input | Native `grit patterns test` results prove fixture/corpus behavior only. They do not prove current-tree Habitat diagnostics, Pattern Governance admission, baseline authority, hook scope, or apply safety. |
| Packet index | accepted design/specification status recorded | Keep D6 marked accepted for design/specification only, not implementation-complete, with D0/D1/D2 source blockers preserved. |
| Habitat docs/examples | deferred to implementation facts | Update only when public guidance changes or D6 source implementation changes durable command/output behavior. |
