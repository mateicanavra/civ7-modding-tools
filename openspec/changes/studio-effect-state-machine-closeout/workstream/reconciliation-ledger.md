# Reconciliation Ledger: Studio Effect State-Machine Closeout

Date: 2026-06-17

Status: closeout reconciliation in progress on
`codex/studio-effect-state-machine-closeout`. The fresh live/log proof below
was recorded before this evidence update commit, with pre-update head
`0444e6188 docs(studio): reconcile state-machine closeout`.

This ledger is the SMR-08 final accounting surface. It reconciles the prework
scenario corpus, error-boundary ledger, packet records, review findings, and
proof labels without substituting one proof type for another.

## Current Stack And Worktree

- Current branch: `codex/studio-effect-state-machine-closeout`.
- Pre-update head: `0444e6188 docs(studio): reconcile state-machine closeout`.
- Downstack Studio packet heads:
  - `1b9ec418e fix(studio): scope restart recovery to current run state`
  - `2a3d126ac docs(studio): record browser scenario proof`
  - `db1e3b7df fix(studio): restart disposable run-in-game launches`
  - `ad906119d docs(studio): record dev startup proof`
  - `f01ebcf29 fix(studio): recover event adoption state`
  - `2620937c1 fix(studio): preserve browser defined errors`
  - `2ce09b6f4 fix(studio): classify operation lifecycle failures`
  - `7330a48bb fix(studio): complete rpc boundary coverage`
  - `c10c4212d docs(studio): design state-machine recovery packet train`
  - `f107448a3 docs(studio): frame state-machine recovery workstream`
- Existing unrelated dirty state remains excluded:
  - `.agents/skills/README.md`
  - `.agents/skills/civ7-mapgen-workstream/`
  - `docs/projects/mapgen-workstream-skill/`
- Graphite render remains high-risk for broad mutation: Studio branches render
  below unrelated habitat branches marked `needs restack`. SMR-08 does not
  claim Graphite submission until a deliberate stack ownership pass runs.

## Packet Disposition

| Packet | Status | Proof labels earned | Labels not claimed |
|---|---|---|---|
| SMR-01 RPC boundary completion | Implemented and locally verified. | `tested`, `built`, OpenSpec validation. | browser rendered proof, live happy path, `logged`, product proof. |
| SMR-02 operation lifecycle classification | Implemented and locally verified. | `tested`, `built`, OpenSpec validation. | browser rendered proof, generated/deployed/live proof, product proof. |
| SMR-03 browser defined error projection | Implemented and locally verified. | `tested`, browser API projection, `built`, OpenSpec validation. | rendered full-shell proof, live proof, product proof. |
| SMR-04 event recovery and adoption | Implemented and locally verified. | `tested`, browser state proof, `built`, OpenSpec validation. | live proof, in-game observation, product proof. |
| SMR-05 dev startup proof | Recorded and locally verified. | `tested`, `built`, dev startup observed, bounded cleanup. | live tuner success, generated/deployed/in-game proof, product proof. |
| SMR-06 browser scenario proof | Rendered browser fast path recorded. | manual browser scenario evidence, `tested`, `built`. | automated browser proof, fallback process-restart rendered proof, product proof by itself. |
| SMR-07 live Civ7 proof gates | Priority blocker repaired and live setup/start path observed. | `tested`, `built`, `generated`, `deployed`, `tuner-exercised`, `in-game observed`, bounded `Scripting.log` proof for request `studio-run-in-game-mqhog22i-13if-2`. | sibling logs if required for broader product/load diagnostics; Graphite submitted; product proof as a broad release claim. |
| Restart relation-scope correction | Implemented after user review of restart policy. | `tested`, `built` through app check; browser component proof. | live/browser manual rerun after this exact top commit. |
| SMR-08 closeout | Locally reconciled and validated. | closeout evidence, strict OpenSpec validation, full OpenSpec validation, habitat-classified lint/habitat validation. | Graphite submitted, product proof until final stack/product review. |

## Accepted Review Findings

No accepted P1/P2 packet-design finding remains open:

- `PRD-01` through `PRD-12` are repaired in `PACKET-TRAIN.md` and packet
  records.
- Prework findings `R-01` through `R-13` are either repaired in the prework
  artifacts or carried into packet implementation records.
- Implementation-time restart findings are accepted and repaired:
  - Unconditional process restart for disposable `studio-current` was narrowed
    to fallback only after typed setup-row proof failure.
  - Generic coordinate clicking during process restart was removed from the
    production path; readiness is passive App UI shell proof, with only
    direct-control `Cinematic` display-queue dismissal as an accelerator.
  - Stale browser operation state no longer carries `Restart Civ & Run` onto a
    changed authored Studio state.

## Scenario Final Disposition

