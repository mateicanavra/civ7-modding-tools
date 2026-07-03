---
level: error
---
# Prohibit Morphology Hotspot Overlay Publishers

Morphology stage source must not publish HOTSPOTS story overlays.

```grit
language js(typescript)

contains r"publishStoryOverlay\s*\([\s\S]{0,200}(?:HOTSPOTS|[\"']hotspots[\"'])" where {
  $filename <: r".*mods/mod-swooper-maps/src/recipes/standard/stages/(?:morphology-coasts|morphology-routing|morphology-erosion|morphology-features)/.*\.ts$"
}
```

## Matches fixture

```typescript
// @filename: mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/demo.ts
publishStoryOverlay(context, STORY_OVERLAY_TAGS.HOTSPOTS);
```

## Ignores fixture

```typescript
// @filename: mods/mod-swooper-maps/src/domain/narrative/tagging/hotspots.ts
publishStoryOverlay(context, STORY_OVERLAY_TAGS.HOTSPOTS);
```
