---
level: error
---
# Require MapGen Doc Mini Toc Shape

Canonical MapGen docs must start with the mini XML `<toc>` block. This pattern
owns only the Markdown source-shape predicate; reference resolution remains in
the residual docs validator.

```grit
language markdown

function mapgen_mini_toc_status($body) js {
  const first = $body.text.split(/\r?\n/).find((line) => line.trim().length > 0);
  return first?.trim().startsWith("<toc>") ? "ok" : "missing";
}

file($name, $body) where {
  $filename <: r".*docs/system/libs/mapgen/.*\.md$",
  $status = mapgen_mini_toc_status($body),
  $status <: includes "missing"
}
```

## Matches missing mini toc

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
# Example

## Ground truth anchors
```

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
# Example

## Ground truth anchors
```

## Ignores mini toc at first non-empty line

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->

<toc>
- [Example](#example)
</toc>

# Example
```

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->

<toc>
- [Example](#example)
</toc>

# Example
```
