## 1. Implementation

- [ ] 1.1 Restructure the bottom toolbar into VIEW (fit, edges) and DATA
      (render, space, era, variant, overlay) clusters with eyebrow labels and
      consistent label-left/control-right rows.
- [ ] 1.2 Move the debug toggle to the DATA section header (same icon/aria/
      tooltip; `aria-pressed` preserved).
- [ ] 1.3 Preserve all handlers, segmented-control treatments, and conditional
      rendering (era/variant/overlay).

## 2. Verification

- [ ] 2.1 `bun run openspec -- validate mapgen-studio-explore-toolbar-groups --strict`
- [ ] 2.2 tsc + mapgen-studio vitest green
- [ ] 2.3 Visual on :5173: clusters labeled and aligned; debug toggle on the
      DATA header still filters the list (toggle live and verify entries
      change). Screenshot.
