# @swooper/mapgen-studio-ui

MapGen Studio's UI component library: the 46 design-synced components as a real
package — compiled `dist/index.js`, a strict generated `.d.ts` tree
(`dist/types/`), a compiled stylesheet (`dist/styles.css`), and the theme/fonts
seams the app and the Claude Design sync both consume. Single source of truth;
the retired `build-inputs.sh` reconstruction pipeline is replaced by this
package's ordinary build.

## Consuming

| Import | What it is |
|---|---|
| `@swooper/mapgen-studio-ui` | components + lib (`cn`, `useResolvedTheme`, `LAYOUT`, statusLabels, `useConfigCollapse`) |
| `@swooper/mapgen-studio-ui/types` | types-only condition (`import type` enforced — no runtime target) |
| `@swooper/mapgen-studio-ui/theme.css` | the ONE dark-default theme source (`:root, .dark` + `.light`), for Tailwind pipelines |
| `@swooper/mapgen-studio-ui/styles.css` | compiled flat stylesheet (theme + package utilities) |
| `@swooper/mapgen-studio-ui/fonts.css` + `/fonts/*` | @font-face seam, dist-relative urls |

Theme selection is explicit: put `.dark` or `.light` on a root element
(the app does it pre-paint on `<html>`). A class-less document renders dark —
the product default.

## Contracts (LEDGER §7 — binding)

- **TooltipProvider is an ambient requirement**: rendering tooltip-bearing
  components without one is a silent blank — no console error. Hosts (app
  root, Storybook preview, design-tool cards) must provide it.
- **`data-config-header` / `data-config-pointer` + `configContentId` string
  convention**: intra-package after LEDGER adjudication 3, but still queried
  by string — renames are behavior changes.
- **`${id}__error` widget↔template ARIA id convention** — moved verbatim with
  the forms unit (B4); both sides now live in `components/forms/`. The single
  id-builder extraction (`forms/fieldIds.ts`) is scheduled for the oracle-gated
  E3 cleanup wave (tasks.md §8.1), not the move branch.
- **GameConsole `@max-3xl:hidden` requires an ancestor `@container`** —
  host-context coupling; without it the responsive collapse never fires.
- **`@rjsf/core/lib/components/Form.js` deep subpath is a pinned CSP fix** —
  re-verify on every rjsf bump (the root import path pulls the ajv validator
  chain, which `new Function`s under CSP).
- **PipelineStage layout determinism**: `buildRecipeDagLayout` output is the
  design-sync oracle's subject — layout changes are sync-visible.

## No shadcn generator

This package deliberately ships **no `components.json`**: the primitives were
moved from the app and are maintained by hand, and internal imports stay
relative (a generator's `@/*` aliases would leak unresolvable specifiers into
the emitted `.d.ts`). To scaffold a new primitive, copy an existing one or run
the shadcn CLI in a scratch app and relativize its imports on the way in.

## Build

`bun run build` = tsup (`dist/index.js`, ESM, browser) → strict
`tsc -p tsconfig.dts.json` (`dist/types/`, FAILS on any type error) →
`tailwindcss -i src/styles/index.css -o dist/styles.css` → `copy-fonts.mjs`
(`dist/fonts.css` + `dist/fonts/`, fails on missing files). Zero post-build
transforms. `bun run verify` asserts the artifact contract; the committed
token fixture (`test/fixtures/token-contract.json`) pins theme parity with the
last `_ds-compiled.css` the retired pipeline shipped.

## Design sync (claude.ai/design)

This package IS the synced artifact: `.design-sync/` (config, notes,
conventions) and `.ds-sync/` (the vendored converter) live here, and the
config consumes the real build (`entry: dist/index.js`, `cssEntry:
dist/styles.css`, `buildCmd: bunx nx run mapgen-studio-ui:build`). The 46
co-located stories are the fidelity oracle; story titles are the sync's
grouping authority (byte-frozen).

- `bunx nx run 'mapgen-studio-ui:"design-sync:check"'` (colon-named target —
  quote it) — the CI-runnable local
  verdict: package build (Nx edge) → reference Storybook rebuild → resync
  driver (converter build → anchored diff → chromium render check → scoped
  capture). Deliberately outside the CI five-target graph (chromium weight).
- Operational truth lives in `.design-sync/NOTES.md` (append-only — read
  bottom-up; the extraction-repoint section is the current runbook). Uploads
  to the pinned project are gated on explicit go-ahead — never automatic.
