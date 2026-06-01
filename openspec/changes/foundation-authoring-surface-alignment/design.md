# Design: Foundation Authoring Surface Alignment

## Problem

The Foundation stage intentionally had a low-level public surface, but the
corpus ledger showed it was not merely a justified internal-as-public step
surface. It exposed public step ids, op ids, and raw `{ strategy, config }`
envelopes for the visible tectonic setup. That violates the standard authoring
surface target because authors had to understand internal step/op wiring to make
ordinary Foundation choices.

## Decision

Add a Foundation public schema with semantic groups and a compile function that
maps those groups into the existing internal step/op envelopes:

- `meshResolution` -> `mesh.computeMesh`
- `mantleSources` -> `mantle-potential.computeMantlePotential`
- `mantleForcing` -> `mantle-forcing.computeMantleForcing`
- `lithosphere` -> `crust.computeCrust`
- `platePartition` -> `plate-graph.computePlateGraph`
- `plateMotion` -> `plate-motion.computePlateMotion` and
  `tectonics.computePlateMotion`
- `tectonicSegmentation` -> `tectonics.computeTectonicSegments`
- `tectonicEras` -> `tectonics.computeEraPlateMembership`
- `tectonicFields` -> `tectonics.computeEraTectonicFields`
- `tectonicRollups` -> `tectonics.computeTectonicHistoryRollups`

The public group schemas reuse the default strategy config schemas from the
underlying op contracts. This removes strategy/config envelope leakage while
keeping existing validated defaults, numeric bounds, enums, and leaf
documentation. The group names provide the authoring semantics for the current
slice; later profile-collapse slices may still reduce coupled low-level fields
if gameplay evidence shows they are not useful expert controls.

## Internal Defaults

The compiler still emits `projection: {}` so the internal projection step keeps
its current default behavior. Empty maintenance ops for current tectonics,
tracer advection, provenance, hotspot events, segment events, crust evolution,
and plate topology are not author-facing controls in this slice.

`cellCount` remains derived by internal normalization. It is intentionally not
persisted in the public `meshResolution` group.

## Migration And Proof

The four shipped map configs are migrated structurally in the same slice. Stable
compiled-config comparison is used as the behavior-equivalence proof because the
config object key order changes while the compiled semantics do not.

Generated source map artifacts are regenerated through the package script. The
changed hashes reflect the persisted config shape change; they are not runtime
behavior evidence.

## Studio Boundary

Studio consumes generated standard recipe schema/default artifacts and should
see the same intended public surface as authors. The Studio guard asserts that
Foundation exposes semantic groups, omits legacy raw step keys, and does not
contain public `strategy` or `config` envelopes.

## Deferred Work

This slice does not claim that every Foundation leaf is the final best product
control. It removes envelope leakage first. Future slices may collapse coupled
expert fields into profiles when product/statistical evidence supports that
behavior-changing change.

Deferral owner: standard recipe authoring-surface workstream, with product and
architecture authority from the corpus/taxonomy slice. Re-entry trigger: a later
Foundation balance or authoring UX slice has stats/golden evidence that a set of
expert leaves must be tuned together or is not meaningful to authors as a direct
control. This slice does not claim behavior proof for final product optimality
of every Foundation leaf; it claims schema-boundary cleanup and shipped-config
compile equivalence only.
