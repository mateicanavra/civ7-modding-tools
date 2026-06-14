# Downstream Realignment Ledger

**Change:** `habitat-effect-grit-adapter`
**Owner:** DRA Habitat recovery owner

| Downstream artifact | Current risk | Interim status | Required disposition | Status |
| --- | --- | --- | --- | --- |
| `openspec/changes/habitat-grit-proof-repair/design.md` | Adapter tasks are blocked on a substrate that did not yet have its own packet. | substrate packet reviewed in this checkpoint | Update Grit proof repair records to consume the accepted adapter contract before implementation. | design realigned |
| `openspec/changes/habitat-grit-proof-repair/tasks.md` | Tasks 4, 6, and adapter tests cannot proceed until the substrate is accepted. | design dependency recorded in this checkpoint | Mark the relevant tasks as dependent on this change after acceptance, then unblock during implementation. | design realigned |
| `openspec/changes/habitat-grit-proof-repair/workstream/phase-record.md` | Next action text still described prior validation/review work instead of the opened substrate packet. | patched in this checkpoint | Keep current next action aligned with this change's review state. | patched |
| `openspec/changes/habitat-grit-proof-repair/workstream/review-disposition-ledger.md` | ESR-3 carried stale validation-status language after validation had passed. | patched in this checkpoint | Keep review ledger current before stacking implementation claims. | patched |
| `docs/projects/habitat-harness/effect-orchestration-evaluation.md` | Evaluation listed candidate slices but did not record the first selected adoption slice. | patched in this checkpoint | Keep the decision record clear that this packet is Grit-scoped, provisional until review/parity, and not a broad migration. | patched |
| `docs/projects/habitat-harness/recovery-claim-ledger.md` | `CLAIM-P1-EFFECT-FIT` will need current implementation evidence after this packet lands. | current design controls until implementation | Update after dependency/platform and adapter proof are implemented. | pending implementation |
| `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` | Current rows need adapter proof ids for injected and apply proof. | blocked until implementation | Fill proof ids after adapter implementation and Grit proof repair consume them. | pending implementation |
| `tools/habitat-harness/package.json` and `bun.lock` | Habitat currently has no Effect dependency even though this packet selects Effect. | no code/package edits in design checkpoint | Add exact dependencies only through task 2 parity proof. | pending implementation |
| Future `habitat-effect-command-runner` | Shared command-runner extraction may be desired too early. | outside this packet until reuse evidence exists | Open only when another workstream proves it needs the same command-result contract outside Grit. | watched |
