# Review Disposition Ledger — Pre-Execution Spec Review

- **Lane:** spec review (workstream-record.md review lanes, row 1) — run 2026-06-12, before H1
- **Reviewers:** 4 fresh framed agents, one lens each: (R1) train coherence & dependencies, (R2) shortcut language & proof inflation, (R3) cold executability vs real repo, (R4) FRAME conformance
- **Verdicts:** 4× READY-WITH-REPAIRS (no NOT-READY; no reframe trigger)
- **Disposition key:** ACCEPT (repair applied pre-H1) · ACCEPT-AMENDED (accepted, repair differs from reviewer suggestion — noted) · REJECT (with reason)
- **Blocking rule:** accepted P1/P2 block H1 start until repaired.

## P1 findings

| ID | Source | Finding | Disposition | Repair |
|---|---|---|---|---|
| F1 | R1 | H3∥H4 "disjoint write sets" is false: both touch root `package.json`, `ci.yml`, harness rule pack; H4's repo-wide reformat rewrites the `package.json` files H3 edits tags into | ACCEPT | Serialize: H4 now requires H3; train table + both proposals updated; parallelism claims removed |
| F2 | R1, R3 | Guardrail G8 (placement outcome contract) orphaned: listed as invariant, assigned to no owner, ported by no slice; H6's "delete whole scripts when emptied" could silently drop it | ACCEPT | G8 assigned to grit-check in corpus split; added to H5 port list; H6 retirement honors it |
| F3 | R1 | G10/G11 assigned to nx-boundaries in corpus but they are intra-project (Nx cannot see them); H5 ports neither; H6 retires the families citing coverage that would not exist | ACCEPT | Corpus owner → grit-check (taxonomy already said so); G10/G11 added to H5 pattern catalog; H6 retirement list matched |
| F4 | R2 | Empty-vs-empty parity is vacuous (a pattern matching nothing passes), yet it is the load-bearing precondition for H6 retirement; H6 probes only one per family | ACCEPT | H5 parity now requires injected-violation dual run (original + port both flag a synthetic violation) for every ported rule with empty current-tree findings; H6 probe gate is per retired rule with an enumerated probe matrix |
| F5 | R2 | H2 baseline-expansion gate: scenario wording garbled and the CI-visible mechanism undefined (a local `--expand-baseline` flag is invisible to CI) — ratchet bypassable while all gates green | ACCEPT | Mechanism defined: baseline additions permitted only when the same change registers a new `ruleId` in the rule pack (self-check cross-references baseline-entry diff vs rule-pack diff against merge-base); spec scenarios rewritten (reject path + permitted rule-introduction path); CI-side probe added |
| F6 | R3 | Repo already has local hooks (`scripts/git-hooks/pre-commit` → `publish-submodule.sh`, installed via `core.hooksPath` by `setup:git-hooks`); H7 unaware; Husky would silently drop the behavior; FRAME §6 "no local hooks at all" is false | ACCEPT | H7 gains an explicit disposition task for `scripts/git-hooks/*` + `setup:git-hooks` (fold publish-submodule into `habitat hook pre-commit`, retire the setup script); FRAME §6 corrected |

## P2 findings

