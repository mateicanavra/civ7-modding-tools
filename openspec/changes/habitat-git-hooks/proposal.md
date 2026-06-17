## Why

All enforcement is currently CI-or-manual; the cheapest mistakes (formatting,
generated-zone edits, forbidden source shapes) surface minutes-to-hours late.
Husky owns local Git moments in the harness model. Matei D3: hooks are
in-scope and get done now; pre-commit auto-staging is allowed only for files
the formatter itself touched. CI remains authoritative (FRAME hard core #5) —
hooks are friction reduction, never verification truth.

## Historical Status

This change is a historical hook-wiring packet. Its original closure preserved
the then-existing resource publish behavior inside pre-commit, but that behavior
is no longer the current hook policy. Current Habitat hook behavior is governed
by `habitat-git-hook-hardening`: pre-commit performs a read-only resource-state
gate, and resource publication is an explicit `resources:publish` workflow. Use
this packet as evidence for thin Husky delegation, staged-scope containment, and
local pre-push affected wiring; do not use it as current proof for resource
publishing, full hook transaction architecture, CI authority, or product/runtime
behavior.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (D3, hard core #5, trade-offs table)
- `docs/projects/habitat-harness/habitat-harness-spec-draft-input.md` §5.6
  (hook policy table), §12.3 (hooks are not CI)
- `https://typicode.github.io/husky/get-started.html`

## What Changes

- Add `husky` devDependency; root `prepare` script installs hooks; thin
  delegator hook files (`.husky/pre-commit`, `.husky/pre-push`) that only call
  `bun run habitat hook <name>`.
- Implement `habitat hook pre-commit`: Biome format/check on staged files
  only; cheap grit checks on staged files; generated-zone staged guard.
  Format-eligible files with both staged and unstaged hunks fail fast rather
  than being formatted, because the hook does not stash or rewrite unstaged
  content.
  Auto-restage policy (D3): the hook captures the exact file list it formats
  and re-stages **only those paths** (`git add -- <formatted files>`); it
  never stages other dirty or foreign files (multi-lane worktree safety —
  see the foreign-staged-file probe, task 3.2, and its probe-matrix entry in
  the phase record: other lanes may have staged work in the same tree).
- Historical disposition of the then-existing legacy hook mechanism:
  `scripts/git-hooks/pre-commit`
  (runs `scripts/civ7-resources/publish-submodule.sh` on every commit),
  installed via `git config core.hooksPath scripts/git-hooks` by
  `scripts/git-hooks/setup.sh` (root script `setup:git-hooks`). Husky's
  install repoints `core.hooksPath`, silently dropping that behavior — so:
  fold the publish-submodule invocation into `habitat hook pre-commit`
  (preserving current behavior; inspect the script at execution time — if it
  requires opt-in state, preserve the opt-in semantics and record the
  decision in the phase record), then retire `scripts/git-hooks/` and the
  `setup:git-hooks` root script in the same slice so the two mechanisms
  never coexist.
  Later hook hardening supersedes this publish-in-pre-commit policy with an
  explicit publish command and read-only pre-commit resource-state gate.
- Implement `habitat hook pre-push`: `nx affected -t
  biome:ci,boundaries,grit:check,habitat:check,test --base=<stack-parent-or-merge-base>
  --head=HEAD --excludeTaskDependencies` bounded to a pre-measured time
  budget. `--head=HEAD` keeps pre-push scoped to the committed range being
  pushed instead of uncommitted/untracked worktree files; excluding task
  dependencies keeps the local hook on the named feedback targets while
  CI/explicit verification own dependency build expansion. Budget derivation:
  BEFORE wiring
  hooks, measure baseline wall-clock on two declared probe sets — (a) a
  10-file staged set for pre-commit, (b) a one-package change for pre-push;
  budget = 2× measured baseline, recorded in the phase record FIRST; the
  timing gate then fails if the wired hooks exceed those budgets.
  For Graphite-tracked branches, `stack-parent` is the Graphite parent branch;
  outside Graphite, the fallback remains the merge-base with `main`.
  Instructions for `--no-verify` escape recorded as policy (allowed; CI
  catches). "Cheap grit checks" is defined by a rule-pack attribute
  `hookScope: 'pre-commit'`; the tasks enumerate which pattern families get
  it (fast, path-scoped patterns only) when wiring.
- `commit-msg` evaluated and explicitly NOT installed (repo uses Graphite
  conventions, no enforced message shape today) — recorded decision, easy to
  add later.
- Local bun-only guard (pnpm artifact check) in pre-commit (mirrors CI
  guard). This is a NEW rule: it is registered in the harness rule pack as a
  file-layer rule with an empty, locked baseline via the rule-introduction
  gate — this slice is its rule-introduction change.
- Hook behavior documented in harness README + root AGENTS touchpoint;
  Graphite interaction verified (`gt create`/`gt modify` invoke git hooks).

## What Does Not Change

- CI gates unchanged and authoritative; hooks add exactly one registered rule
  (the bun-only file-layer guard, empty locked baseline, introduced via the
  rule-introduction gate); all other hook checks run existing harness rules
  earlier.
- No `post-checkout`/`post-merge` hooks in this slice (optional per spec
  draft; deferred deliberately, recorded).

## Requires

- `habitat-harness-scaffold`
- `habitat-boundary-tags` (pre-push affected run invokes the `boundaries`
  target, which exists only after H3)
- `habitat-biome-hygiene`
- `habitat-oclif-cli` (hooks delegate to the stable oclif `habitat hook`
  command surface)
- `habitat-grit-catalog` (staged grit checks; generated-zone guard)

## Enables Parallel Work

- `habitat-generators-migrations`.

## Affected Owners

- New `.husky/**`; root `package.json` (`prepare`, husky dep)
- `tools/habitat-harness` hook command implementations
- Harness README, root `AGENTS.md` tooling note

## Forbidden Owners

- Hooks must not run repo-wide checks at pre-commit (staged scope only).
- Hooks must not mutate anything beyond formatter output on staged files; no
  `git add -A`, no stash juggling, no re-staging of files the hook did not
  format.
- No hook bypass treated as verification failure (CI is the gate).

## Stop Conditions

- Pre-commit exceeds its pre-measured budget (2× baseline on the declared
  10-file staged probe set, recorded before wiring) — stop and trim scope
  before shipping.
- Hook interaction with Graphite (`gt create/modify/absorb`) produces
  surprising staging behavior in testing — stop and record before enabling.
- Restage scope cannot be proven limited to formatter-touched files.

## Consumer Impact

Contributors and agents get sub-second-to-seconds local feedback; foreign
staged files in shared worktrees are never touched (restage is path-exact).
`--no-verify` remains available; CI unchanged.

## Verification Gates

- `bun run openspec -- validate habitat-git-hooks --strict`
- Probe matrix (executed and recorded): staged-only formatting (dirty
  unstaged file untouched); foreign staged file untouched by restage;
  generated-zone staged edit blocked; pre-push runs affected targets only;
  `gt create` and `gt modify` trigger hooks correctly in a worktree.
- Hook timing gate: budgets (2× measured baseline on the two declared probe
  sets) recorded in the phase record BEFORE wiring; wired hooks measured
  against them — the gate fails if either budget is exceeded.
- Historical legacy hook disposition complete: publish-submodule behavior was
  preserved in
  `habitat hook pre-commit`; `scripts/git-hooks/` and `setup:git-hooks`
  retired in this slice. Current hook policy supersedes this with explicit
  resource publication outside default pre-commit.
- Fresh-clone `bun install` installs hooks (prepare script proof).
