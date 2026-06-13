## Why

All enforcement is currently CI-or-manual; the cheapest mistakes (formatting,
generated-zone edits, forbidden source shapes) surface minutes-to-hours late.
Husky owns local Git moments in the harness model. Matei D3: hooks are
in-scope and get done now; pre-commit auto-staging is allowed only for files
the formatter itself touched. CI remains authoritative (FRAME hard core #5) —
hooks are friction reduction, never verification truth.

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
  Auto-restage policy (D3): the hook captures the exact file list it formats
  and re-stages **only those paths** (`git add -- <formatted files>`); it
  never stages other dirty or foreign files (multi-lane worktree safety —
  see shared-worktree note in design of record: other lanes may have staged
  work in the same tree).
- Implement `habitat hook pre-push`: `bunx nx affected -t
  biome:ci,boundaries,grit:check,habitat:check,test --base=<merge-base>`
  bounded to a recorded time budget; instructions for `--no-verify` escape
  recorded as policy (allowed; CI catches).
- `commit-msg` evaluated and explicitly NOT installed (repo uses Graphite
  conventions, no enforced message shape today) — recorded decision, easy to
  add later.
- Local bun-only guard (pnpm artifact check) in pre-commit (mirrors CI guard).
- Hook behavior documented in harness README + root AGENTS touchpoint;
  Graphite interaction verified (`gt create`/`gt modify` invoke git hooks).

## What Does Not Change

- CI gates unchanged and authoritative; hooks add no new rules — they run
  existing harness rules earlier.
- No `post-checkout`/`post-merge` hooks in this slice (optional per spec
  draft; deferred deliberately, recorded).

## Requires

- `habitat-harness-scaffold`
- `habitat-biome-hygiene`
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

- Pre-commit exceeds the recorded time budget on a typical staged set — stop
  and trim scope before shipping.
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
- Hook timing recorded against the budget.
- Fresh-clone `bun install` installs hooks (prepare script proof).
