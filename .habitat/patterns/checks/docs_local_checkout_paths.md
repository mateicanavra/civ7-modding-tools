---
level: error
---
# Docs Local Checkout Paths

Documentation should not persist absolute local checkout paths that point back
into this repo's docs tree. Use a repo-relative docs path instead.

This is suffix-based documentation hygiene. It does not prove repository
identity for historical checkout paths; it reports host-local prefixes on
references that already carry a `docs/...md` suffix.

```grit
language markdown

file($name, $body) where {
  $text = text($body),
  $text <: includes "/docs/",
  $text <: includes ".md",
  $text <: or {
    includes "/Users/",
    includes "/home/",
    includes "/Volumes/"
  }
}
```

## Flags local checkout docs paths

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `/Users/alice/dev/worktrees/wt-demo/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`.
```

## Flags main checkout docs paths

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
Read `/home/alice/src/civ7/civ7-modding-tools/docs/PROCESS.md` before editing.
```

## Ignores durable references

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `$REPO_ROOT/docs/projects/habitat-harness/demo.md`, `docs/PROCESS.md`, and [docs](https://example.com/docs/page).
```
