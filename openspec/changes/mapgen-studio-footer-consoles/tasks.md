## 1. Implementation

- [ ] 1.1 Extract a named `GameConsole` unit (live chip + apply-suggestion,
      autoplay, Run in Game + status/retry/diagnostics, save-deploy chip)
      with an identity eyebrow.
- [ ] 1.2 Merge the status/last-run bar and the run-controls bar into one
      centered Studio console (status · last · seed · reroll · auto-run · Run).
- [ ] 1.3 Footer layout: studio console truly centered; game console pinned
      right; wrap (not overlap) on narrow viewports.
- [ ] 1.4 Keep all gating/tooltips/aria/title diagnostics verbatim; update
      footer parity tests for the new structure.

## 2. Verification

- [ ] 2.1 `bun run openspec -- validate mapgen-studio-footer-consoles --strict`
- [ ] 2.2 tsc + mapgen-studio vitest green
- [ ] 2.3 Visual on :5173: centered studio console independent of game-console
      width; game console named and right-docked; stale ring + relation chip
      + Modified/dirty ring all visible in their consoles. Screenshot.
