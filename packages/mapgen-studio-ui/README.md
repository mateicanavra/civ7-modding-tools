# @swooper/mapgen-studio-ui

MapGen Studio's UI component library: the 47 design-synced components as a real
package — compiled `dist/index.js`, a strict generated `.d.ts` tree
(`dist/types/`), a compiled stylesheet (`dist/styles.css`), and the theme/fonts
seams the app and the Claude Design sync both consume. Single source of truth;
the retired `build-inputs.sh` reconstruction pipeline is replaced by this
package's ordinary build.

## Operating model — a product design system

The frame everything below hangs off:

- **This is a product design system.** It deliberately carries MapGen Studio's
  composites and panels alongside the generic primitives (the same shape as
  Shopify Polaris or GitHub Primer). The picker groups — `primitives / forms /
  layout / composites / panels / templates` — are the internal layering. Only a real
  second consumer justifies splitting a primitives-only package with its own
  synced project (the B0 contract extraction is the mechanical precedent);
  don't pre-split for a consumer that doesn't exist.
- **The design system is a library, not a workspace.** Everything inside it —
  this package and its synced Claude Design project alike — exists to evolve
  the library itself.
- **Consuming projects are for product exploration.** Screens, flows, feature
  concepts, and design-space exploration happen in Claude Design projects that
  attach the design system (e.g. "App Shell"), never in the design-system
  project.

Three surfaces, three owners:

| Surface | Owner | Content |
|---|---|---|
| This package (`src/` + stories) | the repo | the truth: components, tokens, stories (the fidelity oracle) |
| DS project (pinned in `.design-sync/config.json`) | the sync | regenerated artifact: cards, `.d.ts`, prompts, bundle — never hand-edited |
| DS project `explorations/` | humans + agents | **system proposals only** (lifecycle below) |
| Consuming projects (e.g. "App Shell") | humans + agents | product design; attach the DS and explore freely |

**Exploration lifecycle — the anti-dumping-ground rule.** The DS project's
`explorations/` wears its taxonomy in the file tree — `explorations/README.md`
is the living index (every open item, its type, its status, its target):

```
explorations/
  proposals/<subject>/<proposal>.html   change or new-component proposals,
                                         nested by design SUBJECT
  references/<assembly>.html             canonical assemblies
  fixtures/<data>.js                     shared cloud-side data (see below)
```

A proposal/reference must be one of exactly three things, each declaring its
intent + pull-down path in a manifest header (filenames are kebab-case, no
spaces):

1. **Proposal: new component** (`proposals/<subject>/…`, e.g.
   `proposals/legend/new-panel.html`) — built on the live bundle, names its
   intended package home and carries story-ready fixtures. Lands as a package
   component → prune the exploration or flip it to a reference.
2. **Proposal: change to an existing component** (`proposals/<subject>/…`, e.g.
   `proposals/recipe-panel/flat-and-flush.html`) — the before/after idiom.
   The "Current" pane renders the live bundle *by reference* (so the before is
   automatically true forever); the "Proposed" pane carries consumer-side
   overrides or mocks that annotate the exact repo edit. Landed = the panes
   render identically → prune.
3. **Reference: canonical assembly** (`references/…`, e.g.
   `references/studio-shell.html`) — bare package components composed exactly
   as the app composes them; auto-tracks every sync.

**Subject folders.** `proposals/<subject>/` is keyed by the primary thing being
designed — a component name (`recipe-panel/`) or a net-new concept with no
component yet (`legend/`). A cross-cutting proposal files under its *driving*
subject, never both (`legend/merge-into-explore-panel.html` is legend-driven,
so it is not duplicated under an `explore-panel/`). One concept, one folder.

**Fixtures** (`explorations/fixtures/`) hold shared data the explorations load
via `<script src>` global-assignment (`window.__dsFixtures`) — cloud-side and
editable in the project, NOT compiled from the repo. This is the one exception
to "exploration data is repo-sourced": it exists so a dataset reused across
proposals (both `legend/` files read `map-layers.js`) is edited once, and so
you can keep simpler/denser variants for different depths. The fixtures that
back *graded component cards* still live in the repo as typed story args (the
oracle grades cards against a Storybook render of those exact args); fixtures
here never feed a graded card.

Anything else — a screen idea, a flow, a feature sketch — belongs in a
consuming project.

Two deliberate non-features: there is **no standing `before/` snapshot
structure** (the component cards ARE the always-current "before" for every
component; maintained snapshots would only rot), and there is **no
`templates/` directory of loose HTML** — an assembly that earns reuse
graduates INTO the package as a real slot-based component with a story,
surfaced in the `templates` picker group. `StudioShellLayout`
(`src/components/templates/`) is the first graduation: the studio shell as a
slot-based template, with `references/studio-shell.html` composing it in the
project. Loose HTML would be unindexed dead weight the design agent never
reads. (Free-form prototyping is *not* limited by this — you compose any new
assembly you want as a cloud exploration on the live bundle; graduation only
codifies the ones that earn reuse.)

**Where new work starts.** Product-shaped ideas start in a consuming project —
hacky is fine there. When a direction is worth locking, restate it as a DS
exploration built on the real bundle (that step forces "can our parts build
this?" and produces story-ready fixtures), then implement in the package and
resync. Small evolutions of an *existing* component skip the consuming project
and start directly as a before/after proposal in the DS project: DS
explorations render the live bundle, while consuming projects render their
attached snapshot (refreshed manually), so precise component work is strictly
better in the DS project.

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
dist/styles.css`, `buildCmd: bunx nx run mapgen-studio-ui:build`). The 47
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
