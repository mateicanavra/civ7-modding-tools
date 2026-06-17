# D12 Testing Ledger - Game Door Invariant

Status: implementation evidence recorded; live Civ7 proof executed; final
Graphite drain reconciled from current `origin/main`
Date: 2026-06-14; implementation update 2026-06-15

| Layer | Required proof | Adequacy criterion |
| --- | --- | --- |
| Packet/spec | OpenSpec strict + full validation | D12 target docs agree and no stale implementation closeout remains |
| Direct-control guard | source guard test | only sanctioned production constructors match |
| Contract schema | TypeBox/Zod negative search + contract tests | no Zod import in Studio contract surface |
| Status endpoints | `status-endpoint-corpus.md` + implementation ledger + tests if changed | retained endpoints are classified as diagnostic reads, mutation-state reads/projections, or identity reads; none own background freshness |
| Control-oRPC surfaces | `control-orpc-surface-corpus.md` + implementation ledger | every game-action/effect surface has owner/risk/consumer |
| Tuner session | OpenSpec task diff + deferral/product proof | no unchecked ownership/recovery promise remains |
| Residue deletion | negative searches | hits are deleted, guarded, historical, diagnostic, or durable deferral |
| Package/app health | repo-local Nx check/test/build targets selected by Habitat/classification for touched packages/apps | implementation does not regress runtime surfaces or bypass dependency ordering |
| Live proof | D12 live state-machine pass over Nx Studio, oRPC events, Run in Game, and Save&Deploy | final closeout validates product behavior instead of inflating source/package proof into live Civ7 proof |
| Graphite drain | submit/merge/sync/status proof | stack closed and merged branches not checked out in worktrees; current reconciliation evidence is first-parent `origin/main` through `#1748`, absent runtime-effect refs, and no D12 branch checked out in worktrees |

## Focused Implementation Evidence Recorded

The current D12 implementation changes the runtime EventHub lifecycle by moving
it from a host-created Promise object into package-owned `StudioEventHubLive`.
Local proof already run in this slice:

```bash
bun run --cwd packages/studio-server check
bun run --cwd packages/studio-server test -- test/handler.test.ts test/operationRuntime.test.ts test/liveGameWatcher.test.ts
bun run --cwd packages/studio-server test -- test/handler.test.ts test/gameDoorInvariant.test.ts test/liveGameWatcher.test.ts
bun run --cwd packages/studio-server build
bun run --cwd apps/mapgen-studio check
bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/engineEffectCorpus.test.ts
bun run --cwd packages/studio-server test -- test/gameDoorInvariant.test.ts
git diff > /tmp/d12-current.diff && bun run habitat classify /tmp/d12-current.diff
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
```

Results: package/app focused gates above passed. Habitat classify on
`/tmp/d12-current.diff` reported graph targets for `mapgen-studio`,
`@civ7/studio-server`, `@internal/habitat-harness`, and root `bun run lint`.
The graph-owned gates passed:

```bash
bun run lint
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:build --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:build:vite --outputStyle=static
bun run nx run @internal/habitat-harness:check --outputStyle=static
bun run nx run @internal/habitat-harness:test --outputStyle=static
```

Root lint first exposed Habitat/biome drift. D12 repaired the
`normalization-guardrails.mjs` Standard recipe docs parser so the G6 docs check
accepts the D1 manifest-backed `orderStandardStages(...)` recipe shape, then
ran `bunx biome check --write .` and included the root-owned formatting/import
hygiene changes in this final closeout slice. The final `bun run lint` passed;
the only reported item was advisory `doc-ambiguity`, not an enforced failure.

Sidecar source-review repairs added after the first focused pass:

- `StudioEventHub.publish(...)` captures the Effect `PubSub.publish` boolean
  and advances live-game replay only after successful publication.
- `StudioEventHub.subscribe(...)` serializes queue subscription and replay-read
  setup with publish/replay update through a package-owned replay gate and makes
  the acquisition section uninterruptible.
- `StudioEventHub` finalization is serialized through the same lifecycle gate,
  sets a hub-level closed flag before closing active subscription scopes, clears
  the release registry, and refuses publish/subscribe after closure.
- `handler.test.ts` now includes a router-level watch iterator return test that
  observes `activeSubscriberCount` returning to zero through the real oRPC
  router/AsyncIterator edge without adding a production debug seam.
- `handler.test.ts` also covers `studio.events.watch` acquisition racing runtime
  disposal and a concurrent live-game publish/subscribe interleaving so the
  EventHub repair is behavioral, not source-shape-only.

The final focused D12 repair pass reran:

```bash
bun run --cwd packages/studio-server test -- test/handler.test.ts test/gameDoorInvariant.test.ts test/liveGameWatcher.test.ts
```

Result: passed, 24 tests.

## Live State-Machine Pass

After the EventHub repair and canonical Run in Game request repair, D12 ran the
live state-machine pass through the D11 Nx Studio runner:

- Vite served Studio on `localhost:5173`; the daemon RPC port was
  `127.0.0.1:5174`.
- Fresh daemon identity:
  `studio-server-mqftopnk-1d3t-1`,
  `2026-06-15T23:06:45.345Z`.
- Invalid `setupConfig.mapScript` containing an actual newline failed before
  admission as `RUN_IN_GAME_INVALID` / `InvalidRequest` with diagnostic code
  `run-in-game-map-script-invalid`; `studio.operations.current({})` showed no
  active or recent Run in Game pollution for that rejected request.
