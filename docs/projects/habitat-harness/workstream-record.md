# Habitat Harness — Workstream Record

- **Workstream:** habitat-harness (enforcement/codemod harness over the whole repo)
- **Owner:** workstream owner agent (single accountable synthesizer; agents assist)
- **Method:** `civ7-systematic-workstream` (12 gates) composed with `civ7-open-spec-workstream` (per-slice phase loop)
- **Controlling frame:** `docs/projects/habitat-harness/FRAME.md` (hard core, falsifier, settled decisions D1–D6)
- **Stack root:** `agent-F-habitat-harness-workstream` (worktree `wt-agent-F-habitat-harness-workstream`, parent `main`, Graphite-tracked)
- **Current execution branch:** `agent-F-habitat-generators-migrations` stacked above locally closed H7
- **Status:** TRAIN LOCALLY CLOSED — H1/H2/H3/H4/H4.5/H5/H6/H7/H8 are locally
  closed on the Graphite stack; H8 Graphite commit/stack hygiene is the final
  local step before submission/drain.

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
| 8 Slices | DONE LOCALLY | OpenSpec train below; H1-H8 closed locally |
| 9 Local stats | DONE LOCALLY | H1 build-output byte parity complete; H4 tracked post-format hashes match pre-format hashes; H5 Grit/file-layer parity and root closure gates green; H6 retirement table/probe matrix complete; H8 generated project/pattern/migration/classify probes complete |
| 10 Runtime proof | N/A by design | harness touches structure only; byte-parity gates stand in (H1/H4) |
| 11 Review | DONE LOCALLY | spec lane DONE (ledger); architecture lane before H3; impl/evidence/closure per slice; H8 closure record complete |
| 12 Closure | DONE LOCALLY | H1-H8 have local phase closure records |

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

Execution state on 2026-06-14: H1 (`habitat-nx-adoption`), H2
(`habitat-harness-scaffold`), H3 (`habitat-boundary-tags`), H4
(`habitat-biome-hygiene`), H4.5 (`habitat-oclif-cli`), H5
(`habitat-grit-catalog`), H6 (`habitat-enforcement-consolidation`), H7
(`habitat-git-hooks`), and H8 (`habitat-generators-migrations`) are locally
closed on the Graphite stack. H5 closed with native Grit patterns under
`.grit/patterns/habitat/**`, one native Grit JSON scan per Habitat
`grit-check` invocation, file-layer generated-zone guards, and root
`build/check/test` closure gates green. H6 closed with root ESLint retired,
duplicate scripts/tests deleted or slimmed only with replacement probes,
direct local tool resolution centralized in Habitat subprocess spawning, and
root `build/check/test` closure gates green. H7 closed with Husky delegators
to Habitat hook commands, staged pre-commit checks, and committed-range
pre-push affected checks. H8 closed with Nx generators for supported uniform
projects, native Grit pattern scaffolding, no-op migration wiring,
classify-first agent routing, and generated-output probes removed after proof.

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
  retire the normal-test copy. Current H4 root-proof examples:
  `mods/mod-swooper-maps/test/morphology/catalog-ownership.test.ts` and
  `mods/mod-swooper-maps/test/config/standard-recipe-artifact-guards.test.ts`.
- Worktree/Graphite discipline per repo skills; one slice per branch; `gt restack --upstack` after mid-stack changes; `gt sync --no-restack` in shared environments.

## Next exact action

1. ~~Pre-execution spec-review lane~~ DONE (`review-disposition-ledger.md`, all repairs applied).
2. ~~H1/H2/H3 local execution and closure~~ DONE (see each slice's
   `workstream/phase-record.md`).
3. ~~H4.5 oclif CLI migration and promoted DL-16 / SDK teardown /
   adapter-boundary repairs~~ DONE locally on the stack.
4. ~~H4/H4.5/H5 local execution and closure~~ DONE (see each slice's
   `workstream/phase-record.md`).
5. ~~H6 enforcement consolidation~~ DONE locally (retirement table/probe
   matrix, root ESLint retirement, duplicate structural checks retired/slimmed,
   closure gates green).
6. ~~H7 git hooks~~ DONE locally (Husky delegators, staged pre-commit,
   committed-range pre-push, legacy resources publish preserved, safety
   probes and Graphite hook proof recorded).
7. ~~H8 generators/migrations/classify~~ DONE locally (native Nx generators,
   no-op migration proof, classify matrix, AGENTS/README operating loop,
   final gates green). Next: Graphite commit/restack/submission flow.
