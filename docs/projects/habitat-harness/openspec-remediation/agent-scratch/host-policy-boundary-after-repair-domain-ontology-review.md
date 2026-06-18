# G-HOST After-Repair Final Domain/Ontology Rereview

## Verdict

Accepted for design/specification in this lane.

No unresolved P1/P2 findings remain for the G-HOST domain model, ontology, owner split, or host-policy declaration/refusal boundary on the current disk state. This acceptance is design/specification only. It does not authorize source implementation, does not prove generated outputs are current, and does not make D9/D10/D13/D14 source work implementation-complete.

## Current Disk State Reviewed

- Source packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md`.
- Current packet: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/`.
- Remediation context/index: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`.
- Current source evidence only, including `tools/habitat-harness/src/lib/generated-zones.ts`, `tools/habitat-harness/src/lib/grit-apply.ts`, `tools/habitat-harness/src/plugin.js`, `tools/habitat-harness/src/rules/rules.json`, and `tools/habitat-harness/src/generators/project/generator.cjs`.

## Repair Verification

- Internal declaration module repair is present across controlling artifacts. The source packet says the first implementation declaration source is `$HABITAT_TOOL/src/lib/host-policy.ts`, not user-authored config (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:89`). The design makes that module the single internal source for current declaration constants, parser/validator functions, and projections (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:251`). The spec forbids introducing user-authored config, repo-authored declaration data, documented declaration location, or public export without a later packet and D0 rows (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:10`).
- The stale generated-zone unit command has been removed from active packet control. The source packet now names `test/lib/host-policy.test.ts` and `test/lib/grit-apply.test.ts` as later implementation test targets, with host-policy fixtures created by implementation (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/G-HOST-host-policy-boundary-gate.md:137`). Active OpenSpec tasks require host declaration tests and adjacent D9/D10/D13 gates without citing the nonexistent `generated-zones.test.ts` path (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/tasks.md:55`).
- `unsupported` is now correctly modeled as declaration/refusal outcome, not declaration-source read state. The design explicitly says `unsupported` is not a declaration-source read state and routes it through `UnsupportedHostShapeDeclaration` or refused/blocked `HostProjectSupportProjection` (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:145`). The spec separates declaration-source states from unsupported declaration/refusal outcomes (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:111`).
- The owner split is now operational. G-HOST owns host policy identity, owner identity, declarations, recovery instructions, apply gates, project support/refusal facts, invalid/missing policy states, and consumer projections (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:15`). D10, D9, D13, D14, D0, and D1 adjacent ownership is separated in the design (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/design.md:28`) and in normative spec scenarios (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-host-policy-boundary-gate/specs/habitat-harness/spec.md:63`).
- The current declaration matrix matches current source evidence at design level: generic generated-zone constants still carry host paths/recovery strings (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/generated-zones.ts:17`), file-layer rules reference generated zone ids (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/rules/rules.json:570`), generated-check mirrors map artifacts and external resources (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/plugin.js:130`), `grit-apply.ts` still owns MapGen public-ops target validation in generic transaction code (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/lib/grit-apply.ts:830`), and project-generator unsupported kinds are current host-owned refusal evidence (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/tools/habitat-harness/src/generators/project/generator.cjs:51`).

## P1 Findings

None.

## P2 Findings

None.

## P3 Findings

### P3: Packet-index global rule still under-names D9

The G-HOST row correctly says G-HOST enables `D10, D13, D9 host-gate consumption` and keeps source implementation blocked behind D0, D1, and accepted/live G-HOST projections (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md:28`). The later global rule still says only that G-HOST must resolve host-policy boundaries before D10 or D13 claim generic closure (`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md:60`).

This is non-blocking because the G-HOST packet, packet-index row, proposal, design, spec, tasks, and downstream ledger all model D9 host-gate consumption directly. Clean up the global rule when the index is next touched for acceptance/status movement.

## Validation Commands

- `bun run openspec -- validate deep-habitat-host-policy-boundary-gate --strict`: exit 0.
- `bun run openspec:validate`: exit 0; 249 passed, 0 failed.
- `git diff --check`: exit 0.

## Final Lane Decision

Accepted for design/specification. No unresolved P1/P2 findings remain after the requested repairs. The only residual item in this lane is the P3 packet-index wording cleanup above.

Skills used: domain-design, information-design, ontology-design, solution-design, civ7-open-spec-workstream, typescript-refactoring.
