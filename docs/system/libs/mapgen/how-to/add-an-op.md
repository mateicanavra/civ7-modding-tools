<toc>
  <item id="purpose" title="Purpose"/>
  <item id="prereqs" title="Prereqs"/>
  <item id="checklist" title="Checklist"/>
  <item id="verification" title="Verification"/>
  <item id="footguns" title="Footguns"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# How-to: add an op

## Purpose

Add a new **op** to a domain module (target posture: `defineOp` contract + `createOp` implementation + domain registry wiring).

This how-to is **domain-level** (ops live inside a domain). It routes to:
- Ops module contract reference: `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- Import policy: `docs/system/libs/mapgen/policies/IMPORTS.md`

## Prereqs

- You’ve chosen a domain (`foundation|morphology|hydrology|ecology|placement|narrative`).
- You’ve chosen a stable op id (namespaced; e.g. `"morphology/compute-base-topography"`).
- You know what the op is: `kind: "compute" | "plan" | ...` and what its strategy surface is.

## Checklist

### 1) Define the op contract (`defineOp`)

- Create `contract.ts` for the op.
- Use `defineOp({ kind, id, input, output, strategies })`.
- Make schemas explicit (TypedArray schemas for binary grids; keep descriptions meaningful).

### 2) Implement the op (`createOp`)

- Create `index.ts` for the op and use `createOp(Contract, { strategies })`.
- Keep strategy functions deterministic and side-effect free.
- Export types from the op folder to keep callsites strongly typed.

### 3) Wire the op into the domain registry

- Add the contract to the domain’s `ops/contracts.ts` export set.
- Add the implementation to `ops/index.ts` and satisfy `DomainOpImplementationsForContracts<typeof contracts>`.

### 4) Consume the op from a step (optional but common)

- Reference the op via the step contract’s `ops: { ... }` section.
- Call it via the injected `ops.*` handle inside the step `run()`.

## Verification

- Run:
  - `bun run test:mapgen`
  - `bun run --cwd mods/mod-swooper-maps test`
- Confirm the domain still type-checks (implementations match contracts).
- If wired into a step, run a traced execution and confirm the op call returns correctly shaped outputs.

## Footguns

- **Unstable op ids**: op ids are long-lived identifiers; treat them as public API within the MapGen ecosystem.
- **Breaking schema drift**: changing input/output schema is a breaking change for all steps that use the op.
- **Forgetting to wire contracts/implementations**: an op contract alone is inert; the domain must export + implement it.

## Ground truth anchors

- Op contract API: `packages/mapgen-core/src/authoring/op/contract.ts`
- Op implementation wrapper: `packages/mapgen-core/src/authoring/op/create.ts`
- Domain registry authoring: `packages/mapgen-core/src/authoring/domain.ts`
- Example op contract: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/contract.ts`
- Example op implementation: `mods/mod-swooper-maps/src/domain/morphology/ops/compute-base-topography/index.ts`
- Domain implementations wiring: `mods/mod-swooper-maps/src/domain/morphology/ops/index.ts`
