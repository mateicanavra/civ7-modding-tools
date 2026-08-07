# Civ7 Game Door Invariant

## Invariant

**ID:** `civ7-live/CIV7-GAME-DOOR`

**Owners:** `resources/civ7-tuner` owns the provider-neutral capability;
`resources/civ7-tuner/providers/local-socket` owns concrete socket acquisition,
state discovery, epochs, request/response facts, interruption, and release;
`services/civ7-controller` owns the public contract and typed native operations
executed inside the controller mod; each qualified host app owns provider
selection and one controller-client transport binding for its process.

**Scope:** CLI and MapGen Studio app composition, `services/civ7-controller`,
`services/civ7-play`, MapGen-runs, and their CLI/API projections.

**Rule:** Every product call into a running Civ7 process follows one direction:

```text
qualified app
  -> acquire one selected Tuner provider scope
  -> discover and verify the realm-local controller ingress
  -> bind the controller's public client through a narrow typed-envelope transport
  -> supply that public controller client to Play and MapGen-runs where selected
  -> supply only bound public capabilities to CLI/API projections
  -> drain admitted work and release the provider during app shutdown
```

Raw Tuner health, epochs, dispatch evidence, and transport failures remain
resource/provider facts. Realm identity and mechanical `{shell,game,map,ui}`
operations belong to the controller running inside Civ7. Actor-facing decisions
and no-repeat reconciliation belong to Play; run correlation and terminal
operation outcomes belong to MapGen-runs. The host binding carries an unchanged
typed procedure envelope; it never generates a mature operation body.

Raw JavaScript uses a separate, explicit app-owned diagnostic adapter. Window
capture is likewise generic diagnostic or app evidence and never enters this
controller-client dependency chain as unnamed controller or Play authority.

## Forbids

- Tuner/provider acquisition inside a service, API plugin, CLI topic, router
  leaf, browser code, or ordinary caller.
- Importing a service-private router, context, implementation, or contract leaf.
- Exposing a service router directly over HTTP instead of projecting a bound
  client through API-owned caller contracts.
- A direct-control facade, caller-local socket, alternate transport, or second
  session owner retained as compatibility.
- A host-generated mature operation body, or raw Tuner execution imported by
  the controller, Play, MapGen-runs, or an ordinary product command.
- Supplying Play with provider state, a Tuner session, raw JavaScript, or a
  private controller router instead of the public controller client.
- Treating provider dispatch as semantic gameplay or run success.

## Detection And Proof

The accepted destination is proved by disjoint owners:

- local-socket provider lifecycle and collaboration proof closes exact
  acquisition, concurrency, interruption, epoch, and release behavior;
- controller contract, router, client, and mod-realization proof closes native
  semantics, realm/boot identity, versioned ingress, and once-only dispatch;
- qualified host-link suites close typed-envelope correlation, fresh realm/boot
  validation, request isolation, and indeterminate-delivery handling without
  replay;
- Play service proof closes public-controller-client delegation and actor-facing
  reconciliation without provider or private-router imports;
- qualified app assembly and host suites close provider selection, client
  binding, mounting, process shutdown, and drain order;
- API projection suites prove caller routes delegate bound clients without
  private service or provider imports.

`services/civ7-control`, `packages/civ7-direct-control`,
`packages/studio-server`, and their session-door tests are frozen migration
evidence. They may remain temporarily only under the realization workstream's
transition quarantine; they have no destination role and authorize no new
imports or behavior.

## Remediation

When a second acquisition, transport, session, or service-private import
appears, remove it rather than wrap it. Put provider-neutral lifecycle in the
resource contract, concrete socket behavior in the selected provider, Civ7
mechanics in the realm-local controller, actor meaning in Play, caller
translation in a plugin, and transport binding or host lifetime in the app. A
genuinely new ownership mode must first change the accepted
capability-realization model and its consumer/lifecycle evidence.

## Rationale

One physical provider scope does not imply one semantic owner. Keeping the
door singular at app composition lets resources, the controller, Play, run
operations, and projections each retain their own facts without duplicating
the wire, operation implementation, or controller contract and without turning
a process singleton into a facade-shaped architecture.
