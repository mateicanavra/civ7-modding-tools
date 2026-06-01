# Watcher Pass Loop

Use this when a watcher automation wakes up or a user asks for a manual pass.

## Inputs

- Registered worktrees and expected branches.
- Known baseline heads, tree hashes, and upstream sync state.
- Active authority invariants and correction themes.
- Required validation commands and focused scans.
- Ignored paths such as `node_modules`, `.nx`, generated archives, and retired
  cleanup worktrees.
- Escalation rules and output format.

## Disk-First Inventory

Run the inventory from the repo root or the worktree named by the watcher
context:

```sh
git worktree list --porcelain
git status --short --branch
git rev-parse HEAD HEAD^{tree}
git rev-parse --abbrev-ref --symbolic-full-name @{u}
git rev-parse @{u} @{u}^{tree}
git log -1 --oneline --decorate
git diff --name-status
git diff --check
```

Repeat branch/status/head/tree/latest-commit/diff checks in each registered
worktree. If a branch is checked out in another worktree, inspect it there
rather than trying to check it out again. If the upstream commands fail because
the branch has no upstream, record `no upstream` as explicit state and continue
with local `HEAD` and tree evidence.

## Live Control Artifact Scan

Use exact file searches and exclude generated or retired paths:

```sh
find . \( -path './node_modules' -o -path './.nx' -o -path './archives' \) -prune -o -type f \
  \( -name 'NOTE-TO-DRA*.md' -o -name 'NEW.md' -o -name 'UPDATED.md' \) -print
rg -n "TODO:|^<<<<<<<|^=======|^>>>>>>>" . --glob '!**/node_modules/**' --glob '!**/.nx/**' --glob '!**/archives/**'
sed -n '1,90p' openspec/changes/<change-id>/workstream/dra-watcher-corrections.md
rg -n "Status:.*\\b(active|open|pending|blocking|unresolved)\\b|Blocks Closure.*\\b(yes|true)\\b" openspec/changes/<change-id>/workstream/dra-watcher-corrections.md
```

Treat live notes and TODOs as active control inputs. Treat historical log,
archive, or negative guard mentions as evidence to classify, not automatic
violations. Because correction entries are prepend-only, do not rely only on
the first page of the ledger for closure decisions; scan for unresolved
statuses and read any relevant active or open entry in full. Ledger status
blocks may be multiline, so closure passes should inspect all `Status:` rows
and nearby status text before claiming there are no unresolved corrections.

## Focused Concern Checks

Convert the watcher context into focused scans. Examples:

- forbidden imports or constructors in a named layer;
- stale public route or client vocabulary;
- fallback, compatibility-lane, shim, or dual-path language;
- unresolved OpenSpec placeholder text;
- stage/recipe/domain/adapter/projection ownership drift;
- closure ledgers that still mark blocking rows unresolved.

Prefer `rg` queries scoped to relevant specs, workstream records, and source
trees. Run `openspec validate --all --strict` when the watched lane includes
OpenSpec/spec closure or archive state.

## Classification

Classify the pass before deciding whether to notify:

- `quiet`: clean/synced, scans contain only expected historical or negative
  guard evidence, validations pass.
- `baseline-stale`: heartbeat baseline differs from disk but disk is clean and
  coherent. Report disk truth without escalating.
- `active-work`: dirty files or fresh commits look like in-progress
  implementation. Inspect enough to understand the lane, then debounce unless
  a material violation remains.
- `control-artifact`: live note/TODO/conflict marker requires DRA attention or
  integration.
- `material-violation`: a supplied invariant is currently violated.
- `closure-overclaim`: a branch, spec, ledger, or handoff claims completion
  beyond the evidence.

## Reporting

Report what matters:

- branches and heads that changed;
- dirty files or unmerged state;
- live notes/TODOs/conflict markers;
- validations run and result;
- focused scan result and whether matches are expected;
- correction action taken, if any.

Do not paste noisy command output. Summarize concrete evidence and name paths
or commits when they matter.
