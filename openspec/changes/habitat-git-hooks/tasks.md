## 1. Husky Wiring

- [ ] 1.1 `bun add -d husky`; `bunx husky init`; root `prepare` script; thin
  `.husky/pre-commit` and `.husky/pre-push` delegators calling
  `bun run habitat hook <name>`.
- [ ] 1.2 Fresh-clone probe: `bun install` installs hooks.

## 2. Hook Implementations

- [ ] 2.1 `habitat hook pre-commit`: staged-file Biome format/check with
  path-exact restage of formatter-touched files only; staged grit cheap
  checks; generated-zone staged guard; pnpm-artifact guard.
- [ ] 2.2 `habitat hook pre-push`: merge-base affected run
  (`biome:ci,boundaries,grit:check,habitat:check,test`) with timing capture.
- [ ] 2.3 Record the commit-msg non-installation decision and the deferred
  optional hooks (post-checkout/post-merge) in the rule pack docs.

## 3. Safety Probes

- [ ] 3.1 Staged/unstaged isolation probe: unstaged dirty file untouched.
- [ ] 3.2 Foreign-staged-file probe: a staged file the hook did not format is
  not re-staged or modified (multi-lane worktree safety).
- [ ] 3.3 Generated-zone probe: staged hand-edit blocked with regenerate
  remediation.
- [ ] 3.4 Graphite probe: `gt create` / `gt modify` fire hooks with correct
  staged scope in a worktree.

## 4. Verification And Closure

- [ ] 4.1 Timing within recorded budget; probe matrix results in phase record.
- [ ] 4.2 Harness README + AGENTS touchpoint document hook behavior and the
  `--no-verify`/CI-authoritative policy.
- [ ] 4.3 `bun run openspec -- validate habitat-git-hooks --strict`;
  realignment + closure per workstream record.
