## Why

Every `check_design_system` pass in the MapGen Studio design-system project
reports the same two findings over the compiled Tailwind CSS v4 bundle: ~80
"unclassified" tokens and 33 "custom properties under component-style
selectors." Both are Tailwind v4 engine internals (78 `@property`-registered
`--tw-*` composition vars plus ~12 `@theme` defaults) misread as authored
design tokens. Three handoff documents already exist because design sessions
keep re-diagnosing this; the app-generated `_adherence.oxlintrc.json` token→kind
map additionally mislabels every semantic color token as `"other"`, inviting a
future design agent to "fix" tokens in ways that would break Tailwind
utilities.

Evidence gathered 2026-07-08 (see `workstream/frame.md` and
`workstream/phase-record.md`) establishes that the token classifier is owned by
the claude.ai/design app's self-check, not by this repo or the bundled
design-sync skill, and that the handoff's proposed `/* @kind */` annotation
mechanism does not exist anywhere in the toolchain. The handoff's acceptance
criterion ("0 findings after re-sync") is therefore unreachable from this repo.
This change replaces that dead end with the three levers the repo actually
owns.

## Authority

- Direct user decision (2026-07-08): frame the handoff correctly and execute
  the resulting change train; no hand-edits to synced artifacts; visual
  fidelity remains the gate.
- `docs/projects/studio-ui-extraction/WORKSTREAM.md` §3 (closed workstream):
  the design-sync contract facts — upload format, grade-key recipe, re-sync
  ritual, conventions-header validation.
- `openspec/specs/change-management/spec.md`: this change is implementation
  control downstream of that authority; it does not redefine sync architecture.

## What Changes

- **Token-signal guard (repo-owned truth).** A package test in
  `@swooper/mapgen-studio-ui` parses built `dist/styles.css` and requires
  every CSS custom property to fall into exactly one of three buckets:
  *authored* (a committed name → kind fixture; scopes derived from kind so a
  dark-only color token is unrepresentable), *`@property`-registered* (engine
  vars, detected structurally), or *framework snapshot* (the exact
  non-`@property` Tailwind defaults, a second committed fixture). Strays fail
  in both directions; no name-prefix heuristics. This gives the repo a
  correct, strict token check independent of the noisy upstream one.
- **Synced knowledge surfaces.** Author
  `packages/mapgen-studio-ui/docs/design-tokens.md` (shipped as
  `guidelines/docs/design-tokens.md` via `cfg.guidelinesGlob: "docs/*.md"` —
  a non-dot path, required for aux-hash change detection) documenting the
  authored token vocabulary and the known-noise disposition, so every future
  design agent in the DS project inherits "these findings are framework noise
  — do not chase, do not hoist `--tw-*` to `:root`." The guard asserts the
  doc names every authored token. Append the same disposition to
  `.design-sync/NOTES.md` (the sync operator's required reading).
- **Upstream routing.** A polished defect report for the design-sync /
  claude.ai-design maintainers (`workstream/upstream-feedback.md`) with the
  exact exclusion predicate and evidence, plus a `docs/system/DEFERRALS.md`
  entry with a re-check trigger on Claude Code version bumps.

## What Does Not Change

- No component, story, or stylesheet source changes; zero render-affecting
  diffs. `dist/` artifacts remain generated-only.
- No edits to `.ds-sync/` staged scripts, `lib/emit.mjs`/`lib/bundle.mjs` (app
  contract surface), or `conventions.md` (validated surface).
- No hand-edits to any file in the synced DS project.
- No upload in this change: shipping `guidelines/` to the live project rides
  the next re-sync, which stays gated on the user's explicit go-ahead per the
  standing upload rule.

## Affected Owners

- `packages/mapgen-studio-ui/test/**` (new guard test + two fixtures)
- `packages/mapgen-studio-ui/.design-sync/config.json` (`guidelinesGlob` key)
- `packages/mapgen-studio-ui/docs/**` (new — the synced guidelines source)
- `packages/mapgen-studio-ui/.design-sync/NOTES.md` (append-only)
- `docs/system/DEFERRALS.md`
- `openspec/changes/studio-ui-token-noise-disposition/**`

## Forbidden Owners

- `packages/mapgen-studio-ui/src/**`, `stories/**`, compiled `dist/**`
- `packages/mapgen-studio-ui/.ds-sync/**` (staged skill scripts)
- `packages/mapgen-studio-ui/.design-sync/conventions.md`
- The live DS project's synced artifacts (read-only by contract)

## Dependencies

- Requires: none (single bounded slice; base is current `main`).
- Enables parallel work: none blocked; future re-syncs simply carry the new
  guidelines file. Packetization assessed: guard, knowledge surfaces, and
  upstream routing share one decision spine (the ownership frame) and one
  verification story, so they ship as one change executed as a small Graphite
  stack rather than separate change records.

## Consumer Impact

- Design agents in the DS project gain a guidelines card explaining the token
  vocabulary and the known-noise findings; no rendering change.
- Sync operators gain a NOTES.md disposition entry; `resync.mjs` classifies a
  guidelines-only delta as docs-tier (sampled render check), no regrade storm
  (`guidelinesGlob` is not a grade-contract key).
- CI gains one package test; it reads `dist/styles.css` via the existing
  `test` → `build` dependency edge.

## Verification Gates

- `bunx nx run mapgen-studio-ui:test --outputStyle=static` (guard green;
  fixture matches built CSS exactly).
- Guard negative proof: mutating the fixture (drop one authored token; add one
  fake) fails the test in both directions.
- `bunx nx run mapgen-studio-ui:design-sync:check --outputStyle=static` stays
  green with `guidelinesGlob` set (guidelines emitted, config validation
  passes).
- `bun run openspec -- validate studio-ui-token-noise-disposition --strict`.
- `git diff --check`.

## Stop Conditions

- The guard cannot express the authored/framework partition without touching
  compiled CSS or staged scripts — stop, revisit the frame.
- `guidelinesGlob` changes any render hash or grade key on a driver dry-run —
  stop; guidelines must be render-neutral.
- Evidence appears that the app-side check honors uploaded classification
  metadata — stop and reframe (see `workstream/frame.md` falsifier); the right
  fix would then be emitting that metadata, not documenting around it.
- Any step would require editing a synced artifact by hand.
