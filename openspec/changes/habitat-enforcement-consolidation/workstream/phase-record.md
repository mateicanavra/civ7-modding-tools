# Phase Record — H6 `habitat-enforcement-consolidation`

## Phase

- Project: habitat-harness (FRAME.md controlling)
- Phase: H6 — enforcement consolidation and retirement of superseded
  mechanisms
- Owner: workstream owner agent (Codex continuation)
- Branch/Graphite stack: `agent-F-habitat-enforcement-consolidation` above
  `agent-F-habitat-grit-catalog`
- Started: 2026-06-14
- Status: historical implementation evidence. Current command and proof
  authority is superseded by `habitat-enforcement-surface-cleanup` where H6
  root/CI routing, wrapper, selector, and verify-proof claims differ from
  present repo behavior.

## Objective

- Target movement: make Habitat the single structural enforcement path by
  retiring or simplifying legacy scripts, ESLint config, and duplicate
  structural tests only after parity evidence and probe confirmation. Current
  recovery evidence narrows that historical target: root workflows now enter the
  Nx DAG, Habitat owns structural rule reports and mutations, and retained
  diagnostic aliases/wrappers remain explicit non-claims until their retirement
  gates land.
- Non-goals: no new product/runtime rules, no generated-output hand edits, no
  weakening constraints, no deletion of an original mechanism while it still
  owns unported semantics, and no dual path kept merely from inertia.
- Done condition: tasks 1.1-5.3 complete; retirement table and probe matrix
  recorded; root and CI-equivalent gates green; stale references swept;
  OpenSpec validation passes; Graphite branch committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: preserve generated artifacts, update adjacent
  docs/tests with behavior moves, use Graphite, leave the worktree clean.
- Hard-core frame: `docs/projects/habitat-harness/FRAME.md` hard core #1-#5.
- Corpus: `docs/projects/habitat-harness/invariant-corpus.md`.
- Workstream record:
  `docs/projects/habitat-harness/workstream-record.md`.
- H6 OpenSpec:
  `openspec/changes/habitat-enforcement-consolidation/{proposal.md,tasks.md,specs/habitat-harness/spec.md}`.
- Prerequisite evidence:
  `openspec/changes/habitat-boundary-tags/workstream/phase-record.md` and
  `openspec/changes/habitat-grit-catalog/workstream/phase-record.md`.
- User protocol: structural/boundary/lint-style normal tests are temporary
  compatibility gates; where they are structural, H6 must migrate them into
  the Habitat owner that fits and then retire or slim the test copy.
- Cross-agent capability sharing protocol: meaningful capability unlocks must
  be offered to active agent stacks before normal drain when they could
  benefit.

## Current State

- Repo/Graphite state: branch `agent-F-habitat-enforcement-consolidation`,
  clean at phase open, stacked above H5 commit
  `8b2a4d0b8 feat(habitat): close Grit catalog gate`.
- H1-H5 are locally closed on the Graphite stack.
- H5 full Habitat check passes 44 rules, including wrapped originals, Grit,
  file-layer, Biome, boundaries, and generated-zone gates.
- H5 established that Grit matching runs through exactly one native
  `grit --json check --level error` per Habitat `grit-check` invocation;
  Habitat owns rule-pack mapping, baselines, and fail/pass interpretation
  because raw Grit JSON mode exits 0 even with findings.
- Baseline note after `habitat-grit-proof-repair`: H6 references to H5
  "locked empty Grit rules" are historical and originally depended on
  missing-file-as-empty behavior. Current explicit empty Grit baseline files
  and baseline-integrity proof are owned by
  `openspec/changes/habitat-grit-proof-repair/`.
- Generated outputs are protected and must not be hand-edited.

## Scope

- Write set: H6 OpenSpec workstream artifacts; rule records/native rules in
  `tools/habitat-harness/**`; legacy lint scripts under `scripts/lint/**`;
  root scripts; CI wiring; structural test files being retired/slimmed; docs
  and routers that reference retired mechanisms.
- Protected files: generated outputs, product/runtime implementation, H5 Grit
  pattern semantics, locked baselines except shrink-only retirement.
- Owners: Nx-boundaries owns project graph law; Grit owns syntax/source-shape
  rules; Biome owns hygiene; file-layer owns path/generated-zone rules;
  Habitat-native owns remaining manifest/doc/cross-file checks under the
  FRAME native budget.

## Phase-Open Findings

Read-only retirement inventory found stale H6 assumptions that must be
reconciled before deletion:

- `eslint.config.js` cannot be blindly deleted while the value `export *`
  contract/public-surface guard remains original-owned after H5's safe-port
  stop. H6 may delete ESLint only by absorbing that existing structural
  semantic into Grit or by keeping the original wrapped until parity.
- `lint-normalization-guardrails.mjs` G1 milestone-prefixed recipe IDs remain
  original-owned after H5; G6/G7 are semantic doc/code sync and move
  Habitat-native; only G2, G3 runtime-value, G5, G8, G9, G10, and G11 have
  locked Grit ownership.
