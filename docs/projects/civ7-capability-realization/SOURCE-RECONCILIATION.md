# Civ7 Platform Source Reconciliation

**Status:** Normative baseline classification
**Date:** 2026-08-06
**Baseline:** `fd60a16ad7605ad34c8afa9668aa847b52931022`

## Purpose

This document classifies the exact pre-substrate estate against the accepted
product and system models. It does not convert historical work into a backlog
or let a current container choose its own destination.

The dispositions are:

- **Carry:** the owner and behavior remain authoritative.
- **Correct:** the behavior remains, but authority or relationship changes.
- **Retire:** the mechanism or owner has no destination.
- **Defer:** the capability is absent until explicit admission evidence exists.

## Authority Set

| Source | Role | Disposition |
| --- | --- | --- |
| Product, System, Outcome, Actor/Outcome models in this packet | Destination authority | Carry |
| `CURRENT-CAPABILITY-CHAINS.md` at the baseline commit | Shipped behavior ledger | Mine as evidence |
| Baseline code, public contracts, tests, CLI help, and generated outputs | Exact behavior and consumer evidence | Classify, never promote by location |
| Current official Civ7 resource submodule | Vendor realm, loader, API, and behavior evidence | Carry with provenance |
| Post-baseline transition code | Feasibility and defect evidence | Never destination authority by existence |
| Deleted intelligence/controller island | Discarded legacy | Excluded entirely |

## Capability Reconciliation

### Official Civ7 Knowledge

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| Data extraction/publication commands | Carry | Explicit source extraction and published revision receipts |
| `.civ7/outputs/resources` | Carry | Static official evidence corpus, not managed runtime resource |
| `packages/civ7-map-policy` generator/output | Carry and strengthen | Generated map policy with exact source provenance |
| `packages/civ7-types` | Retire | Replaced by generated state-scoped `civ7-api` evidence and owner-private usage-constrained ports; no ambient replacement |
| Catch-all ambient module declarations | Retire | Unknown APIs are refused or marked observed/unproven, never `any` authority |
| Direct-control regex catalog | Retire | Partial traversal-order inspection is not official API authority |

### Controller And Live Access

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| Direct-control socket/framing/state discovery | Correct | `civ7-tuner` resource plus local-socket provider |
| Connection epoch, health, exact raw response and release | Carry | Concrete local-socket provider facts under the Tuner resource contract |
| Automatic reconnect of semantic mutation | Retire | Indeterminate mutation is never replayed |
| Raw `execute(javascript)` | Carry narrowly | App-owned audited diagnostic escape hatch |
| Generated App UI operation JavaScript | Correct then retire | Port mature behavior into controller TypeScript; delete host implementation |
| Native observation/check/send atoms | Correct | Realm-local controller operations with exact operands and evidence |
| Setup and game lifecycle native operations | Correct | Controller operation when inside Civ7; host process effects stay outside |
| Map/world native reads | Correct | Controller map/game observations |
| App/UI readiness and notifications | Split | Mechanical native facts to controller; actor attention and reconciliation to Play |
| Window capture mechanics | Correct | Generic window-capture resource contract plus macOS provider-owned preparation, capture, in-flight child lifecycle and release |
| Civ7 app process launch/restart/focus | Defer resource classification | Qualified app effect until reusable acquire/use/release is proven |
| Direct-control facade and convenience aggregates | Retire | No replacement interface |

### Play

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| Action admission and lawful-choice policy | Carry | Play contract and policy |
| Post-dispatch polling and reconciliation | Carry | Play-owned outcome logic over controller observations |
| No-repeat and indeterminate-effect handling | Carry | Play policy; controller only reports native facts |
| Attention/priorities/next action | Carry | Play situation and planning modules |
| City, diplomacy, government, narrative, progression, turn, unit actor operations | Carry | Modules beneath the Play authority |
| Matching native operation implementations | Correct | Nested controller game operations, not peer platform services |
| `services/civ7-control` as combined owner | Retire after split | Extract controller and Play authorities; no compatibility service remains |

