# Review Disposition Ledger

## Peer Review: Resource Boundary

Reviewer: Peirce  
Scope: current unstaged diff for Habitat native platform resource drain.

| Finding | Severity | Disposition | Repair |
| --- | --- | --- | --- |
| Sync filesystem helpers could spread behind a resource facade. | P2 | Accepted | Added a public-surface guard allowlist for sync filesystem helper imports. Kept current sync edges limited to rule-registry import-time loading and workspace graph classification helpers. |
| Native Effect `Clock` usage was not ratcheted. | P2 | Accepted | Added a public-surface guard allowlist for native Effect `Clock` imports/usages and recorded native Clock as the intended Effect-first domain capability. |
| `HabitatFileSystem` alias preserved old resource vocabulary. | P2 | Accepted | Removed the alias and broad resource-barrel exports; requirements now name `FileSystem.FileSystem` directly. |

Status: all accepted P2 findings repaired in this branch before commit.
