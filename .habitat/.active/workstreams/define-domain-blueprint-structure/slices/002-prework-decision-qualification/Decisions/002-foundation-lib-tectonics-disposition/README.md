# Foundation Lib / Tectonics Disposition Decision Packet

Status: closed prework decision

This packet answers the completed `Foundation lib/ / Tectonics Disposition`
decision from `../../inventory.md`.

Decision:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Outcome

The packet resolves the prework decision: `foundation/lib/**` is not a valid
final owner. Future implementation should burn the current files down into the
specific owners below instead of creating a replacement shared `lib` bucket.

Concrete dispositions:

| Current row | Disposition |
| --- | --- |
| `lib/crust/buoyancy.ts` | Promote to `foundation/model/policy/crust-buoyancy.ts`. |
| `lib/normalize.ts` | Promote to `foundation/model/policy/reference-area.ts`. |
| `lib/require.ts` | Block whole-file movement. Default disposition is operation-local decomposition: split guards into consuming operation `rules/input-guards.ts` files. Do not create a shared artifact-validation owner unless a later owner-law domino explicitly overrides this default. |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | Promote to `foundation/model/policy/tectonic-event-types.ts`. |
| `lib/tectonics/constants.ts` / reset thresholds | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | Do not preserve from `lib`; the live owner is already `foundation/ops/compute-era-plate-membership/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / orogeny gain constants | Delete from `lib` unless a later recipe-stage or foundation-policy decision explicitly claims the duplicated recipe calculation. |
| `lib/tectonics/internal-contract.ts` | Split to artifact contracts for `tectonic-events`, `tectonic-era-fields`, `plate-id-by-era`, and `tracer-index-by-era`. |
| `lib/tectonics/schemas.ts` | Split to artifact contracts for `tectonic-history`, `current-tectonics`, and `tectonic-provenance`. |
| `lib/tectonics/shared.ts` / byte, int8, vector, and mesh-neighborhood helpers | Out of the next mechanical source-moving slice. Assign to named later domino: `Core Mechanics Extraction Proof - foundation tectonics shared helpers`, with candidate destinations under `packages/mapgen-core/src/lib/math/**` and `packages/mapgen-core/src/lib/mesh/**`. |
| `lib/tectonics/shared.ts` / `deriveResetThreshold` | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, `tracing.ts` | Delete in a later source slice after import proof and typecheck/test proof. Active operation-local replacements already exist. |

This packet is complete as a decision packet. It deliberately does not perform
source movement, deletion, Grit authoring, `structure.toml` edits, or runtime
changes.

## Remaining Signals Before Implementation

No remaining signal blocks this packet from being used as prework proof after
the dispositions above. The remaining signals block only later implementation:

- **Operation guard decomposition:** `lib/require.ts` is not a shared owner.
  The next source-moving slice should split its guards into operation-local
  files. A shared artifact-validation owner would be a later explicit override,
  not this packet's default.
- **Core extraction proof:** `lib/tectonics/shared.ts` helpers that look generic
  are excluded from the next mechanical source-moving slice and assigned to the
  named later domino `Core Mechanics Extraction Proof - foundation tectonics
  shared helpers`.
- **Mixed-row execution shape:** `constants.ts`, `internal-contract.ts`,
  `schemas.ts`, and `shared.ts` must be split by symbol group; none should move
  as a whole file.
- **Deletion proof:** unimported duplicate tectonics files should be deleted
  only with source import proof plus the relevant foundation check/test proof.

## Artifacts

```text
workstream.md
context.md
agent-briefs.md
corpus/
  architecture-authority.md
  source-inventory.md
evidence/
  relationship-evidence.md
  unused-code-evidence.md
synthesis/
  disposition-table.md
reviews/
  review-findings.md
```

No `execution.md` is present. Source migration, deletions, `structure.toml`,
Grit packets, and runtime changes belong to later implementation slices.
