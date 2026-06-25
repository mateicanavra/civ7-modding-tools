# Habitat Harness — Workstream Record

- **Workstream:** habitat-harness (enforcement/codemod harness over the whole repo)
- **Owner:** workstream owner agent (single accountable synthesizer; agents assist)
- **Method:** `civ7-systematic-workstream` (12 gates) composed with `civ7-open-spec-workstream` (per-slice phase loop)
- **Controlling frame:** `docs/projects/habitat-harness/FRAME.md` plus the
  active recovery frame in `docs/projects/habitat-harness/dra-takeover-frame.md`
- **Original stack root:** `agent-F-habitat-harness-workstream` (historical
  H1-H8 execution train)
- **Latest settled baseline branch:** `agent-F-habitat-nx-worktree-state`
- **Active recovery authority:** current closure comes from the recovery claim
  ledger and each accepted repair OpenSpec packet. Historical H1-H8 rows remain
  useful implementation evidence, but no single old packet name is the global
  active recovery state.
- **Status:** RECOVERY ACTIVE. The H1-H8 records are historical implementation
  evidence, not current closure authority by themselves. Current closure must
  be taken from the recovery claim ledger, the Grit pattern corpus ledger, and
  the active repair/pattern OpenSpec packets after fresh proof.
- **Settled current baseline:** `habitat-nx-worktree-state-contract` has
  normalized root workflows onto the Nx DAG: no Turbo, no root `nx` wrapper, no
  symlink/cache/socket workaround, package-owned `verify` targets, root
  `build/check/lint/test/verify/ci` through Nx, and standard repo-local Nx CLI
  resolution.

## Gate state (systematic-workstream)

| Gate | State | Evidence |
|---|---|---|
| 1 Frame | DONE | FRAME.md (standalone frame artifact) |
| 2 Repo state | DONE | clean worktree off main; gt-tracked; deps installed |
| 3 Diagnosis | DONE | FRAME §6 grounding insights; spec disposition §5 |
| 4 Corpus | DONE | invariant-corpus.md (every existing check, owner, disposition) |
| 5 Grouping | DONE | corpus §A–F families; taxonomy.md scope:* families |
| 6 Expectations | HISTORICAL + RECOVERY UPDATED | per-slice verification gates; H2 ratchet intent and `path::message` keys remain useful history, but current baseline proof comes from explicit committed baseline files or modeled external exception sources in `habitat-scaffold-contract-repair`, not missing-file convention. |
| 7 Architecture translation | DONE | taxonomy.md (tags/constraints); five-layer ownership in FRAME hard core #2 |
| 8 Slices | HISTORICAL + RECOVERY OPEN | H1-H8 historical train exists; active recovery slices and per-pattern packets now control implementation readiness. |
| 9 Local stats | PARTIAL CURRENT PROOF | Nx normalization has current `build` and `verify` proof; H6 command/enforcement proof is current in `habitat-enforcement-surface-cleanup`; H5 Grit row proof and H8 convention-migration claims remain packet-owned non-closures. |
| 10 Runtime proof | N/A by design | harness touches structure only; byte-parity gates stand in (H1/H4) |
| 11 Review | RECOVERY REVIEW ACTIVE | pre-execution spec/architecture reviews remain historical; active repair packets require fresh product/evidence/system review. |
| 12 Closure | OPEN | Close only by repair/pattern packet after current command, graph, baseline, Grit, generator, hook, and record-proof requirements are met. |

## The change train (slices)

