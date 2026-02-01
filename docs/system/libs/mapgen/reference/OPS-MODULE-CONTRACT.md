<toc>
  <item id="purpose" title="Purpose"/>
  <item id="contract" title="Contract"/>
  <item id="strategies" title="Strategies (how variability is encoded)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Ops module contract

## Purpose

Define how domain operations (ops) are authored and bound into the pipeline in a way that is:
- strict (contracts + schemas),
- composable (ops reused across steps),
- and stable across packages.

## Contract

- Ops are defined by an op contract id (stable string id).
- Ops implementations are bound by id at compile time.
- Op variability is encoded via a `strategy` envelope rather than ad-hoc branching.

## Strategies (how variability is encoded)

Ops use a “strategy envelope”:

- `config.strategy` selects a strategy id
- `config.config` holds strategy-specific config

This makes op config explicit and schema-valid, and prevents config drift.

## Ground truth anchors

- Op contract definition: `packages/mapgen-core/src/authoring/op/contract.ts`
- Op creation and strategy enforcement: `packages/mapgen-core/src/authoring/op/create.ts`
- Strategy schema/envelope: `packages/mapgen-core/src/authoring/op/envelope.ts`
- Binding compile-time ops by id: `packages/mapgen-core/src/authoring/bindings.ts`
- Target modeling guidance: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`

