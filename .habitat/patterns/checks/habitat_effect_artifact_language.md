---
level: error
---
# Habitat Effect Artifact Language

Habitat artifacts are declarative. Implementation code and source/vendor
topology belong in the owning Habitat source domain, provider, or adapter.

```grit
language js(typescript)

`$body` where {
  $filename <: r"^\.habitat/(?:rules|patterns|baselines)/.*\.(?:cjs|cts|js|jsx|mjs|mts|ts|tsx)$"
}
```

## Matches fixture

```typescript
// @filename: .habitat/rules/probe/guard.ts
export const managingCode = true;

// @filename: .habitat/patterns/providers/grit/rule.json
{ "id": "source-topology-under-artifacts" }
```

## Ignores fixture

```typescript
// @filename: .habitat/rules/probe/rule.json
{ "id": "probe" }

// @filename: .habitat/patterns/checks/probe.md
export const markdownFixtureParsesAsTypescript = "pattern text belongs here";

// @filename: .habitat/baselines/probe.json
[]
```
