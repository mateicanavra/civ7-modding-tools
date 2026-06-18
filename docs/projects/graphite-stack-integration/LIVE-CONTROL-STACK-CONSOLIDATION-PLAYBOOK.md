# Live-Control Stack Consolidation Playbook

Date: 2026-06-08

Status: normative anchor for the next workstream. This is not the execution
record and not a promise that every listed command will be run unchanged.

## Purpose

The remaining live-control/catalog Graphite stack is too atomized to drain as
hundreds of standalone PRs. The next workstream should preserve accepted
live-control behavior while reducing the local Graphite topology into semantic,
reviewable units that can then be submitted, merged, synced, and pruned through
Graphite's normal stack-drain loop.

This playbook exists to stop two failure modes:

- treating a 570-branch local-only stack as if every micro-branch deserves its
  own PR; and
- creating another recovery/adoption sink stack that duplicates work and leaves
  more source branches to account for.

This is not:

- the live-control execution workstream;
- a branch deletion recipe;
- a global restack plan;
- a toolkit-lane cleanup plan; or
- a substitute for deterministic Graphite state capture immediately before
  mutation.

The reusable pattern is: when a Graphite stack is local-only, linear, and
over-atomized, consolidate it in place into semantic branches before applying a
normal publish/merge/prune drain. The Civ7 live-control details below are the
current instance of that pattern.

## Terms

- Semantic group: a contiguous run of branches whose accepted intent can be
  reviewed as one coherent branch without hiding an important contract,
  runtime, proof, OpenSpec, or handoff boundary.
- Survivor branch: the bottom branch of a semantic group that remains after the
  other branches in that group are folded into it.
- Drain loop: the RAWR/Graphite publish, merge, sync-no-restack, inspect cycle
  used after a stack is submit-ready.
- Recovery sink: a separate stack that manually re-adopts work from another
  stack. Avoid this here because the live-control stack itself is the carrier.
- Local-only stack: a Graphite-tracked local branch chain that has no matching
  remote/PR state in the current diagnostic snapshot.

## Source Authority

This frame is grounded in four inputs:

- RAWR HQ stack drain runbook:
  `docs/process/runbooks/STACK_DRAIN_LOOP.md`
- RAWR HQ template stack drain runbook:
  `docs/process/runbooks/STACK_DRAIN_LOOP.md`
- local Graphite CLI help from Graphite `1.7.4`
- deterministic Civ7 stack snapshots and branch metadata captured during the
  Graphite cleanup workstream

The RAWR runbook owns the drain loop once a stack is submit-ready:

```bash
gt ss --publish --ai --stack --no-interactive
gt merge --no-interactive
gt sync --no-restack --no-interactive
gt ls
```

For Civ7 live-control, that loop is downstream of consolidation. The RAWR
runbook assumes a submit-ready stack with mergeable PRs. The foreground Civ7
stack is local-only and far too atomized, so blindly running `gt ss --publish`
before consolidation would turn local topology noise into hundreds of PRs.

## Current Shape

Current live-control foreground stack:

- root: `codex/local-catalog-enrichment`
- leaf: `codex/live-control-source-route-docs-adoption`
- branch count at last deterministic capture: `570`
- split count: `0`
- leaf count: `1`
- PR association: none in the captured snapshot
- remote branch presence: none in the captured snapshot
- restack state: root needs restack; descendants are otherwise reported as
  restack-ok

These facts are a starting point, not durable truth. The next workstream must
refresh them before any fold, because even a correct playbook is wrong if it is
applied to stale topology.

Relevant background:

- GT stack-inspect/toolkit is a separate owner lane and is out of scope.
- Old Earthlike/source routes are accounted by the Swooper recovery sink and
  have already been removed or marked for retirement outside this playbook.
- Live-control is now the primary remaining product stack.

## Frame

Hard core:

- Use deterministic Graphite/cache-derived stack state before mutating.
- Reconcile Graphite topology and branch metadata before any fold; do not infer
  ancestry from bottom-anchored terminal drawings alone.
- Keep the live-control stack as the work carrier; do not create another
  recovery sink unless native Graphite folding fails in a way that blocks
  progress.
- Compress local-only micro-branches into semantic branches before submit.
- Preserve public API, runtime behavior, proof, OpenSpec, CLI routing, and
  handoff boundaries unless the workstream explicitly accepts the compression.
