# D4 Final Topology / Cross-Domino Rereview

## Sources Read

- Required review skills, read in full:
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/solution-design/SKILL.md`
  - `/Users/mateicanavra/.codex/plugins/cache/rawr-hq/cognition/1.0.0/skills/system-design/SKILL.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/SKILL.md`
  - all files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/references/`
  - both assets under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/.agents/skills/typescript-refactoring/assets/`
- D4 packet artifacts, read in full:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/proposal.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/design.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/specs/habitat-harness/spec.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/tasks.md`
  - all requested files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/openspec/changes/deep-habitat-d4-orientation-routing/workstream/`
- Cross-domino context, read as review inputs:
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/context.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/phase2-workstream-packets/D4-orientation-and-routing.md`
  - accepted D0, D1, D2, and D3 proposal/design/spec/downstream-ledger materials
  - D14 phase packet and D14 OpenSpec scaffold enough to judge the handoff contract
  - current classify source, tests, public exports, command adapter, and adjacent classify docs
  - all existing D4 scratch investigations and review files under `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/agent-scratch/`
- Verification commands:
  - `bun run openspec -- validate deep-habitat-d4-orientation-routing --strict` passed.
  - `bun run openspec:validate` passed: 249 passed, 0 failed.
  - `git -C /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation diff --check` passed.

## Verdict

Accepted for design/specification only.

The repaired D4 Classify Orientation and Routing packet has no unresolved P1/P2 code-topology, TypeScript state-space, dependency, or cross-domino blockers. The packet is now specific enough to guide implementation after its explicit source preconditions are satisfied, but this rereview does not authorize source implementation.

## P1/P2 Findings

None.

The prior P1/P2 blockers are repaired at design/spec level:

- The TypeScript result state-space is now closed around named variants: `project-path`, `workspace-path`, `diff`, `malformed-or-pathless-diff`, `unresolved-owner`, and D3-owned `graph-refusal`.
- Required and forbidden field combinations are stated concretely enough to prevent the previous invalid optional-state model, including the invalid `project: null` plus project fields shape, runnable targets on refusal states, empty path diffs, raw `scope`, and catch-all `note?: string` diagnostics.
- The implementation sequence is explicit: characterize current behavior, introduce the closed union, preserve the D0 facade while migrating callers, then delete invalid optionals and adapter-only compatibility fields after downstream migration.
- D0/D1/D2/D3 dependencies are now separated correctly between design-consumable inputs and source-blocking prerequisites. D4 can consume accepted design language now, while source remains blocked on concrete D0 public-surface rows and live D2/D3 exports/facts where required.
- D4 consumes D3 `GraphRefusal` / `graph-refusal` and does not claim a D4-owned graph state.
- The write set and protected paths are concrete enough to prevent D2, D3, D7, D13, and D14 ownership leaks during implementation.
- The D14 handoff is exact enough for design/spec review: D4 owns the classify example corpus and explicitly lists the positive, refusal, malformed/pathless diff, unavailable-target, unresolved-routing, and graph-refusal examples D14 must consume rather than invent.

## P3 Findings

- P3: Acceptance bookkeeping remains open. `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation/docs/projects/habitat-harness/openspec-remediation/packet-index.md` still marks D4 as a draft scaffold/blocking packet, and the D4 closure checklist still has final review/index/validation boxes open. This is post-rereview bookkeeping, not a remaining design blocker.
- P3: The D0 public-surface compatibility table still uses `blocked-pending-d0-row` placeholders. That is acceptable for design/specification acceptance because D4 repeatedly treats concrete D0 rows as a source implementation precondition, but those placeholders must be resolved before source work starts.

## Acceptance Conditions

- Accept D4 only as a design/specification packet.
- Do not begin source implementation until the packet's own source preconditions are satisfied, especially concrete D0 facade rows, D2 `ruleRoutingFacts`, and D3 project ownership/target availability/`GraphRefusal` exports.
- Keep D4 implementation bounded to the declared write set: classify command/model/adapter/tests/exports and adjacent docs only.
- Preserve D2/D3/D7/D13/D14 ownership: D4 may consume their contracts but must not create substitute registries, graph states, topology fences, or example authority.
- Complete the post-acceptance packet-index and closure-checklist updates after this verdict is adopted.

## Final Recommendation

Accept the repaired D4 OpenSpec packet for design/specification.

There are no remaining P1/P2 blockers in the code-topology, TypeScript state-space, dependency, or cross-domino review surfaces. The packet should advance out of final rereview as a design-approved implementation plan, with source implementation still gated by the explicit D0/D2/D3 prerequisites and normal implementation validation.
