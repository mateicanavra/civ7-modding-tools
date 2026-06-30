# Tasks: MapGen Studio Design-Sync — Storybook Shape Flip (Stage 2)

Ordered implementation steps. Each block is closeable. Runs on a branch stacked
on `studio-storybook-workbench` (the Stage-1 branch / PR #1991), or on `main`
once #1991 merges. Never stage the foreign `.civ7/outputs/resources`.

## 0. Branch and readiness baseline

- [ ] Confirm Stage 1 is present (46 stories, green `build-storybook`); create
      the Stage-2 Graphite branch + worktree stacked on `studio-storybook-workbench`
      (or `main` if #1991 has merged); commit this change set as the first commit.
- [ ] Confirm the toolchain: a chromium binary is reachable
      (`DS_CHROMIUM_PATH` for system Chrome); the staged `.ds-sync/` converter +
      `storybook/` + `non-storybook/` scripts are present (re-stage from the
      bundled `design-sync` skill if stale); `.ds-sync` node deps (esbuild,
      ts-morph, playwright) installed.

## 1. Reference Storybook + config flip

- [ ] Ensure `.gitignore` ignores `.design-sync/sb-reference/`,
      `.design-sync/.cache/`, `.design-sync/learnings/`, `.ds-sync/`,
      `ds-bundle/`, and the `.design-sync/node_modules` symlink.
- [ ] Build the studio `dist/` + compiled CSS (`bash .design-sync/build-inputs.sh`).
- [ ] Build the reference Storybook once into
      `apps/mapgen-studio/.design-sync/sb-reference` (`npx storybook build -c
      .storybook -o .design-sync/sb-reference`); verify `iframe.html` > 10 KB.
- [ ] Flip `config.json`: `shape: "storybook"`, add `storybookStatic`,
      `storybookConfigDir`, `buildCmd`; preserve `projectId`/`pkg`/`globalName`/
      `componentSrcMap`/`docsMap`/`overrides`. Add `titleMap` entries only for any
      title that does not already match its export name.

## 2. Build + validate self-heal (storybook §3)

- [ ] `package-build.mjs --out ./ds-bundle` → fix `[TAG]` errors → rebuild until
      exit 0. Record any storybook-specific tag fixes
      (`[SB_REFERENCE_MISSING]`/`[TITLE_UNMAPPED]`/`! preview build failed`).
- [ ] `package-validate.mjs ./ds-bundle` → exit 0.
- [ ] Confirm decorator bundling succeeded (no `! preview decorator bundle
      failed`); set `cfg.provider` only if it failed, and re-verify a themed
      component if so.

## 3. Compare + grade all 46 (storybook §4)

- [ ] Scope the first `compare.mjs` run to a solo set; flush any global issue
      (provider/css/fonts) via a config fix + full rebuild before roster-wide
      capture.
- [ ] Capture + grade the roster in size-gated batches (fan-out): each batch's
      components captured and graded from the images; `match`/`close` only, every
      `close` noted; resolve every `mismatch` (owned preview override — never a
      component edit), `unpaired` (pairing/wrapper fix), `sb-error`
      (`overrides.skip` + NOTES reason).
- [ ] §4d roster receipt: one full-roster settlement; confirm all 46 graded and
      carried, no unresolved `mismatch`/`error`.

## 4. Re-sync upload (atomic path)

- [ ] Fetch the project's `_ds_sync.json` → `.design-sync/.cache/remote-sync.json`;
      run `resync.mjs` (atomic path, pinned `projectId`). Confirm the verdict:
      `added`/`changed`/`deletePaths` explained; `explorations/` preserved.
- [ ] `DesignSync.finalize_plan` → user approval → upload the bundle, cards, and
      `_ds_sync.json` to project `531d158d-…`. Confirm the project shows the 46
      storybook-shape cards.

## 5. Documentation: NOTES + runbook

- [ ] Append a storybook-shape section to `.design-sync/NOTES.md` (reference-build
      command, chromium path, any owned preview overrides, the re-sync routine).
- [ ] Write/extend the runbook (`apps/mapgen-studio/README.md` and/or a focused
      doc): how Storybook works here, how to use it, the two-way re-sync loop, and
      how to develop normally. Verify an agent and a human could each act from it
      alone.

## 6. Review lanes

- [ ] Run the four review lanes (cutover-integrity, isolation/parity,
      sync-safety, runbook-clarity — design.md §8); disposition findings; repair
      accepted blockers before close.

## 7. Verification gates + closure

- [ ] Record each verification gate (proposal "Verification Gates") with
      expected/actual/oracle/bad-case/non-claims.
- [ ] `bun run openspec -- validate mapgen-studio-design-sync-storybook-shape
      --strict`; `bun run openspec:validate`.
- [ ] `git diff --check`; final `git status` shows only the expected write set
      (no component edits, no story re-authoring, no foreign files).
- [ ] Commit per the Graphite workflow; submit as a **draft** PR
      (`gt submit --draft`, `gt parent` = the Stage-1 branch or `main`); leave the
      repo clean; archive the change when accepted.
