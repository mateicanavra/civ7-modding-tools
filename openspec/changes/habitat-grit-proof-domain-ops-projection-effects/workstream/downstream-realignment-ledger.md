# Downstream Realignment Ledger - Domain Ops Projection Effects

| Surface | Change | Disposition |
| --- | --- | --- |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Align DOP with native fixture, parser inventory, native corpus, wrapper/current-tree, explicit empty baseline, and row-specific injected proof. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Replace inherited shared proof wording with current closure proof ids and preserve raw/template/source/product non-claims. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Add current closure rows for DOP native corpus, per-rule wrapper, aggregate wrapper, baseline inventory, and row-specific injected proof. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json` | Existing row already records a positive op probe and non-op path control with matching `rulesJsonScope`. | No patch; current row-specific injected proof is recorded by `DOPE-INJECTED-PROBE-2026-06-16`. |
| `tools/habitat-harness/src/rules/rules.json` | Existing rule metadata already matches the row scope and pattern identity. | No patch. |
| `tools/habitat-harness/baselines/grit-domain-ops-projection-effects.json` | Explicit empty baseline already exists. | No patch; current row proof `DOPE-BASELINE-FILES-2026-06-16` records the explicit empty baseline and wrapper `baseline-integrity` result. |
| HR classify/generator records | This check row does not consume classify target truth or generator implementation behavior. | No patch. |