| ID | Source | Finding | Disposition | Repair |
|---|---|---|---|---|
| F7 | R1, R3 | H7 `Requires` omits H3 though pre-push runs the `boundaries` target | ACCEPT | H3 added to H7 Requires (proposal + train table) |
| F8 | R1, R3 | Corpus assigns `eslint-studio-recipe-imports` to nx-boundaries; only H5's grit pattern actually implements it (artifact-vs-runtime split is intra-target, invisible to tags) | ACCEPT | Corpus row owner → grit-check; summary counts fixed |
| F9 | R1 | H5's domain-refactor-guardrails port scope unenumerated; H6 deletes "the ported families" without an input list | ACCEPT | H5 tasks enumerate ported families (boundary-profile) vs stay-wrapped (full-profile JSDoc/schema-description); H6 consumes that enumeration |
| F10 | R1 | H6 retires the ecology test whole, losing its "retired stage dirs absent" half (no grit/file rule covers directory absence) | ACCEPT-AMENDED | H6 slims the test (keeps the dir-absence assertion) instead of adding a new file-layer rule; corpus row updated |
| F11 | R1, R3 | H6 task 2.1 silently commits to rewriting `lint-mapgen-docs.py` in TS, contradicting corpus ("wrap; port py→TS only if touched") and FRAME §3 | ACCEPT | H6 2.1 changed to relocate/keep-wrapped for the Python linter; no forced rewrite |
| F12 | R2 | H1 spec claims cacheability parity; no gate observes cache behavior | ACCEPT | Cache gate added: double run → all cache hits; touch one package → only it + dependents miss |
| F13 | R2 | H1 "correct dependency edges" verified only by spot-check | ACCEPT | Gate rewritten as set comparison: every workspace dep edge in package.jsons present in `graph.json`; spot-checks stay as sanity |
| F14 | R1, R2, R3 | H3 violation probe direction garbled (the legal direction cannot fail) | ACCEPT | Probe rewritten: `import '@civ7/adapter'` inside `packages/config` scratch file; `kind:foundation` may depend only on `kind:foundation` → must fail naming that constraint |
| F15 | R2 | H3 spec says "locked" unconditionally while the proposal defines a baselined-red stop-condition path | ACCEPT | Spec reworded: locked when baseline empty (expected at adoption); red edges baselined + logged, lock when emptied |
| F16 | R2 | H5 design "message guidance only" for zones without generator `--check` contradicts spec "staged hand-edits SHALL fail" | ACCEPT | Design reworded: staged guard always fails on staged paths in a zone; message carries the regenerate command; false-positive cost recorded |
| F17 | R2 | H5 drift-detection scenario claims all zones; tasks wire regenerate-and-diff for one of three | ACCEPT-AMENDED | Task 4.2 wires regenerate-and-diff for both repo-runnable generators (`gen:maps`, `civ7-map-policy:gen-tables`); `civ7-types/generated` (external resources workflow) gets write-protection only, gap recorded; spec scenario scoped to zones with a repo-runnable generator |
| F18 | R2 | H2 wrapped-parity fail case probed for one rule; record promises a matrix | ACCEPT | H2 task 4.2 becomes a probe matrix: one synthetic violation per wrapped family with expected rule id + failure text |
| F19 | R3 | H2 wraps `test:architecture-cutover`, which runs 4 cutover tests — not the corpus §C six; six lack invocation spec; cutover tests missing from corpus | ACCEPT | H2 task 2.4 specifies per-file `bun test` invocations for the corpus six; cutover tests added to corpus §C as keep-as-test (coarse-wrapped) |
| F20 | R3 | H1 design conversion table covers 7 of 18 turbo.json entries; FRAME says "~6 tasks"; `deploy:mods` path-glob filter has no stated Nx mapping | ACCEPT | Design table marked illustrative with a mandatory enumerate-all-entries instruction naming the notable unmapped entries (env var, studio-recipes deps, `deploy:mods` filter mapping decision); FRAME corrected to 18 |
| F21 | R3 | H8 `bunx nx migrate @internal/habitat-harness` resolves via npm registry; package is unpublished | ACCEPT | Mechanism specified: hand-authored `migrations.json` + `bunx nx migrate --run-migrations=migrations.json`; gate = no-op migration executes |
| F22 | R2 | H7 time budgets self-chosen after the fact (gate can never fail); "cheap grit checks" undefined | ACCEPT | Budget derivation fixed: measure baseline on two declared probe sets before wiring, budget = 2× measured, recorded in phase record first; "cheap" = rule-pack attribute `hookScope: 'pre-commit'`, patterns enumerated |
| F23 | R2 | H4 byte-parity stop condition may fire for benign reasons (unminified bundles preserve formatting) with no disposition; "accepted one-time cost" has no criterion | ACCEPT | Disposition declared: formatting-independent artifacts enumerated; bundle JS compared after minify-normalization if needed (recorded trade-off); reformat delta accepted only if confined to whitespace/quote/trailing-comma classes (`git diff -w` empty + sampled review in phase record) |
| F24 | R4 | H7's bun-only (pnpm-artifact) guard is a new rule skipping the ratchet, contradicting H7's own "hooks add no new rules" | ACCEPT | Registered as a file-layer rule in the rule pack (empty baseline, locked) via the rule-introduction gate; "no new rules" claim reworded |
| F25 | R4 | H5's three file-layer generated-zone rules lack the explicit baseline/locked language the grit patterns get | ACCEPT | H5 task 5.2 extended: ratchet entries for every rule introduced in the slice, including the file-layer rules |

## P3 findings (accepted polish)

| ID | Source | Finding | Repair |
|---|---|---|---|
| F26 | R1, R2, R3 | FRAME §6 stale facts: "18 workspace packages" (21), "7 exceptions" (6), "no local hooks at all" (false), §4 "~6 tasks" (18) | FRAME corrected |
| F27 | R1, R3 | Corpus stale cells: strict-core re-point attributed to H2 (it is H6); adapter-boundary "root `check` + ci" (ci job only) | Corpus corrected |
| F28 | R1, R4 | H6/H7 dangling references to design docs that don't exist | Reworded to point at tasks |
| F29 | R1 | H3 task 2.1 "(+ eslint if needed by H6 ordering)" opaque; H2/H3 both claim the harness `kind:tooling` tag | Reworded; H3 verifies the pre-seeded tag |
| F30 | R2 | H2 `habitat fix` with zero fixable rules and `verify` base undefined | One sentence each in design (no-op message + exit 0; base = merge-base with `main`) |
| F31 | R2 | H6 perf threshold self-chosen | Pre-stated: ≤1.25× retired aggregate wall-clock on CI |
| F32 | R2 | H8 classify spot-checks lack expected outputs; migration scenario undemonstrable beyond no-op | Four paths enumerated with expected taxonomy outputs; tasks note the demonstrable gate is the no-op run |
| F33 | R2 | H1 task 4.3 affected probe unnamed; H3 "affected on clean tree" vacuous gate component | Probe names the package + expected affected set; H3 gate states `run-many --all` as the gate, affected as smoke |
| F34 | R2 | H5 "grit init artifacts committed as appropriate" | Exact: commit `.grit/grit.yaml`; gitignore `.grit/.gritmodules`/cache |
| F35 | R3 | `scripts/lint/no-legacy-m4-foundation-tokens.txt` orphan data file unowned | Added to H6 deletion-sweep disposition |
| F36 | R3 | Taxonomy §2 heading says 21, table has 22 rows | Heading clarified (21 projects + new harness package) |
| F37 | R4 | FRAME §3 by-design habitat-native set underrepresented the corpus reality (degeneration accounting ambiguity) | FRAME §3 row added enumerating the full by-design native set (doc lints ×3, workspace-entrypoints, G6/G7, H7 bun-only guard) |
| F38 | R4 | H2 spec "every rule carries a baseline" not literally satisfiable for the wrapped adapter-boundary allowlist until H5 | Design sentence added: wrapped rules may reference a legacy allowlist as transitional exception source until their port migrates it |
| F39 | R4 | H1 task 2.3 edits a rule pre-ratchet with no ceremony | Task notes expected-green-at-landing, recorded in phase record |
| F40 | R1 | H7∥H8 "prep" parallelism undefined; both write `AGENTS.md`/README | Parallelism dropped; H8 strictly follows H7 |