- Use Graphite for stack mutation: fold, rename, restack, submit, merge, sync.
- Use `gt sync --no-restack` for refresh in this multi-worktree repo.
- Submit and drain only after the stack is consolidated below Graphite's
  practical submit limit.

Foreground:

- Semantic consolidation of the live-control stack.
- A bounded submit-ready stack, ideally `<= 50` branches, without making branch
  count more authoritative than semantic review boundaries.
- A native Graphite drain after consolidation.
- A clear old-branch-to-new-semantic-branch map so review and cleanup are
  understandable.

Exterior:

- No global `gt sync` that opportunistically restacks unrelated stacks.
- No global restack of toolkit or other owner lanes.
- No manual branch deletion as the normal drain path.
- No branch rename after PR creation unless the PR association loss is
  explicitly accepted.
- No CI-driven churn during folding. Validate after consolidation, not after
  every micro-fold.
- No assumption that branch-count reduction reduces product validation scope.
- No `--force`, `--always`, `--update-only`, or
  `--ignore-out-of-sync-trunk` in the normative path.

Reframe trigger:

- Graphite fold repeatedly produces conflicts or unacceptable restack churn.
- The first pilot fold changes the cumulative live-control tip diff in a way
  that cannot be explained by branch metadata cleanup alone.
- The semantic grouping crosses a contract/runtime/proof boundary that cannot be
  defended in review.
- Current Graphite state no longer matches the recorded linear 570-branch shape.
- Graphite branch metadata and cache-derived topology disagree in a way that
  changes the intended mutation target.

## Native Graphite Mechanics

`gt branch fold`

- folds the current branch into its parent;
- deletes the current branch from local Graphite metadata;
- updates descendant dependencies and restacks;
- does not touch GitHub or remote branches;
- has no range or group argument;
- has no `--no-restack` mode;
- `--keep` keeps the current branch name instead of using the parent name.

Implication: folding cannot literally defer all restacking until the end.
However, folding top-down within semantic groups bounds repeated descendant
restacks and keeps the operation inside Graphite's metadata model.

`gt branch rename`

- updates local Graphite branch metadata;
- removes PR association because GitHub PR branch names are immutable.

Implication: rename semantic survivor branches before submit.

`gt submit`

- validates restack state before pushing/opening PRs;
- supports `--dry-run`;
- supports `--stack`;
- should use `--ai` in this repo when creating PRs.

Implication: final submit starts with dry-run from the consolidated top branch,
preferably pinning the intended branch with `--branch` so the current checkout
does not accidentally change the submit set.

## Restack Policy

Restack is not part of the RAWR merge loop itself. In this workstream it has
three distinct roles:

Decision: fold before the explicit full submit-readiness restack if Graphite
allows the pilot fold to proceed cleanly. That means the workstream should try
to reduce the stack to semantic survivor branches first, then run one targeted
restack from the consolidated top branch before submit. It does not mean
"folding with no restacks at all," because Graphite fold has its own descendant
restack behavior.

1. Topology reconciliation before mutation

   - Establish whether Graphite's local metadata, deterministic cache-derived
     parentage, and the active worktree agree on the same root, leaf, and parent
     chain.
   - If they agree, do not eagerly restack 570 branches just because the root is
     stale. Move to the pilot fold.
   - If they disagree in a way that changes the intended mutation target, stop
     and repair the topology before folding.

2. Incidental restack during fold

   - `gt branch fold` restacks descendants as part of its normal operation.
   - There is no `--no-restack` fold mode in Graphite `1.7.4`.
   - This is why folding should proceed from the top of the stack toward the
     root where practical: early folds have fewer descendants, and later folds
     operate over a smaller survivor chain.
   - These fold-time restacks are not a reason to run a separate full-chain
     `gt restack` before consolidation unless the pilot fold shows the stale
     stack cannot be folded coherently.

3. Submit-readiness restack after consolidation

   - The full stack must be restacked before submit can succeed.
   - Prefer doing the major branch-to-`main` restack after consolidation, when
     the stack has semantic survivors instead of hundreds of micro-branches.
   - Use a targeted restack from the intended consolidated top branch, for
     example:

     ```bash
     gt restack --branch <consolidated-top-branch> --downstack --no-interactive
     ```

   - Do not globally restack unrelated stacks.

