# Studio UI Token Noise Disposition Phase Record

## State

- Branch/Graphite stack: `studio-ui-token-noise-openspec` →
  `studio-ui-token-guard` → `studio-ui-token-knowledge-surfaces`, parent
  `main` (base `0c97517d86`).
- Change id: `studio-ui-token-noise-disposition`.
- Objective: end the recurring `check_design_system` token-noise tax with the
  three repo-owned levers (guard, synced knowledge, upstream routing); the
  handoff's "0/0 findings" criterion is recorded as unreachable from this repo.
- Status: implemented + review fold applied (lanes 2–3 of design.md executed
  2026-07-08); awaiting draft-PR submit; the live re-sync/upload remains gated
  on the user's explicit go-ahead.

## Authority And Inputs

- Direct user decision (2026-07-08): parse the handoff packet
  (`2026-07-02_ds-sync-tailwind-fix.zip` → `scraps/design_handoff_ds_sync_token_noise/`),
  frame it, and execute the resulting OpenSpec change train on a Graphite
  stack; synced artifacts stay hand-edit-free; live upload stays gated.
- `docs/projects/studio-ui-extraction/WORKSTREAM.md` §3: design-sync contract
  (upload format, grade keys, re-sync ritual, NOTES.md conventions,
  conventions-header validation).
- Root `AGENTS.md`: generated artifacts read-only; Graphite stacked PRs;
  OpenSpec root scripts.

## Opening Evidence (gathered 2026-07-08)

- **Classifier ownership.** `packages/mapgen-studio-ui/.ds-sync/package-build.mjs`
  header: "The claude.ai/design app's self-check regenerates the adherence
  config and ds_manifest." The staged converter and all `.ds-sync/lib/*` emit
  no token→kind classification (grep over the tree). The upload plan writes no
  `_adherence.oxlintrc.json` (skill upload-glob list).
- **Live project state.** `DesignSync(get_file, "_adherence.oxlintrc.json")`
  from project `531d158d-a7f6-41cb-87a4-f0f8a5e521b0` (2026-07-08): the
  `x-omelette` section carries `tokens` (136 names) and `tokenKinds` with the
  handoff's exact mis-mappings (`--background: "other"`,
  `--tw-translate-y: "color"`, `--tw-duration: "color"`, …). `list_files`
  confirms `scraps/design-sync-handoff.md` (prior feedback note) survives
  syncs; no `guidelines/` dir exists yet.
- **`@kind` is unsupported.** Binary grep of Claude Code v2.1.197 (the version
  bundling the design-sync skill + sub-skills + converter scripts): zero
  occurrences of `@kind`; zero occurrences of `check_design_system` (the check
  is app-side, not skill-side). Skills present in the binary: `design-sync`,
  `design-login`, `design-graphics`.
- **Compiled surface.** `packages/mapgen-studio-ui/dist/styles.css`: exactly 78
  `@property` rules, 309 `--tw-` references — matching the handoff's
  `token-inventory.md` extraction (78 `@property`-registered `--tw-*`; ~12
  `@theme` defaults; ~46 authored tokens).
- **Config surface.** `.design-sync/config.json` has no `guidelinesGlob` yet;
  `guidelinesGlob` is a validated config key (`.ds-sync/lib/common.mjs` known
  keys) and is not part of the grade contract (grade keys: `provider`,
  `storyImports`, `extraEntries`, `overrides`, `titleMap`).

## Implementation

- **Branch 2 (`studio-ui-token-guard`).** Fixtures generated from the built
  `dist/styles.css` (64,809 bytes as of this run; 136 unique custom
  properties = 32 authored + 26 framework snapshot + 78 `@property` —
  byte-consistent with the handoff inventory). Guard test
  `test/designTokens.test.ts` (six assertions; final shape per design.md
  Decision 1 after the review fold — see Review Fold section for the folded
  findings and re-run negative proofs). Runs under
  `// @vitest-environment node` (project default jsdom is why
  `import.meta.url` is not a `file:` URL for component tests — same note as
  the sibling `themeTokens.test.ts`).
