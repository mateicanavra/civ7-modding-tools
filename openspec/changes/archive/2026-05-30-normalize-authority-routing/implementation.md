# Authority Routing Implementation Record

Date: 2026-05-30
Branch: `codex/normalize-authority-routing-impl`
Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-normalize-authority-routing`

## Scope

This record closes the Domino 0 routing slice for the MapGen / Swooper Maps
normalization train. It records authority inventory, router updates, downstream
disposition, and review lanes without changing source behavior.

Controlling authority:

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `openspec/changes/normalize-authority-routing/{proposal.md,design.md,tasks.md}`
- `openspec/specs/mapgen-normalization-workstreams/spec.md`

## Authority Inventory

Root-level architecture-normalization decision artifacts under
`docs/projects/engine-refactor-v1/`:

- Active packet: `architecture-normalization-packet.md`
- Source material only:
  - `architecture-normalization-sources/architecture-normalization-review.md`
  - `architecture-normalization-sources/architecture-normalization-review-independent.md`
  - `architecture-normalization-sources/architecture-normalization-decisions-codex.md`
  - `architecture-normalization-sources/architecture-normalization-decisions-independent.md`
  - `architecture-normalization-sources/architecture-normalization-decisions-comparison.md`
  - `architecture-normalization-sources/architecture-normalization-decision-debate.md`

`architecture-normalization-sources/README.md` already labels the source files
as provenance and states that they are not active decision authority.

## Router Updates

Patched entrypoints:

- `AGENTS.md`: added the active normalization packet and OpenSpec train under
  the MapGen / Swooper Maps domain router.
- `mods/mod-swooper-maps/AGENTS.md`: added the packet and train as the
  normalization route and corrected stale lowercase MapGen doc paths.
- `packages/mapgen-core/AGENTS.md`: added the packet and train as the
  normalization route and corrected stale lowercase MapGen doc paths.
- `packages/civ7-adapter/AGENTS.md`: routed truth/projection normalization to
  the packet and stable MapGen policy docs.
- `docs/system/libs/mapgen/MAPGEN.md`: added the packet as the normalization
  entrypoint and clarified that OpenSpec is downstream implementation
  management.
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`: added a normalization
  note so stale `advanced`/stage/projection language does not compete with the
  packet.
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`: added a
  normalization-status section and moved stale config posture into transitional
  status language.

## Downstream Disposition

Patch now:

- Authority entrypoints and status labels that could send implementers to stale
  source material or stale `advanced` posture.

Patch in later topic slices:

- Full standard recipe stage-list reconciliation: `normalize-ecology-topology`,
  `normalize-morphology-catalog-owners`, `normalize-projection-lakes`,
  `normalize-placement-contracts`, and `normalize-placement-reconciliation`.
- Config schema/defaults/Studio/presets migration:
  `normalize-config-surface`.
- Import-policy enforcement: `normalize-import-boundaries`.
- Evergreen promotion and guardrails: `normalize-guardrails-promotion`.

No patch:

- Archived project resources and source-material documents that are explicitly
  retained as provenance.
- Generated outputs and lockfiles.
- Source code, recipe configs, Studio, presets, stage topology, placement,
  lake projection, or guardrails; those are outside this slice.

## Review Disposition

Architecture lane:

- The packet remains the only active root-level normalization decision
  artifact. Source materials stay retained but non-normative.

Product/DX lane:

- Implementer entrypoints now route future contributors to the packet and
  OpenSpec train before package-local docs that still carry transitional
  language.

Adversarial lane:

- No alternate active decision artifact was found outside the source-material
  directory.
- The standard recipe and architecture explanation still contain topic-specific
  drift. This slice labels the drift and assigns substantive repair to the
  corresponding implementation slices instead of rewriting behavior claims
  without source changes.

## Verification

Required gates for closure:

- `find docs/projects/engine-refactor-v1 -maxdepth 2 -type f | rg 'architecture-normalization'`
- `rg -n "architecture-normalization-(review|decisions|comparison|debate)" docs .agents AGENTS.md openspec -g '!docs/projects/engine-refactor-v1/architecture-normalization-sources/**'`
- `bun run openspec -- validate normalize-authority-routing --strict`
- `bun run openspec:validate`
- `git diff --check`

OpenSpec validation in the dedicated worktree used the primary checkout's
installed project executables on `PATH` because the fresh worktree does not
have its own `node_modules/` directory. No dependency install or lockfile edit
was required.

Results from this worktree:

- Authority inventory found one active packet plus the six source-material
  files listed above.
- The source-material reference search outside
  `architecture-normalization-sources/` returned only the packet's source
  material list and this implementation record.
- `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec -- validate normalize-authority-routing --strict`
  passed.
- `PATH="/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools/node_modules/.bin:$PATH" bun run openspec:validate`
  passed with 12 items validated and 0 failures.
- `git diff --check` passed.
