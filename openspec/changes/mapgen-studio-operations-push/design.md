# Design - Studio Operations Push

## Component Role

D9 is the operation freshness component. It connects daemon operation
registries to the D8 event spine and deletes browser polling authority:

```text
Run in Game store ----\
                      operation publisher -> StudioEventHub -> studio.events.watch
Save/Deploy store ----/

Studio client
  applies operation events directly
  keeps hello/current adoption for reconnect
  no longer polls operation status for freshness
```

## Operation Event Authority

Daemon operation registries publish operation events whenever retained operation
state changes. The event payload is the canonical operation status shape already
used by `studio.operations.current`:

- `kind: "run-in-game"` uses the Run in Game operation DTO.
- `kind: "save-deploy"` uses the Save/Deploy operation DTO.
- `observedAt` is the transition observation time, normally the operation
  state's `updatedAt`.

D9 does not introduce a client-only operation model, catch-all event details
blob, Zod event schema, or operation-specific transport.

## Publisher Injection

The daemon creates the D8 `StudioEventHub` before constructing Studio engines
and passes a small publisher capability into the operation stores or engine
composition boundary.

Production daemon composition must always supply the EventHub. Any optional
publisher seam is test/composition-only and must be fenced so it cannot become a
production no-publish mode.

The store owns state transitions. The publisher owns event publication. The
bridge must be narrow enough that a transition can be recorded even if event
publication fails. A publish rejection is diagnostic output, not permission to
reopen polling or retry the transition through another path.

The falsifier is simple: removing the publisher callback or EventHub bridge from
either operation family must fail a focused publisher test.

## Client Operation Application

The D8 event hook keeps `hello` behavior: `hello` calls
`studio.operations.current` for boot/reconnect adoption. D9 adds operation event
application:

- Run in Game events set Run in Game operation state.
- Save/Deploy events set Save/Deploy operation state.
- Live pushed terminal Run in Game events are not pre-marked as toast-handled.
- Boot/reconnect adopted terminal Run in Game operations remain pre-marked to
  avoid replaying old toasts.

Client state is therefore:

- initial/reconnect truth: `studio.operations.current`;
- ongoing freshness: pushed `operation` events;
- no background operation status polling.

## Deletion Boundary

D9 deletes operation freshness and identity polling authority:

- `useOperationStatusPolls`;
- `StudioShell` callbacks used only by that polling hook;
- synthetic polling-only status-miss recovery;
- hidden Save/Deploy sleep/status completion loop;
- `useDaemonInstanceWatchdog`;
- client `studio.serverInfo` identity polling.

Manual request-response status procedures may remain if they still serve public,
diagnostic, or test contracts. They are not background freshness authority after
D9.

## Live-Game Boundary

Live-game browser polling and the daemon live-game watcher are outside D9. D10
owns publishing `live-game` events and deleting browser live-game cadence. D9
must not change live-game polling/timer behavior except to avoid coupling it to
deleted operation polling paths.

## Packet Blockers

D9 is not accepted while any of the following remain:

- operation publisher ownership is vague or split across multiple buses;
- Run in Game and Save/Deploy do not both have publisher proof obligations;
- publisher failure semantics permit polling to reappear as a retained path;
- client operation event handling lacks terminal toast parity;
- deletion targets are optional, partial, or described as temporary;
- live-game deletion leaks into D9 or D10 handoff is unnamed;
- review finds unresolved P1/P2 ambiguity.
