# Review Disposition Ledger

**Change:** `habitat-effect-grit-adapter`
**Status:** reviewed; accepted findings repaired in draft
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| GA-01 | Grit Adapter | P2 | Command-result contract omitted branch, commit, and dirty-state/status digest, so proof was not bound to an exact source tree. | accepted | Add Git state fields to command/proof result, service contracts, tasks, and spec. | repaired in draft |
| GA-02 | Grit Adapter | P2 | Baseline handoff was ambiguous and could move baseline policy or writes into the adapter. | accepted | Define adapter/baseline boundary: adapter reads snapshots and emits baseline keys/findings; existing Habitat baseline flows own policy and writes. | repaired in draft |
| GA-03 | Grit Adapter | P2 | Injected harness did not require row-level effective-scope proof for all current rules. | accepted | Make adapter root, `rules.json` scope, Grit predicate, scan roots/exclusions, matching probe, and outside-scope control probe mandatory for current check rows. | repaired in draft |
| GA-04 | Grit Adapter | P2 | Apply transaction lacked full candidate rewrite inventory before apply. | accepted | Require dry-run/transaction-copy inventory and approval classification for every live and injected candidate rewrite. | repaired in draft |
| GA-05 | Grit Adapter | P3 | Native fixture proof was a verification command but not row-addressable adapter output. | accepted | State native fixture row projection remains owned by `habitat-grit-proof-repair`; adapter emits command/provenance records when running pattern tests. | repaired in draft |
| PO-1 | Product Outcome | P2 | Parity gate could preserve broken command truth by asking for no behavior change against current command behavior. | accepted | Reword parity against the accepted command-surface contract and mark command-trust claims unclaimed until `habitat-oclif-entrypoint-repair` lands. | repaired in draft |
| PO-2 | Product Outcome | P2 | Effect adoption was overclaimed before review and dependency/platform parity. | accepted | Downgrade to provisional selection pending review and parity; split design selection from live dependency adoption. | repaired in draft |
| PO-3 | Product Outcome | P2 | Command-result fields were not backed by durable proof artifact schema, ids, retention, redaction, or downstream links. | accepted | Add `ProofArtifactWriter` contract and require proof artifact links into the command-proof log or matrix before proof labels are accepted. | repaired in draft |
| PO-4 | Product Outcome | P2 | Closure mixed adapter delivery with all-22 proof repair execution. | accepted | Split milestones: design accepted, adapter implementation ready, and proof-repair rows executed by `habitat-grit-proof-repair`. | repaired in draft |
| PO-5 | Product Outcome | P3 | Product movement mentioned classify even though this packet does not consume classify output. | accepted | Reframe product movement around truthful Grit proof/safe transforms and downstream pattern/generator metadata consumption. | repaired in draft |
| EGA-01 | Evidence/OpenSpec | P2 | Downstream state overclaimed acceptance while review was pending. | accepted | Align evaluation and adapter phase state to provisional selection pending review/parity. | repaired in draft |
| EGA-02 | Evidence/OpenSpec | P2 | One-row injected proof wording could be mistaken for corpus proof. | accepted | Relabel as adapter smoke proof with explicit non-claim; keep all-22 proof execution in `habitat-grit-proof-repair`. | repaired in draft |
| EFF-SUB-01 | Effect/Substrate | P2 | Command-result contract did not define persistence or link to CheckReport v1 and downstream command-proof logs. | accepted | Add adapter proof artifact/log contract with schema, path, proof id, redaction, retention, non-claims, and downstream links outside CheckReport v1. | repaired in draft |
| EFF-SUB-02 | Effect/Substrate | P2 | Runtime-edge discipline was ambiguous and could hide a public command-engine API migration. | accepted | Name the runtime bridge, allowed runner callsites, exported API return shape, static guard, and compatibility tasks. | repaired in draft |
| EFF-SUB-03 | Effect/Substrate | P2 | Apply cleanup/finalizer proof did not cover after-write failures, interruption, downstream gate failure, or rollback failure. | accepted | Add apply scenarios and tasks for those failure modes and define rollback primitives. | repaired in draft |
| EFF-SUB-04 | Effect/Substrate | P2 | Pre-implementation source refresh and repo-local Effect pattern inspection were required but absent from tasks. | accepted | Add tasks to refresh source packs, inspect repo-local Effect usage, and record platform runtime strategy before dependency edits. | repaired in draft |
| EFF-SUB-05 | Effect/Substrate | P3 | Existing hook Grit parsing remains manual, so this packet must not imply it replaces all fragile Grit parsing. | accepted | Add explicit hook non-claim and downstream boundary for `habitat-effect-hook-transaction`. | repaired in draft |
