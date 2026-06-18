# Deep Habitat Phase 2 Preparation Corpus

This directory is the durable preparation corpus for designing the Phase 2 Deep Habitat Toolkit refactor workstream packet suite. It is not the packet suite and does not authorize implementation.

The controlling frame is product-first and scenario-first: Habitat is a generic repo-local structural toolkit for agents and humans. It helps classify, check, verify, guard, scaffold, apply, refuse, and recover inside a repository. The current code is evidence of present behavior, not authority for the target domain model.

## Scope

In scope:

- Establishing the source-authority order for Phase 2 packet design.
- Consolidating supported and unsupported Habitat scenarios.
- Mapping current code topology, public surfaces, side effects, and proof classes.
- Mapping target domain responsibilities to current implementation evidence.
- Identifying every refactor domino candidate, including dependencies and parallelism.
- Recording agent scratch inputs and adversarial review disposition.
- Attaching the Phase 2 packet-suite goal after review.

Out of scope:

- Writing Phase 2 domino packets.
- Implementing TypeScript refactors.
- Introducing MapGen Authoring Topology support.
- Treating Civ7 or MapGen behavior as generic Habitat authority.
- Replacing proof classes with a single generic proof framework.

## Artifacts

- [source-authority.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md)
- [scenario-corpus.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md)
- [code-topology-map.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md)
- [domain-responsibility-map.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md)
- [domino-candidate-ledger.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md)
- [agent-scratch-index.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/agent-scratch-index.md)
- [review-disposition-ledger.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md)
- [validation-results.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/validation-results.md)
- [phase2-goal.md](/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md)

## Use

Phase 2 begins only after this corpus is reviewed and the goal in `phase2-goal.md` is attached through the `create_goal` tool. The Phase 2 agent should use this corpus to produce a separate packet for every valid domino in `domino-candidate-ledger.md`, carrying each through investigation, analysis, solution design, review, and polish.

Before a domino becomes a standalone packet, it must pass the packet-minimization gate in `domino-candidate-ledger.md`: it must explain why it cannot be a section, stop condition, or acceptance criterion in an adjacent packet. The point is to preserve dependency order without inflating the packet suite into abstractions for their own sake.
