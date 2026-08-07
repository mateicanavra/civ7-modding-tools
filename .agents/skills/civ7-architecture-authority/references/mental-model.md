# Architecture Mental Model

Architecture starts from a capability and its facts, then chooses containers.
It does not start from the current repository tree.

## Three Concurrent Graphs

Keep these graphs separate:

1. **Authority:** who writes each fact, policy, transition, and correction.
2. **Construction:** which app selects, acquires, constructs, binds, mounts,
   observes, and disposes concrete runtime capabilities.
3. **Projection:** which CLI, API, web, or mod surface presents an owner
   capability to a caller.

A source import may implement an edge in one graph. It is not itself an
authority relation.

## Live Capability Chain

```text
external host capability
  -> provider-neutral resource contract
  -> concrete provider acquisition
  -> app-owned resource scope

controller TypeScript + private router
  -> dedicated controller mod definition and app
  -> realm-local versioned ingress

ready Tuner value + realm-local ingress
  -> app-owned narrow transport binding
  -> public controller client
  -> semantic service result
  -> caller-shaped plugin projection
  -> external actor
```

The resource defines lifecycle and foreign facts. The provider performs
acquisition and release. The controller remains the semantic owner inside
Civ7; the host app transports typed envelopes to its ingress and binds the
public client. The projection presents. No layer takes the writer owned by
another or regenerates a mature operation body.

For live Civ7 behavior, Controller and Play are two authorities:

```text
services/civ7-controller inside the controller mod
  -> typed native facts and operations through the public controller client
  -> services/civ7-play: situation, check, request, reconciliation, no-repeat, next action
  -> CLI or selected Studio API projection
```

Selected Tuner access is a host-app binding concern. Window capture remains
generic diagnostic or app evidence and is not a controller dependency. Shared
readiness is not a reason to merge semantic owners.

## Definition And Realization Chains

Portable truth and environment effects remain separate:

```text
Swooper definition plugin
  -> domains, recipe, config, diagnostics, metrics, trace, visualization
  -> deterministic MapGen products

Swooper definition plugin
  -> Swooper realization app's finite production targets
  -> deployable production artifact and deployment outcome

Swooper public definition + pure workspace/install packages
  -> Studio app's qualified Swooper realization adapter
  -> ephemeral physical materialization/install receipts
  -> MapGen-runs semantic ordering, state, reconciliation, and outcome
  -> Studio API/web projection
```

The production realization app and Studio's ephemeral adapter are independent
realizers. Studio does not import the production app or invoke its targets.
MapGen-runs does not perform filesystem effects and does not own Swooper
definition truth.

## Civ7 Qualification Tests

Use upstream Habitat for generic kind and relationship grammar. This overlay
adds only the discriminators that are specific to Civ7:

- raw Tuner or window facts route to their resource/provider chain; typed
  native Civ7 readiness, realm, game, map, and UI facts route to the
  realm-local controller;
- a gameplay goal, recommendation, guarded request, reconciliation, or next
  action routes to Play over the public controller client;
- portable Swooper authorship, its production realization, Studio's ephemeral
  realization effects, and MapGen-runs operation meaning remain four different
  owners;
- a caller-facing CLI/API/web shape projects a public capability and never
  earns its fact writer, provider selection, or process lifetime.

Resolve the exact relationship name from the sealed topology rather than
maintaining a second local relationship glossary.

## External Authority

Upstream Habitat owns the generic shells and structural law for the shared
kinds selected by the sealed model. Civ7 owns its local service law plus
qualified overlays and product facts. Global vendor skills own generic
Effect/oRPC guidance; exact installed source decides version-sensitive syntax
and lifecycle behavior. Neither source may be copied into a local pseudo-
platform or used to invent product authority.
