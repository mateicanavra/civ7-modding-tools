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
- domain ops do computation,
- strategies encode variant behavior without exploding module count,
- rules define contracts and shared types (not ad-hoc exports everywhere).

## Audience

- Developers adding steps/ops/strategies.
- Documentation authors describing the standard recipe.

## Rules (allowed / disallowed)

### Allowed

- Add new behavior by:
  - adding an op under the relevant domain’s ops module, or
  - adding a new strategy (when behavior is a parametric variation),
  - then wiring it through a step contract.
- Keep exported surfaces small and intentional.

### Disallowed

- Steps that contain heavy domain computation (should live in ops/strategies).
- Publicly exporting internal-only types from deep inside ops/rules in a way that forces downstream type coupling.
- “Reach across domains” imports that bypass the SDK boundary model.

## Ground truth anchors

- Canonical domain modeling guidance: `docs/projects/engine-refactor-v1/resources/spec/SPEC-DOMAIN-MODELING-GUIDELINES.md`
- Step/domain/op module model: `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- Packaging and file structure posture: `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`

