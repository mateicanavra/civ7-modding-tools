## 1. Implementation

- [x] 1.1 Extend `BrowserConfigFormContext` with the optional `collapse`
      member; absent ⇒ templates keep today's expanded markup (no chevrons).
- [x] 1.2 Per-object header anatomy in object + array templates (chevron+
      title disclosure, trailing action zone, `data-config-*` attributes);
      array Add button moves into the action zone.
- [x] 1.3 `useConfigCollapse` hook: explicit-choices map, focused-root
      default, sticky engine (rAF scroll → `computeActiveChain` pure helper →
      scroll anchoring).
- [x] 1.4 RecipePanel: sticky toggle (`ListCollapse`, `aria-pressed`,
      default OFF) in the config actions row; scroll-root ref; wire the hook
      through `SchemaConfigForm` into formContext.
- [x] 1.5 Tests: template collapse scenarios (collapsed header, expand
      reveals content, no chevrons without context, array Add in action
      zone) + `computeActiveChain` unit coverage.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-config-collapse --strict`
- [x] 2.2 tsc + mapgen-studio vitest green
- [x] 2.3 Visual on :5173 (both modes): collapsed-by-default overview;
      manual expand/collapse incl. nested; focused root expanded; sticky
      toggle ON walks the chain on scroll without reading-position jumps;
      config values unchanged by collapse (behavior parity). Screenshot.