| # | Change id | One-line scope | Requires | Parallel? |
|---|---|---|---|---|
| H1 | `habitat-nx-adoption` | Nx fully adopted via native Turbo migration; turbo retired; runtime pins; tools/* workspace | — | train root |
| H2 | `habitat-harness-scaffold` | tools/habitat package: habitat CLI, rule pack, ratchet/baselines, Nx plugin; wrap ALL existing checks (zero new rules) | H1 | — |
| H3 | `habitat-boundary-tags` | tags on all projects + enforce-module-boundaries (locked at empty baseline); ESLint quarantined to that one rule | H1, H2 | — |
| H4 | `habitat-biome-hygiene` | Biome owns hygiene; prettier retired; one blame-shielded reformat commit; ratcheted lint lane | H1, H2, H3 | — (serialized after H3: shared writes on `package.json` files, `ci.yml`, rule pack — reformat would conflict with tag edits; ledger F1) |
| H4.5 | `habitat-oclif-cli` | Replace the H2 Bun-run hand parser with repo-standard oclif command classes, help, tests, and manifest discipline while preserving command semantics | H2, H3, H4 | inserted before downstream CLI hardening (Matei D7) |
| H5 | `habitat-grit-catalog` | Grit pattern catalog (ports 8 eslint families + script families incl. G8/G10/G11, fixtures, probe-confirmed parity), first codemods, file-layer generated-zone protection | H2, H4, H4.5 | — |
| H6 | `habitat-enforcement-consolidation` | Historical retirement slice for superseded scripts/eslint/tests with per-rule parity + probe evidence; current command truth is superseded by `habitat-enforcement-surface-cleanup` | H3, H4.5, H5 | — |
| H7 | `habitat-git-hooks` | Husky pre-commit (staged scope; restage ONLY formatter-touched files) + pre-push affected verify; dispositions legacy `scripts/git-hooks` | H2, H3, H4, H4.5, H5 | — |
| H8 | `habitat-generators-migrations` | Project/pattern generators, harness migrations, habitat classify, agent operating procedure in AGENTS.md | H4.5, H6, H7 | train tail (strictly after H7; ledger F40) |

Each slice = one OpenSpec change + one Graphite branch stacked on its
prerequisites; phase continuity records go in
`openspec/changes/<id>/workstream/` at execution time per
`civ7-open-spec-workstream`.

Execution state on 2026-06-14 after recovery review and Nx workflow
normalization: H1-H8 have useful local phase records, but those records are
not sufficient current proof. The active truth is:

- Nx graph/root workflow settlement is current and implemented on
  `agent-F-habitat-nx-worktree-state`.
- `bun run build` and `bun run verify` pass through the Nx DAG.
- `bun run lint` now intentionally runs both project `lint` targets and
  `habitat:check` targets; it fails on existing locked Habitat/Grit rule
  violations. That failure is architecture-rule debt, not Biome formatting,
  yargs, package metadata, or Nx invocation failure.
- Command trust, baseline semantics, Grit current-tree proof, classify target
  truth, hook side effects, pattern generator metadata, and individual locked
  Grit violations remain active repair/pattern workstreams.
- P0 command trust is repaired in accepted
  `openspec/changes/habitat-oclif-entrypoint-repair/` checkpoints. That packet
  owns current root/dev/source/production help, unknown-command behavior, and
  requested selector truth. It does not close Grit current-tree proof,
  baseline proof, injected violation proof, or row-level Grit pattern closure.
- Baseline/scaffold contract repair is accepted in
  `openspec/changes/habitat-scaffold-contract-repair/`. That packet owns
  missing-file failure, explicit empty/debt baseline state, external exception
  modeling, shrink-only write refusal, and baseline record truth. Later accepted
  HR pattern-authority layers own candidate-only generator safety and manifest
  authority surfaces. They do not close row-specific Grit proof, raw direct
  acquisition, DDI-specific generated-output/path-control closure, apply safety,
  or product/runtime proof.

## Proof classes per slice (predeclared)

- **OpenSpec validation:** every slice, `--strict` (already green for all 8 at definition).
- **Local stats/parity:** H1 build-output byte parity; H4 reformat byte parity; H5 rule-parity tables (grit vs original finding sets); H6 retirement table.
- **Probe gates:** synthetic violations per rule family (H2, H3, H5, H6, H7 probe matrices in tasks).
- **Runtime proof:** not required (structure-only workstream); any slice claiming in-game behavior must escalate (it would violate FRAME exterior).
- **Graphite/PR state:** labeled separately per closure-state matrix; never inferred from local green.

## Review lanes (pre-execution, then per-slice)

| Lane | Scope | When |
|---|---|---|
| Spec review | train coherence, shortcut language, task readiness | DONE 2026-06-12 — 4 reviewers, 4× READY-WITH-REPAIRS; all repairs applied (see `review-disposition-ledger.md`) |
| Architecture review | taxonomy/constraints vs normalization-train ownership; no overlap with `normalize-import-boundaries` change (coordination note below) | DONE 2026-06-12 — historical H3 adoption review found declared manifest edges lock-safe and repaired one hidden relative test import missed by the source scan; current recovery proof for H3 lives in `habitat-boundary-taxonomy-tightening`. A1–A6 repairs applied (ledger) |
| Implementation review | per-slice diff + fixtures + baselines | each slice |
| Evidence review | parity tables, probe matrices, byte-parity claims | H1, H4, H5, H6 |
| Closure review | tasks/records/Graphite state agreement | each slice |

**Coordination note:** the MapGen normalization train
(`openspec/changes/README.md`) includes `normalize-import-boundaries` and
`normalize-guardrails-promotion`, which touch overlapping enforcement surfaces
(import policy, G-guards). The habitat train encodes guards AS THEY EXIST at
adoption time (current implied architecture, D4). If a normalization slice
lands mid-train and changes a guard, the habitat port re-baselines from the
new state — recorded in the slice's downstream-realignment ledger. Neither
train redefines the other's authority.

## Standing rules during execution

- Discrepancies found → append to `discrepancy-log.md`, do not resolve in-slice (D5).
- Trade-offs taken → FRAME §3 table, visibly revisitable (D6).
- New baseline entries only via the rule-introduction gate; baselines otherwise shrink-only.
- habitat-native rule budget watched against the FRAME degeneration trigger (≥3 tool-assigned rules falling back to native ⇒ stop and re-evaluate).
- Cross-agent capability sharing protocol: whenever a branch unlocks a
  meaningful capability/toolkit improvement that could help another
  currently-running agent stack, message that agent with the capability and
  offer an early merge/drain so they can restack on it. If they accept, do the
  early merge/drain; if they decline, continue with the normal stack schedule.
  Record the offer/result in the relevant phase record when it affects
  sequencing.
- Structural/boundary/lint-style checks found in normal test suites are
  temporary compatibility gates only. H5/H6 must migrate them into the Habitat
  harness owner that fits (Nx/Biome/Grit/file-layer/native), prove parity, and
  retire the normal-test copy. The hidden-test-authority batch migrated the
  MapGen static/source-shape examples, including morphology catalog ownership;
  generated artifact/config-authoring tests remain separate follow-up work.
- Worktree/Graphite discipline per repo skills; one slice per branch; `gt restack --upstack` after mid-stack changes; `gt sync --no-restack` in shared environments.

## Next exact action

1. Use the recovery claim ledger and accepted repair packets as the current
   authority for H1-H8 truth, with active HG row packets owning their own
   current proof and non-claim boundaries.
2. Continue only product-bearing repair packets with fresh proof; remaining
   non-claims include raw direct acquisition, row-specific generated-output or
   path-control closure, apply safety, convention migration capability, CI
   execution, changed-range affected coverage, broader product/runtime behavior,
   and recovery-claim closure unless their owning packet proves them.
