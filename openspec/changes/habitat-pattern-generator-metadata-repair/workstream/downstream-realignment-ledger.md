# Downstream Realignment Ledger

**Change:** `habitat-pattern-generator-metadata-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-P1-PATTERN-GENERATOR` points to this repair but does not yet reference the opened packet. | seed row present | Update after review with accepted design state and proof boundary. | open |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Pattern rows require authority/proof metadata, but generated-rule manifest mechanics are not yet accepted. | dependent | Update row guidance after this packet is reviewed. | open |
| `openspec/changes/habitat-generators-migrations/**` | H8 generator closure can be read as approving the current pattern generator. | historical source | Reclassify pattern-generator closure as historical for authority metadata. | open |
| `openspec/changes/habitat-grit-proof-repair/**` | Existing Grit proof may need to consume or backfill manifests for current rules. | dependent | Patch only if accepted manifest contract changes current-rule proof obligations. | watched |
| `openspec/changes/habitat-scaffold-contract-repair/**` | Baseline manifest and Pattern Authority Manifest must not duplicate each other. | dependent | Patch only if manifest path or rule-introduction interface changes. | watched |
| `tools/habitat-harness/README.md` | Agent guidance can imply generator invocation is sufficient for new enforced Grit rules. | stale guidance | Update during implementation with candidate/registered metadata gates. | open |
| Root `AGENTS.md` | Tooling defaults mention generators but not the new pattern metadata gate. | stale guidance | Update during implementation if guidance stays in root router. | open |