- Disposable Run in Game started from a clean tracked catalog where
  `studio-current` was not a shipped preset, generated the transient
  `studio-current` setup row through the runtime deploy path, and reached
  `complete` through the pushed event stream. Request id:
  `studio-run-in-game-mqftp8p8-1d3t-2`. Event phases:
  `materializing`, `deploying`, `checking-civ7`, `preparing-setup`,
  `starting-game`, `waiting-for-proof`, `complete`. Event, keyed status, and
  `studio.operations.current({})` agreed on terminal state and
  `{swooper-maps}/maps/studio-current.js`.
- Save&Deploy used authored config
  `mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.json`
  and reached `complete` through the pushed event stream. Request id:
  `live-save-mqftqfp9`. Event phases: `queued`, `saving`, `deploying`,
  `complete`. Event, keyed status, and `studio.operations.current({})` agreed
  on terminal state.

Cleanup after the live pass:

- `nx.json` analytics/formatting prompt residue was restored.
- Save&Deploy formatting-only authored-config churn was restored.
- Tracked generated catalog artifacts were restored to the clean baseline.
- Transient `studio-current` source/config/output files remain ignored by
  `.gitignore` and are not committed as shipped catalog truth.

## D12 Diff Classification

The D12 implementation diff is intentionally broader than the final EventHub
amend because it is the runtime-stack closeout slice. Review it in these lanes:

| Lane | Paths/families | Intent |
| --- | --- | --- |
| Semantic runtime ownership | `packages/studio-server/src/services/StudioEventHub.ts`, runtime/context/handler wiring, operation runtime and workflow service surfaces | Move EventHub and game-door lifecycle into package-owned Effect services and remove host-created lifecycle islands. |
| Behavioral proof | `packages/studio-server/test/handler.test.ts`, `gameDoorInvariant.test.ts`, `liveGameWatcher.test.ts`, `operationRuntime.test.ts`, app focused tests | Prove stream cleanup, EventHub replay/shutdown policy, direct-control constructor guards, and retained runtime behavior. |
| Active source-comment authority | `packages/studio-server/src/contract/**`, `router/index.ts` | Keep oRPC/TypeBox `/rpc` as current surface and classify old `/api/*` strings as retired parity identifiers. |
| Docs/banner-only classification | active Studio runbooks, robustness workstream docs, D12 OpenSpec ledgers | Mark retired REST/dev/polling paths as historical or D12-classified rather than current authority. |
| Formatter/import hygiene | earlier runtime-stack package/app files touched by root Biome pass | Root lint hygiene only; no semantic intent beyond formatting/import ordering. |
| Habitat normalization guard repair | `tools/habitat-harness/src/rules/native/normalization-guardrails.mjs` | Make root graph lint understand D1's manifest-backed Standard recipe order shape. |

The first attempted `bun run habitat classify <many paths>` command was invalid
because the tool accepts one path or diff; the corrected diff classify command
above is the evidence source.

## Final Residue Search Evidence

The final D12 residue scans were rerun after the EventHub/source-review
repairs:

- Source/runtime residue scan over `apps/mapgen-studio/src`,
  `packages/studio-server/src`, and focused tests returned only
  negative-guard literals in `apps/mapgen-studio/test/studioEvents/operationAdoption.test.ts`.
- Dev/Turbo/Nx command scans returned historical OpenSpec/adoption records,
  archived docs, deployment-only Railway handoff text, and active docs now
  carrying D12 historical-status banners. No app package script, production
  daemon, or current Studio runbook route points to `devLive.ts`, daemon
  `bun --watch`, or Turbo local dev.
- Zod scan over `packages/studio-server/src/contract` and
  `packages/studio-server/src` returned no matches.
- Direct-control constructor scan returned only the sanctioned Studio
  `Civ7TunerSession`, direct-control package construction, and
  direct-control package tests.
- Generic mutation/protocol scan returned control-oRPC/direct-control internal
  protocol and package test surfaces plus D12 corpus text; no public Studio
  generic mutation DTO bypass was found.

## Remaining Closure Commands

```bash
bun install --frozen-lockfile
bun run build
bun run check
bun run habitat classify <path-or-diff>
bun run openspec -- validate mapgen-studio-game-door-invariant --strict
bun run openspec -- validate mapgen-studio-tuner-session --strict
bun run openspec:validate
bun run nx run @civ7/studio-server:check --outputStyle=static
bun run nx run @civ7/studio-server:test --outputStyle=static
bun run nx run @civ7/studio-server:build --outputStyle=static
bun run nx run mapgen-studio:check --outputStyle=static
bun run nx run mapgen-studio:test --outputStyle=static
bun run nx run mapgen-studio:build:vite --outputStyle=static
bun run nx run @internal/habitat-harness:check --outputStyle=static
bun run nx run @internal/habitat-harness:test --outputStyle=static
git diff --check
git status --short --branch
gt status
gt log --no-interactive
```

## Proof Labels

- OpenSpec validation proves packet/spec shape only.
- Guard tests prove ownership boundaries.
- Negative searches prove deletion/classification.
- Package/app gates prove local code health.
- Live proof was run fresh for D12; D10/D11 not-green labels were not silently
  consumed.
- Graphite proof proves stack closure, not runtime behavior.
