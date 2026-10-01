# Civ7 Platform Destination Reference

**Status:** Normative compact reference
**Date:** 2026-08-06

This is the smallest portable statement of the selected Civ7 platform model.
It routes to the complete authorities rather than duplicating them:

1. [Actor, Role, And Outcome](./ACTOR-ROLE-OUTCOME-MODEL.md)
2. [Product Authority](./PRODUCT-AUTHORITY.md)
3. [System Model](./SYSTEM-MODEL.md)
4. [Outcome Model](./OUTCOME-MODEL.md)
5. [Selected Topology](./TOPOLOGY.md)
6. [Source Reconciliation](./SOURCE-RECONCILIATION.md)
7. [Public Surface Disposition](./PUBLIC-SURFACE-DISPOSITION.md)

## Product Spine

```text
official Civ7 evidence
  -> generated state-scoped Civ7 API
  -> TypeScript controller service executing in Civ7
  -> controller mod definition and realization app
  -> versioned shell/game controller instances

qualified host app
  -> managed Tuner provider/resource
  -> narrow typed controller transport
  -> public controller client

human or agent
  -> CLI/API projection
  -> Play service
  -> public controller client
  -> native evidence
  -> Play reconciliation and next action
```

Raw JavaScript over Tuner remains a separate audited diagnostic escape hatch.
It is not an alternate controller implementation.

## Kind Grammar

| Kind | Authority |
| --- | --- |
| Package | Runtime-free reusable or generated truth |
| Resource | Provider-neutral foreign lifecycle and failures |
| Provider | Concrete acquisition, use mechanics and release |
| Service | Semantic contract, policy, state and operations |
| Plugin | Portable definition or caller projection |
| App | Selection, binding, mounting, process lifetime and disposal |
| Workflow | Durable orchestration across request/process lifetime |

Habitat owns generic kind law. Civ7 owns qualified instances, overlays,
adapters, policy, and behavior proof. A missing generic kind refuses
construction and routes upstream; it does not become Civ7 law.

## Authority Splits

| Concern | Owner | Explicit non-owner |
| --- | --- | --- |
| Official Civ7 API facts | Generated Civ7 API package | Controller, adapters, Studio |
| Native mechanical operations | In-engine controller service | Tuner, Play, host app |
| Socket/session lifecycle | Tuner resource/provider | Controller, Play |
| Actor intent and gameplay outcome | Play service | Controller, provider, projection |
| Raw JavaScript | Qualified app diagnostic adapter | Controller and Play contracts |
| Portable map truth | Swooper definition and MapGen SDK | Civ7 readback and Studio host |
| Run intent and terminal state | MapGen-runs service | Studio API and filesystem adapters |
| Host effects and composition | Qualified app | Services and definitions |
| Caller contract and translation | API/CLI projection | Services and resources |

## Runtime Realms

Shell, loading, and game have distinct document roots. The selected bootstrap
is registered in shell and game, but its Tuner-observed identity across loading
is a live proof question. Every host operation re-discovers the App UI state and
verifies the observed realm and boot identity before dispatch.

Live proof must discriminate Tuner Promise handling, continued asynchronous
work, and later global visibility before the transport selects direct
completion or a correlated mailbox. No mutation is replayed after indeterminate
transport.

## Required Deletions

- `packages/civ7-direct-control`;
- `Civ7ControlOrpcDirectControlFacade` and all facade-derived types;
- host-generated mature operation bodies;
- combined controller/Play ownership;
- provider acquisition inside services or ordinary commands;
- false plugin/support packages and stale architecture teaching;
- alternate mature control paths retained for compatibility.

## Conditional Components

A standalone Play API, Civ7 HQ API, durable workflow, desktop-app resource,
generic catalog resource, or Tuner protocol package remains absent until one
concrete actor, caller, state authority, or acquire/use/release lifecycle earns
it.

## Falsifier

Reopen the destination only if exact evidence disproves realm-local controller
loading/invocation, requires a service cycle, or shows that a selected owner
cannot state its independent semantic transition or lifecycle. Current folder
shape, compatibility pressure, and deleted legacy source are not falsifiers.
