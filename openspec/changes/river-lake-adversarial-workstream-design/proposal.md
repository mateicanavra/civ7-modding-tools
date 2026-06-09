## Why

The previous river branch produced useful technical evidence but did not close
the product request: users still may not see rivers in Civ. A rebuilt workstream
needs adversarial design before more implementation, because the failure mode was
proof inflation: terrain-row readback was treated as a proxy for visible,
player-obvious rivers.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `openspec/changes/earthlike-visible-river-acceptance/**`
- `openspec/changes/swooper-earthlike-product-acceptance-proof/**`
- `openspec/changes/swooper-recovery-stack-product-closure/**`
- Repo skills: `civ7-systematic-workstream`, `civ7-open-spec-workstream`,
  `civ7-product-authority`, `civ7-architecture-authority`,
  `civ7-operational-debugging`

## What Changes

- Record the six-agent adversarial review of the previous river workstream.
- Replace the narrowed "terrain row equals visible river" frame with a proof
  stack that separates hydrology truth, projection plan, engine terrain
  readback, Civ river metadata, Studio display, in-game rendered visibility, and
  product acceptance.
- Define standalone OpenSpec execution slices for physical hydrology,
  architecture/DX hardening, runtime visual proof, and closure gates.
- Declare proof labels and closure blockers before the execution goal starts.

## Requires

- Current resources submodule synced and clean.
- Current branch evidence from `codex/mapgen-physical-rivers` commit
  `77b200c7c`.
- Six peer-agent notes gathered with adversarial roles and explicit findings.

## Enables Parallel Work

- Implementation teams can execute independent slices without reopening the
  product/proof frame.
- Reviewers can reject a slice that tries to close from the wrong proof class.

## Affected Owners

- OpenSpec workstream records.
- Hydrology, map-rivers, adapter/direct-control, Studio, and product acceptance
  only as planned execution surfaces.

## Forbidden Owners

- No code implementation in this design slice.
- No generated-output hand edits.
- No product closure claim from local tests, generated output, deploy logs,
  terrain readback, metadata readback, or screenshots alone.

## Stop Conditions

- Any execution slice lacks a proof oracle and closure blocker.
- Any slice treats `TERRAIN_NAVIGABLE_RIVER` readback as proof of Civ river
  metadata, gameplay semantics, or rendered visibility.
- Any slice claims minor-river stamping without a proven writer.

## Consumer Impact

Future agents get a durable, adversarially reviewed plan that names exactly what
must be true before river/lake product acceptance can close.

## Verification Gates

- `bun run openspec -- validate river-lake-adversarial-workstream-design --strict`
- `bun run openspec -- validate <each spawned change> --strict`
- `bun run openspec:validate`
- Clean worktree after committing the design branch.