Proof labels are cumulative but not substitutable. `partial` means the row has
some earned evidence while a named label remains unclaimed.

| ID | Final disposition | Earned labels | Unclaimed or bounded labels |
|---|---|---|---|
| READ-01 | Declared unavailable mapping covered by server tests. | `tested`, `built`. | live happy-path browser product proof. |
| READ-02 | Declared unavailable mapping covered by server tests. | `tested`, `built`. | separate happy-path tuner probe. |
| READ-03 | Declared unavailable mapping covered by server tests. | `tested`, `built`. | separate happy-path tuner probe. |
| READ-04 | `SETUP_CONFIG_UNAVAILABLE` is declared and browser projection preserves code/status/observedAt. | `tested`, browser API projection, `built`. | rendered setup-unavailable browser scenario after this top commit. |
| READ-05 | Non-Civ saved-config read remains source-level only. | `tested`, `built`. | rendered startup-specific assertion. |
| READ-06 | Non-Civ setup-catalog read remains source-level only. | `tested`, `built`. | rendered startup-specific assertion. |
| RPC-01 | `recipeDag.get` declared errors and defects are tested through the handler. | `tested`, `built`. | none for this closeout claim. |
| LIVE-01 | Partial live status parity is tested; rendered browser fast path observed live status update. | `tested`, manual browser evidence. | product proof by itself. |
| LIVE-02 | Snapshot failure mapping is covered at source boundary. | `tested`, `built`. | happy-path tuner probe for this exact RPC. |
| LIVE-03 | Entity failure mapping is covered at source boundary. | `tested`, `built`. | happy-path tuner probe for this exact RPC. |
| LIVE-04 | Live game-info failure mapping is covered at source boundary. | `tested`, `built`. | happy-path tuner probe for this exact RPC. |
| OP-01 | Run in Game admission validation is tested before worker start. | `tested`, `built`. | rendered validation UX. |
| OP-02 | Duplicate active and terminal Run in Game fingerprints are tested. | `tested`, `built`. | rendered duplicate-adoption UX. |
| OP-03 | Missing, expired, and daemon-mismatch status paths are tested. | `tested`, `built`. | rendered daemon-mismatch browser proof. |
| OP-04 | Run in Game worker phases are tested; priority `studio-current.js` local/deploy/setup/start blocker is repaired and live observed. | `tested`, `built`, `generated`, `deployed`, `tuner-exercised`, `in-game observed`, bounded `Scripting.log` proof. | sibling logs if required for broader load/product diagnostics; product proof as broad release claim. |
| OP-05 | Runtime disposal, active worker failure, and new-start rejection are tested. | `tested`, `built`. | rendered disposal UX. |
| OP-06 | Save/deploy validation and browser defined-error projection are tested. | `tested`, browser API projection, `built`. | rendered terminal save/deploy UX. |
| OP-07 | Save/deploy phase, rollback, cleanup, and registry-truth failures are tested. | `tested`, `built`. | live deploy UX beyond source tests. |
| OP-08 | Autoplay declared error projection and busy feedback are tested. | `tested`, browser API/state proof, `built`. | live autoplay happy-path proof. |
| OP-09 | Explore busy feedback and control error projection decision are tested at UI/helper boundary. | `tested`, browser state proof. | direct-control explore failure rendered proof. |
| STUDIO-01 | Registry truth survives event publish failure. | `tested`, `built`. | none for this closeout claim. |
| STUDIO-02 | Stream recovery, hello/current clearing, and daemon identity mismatch are tested through coordinator/hook seams. | `tested`, browser state proof, `built`. | full manual reconnect scenario after top commit. |
| STUDIO-03 | Subscription cleanup, cancellation, and runtime disposal are tested. | `tested`, `built`. | external log assertion. |
| UI-01 | Setup unavailable has API projection proof. | `tested`, browser API projection. | rendered setup-unavailable flow after top commit. |
| UI-02 | Rendered Run in Game fast path observed from button to `Complete`/`Current`. | manual browser evidence, `tested`, `built`. | fallback restart rendered proof; product proof. |
| UI-03 | Diagnostics/retry/restart components are tested; stale restart carryover is repaired. | `tested`, browser component proof. | manual fallback restart browser flow after top commit. |
| UI-04 | Operation adoption after reload/reconnect is tested through adoption seams. | `tested`, browser state proof. | full manual reload proof after top commit. |
| UI-05 | Run/autoplay/explore busy states have visible feedback tests. | `tested`, browser component proof. | none for source-level claim. |
| UI-06 | Run, save/deploy, autoplay, and setup defined errors preserve declared fields. | `tested`, browser API projection. | rendered copy/diagnostic proof for every error family. |
| DEV-01 | Isolated dev startup with daemon/Vite/RPC target was recorded and reused for browser proof. | dev startup observed, `built`. | product proof. |
| DEV-02 | Root Nx orchestration remains the dev entrypoint. | `tested`, `built`, dev startup observed. | none for this closeout claim. |
| PROOF-01 | Server, app, and mod proof commands have been run across packets; final SMR-08 closeout validation reran on the original stack. | `tested`, `built`, strict OpenSpec validation, full OpenSpec validation, habitat-classified lint/habitat validation. | Graphite submission and broad product proof remain separate. |
| PROOF-02 | `studio-current` was command-generated with request markers for request `studio-run-in-game-mqhog22i-13if-2`. | `generated`. | none for this generated claim. |
| PROOF-03 | Deployed Mods target contained matching `studio-current.js`; setup row appeared and the game started. | `deployed`, `tuner-exercised`, `in-game observed`. | sibling log families if needed for broader load diagnostics. |
| PROOF-04 | Direct-control App UI and setup/start commands recorded host/port/state/result. | `tuner-exercised`. | independent non-run health probe is separate. |
| PROOF-05 | Bounded Civ7 `Scripting.log` proof recorded `[mapgen-proof]` and `[mapgen-complete]` for request `studio-run-in-game-mqhog22i-13if-2`. | `tested`, `logged`. | sibling `Modding.log`, `Database.log`, and `UI.log` ranges are not claimed. |
| PROOF-06 | Direct-control readback observed started game turn/date/map summary for the request. | `tuner-exercised`, `in-game observed`. | product proof as broad release claim. |

