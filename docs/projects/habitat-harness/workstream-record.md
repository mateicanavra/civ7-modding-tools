# Habitat Harness — Workstream Record

- **Workstream:** habitat-harness (enforcement/codemod harness over the whole repo)
- **Owner:** workstream owner agent (single accountable synthesizer; agents assist)
- **Method:** `civ7-systematic-workstream` (12 gates) composed with `civ7-open-spec-workstream` (per-slice phase loop)
- **Controlling frame:** `docs/projects/habitat-harness/FRAME.md` (hard core, falsifier, settled decisions D1–D6)
- **Stack root:** `agent-F-habitat-harness-workstream` (worktree `wt-agent-F-habitat-harness-workstream`, parent `main`, Graphite-tracked)
- **Current execution branch:** `agent-F-cli-root-load-test-timeouts` stacked above the promoted H4 proof repairs
- **Status:** IN EXECUTION — H1/H2/H3 closed locally; H4 Biome setup/lint/integration is complete and DL-15/DL-16 promoted repairs are verified; the first `mapgen-studio:test` timeout class and the CLI root-load timeout class are locally repaired, but H4 2.4 and closure remain blocked by a second `mapgen-studio:test` root-load class. H4.5 oclif CLI slice is implemented and verified before downstream CLI surface hardening.

## Gate state (systematic-workstream)

| Gate | State | Evidence |
|---|---|---|
| 1 Frame | DONE | FRAME.md (standalone frame artifact) |
| 2 Repo state | DONE | clean worktree off main; gt-tracked; deps installed |
| 3 Diagnosis | DONE | FRAME §6 grounding insights; spec disposition §5 |
| 4 Corpus | DONE | invariant-corpus.md (every existing check, owner, disposition) |
| 5 Grouping | DONE | corpus §A–F families; taxonomy.md scope:* families |
| 6 Expectations | DONE | per-slice verification gates; ratchet baselines predeclared (project plane green; adapter-boundary baseline = 6) |
| 7 Architecture translation | DONE | taxonomy.md (tags/constraints); five-layer ownership in FRAME hard core #2 |
| 8 Slices | IN TRAIN | OpenSpec train below; H1/H2/H3 closed locally; H4 active with Biome integration complete; H4.5 oclif CLI migration implemented locally; promoted proof repairs are stacked above H4 |
| 9 Local stats | IN TRAIN | H1 build-output byte parity complete; H4 tracked post-format hashes match pre-format hashes; post-repair root build has no generated drift; first `mapgen-studio` and CLI timeout classes have local repair proof; final root test still red on second mapgen class |
| 10 Runtime proof | N/A by design | harness touches structure only; byte-parity gates stand in (H1/H4) |
| 11 Review | IN TRAIN | spec lane DONE (ledger); architecture lane before H3; impl/evidence/closure per slice |
| 12 Closure | IN TRAIN | H1/H2/H3 have local phase closure records; H4 open on root-test proof; H4.5 and promoted proof repairs are implemented/verified locally above H4 |

## The change train (slices)

| # | Change id | One-line scope | Requires | Parallel? |
|---|---|---|---|---|
| H1 | `habitat-nx-adoption` | Nx fully adopted via native Turbo migration; turbo retired; mise pin; tools/* workspace | — | train root |
| H2 | `habitat-harness-scaffold` | tools/habitat-harness package: habitat CLI, rule pack, ratchet/baselines, Nx plugin; wrap ALL existing checks (zero new rules) | H1 | — |
| H3 | `habitat-boundary-tags` | tags on all projects + enforce-module-boundaries (locked at empty baseline); ESLint quarantined to that one rule | H1, H2 | — |
| H4 | `habitat-biome-hygiene` | Biome owns hygiene; prettier retired; one blame-shielded reformat commit; ratcheted lint lane | H1, H2, H3 | — (serialized after H3: shared writes on `package.json` files, `ci.yml`, rule pack — reformat would conflict with tag edits; ledger F1) |
| H4.5 | `habitat-oclif-cli` | Replace the H2 Bun-run hand parser with repo-standard oclif command classes, help, tests, and manifest discipline while preserving command semantics | H2, H3, H4 | inserted before downstream CLI hardening (Matei D7) |
| H5 | `habitat-grit-catalog` | Grit pattern catalog (ports 8 eslint families + script families incl. G8/G10/G11, fixtures, probe-confirmed parity), first codemods, file-layer generated-zone protection | H2, H4, H4.5 | — |
| H6 | `habitat-enforcement-consolidation` | Retire superseded scripts/eslint/tests with per-rule parity + probe evidence; habitat verify becomes the single path; CI re-pointed | H3, H4.5, H5 | — |
| H7 | `habitat-git-hooks` | Husky pre-commit (staged scope; restage ONLY formatter-touched files) + pre-push affected verify; dispositions legacy `scripts/git-hooks` | H2, H3, H4, H4.5, H5 | — |
| H8 | `habitat-generators-migrations` | Project/pattern generators, harness migrations, habitat classify, agent operating procedure in AGENTS.md | H4.5, H6, H7 | train tail (strictly after H7; ledger F40) |

Each slice = one OpenSpec change + one Graphite branch stacked on its
prerequisites; phase continuity records go in
`openspec/changes/<id>/workstream/` at execution time per
`civ7-open-spec-workstream`.

Execution state on 2026-06-13: H1 (`habitat-nx-adoption`), H2
(`habitat-harness-scaffold`), and H3 (`habitat-boundary-tags`) are locally
closed on the Graphite stack. H4 (`habitat-biome-hygiene`) has Biome setup,
dry-run, format commit, blame shield, Prettier retirement, minimal green lint
lane, and Habitat/Nx/CI integration done. H4.5 (`habitat-oclif-cli`) is
implemented and verified above H4: the scaffolded Habitat CLI now uses oclif
command classes, help, tests, package build/manifest discipline, and preserved
machine-output semantics before H5-H8 add more command surface. The promoted
proof repairs for DL-16 (`intelligence-bridge-ui-bundle`), SDK async teardown
(`civ7-sdk-mod-build-sync-writes`), adapter-boundary river metadata, and
DL-15 plugin Vitest project scoping are stacked above H4. H4 task 2.4 remains
open because the full root test is not yet green after the
`mapgen-studio-test-timeouts` and `cli-root-load-test-timeouts` repairs. Root
build/parity is green, the CLI root-load timeout class is repaired, and direct
plus representative Nx-load `mapgen-studio:test` proof is green for the first
mapgen class; the latest full root proof now fails in a second mapgen
root-load class.

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
| Architecture review | taxonomy/constraints vs normalization-train ownership; no overlap with `normalize-import-boundaries` change (coordination note below) | DONE 2026-06-12 — LOCK-SAFE for manifest edges; H3 repaired one hidden relative test import missed by the source scan; A1–A6 repairs applied (ledger) |
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
- Worktree/Graphite discipline per repo skills; one slice per branch; `gt restack --upstack` after mid-stack changes; `gt sync --no-restack` in shared environments.

## Next exact action

1. ~~Pre-execution spec-review lane~~ DONE (`review-disposition-ledger.md`, all repairs applied).
2. ~~H1/H2/H3 local execution and closure~~ DONE (see each slice's
   `workstream/phase-record.md`).
3. ~~H4.5 oclif CLI migration and promoted DL-16 / SDK teardown /
   adapter-boundary repairs~~ DONE locally on the stack.
4. Validate and commit `cli-root-load-test-timeouts`, then isolate the remaining
   `mapgen-studio:test` root-load failures before claiming H4 task 2.4 or
   moving into H5.
