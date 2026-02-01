<toc>
  <item id="purpose" title="Purpose"/>
  <item id="domain" title="What a domain owns"/>
  <item id="ops" title="Ops vs steps"/>
  <item id="shared" title="Shared semantics (knobs, ids, schemas)"/>
  <item id="boundaries" title="Boundaries + dependency direction"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Domain modeling (explanation)

## Purpose

Explain how MapGen uses domains to keep algorithmic code modular, testable, and reusable across recipes.

Contract references:
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`

## What a domain owns

A domain should own:
- the canonical algorithms (ops),
- domain-level truth/projection semantics,
- and shared semantic enums (e.g. knobs) used by author surfaces.

Domains should not own:
- recipe composition,
- step ordering,
- or adapter/Studio UX.

## Ops vs steps

- **Ops** are the “algorithm units”:
  - pure compute/plan with explicit input/output schemas.
- **Steps** are orchestration:
  - they bind ops, read/write artifacts/buffers, and emit trace/viz.

This separation keeps algorithmic code reusable and keeps orchestration visible and debuggable.

## Shared semantics (knobs, ids, schemas)

Knob enums belong in domain shared modules and are consumed by:
- stage `knobsSchema`,
- and step normalize-time transforms.

Identifiers (op ids, artifact ids, tag ids) should be:
- stable,
- namespaced,
- and registered centrally for validation (where applicable).

## Boundaries + dependency direction

Preferred dependency direction:
- stages/steps depend on domains (to bind ops),
- consumers depend on recipes (to compile/run),
- domains do not depend on specific recipes or consumers.

## Ground truth anchors

- Domain authoring helpers: `packages/mapgen-core/src/authoring/domain.ts`
- Op authoring helpers: `packages/mapgen-core/src/authoring/op/contract.ts`
- Example domain wiring (contracts + implementations): `mods/mod-swooper-maps/src/domain/morphology/index.ts`
- Domain contract index: `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
