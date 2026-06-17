# Phase Record: Studio Event Recovery And Operation Adoption

Status: implemented and locally verified.

Normative packet: `docs/projects/studio-runtime-simplification/workstream/studio-effect-state-machine-recovery/PACKET-TRAIN.md#smr-04---event-recovery-and-operation-adoption`.

Priority rows: STUDIO-01 through STUDIO-03, UI-03 through UI-05, EB-12, EB-13 busy/error portions.

## Frame

SMR-04 treats browser event recovery as a state-machine problem, not as a visual
banner cleanup. Event-stream errors are local browser recovery diagnostics that
may be cleared only by a later proven stream/current/live recovery event. They
must not erase or mask operation failures such as `Civ7 setup cannot see
{swooper-maps}/maps/studio-current.js`.

## Implementation

- Added `apps/mapgen-studio/src/app/studioEventRecovery.ts` as the pure recovery
  seam for stream-error formatting, daemon identity comparison, recovery-event
  classification, and shared busy-gate messages.
- Updated `useStudioEvents` so stream errors are source-tracked, later
  hello/current, operation, or live-game recovery clears only that stream error,
  and hello/current daemon identity mismatch is visible without server contract
  expansion.
- Updated current-operation adoption so delayed `studio.operations.current`
  responses cannot replace newer local terminal diagnostics with empty or older
  daemon state, while newer active daemon operations still adopt.
- Added visible shared busy feedback for Game and World controls and replaced
  silent Autoplay/Explore busy returns with toasts.

## Review Disposition

Read-only SMR-04 reviewer findings:

- P1 stream recovery never cleared stale local error: accepted and repaired by
  source-tracked event recovery clearing.
- P1 adoption could erase newer local terminal diagnostics: accepted and
  repaired by time-aware adoption selection and adoption-time local getters.
- P2 daemon identity mismatch not explicit: accepted and repaired with existing
  hello/current identity comparison; no event contract expansion.
- P2 busy gates silent for disabled/in-flight controls: accepted and repaired
  with visible Busy labels and toasts for active Autoplay/Explore handlers.
- P3 deterministic recovery seam absent: accepted and repaired by
  `studioEventRecovery.ts` plus focused tests.

No accepted P1/P2 findings remain open in this packet.

## Verification

- `bun run --cwd apps/mapgen-studio test test/studioEvents/operationAdoption.test.ts`
  passed: 18 tests.
- `bun run --cwd apps/mapgen-studio test test/runInGame/GameConsole.test.tsx test/runInGame/AppFooter.test.tsx`
  passed: 21 tests.
- `bun run nx run mapgen-studio:check --outputStyle=static` passed.
- `bun run nx run mapgen-studio:test --outputStyle=static` passed: 51 files,
  257 tests.
- `bun run nx run mapgen-studio:build:vite --outputStyle=static` passed.
- `bun run openspec -- validate studio-event-recovery-and-adoption --strict`
  passed.
- `bun run openspec:validate` passed: 194 items.
- `bun run lint` passed with the existing doc-ambiguity advisory only.

## Proof Labels

Claimed in this packet after pending gates pass: tested, browser state proof,
built, OpenSpec validation.

Not claimed: live Civ7 proof, deployed proof, tuner-exercised proof, logged
proof, in-game observation, product proof.

The reported `{swooper-maps}/maps/studio-current.js` setup-visibility failure is
preserved as operation diagnostic state and remains a priority live-proof blocker
for `studio-live-civ7-proof-gates`; this packet does not claim the file is
generated, deployed, visible to Civ7 setup, or in-game observed.
