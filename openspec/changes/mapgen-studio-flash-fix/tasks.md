## 1. Implementation

- [x] 1.1 Instrument: earliest-inline-script paint sampler → sessionStorage
      (parse-start / rAF / DCL / load snapshots), before vs after.
- [x] 1.2 Guard `:root { color-scheme: dark; background }` + light-branch
      root override in the theme script; remove the sampler.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-flash-fix --strict`
- [x] 2.2 Sampler evidence: before — root transparent + `color-scheme:
      normal` until ~138ms (JS-injected CSS); after — dark root by the
      first animation frame (~8ms), no regression across 40 frames.
- [x] 2.3 Reload renders normally in both themes (guard stays
      unlayered-minimal; no cascade regressions).
