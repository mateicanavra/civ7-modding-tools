# D9 Review Disposition Ledger - Studio Operations Push

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
|---|---|---|---|---|---|---|---|---|
| D9-BI-01 | P1 | hardening/black-ice `019ec815-b277-7f13-a524-b90a2cd24a65` | Phase record claimed historical implementation closure, merge/drain, and green tests. | proof inflation | accepted-repaired | Rewrite as D9 packet-authoring phase record with Gates 1-12 and no merged/complete implementation claims. | `workstream/phase-record.md` now records D9 draft/accepted packet state and future implementation gates. | No |
| D9-BI-02 | P1 | hardening/black-ice `019ec815-b277-7f13-a524-b90a2cd24a65` | Review ledger used stale historical watcher dispositions rather than fresh D9 packet review. | stale review evidence | accepted-repaired | Replace ledger with fresh D9 findings/dispositions and block acceptance on unresolved material findings. | This ledger records D9 prework/hardening/testing findings and dispositions. | No |
| D9-BI-03 | P1 | hardening/black-ice `019ec815-b277-7f13-a524-b90a2cd24a65` | Required D9 prework/testing/downstream/closure records were missing. | compaction risk | accepted-repaired | Add D9 ledgers matching accepted packet shape. | `prework-ledger.md`, `testing-ledger.md`, `downstream-realignment-ledger.md`, and `closure-checklist.md`. | No |
| D9-BI-04 | P2 | hardening/black-ice `019ec815-b277-7f13-a524-b90a2cd24a65` | D12 handoff for post-D9 residue was missing. | downstream owner ambiguity | accepted-repaired | Add D10 and D12 downstream ledger sections, including retained status procedure classification. | `workstream/downstream-realignment-ledger.md`. | No |
| D9-PRE-01 | P2 | prework scout `019ec815-7cad-7fa2-a383-5a394c47ec7e` | `createStudioEngines({ eventHub? })` leaves an optional no-publish seam. | production composition ambiguity | accepted-repaired | Classify optional seam as test/non-daemon only and require production daemon composition proof. | `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and `prework-ledger.md`. | No |
| D9-PRE-02 | P2 | prework scout `019ec815-7cad-7fa2-a383-5a394c47ec7e` | Manual Run in Game retry-status path could be confused with polling authority. | deletion boundary ambiguity | accepted-repaired | Classify public/manual status diagnostics separately from background freshness polling. | `proposal.md`, `design.md`, `phase-record.md`, `prework-ledger.md`, and `downstream-realignment-ledger.md`. | No |
| D9-TEST-01 | P1 | testing/vendor `019ec815-e8d2-7552-9c07-add30e883b33` | Existing store tests prove `onChange` but not the actual EventHub bridge through `createStudioEngines`. | publisher falsifier gap | accepted-repaired as packet gate | Require a real publisher bridge test using fake `StudioEventHubApi.publish` through engine construction; removing either family bridge must fail. | `proposal.md`, `design.md`, `tasks.md`, `testing-ledger.md`, and `closure-checklist.md` require publisher bridge and production composition proof. | No |
| D9-TEST-02 | P2 | testing/vendor `019ec815-e8d2-7552-9c07-add30e883b33` | Existing client tests call helper functions and would not catch deletion of the `useStudioEvents` operation effect. | client path proof gap | accepted-repaired as packet gate | Require hook/path test for `useStudioEvents` operation event handling. | `tasks.md` and `testing-ledger.md` require client pushed operation path tests; future implementation must add hook/component proof if helper tests are insufficient. | No |
| D9-TEST-03 | P2 | testing/vendor `019ec815-e8d2-7552-9c07-add30e883b33` | Terminal toast parity is under-proven by helper-only tests. | user-visible parity gap | accepted-repaired as packet gate | Require toast parity proof for adopted terminal suppression and live pushed terminal notification. | `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and `testing-ledger.md` require terminal toast parity. | No |
| D9-TEST-04 | P2 | testing/vendor `019ec815-e8d2-7552-9c07-add30e883b33` | Live-game helper evidence could be counted as D9 acceptance. | scope leakage | accepted-repaired | Classify live-game evidence as D10-adjacent protected-boundary evidence, not D9 operation-push proof. | `proposal.md`, `design.md`, `phase-record.md`, `testing-ledger.md`, and `downstream-realignment-ledger.md` protect D10 live-game scope. | No |

## Disposition Rules

- `accepted`: repair before dependent implementation or closure.
- `rejected`: record source evidence showing the finding does not apply.
- `invalidated`: record later source evidence that made the finding false.
- `user-decision`: record the user or authority decision that resolves the finding.
- `waived`: allowed only for P3/nonblocking findings; record risk, owner, and trigger.
- `deferred`: allowed only for P3/nonblocking findings; record destination, owner, and context.
- `accepted-repaired`: accepted material finding repaired inside this packet with
  evidence and no remaining packet-acceptance block.
- `accepted-repaired as packet gate`: accepted finding is an implementation
  proof obligation, repaired for packet acceptance by making it an explicit
  future implementation closure gate rather than overclaiming current proof.

No material finding may remain undispositioned at phase closure.
