<toc>
  <item id="purpose" title="Purpose"/>
  <item id="audience" title="Audience"/>
  <item id="rules" title="Rules (allowed / disallowed)"/>
  <item id="anchors" title="Ground truth anchors"/>
</toc>

# Policy: module shape

## Purpose

Keep MapGen code and docs aligned to a stable module boundary model:

- steps orchestrate,
- domains and direct modules route cohesive operation families,
- domain ops do computation,
- strategies encode variant behavior without exploding module count,
- artifacts belong to the module that produces them,
- model atoms and policy live at their lowest shared semantic owner.

## Audience

- Developers adding steps/ops/strategies.
- Documentation authors describing the standard recipe.

## Rules (allowed / disallowed)

### Allowed

- Add new behavior by:
  - adding an op under the relevant domain module's `ops/` directory, or
  - adding a new strategy (when behavior is a parametric variation),
  - then wiring it through a step contract.
- Compose each domain from direct children under `modules/`. A direct module
  owns `contract.ts`, `router.ts`, an operation registry, and any artifacts it
  produces. The hierarchy currently stops after this direct module level.
- Use the singular `ops/contract.ts` as the module's operation-contract
  registry and `ops/index.ts` as its implementation registry. Contract
  authorities are default-only; the registry does not re-export constituent
  leaf contracts.
- Create optional `model/atoms` or `model/policy` only when the owning domain or
  module has real shared vocabulary at that level.
- Keep complete operation input/output envelopes as direct inline schemas in
  the leaf `contract.ts`. Compose only their smaller fields and cohesive
  subentities from exact nearest-owner atoms.
- Keep each complete artifact payload schema local to `defineArtifact`. Compose
  smaller atom schemas inside that root and keep identity/refinement local;
  aggregate artifacts only in `artifacts/index.ts`.
- Put strategy configuration in the semantic strategy leaf contract. Do not add
  a detached `StrategySchema` authority to the operation contract while the
  dedicated strategy-topology migration is completing the typed registration
  surface.
- Keep exported surfaces small and intentional.

### Disallowed

- Steps that contain heavy domain computation (should live in ops/strategies).
- Flat domain-level operation or artifact cabinets that erase their semantic
  module owner.
- Empty model directories or vocabulary hoisted above its lowest common owner.
- Reusing a contract input/output envelope or complete artifact payload schema
  as domain model vocabulary, even through a renamed atom.
- Publicly exporting internal-only types from deep inside ops/rules in a way that forces downstream type coupling.
- “Reach across domains” imports that bypass the SDK boundary model.

## Ground truth anchors

- Domain and module model: `docs/system/libs/mapgen/explanation/DOMAIN-MODELING.md`
- Operation contract and strategy model: `docs/system/libs/mapgen/reference/OPS-MODULE-CONTRACT.md`
- Artifact ownership and admission: `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- Current implemented example: `mods/mod-swooper-maps/src/domain/foundation/`