## Rejected findings

None. All findings were accepted (two amended). The reviewers' P1s cross-corroborated independently (G8/G10-G11 found by both R1 and R3; the hooks discovery by R3 is verified against `scripts/git-hooks/` in the repo).

## Habitat-native budget (R4 accounting)

Tool-assigned rules falling back to habitat-native across H1–H8: **0 of 3** (degeneration trigger not approached). By-design natives, excluded from the trigger count: G6, G7, adr-lint, doc-ambiguity, mapgen-docs, workspace-entrypoints, H7 bun-only guard (now a registered file-layer rule per F24 — leaves the native list).

## Outcome

All accepted P1/P2 repairs applied 2026-06-12 before H1 start; all 8 changes
re-validated `--strict` after edits. Spec-review lane CLOSED. Remaining lanes
(architecture review before H3, implementation/evidence/closure per slice)
open per workstream-record.md.

2026-06-15 recovery note: the pre-execution review outcome above is
historical readiness evidence for the original H1-H8 train. It is not current
command-surface, selector-truth, Grit current-tree, baseline, hook, or
classify/generator proof. Current command-trust proof is owned by
`openspec/changes/habitat-oclif-entrypoint-repair/`, and downstream Grit proof
must wait for that packet's explicit command/selector contract instead of
citing this historical revalidation sentence.

---

# Architecture-Review Lane (pre-H3, 2026-06-12)

- **Reviewer:** 1 fresh agent; full 22-project package-manifest edge audit (43
  declared workspace edges incl. devDeps) against taxonomy §3 under §2
  assignments, source-level import scan, normalization-train collision check,
  ESLint-config-resolution check. H3 implementation later found one hidden
  relative test import that the source scan missed
  (`@civ7/direct-control` -> `@civ7/map-policy`); it was tag-legal and repaired
  as an explicit package import/devDependency, with no baseline needed.
- **Verdict: LOCK-SAFE** — 43/43 declared manifest edges green on both the
  workstream branch and current main (incl. the post-derivation
  `studio-server → control-orpc` edge from `331534895`). H3's implementation
  pass repaired the one missed hidden relative source import as a declared,
  tag-legal devDependency. No baseline needed; the boundaries rule locks empty.

| ID | Sev | Finding | Disposition |
|---|---|---|---|
| A1 | P2 | `kind:control → kind:mod` allowance falsely provenanced: no such edge exists, and main `331534895` forbids the direction in studio-server code comments | ACCEPT — allowance dropped from taxonomy §3 pre-lock as a lock-safe correction |
| A2 | P2 | devDependencies constraint scope unstated in H3 | ACCEPT — stated in taxonomy §3 (constrained identically; 4 edges green) |
| A3 | P2 | Taxonomy §2 named the project `mod-swooper-civ-dacia`; Nx graph identity is `civ-mod-dacia` | ACCEPT — corrected |
| A4 | P3 | Dual-tag semantics are intersection | ACCEPT — documented in §3 |
| A5 | P3 | Boundaries config needs root ignore set (dist/**, .nx/**, .scratch/** etc.) | ACCEPT — applied in H3 config |
| A6 | P3 | `eslint` devDep already present (task said add); pin `@nx/eslint-plugin` to 22.7.5; `--all` flag possibly deprecated | ACCEPT — applied at implementation |

Collision check: normalize-import-boundaries / normalize-guardrails-promotion
(archived 2026-05-30) define only intra-mod policy — no project-plane overlap.
Config resolution: `eslint.boundaries.config.mjs` is non-default (never
auto-discovered). H6 removed the ordinary root `eslint.config.js`; package
`lint` scripts now use Biome directly, while the boundary target invokes
`eslint.boundaries.config.mjs` explicitly.
