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

- (to be filled per stack branch)

## Verification

- (to be filled at closure)
