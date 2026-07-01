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
