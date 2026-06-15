# Downstream Realignment Ledger

**Change:** `habitat-boundary-taxonomy-tightening`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Current status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-H3-TAXONOMY` remains unknown despite historical H3 closure and fresh design evidence. | seed row present | Update after implementation proof with exact evidence class, command boundaries, and remaining blockers. | open |
| `docs/projects/habitat-harness/workstream-record.md` | Train-closed and H3 closure rows can be read as current recovery proof without the proof matrix or command reliability caveat. | historical until this repair lands | Patch or explicitly downgrade before `CLAIM-H3-TAXONOMY` is marked current. | open |
| `docs/projects/habitat-harness/taxonomy.md` | Taxonomy claims locked-at-adoption state and dual-tag intersection; proof must stay current. | active authority doc | Patch if evidence changes tag/constraint wording or proof policy; otherwise cite this repair as current proof boundary. | open |
| `openspec/changes/habitat-boundary-tags/proposal.md` | Says the project plane was verified green at adoption and cites `run-many --all` as gate. | historical until this repair lands | Patch or annotate with current proof boundary if daemon/no-daemon behavior remains differentiated. | open |
| `openspec/changes/habitat-boundary-tags/tasks.md` | Task 4.1 and 4.3 green closure wording can hide current command-policy differences. | historical until this repair lands | Patch task closure wording to match accepted command policy and current proof matrix. | open |
| `openspec/changes/habitat-boundary-tags/workstream/phase-record.md` | Results claim direct, run-many, affected, and locked-empty boundary gates green. | historical until this repair lands | Patch results and evidence-boundary sections after implementation proof. | open |
| `docs/projects/habitat-harness/review-disposition-ledger.md` | Architecture-Review Lane says lock-safe from declared manifest edges before current resolved graph/command proof. | historical until this repair lands | Patch verdict wording or add recovery-era caveat before closure. | open |
| `openspec/changes/habitat-classify-generator-repair/**` | Classify design depends on boundary taxonomy for owner/rule-scope guidance. | dependent packet open | Patch dependency wording if it cites taxonomy as current proof instead of bounded project-plane authority. | open |
| `openspec/changes/habitat-grit-proof-repair/**` and pattern packets | Grit rows may cite taxonomy as normative project-plane authority. | dependent packet open | Ensure Grit packets cite taxonomy only for project-plane authority and not intra-project semantics. | open |
| `tools/habitat-harness/README.md` | README states taxonomy revision protocol and `nx-boundaries` lock; command-proof nuance may be missing. | active guidance | Patch if implementation selects a specific daemon/no-daemon proof policy or verifier command. | open |
| Root `AGENTS.md` | Router points to `boundaries` target and taxonomy; may need command-proof wording if proof policy changes. | active guidance | Patch if stable guidance changes. | open |
| `eslint.boundaries.config.mjs` | Config must stay parity-locked to taxonomy and single-rule owner model. | active enforcement config | Patch only if config parity audit or explicit architecture decision requires it. | watched |
