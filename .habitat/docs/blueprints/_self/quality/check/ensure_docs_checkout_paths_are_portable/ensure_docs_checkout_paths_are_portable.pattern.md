---
level: none
---
# Ensure Docs Checkout Paths Are Portable

Rewrite absolute local checkout paths that point at Markdown files under a
`docs/` suffix to durable repo-relative `docs/...` references.

This is suffix-based documentation hygiene. It does not prove repository
identity for historical checkout paths; it removes host-local prefixes from
references that already carry a `docs/...md` suffix.

```grit
language markdown

function docs_local_checkout_rewrite_path($body) js {
  return $body.text.replace(/\/(?:Users|home|Volumes)\/[^`\s)]+\/(docs\/[^`\s)]+\.md)\b/g, "$1");
}

file($name, $body) where {
  $text = text($body),
  $text <: includes "/docs/",
  $text <: includes ".md",
  $text <: or {
    includes "/Users/",
    includes "/home/",
    includes "/Volumes/"
  },
  $body => docs_local_checkout_rewrite_path($body)
}
```

## Rewrites local checkout docs paths

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `/Users/alice/dev/worktrees/wt-demo/docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`.
```

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D4-review.md`.
```

## Rewrites main checkout docs paths

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
Read `/home/alice/src/civ7/civ7-modding-tools/docs/PROCESS.md` before editing.
```

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
Read `docs/PROCESS.md` before editing.
```

## Ignores durable references

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `$REPO_ROOT/docs/projects/habitat-harness/demo.md`, `docs/PROCESS.md`, and [docs](https://example.com/docs/page).
```

```markdown
<!-- @filename: docs/projects/habitat-harness/demo.md -->
See `$REPO_ROOT/docs/projects/habitat-harness/demo.md`, `docs/PROCESS.md`, and [docs](https://example.com/docs/page).
```
