# D12 OpenSpec, Information, And Validation Investigation

## Verdict

D12 is not accepted for implementation. The packet exists in the required file
shape and passes OpenSpec syntax validation, but the current disk state still
asks implementation to resolve product/domain decisions that D12 must settle:
public-surface handling, exact write set, inherited D1/D3/D7 state contracts,
selector semantics, affected-target result variants, non-claim identifiers, and
validation oracles.

No TypeScript source review or source implementation was performed.

## Skill And Source Read Register

| Source | Read status | Use in this lane |
| --- | --- | --- |
| Domain Design skill and all `references/` files | read in full | Single authority, boundary ambiguity, inherited terminology checks. |
| Information Design skill and all `references/` files | read in full | Multi-artifact coherence, scent, one-location truth, reader task fit. |
| Civ7 OpenSpec Workstream skill plus artifact contracts, validation, review lanes, phase loop, source map, and relevant assets | read in full | Packet artifact contract, ledger requirements, closure gates, review-loop semantics. |
| Testing Design skill and reference set | read in full | Oracle-first validation, falsification, risk-proportional gate design. |
| Solution Design skill and relevant references | read in full | Stop condition for implementation-time trade-off delegation. |
| Root `AGENTS.md` | read | Repo workflow, absolute `apply_patch`, OpenSpec/Graphite hygiene. |
| D12 source packet | read | Source domino contract and stop conditions. |
| D12 OpenSpec packet on disk | read | Review target. |
| Remediation frame, context, packet index | read | Required artifact set, acceptance semantics, path fixture policy. |
| Accepted upstream D0/D1/D3/D7 packets | sampled by relevant contract lines | Upstream contracts D12 must consume. |
| Current verify tests | read | Present behavior evidence and validation surface. |

Commands run:

- `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` -> passed.
- `git diff --check` -> passed.
- `git status --short --branch` -> branch `codex/d12-verify-handoff-packet`; unrelated dirty state observed for `domino-D12-typescript-state-investigation.md` and left untouched.

## Artifact-Structure Defects

| ID | Severity | Defect | Evidence | Repair demand |
| --- | --- | --- | --- | --- |
| AS-1 | P1 | Phase state is stale and contradicts the actual branch/context. | `git status` reports `codex/d12-verify-handoff-packet`; `phase-record.md:8` says `codex/deep-habitat-openspec-remediation`; `context.md:16` still names the D11 branch. | Update D12 phase record and shared context fixture before rereview, or explicitly record why the shared fixture is intentionally stale and name the current D12 branch locally. |
| AS-2 | P1 | D12 artifacts use absolute durable paths instead of the remediation context variables. | `context.md:3-5` and `context.md:235-244` require variables for durable packet references; `proposal.md:14-19` and `phase-record.md:7-9` repeat the full worktree path. | Replace durable artifact paths with `$REMEDIATION_DIR`, `$PHASE2_PACKET_DIR`, and `$OPENSPEC_CHANGES` references; keep absolute paths only in tool/run instructions. |
| AS-3 | P1 | The phase/control artifacts are present but do not satisfy the OpenSpec workstream contract. | Artifact contract requires write set, protected paths, owners, validation proof, downstream disposition, and compaction state; D12 `phase-record.md:22-28` lists commands only, `downstream-realignment-ledger.md:5-9` leaves every row pending, and `closure-checklist.md:5-20` is unchecked. | Fill phase record, downstream ledger, review ledger, and closure checklist with concrete state, not placeholders. |
| AS-4 | P2 | The review ledger records the per-domino gate as blocking but the rest of the packet still reads as if artifact preparation is complete. | `review-disposition-ledger.md:10` says P1 blocking pending review; `proposal.md:5-9` says the packet resolves scope, owner, impact, gates, realignment, and stop conditions. | Make proposal/design/phase record agree that D12 is in design review and not accepted; after repair, ledger must record every lane finding and disposition. |

## Spec Requirement Coverage Defects

