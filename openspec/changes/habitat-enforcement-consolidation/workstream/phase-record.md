# Phase Record — H6 `habitat-enforcement-consolidation`

## Phase

- Project: habitat-harness (FRAME.md controlling)
- Phase: H6 — enforcement consolidation and retirement of superseded
  mechanisms
- Owner: workstream owner agent (Codex continuation)
- Branch/Graphite stack: `agent-F-habitat-enforcement-consolidation` above
  `agent-F-habitat-grit-catalog`
- Started: 2026-06-14
- Status: OPEN — phase setup and retirement inventory in progress.

## Objective

- Target movement: make Habitat the single structural enforcement path by
  retiring or simplifying legacy scripts, ESLint config, and duplicate
  structural tests only after parity evidence and probe confirmation.
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
  semantic into Habitat-native or by keeping the original wrapped until parity.
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

## Retirement Inventory Draft

| Mechanism | Initial H6 disposition | Evidence required before retirement |
|---|---|---|
| `lint-adapter-boundary.sh` | Retire runtime-import coverage to `grit-adapter-base-standard-import`; disposition broad string/provenance scan separately. | H5 empty locked Grit rule plus probe; explicit record that broad provenance scan is not an enforced runtime invariant or remains wrapped/native. |
| `lint-mapgen-recipe-imports.sh` | Retire to Grit recipe/domain-surface rules. | H5 locked empty rules plus recipe deep-import probe through Habitat. |
| `lint-domain-refactor-guardrails.sh` | Slim boundary families only; keep full-profile-only families unless ported. | Per-family probes; no whole-script deletion while full-profile families remain. |
| `lint-normalization-guardrails.mjs` | Split: retire G2/G3-runtime/G5/G8/G9/G10/G11 to Grit, move G6/G7 native, keep or port G1 before deletion. | H5 locked rules plus probes; native G6/G7 evidence; G1 parity or preserved original. |
| `lint-control-orpc-contract-ownership.mjs` | Retire to `grit-control-orpc-contract-ownership` after package scripts move. | H5 locked rule plus package-local script sweep/probe. |
| `eslint.config.js` non-boundary rules | Retire ported Grit families; absorb or preserve `eslint-contract-export-all`. | No deletion until value-export-star guard is enforced by Habitat or kept wrapped. |
| workspace-entrypoints, ADR lint, doc ambiguity | Move to Habitat-native TS rules. | Native-rule probes and advisory behavior preserved. |
| `lint-mapgen-docs.py` | Keep wrapped unless relocation is needed; do not rewrite for its own sake. | Existing command remains callable through Habitat. |
| `no-legacy-m4-foundation-tokens.txt` | Delete if orphaned. | `git grep` evidence that no consumer remains. |
| `recipe-import-boundary.test.ts` | Retire. | Same probe as recipe Grit rule; test no longer needed as structural duplicate. |
| `ecology-step-import-guardrails.test.ts` | Slim only. | Deep-import half covered by Grit; retired-stage-dir absence stays. |
| `core-purity.test.ts` | Slim only after probe. | Preserve runtime-value semantics not covered by tags/Grit. |
| rng/m11/map-bundle/cutover tests | Keep. | Confirm suites still run; not structural duplicates for H6 retirement. |

## Spec/Tasks

- Validation status at phase open:
  `bun run openspec -- validate habitat-enforcement-consolidation --strict`
  passed before edits.
- Tasks are not complete at phase open. Task 1.1 remains open until the final
  retirement table cites concrete H3/H5 evidence pointers and probe IDs for
  every retired mechanism.

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

## Stop Conditions

- A parity gap appears: restore or keep the legacy check, log the gap, and
  repair the harness owner first.
- A task/proposal row contradicts H5 evidence: patch the H6 design before
  deleting code.
- `habitat verify` would recurse through root `check` after re-pointing.
- `habitat verify` exceeds 1.25x the retired aggregate CI wall-clock.
- Any change requires hand-editing generated output.

## Next Action

1. Patch stale H6 proposal/tasks to match H5 evidence and this phase-open
   inventory.
2. Build the concrete retirement table with probes and evidence pointers.
3. Implement retirements in small groups, verifying through Habitat after
   each group.
