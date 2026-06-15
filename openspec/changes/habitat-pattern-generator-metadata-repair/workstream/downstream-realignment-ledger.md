# Downstream Realignment Ledger

**Change:** `habitat-pattern-generator-metadata-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-P1-PATTERN-GENERATOR` pointed at generated rule registration as unrepaired. | stale seed row | Updated to record candidate-only generation and fail-closed registered states on this branch, with full Pattern Authority Manifest validation and registered promotion still open. | patched for checkpoint |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Pattern rows require authority/proof metadata, but generated-rule manifest mechanics are not yet accepted. | dependent | Updated row guidance: generated pattern output is candidate-only until accepted manifest, baseline/current-tree/fixture/false-positive/hook-scope proof exists. | patched for checkpoint |
| `openspec/changes/habitat-generators-migrations/**` | H8 generator closure can be read as approving the current pattern generator. | historical source | Reclassified the H8 pattern-generator closure language as historical for authority metadata; H8 is not authority for new enforced Grit rules. | patched for checkpoint |
| `openspec/changes/habitat-grit-proof-repair/**` | Existing Grit proof may need to consume or backfill manifests for current rules. | dependent | Patch only if accepted manifest contract changes current-rule proof obligations. | watched |
| `openspec/changes/habitat-scaffold-contract-repair/**` | Baseline manifest and Pattern Authority Manifest must not duplicate each other. | dependent | Patch only if manifest path or rule-introduction interface changes. | watched |
| `tools/habitat-harness/README.md` | Agent guidance can imply generator invocation is sufficient for new enforced Grit rules. | stale guidance | Updated to describe candidate draft generation and registered rule gates; native Grit samples remain one proof class only. | patched for checkpoint |
| Root `AGENTS.md` | Tooling defaults mention generators but not the new pattern metadata gate. | stale guidance | Updated root router guidance to say the pattern generator emits a non-enforcing candidate draft and registered enforcement requires accepted metadata/proof gates. | patched for checkpoint |
