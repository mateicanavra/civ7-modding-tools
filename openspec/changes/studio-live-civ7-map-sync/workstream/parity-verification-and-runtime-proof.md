# Parity Verification And Runtime Proof

## 2026-06-06 Final-Surface Parity Command Path

- Branch/worktree:
  `codex/swooper-studio-parity-proof-drain` in
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-swooper-mapgen-recovery-drain`.
- Base predecessor: `8966aba5e fix(studio): prove exact run authorship`.
- Implemented command path:
  `bun run verify:final-surface-parity -- --request-id <id>` or
  `--proof-file <status-or-proof.json>`.
- Proof model:
  `mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts`.
- Direct-control readback:
  `getCiv7FullMapGrid()` chunks full-grid `GameplayMap` reads through the
  package-owned `getCiv7MapGrid()` wrapper and records bounds, chunk count,
  omitted plots, hidden-info policy, map dimensions, turn, and game hash.
- Exact-authorship binding:
  the command rejects incomplete exact-authorship packets before live proof,
  including hash-only source snapshots without the visible Studio source body
  and visible pipeline config bodies whose stable hash does not match the
  exact-authorship config hash.
- Local-vs-live surfaces:
  local final terrain, biome, feature, and resource surfaces are produced from
  the exact-authored `sourceSnapshot.pipelineConfig`; live surfaces come from
  direct-control full-grid plot facts.
- Residual classification:
  rivers/floodplains/wonders are explicit residual rows and starts remain a
  direct-control readback limitation until a canonical live start-surface wrapper
  exists.
- Focused gates run:
  - `bun run --cwd packages/civ7-direct-control check`
  - `bun run --cwd packages/civ7-direct-control test -- direct-control`
  - `bun run --cwd mods/mod-swooper-maps test -- test/diagnostics/live-parity.test.ts`
  - `bun run --cwd mods/mod-swooper-maps check`
  - `bun scripts/civ7-direct-control/verify-final-surface-parity.ts --help`
- Fresh exact-authored full-grid result:
  Studio live status is reachable and currently reports `ok:true`,
  `playable:true`, readiness `tuner-ready`, host `127.0.0.1`, port `4318`,
  dimensions `106x66`, seed `138503614`, turn `1`, and game hash `0`.
  The setup player-count exact-authorship blocker was repaired by reading
  `Configuration.getMap().maxMajorPlayers` through the direct-control setup
  snapshot. A fixed-server Studio request
  `studio-run-in-game-mq20rbzr-1fhc` completed exact-authorship proof with seed
  `138503614`, dimensions `106x66`, player count `10`, config hash
  `c8bf167810f92f9a6096b298d1fcf3bb6b044a0fec22a9ad0ca9b35103982dca`, and
  envelope hash
  `a9a7bb73e9dd062e1da658a639bc02602e75b7fda1ca6d88123a1a2e9ac5f790`.
- Command:
  `bun run verify:final-surface-parity -- --studio-url http://127.0.0.1:5175 --request-id studio-run-in-game-mq20rbzr-1fhc --timeout-ms 120000 --max-plots-per-read 512 --output /tmp/civ7-recovery-proof/final-surface-parity/studio-run-in-game-mq20rbzr-1fhc.json`.
- Proof output:
  - parity status: `unresolved`;
  - proof artifact hash:
    `4973f47b8dd83e9710088d33485b2a985fcdf4dee71b140f2aa23b4bc55ac1dc`;
  - proof summary hash:
    `66b0548b9aba5c7a6502c9c92b5d4ca06ef4d5b65c6f98d4d08b81794f99c77e`;
  - internal proof hash:
    `f7d91ad72a6c998926fa24fd82266388420de99dbe338bf7d627448a760fe1ba`;
  - live bounds: `0,0,106,66`;
  - plot count: `6996`;
  - omitted plots: `0`;
  - chunk count: `17` at `--max-plots-per-read 512`;
  - identity stable across seed, dimensions, plot count, turn, and game hash.
