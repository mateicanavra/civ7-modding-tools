# Review Disposition - Runtime Effect Recovery Prework

Status: sidecar review wave complete; no unresolved P1/P2 blocks objective activation.

| Finding | Severity | Source | Category | Disposition | Repair Evidence | Blocks objective activation |
| --- | --- | --- | --- | --- | --- | --- |
| Primary checkout has pre-existing `nx.json` dirt, so prework must not edit there. | P2 | Owner + Graphite/worktree review | worktree risk | accepted-repaired | Created isolated worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-runtime-effect-prework`; primary dirt is protected external state. | No |
| Prework branch had no unique commits at review time and tracked `origin/main`. | P2 | Graphite/worktree review | branch state | accepted-tracked | This is expected until the prework docs are committed. Closure requires a local Graphite commit on `codex/runtime-effect-prework-frame`; Graphite submission remains out of scope. | No after commit |
| Graphite metadata renders `codex/runtime-effect-prework-frame` under a needs-restack Habitat stack despite Git ancestry equaling `origin/main`. | P2 | Graphite/worktree review | Graphite risk | accepted-repaired | `WORKSTREAM-RECORD.md` records the caveat and forbids broad stack restack/submit from this branch. Use explicit local commit only. | No |
| Takeover tail is stale relative to merged `main`. | P1 | Owner reconstruction + authority/spec review | stale session drift | accepted-repaired | `FRAME.md` and `INVESTIGATION-BRIEF.md` treat transcript as discovery only and cite current `main`/OpenSpec records as evidence. | No |
| D0 artifact classification still labels D1-D12 as implementation pending despite current `main` implementation. | P2 | Authority/spec review | stale packet accounting | accepted-classified | `PACKET-CORPUS-LEDGER.md` records this as stale D0 ledger drift for future cleanup. | No |
| Runtime frame immediate-next-work still says to open D2/D2.5/D3, contradicting current packet train/current main. | P2 | Authority/spec review | stale project doc | accepted-classified | `PROBLEM-CLASSIFICATION.md` records active doc drift; next objective starts with current-state reconciliation before design. | No |
| D5 review ledger says Graphite commit pending while closure says implementation committed. | P2 | Authority/spec review | stale packet accounting | accepted-classified | `PACKET-CORPUS-LEDGER.md` records stale D5 review-ledger status as drift. | No |
| D12 records mix live-proof statuses: closure/final proof say live proof executed, phase status still says live proof not closed, and final drain remains separate. | P2 | Authority/spec review + runtime residue review | proof-class drift | accepted-classified | `PACKET-CORPUS-LEDGER.md` and `PROBLEM-CLASSIFICATION.md` keep live proof and Graphite drain separate and mark stale wording as drift. | No |
| `docs/projects/mapgen-studio-redesign/audit/03-component-architecture.md` still describes deleted browser polling as active-looking behavior. | P3 | Runtime residue review | stale doc residue | accepted-deferred | Classified as future docs cleanup, not activation blocker because current source is resolved and this prework does not edit unrelated project docs. | No |
| OpenSpec validation could not be independently proven by authority/spec reviewer because `openspec` executable was unavailable in that review environment. | P2 | Authority/spec review | validation freshness | accepted-repaired by owner gate | Owner must run repo-local `bun run openspec:validate` before closure; future objective must require dependency freshness before closure claims. | No after validation |
| Habitat-returned `bun run lint` is non-green on `mod-swooper-maps:habitat:check`. | P2 | Owner validation | root graph hygiene | accepted-classified | `WORKSTREAM-RECORD.md` records the failing rules: `arch-test-m11-projection-band`, `arch-test-map-bundle-runtime-imports`, and `arch-test-cutover`. This prework does not touch Swooper source/generated outputs, so repair is outside scope. | No |
| Current main resolves browser-owned operation polling/recovery loops. | P1 resolved | Runtime residue review | runtime residue | accepted | Recorded in `PACKET-CORPUS-LEDGER.md` and `PROBLEM-CLASSIFICATION.md`; no code change required. | No |
| Current main resolves game-door ownership, `devLive`/Bun watcher, `RunInGameHttpError`/`StudioEngineError`, broad daemon authoring barrel, and public mutation/status classification. | P2 resolved | Runtime residue review | runtime residue | accepted | Recorded as resolved current-main evidence; future changes must preserve guards. | No |
| Proof overclaim risk: package-local tests, fake ports, OpenSpec validation, and `git diff --check` prove different things. | P2 | Proof/test review | proof policy | accepted-repaired | `INVESTIGATION-BRIEF.md`, `WORKSTREAM-RECORD.md`, and `NEXT-OBJECTIVE.md` require proof-class separation. | No |

## Sidecar Review Lanes

| Lane | Agent | Status | Result |
| --- | --- | --- | --- |
| Authority/spec review | read-only explorer | complete | No P1 blocker; P2 stale packet/status drift and validation freshness caveat recorded. |
| Code-path/runtime residue review | read-only explorer | complete | Current source resolves major runtime residues; P3 stale redesign audit doc recorded. |
| Proof/test design review | read-only explorer | complete | Proof-class overclaim risks and later gate recommendations recorded. |
| Graphite/worktree/repo-state review | read-only explorer | complete | No P1; P2 branch/Graphite metadata caveats recorded. |
| Frame/investigation artifact review | owner | complete | Frame passes selection/exterior/falsifier/alternative/compression/hand-off checks after review integration. |

## Closure Rule

Objective activation is blocked only by accepted unresolved P1/P2 findings. P3 findings may be carried as residual risk in `NEXT-OBJECTIVE.md` if they do not undermine the frame or evidence policy.