## Error Boundary Final Disposition

| ID | Final disposition | Earned labels | Unclaimed or bounded labels |
|---|---|---|---|
| EB-01 | Router leaves for Studio read/live/stateful surfaces are enumerated and tested. | `tested`, `built`. | none for source claim. |
| EB-02 | `Civ7TunerSession` cause preservation uses current code/tests as authority. | `tested`, `built`. | none for source claim. |
| EB-03 | Tuner client unavailable conversions retain actionable context in declared errors. | `tested`, `built`. | happy-path per-RPC tuner probes. |
| EB-04 | Handler `onError` separates declared errors from unexpected defects. | `tested`, `built`. | none for source claim. |
| EB-05 | Run in Game workflow promise boundaries map plain errors to phase-specific failures; closeout live run recorded bounded `Scripting.log` proof for the successful path. | `tested`, `built`, `logged`. | failure-path log proof is separate. |
| EB-06 | Save/deploy workflow failure projection is phase-aware and tested. | `tested`, `built`. | rendered save/deploy terminal flow. |
| EB-07 | Autoplay failures preserve declared browser projection or intentional simplification. | `tested`, browser API projection. | live autoplay happy path. |
| EB-08 | Operation runtime admission, worker, duplicate, disposed, expired, and mismatch states are tested. | `tested`, `built`. | full manual browser adoption sweep after top commit. |
| EB-09 | Run in Game browser API projection preserves code/details. | `tested`, browser API projection. | none for API claim. |
| EB-10 | Save/deploy browser API projection preserves declared code/data. | `tested`, browser API projection. | rendered save/deploy copy proof. |
| EB-11 | Setup and autoplay browser API projection preserve declared fields. | `tested`, browser API projection. | rendered setup-unavailable proof. |
| EB-12 | Event recovery coordinator/hook clears stale stream errors only on proven recovery. | `tested`, browser state proof. | full manual reconnect proof. |
| EB-13 | Explore busy/error portions are covered as browser/control boundary, with control-oRPC authority exterior. | `tested`, browser state proof. | direct-control failure rendered proof. |
| EB-14 | Dev, browser, and live labels are separated in packet records and this ledger. | closeout evidence. | product proof. |
| EB-15 | Generated/deployed outputs are evidence surfaces and were regenerated/restored by commands. | `generated`, `deployed` where claimed. | generated proof after this exact top commit. |
| EB-16 | `recipeDag.get` declared-error and defect behavior is tested under shared handler behavior. | `tested`, `built`. | none for source claim. |
| EB-17 | `studio-current.js` local bundle, deployed bundle, setup visibility, setup/start readback, and bounded `Scripting.log` markers were proven; restart fallback narrowed. | `generated`, `deployed`, `tuner-exercised`, `in-game observed`, `logged`. | sibling logs if required for broader diagnostics; final product proof. |

## Product And Graphite Labels

Product proof is not claimed by this ledger. The workstream has strong source,
browser fast-path, generated/deployed, direct-control, bounded `Scripting.log`,
and in-game evidence, but final Graphite submission and broad product/release
proof remain separate labels.

Graphite submitted is not claimed. The stack is locally committed but not
submitted from this lane because current Graphite metadata interleaves unrelated
habitat branches and needs an intentional stack ownership pass.
