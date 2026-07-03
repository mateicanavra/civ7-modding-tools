# Runtime Effect Recovery Design Phase Record

## Phase

- Project: Studio runtime Effect recovery.
- Phase id: `runtime-effect-recovery-design`.
- Branch: `codex/runtime-effect-recovery-design`.
- Parent slice: `codex/runtime-effect-prework-frame`.
- Status: design reviewed, approved, and executed through R0-R3 docs/OpenSpec
  realignment; R4 closeout audit in progress; no runtime implementation edits.
- Started: 2026-06-16.

## Objective

Design the full remaining change set before implementation resumes. The design
must reconcile current `origin/main` through `#1748` against the accepted
runtime frame, OpenSpec packet train, prework packet corpus, problem
classification, and D0-D12 packet records. The output is a reviewed sequence of
docs/OpenSpec realignment slices with explicit owners, forbidden owners, write
sets, proof classes, review lanes, stop conditions, and validation gates.

## Exterior

- Runtime TypeScript/code changes.
- Public contract redesign.
- Live Civ7 proof reruns.
- Graphite submit, merge, or drain operations.
- Broad restack of unrelated Habitat branches.
- Generated output edits.

## Hard Core

1. Current `origin/main` evidence supersedes stale next-packet text only when
   proven from files, Git history, worktree state, or Graphite state.
2. D12 live proof and D12 Graphite drain are separate claims.
3. Design approval requires no accepted unresolved P1/P2 review findings.
4. Implementation may begin only after the full remaining change set is
   reviewed and approved.
5. Each implementation slice must be one coherent Graphite/OpenSpec workstream
   unit with explicit staging and clean worktree proof.

## Gate 2 - Repo State

