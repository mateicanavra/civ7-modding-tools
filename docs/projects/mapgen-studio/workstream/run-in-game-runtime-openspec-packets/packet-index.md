# Run In Game Runtime Packet Index

Opening status snapshot: draft packet train ready for adversarial review

Current stack closeout planning:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`.

Execution hold: do not begin or resume any packet from this index until Stage 1
of the closeout workstream has amended and strictly validated the controlling
packet authority and its verification ledger explicitly names the next
executable unit. The hold does not expire when Stage 0 opens. The closeout
ledger owns current execution state; the status above is an opening snapshot,
not permission to execute.

Source proposal:
`docs/projects/mapgen-studio/resources/run-in-game-deploy-manifest-proposal.md`

Authoring contract:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/packet-authoring-contract.md`

Target vocabulary:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/target-vocabulary.md`

Structural authority matrix:
`docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/structural-authority-matrix.md`

The packet train supersedes vocabulary sketches in the source proposal where
they differ. The proposal remains rationale; this packet index, target
vocabulary, structural authority matrix, and OpenSpec packets are the executable
contract.

## Execution Order

1. `studio-run-public-status-diagnostics`
2. `studio-run-operation-registry-identity`
3. `studio-run-explicit-cancellation`
4. `swooper-catalog-source-index`
5. `studio-run-launch-source-resolution`
6. `swooper-map-artifact-file-plan`
7. `studio-run-generation-manifest`
8. `swooper-run-manifest-generator`
9. `swooper-catalog-index-cutover`
10. `studio-run-generator-integration`
11. `studio-run-deployment-snapshot-lease`
12. `studio-run-runtime-observation`
13. `studio-run-attribution-report`
14. `studio-run-diagnostics-retention-guards`

## Domino Shape

The train moves from public contract to identity, then source authority, then
render/generation boundaries, then deployment/observation, then private
attribution and retention. Each packet leaves the system working.

The core simplification is:

```text
closed source input
  -> single-flight operation lease
  -> resolved launch source
  -> one request workspace
  -> one generation manifest
  -> one request-local generated mod
  -> copy-only deployed mod snapshot
  -> runtime observation
  -> private attribution + diagnostics
```

## Enforcement Split

Behavior tests prove product and code behavior: request validation, public
status, operation identity, cancellation, manifest writing, generated content,
deployment copy, runtime observation, attribution records, diagnostics lookup,
and retention.

Live verification is the ultimate final gate. The complete packet train is not
closed-passed until behavioral unit tests and focused behavior tests pass,
actual Studio endpoint calls exercise the run workflow, and Civilization 7
loads the generated content for the live variant matrix in
`target-vocabulary.md`.

Structural enforcement is authority-plane work: Grit for source-shape
assertions, structure-check for filesystem topology, Nx metadata for task graph
relationships, and Habitat command checks only when the required positive
assertion cannot be expressed by narrower runners.

The exact structural rows, runner ids, scan roots, lifecycle, and baseline
actions live in `structural-authority-matrix.md`.

No packet adds behavior tests whose purpose is to search for retired keys, old
paths, or previous implementation names.

Each changeset also carries the dedicated review lanes defined in
`packet-authoring-contract.md`: TypeScript refactoring, code quality/structure,
and oRPC/Effect/library correctness, including JSDoc and anchor-comment review
for cornerstone runtime code.

## Verification Command Rule

Each packet executes:

```bash
bun run openspec -- validate <change-id> --strict
bun habitat classify <diff-or-packet-write-set>
```

Then it runs every command reported by `bun habitat classify`, plus the
packet-specific behavior tests and packet-specific live endpoint checks named in
that packet. A packet with a skipped declared gate is incomplete. The final
closure packet also runs:

```bash
bun run openspec:validate
```

and the live Run in Game verification matrix from `target-vocabulary.md`.
Civilization 7 being unavailable blocks closure rather than producing an
acceptable closure record.

## Packet Dependencies

| Packet | Depends On | Unlocks |
| --- | --- | --- |
| `studio-run-public-status-diagnostics` | none | safe public/private boundary and durable diagnostics lookup |
| `studio-run-operation-registry-identity` | public status envelope | request-id operation semantics and single-flight runtime lease |
| `studio-run-explicit-cancellation` | operation registry and runtime lease | deterministic cancellation and lease release |
| `swooper-catalog-source-index` | none | catalog source ids |
| `studio-run-launch-source-resolution` | catalog source index, public status | resolved source and source digests |
| `swooper-map-artifact-file-plan` | none | pure render/write boundary |
| `studio-run-generation-manifest` | launch source resolution, operation registry | request workspace and manifest |
| `swooper-run-manifest-generator` | file plan, generation manifest | request-local generated mod |
| `swooper-catalog-index-cutover` | catalog source index, manifest generator | catalog metadata authority |
| `studio-run-generator-integration` | manifest generator, generation manifest | server workflow uses generated mod |
| `studio-run-deployment-snapshot-lease` | generator integration | copy-only deployment and lease |
| `studio-run-runtime-observation` | deployment snapshot and lease | runtime correlation observation |
| `studio-run-attribution-report` | observation and prior records | private attribution report |
| `studio-run-diagnostics-retention-guards` | all prior packets | retention and permanent authority rules |

## Review Notes

The Stage 1 advisor wave initially proposed nine packets. Adversarial review
found that diagnostics, cancellation, catalog cutover, render extraction,
generator integration, runtime observation, and attribution needed separate
dominoes. The current 14-packet train reflects those repairs.

Habitat authority review also corrected the verification model: behavior tests
remain behavioral, while structural/topological recurrence is enforced through
positive Habitat/Grit/structure/Nx assertions.
