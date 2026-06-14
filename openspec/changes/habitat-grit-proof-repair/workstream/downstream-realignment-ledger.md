# Downstream Realignment Ledger

**Change:** `habitat-grit-proof-repair`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Interim status | Required disposition | Status |
| --- | --- | --- | --- |
| `openspec/changes/habitat-grit-catalog/tasks.md` | H5 tasks claim parity, current-tree proof, and empty baselines without current proof depth. | historical until this repair lands | Patch after implementation with current proof classes and historical/current split. | pending implementation |
| `openspec/changes/habitat-grit-catalog/workstream/phase-record.md` | Closed H5 record reads stronger than current evidence for baselines, raw scan behavior, and apply safety. | historical until this repair lands | Annotate as historical and point to this repair for current proof. | pending implementation |
| `openspec/changes/habitat-enforcement-consolidation/workstream/phase-record.md` | H6 retirements depend on H5 parity and Grit proof claims. | historical until this repair lands | Reclassify retirement proof as current/unknown/deferred per proof matrix. | pending implementation |
| `docs/projects/habitat-harness/workstream-record.md` | H5/H6 closure language may overstate current Grit proof and product capability. | historical until this repair lands | Patch rows tied to Grit proof, apply safety, and records truth. | pending implementation |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | CLAIM-H5-GRIT, CLAIM-H6-ONE-PATH, CLAIM-P1-BASELINE, CLAIM-PRODUCT-TRANSFORMS need updated evidence. | current seed plus this design packet controls until implementation | Update rows with implementation proof and non-claims. | pending implementation |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current rows are seeded as implemented-under-proof. | current seed controls until proof matrix is filled | Mark rows proven, blocked, or delegated based on proof matrix. | pending implementation |
| `docs/projects/habitat-harness/review-disposition-ledger.md` | Prior reviews may still rely on H5 closure as current proof. | historical until this repair lands | Patch stale proof wording or record no-change with evidence. | pending implementation |
| `docs/projects/habitat-harness/discrepancy-log.md` | Grit/baseline/apply discrepancies may be stale after repair. | historical until this repair lands | Patch or annotate affected entries. | pending implementation |
| `docs/projects/habitat-harness/FRAME.md` | Product capability and H5 status language may need current-proof adjustment. | current DRA takeover frame controls recovery proof | Patch only durable status/decision wording, not transient phase trivia. | pending implementation |
| `tools/habitat-harness/README.md` | Pattern generator and Grit proof guidance may omit authority/proof requirements. | user-facing guidance must not be used to bypass this packet | Patch if user-facing commands or generator expectations change. | pending implementation |
| `tools/habitat-harness/src/generators/pattern/**` | Current generator can create enforced Grit rules without required authority/proof metadata. | blocked for new enforced Grit pilots until metadata repair or explicit stop condition is satisfied | Add to pattern-generator metadata repair or patch this flow before first new Grit pilot. | pending implementation |
