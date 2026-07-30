<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract (trace + reproducibility)"/>
  <item id="viz" title="Visualization hooks"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Observability (trace + reproducibility)

## Purpose

Define how MapGen runs can be inspected and debugged deterministically:

- trace sessions (per-step verbosity),
- reproducible recipe initial setup and its projected physical `MapSetup`,
- and optional viz dump hooks (deck.gl pipeline visualization).

## Contract (trace + reproducibility)

- Run reproducibility is rooted in the recipe's complete immutable initial value. Core retains its
  exact physical `MapSetup`, while product-specific facts such as Standard's game seed, player
  identities, and option evidence remain part of plan identity.
- Trace configuration and sinks are explicit execution options, not map setup or product identity.
- Absence of the trace capability is the only disabled state. A present config emits basic step
  lifecycle events by default, with `steps` overrides selecting `off` or `verbose` per step.
- Authored steps receive only `context.trace.event(...)`. The executor owns run/step identity,
  verbosity selection, and session lifecycle; the step port becomes inert when its invocation ends.
- Lazy event producers are evaluated only for verbose steps and are failure-contained so
  observation cannot change generation behavior.
- Trace plumbing should not change pipeline semantics (only observability).

## Visualization hooks

Visualization is current canon and must reflect the deck.gl posture.

See:
- Contract routing: [`docs/system/libs/mapgen/reference/VISUALIZATION.md`](/system/libs/mapgen/reference/VISUALIZATION.md)
- Canonical implementation: [`docs/system/libs/mapgen/pipeline-visualization-deckgl.md`](/system/libs/mapgen/pipeline-visualization-deckgl.md)

## Ground truth anchors

- Map setup schema: `packages/mapgen-core/src/core/map-setup.ts`
- Trace configuration and runtime: `packages/mapgen-core/src/trace/`
- Map execution context: `packages/mapgen-core/src/core/map-context.ts`
- Canonical viz doc (current): `docs/system/libs/mapgen/pipeline-visualization-deckgl.md`