| Item | Current evidence |
| --- | --- |
| Worktree | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-prework` |
| Branch | `codex/runtime-effect-recovery-design` |
| Parent | `codex/runtime-effect-prework-frame` |
| Git status at entrance | clean branch with no staged/unstaged files |
| Primary checkout quarantine | `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools` still has pre-existing external `nx.json` dirt |
| Current main | `654f58d8f fix(studio): format runtime closeout files (#1748)` |
| Runtime stack on main | First-parent history contains `#1729` through `#1748` |
| Old runtime worktree | `wt-agent-S-studio-runtime-effect-refactor` is detached at `654f58d8f`, not checking out a merged runtime branch |
| Graphite caveat | `gt ls` still renders this local recovery stack under a needs-restack Habitat branch despite Git ancestry; do not broad-restack or submit unrelated stacks |

## Gate 3 - Diagnosis

The remaining failure mode is not an unimplemented runtime component by
default. The current evidence shows the runtime stack merged through `#1748`,
D12 live state-machine proof was recorded, and old runtime branches are no
longer active local branches. The active risk is stale accounting: packet
tasks, phase status lines, next packets, and project packet train rows still
look open or not-green in places that current main has superseded. That stale
state can mislead a future agent into rerunning implementation or live proof
instead of performing a controlled docs/OpenSpec realignment.

Competing hypothesis tested by read-only review: source/code residue could
still contradict the D12 proof ledger. The source-residue reviewer found no
P1/P2/P3 residue and recommended keeping code implementation out of scope
before docs realignment.

## Gate 4 - Corpus

The corpus is the runtime packet train D0-D12 plus D2.5:

- `mapgen-studio-runtime-one-mount`
- `mapgen-studio-dev-watch-deploy-isolation`
- `mapgen-studio-engine-effect-corpus`
- `mapgen-studio-contract-typebox-spine`
- `mapgen-studio-error-spine`
- `mapgen-studio-engine-runtime-services`
- `mapgen-studio-pipeline-effect-services`
- `mapgen-studio-operations-current`
- `mapgen-studio-stream-spike`
- `mapgen-studio-event-hub`
- `mapgen-studio-operations-push`
- `mapgen-studio-live-game-watch`
- `mapgen-studio-nx-dev-runner`
- `mapgen-studio-game-door-invariant`

Detailed row dispositions live in `PACKET-REALIGNMENT-LEDGER.md`.

## Gate 5 - Grouping

| Group | Packets | Why grouped |
| --- | --- | --- |
| Final drain stale state | D12, packet train | Current main includes `#1729`-`#1748`; D12 records still say final drain open. |
| Consumed live-proof handoffs | D10, D11, D12, possibly D1/D5 | D12 live state-machine proof consumed earlier not-green labels, but some packet records still expose handoff text. |
| Historical unchecked accounting | D1, D5, D6, D10, D11 | OpenSpec tasks contain unchecked rows that may be historical, intentionally not claimed, or stale after D12. |
| Stale baseline ledgers | D0, D5 | D0 artifact classification still says later packets are implementation pending; D5 review ledger status says Graphite commit pending. |
| Historical-only bridge corpora | D2.5, D3 | Some old "current evidence" rows are superseded by adjacent closure records and should be classified, not rewritten as active blockers. |
| Active-looking stale docs outside packet train | `mapgen-studio-redesign` audit and runtime frame immediate-next-work | These can mislead future work but are not runtime implementation blockers. |
| Root graph hygiene classification | prework validation vs D12 final proof | The docs-only recovery branch saw root lint fail on Swooper Habitat checks while D12 final proof says root lint passed on its implementation slice. |

## Gate 6 - Expected Behavior

- A future reader should see no active D12 final-drain handoff if the runtime
  stack is already merged on `origin/main`.
- D10/D11 not-green live-proof handoffs should either be superseded by D12
  proof with exact pointers or retained with explicit proof gaps if the D12
  evidence does not satisfy their criteria.
- Older unchecked task rows should not keep `openspec list` showing incomplete
  runtime packet work unless a real, current closure obligation remains.
- Project docs should distinguish historical packet-authoring evidence from
  current implementation state.
- No docs slice should claim stronger runtime/product proof than the D12
  evidence supports.

## Gate 7 - Architecture Translation

- Owner for remaining work: project/OpenSpec workstream records under
  `docs/projects/studio-runtime-simplification/` and
  `openspec/changes/mapgen-studio-*/workstream/`.
- Forbidden owners: production runtime services, app/browser state owners,
  generated outputs, lockfiles, direct-control/control-oRPC public contracts.
- Protected paths for design phase: all runtime source and generated outputs.
- Implementation slices may edit OpenSpec records and active project docs only
  when the slice-specific write set says so.

## Gate 8 - Slice Plan

The approved implementation sequence is in `CHANGESET-DESIGN.md`. No slice is
approved for implementation until `REVIEW-DISPOSITION.md` records no accepted
unresolved P1/P2 finding against this design.

## Gate 8A - Implementation Record

| Slice | Branch | Commit | Disposition |
| --- | --- | --- | --- |
| Prework | `codex/runtime-effect-prework-frame` | `dad1c74e9` | Framing, investigation, packet corpus, classification, review disposition, and next objective package committed. |
| Design | `codex/runtime-effect-recovery-design` | `f10de82d4` | Full R0-R4 docs/OpenSpec realignment design reviewed and approved. |
| R0 | `codex/runtime-effect-d12-drain-reconcile` | `315efbbf1` | D12 final-drain records reconciled to current `origin/main` evidence through `#1748`. |
| R1 | `codex/runtime-effect-live-proof-realign` | `7d98eaaa0` | D11 and D5 consumed-proof handoffs closed with D12 pointers; D10 narrowed to watcher-specific live-game proof only. |
| R2 | `codex/runtime-effect-packet-accounting-realign` | `04cc86f83` | Historical packet accounting ledgers realigned; completed packets no longer appear open by stale row state. |
| R3 | `codex/runtime-effect-active-doc-drift` | `bc31bf51a` | Active project docs bannered so historical browser/polling and early-packet text is not current runtime authority. |
| R4 | `codex/runtime-effect-recovery-closeout` | current slice | Final audit records agreement, validation boundaries, and retained D10 proof gap. |

The remaining open runtime-record item after R0-R3 is the deliberately retained
D10 live-game watcher-specific proof row. It is not a docs/OpenSpec realignment
defect and it is not closed by this recovery audit.

## Gates 9-10 - Proof Labels

| Proof class | Design phase claim |
| --- | --- |
| Git/main evidence | First-parent history proves runtime PRs `#1729`-`#1748` are on `origin/main`. |
| Local branch/worktree evidence | Local old runtime branch is not checked out; current recovery branch is clean before edits. |
| OpenSpec validation | Required before design close; proves OpenSpec shape only. |
| Docs classification | Required for this phase; proves stale-accounting design is explicit. |
| Code/runtime proof | Not claimed by this design phase. |
| Live Civ7 proof | Not rerun or claimed beyond existing D12 ledgers. |
| Graphite submit/drain | Not performed by this design phase. |

## Gate 11 - Review

Read-only review lanes completed:

- D12 drain reconciliation: no P1; P2 stale D12 final-drain records, records-only repair recommended.
- D0-D12 packet accounting and stale task audit: D12 final-drain handoff blocks using old next-packet text; D10/D11, D0, and D5 docs need realignment; D2.5/D3 old bridge ledgers are historical-only.
- Current runtime source residue audit: no P1/P2/P3; code implementation should not be in scope before docs realignment.
- Proof/test design audit: no P1; P2 D12 final-drain/live-proof contradictions must be explicitly superseded before design approval.

Accepted P1/P2 findings block design approval until repaired, rejected with
evidence, or moved outside the closure claim.

## Gate 12 - Closure

This design phase closes when:

- `CHANGESET-DESIGN.md`, `PACKET-REALIGNMENT-LEDGER.md`, and
  `REVIEW-DISPOSITION.md` agree.
- Review ledgers contain no accepted unresolved P1/P2 finding.
- `bun run openspec:validate` passes or any failure is proven unrelated to this
  docs-only design write set.
- `bun run habitat classify` for this design directory has been run and
  returned checks are run or dispositioned.
- The design branch is committed through Graphite and the worktree is clean.

## Validation Record

| Command | Result | Proof boundary |
| --- | --- | --- |
| `bun run openspec:validate` | Passed: 186 items passed, 0 failed. | OpenSpec tree shape only. |
| `bun run habitat classify docs/projects/studio-runtime-simplification/workstream/runtime-effect-recovery-design` | Passed; workspace-level path; returned `bun run lint`. | Required target discovery for this docs-only path. |
| `bun run lint` | Non-green on `mod-swooper-maps:habitat:check`: `arch-test-m11-projection-band`, `arch-test-map-bundle-runtime-imports`, `arch-test-cutover`. `@habitat/cli:habitat:check` passed with advisory `doc-ambiguity`. | Root graph hygiene is not green. The failures are outside this docs-only design write set and are not repaired here. |
| `git diff --check` | Passed for design and R4 closeout edits before commit. | Diff whitespace hygiene only. |
| R4 `bun run openspec -- list` packet scan | All runtime Effect packets complete except `mapgen-studio-live-game-watch` at `36/37 tasks`. | Confirms the retained D10 proof gap remains explicit. |
| R4 habitat classify | `runtime-effect-recovery-design` and `runtime-effect-recovery-closeout` both classify as workspace-level docs paths requiring `bun run lint`. | Required target discovery for the closeout write set. |
