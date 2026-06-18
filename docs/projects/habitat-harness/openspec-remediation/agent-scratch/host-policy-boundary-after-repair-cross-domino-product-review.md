# G-HOST After-Repair Cross-Domino/Product Rereview

## Verdict

Accepted for design/specification. No unresolved P1/P2 remain in the
cross-domino/product lane.

This acceptance is limited to the repaired G-HOST packet as an OpenSpec
design/specification record. It does not authorize source implementation, does
not mark G-HOST implementation-complete, and does not make D9, D10, D13, or D14
implementation-ready. Later source work remains blocked behind concrete D0
public-surface rows, D1 output-family/non-claim handling where output changes,
and accepted/live G-HOST projections where consumers require them.

## Review Scope

- Source packet:
  `$PHASE2_PACKET_DIR/G-HOST-host-policy-boundary-gate.md`
- Current packet:
  `$OPENSPEC_CHANGES/deep-habitat-host-policy-boundary-gate/**`
- Cross-domino dependencies checked against current disk:
  D0, D1, D9, D10, D13, D14, and D15.
- Current branch/worktree fixture:
  `$ACTIVE_REMEDIATION_WORKTREE` on `$ACTIVE_REMEDIATION_BRANCH`, matching the
  requested worktree and branch.

## Findings

| ID | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| G-HOST-ARP-XD-P1 | P1 | No P1 cross-domino/product blockers found. | Accepted. |
| G-HOST-ARP-XD-P2 | P2 | No P2 cross-domino/product blockers found. | Accepted. |
| G-HOST-ARP-XD-P3-1 | P3 | `$REMEDIATION_DIR/context.md` does not define G-HOST-specific aliases analogous to D13/D14 aliases. Current G-HOST artifacts still use shared templates (`$PHASE2_PACKET_DIR`, `$OPENSPEC_CHANGES`, `$AGENT_SCRATCH`) rather than brittle absolute paths, so traceability remains navigable and this is non-blocking. | Optional cleanup if the owner wants symmetric context aliases before packet-index status movement. |

## Cross-Domino Checks

### D0/D1 Fit

Pass. The repaired packet treats D0 and D1 as source blockers instead of local
implementation details. `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and
the downstream ledger all require D0 rows before touching public/durable
surfaces such as command output, generator help/errors, package exports, docs,
examples, or any later public declaration surface. D1 remains the owner of
output-family and non-claim vocabulary where public command/report output is
touched.

The internal first implementation shape, `$HABITAT_TOOL/src/lib/host-policy.ts`,
is explicitly constrained as an internal TypeScript module, not a user-authored
config file, repo-authored data file, documented declaration location, or public
export unless a later accepted packet and D0 rows upgrade that surface.

### D9 Fit

Pass. D9 remains the transaction owner and G-HOST owns host-specific apply-gate
facts. The repaired G-HOST packet defines `HostApplyGateProjection`, requires
D9 to consume it, and prevents D9 from keeping MapGen public-ops validation as
generic transaction semantics. D9's existing packet also keeps D10/G-HOST
authority as source blockers where protected/generated paths or host-specific
gates are touched.

### D10 Fit

Pass. G-HOST now supplies host-owned surface identity, owner, matcher, recovery,
state, and non-claim facts through `HostSurfaceProjection`; D10 consumes those
facts and remains owner of the generic protected mutation/path decision. The
packet also keeps `mod/**` generated-drift observations out of D10 guard truth
until a later declaration row explicitly upgrades them.

### D13 Fit And Canonical Traceability

Pass. D13 canonical root/package and supported-kind traceability remains
harmless because D13 still classifies package namespace/root conventions as
public compatibility and workspace-policy facts unless D0/D2/G-HOST make them
live. G-HOST does not turn Civ7, MapGen, `@civ7`, or schema-admitted unsupported
kinds into generic Habitat taxonomy. D13's `host-policy-missing` refusal remains
a generic refusal shape that depends on accepted/live G-HOST projections and
does not infer host semantics locally.

### D14 Fit

Pass. D14 remains the authoring topology fence. G-HOST may provide a
`HostAuthoringBoundaryProjection` only for relation and non-claims; it does not
make MapGen authoring topology supported, does not open authoring readiness, and
does not move D14 blocked-action/future-criteria ownership into host policy.

### D15 Trigger

Pass. D15 is not triggered by default. The repaired G-HOST downstream ledger
states that D15 triggers only if G-HOST implementation records an impossible
local command/provenance state after local DTO/projection modeling, and that
G-HOST does not authorize Effect or process-substrate migration. Nothing in the
repaired packet introduces command-provenance substrate work.

### Generic Habitat Boundary

Pass. The repaired packet keeps Habitat generic by making host facts declared
inputs and consumer projections, not built-in Habitat truth. Civ7/Swooper/MapGen
path literals are modeled as current host declaration rows, native tool
ownership stays with Nx/Biome/Grit/Git, and missing/unavailable/malformed/
conflicting declaration states are blocking/refusal states rather than silent
pass, allow, or not-applicable states.

## Validation Run

| Command | Result | Review Meaning |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` | exit 0, change valid | G-HOST OpenSpec shape validates on current disk. |
| `bun run openspec:validate` | exit 0, 249 passed / 0 failed | Full OpenSpec corpus remains structurally valid. |
| `git diff --check` | exit 0 | Current diff has no whitespace hygiene failures. |

These gates do not prove source behavior or runtime host-policy enforcement;
they only support the design/specification acceptance above.
