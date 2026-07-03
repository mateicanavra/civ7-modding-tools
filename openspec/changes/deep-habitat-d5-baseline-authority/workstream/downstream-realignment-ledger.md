# Downstream Realignment Ledger: D5 Baseline Authority

| Downstream Surface | Disposition | Required Action |
| --- | --- | --- |
| D0 compatibility matrix | implementation-start prerequisite satisfied | D5 source edits cite concrete D0 rows for baseline JSON files, including `D0-durable-data-baselines-json-array`, baseline-related `habitat check` JSON/human output, exported baseline types/functions, `--expand-baseline`, Pattern Authority baseline contract surfaces if touched, docs/examples, and generated/help surfaces if affected. Future newly touched surfaces still require a D0 row before edit. |
| D2 `ruleBaselineFacts` and `ruleSelectorFacts` | live source prerequisite satisfied | D5 consumes live `RuleBaselineFactsSchema`, `ruleBaselineFacts`, `activeRuleBaselineFacts`, `RuleSelectorFactsSchema`, `ruleSelectorFacts`, and `activeRuleSelectorFacts`. D5 must not parse whole registry rows, prose `exceptionPath`, or file presence as target authority. |
| D7 Structural Enforcement Pipeline | D5 defines consumer inputs; D7 remains its own packet | D7 may rely on D5 `BaselineApplicationResult` and `BaselineIntegrityResult`: accepted authority state, baseline refusal, matched baseline entries, external projection equality, uncovered diagnostics, integrity refusals, and expansion decisions. D7 owns rule selection, rule execution, report construction, status aggregation, rendering, and enforcement non-claims. |
| D8 Pattern Governance | D5 defines consumer projection; D8 remains its own packet | D8 may rely on the D5-published baseline authority projection/refusal result: explicit-empty, explicit-debt, external-exception, baseline refusal, baseline path/source, rule-introduction manifest decision, external projection state, and shrink-only refusal. D8 owns lifecycle/admission, fixture sufficiency, false-positive model, hook-scope decision, apply-safety decision, and registration approval. |
| D13 Scaffolding And Refusal Contracts | protected except consumer compatibility; residual owner | D13 may later consume D5 projection/refusal facts for generator/scaffolding behavior. D5 does not implement scaffolding lifecycle, generator refusal redesign, or the current pattern-generator CJS/TS loader repair. |
| Tests and fixtures | implementation gate mostly satisfied; D13 residual recorded | Focused D5 baseline unit tests, command adapter tests, D5 fixture/injection cases, and Pattern Authority Manifest consumer tests pass. Pattern generator compatibility is blocked before D5 projections execute by D13's generator loader boundary. |
| Docs/examples | D0-gated downstream record | Update docs/examples only after source behavior exists and D0 docs/example rows allow the change. D5 design may name target language now; durable public guidance waits for implementation facts. |
| Packet index/status | implementation-start in progress | D5 row remains not implementation-complete until source, validation, review, Graphite submit, and packet-boundary closure are complete. |

## Downstream Non-Claims

- D5 does not accept D7 or D8.
- D5 does not make baseline file presence a Pattern Governance admission rule.
- D5 does not let Structural Enforcement recompute baseline authority locally.
- D5 does not authorize live baseline JSON edits unless a later implementation
  task names a fixture/current-tree reason and passes D0/source gates.
- D5 does not convert Habitat generators from CJS to TypeScript; D13 owns that
  generator architecture repair.
