## Why

The normalization packet is the accepted project baseline, but implementation
work needs a first OpenSpec slice that proves agents, docs, and future changes
route to that baseline rather than to the archived review, comparison, or
debate artifacts. This prevents stale authority from reopening D1-D5 or 0e
during later source migrations.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Status, Authority Stack, Source Material, Domino 0, and OpenSpec Handoff
  Notes.
- `openspec/config.yaml`: OpenSpec is downstream implementation change
  management and must cite accepted authority.
- `openspec/specs/change-management/spec.md`: OpenSpec changes map to bounded
  domino slices and do not introduce competing architecture authority.
- `openspec/specs/mapgen-normalization-workstreams/spec.md`: authority freeze
  precedes migration work.

## What Changes

- Verify that the packet is the single active root-level
  architecture-normalization decision artifact.
- Ensure source review/debate/comparison documents stay under
  `architecture-normalization-sources/` and are labeled as provenance.
- Route future normalization agents and workstreams to the packet and this
  OpenSpec change train.
- Audit routers, canonical docs, OpenSpec specs, standard recipe docs, stale
  stage-name docs, and source-doc links with patch/no-patch disposition.
- Record downstream docs that still need later topic-specific updates without
  changing their substantive content in this slice.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `mapgen-normalization-workstreams`: requires a concrete authority-routing
  closure gate before implementation slices begin.

## Dependencies

- Requires: none.
- Enables parallel work: config surface, import policy, Studio/core DX,
  ecology, projection, and placement specs can be implemented without
  re-litigating baseline decisions.

## Forbidden Non-Goals

- No source-code refactor.
- No config migration.
- No import guardrail enforcement.
- No topology, projection, placement, or guardrail implementation.
- No promotion of archived source materials back into active authority.

## Impact

- Affected owners: project docs, AGENTS routers, OpenSpec workstream records.
- Expected write set:
  - `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
  - `docs/projects/engine-refactor-v1/architecture-normalization-sources/**`
  - `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
  - stale standard recipe, ecology, morphology, config, or stage-name docs when
    only routing/status labels are needed
  - root and subtree `AGENTS.md` files only where routing is stale
  - `openspec/changes/**` planning records
- Protected paths: generated artifacts, source refactor targets, config
  presets, package exports.
- Stop conditions:
  - another root-level normalization decision doc is still presented as active
    authority;
  - a router points implementers to source material as normative authority;
  - the packet contradicts `openspec/config.yaml` on the accepted baseline.
- Verification gates:
  - `find docs/projects/engine-refactor-v1 -maxdepth 2 -type f | rg 'architecture-normalization'`
  - `rg -n "architecture-normalization-(review|decisions|comparison|debate)" docs .agents AGENTS.md`
  - `bun run openspec -- validate normalize-authority-routing --strict`
  - `bun run openspec:validate`
  - `git diff --check`
