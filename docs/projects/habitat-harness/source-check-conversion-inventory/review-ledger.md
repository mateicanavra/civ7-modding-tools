# Review Ledger

Status: synthesized review complete

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Coverage review: canonical corpus must include exactly 73 rule records. | P1 | cleared | `mechanical-counts.json` records `ruleRecords: 73`; JSONL validation parses all canonical lanes. |
| Coverage review: adapter crosswalk must include exactly 33 centralized adapters. | P1 | cleared | `mechanical-counts.json` records `adapters: 33`; `lanes/adapter-crosswalk.jsonl` has 33 rows. |
| Source-check mismatch must be explicit: 29 active source-check records vs 33 adapters. | P1 | cleared | Crosswalk records 29 active source-check adapters and 4 stale adapters for command-check records. |
| Quality review: weak non-Grit claims must be challenged. | P2 | cleared | Lane summaries identify Grit candidates aggressively and reserve non-Grit for package/runtime/generated/Nx/file-layer or split rows. |
| Quality review: broad command-check bundles must not be converted wholesale. | P2 | cleared | `needs_split` rows are listed in `matrix.md` and ordered in `next-grit-extraction-slices.md`. |
| Crosswalk review challenged `require_explicit_mapgen_sdk_opt_in` as mixed despite lane direct-Grit classification. | P2 | accepted | Canonical row changed to `needs_split`; mapgen-other lane summary records review-adjusted split. |
| Classification enum lacks exact labels for file-layer generated-zone and Nx graph-backed rules. | P3 | accepted with constraint | Kept requested enum unchanged; rows use `data_driven_import_path_rule` with notes. |
| Current adapters must not be preserved as target architecture. | P1 | cleared | Crosswalk marks active adapters as conversion targets and stale non-source adapters as delete/demote candidates. |