- Surface result:
  - terrain mismatches: `2/6996`, examples `(73,36) local
    `TERRAIN_OCEAN` live `TERRAIN_COAST` and `(65,39) local
    `TERRAIN_COAST` live `TERRAIN_OCEAN`;
  - biome mismatches: `0/6996`;
  - feature mismatches: `5/6996`, examples include `(48,6) local
    `FEATURE_COLD_REEF` live empty, `(48,13) local empty live
    `FEATURE_KILIMANJARO`, `(49,13) local `FEATURE_KILIMANJARO` live empty,
    `(51,21) local empty live `FEATURE_ZHANGJIAJIE`, and `(52,21) local
    `FEATURE_ZHANGJIAJIE` live empty;
  - resource mismatches: `106/6996`, with no missing live plots; top pairs
    include local `RESOURCE_TURTLES`, `RESOURCE_COWRIE`, and
    `RESOURCE_PEARLS` where live is empty, and live `RESOURCE_DYES` or
    `RESOURCE_FISH` where local is empty.
- Unresolved links:
  `surface.terrain.mismatch`, `surface.feature.mismatch`, and
  `surface.resource.mismatch`.
- Observed delta routing rows:

| Surface | Count | Current evidence | Provisional route | Risk | Follow-up trigger |
|---|---:|---|---|---|---|
| Terrain | `2/6996` | Only coast/ocean edge swaps remain after stable exact-authored full-grid proof; no biome drift, no missing live plots, and live identity is stable. | Source-authority classification remains open; keep out of feature/resource repair unless later evidence proves shared materialization owner. | Overrouting terrain to the wrong repair lane. | Add focused terrain-edge diagnostics around `plotCoasts`, `buildElevation`, and `validateAndFixTerrain`; then repair local policy or record accepted engine policy. |
| Feature | `5/6996` | One cold reef is absent in live; Kilimanjaro and Zhangjiajie appear as one-tile offsets between local and live feature grids. | Source-authority classification remains open; route investigation to `earthlike-live-feature-resource-legality-repair` without claiming natural-wonder footprint semantics. | Mistaking observed feature-grid offsets for accepted wonder footprint semantics. | Add feature attempted/applied/rejected telemetry and intended-vs-live feature grids before product acceptance. |
| Resource | `106/6996` | Exact-authored proof shows stable full-grid read with resource mismatches across aquatic and terrestrial symbols, including empty/live swaps and substitutions. | Source-authority classification remains open; route investigation to `earthlike-live-feature-resource-legality-repair`. | Repair could silently degrade spacing, age legality, or diversity. | Add candidate legality matrix plus placement telemetry, preserve resource diversity/spacing gates, then rerun full-grid proof. |

- What this proves:
  the repo now has an exact-authorship-bound, package-owned command path for
  full-grid final-surface parity proof and can run that proof against a fresh
  live Civ grid without missing plots or runtime identity drift.
- What this does not prove:
  no final-surface match claim, no product acceptance, and no Earthlike tuning
  claim. Terrain, feature, and resource deltas remain product-blocking until
  classified by owner or repaired.

## Local Statistics

- 2026-06-05 RNG authority slice:
  - Source diagnosis: `ctxRandom` was adapter-backed, so identical Studio/Civ
    config could derive different per-op seeds whenever the runtime adapter was
    Civ7 and the Studio adapter was mock/browser.
  - Expected range source: authored RNG must be entirely `Env.seed`-derived;
    adapter RNG changes must not perturb `ctxRandom` sequences or Standard
    recipe artifacts.
  - Local proof added: `packages/mapgen-core/test/core/rng.test.ts` and
    `mods/mod-swooper-maps/test/pipeline/rng-authority-boundary.test.ts`.
  - Runtime proof: pending deploy and fresh Civ readback.

- Branch/commit: `codex/swooper-earthlike-post-foundation-tuning@8d0b1a3ca`
  before this workstream record.
- Seeds/configs: Standard 84x54, seed 2147483647, Swooper Earthlike config hash
  `289d0dca6a8a9dab548009f9c8132f1b14002bb8d1d877b5e25314c9d41469bb`.
- Command(s):
  - `bun run --cwd mods/mod-swooper-maps viz:standard -- 84 54 2147483647`
  - tiled `civ7 game map --bounds ... --fields terrain,biome,feature,resource`
- Expected range source: exact parity for final surfaces; zero mismatches unless
  a row is explicitly classified as accepted engine-side rewrite with a control
  strategy.
- Observed results:
  - terrain mismatches: `180/4536`;
  - biome mismatches: `0/4536`;
  - feature mismatches: `67/4536`;
  - resource mismatches: `167/4536`.
- Pass/fail: fail for terrain/features/resources; pass for biomes on this seed.
- What this proves: the major remaining mismatch is not a global odd-q/odd-r
  data-space error; it clusters around live engine materialization/legality.
- What this does not prove: product parity across fresh restarts, all sizes,
  all seeds, or Studio visual orientation.

## Generated/Deploy Proof

- Build command: `bun run --cwd mods/mod-swooper-maps check`
- Deploy command/path: `bun run --cwd mods/mod-swooper-maps deploy:studio`
- Output path: generated/deployed mod bundles only; source remains under
  `mods/mod-swooper-maps/src/**`.
- Timestamp: last successful live generation in bounded logs was 2026-06-03
  18:03:13-18:03:15.
- Pass/fail: previous deploy/run passed; needs rerun after this workstream slice.
- What this proves: deploy copies the current bundle; it does not prove Civ7
  loaded or generated it.

## Runtime Proof

- Branch/commit: pending rerun after next source changes.
- Downstack restart/control branch and commit: direct-control from this worktree.
- Command/API path:
  - `bun run --filter @mateicanavra/civ7-cli dev -- game restart --begin --wait-tuner --json`
  - or `scripts/civ7-direct-control/verify-studio-run-in-game-live.ts` with the
    Swooper map script, Standard size, and seed 2147483647.
- Request id: pending rerun.
- Response: pending rerun.
- Manual boundary, if any: game must be reachable through direct-control.
- Log paths:
  - `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/Scripting.log`
  - `/Users/mateicanavra/Library/Application Support/Civilization VII/Logs/output.log`
- Timestamp/mtime bounds: pending rerun.
- Parsed payload:
  - stale fatal at 17:43/17:47: `build-elevation` drift at `(42,0)`;
  - latest observed Swooper run at 18:03 reached `[50/50] ok`.
- Readback API/surface: `civ7 game map --bounds` with terrain, biome, feature,
  and resource fields.
- Readback sample/coverage: full Standard grid via row bands for current sample;
  needs repeat after repair.
- Truth-vs-projection parity result: current sample fails for terrain, features,
  and resources.
- Claim satisfied: only "latest bounded logs inspected"; not final product proof.
- Residual risk: user-visible failure may correspond to a later manual Studio
  attempt that did not emit a new Swooper `MapGeneration` context.

## Proof Label

- Local commit complete: no
- Graphite submitted: no
- PR created/updated: existing PR #1421, not updated for this slice
- Local stats proof: partial
- Runtime proof: partial
- Product proof: unresolved

## Product Proof

- User-facing claim: MapGen Studio predicts the same Swooper Earthlike map Civ7
  loads for the same seed/size/config/deployed branch.
- Required conditions:
  - same config hash in Studio and live mapgen proof;
  - same deployed script;
  - same row-major odd-q coordinate space;
  - same final terrain/biome/feature/resource surfaces;
  - Studio renders the declared coordinate space without silent rotation.
- Product-authority ref: `studio-live-civ7-map-sync` proposal and architecture
  normalization packet truth/projection boundary.
- Covered scope: one Standard seed local/live comparison before the RNG repair,
  one bounded Studio-launched Standard runtime generation after the repair, one
  Huge direct-control setup/start generation proof after canonical map row
  matching, and live map summary readback for those runs.
- Evidence per condition:
  - same config hash in Studio and live mapgen proof: covered for request
    `studio-run-in-game-mq1560rc-1fju`;
  - same deployed script: covered by disposable `studio-current.js`
    materialization and deploy;
  - same row-major odd-q coordinate space: covered by contract tests and earlier
    live `(0,0)->0`, `(1,0)->1`, `(0,1)->width` readback;
  - same final terrain/biome/feature/resource surfaces: covered by a fresh
    exact-authored post-repair proof for request
    `studio-run-in-game-mq20rbzr-1fhc`, and currently failing with terrain
    `2/6996`, feature `5/6996`, and resource `106/6996` mismatches;
  - Studio renders declared coordinate space: odd-q/north-up covered by contract
    tests; visual styling now treats surface water/background tiles as
    transparent fishnet outlines rather than solid water fill.
- Uncovered scope: other sizes, seeds, visual-pick tests, area/start/discovery
  readback, and hidden engine operation attribution.
- Excluded claims: general map quality tuning and unrelated UI mod errors.
- Product proof status: unresolved; a fresh post-repair proof exists and blocks
  product proof on observed final-surface mismatches.
