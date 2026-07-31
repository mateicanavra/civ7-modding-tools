# Capability Map

Use this map to identify durable Civ7 product authority before selecting or
changing a container. A capability may traverse several owners; each durable
fact, decision, transition, and correction still has one writer.

## Capabilities

| Capability chain | Owner chain | Explicit non-owners |
| --- | --- | --- |
| Official game knowledge | Qualified extraction owns its receipt; the published official corpus owns source revision; generated type/policy packages own derived contracts | Studio, MapGen, adapters, generated output, runtime services |
| Generic mod authoring | `@mateicanavra/civ7-sdk` owns reusable authoring; each definition owns product identity and content | CLI, installer, realization app, generated tree, Civ7 loader |
| Swooper map definition and generation | Swooper definition owns domains, Standard recipe, configuration, diagnostics, metrics, trace, and visualization; MapGen Core owns only generic language/mechanics | Civ7 adapter, Studio, CLI, generated entrypoint, realization app, engine readback |
| Mod realization and deployment | The matching realization owns materialization and deployment meaning; its qualified app adapter emits the exact host-effect receipt; loader and live evidence remain independent | Definition, SDK, pure installer plan, CLI topic, generated tree |
| Live Civ7 observation | Control service owns semantic snapshots and interpretation; the resource owns foreign vocabulary and the selected provider emits exact foreign facts | CLI, Studio projection, raw transport command; resource/provider are non-owners only of semantic interpretation |
| Live Civ7 decision | Control service owns admission, policy, native transition meaning, uncertainty, and correction | Tuner resource, CLI command, API/web projection, UI element, observer |
| Map configuration authoring | Swooper definition owns canonical admission/serialization; qualified source adapter owns mutation/rollback receipt | Studio UI/API, run service, realization app, generic filesystem code |
| Map realization operations | MapGen-runs semantic owner owns request-correlated operation policy and facts; selected adapters/clients own exact effects | Studio API/browser, run-files adapter, Tuner, definition |

CLI, Studio web/API, docs, examples, and mod-loader entrypoints are product
surfaces, not additional semantic capability owners.

Raw diagnostics are supporting interactions. Each reports only the exact
resource, provider, app, or engine fact it observes and must not inherit
gameplay-success meaning.

## Invariants

- Product capability precedes package, resource, service, plugin, or app.
- Portable definition differs from environment-qualified realization.
- Deterministic MapGen truth differs from engine-current observation.
- Admission, dispatch, observation, acceptance, and outcome remain distinct.
- Generated, installed, loader, and live-behavior evidence remain independent.
- Every public surface has an explicit consumer gate before reshape or removal.
- Current hybrid containers do not gain authority merely because they contain
  working code.

The active exact status axes, hybrid register, and consumer ledger live in
`docs/projects/civ7-capability-realization/PRODUCT-AUTHORITY.md`.
