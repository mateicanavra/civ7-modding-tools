---
level: error
---
# Require MapGen Doc Ground Truth Anchors Heading

Non-router canonical MapGen docs must include a `## Ground truth anchors`
section. This pattern owns only the Markdown heading source shape; file target
existence and no-anchor warning policy remain in the residual docs validator.

```grit
language markdown

function mapgen_ground_truth_anchor_status($body) js {
  const text = $body.text;
  if (/\(legacy router\)/i.test(text)) return "ok";
  return /^##\s+Ground truth anchors\s*$/im.test(text) ? "ok" : "missing";
}

file($name, $body) where {
  $filename <: r".*docs/system/libs/mapgen/.*\.md$",
  $status = mapgen_ground_truth_anchor_status($body),
  $status <: includes "missing"
}
```

## Matches missing ground truth anchors heading

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Example
```

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Example
```

## Ignores non-router doc with heading

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Example

## Ground truth anchors
```

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Example

## Ground truth anchors
```

## Ignores legacy router

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Old Page (legacy router)
```

```markdown
<!-- @filename: docs/system/libs/mapgen/example.md -->
<toc>
</toc>

# Old Page (legacy router)
```
