# G-HOST Final OpenSpec / Information / Testing Rereview

## Verdict

Blocked.

The repaired OpenSpec packet is materially stronger than the first-wave state: it now defines owner boundaries, closed declaration variants, declaration states, consumer projections for D9/D10/D13/D14, downstream realignment rows, and design-time validation gates. However, this lane cannot accept the packet for design/specification yet because two implementation-control gaps remain in the current disk state.

## Structural Validations Observed

- `git status --short --branch` confirms the active branch is `codex/host-policy-boundary-gate-packet` with pre-existing unstaged packet/scratch edits.
- `gt status` passes through `git status` and reports the same dirty worktree.
- `bun run openspec -- list` reports `deep-habitat-host-policy-boundary-gate` as active with `0/28 tasks`, consistent with design/specification-only status.
- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict` exits 0.
- `bun run openspec:validate` exits 0 with 249 OpenSpec items passed.
- Packet index now includes D9 host-gate consumption in the G-HOST row at `docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`.
- D13 canonical traceability is not treated as active G-HOST size-framing: the active G-HOST row is at `docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`, the D13 row only records D13's own dependency state at `docs/projects/habitat-harness/openspec-remediation/packet-index.md:33`, and the traceability table is a source-file/change-slug map at `docs/projects/habitat-harness/openspec-remediation/packet-index.md:63`.

## P1 Findings

None.

## P2 Findings

### P2-1: Wording/control audit still fails on the source packet's active validation command

The phase record requires a wording/control audit over the source packet, OpenSpec change files, packet index, context, and G-HOST scratch with no stale control wording outside quoted historical findings (`openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/phase-record.md:36`). The source packet still presents `bun run --cwd tools/habitat-harness test -- test/lib/generated-zones.test.ts test/lib/grit-apply.test.ts` as a validation command/proof template (`docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:132`). The live topology review records that `tools/habitat-harness/test/lib/generated-zones.test.ts` is absent and says not to cite it until created (`docs/projects/habitat-harness/openspec-remediation/agent-scratch/host-policy-boundary-code-vendor-topology-review.md:81`, `docs/projects/habitat-harness/openspec-remediation/agent-scratch/host-policy-boundary-code-vendor-topology-review.md:143`).

This is a control inconsistency because the review ledger claims the stale generated-zone test path was repaired by avoiding it in validation gates (`openspec/changes/deep-habitat-host-policy-boundary-gate/workstream/review-disposition-ledger.md:21`), while the audit scope still includes the source packet that cites the stale command.

Repair requirement:

- Update the source packet proof template to remove `test/lib/generated-zones.test.ts`, replace it with the accepted focused generated/protected declaration test obligation or live adjacent test command, and preserve the non-claim that source packet commands are not sufficient implementation proof.
- Alternatively, explicitly mark that source-packet proof block as provenance-only and non-executable, then make the phase-record wording/control audit exclude provenance-only source-prep commands.
- Re-run `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`, `bun run openspec:validate`, and `git diff --check`.

### P2-2: The declaration source/format/location remains an implementation-time design decision

The spec requires handling unavailable, malformed, and conflicting declaration sources (`openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:25`), and the tasks require adding a declaration parser/validator (`openspec/changes/deep-habitat-host-policy-boundary-gate/tasks.md:18`). But the design only names `$HABITAT_TOOL/src/lib/host-policy*.ts` "or an equivalent owning module" (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:251`) and leaves a host declaration data file conditional on whether implementation selects one (`openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:263`). That leaves the executor to decide whether declarations are code, repo-authored data, user-authored config, or another source shape.

This violates the packet's "no design decisions for implementation" bar. It also weakens D0/D1 routing because public-surface handling depends on whether the declaration source is internal, exported, documented, or user-authored (`openspec/changes/deep-habitat-host-policy-boundary-gate/proposal.md:101`, `openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:282`).

Repair requirement:

- Choose the first implementation declaration source shape before acceptance: internal TS-owned declaration module, repo-authored data file, documented/user-authored host config, or another single named source.
- Name the exact owning path or path pattern for that source, and state whether it is internal-only or public/durable.
- If the chosen source is public/durable, require the concrete D0 row before source work; if internal-only, record the preserve/document-only D0 dependency the implementation relies on.
- Keep alternate declaration source shapes as future work unless a later accepted packet upgrades them.

## P3 Findings

None.

## Closure Position

Do not mark G-HOST accepted for design/specification yet. After the two P2 repairs above, this lane should rerun on the same disk state and confirm that no unresolved P1/P2 remain before the review ledger, closure checklist, and packet-index row move to accepted-for-design/specification.

Skills used: domain-design, information-design, solution-design, testing-design, civ7-open-spec-workstream, typescript-refactoring.
