# Change: Deep Habitat Effect Nx Internal Boundary Topology

## Why

Habitat already delegated workspace project-plane import boundaries to Nx, but
`@internal/habitat-harness` remained one opaque Nx project. That left Habitat's
own internal architecture enforced mostly by convention and source-shape checks
instead of the same graph mechanism Habitat uses for the rest of the workspace.

Habitat should model the structure it asks other repositories to adopt. Its
source tree needs graph identities for the durable architectural roots, not for
every incidental folder produced by earlier refactors.

## What Changes

- Add six inferred Nx projects for Habitat's durable architecture roots:
  substrate, adapters, core, service, workspace, and host.
- Add `habitat:*` boundary tags and dependency constraints to the quarantined
  Nx boundary config and taxonomy.
- Rewrite cross-root Habitat imports to scoped package subpaths so
  `@nx/enforce-module-boundaries` can enforce real project edges.
- Preserve source-local imports only for the Nx plugin bootstrap path that must
  load live TypeScript source while constructing the graph.
- Keep `validate:boundary-taxonomy` as taxonomy/config/tag drift validation and
  leave import-edge legality to the Nx `boundaries` target.
- Consolidate pre-refactor top-level Habitat folders under those roots so Nx
  enforces the intended architecture rather than mirroring the old mess.

## Non-Goals

- Do not split Habitat into multiple workspace packages in this slice.
- Do not split every top-level folder into its own inferred project.
- Do not add tests as topology enforcement.
- Do not broaden Biome beyond formatting and hygiene.
- Do not reintroduce direct Habitat import-boundary execution outside the Nx
  `boundaries` target.
