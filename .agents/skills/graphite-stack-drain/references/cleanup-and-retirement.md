# Cleanup And Retirement

Cleanup is a Graphite operation plus an accounting decision. Do not delete
branches just because the terminal graph looks cluttered.

## Cleanup Classes

| Class | Native treatment |
| --- | --- |
| Merged through Graphite | `gt sync --no-restack` should prune or prompt cleanup. |
| Submitted/open PR | Do not delete; merge/close through Graphite/GitHub first. |
| Local-only support stack | Submit/merge/drain if it should land; delete only if explicitly abandoned. |
| Source stack adopted elsewhere | Retire after sink lands or after local-only supersession is explicitly accepted. |
| Reference-only branch | Keep as reference or delete with a durable note that no product work remains. |
| Untracked branch | Track if part of a stack; otherwise treat as plain Git branch with care. |
| Worktree pinning branch | Remove or repoint the worktree before branch deletion. |

## Worktree Removal

Before removing a worktree:

```bash
git -C <worktree> status --short --branch
git worktree list --porcelain
```

If clean and disposable:

```bash
git worktree remove <worktree>
```

Use `--force` only when you have already verified that no useful uncommitted
state exists and the refusal is mechanical, such as submodule metadata.

## Graphite Branch Deletion

Prefer Graphite:

```bash
gt delete <branch> --no-interactive
```

Use `--force`, `--upstack`, or `--downstack` only from an explicit allowlist.
Remember: deleting a branch also deletes local Graphite metadata and may restack
children onto the parent.

## Retiring Source Stacks

A source stack is cleanup-ready only when every relevant branch or slice is:

- merged as-is;
- adopted by a sink;
- superseded by a named branch/stack;
- excluded by decision; or
- retained as reference-only with a reason.

If any known source branch remains `needs-adoption`, the source stack is not
ready to retire.

## Avoid These Labels

Avoid ambiguous terminal labels:

- `parked`
- `cleanup candidate`
- `retain`
- `split or retire`
- `accounted`

Use concrete labels instead:

- `source adopted: semantic`
- `source superseded`
- `source excluded`
- `sink adopts: cherry-pick`
- `merged through Graphite`
- `delete allowlisted`
