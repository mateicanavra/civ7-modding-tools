# Foundation Lib / Tectonics Disposition Decision Packet

Status: resolved prework decision; execution closed through Slice 6

This packet runs the active `Foundation lib/ / Tectonics Disposition`
decision from `../../inventory.md`.

Decision:

```text
classify each foundation `lib/**` file as domain model policy/data,
operation-local implementation, artifact contract, core mechanics, or deletion.
```

## Outcome

The packet is fully resolved at the prework decision layer:
`foundation/lib/**` is not a valid final owner, and every row has an exact
destination/action for execution.

No owner-law blocker remains. Execution Slices 1-6 have completed the
artifact-contract construction, artifact caller migration, vocabulary-free core
API construction, core caller migration, and `foundation/lib/**` deletion under
the proof gates named in `execution.md`. The final verification gate is green
after the Slice 6 verifier repair recorded there, and final supervisor review
accepted the repaired packet state.

Concrete dispositions:

| Current row | Disposition |
| --- | --- |
| `lib/crust/buoyancy.ts` | Promote to `foundation/model/policy/crust-buoyancy.ts`. |
| `lib/normalize.ts` | Promote to `foundation/model/policy/reference-area.ts`. |
| `lib/require.ts` | Resolved by `require-guards.domino.md`: route guard semantics to contract-owned artifact modules under `foundation/artifacts/*.artifact.ts`; concrete file/export shape is governed by the active artifact scope pattern. |
| `lib/tectonics/constants.ts` / `EVENT_TYPE` | Promote to `foundation/model/policy/tectonic-event-types.ts`. |
| `lib/tectonics/constants.ts` / reset thresholds | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/constants.ts` / `ADVECTION_STEPS_PER_ERA` | Move to `foundation/ops/compute-tracer-advection/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / `ERA_COUNT_MIN`, `ERA_COUNT_MAX` | Do not preserve from `lib`; the live owner is already `foundation/ops/compute-era-plate-membership/rules/constants.ts`. |
| `lib/tectonics/constants.ts` / orogeny gain constants | Delete from `lib`; no current owner claims this duplicate export. Any future reintroduction requires a separate decision and is not part of this packet. |
| `lib/tectonics/internal-contract.ts` | Split to artifact contracts for `tectonic-events`, `tectonic-era-fields`, `plate-id-by-era`, and `tracer-index-by-era`. |
| `lib/tectonics/schemas.ts` | Split to artifact contracts for `tectonic-history`, `current-tectonics`, and `tectonic-provenance`. |
| `lib/tectonics/shared.ts` / `NeighborhoodMesh`, byte/int8/vector helpers, and mesh-neighborhood helpers | Resolved by `tectonics-shared-core.domino.md`: extract accepted vocabulary-free APIs into existing `@swooper/mapgen-core` `lib/math`, `lib/grid`, and `lib/mesh` subpaths, except replace local `clamp01` with existing core `clampFinite(value, 0, 1, 0)`. |
| `lib/tectonics/shared.ts` / `deriveResetThreshold` | Move to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`. |
| `lib/tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, `tracing.ts` | Deleted during execution after import proof and typecheck/test proof. Active operation-local replacements already exist. |

This packet did not authorize unrelated Grit authoring, `structure.toml` edits,
runtime changes, or source movement outside the closed disposition rows. Source
movement and deletion happened only through the packet-linked execution slices.

## Domino Closure

- `require-guards.domino.md` is resolved. Every guard has a contract-owned
  artifact destination/action.
- `tectonics-shared-core.domino.md` is resolved. Every exported symbol has an
  accepted core, existing-core replacement, operation-local policy, or deletion
  action.

## Investigation Tooling

Completed investigations started with the toolchain, not with a broad manual
read:

- Narsil MCP is up, indexed on the primary worktree, and tracking the latest
  stack state. Use repo id `civ7-modding-tools#2fa31857` unless `list_repos`
  reports a newer id.
- Use Narsil for symbols, references, callers, imports, call graphs, excerpts,
  file history, blame, hotspots, recent changes, and modified-file checks.
- KNIP was not available during the earlier unused-code pass. Deletion rows are
  therefore supported by source/import scans and duplicate-owner evidence here,
  and must be re-proved in execution with import scans plus relevant check/test
  proof. If KNIP is available during execution, use it as supporting evidence
  only, with no fix mode and with limitations recorded.
- Use NX for project ownership, dependency shape, target availability, and
  runnable-check selection.
- Use local Git, especially `git blame` and `git log --follow`, to corroborate
  historical usage and ownership claims.

Dedicated investigation plans and evidence:

- `require-guards-investigation.md`
- `tectonics-shared-core-investigation.md`
- `evidence/require-guards-agent-a.md`
- `evidence/require-guards-agent-b.md`
- `evidence/require-guards-agent-c.md`
- `evidence/tectonics-shared-core-agent-a.md`
- `evidence/tectonics-shared-core-agent-b.md`
- `evidence/tectonics-shared-core-agent-c.md`

The domino files are now closure records. They fed the packet-linked execution
slices and no longer represent open trackers.

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
  require-guards-agent-a.md
  require-guards-agent-b.md
  require-guards-agent-c.md
  tectonics-shared-core-agent-a.md
  tectonics-shared-core-agent-b.md
  tectonics-shared-core-agent-c.md
synthesis/
  disposition-table.md
reviews/
  review-findings.md
execution.md
require-guards.domino.md
require-guards-investigation.md
tectonics-shared-core.domino.md
tectonics-shared-core-investigation.md
```

`execution.md` contains the execution record for Slices 1-6. The slices are
closed after supervisor acceptance. `structure.toml`, Grit packets, runtime
changes, and unrelated cleanup remain out of scope unless a later accepted
slice explicitly adds them.