| ID | Severity | Defect | Evidence | Repair demand |
| --- | --- | --- | --- | --- |
| SC-1 | P1 | Spec delta is too broad to implement D12 without local design choices. | Source packet requires proof/receipt class, check summary, selected base, affected target plan/result/reason, bounded streams, cache state, git/resource post-state, and non-claims (`D12-proof-handoff-verify-command.md:32-41`). D12 spec only says records consumed results and non-claims (`spec.md:5-13`). | Expand `specs/habitat-harness/spec.md` into normative requirements for every D12 receipt field family and each state transition. |
| SC-2 | P1 | D12 does not import D1's closed `VerifyReceipt` semantics. | D1 says target meaning is `VerifyReceipt`; `VerifyProof` is legacy public name, affected can be `executed`, `skipped`, or `failed`, with state-specific constraints (`D1 design.md:183-185`). D12 design only says "replace proof language" (`design.md:24-26`) and the spec never names `VerifyReceipt`. | Add a D12 requirement that names `VerifyReceipt` as target meaning, classifies legacy public names through D0 handling, and forbids impossible affected states. |
| SC-3 | P1 | D12 does not specify D7 consumed projection states. | D7 publishes `VerifyCheckSummaryProjection`, permits affected execution only when check has no enforced failures/refusals, and supplies skipped-affected reasons for failed/refused states (`D7 spec.md:189-202`). D12 spec only says "upstream check is blocked" (`spec.md:11-13`). | Add scenarios for check pass, check fail, selector refusal, dependency refusal, diagnostic refusal, baseline refusal, and protected-zone refusal, each with expected D12 receipt behavior. |
| SC-4 | P1 | D12 does not specify D3 graph refusal and target-plan consumption. | D3 says verify consumes target plan availability and graph-read refusal states while D12 owns schema/wording (`D3 proposal.md:93-103`). D12 spec has no graph-read refusal or target-plan requirement. | Add D12 requirements for selected base, target plan, unavailable target, dependency-resolution failure, and graph-read refusal recording. |
| SC-5 | P2 | D12 omits selector-state resolution from the spec. | Source packet requires selector state `none`, `inherited`, `unsupported`, or `requested` (`D12 source.md:60-63`) and stops on `{}`/absent selector fields (`D12 source.md:145-147`). D12 spec is silent. | Add a selector-state requirement with closed variants and scenarios for no selectors, inherited check selectors, unsupported verify selectors, and future requested selectors only when a public contract exists. |

## Task Executability Defects

| ID | Severity | Defect | Evidence | Repair demand |
| --- | --- | --- | --- | --- |
| TE-1 | P1 | Implementation tasks are design headings, not executable slices. | `tasks.md:14-16` says define assembler, replace language, specify streams/post-state/skips/non-claims. These do not name files, state constructors, tests, D0 rows, or expected deltas. | Rewrite tasks as ordered implementation slices with concrete files, preconditions, public-surface handling, tests, and validation evidence per slice. |
| TE-2 | P1 | Public compatibility remains unresolved. | `proposal.md:65` says JSON/human output may require preservation or versioning; D0 requires command JSON, human output, exports, scripts, targets, and docs rows before public change (`D0 design.md:219-237`, `D0 design.md:265-285`). | Add a D0 surface citation table for every D12-touched command JSON, human output, export, docs example, script, and target, with preserve/version/facade/remove disposition before source tasks. |
| TE-3 | P1 | Write set/protected paths are deferred to implementation. | `proposal.md:52-53` points to design for expected write set, but `design.md:45-53` only says executor must have a write set; `tasks.md:9` asks implementation to record it. | D12 packet owner must record approved source write set and protected paths before implementation tasks. |
| TE-4 | P2 | Review tasks are sequenced after implementation. | `tasks.md` puts implementation in section 2 and review in section 4, while packet index says per-domino review is a design-time gate before implementation (`packet-index.md:37-49`). | Move review/disposition before implementation authorization and make source tasks blocked until no unresolved P1/P2 remains. |

## Validation Oracle Matrix

