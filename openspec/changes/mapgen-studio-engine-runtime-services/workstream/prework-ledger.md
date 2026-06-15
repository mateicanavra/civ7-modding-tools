# D4 Prework Ledger - Studio Operation Runtime Services

Status: accepted
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed the D4 OpenSpec change was absent on the selected base.
- Traced current lifecycle ownership through `createStudioEngines`, Run in Game operation store, Save/Deploy operation store, app context, package context, and D2/D3 packets.
- Chose Autoplay as a typed immediate runtime command admitted through `StudioOperationRuntime`'s shared gate.
- Chose interrupt-and-project as the runtime disposal policy.
- Classified D4 as operation-runtime ownership only: D6 owns full public current adoption cleanup, D8/D9 own push/event transport shape, and D10 owns live-game watcher lifetime.

## Implementation Prework Required Before Code Edits

1. Re-run corpus scans over app engines, operation stores, package context/router, tests, and D3 failure modules.
2. Decide exact runtime module filenames under `packages/studio-server/src/runtime/**` while preserving the packet's ownership split.
3. Define internal ADTs and projection functions before changing app stores.
4. Define fake clock, fake worker, fake event hub, and fake runtime disposal fixtures before implementation.
5. Map each existing Run/Save phase and Autoplay outcome to a D4 internal ADT variant and D3 failure reason code.
6. Write the duplicate Run in Game fingerprint oracle before code edits; D4 preserves idempotency and moves ownership into `StudioOperationRuntime`.
7. Verify D2.5 public DTO schemas and D3 failure schemas are the only public projection targets.
8. Plan deletion of app-local lifecycle ownership before code edits; do not leave `createStudioEngines` as an alternate queue/registry/identity owner.
9. Write package handler integration and app composition-only tests before deleting the context engine seam.
10. Define terminal TTL tombstone horizon and active-record prune guard before implementation.

## Peer-Agent Prework Lanes

- **Runtime corpus scout:** enumerate lifecycle state owners and target runtime owners.
- **Effect lifecycle scout:** review Layer/Scope/Ref/Semaphore/Queue/fiber/disposal design.
- **Testing oracle scout:** map each runtime invariant to package/app tests and negative searches.
- **Black-ice reviewer:** search for dual authority, non-interrupt disposal, Autoplay ambiguity, and proof inflation.

## Resolved Black-Ice Decisions

- Autoplay is a typed immediate runtime command through the shared mutation gate.
- Disposal policy defaults to interrupt-and-project `runtime-disposed`.
- Public DTOs are projections, not internal mutation state.
- D4 implementation cannot close with app-local queue, registry, TTL, identity, current projection, or disposal ownership.
- Package handler tests must use a real managed runtime path with poison app lifecycle callbacks; mocked app engine callbacks do not prove D4.
- App operation-state tests that validate `createRunInGameOperationStore`, `createMapConfigSaveDeployOperationStore`, mutable `Map` storage, or public DTO patch helpers are deletion/rewrite targets, not preservation gates.
- Terminal TTL expiry projects D3 `OperationExpired` before physical pruning; active records are not pruned as stale terminal records.
- Run in Game duplicate request fingerprint idempotency is preserved and owned by `StudioOperationRuntime`.
- App code is bounded to enumerated leaf adapter ports; it cannot own phase transitions, workflow failure classification, request fingerprints, operation conflict checks, registry callbacks, or background workers.

## Remaining Human Decisions

None for packet acceptance. Implementation choices are bounded by this packet and must be resolved from code evidence before edits.
