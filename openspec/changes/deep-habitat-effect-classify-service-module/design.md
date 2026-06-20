# Design: Deep Habitat Effect Classify Service Module

## Boundary

`classify` is an owned Habitat orientation capability. It answers: "what does
Habitat know about this path or diff, and which rule/target guidance can an
agent use before editing?"

The service module owns the procedure boundary and command orchestration. It
imports current implementation material directly from `classify-core`, not from
the legacy `src/lib/classify.ts` aggregate facade. `classify-core` remains
implementation material until the
`deep-habitat-effect-orientation-workspace-graph` packet drains it into the
workspace graph integration domain.

## Target Flow

```text
Classify CLI -> Habitat service client -> classify service module -> classify-core workspace graph integration material
```

## Target Files

```text
tools/habitat-harness/src/service/modules/classify/contract.ts
tools/habitat-harness/src/service/modules/classify/context.ts
tools/habitat-harness/src/service/modules/classify/module.ts
tools/habitat-harness/src/service/modules/classify/router.ts
tools/habitat-harness/src/service/modules/classify/run.ts
tools/habitat-harness/src/service/contract.ts
tools/habitat-harness/src/service/router.ts
tools/habitat-harness/src/service/base.ts
tools/habitat-harness/src/commands/classify.ts
tools/habitat-harness/test/service/classify-service.test.ts
tools/habitat-harness/test/service/service-architecture.test.ts
tools/habitat-harness/test/commands/habitat-commands.test.ts
```

## Contract

The service procedure is `classify.run`.

- Input: `{ target: string }`
- Output: existing `ClassifyResultSchema`

The output schema remains the D4 command JSON authority. The service module
does not invent a new DTO or alternate result shape.

## Public Surface Handling

This slice keeps the current classify package helper and DTO exports intact
because the D0 matrix currently preserves them. It removes command dependence
on those helpers for owned orchestration. The public-surface facade packet owns
final export placement after the service/domain drain is complete.

## Follow-On Drain

- `src/lib/classify-core/**` moves into
  `src/domains/workspace-graph-integration/**`.
- `src/lib/classify.ts` becomes a public facade or is removed by the
  public-surface facade packet; service modules must not depend on it.
- Workspace graph reads move through the Nx/workspace providers and resources.
- Direct filesystem checks in classify path/diff handling move behind resource
  capabilities.

## Verification Boundary

Service tests prove the procedure path and context-injected workspace graph
reader. Command tests prove CLI-to-service routing. Existing classify tests
continue to prove the D4 result model and serializer.