| Gate | Current D12 state | Required oracle | Finding |
| --- | --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` | Listed in proposal/tasks/phase record; run in this lane and passed. | Proves OpenSpec syntax and change shape only. Does not prove spec adequacy or task readiness. | Keep as design-time shape gate with this evidence boundary. |
| `bun run openspec:validate` | Listed, not run in this lane. | Whole OpenSpec corpus validates after D12 repairs. | Must be design-time gate before packet acceptance. |
| `git diff --check` | Run in this lane and passed. | Whitespace/conflict marker check only. | Keep as hygiene gate, not behavior proof. |
| `bun run --cwd tools/habitat test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts` | Listed as validation; not run in this lane because no source implementation is authorized. | Later implementation behavior gate: receipt field states, check-blocked skip, affected executed/failed, bounded streams, cache state, non-claims. | D12 must split current tests from required future tests and name expected assertions. |
| `bun run habitat verify --help` | Listed. | Later CLI surface smoke check only; proves help renders. | Insufficient as receipt behavior proof. Add `--json` and bad-case gates from source packet. |
| `bun run habitat verify --json` | Required by source packet (`D12 source.md:125-126`) but omitted from D12 current gate list. | Later behavior gate after D3/D7 live projections: emits bounded receipt with selected base, check summary, affected state, post-state, and non-claims. | Add to implementation validation with exact expected status/evidence boundary. |
| Injected bad delegated command | Required by source packet (`D12 source.md:131-132`) but omitted from D12 tasks/spec. | Falsifies false-green behavior: failing delegated command yields failing receipt with bounded streams. | Add bad-case gate and corresponding test task. |
| D1 validation oracle fields | D12 does not require expected status, actual status, oracle, bad case, cache/freshness stance, and non-claims. | D1 requires each gate record those fields (`D1 design.md:211-213`). | Add validation table to phase record/tasks before acceptance. |

## Wording Audit Findings

| ID | Severity | Finding | Evidence | Repair demand |
| --- | --- | --- | --- | --- |
| WA-1 | P1 | Current D12 contains prohibited reduced-standard maturity language in normative artifacts. | `proposal.md:7`, `review-disposition-ledger.md:5-9`, and `phase-record.md:14` use a prohibited artifact-maturity noun; `design.md:42-43` uses the prohibited size-comparison phrase. | Replace those phrases with exact packet state and exact command-result terminology. |
| WA-2 | P2 | The packet still carries legacy proof names in tests without D12 disposition. | Current tests import `createVerifyProof` and assert `VerifyProof` behavior (`verify-proof.test.ts:22-26`, `habitat-commands.test.ts:156-174`). D1 treats this as legacy public naming unless D0 preserves, versions, or wraps it (`D1 design.md:183-185`). | D12 must decide whether implementation preserves legacy public schema name, wraps it, or versions it; tests must be planned accordingly. |
| WA-3 | P2 | Current test fixture has misleading non-claim wording. | `habitat-commands.test.ts:36` and `habitat-commands.test.ts:174` assert `CI execution proof`, which reads as a claim, not a limit. | D12 must require canonical non-claim identifiers from D1 and forbid affirmative proof phrasing in verify receipt output. |

## P1/P2/P3 Findings Against Current D12 Disk State

### P1 Findings

1. D12 spec delta is not implementation-ready. It omits required field families, closed states, D1 non-claims, D3 graph refusal/target-plan facts, D7 skipped-affected reasons, selector variants, and bad-case behavior.
2. D12 tasks leave product/domain decisions to implementation: public-surface disposition, write set, protected paths, schema/versioning, and exact receipt state model.
3. D12 review state is blocking by its own ledger and packet index; implementation cannot proceed while `review-disposition-ledger.md:10` remains pending.
4. D12 validation is command-listing, not oracle-based proof. Gates do not distinguish design-time OpenSpec/diff checks from later behavior tests.
5. D12 phase state is stale for branch/context and therefore not compaction-safe.

### P2 Findings

1. D12 durable artifacts duplicate absolute paths rather than using the context variable system.
2. D12 proposal/design overstate resolution relative to the pending review and pending downstream ledger.
3. Downstream realignment is all pending and does not say what D14 may consume if D12 contract changes.
4. Current verify tests reveal legacy naming and non-claim wording that D12 must disposition before implementation planning.

### P3 Findings

1. The current `proposal.md` authority section mixes direct user decision, frame, source packet, skills, and code evidence without ranking them. It should mirror the remediation frame authority order.
2. `closure-checklist.md` separates design readiness and later implementation closure, which is useful, but it needs evidence slots for exact commands and results.

## Exact Repair Demands

1. Replace absolute durable references in D12 artifacts with remediation context variables and update branch/worktree state.
2. Add a D12 design table mapping every source-packet contract field to its owner, upstream source, receipt field/state, D0 public-surface disposition, validation oracle, and non-claim.
3. Expand `specs/habitat-harness/spec.md` to cover:
   - `VerifyReceipt` target meaning and legacy public-name handling;
   - selected base and requested base;
   - consumed `CheckReport` summary and D7 verify-check projection;
   - affected target `executed`, `skipped`, and `failed` states with state-specific required/forbidden fields;
   - D3 target plan availability, dependency-resolution failure, and graph-read refusal;
   - selector-state variants;
   - bounded stdout/stderr and task-local cache state;
   - git/resource/Graphite post-state as observations with explicit non-claims;
   - failing delegated command scenario.
4. Rewrite `tasks.md` so each task is an implementation slice with files, tests, public-surface disposition, and acceptance evidence.
5. Move review/disposition tasks before implementation authorization.
6. Fill phase record with write set, protected paths, owners, forbidden owners, validation oracle table, dirty-state ownership, and current branch.
7. Replace review ledger placeholder rows with lane-specific findings and dispositions after this and other D12 reviews.
8. Fill downstream ledger with D14, D0, docs/examples, tests, command fixtures, and packet-index impacts plus patch/no-patch evidence.
9. Remove reduced-standard wording from D12 artifacts or confine it to explicit forbidden-language audit references.
10. Add design-time and implementation-time validation sections with separate evidence boundaries.

## Acceptance Bar For This Lane

D12 can pass this OpenSpec/information/testing lane only when:

- proposal, design, tasks, spec delta, phase record, review ledger, downstream ledger, and closure checklist agree on status and authority;
- no artifact leaves public-surface compatibility, naming, state variants, owner boundaries, write set, or validation oracles for implementation to decide;
- accepted P1/P2 findings are repaired or rejected with source evidence;
- design-time gates and later behavior gates are separated and each gate states command, expected status, actual status slot, oracle, bad case when applicable, cache/freshness stance, and non-claims;
- reduced-standard wording is absent from target artifacts;
- downstream D14 and packet-index implications are recorded.

Until those repairs are complete and rereview closes with no unresolved P1/P2,
D12 remains blocked and no source implementation should proceed.
