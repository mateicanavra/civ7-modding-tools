## 1. Phase Opening

- [x] 1.1 Create phase record with the ownership evidence (classifier is
  app-side; `@kind` unsupported; live `_adherence.oxlintrc.json` fetched).
- [x] 1.2 Commit the frame, proposal, design, tasks, spec delta, and upstream
  feedback packet as the first stack branch; validate
  `openspec validate studio-ui-token-noise-disposition --strict`.

## 2. Token-signal guard (stack branch 2)

- [x] 2.1 Generate `test/fixtures/authored-tokens.json` from the built
  `dist/styles.css` authored scopes (names + kinds + scopes), reconciled
  against the handoff inventory. Reconciliation outcome: 32 authored names
  (27 dual-scope HSL color tokens, 2 `hsl(var())` aliases, `--radius`, 2 font
  stacks) — the handoff's "~46 KEEP" list mixed in Tailwind-emitted scale
  defaults (`--text-sm`, `--spacing`, `--container-*`, `--font-weight-*`,
  palette `--color-*-N`), which the fixture classifies as framework-owned.
- [x] 2.2 Add `test/designTokens.test.ts` (final shape after the review fold):
  comment-stripped, string-safe, block-final-safe brace-tracking scan;
  structural `@property` harvesting (non-empty sanity assertion); three-bucket
  exact-name partition (authored kind-map fixture with kind-derived scopes +
  `framework-tokens.json` snapshot checked in both directions); bidirectional
  scope assertions; kind value-shapes with named unknown-kind failures;
  cross-fixture pin against `token-contract.json`; synced-guidelines
  vocabulary pin. No name-prefix heuristics.
- [x] 2.3 Negative proof re-run against the final guard (evidence in phase
  record): dropping `--warning` → stray named; appending a `--text-accent`
  declaration to a scratch CSS copy → stray named (the prefix-swallow hole is
  closed); removing `--animate-spin` from the snapshot → stray named; scope
  narrowing is unrepresentable (scopes derive from kind).
- [x] 2.4 Package test suite green after the fold (count recorded in the phase
  record).

## 3. Knowledge surfaces + upstream routing (stack branch 3)

- [x] 3.1 Author `docs/design-tokens.md` (authored vocabulary table + noise
  disposition + prohibitions + guard-scope note). Relocated out of
  `.design-sync/` by the review fold: `emitGuidelines` preserves the
  package-relative subpath and `sync-hashes.mjs` skips dot-entries, so a
  dot-nested guideline would upload once and never re-ship on edits.
- [x] 3.2 Add `"guidelinesGlob": "docs/*.md"` to `.design-sync/config.json`;
  proven render-neutral against the freshly fetched live anchor (2026-07-08):
  `design-sync:check` exit 0, verdict `anchor: ok`,
  `changed/added/removed: []`, `guidelines: 1 file(s)` shipped under
  aux/docs at `guidelines/docs/design-tokens.md`, all 47 anchor render hashes
  matched on disk. (The 7 artifact-churned-with-stable-sources entries are
  fresh-worktree rebuild byte-churn — canary spot-check with grades kept,
  pre-existing behavior.)
- [x] 3.3 Append the disposition bullet to `.design-sync/NOTES.md` (append-only
  convention; bottom-up read order).
- [x] 3.4 Add `docs/system/DEFERRALS.md` entry DEF-017: upstream classifier fix
  with re-check trigger on Claude Code / design-sync version bumps.
- [x] 3.5 Finalize `workstream/upstream-feedback.md` (corrected fix surface;
  exclusion predicate; evidence appendix) — landed with branch 1; confirmed
  against the live `x-omelette` map.

## 4. Review Fold (design.md review lanes 2 + 3)

- [x] 4.1 Eight-angle finder fan-out over the stack diff (line-scan,
  removed-behavior, cross-file tracer, reuse, simplification, efficiency,
  altitude, conventions) + five-dimension adversarial augmentation workflow
  (prose-facts, guard mutations, sync-contract, OpenSpec consistency,
  partition re-derivation).
- [x] 4.2 Fold all confirmed findings (dead `@property` harvesting,
  prefix-swallow hole, dot-path aux-hash blind spot, one-directional scope
  assertion, unknown-kind TypeError, scanner string/comment/block-final
  hardening, cwd-dependent path resolution, DEF-017 ledger ambiguity, doc
  drift, dangling evidence pointer, stale phase-record status, missing review
  lanes in design.md); record refuted findings and adjudicated non-actions in
  the phase record.

## 5. Verification And Closure

- [ ] 5.1 `bunx nx run mapgen-studio-ui:test --outputStyle=static` and
  `bunx nx run mapgen-studio-ui:check --outputStyle=static` at the stack tip.
- [ ] 5.2 `bunx nx run mapgen-studio-ui:design-sync:check --outputStyle=static`
  (re-run after the guidelines relocation).
- [ ] 5.3 `bun run openspec -- validate studio-ui-token-noise-disposition
  --strict` and `git diff --check` across the stack.
- [ ] 5.4 Submit the stack as draft PRs (`gt submit --draft --no-interactive`),
  parent-verified against `main`.
- [ ] 5.5 Record in the phase record: the next re-sync ships `guidelines/**`
  (docs-tier); the live upload remains gated on the user's explicit go-ahead.
- [ ] 5.6 Update task checkboxes; archiving happens only after the gated
  re-sync lands and the change's deltas are promoted per change-management
  spec.
