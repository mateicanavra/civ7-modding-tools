# Current Civ7 Capability Chains

**Status:** Current-state authority
**Date:** 2026-07-30

This inventory records shipped or directly exercised product realization
chains. It is not a dependency graph and does not grant architectural authority
to the containers that currently implement each link.

## 1. CLI Composition

```text
apps/cli
  -> plugins/cli/topics/{data,docs,game,git-mod}
  -> public capability clients
  -> terminal result
```

The app owns the oclif binary, startup, hooks, and plugin registration. Topic
plugins own commands. Preserve command discovery, help, and development versus
production parity.

## 2. External Live Control

```text
user or agent
  -> game CLI topic
  -> {
       semantic control service procedure
       raw diagnostic/read command
     }
  -> direct-control capability
  -> Tuner session and exact JavaScript command
  -> App UI or Tuner state
  -> structured result
```

The service owns semantic admission, policy, bounded postcondition checks,
dispatch uncertainty, and no-repeat outcomes. The mixed direct-control package
owns both the managed socket and exact native lowering. Preserve connection
epochs, guarded native sends, raw observations, and semantic result behavior.

Raw execution, Tuner health, catalog, inspection, map reads, watch, restart,
and several focused readiness/play helpers intentionally do not all pass
through the semantic service today. They require individual classification;
the service must not absorb diagnostics merely to make package deletion easy.

## 3. In-Game Provider Island

```text
game-scoped UIScript
  -> nested control service client
  -> App-UI-native facade
  -> Civ7 globals
  -> globalThis.Civ7IntelligenceBridge
```

This chain is build- and test-proven only. It has no deploy target, no installed
mod evidence, and no tracked external caller. It is not a current shipped
capability. App UI, Tuner, and gameplay ScriptSystem remain distinct states.

## 4. Studio Control And Inspection

```text
Studio browser
  -> same-origin /rpc
  -> Bun daemon
  -> merged Studio and control routers
  -> one host-scoped runtime and shared Tuner session
  -> Civ7
```

Preserve one HTTP mount, one shared connection, request admission,
serialization, cancellation, drain, socket FIN, and host disposal. Studio is
the current network host; the control service itself is an in-process semantic
library.

The shipped `/rpc` surface is the complete merged Studio procedure tree plus
the complete control-service contract under `civ7.*`, including procedure
schemas, aliases, declared errors, and event routes. That public shape is frozen
as behavior evidence. Every route receives an explicit retain, replace, or
retire-with-consumer-proof disposition before either current contract owner is
deleted.

`studio.events.watch` currently merges operation, hello, and live-game events.
It preserves ordering, replays the latest live-game event, and closes
subscribers on shutdown. Those are caller-visible projection behaviors, not
MapGen run-storage semantics.

## 5. Studio Browser Preview

```text
Studio UI
  -> browser worker
  -> Standard recipe and admitted config
  -> mapgen-core
  -> generated-policy-backed mock adapter
  -> trace and visualization events
```

This chain is deterministic browser execution. It does not use Civ7 and does
not prove game-runtime projection.

## 6. Studio Save, Deploy, And Run

```text
durable save
  -> Swooper definition-owned prepared source write
  -> exact source write with rollback authority
  -> swooper-physics-mod:deploy:studio
  -> production CLI
  -> exact mod-install mechanics
  -> Civ7 Mods directory

process-lifetime run operation
  -> verified run manifest
  -> Swooper realization materialize/deploy targets
  -> exact mod-install mechanics
  -> in-process control service client
  -> lifecycle demand
  -> fresh logs and live readback
```

The two paths differ intentionally: durable deployment uses the realization
target; the process-lifetime operation runtime owns transient materialization,
admission, retention, browser-reload adoption, cancellation, and correlated
proof. Operations may survive caller interruption. Preserve request identity,
exact digests, setup projection, abort/drain, fresh-log gating, and authorship
verification.

In the selected destination, MapGen-runs consumes app-selected authored-config,
run-files, fresh-log, and mod-realization capabilities. The definition keeps
pure canonical config admission and serialization; the Studio app's qualified
config-source adapter owns source write and rollback; the realization app keeps
rendering, installation effects, and deployment meaning; pure packages own
only parsing, planning, hashing, and comparison over supplied values.
MapGen-runs retains prepare -> write -> deploy order, scoped operation state,
and public phase evidence. No managed run resource is earned because this is
service-owned state plus cold semantic operations, not an independently
acquired foreign capability.

