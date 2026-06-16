# Problem Classification - Runtime Effect Recovery Prework

## Classification Summary

| Category | Signal | Current examples | Future design obligation |
| --- | --- | --- | --- |
| Proof-class collapse | Packet acceptance, implementation, live proof, and Graphite drain can be read as one closure claim. | D12 is implemented/live-proofed, but some records still say final merge/sync/drain remains open or stale. | Every packet design must label proof class separately. |
| Stale session/doc drift | Prior transcript or active docs can contradict current `main`. | Takeover tail stopped during D1 proof hardening; `main` now contains PRs through `#1748`; frame immediate-next-work and D0/D5/D12 records have stale text. | Use current files and commands as authority; classify stale docs as drift. |
| User-scenario proof gaps | Green local tests can miss Play/SaveDeploy/live-game state-machine failures. | D10/D11 recorded not-green live proof until D12 later ran state-machine proof. | Design before implementation must define scenario proof and adequacy criteria. |
| Graph-boundary blind spots | Import graph tests can pass while package barrels load broad runtime modules. | Supervisor DRA flagged `@swooper/mapgen-core/authoring` barrel risk during D1; current code is resolved through narrow daemon subpaths. | Future graph proofs must resolve package subpaths and fail on broad-barrel leakage. |
| Runtime residue | Deleted symbols can remain in code, tests, docs, or historical records. | D12 residue set covers `RunInGameHttpError`, `StudioEngineError`, polling/watchdog, `devLive`, Turbo, Zod. | Distinguish production blocker, guard literal, historical evidence, and proof text. |
| Doc/code divergence | Accepted packets may lag implementation or retained proof records. | MapGen Studio redesign audit still describes deleted browser polling as active-looking behavior. | Future docs cleanup must banner or archive stale active-looking redesign/audit docs. |
| Worktree/Graphite risk | Dirty primary tree or Graphite metadata can corrupt ownership. | Primary checkout has external `nx.json`; prework branch Git ancestry equals `origin/main` but `gt ls` nests it under a needs-restack Habitat stack. | Start every phase with repo/worktree/Graphite census and avoid broad stack actions from this branch. |
| Generated artifact handling | Build/deploy may produce tracked generated outputs or ignored cache churn. | Prior supervisor DRA required intentional tracked generated products to be staged with their slice, ignored cache excluded. | Future packet designs must classify generated outputs before staging/commit. |
| Live verification gaps | Runtime behavior claims require fresh bounded logs/state when behavior changes. | D12 live proof exists for exercised flows; final drain is not runtime proof. | Rerun live proof only for changed behavior or missing proof class, not for unchanged historical claims. |

## Current Non-Blocker Classifications

- `apps/mapgen-studio/src/lib/query.ts` mentions polling defaults for query retries; this is not by itself browser operation truth.
- Theme and preset `localStorage` remains outside operation recovery unless it owns runtime freshness or mutation state.
- Server-side log/process polling helpers remain workflow leaf behavior, not browser recovery loops, unless they become public state authority.
- `@swooper/mapgen-core/authoring` imports in Swooper authoring/domain code are not D1 daemon graph blockers unless reachable from Studio daemon recipe-DAG runtime.
- Historical OpenSpec and project docs may mention retired paths when they clearly present them as historical evidence or negative-search targets.

## Current Blocker Candidates For Future Objective

- D12 final drain status must be reconciled: local `origin/main` includes runtime PRs through `#1748`, but D12 next-packet/final-proof text still says merge/sync/drain remains open.
- Any future design objective that changes runtime behavior must not reuse D12 live proof without explaining why the changed behavior is still covered.
- Any future packet-design pass must repair, supersede, or explicitly quarantine stale ledgers if they would mislead implementers about current status.

## Design Review Heuristics

- If a claim says "green", ask which proof class is green.
- If a search returns a residue string, classify the hit before repairing it.
- If a test walks imports, require package/subpath resolution, not local-relative-only proof.
- If a status endpoint remains, classify whether it is diagnostic read, mutation-state read, identity read, or background freshness owner.
- If a dev command remains, classify local dev, deployment, historical doc, or forbidden alternate runner.
- If generated outputs changed, classify tracked generated product versus ignored/cache artifact before staging.
