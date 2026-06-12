## 1. Implementation

- [x] 1.1 Verify the resources vertical before touching anything: confirm
      `StudioResourcesMode` has no readers on any branch and the
      placement-stack work that reserves the wire (documented in proposal).
- [x] 1.2 `AppFooter.tsx`: remove the Resources label/select and the
      resources line from the History label + tooltip; keep all
      `WorldSettings` plumbing untouched.
- [x] 1.3 Codify the World/Game zone boundary rule in
      `.interface-design/system.md` (Pass-5 amendment).
- [x] 1.4 Tests: footer asserts no Resources combobox; History assertions
      updated.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-world-console-map-params --strict`
- [x] 2.2 tsc + vitest green
- [x] 2.3 Visual on :5173 (dark + light): footer reads World · status ·
      History · Size · Players · Seed · reroll · auto-run · Run; run still
      works end-to-end (resources default flows silently).
