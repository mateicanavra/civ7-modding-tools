# mapgen-studio

The MapGen Studio frontend (React 19 + Vite + Tailwind v4). See
[`system.md`](./system.md) for the as-built design language.

## Component workbench (Storybook)

The studio's presentational components have an isolated Storybook workbench —
view, exercise, and review every component in light/dark theme without booting
the daemon, the live game runtime, or the full app shell. Stories are co-located
beside their components (`src/**/*.stories.tsx`) and double as living docs via
autodocs.

```sh
# from apps/mapgen-studio
bun run storybook          # dev workbench on http://localhost:6006
bun run build-storybook    # static build -> storybook-static/

# or via Nx from the repo root
nx storybook mapgen-studio
nx build-storybook mapgen-studio
```

The workbench runs with **no daemon and no `/rpc`**: components are pure
prop-driven leaves, and each story supplies fixture props of the same shape the
app produces. Global decorators (`.storybook/preview.tsx`) reproduce the app's
rendering context — the `.dark` theme + token CSS + fonts, a `TooltipProvider`, a
per-story stub `QueryClientProvider` (the cold-`/rpc` backstop), a `Toaster`, and
a per-story Zustand store reset. Shared fixtures live in `src/storybook/`.

### Adding a story

Drop a `*.stories.tsx` beside the component (CSF 3 — a `Meta` default + named
`StoryObj` exports). Two rules keep it design-sync-ready:

- **Title = `<group>/<ComponentName>`** where `<group>` is one of `primitives`,
  `composites`, `layout`, `panels`, `forms` and `<ComponentName>` matches the
  component's export name. The title's last segment IS the design-sync card name.
- **Import the component through the app's `@/` alias** (`@/components/ui`,
  `@/ui/components/…`, `@/features/…`) — the sync redirects those to the shipped
  bundle. Supply fixture props inline; the global decorators give you theme +
  `TooltipProvider`, so most components need nothing else.

## Design sync (claude.ai/design)

The 46 stories double as the **source for the "Civ7 MapGen Studio" design
project** on claude.ai/design (`projectId 531d158d-…`), so Claude's design agent
builds new UI from the studio's *real* components. The sync runs in **`storybook`
shape**: each story is compiled into a preview that renders the shipped bundle,
and a screenshot-pair harness verifies it against the studio's **own Storybook**
before upload. Storybook is the **fidelity oracle**; the stories are the source.

Everything the sync needs lives under `apps/mapgen-studio/.design-sync/`
(`config.json`, `NOTES.md`, `conventions.md`, any owned `previews/` overrides —
all committed). The converter scripts (`.ds-sync/`), the reference Storybook
(`.design-sync/sb-reference/`), and the output (`ds-bundle/`) are generated and
gitignored. **`NOTES.md` is the operator's manual** — read it before a re-sync;
its "STORYBOOK-SHAPE FLIP" and "Re-sync risks" sections record every repo-specific
fix (why the config carries a `synthEntry` override, a `TooltipProvider`
provider, and `storyImports.shim` patterns).

### Re-syncing after a change

Run the `/design-sync` skill, or drive it directly from `apps/mapgen-studio`:

```sh
# 1. rebuild the studio dist + compiled CSS (skip with DS_SKIP_VITE=1 if current)
bash .design-sync/build-inputs.sh
# 2. rebuild the reference Storybook whenever stories or components changed
node_modules/.bin/storybook build -c .storybook -o .design-sync/sb-reference
# 3. fetch the project's anchor, then run the driver (build → diff → validate → capture)
#    DS_CHROMIUM_PATH points at system Chrome (no Playwright browser is installed)
DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry .design-sync/ds-entry.tsx --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

The driver prints one verdict (`ds-bundle/.resync-verdict.json`). **What
re-verifies is scoped to what you changed:**

| You changed | What re-verifies |
|---|---|
| nothing (re-run) | everything carries forward — 0 re-grades |
| a **component** | its stories re-capture; you re-grade them from the sheets |
| a **story** | that component re-captures; re-grade it |
| **styling / tokens** | previews re-render, grades carry (styling isn't in the grade key) |

**Grading:** the driver lists `verification.pendingGrade`. For each, Read
`ds-bundle/_screenshots/compare/<group>__<Name>.png` (storybook LEFT ‖ preview
RIGHT) and write `.design-sync/.cache/compare/<Name>.grade.json`
(`{"stories":{"<Story>":{"verdict":"match|close|mismatch"}}}`). Fix a `mismatch`
in the **preview/fixture/config layer** — copy the generated
`.cache/previews/<Name>.tsx` to `.design-sync/previews/<Name>.tsx` (minus its
first-line marker) and edit it — **never** by editing the component. Re-run until
the verdict is `ok:true` with `pendingGrade:[]`, then upload via the
`DesignSync` tool (the skill walks the finalize-plan → write → delete → anchor
sequence; a shape/group change needs a `list_files` delete-reconcile).

### Developing normally with all this in place

Day to day you just build the app — Storybook and the sync sit alongside it:

1. **Edit a component**, see it live in `bun run storybook`, adjust its story if
   the visual states changed.
2. **Re-sync when you want the design agent to have the change** — it's the one
   command above; unchanged components cost nothing.
3. **Boundaries that keep the loop honest:** never edit a component to satisfy
   the sync (fix the preview/fixture/config); reuse the existing project (never
   mint a new one); the sync never deletes the project's hand-authored
   `explorations/` designs. A `[RENDER_BLANK]` warning on a bare input/checkbox
   or the empty `Toaster` host is a heuristic false-positive, not a defect — the
   screenshot pair is the real judge.