- `lint-domain-refactor-guardrails.sh` can only retire H5's explicit boundary
  families: ops/adapter/context crossing, map projection/effect dependency
  keys, and domain-root config imports. Full-profile-only families remain
  wrapped unless separately ported.
- `lint-adapter-boundary.sh` broad `/base-standard/` provenance-string
  scanning is not the same invariant as the H5 runtime-import Grit rule. H6
  must disposition broad provenance/test string coverage explicitly.
- Re-pointing root `check` to `habitat verify` can recurse if `verify` still
  calls affected `check`; composition must change in the same slice.

## Retirement Inventory

| Mechanism | H6 disposition | Evidence |
|---|---|---|
| `lint-adapter-boundary.sh` | Kept wrapped for broad provenance-string scan; H5 Grit owns runtime `/base-standard/` import shape. | Full `habitat check` still surfaces seven baselined broad-string/provenance findings; no deletion. |
| `lint-mapgen-recipe-imports.sh` | Deleted; retired to `grit-recipe-domain-surface` and related Grit domain-surface rules. | Historical H5 locked-empty claim now points to `habitat-grit-proof-repair` for current explicit baseline files; H6 injected `mods/mod-swooper-maps/src/recipes/standard/habitat-h6-probe.ts` with a deep `@mapgen/domain/.../rules/private` import and `habitat check --rule grit-recipe-domain-surface` failed. |
| `lint-domain-refactor-guardrails.sh` | Kept wrapped for boundary profile; strict/full manual alias preserved because full profile has pre-existing findings and is not a default green gate. | `habitat check --rule domain-refactor-guardrails` passes; strict profile probe found 29 existing violation groups, so no full-profile retirement. |
| `lint-normalization-guardrails.mjs` | Moved/slimmed to Habitat-native G1/G6/G7 only; G2/G3-runtime/G5/G8/G9/G10/G11 stay with H5 Grit rules. | `habitat check --rule normalization-guardrails` passes; H6 injected `M99_HABITAT_PROBE` and the Habitat rule failed. |
| `lint-control-orpc-contract-ownership.mjs` | Deleted; retired to `grit-control-orpc-contract-ownership`. | H6 injected `packages/civ7-control-orpc/src/modules/habitat-h6-probe/contract.ts` importing `@civ7/direct-control`; Habitat Grit rule failed. |
| `eslint.config.js` non-boundary rules | Deleted; ordinary ESLint rule families retired to H5 Grit and H6 `grit-contract-export-all`; `eslint.boundaries.config.mjs` remains for Nx boundaries. | Native Grit sample `contract_export_all` passes; live repo contains many `export type *` files and `habitat check --rule grit-contract-export-all` passes; injected value `export *` failed. |
| workspace-entrypoints, ADR lint, doc ambiguity | Moved to `tools/habitat-harness/src/rules/native/**`. | H6 injected `packages/habitat-h6-probe/package.json` with a hidden `bun run --filter` build script; `habitat check --rule workspace-entrypoints` failed. Advisory doc rules remain advisory in full Habitat output. |
| `lint-mapgen-docs.py` | Kept wrapped in place. | `habitat check --rule mapgen-docs` passes; no rewrite. |
| `no-legacy-m4-foundation-tokens.txt` | Kept. | `git grep` found consumers in pipeline-realism issue/review records, so the file is not orphaned. |
| `recipe-import-boundary.test.ts` | Deleted as structural duplicate. | Same H6 `grit-recipe-domain-surface` injected-violation probe covers the retired test invariant. |
| `ecology-step-import-guardrails.test.ts` | Slimmed to retired-stage-dir absence only. | H6 injected `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/`; `habitat check --rule arch-test-ecology-step-imports` failed. |
| `core-purity.test.ts` | Kept unchanged as runtime-value test. | Full Habitat check runs `arch-test-core-purity`; no H6 deletion. |
| rng/m11/map-bundle/cutover tests | Kept. | Full Habitat check runs `arch-test-rng-authority`, `arch-test-m11-projection-band`, `arch-test-map-bundle-runtime-imports`, and `arch-test-cutover`. |

## Spec/Tasks

- Validation status at phase open:
  `bun run openspec -- validate habitat-enforcement-consolidation --strict`
  passed before edits.
- Tasks 1.1-5.3 complete.

## Implementation Evidence

- Historical H6 closure claimed root `lint` as a `habitat:check` alias and root
  `check` / `ci:architecture-strict-core` as `habitat:verify` routes. Current
  recovery evidence supersedes that command truth: root `lint` runs project
  lint plus Habitat checks through Nx, root `check` aggregates
  build/check/lint/test/verify, root `verify` runs package-owned verifier
  targets, and strict-core remains a direct full-profile diagnostic alias.
