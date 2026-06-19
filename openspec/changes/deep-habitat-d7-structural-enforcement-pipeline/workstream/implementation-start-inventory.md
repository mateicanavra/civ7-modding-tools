# D7 Implementation Start Inventory

## Status

D7 source implementation may begin for the structural check/report pipeline after
this inventory. The allowed source slice is selector/report/render/baseline and
diagnostic-consumption extraction around live D2, D3, D5, and D6 projections.

D7 must not implement generated/protected-zone authority in this layer. D10 comes
later in the Habitat stack, and the current file-layer generated-zone runner may
be preserved only as current behavior until D10 supplies the owning guard and
refusal contract.

## D0 Public Surface Citations

| D7 surface | D0 rows | D7 handling |
| --- | --- | --- |
| `habitat check` command and selector behavior | `D0-cli-cmd-check`, `D0-cli-cmd-check-flag-owner`, `D0-cli-cmd-check-flag-rule`, `D0-cli-cmd-check-flag-tool`, `D0-cli-cmd-check-flag-base` | Preserve command flags and invalid-selector behavior while deriving internal selector outcomes. |
| `habitat check --json` report output | `D0-cli-cmd-check-flag-json`, `D0-command-json-type-checkreport`, `D0-command-json-type-rulereport`, `D0-command-json-type-habitatdiagnostic`, `D0-command-json-cmd-check-json-selector-failure` | Preserve schemaVersion 1 public JSON while constructing it from D7 outcomes. |
| `CheckReport.command` | `D0-command-json-type-checkreport`, `D0-package-export-symbol-createcheckreport` | Preserve serialized command text; internal request state must use Oclif command context rather than manual command semantics. |
| Human rendering | `D0-human-output-cmd-check-line-human-report`, `D0-cli-cmd-check` | Preserve human-output compatibility without making human text a machine contract. |
| Output file write | `D0-cli-cmd-check-flag-output`, `D0-command-json-type-checkreport` | Write the same finalized JSON report that `--json` emits. |
| Staged check behavior | `D0-cli-cmd-check-flag-staged`, `D0-hook-hook-pre-commit` | Replace silent staged filtering with explicit D7 disposition where implemented; do not take over D11 hook sequencing. |
| Baseline expansion flag and baseline files | `D0-cli-cmd-check-flag-expand-baseline`, `D0-package-export-symbol-expandbaselines`, `D0-durable-data-baselines-json-array` | Preserve explicit expansion command behavior; D5 remains baseline authority. |
| Built-in baseline-integrity row | `D0-cli-cmd-check-rule-baseline-integrity-refused`, `D0-command-json-type-rulereport` | Keep `baseline-integrity` as built-in report behavior; do not make `--rule baseline-integrity` selectable in D7. |
| Report DTO package exports | `D0-package-export-symbol-checkreport`, `D0-package-export-symbol-rulereport`, `D0-package-export-symbol-habitatdiagnostic`, `D0-package-export-symbol-validatecheckreport` | Preserve exported names and public DTO compatibility; replace manual validation with TypeBox-backed schema validation. |
| Report construction/render package exports | `D0-package-export-symbol-createcheckreport`, `D0-package-export-symbol-rendercheckreport`, `D0-package-export-symbol-stringifycheckreport` | Keep public facades while moving semantics into D7 check modules. |
| Hook check consumption | `D0-cli-cmd-hook`, `D0-cli-cmd-hook-arg-name`, `D0-cli-cmd-hook-flag-base`, `D0-hook-hook-pre-commit`, `D0-hook-hook-pre-push`, `D0-hook-hook-unknown-refusal`, `D0-human-output-cmd-hook-line-local-feedback-authority`, `D0-human-output-cmd-hook-line-partial-staging-refusal` | D7 may publish local-feedback projection types internally; D11 owns hook sequencing and user-facing hook policy. |
| Verify check summary consumption | `D0-cli-cmd-verify`, `D0-cli-cmd-verify-flag-json`, `D0-cli-cmd-verify-flag-base`, `D0-command-json-type-verifyproof`, `D0-human-output-cmd-verify-line-running-affected`, `D0-human-output-cmd-verify-help-json-proof-wording` | D7 may publish a verify-check summary projection internally; D12 owns verify receipt schema and affected-target behavior. |
| Nx Habitat check and per-rule targets | `D0-nx-target-target-habitat-check-all`, owner `habitat:check` rows, generated `D0-nx-target-target-habitat-rule-*` rows | Preserve generated target compatibility; do not infer graph truth without D3 projections. |
| Docs/examples and generated help | `D0-docs-example-doc-tools-habitat-harness-docs-capabilities-command-surface-root-usage-table`, `D0-docs-example-doc-tools-habitat-harness-docs-implemented-surface-cli-and-entrypoints-command-list`, `D0-cli-cmd-check-forwarding-root-habitat`, `D0-cli-cmd-check-forwarding-root-habitat-delimiter`, `D0-cli-cmd-check-forwarding-root-alias`, `D0-cli-cmd-check-forwarding-nested-double-dash` | Avoid generated help/docs changes unless they are required by implemented behavior and cite these rows. |

