# D9 Prework Ledger - Studio Operations Push

Status: draft pending review
Date: 2026-06-14

## Packet-Authoring Prework Completed

- Confirmed D0-D8 are accepted in the packet train.
- Classified the existing `mapgen-studio-operations-push` packet as historical
  implementation-closure notes requiring D9 repair.
- Inspected D9-D10 frame sections, accepted D8 event hub packet, and current
  operation publisher/deletion surfaces.
- Started fresh peer prework/review lanes for operation surfaces,
  testing/vendor-alignment, and hardening/black-ice.

## Implementation-Shaping Prework Completed

| Surface | Decision |
| --- | --- |
| Operation freshness owner | pushed `operation` events through D8 `StudioEventHub` |
| Reconnect owner | D8 `hello` plus D6 `studio.operations.current` adoption |
| Run in Game publisher | daemon operation store/engine transition callback |
| Save&Deploy publisher | daemon operation store/engine transition callback |
| Publisher failure | diagnostic only; transition remains recorded; no polling retained path |
| Optional publisher seam | test/non-daemon only; production daemon composition supplies EventHub |
| Client operation application | `useStudioEvents` -> `applyStudioOperationEvent` |
| Terminal toast parity | adopted terminal is marked handled; live pushed terminal is not pre-handled |
| Deletion target | operation polling/watchdog authority, hidden Save&Deploy status loop |
| Protected downstream | D10 live-game cadence and event publishing |

## Negative Search Set

```bash
rg -n "useOperationStatusPolls|useDaemonInstanceWatchdog|fetchMapConfigSaveDeployStatus|operation-status-missing|status-poll" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/test -S
rg -n "studio\\.serverInfo\\(\\{|serverInfo\\(\\{|serverInfo" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "setTimeout\\(|setInterval\\(" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
rg -n "EventSource|text/event-stream|/events|/sse|operation.*stream" apps/mapgen-studio/src packages/studio-server/src -S
rg -n "localStorage|request-id replay|requestId replay" apps/mapgen-studio/src/app apps/mapgen-studio/src/features -S
```

Hits are blockers unless classified as D10 live-game cadence, protected
non-event storage owner, public/manual diagnostic status contract, or test
fixture text that is intentionally proving deletion.

## Implementation Prework Required Before Code Edits

1. Re-run the negative search set on the selected implementation base.
2. Identify exact store/engine seams where both operation families publish
   transitions without duplicating state-machine logic.
3. Prove production daemon construction supplies EventHub and no no-publisher
   production path exists.
4. Define publisher failure diagnostics and prove they do not start polling.
5. Partition public/manual status endpoint users from background freshness
   polling users before deleting call sites.
6. Confirm D10 live-game polling/timer symbols are protected and not deleted in
   D9.

## Peer-Agent Prework Lanes

- **Operation surface scout:** enumerate both operation families and every
  deletion target.
- **Testing/vendor scout:** verify publisher falsification, client event
  application, toast parity, and negative-search strategy.
- **Hardening/black-ice scout:** remove hidden retained polling paths, stale
  closure language, and split identity authority.
- **Downstream scout:** verify D10/D12 handoffs and protected live-game scope.

## Resolved Black-Ice Decisions

- D9 must delete operation polling/watchdog authority; retention is not a
  compatibility mode.
- D9 does not delete live-game browser cadence; D10 owns that deletion.
- Publisher failure is diagnostic, not a trigger to restart polling.
- Public/manual status procedures are not the same as background freshness
  authority and require separate closeout proof.

## Remaining Human Decisions

None for packet acceptance. Implementation must prove any public/manual status
endpoint deletion separately if it chooses to remove those procedures.
