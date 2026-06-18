# Downstream Realignment Ledger: D0 Public Surface Compatibility Matrix

| Downstream Surface | Required D0 Handoff | Later Packet Rule |
| --- | --- | --- |
| D1 Receipt Contract Boundary | Rows for `CheckReport`, `VerifyProof`, `HookTrace`, `GritApplyTransactionProof`, `AdapterProofArtifact`, command JSON, and package exports. | D1 must cite D0 rows before preserving, renaming, versioning, or removing proof-shaped current names. |
| D2 Rule Registry Metadata Contract | Rows for rule exports, command reports, Nx target aliases, generator rule registration, and package exports. | D2 must cite D0 rows before changing command or package surfaces. |
| D3 Workspace Graph Boundary | Rows for root scripts, Nx plugin targets, `nx show project`, graph command JSON/human output, and package exports. | D3 may redesign graph metadata only after D0 records current target aliases and graph surfaces. |
| D4 Orientation And Routing | Rows for `habitat classify`, `Classification`, `DiffClassification`, docs examples, and package exports. | D4 must cite D0 rows before changing classify JSON or human output. |
| D5 Baseline Authority | Rows for baseline exports, check JSON, verify handoff, and package exports. | D5 may redesign baseline authority only after public/internal state is classified. |
| D6-D8 Enforcement and Pattern Packets | Rows for Grit, diagnostics, rule, Pattern Authority, and check outputs. | Later packets must preserve or version public diagnostics and exports according to D0. |
| D9 Apply Transaction | Rows for `habitat fix`, dry-run behavior, Grit apply transaction types, and output claims. | D9 must cite D0 before changing apply transaction records or fix output. |
| D10-D14 Guards, Feedback, Verify, Scaffolding | Rows for hooks, verify, generator schemas, refusal examples, and docs examples. | Later packets must cite D0 rows before redesigning those public surfaces. |
| D15 Trigger | Rows for current process/result substrate exports if any consuming packet triggers D15. | D15 cannot create a broad substrate migration without row-specific downstream demand. |
