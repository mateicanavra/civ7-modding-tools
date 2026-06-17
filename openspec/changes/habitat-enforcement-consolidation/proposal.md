## Why

After boundaries (H3) and the grit catalog (H5) are locked with recorded
parity, the repo briefly enforces many rules twice: legacy scripts/ESLint
blocks and their harness ports. Dual enforcement is transitional scaffolding,
not an end state — it doubles maintenance, splits diagnostics, and reintroduces
the pre-harness sprawl. This historical slice retired superseded mechanisms
where parity held and targeted a single Habitat enforcement path.

Current recovery note: `habitat-enforcement-surface-cleanup` owns the present
command truth. Root `check` is a graph-owned aggregate, root `lint` carries the
Habitat structural-check lane through Nx, root `verify` runs package-owned
verifier targets, and direct `habitat verify --json` is a diagnostic proof
artifact path rather than the root/CI single path. Surviving wrappers and direct
diagnostic aliases remain explicit non-claims until their own retirement gates
land.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #2; degeneration trigger)
- `docs/projects/habitat-harness/invariant-corpus.md` (retire dispositions §A–§D)
- Parity evidence recorded in `habitat-grit-catalog` and
  `habitat-boundary-tags` phase records (precondition)

## What Changes

- Retire or slim lint scripts only where H3/H5 evidence proves a Habitat owner
  now enforces the same invariant. `lint-mapgen-recipe-imports.sh` and
  `lint-control-orpc-contract-ownership.mjs` are expected to retire to locked
  Grit rules. `lint-adapter-boundary.sh` retires only for runtime
  `/base-standard/` imports; its broader provenance-string scan requires an
  explicit H6 disposition. `lint-domain-refactor-guardrails.sh` retires only
  H5's enumerated boundary families (ops/adapter/context crossing, map
  projection/effect dependency keys, and domain-root config imports);
  full-profile-only families stay wrapped unless separately ported.
  `lint-normalization-guardrails.mjs` splits: G2, G3 runtime-value, G5, G8,
  G9, G10, and G11 retire to locked Grit rules; G6/G7 move Habitat-native;
  G1 milestone-prefixed recipe IDs remain original-owned until H6 ports them
  natively or keeps the original wrapped. G3's project-edge context is the Nx
  `kind:engine` tag rule; G10/G11 are intra-project shapes — Grit owns them,
  and no retirement may cite nx-boundaries as covering them. Habitat-native
  survivors (workspace-entrypoints, G6/G7 doc-sync, JS doc lints) move into
  `tools/habitat-harness/src/rules/`; `lint-mapgen-docs.py` is NOT rewritten
  in TS — it stays wrapped unless relocation is necessary.
- Reduce ESLint only after preserving all semantics. The ported rule families
  retire to Grit/boundaries; the value `export *` contract/public-surface
  guard retires to `grit-contract-export-all`, with `export type *` allowed by
  a native Grit text guard. `eslint.boundaries.config.mjs` remains the boundary
  ESLint surface from H3; `bun run lint` becomes an alias for `habitat check`
  (or is removed; decided and recorded in tasks (task 1.2)).
- Architecture-test dedup per corpus §C: `recipe-import-boundary.test.ts`
  retires (grit equivalent locked);
  `ecology-step-import-guardrails.test.ts` slims — the deep-import assertions
  retire (locked grit equivalent), the retired-stage-dirs-absent assertions
  stay (no grit/file rule covers directory absence);
  `core-purity.test.ts` slims to runtime-value semantics not expressible as
  tags (the import-graph half retires); `rng-authority-boundary`,
  `m11-projection-boundary-band`, `map-bundle-runtime-imports` stay (runtime
  semantics, not structure).
- Historical target: root `check` and `ci:architecture-strict-core` were planned
  to re-point to `habitat verify` (nx affected composition). Current recovery
  evidence does not use that as present command truth: root `check` is the
  build/check/lint/test/verify Nx aggregate, strict-core is a direct diagnostic
  alias, and Habitat diagnostics are separate proof artifacts.
- Sweep docs/AGENTS routers that referenced retired scripts.

## What Does Not Change

- No rule semantics: every retirement requires recorded parity or explicit
  supersession; the enforced invariant set is identical before/after.
- No baselines reset; ratchet state carries over.
- Kept tests keep running where they run today.
- No raw Grit target replaces Habitat enforcement: Grit owns matching, Habitat
  owns rule IDs, baselines, and nonzero failure semantics.

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
- A proposed deletion contradicts H5 evidence (for example G1 milestone IDs,
  value `export *`, domain full-profile-only families, or broad adapter
  provenance strings) — stop and patch the design before deleting.
- Root `check` re-pointing would make `habitat verify` recurse through the
  `check` target — stop and fix verify composition before changing the root
  script.
- `habitat verify` exceeds 1.25× the retired aggregate's wall-clock on CI
  (bound pre-stated here; both timings measured and recorded in the phase
  record) — stop and fix caching before retiring.

## Consumer Impact

Target operating model: root workflows enter the Nx DAG, Habitat owns structural
rule reports and mutations, and diagnostic aliases are named as diagnostics
rather than canonical closure proof. Contributors should use the current
`habitat-enforcement-surface-cleanup` packet for present command truth.

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
