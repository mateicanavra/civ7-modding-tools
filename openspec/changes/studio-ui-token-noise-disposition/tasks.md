## 1. Phase Opening

- [x] 1.1 Create phase record with the ownership evidence (classifier is
  app-side; `@kind` unsupported; live `_adherence.oxlintrc.json` fetched).
- [x] 1.2 Commit the frame, proposal, design, tasks, spec delta, and upstream
  feedback packet as the first stack branch; validate
  `openspec validate studio-ui-token-noise-disposition --strict`.

## 2. Token-signal guard (stack branch 2)

- [ ] 2.1 Generate `test/fixtures/authored-tokens.json` from the built
  `dist/styles.css` authored scopes (names + kinds + scopes), reconciled
  against the handoff inventory (`~46` authored names; 25 HSL-triplet color
  tokens).
- [ ] 2.2 Add `test/designTokens.test.ts`: brace-tracking extraction of custom
  properties + `@property` rules; partition authored/framework; assert fixture
  exactness, no strays, kind value-shapes (HSL triplet, `var()` alias).
- [ ] 2.3 Negative proof: temporarily mutate fixture both directions (drop one
  authored name; add one fake) and record both failures in the phase record;
  restore.
- [ ] 2.4 `bunx nx run mapgen-studio-ui:test --outputStyle=static` green.

## 3. Knowledge surfaces + upstream routing (stack branch 3)

- [ ] 3.1 Author `.design-sync/guidelines/design-tokens.md` (authored
  vocabulary table + noise disposition + prohibitions).
- [ ] 3.2 Add `"guidelinesGlob"` to `.design-sync/config.json`; prove
  render-neutrality: `design-sync:check` green and driver classifies the delta
  as docs-tier (no component render hashes moved, no grade-key change).
- [ ] 3.3 Append the disposition bullet to `.design-sync/NOTES.md` (append-only
  convention; bottom-up read order).
- [ ] 3.4 Add `docs/system/DEFERRALS.md` entry: upstream classifier fix with
  re-check trigger on Claude Code / design-sync version bumps.
- [ ] 3.5 Finalize `workstream/upstream-feedback.md` (corrected fix surface;
  exclusion predicate; evidence appendix).

## 4. Verification And Closure

- [ ] 4.1 `bunx nx run mapgen-studio-ui:test --outputStyle=static`.
- [ ] 4.2 `bunx nx run mapgen-studio-ui:design-sync:check --outputStyle=static`.
- [ ] 4.3 `bun run openspec -- validate studio-ui-token-noise-disposition
  --strict` and `git diff --check` across the stack.
- [ ] 4.4 Submit the stack as draft PRs (`gt submit --draft --no-interactive`),
  parent-verified against `main`.
- [ ] 4.5 Record in the phase record: the next re-sync ships `guidelines/**`
  (docs-tier); the live upload remains gated on the user's explicit go-ahead.
- [ ] 4.6 Update task checkboxes; archiving happens only after the gated
  re-sync lands and the change's deltas are promoted per change-management
  spec.
