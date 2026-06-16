# Packet Realignment Ledger

Status: design draft pending sidecar review.

## Current Main Evidence

First-parent `origin/main` contains the full submitted runtime stack and the
post-merge closeout format fix:

| PR | Commit | Meaning for recovery design |
| --- | --- | --- |
| #1729 | `4e7fa357a` | Accepted runtime Effect refactor packet train is on main. |
| #1734 | `a3bb0038d` | D1 deploy graph isolation is on main. |
| #1735 | `7dcc96582` | D2 engine Effect corpus guard is on main. |
| #1736 | `c2017ce84` | D2.5 TypeBox contract spine is on main. |
| #1737 | `655167b23` | D3 error spine is on main. |
| #1738 | `28a873a28` | D4 operation lifecycle runtime is on main. |
| #1739 | `4c5cbccb0` | D5 package-owned workflows are on main. |
| #1740 | `caa0e70ba` | D6 operations-current repair is on main. |
| #1741 | `7694d7ef7` | D7 stream cleanup/proof repair is on main. |
| #1743 | `9fb8fa4ff` | D8 EventHub closeout is on main. |
| #1744 | `2e37e8535` | D9 operations push is on main. |
| #1745 | `5b6454d9f` | D10 live-game watch is on main. |
| #1746 | `a72f26df8` | D11 Nx dev runner is on main. |
| #1747 | `92320aee2` | D12 game-door runtime invariant is on main. |
| #1748 | `654f58d8f` | Post-merge D12 closeout formatting/build hygiene is on main. |

## Packet Rows

| Packet | Current active-looking issue | Current evidence | Design disposition |
| --- | --- | --- | --- |
| D0 `mapgen-studio-runtime-one-mount` | No unchecked tasks, but `workstream/artifact-classification-ledger.md` still labels D1-D12 as implementation pending / pending closeout. | OpenSpec list reports complete; later runtime PRs are on main through `#1748`. | R2 should update the stale classification ledger or banner it as historical packet-entrance evidence. No code slice. |
| D1 `mapgen-studio-dev-watch-deploy-isolation` | `tasks.md` still has unchecked review/live Play/SaveDeploy rows. | D1 commit is on main via `#1734`; D12 live state-machine pass includes Run in Game and Save&Deploy through Nx Studio with stable daemon identity and event/status/current agreement. | Realignment slice must decide whether D12 evidence satisfies D1's exact phase-sampling oracle. If yes, mark consumed with D12 pointers; if not, keep a specific proof gap without suggesting code work. |
| D2 `mapgen-studio-engine-effect-corpus` | No unchecked tasks in mechanical scan. | OpenSpec list reports complete. | No implementation slice. |
| D2.5 `mapgen-studio-contract-typebox-spine` | No unchecked tasks in mechanical scan. | OpenSpec list reports complete. | No implementation slice. |
| D3 `mapgen-studio-error-spine` | Phase says accepted packet; current main contains implementation via `#1737`. | D12 final residue proof says status-code bridge residue was deleted/classified. | Optional wording realignment only if packet status misleads future implementers. |
| D4 `mapgen-studio-engine-runtime-services` | Phase says accepted packet; current main contains implementation via `#1738`. | Runtime lifecycle implementation is on main. | Optional wording realignment only if packet status misleads future implementers. |
| D5 `mapgen-studio-pipeline-effect-services` | `tasks.md` leaves `3A.10` unchecked to avoid claiming D5 live proof; `workstream/review-disposition-ledger.md` status says Graphite commit pending. | D5 implementation is on main via `#1739`; D12 later ran live state-machine proof; D5 closure checklist records implementation committed. | Realignment slice should preserve that D5 itself did not claim live proof, add a supersession pointer to D12, and repair/bannner stale Graphite-pending review status. |
| D6 `mapgen-studio-operations-current` | `tasks.md` leaves packet-authoring install/build/check rows unchecked. | D6 implementation is on main via `#1740`; D12 proof used `studio.operations.current({})` in live invalid/terminal assertions. | Realignment slice should mark or classify these rows as historical packet-authoring drift, not current code work. |
| D7 `mapgen-studio-stream-spike` | No unchecked tasks in mechanical scan. | D7 implementation and cleanup proof are on main via `#1741`. | No implementation slice. |
| D8 `mapgen-studio-event-hub` | Some phase text says implementation pending, with addendum later recording current evidence. | D8/D12 EventHub implementation is on main via `#1743` and `#1747`. | Realignment slice should make status line current if review finds it active-looking. |
| D9 `mapgen-studio-operations-push` | No unchecked tasks in mechanical scan. | D9 implementation is on main via `#1744`. | No implementation slice. |
| D10 `mapgen-studio-live-game-watch` | `tasks.md` and `next-packet.md` say live Civ7 proof missing. | D12 testing/final-proof ledgers record live state-machine pass after EventHub repair. | Realignment slice must supersede the D10 handoff with D12 proof pointers or retain only any D10-specific live-game watcher subclaim not covered by D12. |
| D11 `mapgen-studio-nx-dev-runner` | `tasks.md` and `next-packet.md` say Play/SaveDeploy live proof and Habitat classify gates missing. | D12 live pass ran through the D11 Nx Studio runner and root graph gates were recorded in D12 proof. | Realignment slice must supersede or narrow the D11 handoff with D12 proof pointers; do not rerun live proof unless review finds a coverage gap. |
| D12 `mapgen-studio-game-door-invariant` | `tasks.md`, `phase-record.md`, `closure-checklist.md`, `final-proof-ledger.md`, `testing-ledger.md`, and `next-packet.md` say final drain remains open. | `origin/main` first-parent history contains `#1729`-`#1748`; old runtime worktree is detached at `654f58d8f`; no local runtime-effect branches remain in `git branch -a --list '*runtime-effect*'`. | First implementation slice should update D12 records from "final drain open" to "drain complete as evidenced by current main", preserving proof-class separation and the historical handoff. |

## Historical-Only Rows

| Surface | Current issue | Disposition |
| --- | --- | --- |
| D2.5 `schema-spine-ledger.md` | Old rows preserve earlier bridge/schema corpus state. | Historical-only unless a current status line presents them as live authority. Adjacent closure records supersede them. |
| D3 `error-corpus-ledger.md` | Old rows preserve earlier `StudioEngineError`/bridge corpus state. | Historical-only. D3 closure and D12 residue proof supersede active bridge claims. |

## Non-Packet Drift

| Surface | Current issue | Design disposition |
| --- | --- | --- |
| `docs/projects/studio-runtime-simplification/RUNTIME-EFFECT-REFACTOR-FRAME.md` | Immediate-next-work and packet-train sections can read as active packet-authoring rather than historical frame. | Add a project-level status addendum or update narrow status lines in a docs realignment slice. Do not rewrite the normative frame semantics. |
| `docs/projects/mapgen-studio-redesign/audit/03-component-architecture.md` | Describes deleted browser polling/recovery as active-looking architecture. | Separate docs cleanup slice with banner/archive disposition; not a runtime blocker. |
| Root lint discrepancy | Prework branch recorded `bun run lint` non-green; D12 final proof recorded root lint green on implementation branch. | Design validation must rerun classify/required checks for the current docs write set and record current output, not inherit either old claim. |
