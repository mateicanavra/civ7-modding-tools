## Why

Existing parity records show bounded launch/generation proof and partial or
failing local-vs-live diffs. Product proof remains unresolved until final
terrain, biome, feature, and resource surfaces either match or have classified
engine-policy deltas with explicit ownership.

## Target Authority Refs

- `openspec/changes/swooper-stack-recovery-consolidation/workstream/branch-recovery-ledger.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-corpus-ledger.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/parity-verification-and-runtime-proof.md`
- `openspec/changes/studio-live-civ7-map-sync/workstream/review-disposition-ledger.md`
- `packages/civ7-adapter/**` and `packages/civ7-map-policy/**` policy surfaces

## What Changes

- Produce a fresh full-grid local/Studio vs live Civ parity proof from an exact
  authorship run.
- Add one operator command path for that proof:
  `bun run verify:final-surface-parity`.
- Classify every terrain, biome, feature, and resource delta as local policy
  gap, accepted engine materialization, projection/visualization issue, or
  product blocker.
- Repair local policy only when the delta belongs to repo-owned policy or
  pipeline truth.
- Record residual deltas and route them to targeted repair workstreams.

## Requires

- `studio-civ7-exact-authorship-proof`
- Existing parity corpus ledgers and final-surface diagnostic dump/readback
  tools

## Enables Parallel Work

- Product acceptance proof over known-good or classified final surfaces.
- Evidence-gated targeted repairs for visible rivers, mountain regions,
  feature/resource legality, starts/readback, or map-size policy.

## Affected Owners

- `packages/civ7-adapter/**`
- `packages/civ7-map-policy/**`
- `mods/mod-swooper-maps/**` only for proof-backed pipeline/materialization gaps
- `packages/civ7-direct-control/**` only for missing full-grid readback support

## Forbidden Owners

- No engine readback as authored truth.
- No hand-authored official data lists.
- No visual tuning before exact authorship and final-surface evidence exist.

## Stop Conditions

- Full-grid readback cannot be produced or bounded to the exact authorship run.
- Deltas cannot be classified with source evidence.
- A required direct-control read wrapper would become a caller-local script
  instead of a package-owned surface.

## Consumer Impact

Developers get an auditable parity ledger that separates local prediction gaps,
engine materialization policy, and real product blockers.

## Verification Gates

- Fresh exact-authorship proof input.
- Full-grid local-vs-live diff or a documented executable gap.
- Focused policy tests for repaired deltas.
- OpenSpec strict validation.
