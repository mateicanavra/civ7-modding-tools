# Review Disposition Ledger

**Change:** `habitat-oclif-entrypoint-repair`
**Status:** reviewed; accepted findings repaired in draft
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| ESR-1 | Evidence/System | P1 | Realignment ledger omitted stale proof hazards in `review-disposition-ledger.md`, `discrepancy-log.md`, and `FRAME.md`. | accepted | Expand downstream realignment ledger and tasks; add stale-record scan gate. | repaired in draft |
| ESR-2 | Evidence/System | P2 | Empty intersection of individually valid selectors lacked CLI JSON/human proof and baseline-expansion proof. | accepted | Add OpenSpec scenario and verification commands for `--owner @civ7/control-orpc --tool biome`, including expand-baseline no-write proof. | repaired in draft |
| ESR-3 | Evidence/System | P2 | Unknown-command behavior was named in proposal/tasks but missing from spec requirements. | accepted | Add unknown-command requirement and scenario. | repaired in draft |
| ESR-4 | Evidence/System | P2 | Production-runner proof shape did not require artifact freshness/provenance. | accepted | Add command/prod proof record shape to design, tasks, phase record, and spec. | repaired in draft |
| EFR-1 | Effect/Substrate | P2 | Selector failure payload left decisive semantics in `message`. | accepted | Add structured selector fact contract and direct unit-test expectations. | repaired in draft |
| EFR-2 | Effect/Substrate | P2 | Non-Effect service-test seam was not defined for selector/report tests. | accepted | Add P0 fake rule registry/report rendering seam and Effect trigger if broader seams are needed. | repaired in draft |
| EFR-3 | Effect/Substrate | P2 | Command provenance was under-specified. | accepted | Add command proof record shape and tasks requiring it. | repaired in draft |
| EFR-4 | Effect/Substrate | P2 | Effect adoption triggers were too vague. | accepted | Add objective trigger matrix for check-pipeline and command-runner adoption. | repaired in draft |
| CS-01 | Command Surface | P2 | Root/dev proof scenario allowed proving root script or direct dev runner instead of both. | accepted | Require both root package script and direct development runner proof for root/check help. | repaired in draft |
| CS-02 | Command Surface | P2 | Unknown-command semantics were insufficiently specified across entrypoints. | accepted | Add root/dev/prod unknown-command scenarios and verification commands. | repaired in draft |
| CS-03 | Command Surface | P2 | Human-mode invalid selector proof was missing from verification matrix. | accepted | Add human-mode unknown owner/rule/tool and empty-intersection probes. | repaired in draft |
| CS-04 | Command Surface | P2 | `--expand-baseline` selector coverage did not cover owner/tool/empty-intersection authoring paths. | accepted | Add authoring-mode selector proof for unknown owner, unknown tool, and empty intersection with no baseline writes. | repaired in draft |
| CS-05 | Command Surface | P2 | Root/dev proof did not require generated artifacts absent before source-runner probes. | accepted | Add clean-generated-artifacts proof ordering before root/dev help and before production build proof. | repaired in draft |
| CS-06 | Command Surface | P3 | Invalid selector JSON `--output` behavior was unspecified. | accepted | Add scenario/task requiring failing CheckReport write to requested output path. | repaired in draft |
