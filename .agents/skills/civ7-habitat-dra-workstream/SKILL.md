---
name: civ7-habitat-dra-workstream
description: |
  Use in Civ7 Modding Tools when owning, supervising, or implementing Habitat Harness DRA recovery work: "Habitat Harness DRA", "Habitat repair chain", "Habitat Grit pattern workstream", "recovery claim ledger", "Grit pattern corpus ledger", "implementation DRA", "DRA repair demand", "Habitat takeover frame", "Grit proof matrix", or when launching/reviewing Habitat implementation agents. Coordinates complete repair and Grit-pattern loops through product outcome, ledgers, OpenSpec, proof classes, DRA supervision, and clean Graphite closure. Do not use for ordinary Civ7 feature work outside Habitat.
---

# Civ7 Habitat DRA Workstream

## Purpose

This skill is the repo-local operating guide for Habitat Harness recovery when an agent is acting as a DRA owner, implementation DRA, supervisor, or structural watcher.

Habitat's product outcome is the controlling constraint: a repo-local executable structural operating system for agents. It must classify before authoring, generate supported structure, enforce architecture at the correct owner layer, keep baselines shrink-only, execute safe transformations with proof, and keep records and commands truthful to current behavior.

This skill does not replace the takeover frame, ledgers, OpenSpec packets, Graphite process, or current repo evidence. It routes you to them and defines the supervision/workstream loops that keep those authorities coherent.

## Required Companion Skills

Use these skills with this one when the work crosses their scope:

- `framing-design`: frame DRA goals, repair demands, supervisor messages, and workstream objectives.
- `civ7-open-spec-workstream`: run packet authority, phase records, review lanes, downstream realignment, and ship gates.
- `habitat:systematic-workstream`: turn atomic repair or pattern rows into analysis, corpus, design, implementation, review, iteration, realignment, and ship loops.
- `habitat:dra-structural-watcher`: inspect implementation DRA output from disk and issue evidence-bound correction notes.
- `civ7-architecture-authority`, `civ7-product-authority`, `civ7-operational-debugging`: load when a packet touches architecture ownership, product proof, runtime/debug proof, or command behavior.

## Operating Loop

1. Ground in the authority order and current repo state before accepting any previous claim. See [authority map](references/authority-map.md).
2. Select one lane: repair chain, Grit pattern chain, or supervision/watch. Do not blend lanes without an explicit dependency reason recorded in the active packet.
3. Require the Stage 0 row or create/repair it before implementation. A repair claim, Grit row, codemod row, or manual disposition without row-level authority is not ready to implement.
4. Open the relevant ledger row, OpenSpec packet, phase record, review ledger, downstream realignment ledger, source synthesis, and current code/tests.
5. Frame the work as a complete DRA loop: analysis, extraction/corpus, design, implementation, review, iteration, realignment, ship.
6. Keep proof classes separate. Passing OpenSpec validation, unit tests, native Grit samples, cached task output, hook success, and one command each prove different things.
7. Treat accepted P1/P2 review findings as blockers until they are repaired, source-rejected, invalidated by later evidence, or explicitly moved outside the active scope.
8. Close with updated ledgers/records, verification evidence, Graphite commit, and a clean worktree.

## Lane References

- [Authority map](references/authority-map.md): source order, required reads, proof classes, and stack hygiene.
- [DRA supervision](references/dra-supervision.md): how to launch, review, correct, and close implementation DRAs.
- [Repair chain](references/repair-chain.md): scope, sequencing, and closure rules for the core Habitat repairs.
- [Grit pattern chain](references/grit-pattern-chain.md): row contract, proof matrix, and batch discipline for pattern workstreams.
- [Proof classes](references/proof-classes.md): exact evidence labels and non-claim rules.
- [Effect substrate triggers](references/effect-substrate-triggers.md): when current orchestration should move to Effect instead of adding more handwritten control flow.
- [Pilot readiness](references/pilot-readiness.md): gate for deciding whether a new Grit row may start.
- [Review and realignment](references/review-and-realignment.md): stale-record and downstream closure discipline.

## Copy-Forward Assets

- [Implementation DRA goal template](assets/implementation-dra-goal.md): a fill-in frame for launching a repair or Grit implementation DRA with `/goal`.
- [Supervisor repair demand template](assets/supervisor-repair-demand.md): a direct-message format for requiring evidence-backed correction.
- [Supervisor review note template](assets/supervisor-review-note.md): a compact review record for accepted, rejected, or re-scoped findings.
- [Recovery claim row template](assets/recovery-claim-row.md): a row shape for repair-chain Stage 0 claims.
- [Grit pattern row template](assets/grit-pattern-row.md): a row shape for pattern, codemod, and manual disposition work.
- [Command proof log row template](assets/command-proof-log-row.md): a row shape for command evidence with proof-class labels.
- [Closure checklist](assets/closure-checklist.md): a compact ship gate for DRA workstreams.

## Non-Negotiable Invariants

- Product outcome beats local task completion.
- Fresh disk and command evidence beats historical claims.
- Every invariant has one owning layer and one enforcement surface.
- Corpus comes before pattern tuning.
- Structural transforms require a safe write path, rollback story, and proof against injected violations.
- Baselines only shrink or become more explicit through documented ownership.
- Supervisor review is a control loop, not commentary.
- Hidden dirty state, untracked generated output, stale records, and stack splits are workstream defects.

## Common Failure Modes

- Treating catalog presence as product proof.
- Treating native samples as proof of current-tree selector behavior.
- Claiming command trust through mocks, stale generated files, or cached task output.
- Expanding broad pattern waves before row-level corpus and injected-violation proof exist.
- Creating a second owner for an invariant that already belongs to Habitat, Biome, Nx, Grit, hooks, or OpenSpec.
- Letting implementation DRAs drift after a supervisor finding instead of issuing a correction demand.
