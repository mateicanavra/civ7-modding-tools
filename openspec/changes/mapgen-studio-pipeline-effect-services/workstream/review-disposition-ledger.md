# D5 Review Disposition Ledger

Status: accepted
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D5-R1 | Hardening/prework | Required fresh reviews and entrance proof were still open. | P1 | accepted | Fresh review lanes ran; final gates passed and closure evidence is recorded in `phase-record.md` and `closure-checklist.md`. |
| D5-R2 | Hardening/prework | Implementation prework listed transition commands, typed tables, fixture shape, raw-hit classification, deploy baseline, and app-helper deletion plan as implementer-discovered work. | P2 | accepted | Repaired in `prework-ledger.md` with module map, transition command table, typed tables, fixture plan, raw-field classification, deploy baseline, and app-helper deletion plan. |
| D5-R3 | Hardening/prework | `runInGame.start` kept an either/or between closed DTO and deep guard. | P2 | accepted | Repaired in `design.md` and OpenSpec scenario: D5 closes the request through D2.5 TypeBox schemas and rejects raw tunnel fields by parser tests. |
| D5-R4 | Hardening/prework | Target module topology allowed alternate filenames if ownership stayed obvious. | P2 | accepted | Repaired in `design.md`: filenames and exported service names are the D5 implementation contract. |
| D5-R5 | Testing/parity | D4 integration used a fake runtime and would miss real admission/current/events/disposal/idempotency behavior. | P2 | accepted | Repaired in `testing-ledger.md`: real D4 `StudioOperationRuntime` with fake ports is required for managed-runtime integration tests. |
| D5-R6 | Testing/parity | Run in Game state-machine adequacy lacked explicit phase/proof falsifiers. | P2 | accepted | Repaired in `testing-ledger.md`: phase/proof matrix covers reload-needed, blocked, uncertain, restart branches, reload boundary, marker/hash/request/setup mismatches, exact-authorship links, disposal, and complete. |
| D5-R7 | Testing/parity | Raw-control guard scenario was scoped to touched routes, weakening corpus-wide public mutation protection. | P2 | accepted | Repaired in OpenSpec scenario: all public Studio/control-oRPC mutation inputs in the D5 corpus are covered or require explicit disposition. |
| D5-R8 | Workflow/lifecycle | D5 did not specify interruption-safe cleanup/finalizers for materialization, file writes, deploy, log/proof waits, rollback, and disposal. | P1 | accepted | Repaired in `design.md` with Effect resource-lifetime table and runtime-disposal semantics; `testing-ledger.md` adds interruption/disposal tests. |
| D5-R9 | Workflow/lifecycle | Direct-control import exception for bounded leaf adapter modules conflicted with the shared-session invariant. | P2 | accepted | Repaired in `proposal.md` and `game-wire-ledger.md`: no app direct-control game-call imports; game calls route through `Civ7WorkflowControl`. |
| D5-R10 | Game-wire/TypeScript | `Civ7WorkflowControl` appeared as an allowed owner, blurring constructor ownership and facade ownership for D12. | P2 | accepted | Repaired in `game-wire-ledger.md`: constructor owners and shared-session facades are separate categories. |
| D5-R11 | Game-wire/TypeScript | OpenSpec raw-tunnel scenario omitted `command` and `rawJs`. | P2 | accepted | Repaired in OpenSpec scenario to include `command` and `rawJs`. |
| D5-R12 | Workflow/lifecycle repair review | Run in Game ordered program still emitted terminal D4 completion before cleanup finalizers. | P1 | accepted | Repaired in `design.md`: runtime/exact-authorship proof is non-terminal, cleanup/regeneration runs before terminal complete, and cleanup failure projects typed/contained failure instead of success. |
| D5-R13 | Game-wire/black-ice repair review | Raw-field guard scope still depended on an unenumerated D5 corpus, and negative-search gates omitted literal `command`/`rawJs` coverage. | P2 | accepted | Repaired in `workflow-corpus-ledger.md` with explicit Studio mutation and control-oRPC `risk: "mutation"` corpus; repaired proposal/testing/game-wire negative gates to include `command` and `rawJs` coverage. |

## Repair Review Closure

Fresh repair review cleared D5-R2 through D5-R13. D5-R1 is closed by final verification and closure evidence before commit.

Accepted repair-review agents:

- Testing/parity: accepted real D4 managed-runtime integration and Run in Game phase/proof matrix.
- Lifecycle: accepted proof-before-cleanup-before-terminal-complete ordering.
- Game-wire/TypeScript: accepted explicit mutation guard corpus and full raw-field search coverage.
- Hardening/black-ice: accepted D5-R2 through D5-R10 after repair; follow-up D5-R13 was accepted by the narrow corpus re-check.
