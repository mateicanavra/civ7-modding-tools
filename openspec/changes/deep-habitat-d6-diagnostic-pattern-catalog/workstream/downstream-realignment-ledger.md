# Downstream Realignment Ledger: D6 Diagnostic Pattern Catalog

## Status

D6 source implementation is complete inside the implementation-start inventory
boundary and is in packet-boundary review. Downstream rows below record the D6
diagnostic contracts each owner may consume after D6 packet approval.

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D0 Command Surface Inventory | satisfied for D6 write set | Concrete D0 rows cover the D6 source surfaces enumerated in `workstream/implementation-start-inventory.md`; add rows before touching any new command JSON, package export, human adapter-failure message, docs/example, fixture, or test-facing surface. |
| D1 Receipt Contract Boundary | satisfied where touched | D6 uses D1 target command-outcome and limitation vocabulary for command outcomes, limitations, refusals, and adapter artifacts. Future command outcome changes must cite D1 decisions. |
| D2 Rule Registry Metadata Contract | satisfied for D6 write set | D6 source consumes accepted D2 `ruleGritFacts` for `ruleId`, `patternIdentity`, and scan metadata; local-feedback and governance facts remain separate D2 projections with downstream owners. |
| D5 Baseline Authority | protected owner | D6 normalized diagnostics may carry baseline-owned fields only as D5-owned projections. D6 must not decide baseline growth, shrink, debt acceptance, or baseline application. |
| D7 Structural Enforcement Pipeline | downstream consumer | D7 consumes D6 `DiagnosticRunOutcome` and normalized diagnostic projections to assemble final `CheckReport`/enforcement reports. D7 should preserve D6's split source JSON/docs text diagnostic outcome families and must not infer Pattern Governance admission, baseline authority, or apply safety from D6. |
| D8 Pattern Governance | downstream consumer | D8 consumes D6 diagnostic capability, native diagnostic catalog entries, native Grit fixture result references, injected probe outcomes, and limitations. D8 owns candidate/registered/admitted/refused/retired lifecycle and any hook/apply governance decision. |
| D9 Transformation Transaction | downstream consumer with hard non-inference | D9 may consume diagnostic identity and limitations as context. D9 must establish dry-run, live-write, rollback, formatter, dirty-worktree, changed-path, and apply-safety states through its own packet. |
| D11 Local Feedback | later consumer | D11 may consume D6 staged diagnostic projections after D11 defines hook sequencing and local feedback language. D6 does not own staged-file behavior or hook orchestration. |
| D13 Scaffolding And Refusal Contracts | reference-only downstream | D13 may reference D6 diagnostic capability surfaces when generating or refusing supported pattern outputs. D13 owns generator/manifest creation and supported project-shape refusal contracts. |
| D15 Execution Provenance Trigger | dormant unless triggered | D15 remains dormant unless D6 records an exact state that D6-local DTOs cannot represent without changing shared command-process public semantics. Shared command-observation substrate migration is not a D6 default. |
| Native Grit pattern corpus | vendor-owned input | Native `grit patterns test` results prove fixture/corpus behavior only. They do not prove current-tree Habitat diagnostics, Pattern Governance admission, baseline authority, hook scope, or apply safety. |
| Packet index | closure update after packet approval | Do not advance D7 until D6 packet-boundary review accepts the source implementation and any required index update is made. |
| Habitat docs/examples | no extra public guidance change in D6 | Update only when public guidance changes or future source implementation changes durable command/output behavior. |
