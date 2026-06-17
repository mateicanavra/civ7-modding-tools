# Packet Corpus Ledger - Runtime Effect Recovery Prework

Status labels in this ledger describe current prework interpretation, not new packet acceptance.

| Domino | OpenSpec change | Current authority/status | Current implementation/proof read | Prework disposition |
| --- | --- | --- | --- | --- |
| D0 | `mapgen-studio-runtime-one-mount` | Packet accepted; restack adoption reviewed. | One `/rpc` baseline and Nx/Habitat adoption are recorded. D0 artifact-classification ledger is stale because it still labels later packets as implementation pending. | Treat as accepted baseline authority; flag stale D0 ledger as drift for future cleanup. |
| D1 | `mapgen-studio-dev-watch-deploy-isolation` | Packet accepted; implementation records exist. | Current code imports daemon recipe DAG through narrow subpaths and guards broad authoring-barrel risk. Older S1.1a closure records are historical. | Preserve import/write isolation and require package-subpath-aware graph proofs if touched. |
| D2 | `mapgen-studio-engine-effect-corpus` | Accepted inventory; implementation refresh recorded. | Runtime corpus ledgers classify old app-hosted lifecycle and later owners. | Use as corpus source; do not treat old manual-engine rows as current implementation without code check. |
| D2.5 | `mapgen-studio-contract-typebox-spine` | Accepted; implementation evidence current. | TypeBox contract authority recorded; live Civ7 proof not claimed by this packet. | Preserve TypeBox origin recovery and avoid broad unknown/error detail relapse. |
| D3 | `mapgen-studio-error-spine` | Accepted and implemented in merged PR range. | D12 final proof classifies `RunInGameHttpError` and `StudioEngineError` as deleted/historical. | Negative-search bridge residue before any error-work claim. |
| D4 | `mapgen-studio-engine-runtime-services` | Accepted and implemented in merged PR range. | Operation runtime service ownership and lifecycle tests are recorded by D4/D12 ledgers. | Treat runtime-owned lifecycle as target authority, not app closure ownership. |
| D5 | `mapgen-studio-pipeline-effect-services` | Accepted and implemented in merged PR range. | Closure checklist says implementation committed; review ledger has stale "Graphite commit pending" status. Leaf Promise adapter debt remains classified. | Treat D5 implementation as landed on current `main`; carry stale review-ledger status as drift and leaf adapter debt as bounded residual risk. |
| D6 | `mapgen-studio-operations-current` | Accepted and implemented in merged PR range. | Terminal-only recent semantics and boot adoption are recorded; browser recovery deletion is part of D6/D9/D12 proof surface. | Preserve one-shot adoption/manual read semantics, not background freshness polling. |
| D7 | `mapgen-studio-stream-spike` | Accepted and promoted into later event hub work. | Spike transport shape selected; cleanup/promotions are recorded in D8/D12. | Historical spike only; future event work should use D8/D9/D10 production surfaces. |
| D8 | `mapgen-studio-event-hub` | Accepted and implemented in merged PR range. | D12 repaired EventHub runtime ownership into package-managed Effect service. | Preserve scoped PubSub ownership and oRPC AsyncIterator boundary classification. |
| D9 | `mapgen-studio-operations-push` | Accepted and implemented in merged PR range. | Operation polling/watchdog deletion recorded; code review reports browser-owned operation polling/recovery loops resolved on current main. | Reject retained browser polling as operation truth. |
| D10 | `mapgen-studio-live-game-watch` | Accepted and implemented in merged PR range. | D10 originally had not-green live proof; D12 says live-product gap was closed by fresh state-machine pass. | Treat D10 unit/process proof and D12 live proof as separate supporting claims. |
| D11 | `mapgen-studio-nx-dev-runner` | Accepted and implemented in merged PR range. | D11 records process proof and not-green live Play/SaveDeploy proof; D12 says it later closed that live-product gap. Code review reports `devLive`/Bun watcher residue resolved on current main. | Keep D11 process proof and D12 live proof separate; do not reintroduce `devLive`/Bun watcher/Turbo local dev. |
| D12 | `mapgen-studio-game-door-invariant` | Accepted; implementation submitted; live proof executed; final Graphite merge/sync/drain not claimed. | Closure/final proof say live proof executed; phase-record status line still says live proof not closed, so D12 records contain internal stale wording. | The open closure class is final Graphite drain/review policy plus stale status cleanup, not runtime implementation by default. |

## Cross-Cutting Surfaces

| Surface | Current evidence | Future objective implication |
| --- | --- | --- |
| `/rpc` route | D0 and one-mount tests establish unified route. | Preserve one-mount unless explicitly reframed. |
| TypeBox contract origin | D2.5 and D12 records require TypeBox-owned Studio DTOs. | Include schema origin and Standard Schema recoverability in design review. |
| Effect runtime ownership | D4/D5/D8/D10/D12 records move lifecycle, events, workflows, watcher into package-owned Effect services. | Future implementation must not add app-local lifecycle islands. |
| Browser operation truth | D6/D9/D12 classify polling/recovery/watchdog deletion; source review reports current main resolved. | Future UX changes can read current/projections manually but cannot own background truth in browser. |
| Nx dev orchestration | D11 records Nx-owned backend/frontend topology; source review reports app-local supervisor deleted. | Future dev/run changes must use repo-local Nx/Habitat targets. |
| Live proof | D12 records live state-machine proof after earlier D10/D11 not-green handoffs. | Later claims need fresh live proof only if behavior or proof boundary changes. |
| Graphite drain | D12 next packet says final merge/sync/drain remains open, despite PRs merged locally through `#1748`. | Closure objective must verify whether final drain remains live or is stale after merge; do not assume. |
