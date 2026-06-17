# Review Disposition - Runtime Effect Recovery Design

Status: review wave complete; design approved for sequential docs/OpenSpec
realignment.

Accepted P1/P2 findings block design approval until repaired, rejected with
evidence, or moved outside the design closure claim.

## Sidecar Review Lanes

| Lane | Agent | Status | Result |
| --- | --- | --- | --- |
| D12 drain reconciliation | read-only explorer | complete | No P1; P2 stale D12 final-drain records; recommends records-only repair. |
| D0-D12 packet accounting | read-only explorer | complete | D12 final-drain handoff blocks using old next-packet text; D10/D11/D0/D5 require docs realignment; D2.5/D3 bridge rows historical-only. |
| Current source/runtime residue | read-only explorer | complete | No P1/P2/P3; code implementation should not be in scope before docs realignment. |
| Proof/test design | read-only explorer | complete | No P1; P2 D12 drain/live-proof contradictions must be superseded explicitly; lists proof classes and validation boundaries. |

## Findings

| Finding | Severity | Source | Disposition | Blocks design approval |
| --- | --- | --- | --- | --- |
| D12 tasks/next-packet still say final drain remains open even though current `origin/main` contains runtime PRs through `#1748`. | P1 | owner evidence | accepted; R0 owns repair design | No after R0 remains first implementation slice |
| D10/D11 not-green handoffs remain active-looking despite D12 live state-machine proof. | P2 | owner evidence | accepted; R1 owns proof-consumption design with coverage stop condition | No after R1 keeps coverage gaps explicit |
| Older unchecked packet rows may keep OpenSpec list incomplete for historical rather than current reasons. | P2 | owner evidence | accepted; R2 owns row-by-row realignment design | No after R2 preserves genuine proof gaps |
| D12 final-drain handoff remains open across tasks, next packet, closure checklist, final proof ledger, phase record, downstream ledger, and review ledger. | P2 | D12 drain reviewer | accepted; R0 write set expanded to include all named D12 workstream records | No |
| D12 phase status says live Civ7 proof not closed even though testing/final-proof/next-packet records say live proof executed. | P2 | proof/test reviewer + packet-accounting reviewer | accepted; R0 must update D12 phase status and preserve proof-class separation | No |
| Current source residue review found no live `RunInGameHttpError`, `StudioEngineError`, browser recovery/watchdog, devLive/Bun watcher, broad daemon authoring import, Zod contract, unsanctioned direct-control constructor, or unclassified status-owner blocker. | P2 rejected hypothesis | source-residue reviewer | accepted as evidence against adding a code slice before docs realignment | No |
| D0 artifact classification ledger still labels D1-D12 as implementation pending / pending closeout. | P2 | packet-accounting reviewer | accepted; R2 owns stale baseline-ledger realignment | No |
| D5 review ledger says Graphite commit pending after D5 implementation landed. | P2 | packet-accounting reviewer | accepted; R2 owns stale review-ledger realignment | No |
| D2.5/D3 bridge corpus ledgers preserve old "current evidence" rows. | P3 | packet-accounting reviewer | accepted-historical-only; no design blocker unless active status text points at them as current authority | No |

## Design Approval State

Design is approved for implementation of R0-R4 in the order defined by
`CHANGESET-DESIGN.md`. There are no accepted unresolved P1/P2 findings against
the design. R0 remains the first implementation slice and must complete before
any later realignment slice starts.
