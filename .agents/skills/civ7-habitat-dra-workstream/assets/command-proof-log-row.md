# Command Proof Log Row Template

```markdown
| Field | Value |
| --- | --- |
| Timestamp | `<UTC or local timestamp with timezone>` |
| Branch/Commit | `<Graphite branch and commit>` |
| Worktree State | `<clean or exact dirty/untracked files>` |
| Workstream | `<packet or row id>` |
| Command | `<exact command>` |
| Scan Roots | `<roots and exclusions when relevant>` |
| Proof Class | `<label from proof-classes.md>` |
| Expected Result | `<what success/failure proves>` |
| Actual Result | `<exit code and concise output>` |
| Non-Claims | `<what this command does not prove>` |
| Follow-Up | `<repair, rerun, downstream update, or closure>` |
```
