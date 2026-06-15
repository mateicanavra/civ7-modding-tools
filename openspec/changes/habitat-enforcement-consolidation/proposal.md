## Why

After boundaries (H3) and the grit catalog (H5) are locked with recorded
parity, the repo briefly enforces many rules twice: legacy scripts/ESLint
blocks and their harness ports. Dual enforcement is transitional scaffolding,
not an end state — it doubles maintenance, splits diagnostics, and reintroduces
the pre-harness sprawl. This slice retires every superseded mechanism, makes
the harness the only enforcement path, and re-points `check`/CI at
`habitat verify`.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #2; degeneration trigger)
- `docs/projects/habitat-harness/invariant-corpus.md` (retire dispositions §A–§D)
- Parity evidence recorded in `habitat-grit-catalog` and
  `habitat-boundary-tags` phase records (precondition)

## What Changes

- Retire ported lint scripts: `lint-adapter-boundary.sh`,
  `lint-mapgen-recipe-imports.sh`, the grit-ported BOUNDARY-profile guardrail
  families of `lint-domain-refactor-guardrails.sh`, and the grit-ported
  guardrails of `lint-normalization-guardrails.mjs` — G1/G2/G5/G8/G9/G10/G11
  and the G3 runtime-value ban retire only against their LOCKED grit
  equivalents ported in H5 (H5 ports all of them); G3's project-edge context
  is the nx `kind:engine` tag rule; G10/G11 are intra-project shapes — grit
  owns them, and no retirement may cite nx-boundaries as covering them; G6/G7
  move habitat-native. Also retire
  `lint-control-orpc-contract-ownership.mjs`. Habitat-native survivors
  (workspace-entrypoints, G6/G7 doc-sync, JS doc lints) move INTO
  `tools/habitat-harness/src/rules/` as native TS rules and their scripts are
  deleted; `lint-mapgen-docs.py` is NOT rewritten in TS — it relocates (or
  stays in place) wrapped as-is per corpus disposition ("port py→TS only if
  touched").
- Replace `eslint.config.js` with nothing: the 8 rule families are
  grit/boundaries-owned; ESLint remains only via
  `eslint.boundaries.config.mjs` (single boundary rule, from H3); `bun run
  lint` becomes an alias for `habitat check` (or is removed; decided and
  recorded in tasks (task 1.2)).
- Architecture-test dedup per corpus §C: `recipe-import-boundary.test.ts`
  retires (grit equivalent locked);
  `ecology-step-import-guardrails.test.ts` slims — the deep-import assertions
  retire (locked grit equivalent), the retired-stage-dirs-absent assertions
  stay (no grit/file rule covers directory absence);
  `core-purity.test.ts` slims to runtime-value semantics not expressible as
  tags (the import-graph half retires); `rng-authority-boundary`,
  `m11-projection-boundary-band`, `map-bundle-runtime-imports` stay (runtime
  semantics, not structure).
- Root `check` script and `ci:architecture-strict-core` re-point to
  `habitat verify` (nx affected composition); CI uploads habitat diagnostics
  as the single evidence artifact.
- Sweep docs/AGENTS routers that referenced retired scripts.

## What Does Not Change

- No rule semantics: every retirement requires recorded parity or explicit
  supersession; the enforced invariant set is identical before/after.
- No baselines reset; ratchet state carries over.
- Kept tests keep running where they run today.

## Requires

- `habitat-boundary-tags`
- `habitat-oclif-cli`
- `habitat-grit-catalog`

## Enables Parallel Work

- `habitat-git-hooks` (clean single-path harness underneath);
  `habitat-generators-migrations` follows strictly after hooks land (both
  write root `AGENTS.md` and the harness README — no H7∥H8 parallelism).

## Affected Owners

- `scripts/lint/**` (deletions/moves), `eslint.config.js` (deletion)
- `tools/habitat-harness/src/rules/**` (native rule absorption)
- Root `package.json` scripts, `.github/workflows/ci.yml`
- Retired/slimmed test files in `packages/mapgen-core/test/architecture/`,
  `mods/mod-swooper-maps/test/pipeline/`, `mods/mod-swooper-maps/test/ecology/`
- Docs/AGENTS routers referencing retired mechanisms

## Forbidden Owners

- No retirement without parity evidence cited per mechanism (table in tasks).
- No weakening: a legacy check may not be deleted if its harness port covers
  less; the gap blocks until covered or explicitly dispositioned by Matei.
- No new rules in this slice.

## Stop Conditions

- A parity gap is discovered during retirement (the legacy mechanism catches
  something the port does not on a probe) — stop, restore the legacy check,
  log, repair the port first.
- `habitat verify` exceeds 1.25× the retired aggregate's wall-clock on CI
  (bound pre-stated here; both timings measured and recorded in the phase
  record) — stop and fix caching before retiring.

## Consumer Impact

One enforcement surface: `bun run habitat check|fix|verify` locally, habitat
targets in CI. Contributors stop learning nine script idioms. Diagnostics are
uniform JSON.

## Verification Gates

- `bun run openspec -- validate habitat-enforcement-consolidation --strict`
- Retirement table complete: every deleted mechanism row cites its parity
  evidence in the H5 parity form (`empty/empty + probe-confirmed`, or
  identical non-empty finding sets) or a supersession record.
- Per-retired-rule probe matrix: every retirement-table row carries a probe
  entry (probe file path, injected violation, expected harness rule id)
  demonstrating the replacement rule catches what the retired mechanism
  caught; probes fail through the harness path post-retirement; matrix
  recorded in the phase record.
- `bun run build && bun run check && bun run test` green; CI green with
  habitat-only enforcement; no references to deleted scripts remain
  (`git grep` sweep).
