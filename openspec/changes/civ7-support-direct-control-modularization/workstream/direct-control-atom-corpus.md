# Direct-Control Atom Corpus

This ledger is intentionally incomplete until the direct-control atom agent
report is merged. Do not edit direct-control source against partial rows.

| Atom Candidate | Current Owner | Proposed Owner | Existing Evidence | Runtime Proof | Status |
|---|---|---|---|---|---|
| Tuner socket/session/framing | `packages/civ7-direct-control/src/index.ts` and tests | named session/framing modules | existing direct-control tests | not needed for pure move if tests pass | Inventory pending. |
| Play notification HUD view | `index.ts` | notification/play-view module | CLI notification tests | required only for behavior changes | Inventory pending. |
| Notification dismissal verification | `index.ts` | notification/dismissal module | CLI exact/queue dismissal tests | required for behavior changes | Inventory pending. |
| Ready unit/city views | `index.ts` | ready-view modules | CLI ready-unit/ready-city tests | required for behavior changes | Inventory pending. |
| Operation validation/send/postconditions | `index.ts` | operation modules | CLI operation/unit-target tests | required for mutation behavior changes | Inventory pending. |
| Tactical/progression/destination reads | `index.ts` | read modules | CLI read tests | read-only live proof when claiming runtime behavior | Inventory pending. |
| Schemas/types/constants | `index.ts` | schema/type modules | TypeScript/checks | not runtime proof | Inventory pending. |
