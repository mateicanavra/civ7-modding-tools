# D11 Review Disposition Ledger - Studio Nx Dev Runner

| ID | Severity | Reviewer/Lane | Finding | Blocker Class | Disposition | Repair Demand | Evidence | Blocks Closure |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D11-PRE-01 | P1 | prework scout `019ec826-5de7-7993-ac06-03a419cf75c0` | D11 worktree is pre-Nx; `bun run nx --version` and Habitat classify fail on this branch. | baseline mismatch | accepted-repaired as packet gate | Make accepted Nx/Habitat baseline a required implementation base and pre-Nx checkout a blocker, not a fallback lane. | `proposal.md`, `spec.md`, `tasks.md`, `phase-record.md`, and `prework-ledger.md` require baseline proof and stop on missing Nx/Habitat. | No |
| D11-PRE-02 | P2 | prework scout `019ec826-5de7-7993-ac06-03a419cf75c0` | Exact Nx config location and target names were unsettled during packet authoring. | target-name ambiguity | accepted-repaired as packet gate | After the settled Nx baseline landed, make `serve-daemon`, `dev-frontend`, and `dev` the implementation contract; migrate or delete overlapping baseline targets rather than preserving alternate names. | `design.md` D2 and `prework-ledger.md` implementation prework. | No |
| D11-PRE-03 | P2 | prework scout `019ec826-5de7-7993-ac06-03a419cf75c0` | Current tests pin `devLive` and Turbo deploy-command surfaces. | old-surface test pin | accepted-repaired as packet gate | Require deleting or rewriting `devLivePlan` tests and replacing Turbo/dev proof with Nx/process proof; D1 deployment/deploy command surfaces stay separately owned. | `tasks.md`, `testing-ledger.md`, and `downstream-realignment-ledger.md`. | No |
| D11-BI-01 | P1 | hardening/black-ice `019ec826-8202-7d41-a6cc-aa80d6ac0fbb` | Workstream control artifacts were missing during review. | compaction risk | accepted-repaired | Add phase record, prework ledger, review ledger, downstream ledger, testing ledger, and closure checklist. | `workstream/phase-record.md`, `prework-ledger.md`, `review-disposition-ledger.md`, `downstream-realignment-ledger.md`, `testing-ledger.md`, and `closure-checklist.md`. | No |
| D11-BI-02 | P1 | hardening/black-ice `019ec826-8202-7d41-a6cc-aa80d6ac0fbb` | D12 handoff was named but not usable. | downstream owner ambiguity | accepted-repaired | Add D12 handoff of negative-search outputs, process-proof outputs, surviving command classifications, and final residue triggers. | `workstream/downstream-realignment-ledger.md`. | No |
| D11-BI-03 | P2 | hardening/black-ice `019ec826-8202-7d41-a6cc-aa80d6ac0fbb` | `devLive.ts` retention path was bounded but ambiguous. | retained-path ambiguity | accepted-repaired | Make `devLive.ts` deletion normative; any future single-process helper must use a new name and owner. | `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and `prework-ledger.md`. | No |
| D11-BI-04 | P2 | hardening/black-ice `019ec826-8202-7d41-a6cc-aa80d6ac0fbb` | Live proof boundary lacked sample phases, metadata, and not-green handoff when Civ7 is unavailable. | live proof inflation | accepted-repaired as packet gate | Require accepted/deploy-entered/deploy-exited/terminal samples with branch, commit, operation id, command/API path, timestamps, logs, and next-packet if unavailable. | `design.md`, `spec.md`, `tasks.md`, `testing-ledger.md`, and `closure-checklist.md`. | No |
| D11-BI-05 | P3 | hardening/black-ice `019ec826-8202-7d41-a6cc-aa80d6ac0fbb` | Packet directory was untracked during review. | repo state | accepted-repaired | Stage and commit through Graphite before acceptance closure. | Pending final Graphite commit for D11; closure checklist blocks until status checks pass. | No |
| D11-TEST-01 | P1 | testing/Nx-native `019ec826-a719-7a71-9e5f-e15d50c602e3` | Packet was not present when initial review started. | stale review timing | invalidated | Later packet files and ledgers were created before acceptance. | `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and workstream ledgers now exist; strict validation will be run before commit. | No |
| D11-TEST-02 | P1 | testing/Nx-native `019ec826-a719-7a71-9e5f-e15d50c602e3` | Selected worktree is not accepted Nx/Habitat implementation baseline. | baseline mismatch | accepted-repaired as packet gate | Block implementation on pre-Nx checkout; do not encode fallback. | `proposal.md`, `spec.md`, `tasks.md`, `phase-record.md`, and `prework-ledger.md`. | No |
| D11-TEST-03 | P1 | testing/Nx-native `019ec826-a719-7a71-9e5f-e15d50c602e3` | App-local dev supervisor and Bun watcher remain in current code. | implementation target gap | accepted-repaired as packet gate | Require Nx-owned topology and hard deletion of `devLive.ts` / daemon Bun watcher in implementation tasks. | `proposal.md`, `design.md`, `spec.md`, and `tasks.md`. | No |
| D11-TEST-04 | P1 | testing/Nx-native `019ec826-a719-7a71-9e5f-e15d50c602e3` | No live/dev-process proof exists yet. | live proof gap | accepted-repaired as packet gate | Require process proof plus Play and Save&Deploy phase-sampled stable `serverInstanceId` proof. | `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and `testing-ledger.md`. | No |
| D11-TEST-05 | P2 | testing/Nx-native `019ec826-a719-7a71-9e5f-e15d50c602e3` | Active Turbo residue includes local dev and deployment surfaces. | residue ambiguity | accepted-repaired as packet gate | Delete active local dev Turbo route; classify deployment-only Turbo residue separately for D12/deployment follow-up. | `proposal.md`, `prework-ledger.md`, `testing-ledger.md`, and `downstream-realignment-ledger.md`. | No |

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
