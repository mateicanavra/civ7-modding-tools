# D4 Review Disposition Ledger

Status: accepted
Date: 2026-06-14

| ID | Lane | Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- | --- | --- |
| D4-R1 | runtime ownership review | Proposal disposal wording still allowed drain/uncertain despite the design choosing interrupt-and-project. | P2 | accepted | Proposal now states D4 interrupts in-flight workers on `ManagedRuntime` disposal and projects `runtime-disposed` with D3 `RuntimeDisposed` data. |
| D4-R2 | runtime ownership review | Runtime-owned operation event hooks were in design/ledgers but not in the OpenSpec requirement. | P2 | accepted | Spec now requires transition events to originate from `StudioOperationRuntime` state transitions, use runtime projections, contain publisher failure, and leave D8/D9 transport shape ownership intact. |
| D4-R3 | Effect/lifecycle review | Runtime lifetime allowed `Layer.effect`, which could leave workers request-scoped or without runtime finalizers. | P1 | accepted | Runtime service is now required to be `Layer.scoped`; `Layer.effect` is limited to pure helper sublayers with no fibers, finalizers, mutable lifecycle state, or disposal behavior. |
| D4-R4 | Effect/lifecycle review | Disposal wording still implied drain/default alternatives. | P1 | accepted | D4 now states one disposal policy across proposal/design/spec: `ManagedRuntime` disposal interrupts workers and projects `runtime-disposed`; post-disposal admission fails with D3 `RuntimeDisposed`. |
| D4-R5 | testing/parity review | Future implementation test commands preserved old app operation-store tests that validate app-owned stores. | P1 | accepted | App operation-state tests are now deletion/rewrite targets; closure commands use runtime/composition tests and require poison-callback handler proof. |
| D4-R6 | testing/parity review | Disposal tests missed post-disposal admission. | P2 | accepted | Spec and testing ledger now require Run in Game, Save/Deploy, and Autoplay post-disposal starts to fail with `RuntimeDisposed` without registry entry, accepted event, or leaf adapter call. |
| D4-R7 | TypeScript/schema review | Export privacy covered only the public root. | P1 | accepted | Export privacy now covers root, declared subpaths, generated `.d.ts`, package `exports`, `@civ7/studio-server/runtime`, and source-runtime import negative tests. |
| D4-R8 | TypeScript/schema review | App-local public DTO authorities could survive D4 projection closure. | P2 | accepted | D4 now gates app feature status helpers on package-derived TypeBox/projection contracts or removal as part of D2.5/D4 implementation closeout. |
| D4-R9 | TypeScript/schema review | Partial-patch state authority ban lacked executable search and transition oracle. | P2 | accepted | Negative searches now cover `Partial<`, patch/update helpers, spread-style state merges, and transition tests must prove mutation occurs through closed ADT transition commands. |
| D4-R10 | hardening/black-ice review | Parent frame still allowed interrupted-or-drained disposal outcomes that contradicted D4. | P2 | accepted | Frame now matches D4: scoped runtime, interrupt-and-project disposal, D3 `RuntimeDisposed`, and post-disposal admission rejection without registry/event/leaf calls. |
| D4-R11 | hardening/black-ice review | Duplicate Run in Game fingerprint behavior was left implementation-selected. | P2 | accepted | Packet now preserves duplicate fingerprint idempotency as runtime-owned behavior with table tests and app-owner negative searches. |
| D4-R12 | hardening/black-ice review | “Leaf workflow bodies” was broad enough to preserve app-owned phase/failure/worker lifecycle. | P2 | accepted | Packet now enumerates app leaf adapter ports and forbids app adapters from owning registry updates, phase transitions, workflow failure classification, fingerprints, conflicts, or background workers. |

## Required Fresh Reviews

- Runtime-corpus / ownership review: accepted after D4-R1/D4-R2 repairs.
- Effect/lifecycle alignment review: accepted after D4-R3/D4-R4 repairs.
- TypeScript/schema projection review: accepted after D4-R7/D4-R8/D4-R9 repairs.
- Testing/parity review: accepted after D4-R5/D4-R6 repairs.
- Hardening/prework philosophy review: accepted after D4-R10/D4-R11/D4-R12 repairs.
- Black-ice disambiguation review: accepted after D4-R10/D4-R11/D4-R12 repairs.
- Adversarial residue/orphan review: accepted through runtime ownership, TypeScript/schema, and hardening lanes; no unresolved P1/P2 findings remain.
