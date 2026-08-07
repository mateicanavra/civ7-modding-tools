---
name: civ7-architecture-authority
description: |
  Use in the Civ7 Modding Tools repo when deciding capability placement or ownership across packages, resources, providers, services, plugins, apps, and qualified app adapters. Trigger phrases include "what owns this code", "where should this capability live", "is this a resource or service", "who acquires this provider", "is this controller or Play", "where does Swooper realization live", "who owns MapGen run state", "delete this facade", "which Habitat law applies", and "before moving this boundary". Pair with civ7-product-authority when actor outcomes, public behavior, or consumer contracts are changing.
---

# Civ7 Architecture Authority

## Purpose

Use this durable local overlay to apply the sealed Civ7 capability-realization
model during structural work. It routes placement to the accepted product,
system, outcome, actor, topology, and destination authorities; it does not
restate migration status or preserve a container because it exists today.

For the shared kinds selected by the sealed model, generic law comes from
upstream Habitat. Civ7 service law and qualified product overlays remain
repo-owned. Generic Effect and oRPC mechanics come from the global vendor
skills and, for version-sensitive details, the exact installed source. This
overlay adds only Civ7-specific ownership and composition constraints.

## When To Use

- Selecting or changing a package, resource, provider, service, plugin, app, or
  qualified app-adapter boundary.
- Separating the realm-local controller from actor-facing Play and host access.
- Changing Swooper definition, production realization, or Studio ephemeral
  realization responsibilities.
- Moving MapGen operation state, host effects, API projection, or process
  composition.
- Removing a facade, direct-control convenience path, mixed owner, or private
  cross-boundary dependency.
- Deciding whether a structural rule belongs upstream in Habitat, in a
  Civ7-qualified overlay, or in generic vendor guidance.

## Non-Goals

- Do not use this skill as a project status ledger, migration backlog, or
  substitute for the sealed model.
- Do not infer target authority from current paths, imports, tests, or package
  names.
- Do not reproduce generic Habitat blueprints or generic Effect/oRPC teaching
  locally.
- Do not change product meaning without using `civ7-product-authority`.
- Do not hand-edit generated output or treat proof artifacts as architecture.

## Default Workflow

1. **Resolve the authority lane.** Read `references/source-map.md` and the
   relevant sealed model sections.
2. **Name the capability and fact writer.** Start from the actor outcome and
   owner-local facts, not the current container.
3. **Classify the owner.** Use `references/ownership-boundaries.md` to select
   the package, resource, provider, service, plugin, app, or qualified adapter.
4. **Name every edge.** Express each cross-owner relation as `defines`,
   `derives`, `declares`, `selects`, `acquires`, `binds`, `mounts`, `calls`,
   `projects`, `realizes`, `observes`, `disposes`, or `proves`.
5. **Disposition current evidence.** Treat current source as behavior and
   migration evidence. Record what moves, consolidates, or deletes; never make
   a facade or compatibility wrapper the destination.
6. **Resolve external authority.** Take generic kind structure from upstream
   Habitat and generic vendor mechanics from the global skills plus exact
   installed source. Keep only qualified Civ7 facts local.
7. **Preflight the slice.** Copy
   `assets/structural-slice-preflight.md` and close the applicable gates in
   `references/implementation-gates.md`.
8. **Implement and prove one owner chain.** Update consumers and deletion
   obligations in the same slice, then state only the proof classes exercised.

## Reference Map

| Reference | Path | Open When |
| --- | --- | --- |
| Source map | `references/source-map.md` | Resolving sealed, upstream, vendor, and evidence authority |
| Mental model | `references/mental-model.md` | Separating semantic ownership, construction, projection, and proof |
| Ownership boundaries | `references/ownership-boundaries.md` | Selecting an exact kind or Civ7 owner |
| Implementation gates | `references/implementation-gates.md` | Designing, reviewing, or closing structural work |
| Failure patterns | `references/failure-patterns.md` | Current topology, wrappers, or mechanics are pulling the design |

## Asset Map

| Asset | Path | Use When |
| --- | --- | --- |
| Structural slice preflight | `assets/structural-slice-preflight.md` | Recording an owner chain, write set, deletions, and proof before implementation |

## Core Invariants

<invariants>
<invariant name="capability-before-container">Name the actor outcome and sole writer for every durable fact, policy, transition, and correction before selecting a container.</invariant>
<invariant name="current-paths-are-evidence">Current paths, imports, tests, and working behavior describe the estate; the sealed model defines destination authority.</invariant>
<invariant name="controller-and-play-stay-distinct">The controller owns closed typed native facts and operations executed inside Civ7. Play owns actor-facing observation, checks, requests, reconciliation, no-repeat policy, and next lawful action over the public controller client.</invariant>
<invariant name="swooper-has-three-boundaries">The Swooper definition owns portable authored truth. The Swooper realization app owns its production build/deploy outcome. The Studio app's qualified adapter owns only ephemeral physical materialization/install effects and receipts.</invariant>
<invariant name="mapgen-runs-owns-operation-meaning">MapGen-runs owns accepted operation intent, order, state, correlation, cancellation, retention, reconciliation, and final semantic outcome. App adapters own exact host effects and receipts; API and web surfaces only project the service result.</invariant>
<invariant name="facades-delete">The legacy facade and direct-control convenience shape are deletion evidence only. No successor facade, parallel contract, private contract picking, or service-adapter forwarding layer is allowed.</invariant>
<invariant name="external-authority-stays-external">Use upstream Habitat for selected shared-kind law and global vendor guidance plus exact installed source for generic Effect/oRPC mechanics. This overlay owns only Civ7 service law and qualified product boundaries.</invariant>
<invariant name="proof-is-bounded">Contract, semantics, execution, projection, assembly, generated, installed, loader, and live-behavior evidence remain independent claims.</invariant>
</invariants>

## Quick Start

1. Read `references/source-map.md`.
2. Select the owner row in `references/ownership-boundaries.md`.
3. Record the full owner chain and deletion obligations in the preflight asset.
4. Run the applicable gates and close with evidence-scoped claims.