- **Branch 3 (`studio-ui-token-knowledge-surfaces`).** Guidelines channel
  wired (`guidelinesGlob: "docs/*.md"` → `docs/design-tokens.md` ships as
  `guidelines/docs/design-tokens.md`; relocated from a dot-path by the review
  fold — see Review Fold), NOTES.md disposition appended, DEF-017 recorded
  (root ledger, disambiguated from the project ledger's DEF-017).
  Render-neutrality proof: fetched the live `_ds_sync.json` anchor
  (bundleSha12 `2040d4d634b7`) into `.design-sync/.cache/remote-sync.json`,
  ran `design-sync:check` → exit 0, verdict `anchor: ok`,
  `changed/added/removed: []`, `guidelines: 1 file(s)` in the aux/docs tier,
  47/47 anchor render hashes recomputed and matched (re-run green after the
  relocation). Fresh-worktree rebuild byte-churn produced 7
  artifact-churned-with-stable-sources entries (render_churn canary
  spot-checked 5 with grades kept — environmental, pre-existing driver
  behavior, not caused by this change). Known non-blocking
  `[RENDER_BLANK] Toaster` heuristic warning (0x0 toast anchor), pre-existing.

## Review Fold (2026-07-08 — design.md lanes 2 + 3)

Eight finder angles + a five-dimension adversarial workflow ran over the full
stack diff. Dispositions:

**Confirmed and folded:**
- `@property` harvesting was dead code (0 of 78 names collected — `@property`
  bodies hold only descriptors, so declaration stacks never see the frame;
  three independent empirical confirmations). Fixed: names harvested from rule
  preludes at frame push, plus a non-empty sanity assertion so the structural
  leg can never silently die again.
- Name-prefix framework predicate silently swallowed authored tokens in
  Tailwind `@theme` namespaces (mutation-proven: appended `--text-accent`,
  `--animate-brand-shimmer`, etc. all stayed green). Fixed: prefixes deleted;
  exact-name `framework-tokens.json` snapshot (26 names), checked stale-proof
  in both directions.
- Scope assertion was one-directional (fixture-only edit could drop `light`
  silently; mutation-proven). Fixed: scopes derive from kind (dark-only
  unrepresentable) + reverse containment (no declaration outside the kind's
  scopes).
- Guidelines dot-path was a functional bug, not cosmetics: `emitGuidelines`
  preserves the package-relative subpath and `sync-hashes.mjs` `hashDir`
  skips dot-entries — the doc would land at
  `guidelines/.design-sync/guidelines/…`, upload once, then never re-ship on
  edits (aux-hash blind spot, empirically verified with a control file).
  Fixed: source moved to `docs/design-tokens.md`, `guidelinesGlob: "docs/*.md"`,
  ships as `guidelines/docs/design-tokens.md`.
- Scanner hardening: block-final declarations (minified CSS) now flushed at
  `}`; quoted strings skipped; comments stripped (latent stack-corruption
  class). Selector normalization made comma-insensitive.
- Path resolution was cwd-dependent (reproduced failing from a third
  directory). Fixed with the sibling `themeTokens.test.ts` pattern:
  `// @vitest-environment node` + `import.meta.url`.
- Unknown fixture kind crashed with an opaque TypeError → named failure.
- DEF-017 collides with engine-refactor-v1's project-ledger DEF-017 →
  disambiguation notes on every citing surface.
- design.md lacked the config-required review-lanes section; Decision 1 prose
  had drifted from the implementation → both rewritten.
- Upstream feedback's evidence pointer dangled (the handoff inventory was
  never committed) → archived as `workstream/token-inventory.md`.
- Living surfaces (guidelines, NOTES.md) de-counted — finding classes instead
  of exact numbers; counts stay pinned only in point-in-time records.
- Cross-surface pins added: fixture ↔ `token-contract.json` name equality;
  fixture ↔ synced guidelines vocabulary.

**Refuted:**
- "Fixture pins `--background` dark-only" — a race artifact: the prose-facts
  agent read the fixture mid-mutation while the mutation-probe agent (running
  in parallel) had it temporarily edited; the committed fixture was intact
  (verified post-run: clean tree, 27 dual-scope colors). Orchestration lesson
  recorded: mutation probes get an isolated copy or a serialized slot.
- "Module-top-level scan is wasted collection work" — matches the accepted
  sibling pattern (`themeTokens.test.ts` reads dist at module scope); the
  node-env pragma removes the jsdom cost.

**Adjudicated, deliberately not actioned:**
- Consolidating this scanner with `themeTokens.test.ts`'s `tokensOf()` parser:
  the two tests pin different contracts (values vs kinds/partition); the
  cross-fixture name-equality pin closes the drift risk without rewriting a
  shipped green test in this slice.
- Cross-layer `src/styles/theme.css` ↔ dist freshness pin: the nx
  `test → build` edge covers the proof path; direct-vitest staleness is a
  known dev-loop property shared by the sibling test.
- `scripts/light-canary.mjs`'s hand-listed token subset: pre-existing file
  outside this slice; spun off as a follow-up task chip.

## Verification

- (final gate run recorded at closure)
