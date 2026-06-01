# Architecture Mental Model

Architecture work in this repo starts with ownership, not path names.

The durable frame is:

```text
official game/resource facts
  -> typed modeling and SDK/CLI/plugin abstractions
  -> MapGen pure truth products where applicable
  -> adapter or mod runtime projection into Civ7
  -> generated outputs and verification evidence
```

## Ownership Before Existing Topology

Ask these questions before choosing a file path:

- What behavior or contract is changing?
- Which package, mod, app, or doc set owns that contract?
- Which adjacent owners consume it?
- Which owners are explicitly forbidden?
- Which generated artifacts will be regenerated rather than edited?
- Which tests or runtime checks can prove the claim?

## Truth, Projection, And Materialization

For MapGen, truth products and game projection are separate:

- Domains and steps publish artifacts and fields that describe generated world truth.
- `map-*` or game-facing stages project truth into engine state, terrain, tags, resources, starts, or other Civ7 surfaces.
- Adapter calls and official game generators are runtime materialization evidence. If current behavior delegates to them, classify that surface as projection/materialization until a controlling decision gives the pipeline deterministic ownership.
- Diagnostics, parity captures, and generated mod files observe or serialize behavior. They do not define it.

## Native Repo Shape First

Prefer existing repo primitives:

- Bun workspace scripts and Turbo for builds/checks.
- Package-local `bun run --cwd <package> <script>` for focused validation.
- Graphite for branch/stack workflow.
- TypeScript source as editable implementation; `dist/` as generated output.
- `docs/system/**` for evergreen architecture/process.
- `docs/projects/**` for active project state, specs, reviews, workstream records, deferrals, and triage.

Add helpers only when they remove real repeated complexity, isolate a named boundary, or match an established local pattern. A helper that hides a placement decision is debt.

## Guidance Must Become Control

A correction or reviewer finding is consumed only when it changes one of:

- an authority doc or ADR;
- a deferral/triage record with owner and trigger;
- a source path, import boundary, or public export;
- a test, lint, or verification gate;
- a generated-output regeneration step;
- a closure claim.

Acknowledgement without a durable change is not an operational state.
