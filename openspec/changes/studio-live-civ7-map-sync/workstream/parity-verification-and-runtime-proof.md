# Parity Verification And Runtime Proof

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
- Covered scope: one Standard seed local/live comparison and bounded log scan.
- Evidence per condition: pending fresh rerun after source changes.
- Uncovered scope: other sizes, seeds, visual-pick tests, area/start/discovery
  readback, and hidden engine operation attribution.
- Excluded claims: general map quality tuning and unrelated UI mod errors.
- Product proof status: unresolved.
