## 1. Implementation

- [x] 1.1 Autoplay button icon-only: `FastForward`/`Square`/in-flight
      spinner; state wording moves to aria-label/title/Tooltip.
- [x] 1.2 Run in Game button icon-only: `SquareArrowOutUpRight`; dynamic
      action label leads the aria-label/title/Tooltip.
- [x] 1.3 Add icon-only Explore button (`Binoculars`, optional `onExplore`
      prop, disabled placeholder) between autoplay and the run-in-game group.
- [x] 1.4 Extend GameConsole tests: action labels survive in accessible
      names; Explore renders disabled without a handler.

## 2. Verification

- [x] 2.1 `bun run openspec -- validate mapgen-studio-game-console-icons --strict`
- [x] 2.2 tsc + mapgen-studio vitest green
- [x] 2.3 Visual on :5173: three icon-only commands read as a set under the
      world bar; tooltips carry the full action names. Screenshot.