### Studio And Map Runs

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| One same-origin `/rpc` mount | Carry | Studio API projection realized by Studio app |
| Frozen caller contract, errors and event behavior | Carry by the complete disposition in [PUBLIC-SURFACE-DISPOSITION.md](./PUBLIC-SURFACE-DISPOSITION.md) | No owner decision is deferred to migration |
| Shared host Tuner/session | Correct | Studio app selects one provider and binds controller/Play clients |
| `StudioOperationRuntime` state, adoption, retention, cancellation and mutex | Carry | MapGen-runs service |
| Save/write/deploy/run ordering and correlation | Carry | MapGen-runs policy over qualified app adapters |
| Source writes, filesystem, install, process and log effects | Correct | Studio app adapters |
| Duplicated `civ7.live.*` semantic reads | Consolidate | Project the owner-issued controller/Play fact |
| `packages/studio-server` hybrid | Retire after extraction | API plugin, MapGen-runs service, and Studio app composition replace it |
| `packages/studio-contract` hybrid | Correct | Portable config remains with definition; caller contract moves to API owner |

### Swooper And Mod Realization

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| Swooper domains, recipe, config, diagnostics, metrics, trace and viz | Carry | Portable Swooper definition authority |
| Browser worker preview | Carry | Deterministic projection, never live proof |
| Generated entry, bundle, install and loader behavior | Correct | Swooper mod app realization |
| Concrete Civ7 adapter globals/setup/entrypoint | Correct | Realization-local map-script runtime |
| Portable adapter contract/static/mock | Carry | Runtime-free reusable package |
| `packages/plugins/plugin-mods` | Retire after split | Pure plan/digest remains package; effects become app adapters; CLI stays projection |
| Dacia legacy mod | Correct later | Reuse definition-plugin and realization-app grammar after core platform seal |

### CLI And Product Projections

| Baseline subject | Disposition | Destination meaning |
| --- | --- | --- |
| Commandless oclif app and topic discovery | Carry | CLI app plus topic plugins |
| Stable nouns, flags, help and structured output | Carry | Caller compatibility oracle |
| Commands constructing providers or importing direct-control | Correct | App binds ready public clients and explicit diagnostic adapter |
| `game exec`, health and raw inspection | Carry narrowly | Explicit diagnostic/operator commands |
| Semantic gameplay commands | Correct | Public Play client |
| Native platform commands | Correct | Public controller client |

## Direct-Control Deletion Ledger

`packages/civ7-direct-control` is deleted only after every responsibility has a
qualified destination or a retirement receipt:

| Responsibility | Destination |
| --- | --- |
| Tuner protocol, session, state discovery, epoch and release | `resources/civ7-tuner/providers/local-socket` |
| Raw JavaScript | Qualified app diagnostic adapter |
| Official API discovery/types | Generated `packages/civ7-api`, not direct-control |
| Mature native operations | In-engine `services/civ7-controller` |
| Actor policy and reconciliation | `services/civ7-play` |
| Map run coordination | `services/mapgen-runs` |
| Window evidence | Generic window-capture resource contract plus selected macOS provider; app/API diagnostic projection supplies caller meaning |
| OS/app lifecycle | Qualified app effect or later admitted generic resource |
| Facades, aggregates, generic mutation wrappers, duplicate schemas | Delete |

There is no compatibility package and no host-side mature fallback after
controller activation.

## Cross-Owner Direction Check

```text
Play       -> Controller public client
MapGenRuns -> Controller public client
Apps       -> providers, client factories, API mounts and adapters
APIs       -> public service clients
Controller -> generated Civ7 API
```

No reverse service edge is retained. Raw diagnostics bypass semantic services
only through a separately admitted operator surface and cannot be imported by
them.

## Exterior

This reconciliation does not authorize a broad HQ API, standalone Play API,
durable workflow, desktop-app resource, catalog resource, Tuner protocol
package, or data service. Each remains absent until its own actor, consumer,
state, or lifecycle earns it.

## Closure

This is a classification ledger, not temporal work tracking. A row disappears
from active migration attention when the destination behavior and consumer
proof are complete. Graphite owns commit order; the workstream owns container
sequence; this document owns only durable source disposition.
