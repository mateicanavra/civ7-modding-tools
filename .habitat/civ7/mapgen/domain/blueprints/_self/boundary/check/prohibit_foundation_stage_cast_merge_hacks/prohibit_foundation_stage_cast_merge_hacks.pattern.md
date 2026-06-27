---
level: error
---
# Prohibit Foundation Stage Cast Merge Hacks

Foundation stage entrypoints must not restore wrapper-era advanced config cast or object-spread fallback hacks.

```grit
language js(typescript)

or {
  `($value ?? {}) as $type`,
  `...($spread)` where {
    $spread <: `typeof $value === "object" ? $value : {}`
  }
} where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/foundation-(?:lithosphere|mantle|orogeny|projection|tectonics)/index\.ts$"
}
```
