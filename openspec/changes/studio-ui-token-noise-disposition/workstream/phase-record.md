# Studio UI Token Noise Disposition Phase Record

## State

- Branch/Graphite stack: `studio-ui-token-noise-openspec` →
  `studio-ui-token-guard` → `studio-ui-token-knowledge-surfaces`, parent
  `main` (base `0c97517d86`).
- Change id: `studio-ui-token-noise-disposition`.
- Objective: end the recurring `check_design_system` token-noise tax with the
  three repo-owned levers (guard, synced knowledge, upstream routing); the
  handoff's "0/0 findings" criterion is recorded as unreachable from this repo.
- Status: opening.

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

- **Branch 2 (`studio-ui-token-guard`).** Fixture generated from the built
  `dist/styles.css` (64,809 bytes; 136 unique custom properties; 78
  `@property` rules — byte-consistent with the handoff inventory). Partition:
  32 authored / 104 framework-owned / 0 strays. Guard test
  `test/designTokens.test.ts` (4 assertions). Negative proof (2026-07-08):
  drop `--warning` → partition test fails naming `--warning`; add
  `--fake-token` → scope test fails naming `--fake-token @ dark, @ light`;
  restore → 4/4 green. Full package suite: 17 files / 172 tests green.
  Path resolution note: `import.meta.url` is not a `file:` URL under the
  root vitest transform — the test resolves `dist/styles.css` from cwd
  (package dir or repo root).
- **Branch 3 (`studio-ui-token-knowledge-surfaces`).** Guidelines channel
  wired (`guidelinesGlob: ".design-sync/guidelines/*.md"` →
  `guidelines/design-tokens.md`), NOTES.md disposition appended, DEF-017
  recorded. Render-neutrality proof: fetched the live `_ds_sync.json` anchor
  (bundleSha12 `2040d4d634b7`) into `.design-sync/.cache/remote-sync.json`,
  ran `design-sync:check` → exit 0, verdict `anchor: ok`,
  `changed/added/removed: []`, `guidelines: 1 file(s)` in the aux/docs tier,
  47/47 anchor render hashes recomputed and matched. Fresh-worktree rebuild
  byte-churn produced 7 artifact-churned-with-stable-sources entries
  (render_churn canary spot-checked 5 with grades kept — environmental,
  pre-existing driver behavior, not caused by this change). Known
  non-blocking `[RENDER_BLANK] Toaster` heuristic warning (0x0 toast
  anchor), pre-existing.

## Verification

- (to be filled at closure)
