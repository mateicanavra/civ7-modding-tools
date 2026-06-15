# Downstream Realignment Ledger - Runtime Config Merge Candidate

| Surface | Disposition | Evidence |
| --- | --- | --- |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Updated candidate row with draft predicate proof, parser inventory, live-candidate blocker, non-registration, and reopen trigger. | `RCM-DRAFT-FIXTURES-2026-06-15`; `RCM-RUNTIME-INVENTORY-2026-06-15` |
| `openspec/changes/habitat-grit-proof-repair/workstream/command-proof-log.md` | Updated with draft fixture and parser-inventory proof rows. | `RCM-DRAFT-FIXTURES-2026-06-15`; `RCM-RUNTIME-INVENTORY-2026-06-15` |
| `openspec/changes/habitat-grit-proof-repair/workstream/grit-proof-matrix.md` | Not updated as a current check row because this candidate has no active `rules.json` entry, `.grit` pattern, baseline, or injected probe. | `RCM-LIVE-CANDIDATE-BLOCKER-2026-06-15` |
| `.grit/patterns/habitat/checks/runtime_config_merge.md` | Not present; draft proof file was removed after native fixture proof. | `RCM-DRAFT-FIXTURES-2026-06-15` |
| `tools/habitat-harness/src/rules/rules.json` | No `grit-runtime-config-merge` entry added. | `RCM-LIVE-CANDIDATE-BLOCKER-2026-06-15` |
| `tools/habitat-harness/baselines/grit-runtime-config-merge.json` | Not present; baselines are only for registered rules and no baseline-debt disposition exists. | `RCM-LIVE-CANDIDATE-BLOCKER-2026-06-15` |
| `openspec/changes/habitat-grit-proof-repair/workstream/injected-probes.json` | No injected probe added for the unregistered candidate. | `RCM-LIVE-CANDIDATE-BLOCKER-2026-06-15` |