- CI architecture diagnostics are separated by proof class: main CI uses the
  root graph command, strict-core remains a direct diagnostic step, and Habitat
  diagnostics are captured through the Habitat check JSON surface.
- Habitat subprocesses call local tool names directly (`biome`, `grit`,
  `eslint`, `nx`); `tools/habitat-harness/src/lib/spawn.ts` prepends
  repo-local `node_modules/.bin` to `PATH` for supply-chain-safe resolution.
- Native Grit catalog grew to 23 patterns / 45 samples; the added
  `contract_export_all` pattern uses native Grit `text(...)` filtering so
  value `export *` fails while existing `export type *` files remain green.

## Probe Matrix

| Probe | Temporary path / injection | Expected owner | Result |
|---|---|---|---|
| workspace-entrypoints | `packages/habitat-h6-probe/package.json` with `build: bun run --filter ...` | `workspace-entrypoints` | `habitat check --rule workspace-entrypoints` failed, then probe removed. |
| normalization G1 | `mods/mod-swooper-maps/src/recipes/standard/habitat-h6-probe.ts` with `M99_HABITAT_PROBE` | `normalization-guardrails` | `habitat check --rule normalization-guardrails` failed, then probe removed. |
| recipe domain surface | `mods/mod-swooper-maps/src/recipes/standard/habitat-h6-probe.ts` importing `@mapgen/domain/foundation/rules/private` | `grit-recipe-domain-surface` | `habitat check --rule grit-recipe-domain-surface` failed, then probe removed. |
| control-oRPC contract | `packages/civ7-control-orpc/src/modules/habitat-h6-probe/contract.ts` importing `@civ7/direct-control` | `grit-control-orpc-contract-ownership` | `habitat check --rule grit-control-orpc-contract-ownership` failed, then probe removed. |
| contract export star | `mods/mod-swooper-maps/src/domain/ecology/ops/habitat-h6-probe/index.ts` with value `export *` | `grit-contract-export-all` | `habitat check --rule grit-contract-export-all` failed, then probe removed. |
| ecology retired dir | `mods/mod-swooper-maps/src/recipes/standard/stages/ecology-features-score/` | `arch-test-ecology-step-imports` | `habitat check --rule arch-test-ecology-step-imports` failed, then probe removed. |

## Review / Agent Fleet

- Integration owner: Codex continuation.
- Read-only H6 retirement inventory agent: `019ec37d-6039-7aa2-9cd4-f0d9277550b2`
  (Mendel), completed with no worktree edits.
- Review lanes: inventory/spec readiness before code; implementation/evidence
  review after each retirement group; closure review before commit.

## Verification

- Green at phase open:
  - `git status --short --branch` — clean H6 branch.
  - `git log -1 --oneline` —
    `8b2a4d0b8 feat(habitat): close Grit catalog gate`.
  - `gt log short --stack` — H6 stacked above H5.
  - `bun run openspec -- validate habitat-enforcement-consolidation --strict`
    — valid.
- Green at local closure:
  - `bun run biome:check` — checked 2333 files, no fixes.
  - `bun run openspec -- validate habitat-enforcement-consolidation --strict`
    — valid.
  - `GRIT_TELEMETRY_DISABLED=true grit patterns test
    --verbose` — 23 patterns / 45 samples passed.
  - `bun tools/habitat-harness/bin/dev.ts check --tool grit-check --json` —
    pass, including `grit-contract-export-all`.
  - `bun tools/habitat-harness/bin/dev.ts check --json` — pass, 41 rules,
    zero failing, one advisory doc-ambiguity finding.
  - `bun run --cwd tools/habitat-harness check` — TypeScript check passed.
  - `bun run --cwd tools/habitat-harness test` — 2 files / 9 tests passed.
  - `bun run build` — Nx build for 21 projects and 1 dependency task passed.
  - `bun run check` — Habitat check passed; Nx affected
    `build,check,test,boundaries,biome:ci,grit:check,generated:check` passed
    for 22 projects and 1 dependency task.
  - `bun run test` — Nx test for 18 projects and 15 dependency tasks passed.

## Stop Conditions

- A parity gap appears: restore or keep the legacy check, log the gap, and
  repair the harness owner first.
- A task/proposal row contradicts H5 evidence: patch the H6 design before
  deleting code.
- `habitat verify` would recurse through root `check` after re-pointing.
- `habitat verify` exceeds 1.25x the retired aggregate CI wall-clock.
- Any change requires hand-editing generated output.

## Closure Notes

- H6 local closure is historical evidence, not current packet closure authority.
  Present command, wrapper, selector, and verify-proof boundaries are owned by
  `habitat-enforcement-surface-cleanup`.
- The strict/full domain-refactor profile is intentionally preserved as a
  manual legacy alias because its pre-existing findings make it unsuitable for
  the default green Habitat check.
- `scripts/lint/no-legacy-m4-foundation-tokens.txt` remains in place because
  repo docs still reference it as a pipeline-realism verification artifact.
