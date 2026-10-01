# Civ7 Game Door Invariant

## Invariant

**ID:** `civ7-live/CIV7-GAME-DOOR`

**Owners:** `resources/civ7-tuner` owns the provider-neutral capability;
`resources/civ7-tuner/providers/local-socket` owns concrete socket acquisition,
epochs, interruption, and release; each qualified app owns provider selection
and one ready-capability binding for its process.

**Scope:** CLI and MapGen Studio app composition, `civ7-control`, `civ7-play`,
MapGen-runs, and their CLI/API projections.

**Rule:** Every product call into a running Civ7 process follows one direction:

```text
qualified app
  -> acquire one selected Tuner provider scope
  -> bind its ready capability into the civ7-control client
  -> bind play and MapGen-runs through public clients where selected
  -> supply only bound public capabilities to CLI/API projections
  -> drain admitted work and release the provider during app shutdown
```

Raw Tuner health, epochs, dispatch evidence, and transport failures remain
resource/provider facts. Foundational `{app,game,map,ui}` interpretation belongs
to control. Actor-facing decisions and no-repeat reconciliation belong to play;
run correlation and terminal operation outcomes belong to MapGen-runs.

## Forbids

- Tuner/provider acquisition inside a service, API plugin, CLI topic, router
  leaf, browser code, or ordinary caller.
- Importing a service-private router, context, implementation, or contract leaf.
- Exposing a service router directly over HTTP instead of projecting a bound
  client through API-owned caller contracts.
- A direct-control facade, caller-local socket, alternate transport, or second
  session owner retained as compatibility.
- Treating provider dispatch as semantic gameplay or run success.

## Detection And Proof

The accepted destination is proved by disjoint owners:

- local-socket provider lifecycle and collaboration proof closes exact
  acquisition, concurrency, interruption, epoch, and release behavior;
- `civ7-control/test/execution/root.test.ts` closes once-only binding,
  request isolation, and resource-fact interpretation;
- `civ7-play/test/execution/root.test.ts` closes public-client delegation and
  actor-facing reconciliation;
- qualified app assembly and host suites close provider selection, client
  binding, mounting, process shutdown, and drain order;
- API projection suites prove caller routes delegate bound clients without
  private service or provider imports.

`packages/civ7-direct-control`, `packages/studio-server`, and their session-door
tests are frozen migration evidence. They may remain temporarily only while the
matching target proof is absent; they do not authorize new imports or behavior.

## Remediation

When a second acquisition, transport, session, or service-private import
appears, remove it rather than wrap it. Put provider-neutral lifecycle in the
resource contract, concrete socket behavior in the selected provider, Civ7
meaning in control or play, caller translation in a plugin, and binding or host
lifetime in the app. A genuinely new ownership mode must first change the
accepted capability-realization model and its consumer/lifecycle evidence.

## Rationale

One physical provider scope does not imply one semantic owner. Keeping the
door singular at app composition lets resources, control, play, run operations,
and projections each retain their own facts without duplicating the wire or
turning a process singleton into a facade-shaped architecture.
