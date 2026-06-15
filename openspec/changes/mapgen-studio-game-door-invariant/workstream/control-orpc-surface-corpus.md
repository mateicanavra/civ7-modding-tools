# D12 Control-oRPC Runtime Surface Corpus

Status: accepted packet corpus
Date: 2026-06-14

## Rule

`@civ7/control-orpc` does not own Studio's daemon game-door session. It exposes
typed game UI read, runtime-support, and mutation procedures that consume
`Civ7ControlOrpcContext.directControl` and optional `endpointDefaults`. When
hosted by Studio, `endpointDefaults.session` must come from the daemon
`Civ7TunerSession`; package internals may use direct-control wrappers as the
protocol boundary.

## Context And Ownership Sources

| Source | Role | Classification |
| --- | --- | --- |
| `packages/civ7-control-orpc/src/context.ts` | `Civ7ControlOrpcContext` carries `directControl`, `endpointDefaults`, correlation, controller support, and proof context. | consumer context, not session owner |
| `packages/civ7-control-orpc/src/dependencies/direct-control.ts` | Facade maps package procedures onto `@civ7/direct-control` functions and options. | package protocol adapter |
| `packages/civ7-control-orpc/src/modules/*/contract.ts` | Procedure contracts with TypeBox/Standard Schema metadata, including `procedureKey` and `risk`. | public control-oRPC surface authority |
| `packages/civ7-control-orpc/src/bridge/controller-ingress.ts` | Controller ingress dispatch table for supported procedure keys, controller support allowlist, and mutation-proof enforcement before mutation dispatch. | internal protocol/proof surface, not Studio runtime truth |

## Read-Only Surface Families

| Family | Procedure keys | Owner | D12 classification |
| --- | --- | --- | --- |
| attention | `attention.current`, `attention.priorities` | control-oRPC package procedures | read-only game UI projection |
| notifications | `notifications.queue.current` | control-oRPC package procedures | read-only game UI projection |
| progression | `progression.dashboard.current`, `progression.traditions.current` | control-oRPC package procedures | read-only game UI projection |
| strategy | `strategy.frontSummary`, `strategy.targetCandidates`, `strategy.destinationAnalysis`, `strategy.battlefieldScan`, `strategy.civilianRouteTriage`, `strategy.formationSnapshot` | control-oRPC package procedures | read-only game UI projection |
| world | `world.current`, `world.plot.read`, `world.grid.read` | control-oRPC package procedures | read-only game/map projection |
| display | `display.queue.current` | control-oRPC package procedures | read-only display queue projection |

## Runtime-Support Surface Families

| Family | Procedure keys | Owner | D12 classification |
| --- | --- | --- | --- |
| readiness | `readiness.current` | control-oRPC package procedures | runtime-support diagnostic read; not operation truth |
| display | `display.queue.close` | control-oRPC package procedures | runtime-support UI cleanup command |
| view | `view.appshot.capture`, `view.camera.focus` | control-oRPC package procedures | runtime-support view/camera command |

## Mutation Surface Families

| Family | Procedure keys | Owner | D12 classification |
| --- | --- | --- | --- |
| city | `city.population.place.request`, `city.production.choice.request`, `city.townFocus.change.request`, `city.townFocus.review.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| diplomacy | `diplomacy.response.request`, `diplomacy.firstMeet.response.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| display | `display.explore.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| government | `government.choice.request`, `government.celebration.choice.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| narrative | `narrative.choice.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| notifications | `notifications.dismiss.request`, `notifications.advisorWarning.viewed.request`, `notifications.queue.dismiss.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| progression | `progression.technology.choice.request`, `progression.culture.choice.request`, `progression.technology.target.request`, `progression.culture.target.request`, `progression.attribute.purchase.request`, `progression.attribute.review.request`, `progression.tradition.change.request`, `progression.tradition.review.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| turn | `turn.complete.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |
| unit | `unit.target.action.request`, `unit.upgrade.request`, `unit.resettle.request` | control-oRPC package procedures plus direct-control facade | typed game-action mutation; consumes injected/default session |

## Generic Protocol Residue Rule

Generic protocol details such as `operationType`, `Record<string, number>`, and
controller proof payloads may exist only inside `@civ7/control-orpc` package
internals, direct-control protocol adapters, tests, or historical evidence.
They are forbidden as public Studio runtime mutation DTOs. D12 implementation
must split residue searches into:

- public Studio contract/router/workflow DTO searches, where generic mutation
  DTOs are blockers;
- control-oRPC/direct-control internals, where typed package procedures and
  protocol adapters are allowed;
- tests/historical docs, where hits are classified as proof evidence.

## Hosted Controller Bridge

`packages/civ7-control-orpc/src/bridge/controller-ingress.ts` is classified as
`internal protocol/proof only`. It may dispatch allowlisted control-oRPC
procedure keys and enforce controller mutation proof before mutation execution.
It may not become a public Studio mutation DTO surface or a Studio operation
runtime owner.

## Black-Ice Resolved

- `risk: "mutation"` in control-oRPC is not itself a Studio operation-runtime
  owner. The session owner is the host/runtime that supplies
  `endpointDefaults.session`.
- The corpus is keyed by `procedureKey`; adding a new control-oRPC procedure
  without a `risk`/owner classification is a D12 closeout blocker.
- Studio may host control-oRPC; it may not use control-oRPC as an untyped raw
  mutation tunnel around the D4/D5 operation/runtime services.
