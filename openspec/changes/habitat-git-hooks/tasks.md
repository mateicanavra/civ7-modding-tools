## 1. Budget Baseline And Husky Wiring

- [ ] 1.1 BEFORE wiring hooks: measure baseline wall-clock on two declared
  probe sets — (a) a 10-file staged set for pre-commit, (b) a one-package
  change for pre-push; set budget = 2× measured baseline per hook; record
  both budgets in the phase record FIRST (the timing gate in 4.1 fails
  against these).
- [ ] 1.2 `bun add -d husky`; `bunx husky init`; root `prepare` script; thin
  `.husky/pre-commit` and `.husky/pre-push` delegators calling
  `bun run habitat hook <name>`.
- [ ] 1.3 Fresh-clone probe: `bun install` installs hooks.

## 2. Hook Implementations

- [ ] 2.1 `habitat hook pre-commit`: staged-file Biome format/check with
  path-exact restage of formatter-touched files only; staged grit cheap
  checks — defined as rule-pack patterns carrying the `hookScope:
  'pre-commit'` attribute; enumerate which pattern families get the
  attribute (fast, path-scoped patterns only) when wiring; generated-zone
  staged guard; pnpm-artifact guard (registered in the rule pack as a
  file-layer rule with an empty, locked baseline via the rule-introduction
  gate — this slice is its rule-introduction change).
- [ ] 2.2 `habitat hook pre-push`: merge-base affected run
  (`biome:ci,boundaries,grit:check,habitat:check,test`) with timing capture.
- [ ] 2.3 Record the commit-msg non-installation decision and the deferred
  optional hooks (post-checkout/post-merge) in the rule pack docs.
- [ ] 2.4 Legacy hook disposition: fold the
  `scripts/civ7-resources/publish-submodule.sh` invocation from
  `scripts/git-hooks/pre-commit` (installed via `git config core.hooksPath
  scripts/git-hooks` by `scripts/git-hooks/setup.sh`, root script
  `setup:git-hooks`) into `habitat hook pre-commit`, preserving current
  behavior — inspect the script at execution time; if it requires opt-in
  state, preserve the opt-in semantics and record the decision in the phase
  record; then retire `scripts/git-hooks/` and the `setup:git-hooks` root
  script in the same slice so the two mechanisms never coexist.

## 3. Safety Probes

- [ ] 3.1 Staged/unstaged isolation probe: unstaged dirty file untouched.
- [ ] 3.2 Foreign-staged-file probe: a staged file the hook did not format is
  not re-staged or modified (multi-lane worktree safety).
- [ ] 3.3 Generated-zone probe: staged hand-edit blocked with regenerate
  remediation.
- [ ] 3.4 Graphite probe: `gt create` / `gt modify` fire hooks with correct
  staged scope in a worktree.

## 4. Verification And Closure

- [ ] 4.1 Timing gate: wired hooks measured against the pre-recorded 2×
  budgets from task 1.1 (gate fails if either is exceeded); probe matrix
  results in phase record.
- [ ] 4.2 Harness README + AGENTS touchpoint document hook behavior and the
  `--no-verify`/CI-authoritative policy.
- [ ] 4.3 `bun run openspec -- validate habitat-git-hooks --strict`;
  realignment + closure per workstream record.
