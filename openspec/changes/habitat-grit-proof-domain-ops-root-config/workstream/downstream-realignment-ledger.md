# Downstream Realignment Ledger - Domain Ops Root Config

| Surface | Change | Disposition |
| --- | --- | --- |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Replace pending repair-scan row with DORC native fixture and parser inventory evidence. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Replace seed row with fixture/parser inventory evidence, inherited shared proof ids, explicit baseline, and non-claims. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Add `DORC-NATIVE-FIXTURES-2026-06-15` and `DORC-DOMAIN-OPS-INVENTORY-2026-06-15`. | Updated in this row. |
| `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json` | Existing row already records a positive op probe and non-op path control with matching `rulesJsonScope`. | No patch. Shared injected-probe API proof is inherited only. |
| `tools/habitat-harness/src/rules/rules.json` | Existing rule metadata already matches the row scope and pattern identity. | No patch. |
| `tools/habitat-harness/baselines/grit-domain-ops-root-config.json` | Explicit empty baseline already exists. | No patch; inherited baseline inventory/integrity proof cited. |
| HR classify/generator records | This check row does not consume classify target truth or generator implementation behavior. | No patch. |