`RuleStatus` has no separate D0 row. D7 must treat it as part of
`RuleReport`/`CheckReport` compatibility unless a later packet-approved matrix
row separates it.

## D1 Output Family And Non-Claims

D7 inherits D1 output-family decisions:

- `CheckReport` remains check output, not a receipt, proof, CI result, product
  proof, runtime proof, apply-safety proof, Graphite readiness proof, or
  OpenSpec acceptance proof.
- Invalid selectors remain D0/D1-compatible `CheckReport` JSON with
  `schemaVersion: 1`, `ok: false`, a `rule-selection-integrity` row, and nonzero
  exit.
- `CheckReport.ok` must be derived from finalized rule statuses or rejected by
  validation when contradictory.
- `HabitatDiagnostic.severity` remains closed to `error | advisory`; rule status
  remains closed through `RuleReport`.
- Hook output is local feedback only. Verify output remains D12-owned.

## Live Upstream Projection State

| Dependency | Source state | D7 source decision |
| --- | --- | --- |
| D2 selector/report/execution/baseline/Grit facts | `src/rules/registry/projections.ts` and `src/rules/facts.ts` expose live projected fact sets. | D7 may consume projected facts and stop treating whole registry rows as check authority. |
| D3 graph facts/refusals | `src/rules/registry/graph.ts` and `src/lib/workspace-graph/**` expose target/refusal states. | D7 may consume graph availability/refusal where check execution depends on graph truth. |
| D5 baseline results | `src/lib/baseline-core/**` exposes TypeBox-backed application and integrity results. | D7 may consume D5 results and keep D5 as baseline owner. |
| D6 diagnostic outcomes | `src/lib/diagnostic-catalog/**` and Grit adapters expose `DiagnosticRunOutcome` and consumer projections. | D7 may consume D6 projections internally; no root public export is required in this slice. |
| D10 protected-zone guard | Not live in stack order; current file-layer generated-zone code is not D10 authority. | D7 must not implement protected-zone authority. Preserve current file-layer behavior only until D10 lands. |

## Approved Initial Source Slice

The initial D7 implementation may:

- create small TypeBox-first modules under `src/lib/check/**`;
- derive `CheckReport`, `RuleReport`, `HabitatDiagnostic`, and D7-owned
  internal states from schemas;
- make `src/lib/check-report.ts` a compatibility facade over the D7 modules;
- keep `src/commands/check.ts` as a thin Oclif adapter;
- preserve public command/JSON/human/output behavior unless this packet records a
  D0/D1-compatible version/facade/refusal decision.

The initial D7 implementation must not:

- add migration/process inventory types to product code;
- use JS files for new D7 product logic;
- use handwritten runtime DTO parsers where TypeBox schemas apply;
- create large mixed-concern files;
- export D7 consumer projections publicly without D0 rows;
- encode D10 generated/protected-zone policy.
