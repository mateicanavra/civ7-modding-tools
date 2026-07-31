# System

Civ7 Modding Tools is a Bun and Nx monorepo whose components compose product
capabilities by role rather than by historical package name.

## System Roles

- **Packages** own pure reusable contracts, algorithms, parsing, planning, and
  deterministic policy.
- **Resources and providers** own one foreign capability's acquire/use/release
  contract and concrete acquisition.
- **Services** own semantic capability facts, policy, transitions, correction,
  and a public in-process client.
- **Plugins** project capabilities into CLI, server API, web, workflow, or mod
  definition surfaces.
- **Apps** declare product composition, profiles, roles, qualified adapters,
  and process entrypoints. Shared runtime owns acquisition, binding, mounting,
  observation, and disposal.

Every admitted kind is closed: required leaves define its spine and optional
leaves are finite, explicit capabilities.

## Current Product Chains

The repository currently ships:

- a commandless oclif app composed from CLI topic plugins;
- official Civ7 resource extraction and generated static policy;
- the Civ7 SDK and colocated mod definitions;
- Swooper Physics as a portable MapGen definition plus a partial Civ7
  realization;
- a hybrid direct-control/Tuner and semantic control-service chain;
- MapGen Studio browser preview, configuration authoring, and host-scoped
  realization operations.

Some current containers still mix these roles. Their accepted dispositions and
proof gates are tracked in
[Civ7 Capability Realization](projects/civ7-capability-realization/); this
overview does not present target containers as shipped.

## Toolchain

- **Package manager and runtime:** Bun
- **Task graph:** Nx
- **Language:** TypeScript
- **Architecture and policy:** Habitat
- **Stacked changes:** Graphite

## References

- [Architecture](system/ARCHITECTURE.md)
- [Testing](system/TESTING.md)
- [Architecture Decisions](system/ADR.md)
- [Deferrals](system/DEFERRALS.md)
- [SDK](system/sdk/)
- [CLI](system/cli/)
- [Swooper Physics](system/mods/swooper-maps/)
