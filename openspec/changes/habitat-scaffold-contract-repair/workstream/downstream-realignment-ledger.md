# Downstream Realignment Ledger

**Change:** `habitat-scaffold-contract-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-H2-SCAFFOLD` and `CLAIM-P1-BASELINE` point to this repair but do not yet reference the opened packet or fresh command evidence. | seed rows present | Update after review with accepted design state and exact proof boundary. | open |
| `docs/projects/habitat-harness/workstream-record.md` | H1-H8 closure prose can be read as current baseline proof despite Stage 0 contradictions. | historical claim | Reclassify baseline/scaffold closure text or point to this repair during implementation. | open |
| `openspec/changes/habitat-harness-scaffold/workstream/phase-record.md` | H2 baseline proof remains useful history but does not prove the explicit baseline contract, and older key-format text conflicts with current `path::message` behavior. | historical source | Reclassify H2 baseline/key-format language as historical in current recovery records; do not let implementation inherit H2 acceptance state. | open |
| `openspec/changes/habitat-grit-proof-repair/design.md` | Grit proof needs baseline state to distinguish baselined/unbaselined findings. | dependent | Update to consume the accepted baseline state contract after this packet is reviewed. | open |
| `openspec/changes/habitat-effect-grit-adapter/design.md` | Adapter BaselineAccess boundary may need exact shape after baseline state is typed. | dependent | Patch only if implementation changes the baseline access contract. | watched |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current rows say empty locked unless findings prove otherwise, but explicit baseline state is not yet defined. | dependent | Update row contract language after accepted baseline repair. | open |
| `openspec/changes/habitat-generators-migrations/**` | Pattern generator currently creates empty baseline files but not authority/proof metadata; generated rules can enter enforced pre-commit scope with scaffold defaults. | historical source | Keep metadata repair separate; add dependency on committed baseline files and rule-introduction baseline manifests. | open |
| Future `habitat-pattern-generator-metadata-repair` | Generated enforced rules need authority metadata, proving metadata, scan-root policy, false-positive policy, fixture strategy, hook-scope decision, and baseline file contract. | not opened | Open after baseline and Grit proof contracts are accepted or record exact dependency. Generator must not bypass the baseline manifest contract. | watched |
| `docs/projects/habitat-harness/effect-orchestration-evaluation.md` | The local Effect evaluation identifies baseline integrity as a strong Effect-fit surface. | design source | Implementation must add a manual-vs-Effect adoption-gate record before choosing the baseline substrate. | open |
| `docs/projects/habitat-harness/research/official-docs-effect.md` | Official docs evidence may affect the baseline service/layer choice. | design source | Refresh when implementation begins; cite current services/layers/schema/resource docs in the substrate decision. | open |
