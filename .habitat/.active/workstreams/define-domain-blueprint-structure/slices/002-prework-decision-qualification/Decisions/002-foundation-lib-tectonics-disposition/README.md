# Foundation Lib / Tectonics Disposition Decision Packet

Status: open prework decision

This packet runs the active `Foundation lib/ / Tectonics Disposition`
decision from `../../inventory.md`.

Decision:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Outcome

The packet resolves most rows: `foundation/lib/**` is not a valid final owner.
Future implementation should burn the current files down into exact owners
instead of creating a replacement shared `lib` bucket.

The packet is not closed yet. Two unresolved row classes are tracked as
first-class domino files in this directory and must be resolved within this
prework decision slice before the inventory can advance.

Concrete dispositions:

| Current row | Disposition |
| --- | --- |
| `lib/crust/buoyancy.ts` | Promote to `foundation/model/policy/crust-buoyancy.ts`. |
| `lib/normalize.ts` | Promote to `foundation/model/policy/reference-area.ts`. |
| `lib/require.ts` | Unresolved prework domino: `require-guards.domino.md`. Whole-file movement is blocked; the accepted owner class is operation-local guard support, but the exact per-export decomposition is not closed. |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | Promote to `foundation/model/policy/tectonic-event-types.ts`. |
| `lib/tectonics/constants.ts` / reset thresholds | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | Do not preserve from `lib`; the live owner is already `foundation/ops/compute-era-plate-membership/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / orogeny gain constants | Delete from `lib`; no current owner claims this duplicate export. Any future reintroduction requires a separate decision and is not part of this packet. |
| `lib/tectonics/internal-contract.ts` | Split to artifact contracts for `tectonic-events`, `tectonic-era-fields`, `plate-id-by-era`, and `tracer-index-by-era`. |
| `lib/tectonics/schemas.ts` | Split to artifact contracts for `tectonic-history`, `current-tectonics`, and `tectonic-provenance`. |
| `lib/tectonics/shared.ts` / byte, int8, vector, and mesh-neighborhood helpers | Unresolved prework domino: `tectonics-shared-core.domino.md`. Candidate core destinations exist, but the accepted destination API is not proven. |
| `lib/tectonics/shared.ts` / `deriveResetThreshold` | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, `tracing.ts` | Delete in a later source slice after import proof and typecheck/test proof. Active operation-local replacements already exist. |

This packet deliberately does not perform source movement, deletion, Grit
authoring, `structure.toml` edits, or runtime changes.

## Open Dominoes

- `require-guards.domino.md`
- `tectonics-shared-core.domino.md`

## Investigation Tooling

Start the remaining investigations with the toolchain, not with a broad manual
read:

- Narsil MCP is up, indexed on the primary worktree, and tracking the latest
  stack state. Use repo id `civ7-modding-tools#2fa31857` unless `list_repos`
  reports a newer id.
- Use Narsil for symbols, references, callers, imports, call graphs, excerpts,
  file history, blame, hotspots, recent changes, and modified-file checks.
- Use KNIP dead-code analysis for deletion confidence, with no
  fix mode and with limitations recorded.
- Use NX for project ownership, dependency shape, target availability, and
  runnable-check selection.
- Use local Git, especially `git blame` and `git log --follow`, to corroborate
  historical usage and ownership claims.

Dedicated investigation plans:

- `require-guards-investigation.md`
- `tectonics-shared-core-investigation.md`

These domino files are the source of truth for unresolved prework in this
packet. They are temporary: close them by resolving the decision in this packet,
or by converting proved executable work into a packet-linked execution slice.

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
require-guards.domino.md
require-guards-investigation.md
tectonics-shared-core.domino.md
tectonics-shared-core-investigation.md
```

No `execution.md` is present. Source migration, deletions, `structure.toml`,
Grit packets, and runtime changes belong to later implementation slices.