If the pre-consolidation stack is so stale that folds cannot proceed cleanly,
that falsifies the "fold first, restack after" strategy. At that point the
workstream should either perform one targeted full-chain restack from the current
live-control leaf or reframe the consolidation approach before mutating further.

## Consolidation Policy

The consolidation unit is a semantic branch group, not an arbitrary count range.
The count goal matters only because Graphite submission and review cannot handle
570 PRs in practice. It is an operational pressure, not the definition of
success.

Target:

- preferred: `<= 50` semantic branches;
- acceptable fallback: `< 100` branches if further folding would erase important
  review boundaries;
- unacceptable: submitting the current 570-branch stack as-is.

For each semantic group:

- the bottom branch of the group survives;
- branches above it inside the group fold into that survivor;
- the survivor is renamed before submit to describe the grouped intent;
- the branch map records original range, survivor, and semantic name.

Fold order:

- process groups from top of stack toward root when practical;
- inside each group, fold from the group's top branch down to the second branch;
- keep boundary groups separate when they own API, runtime, proof, OpenSpec, or
  handoff meaning.

Do not fold across:

- public oRPC/API contract changes;
- direct-control runtime behavior boundaries;
- CLI routing and user-facing command contract changes;
- proof and OpenSpec acceptance boundaries;
- durable handoff/accounting records.

Fold carefully, with explicit acceptance, around:

- broad type extraction waves;
- wrapper burn-down and re-export cleanup;
- compatibility intake records;
- source-route/hotseat adoption handoffs.

## Execution Model For The Next Workstream

This section gives the shape of work, not a command transcript.

1. Preflight and snapshot

   - Confirm clean worktrees for the worktree being mutated.
   - Capture current `gt ls`, deterministic cache snapshot, branch metadata,
     remote state, PR state, and worktree occupancy.
   - Run `gt sync --no-restack --no-interactive`.
   - Confirm live-control is still linear and current leaf is expected.
   - Reconcile any mismatch between `gt branch info`, cache parentage, and the
     watcher snapshot before folding. A root marked "needs restack" is not
     automatically unsafe, but it must be understood before it becomes the base
     for hundreds of metadata mutations.
   - Decide explicitly whether topology only needs reconciliation, or whether a
     targeted pre-fold restack is required because folding would otherwise be
     operating on incoherent metadata.

2. Pilot fold

   - Choose one low-risk contiguous group.
   - Capture before/after tip diff and branch count.
   - Stop if Graphite metadata, cumulative diff, or restack behavior is not
     explainable.

3. Semantic consolidation

   - Fold each approved semantic group using native Graphite fold.
   - Rename survivor branches before PR submission.
   - Maintain an original-branch-to-survivor map.
   - Keep current decisions sparse: adopted, excluded, folded into survivor,
     or kept as boundary.

4. Validation gate

   - Confirm deterministic snapshot reflects the reduced linear stack.
   - Confirm cumulative top diff still represents accepted live-control intent.
   - Run focused package checks relevant to touched areas.
   - Run `git diff --check`.

5. Submit dry-run

   - Run the targeted submit-readiness restack from the consolidated top branch.
   - Run Graphite submit dry-run from the consolidated top branch, pinned to the
     intended branch when possible.
   - Do not proceed if Graphite reports restack conflicts or more branches than
     the accepted submit target.

6. RAWR drain loop

   - Use the RAWR publish -> merge -> sync-no-restack -> inspect loop only after
     consolidation has produced a submit-ready stack.
   - Let Graphite prune merged branches.
   - Remove pinned/disposable worktrees only when they block Graphite pruning.
   - Avoid manual branch deletion except for explicitly accounted local-only
     branches outside the normal drain path.

## Candidate Semantic Groups

Ranges are 1-based positions in the live-control chain after deleting the stale
watcher handoff side route.

