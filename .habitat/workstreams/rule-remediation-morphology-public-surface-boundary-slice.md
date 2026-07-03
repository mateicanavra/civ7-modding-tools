# Rule Remediation: Morphology Public Surface Boundary Slice

Status: closed on `codex/habitat-morphology-public-surface-boundary`

Canonical record:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`

## Purpose

Replace the morphology `_remainder` retired-module import proxy with live
morphology public-surface import authority.

## Decision

`prohibit_legacy_morphology_module_imports` was a negative proxy for the real
boundary: consumers outside domain internals should import Morphology through
public surfaces.

The replacement rule is `require_morphology_public_surface_imports`, a single
Grit rule in the Morphology domain rules lane. It permits non-domain consumers
to import only:

- `@mapgen/domain/morphology`
- `@mapgen/domain/morphology/ops`
- `@mapgen/domain/morphology/ops/index.js`
- `@mapgen/domain/morphology/config.js`

Domain-internal source remains excluded from this consumer-boundary rule.

## Enforcement-Layer Disposition

Nx project boundaries are not the owner for this slice. Nx owns project-plane
tag/module legality. This rule is an intra-project import source-shape rule
inside `mod-swooper-maps`, so Habitat/Grit is the native rail.

A Habitat script is not justified here. The predicate is static import/export
syntax and does not require derived filesystem state, graph traversal, runtime
execution, or source-vs-generated comparison.

Package-owned tests are also not the owner. This is structural import authority,
not product behavior.

## Disposition Receipt

| Rule id | Action | Reason |
| --- | --- | --- |
| `prohibit_legacy_morphology_module_imports` | replaced/retired | Retired morphology module names were a proxy for missing public-surface import authority. |
| `require_morphology_public_surface_imports` | created/admitted | Encodes the morphology public-surface import boundary as one live Grit rule. |

## Proof Scope

The focused proof shows that the new Grit rule runs and the old `_remainder`
packet is absent. It does not claim dynamic import coverage, package behavior,
or Nx project-plane enforcement.