Autoplay participates in the same active-operation admission gate. An active
Run in Game or Save & Deploy operation must reject autoplay with the current
`AUTOPLAY_BLOCKED` outcome before any control mutation executes. The
cross-operation mutex is MapGen-runs policy even though the admitted autoplay
mutation is delegated to the control service.

## 7. Official Data Authority

```text
installed Civ7 data
  -> configured data zip/unzip command
  -> file mechanics
  -> .civ7/outputs/resources submodule
  -> generated Civ7 policy and types
  -> adapters, MapGen, and Studio
```

Preserve explicit extraction versus publication, submodule metadata, and
generated-currentness proof. The static resource corpus is source evidence,
not a managed runtime resource instance.

## 8. Generic Mod Authoring And Deployment

```text
mod definition
  -> SDK Mod/builders
  -> rendered modinfo and payload
  -> realization deploy target
  -> mod CLI projection
  -> exact mod-install mechanics
  -> Civ7 Mods directory
  -> Civ7 loader
```

Preserve exact output-copy behavior and live game-loading proof. Current
`packages/plugins/plugin-mods` is implementation evidence, not a valid plugin
classification. Its resolve/list/install effects move to qualified app and CLI
adapters; `packages/civ7-mod-install` retains only pure path grammar,
supplied-tree validation, replacement planning, digest, and receipt
construction. Its sole status projection is inlined into its CLI adapter;
unconsumed remote, registry, packaging, validation, and Steam planning stubs
are deleted.

## 9. Swooper MapGen Runtime

```text
Swooper domains and Standard recipe
  -> admitted catalog and configuration
  -> generated map entry and bundle
  -> Swooper mod app
  -> Civ7 map loader
  -> SDK createMap binding
  -> mapgen-core executor
  -> production Civ7 adapter
  -> base-standard engine APIs
  -> map and evidence logs
```

The definition plugin owns portable physics and recipe semantics. The mod app
owns Civ7 realization, generated files, compatibility, deployment, and live
proof. The reusable Civ7 adapter package keeps only contracts, static metadata,
and mocks; the concrete engine-global adapter, setup, and entrypoint live in
the mod app's map-script runtime. Preserve deterministic generation and the
truth-versus-engine-projection boundary.

## Current Hybrid Seams

- `@civ7/direct-control` combines protocol, resource, adapter, and convenience
  surfaces.
- CLI raw diagnostic and read commands consume that package outside the
  semantic service.
- `Civ7ControlOrpcDirectControlFacade` mirrors that hybrid inside the service.
- Three control providers exist conceptually, but only the host Tuner provider
  participates in shipped CLI and Studio paths.
- Studio's `civ7.live.*` projections overlap canonical control reads.
- `packages/studio-server` mixes API projection, host runtime, and a genuine
  process-lifetime MapGen run-state service.
- `packages/plugins/*` uses "plugin" for support and mutation libraries rather
  than projections.
- Dacia and the intelligence bridge have not adopted the definition-plugin and
  realization-app split already used by Swooper.
- High-level product and architecture docs describe an older topology.

## Behavior Ledger

| Chain | Behavior that survives relocation |
| --- | --- |
| CLI | Command discovery, stable nouns, structured output, local in-process calls |
| Tuner | Framing, state selection, reconnect, epochs, health, exact command result |
| Diagnostics | Raw execution and inspection remain explicit escape hatches rather than semantic service methods |
| Control | Admission, native checks, guarded sends, bounded observation, uncertainty, no-repeat policy |
| Studio | Exact merged `/rpc` procedure/error surface, one mount/session, event ordering/latest-live replay/subscriber closure, operation adoption/retention, autoplay mutex, cancellation, drain, correlated proof, same-origin access |
| Official data | Explicit extraction/publication, generated-currentness, submodule integrity |
| Mods | Exact rendered tree, wholesale deployment, game loader acceptance |
| Swooper | Portable deterministic recipe, generated realization, live evidence |