| # | Range | Count | Semantic group | Posture |
|---:|---|---:|---|---|
| 1 | 001 | 1 | Broad base context and local catalog enrichment | keep |
| 2 | 002-008 | 7 | Live-support fixes and early command surfaces | fold |
| 3 | 009-016 | 8 | Primary CLI play-test extraction | fold |
| 4 | 017-023 | 7 | Tuner fixture extraction and reuse | fold |
| 5 | 024-041 | 18 | Secondary CLI play-test extraction | fold |
| 6 | 042-045 | 4 | Systematic, OpenSpec, and review records | boundary |
| 7 | 046-048 | 3 | Remaining notification and priorities play tests | fold |
| 8 | 049 | 1 | Direct-control planning report | keep |
| 9 | 050-064 | 15 | Direct-control API, session, and operation tests | fold |
| 10 | 065-080 | 16 | Direct-control source and read atom extraction | fold |
| 11 | 081-086 | 6 | Postcondition and verification atoms | boundary |
| 12 | 087-100 | 14 | Wrapper extraction wave | fold |
| 13 | 101-112 | 12 | AI and hotseat compatibility gate and matrix | boundary |
| 14 | 113-134 | 22 | Capability, runtime, setup, and action source atoms | fold |
| 15 | 135-142 | 8 | Constants and postcondition helper pruning | fold |
| 16 | 143-167 | 25 | Type extraction wave | fold |
| 17 | 168-190 | 23 | Session transport, parser, serializer, and validation | fold carefully |
| 18 | 191-197 | 7 | Authority citation, backimport cleanup, and session resource helper | fold carefully |
| 19 | 198-213 | 16 | Atom completion, checkpoints, and compatibility intake | boundary |
| 20 | 214-224 | 11 | Facade dependency pruning for read and action roots | fold |
| 21 | 225 | 1 | Controller bridge substrate realignment | keep |
| 22 | 226-242 | 17 | Facade dependency pruning for setup, action, and capability roots | fold |
| 23 | 243-257 | 15 | Re-export, backimport cleanup, and dependency records | fold |
| 24 | 258-263 | 6 | Compatibility intake rows by consumer lane | boundary |
| 25 | 264-290 | 27 | Facade callthrough pruning | fold |
| 26 | 291-303 | 13 | Command-source normalization | fold |
| 27 | 304-307 | 4 | Operation helper extraction and import cleanup | fold |
| 28 | 308 | 1 | Implementation guard audit | keep |
| 29 | 309-317 | 9 | Semantic, debug, telemetry, hotseat, and procedure contracts | boundary |
| 30 | 318-329 | 12 | Debug and normal-output boundary proofs | boundary |
| 31 | 330-344 | 15 | Normal-output proof expansion and atom status | boundary |
| 32 | 345-351 | 7 | Semantic CLI, telemetry, and debug ownership seeds | boundary |
| 33 | 352-379 | 28 | Procedure core foundation, schemas, and early calls | boundary |
| 34 | 380-404 | 25 | Procedure catalog expansion and core envelopes | boundary |
| 35 | 405-416 | 12 | Control-oRPC read inventory and service guard | boundary |
| 36 | 417-422 | 6 | Proof modularization and semantic hierarchy | boundary |
| 37 | 423-430 | 8 | Attention/current and mutation oRPC procedures | boundary |
| 38 | 431-447 | 17 | Wrapper burn-down, middleware, Studio link, and proof policy | fold carefully |
| 39 | 448-464 | 17 | Controller bridge, ingress, contracts, progression, and turn ownership | boundary |
| 40 | 465-470 | 6 | CLI mutation routing through oRPC | fold carefully |
| 41 | 471-486 | 16 | Domain rehome and controller ingress rollout | boundary |
| 42 | 487-500 | 14 | Game UI controller bootstrap, ports, and send routes | boundary |
| 43 | 501-510 | 10 | Contract privatization and Game UI runtimes | boundary |
| 44 | 511-524 | 14 | World/current services and read routing through oRPC | fold |
| 45 | 525-530 | 6 | Remove caller player-input hints | fold |
| 46 | 531-546 | 16 | Simplify action hints and compact action text | fold |
| 47 | 547-567 | 21 | Remove CLI fields and simplify guidance/export surface | fold |
| 48 | 568 | 1 | Controller mutation proof requirement | keep |
| 49 | 569-570 | 2 | Terminal hotseat and source-route adoption docs | boundary |

## Acceptance For The Playbook

The playbook is valid for execution only if the next workstream can prove:

- current Graphite state still matches the foreground shape or the difference is
  explicitly reconciled before mutation;
- all live-control worktrees are clean before folding;
- the first pilot fold preserves the cumulative tip diff;
- every final survivor branch has a semantic name;
- the final stack has an explicit branch map from old branches to survivors;
- the RAWR drain loop is used after consolidation, not before; and
- final cleanup relies on Graphite prune/sync behavior unless a branch is
  explicitly outside the normal drain path and already accounted.
