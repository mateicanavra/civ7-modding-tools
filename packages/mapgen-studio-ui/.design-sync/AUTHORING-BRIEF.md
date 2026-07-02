> **HISTORICAL — retired app-hosted/package-shape pipeline (pre-extraction, superseded at B7 2026-07-02). Kept for the record; NOT a runbook.**

# design-sync preview authoring brief (mapgen-studio)

You are authoring **preview cards** for components of the MapGen Studio design
system so they render in Claude Design. The studio is a dark, dense
"cartographer's instrument" (graphite substrate, one cool-steel slate accent,
borders-only chrome, Inter + JetBrains Mono). Your previews must look like the
real studio.

Work from the repo's **package dir**: `apps/mapgen-studio`. All paths below are
relative to it.

## The recipe (validated — follow exactly)

For each assigned component `<Name>`, write `.design-sync/previews/<Name>.tsx`:

- **Import DS components from `"mapgen-studio"`** (this resolves to the bundle at
  render time): `import { Button, Select, SelectTrigger, ... } from "mapgen-studio";`
  Icons: `import { Play, Globe } from "lucide-react";` (available).
- **Each story is an ARROW-CONST export**: `export const Default = () => (<JSX/>);`
  Each export becomes one card cell AND a synthesized usage example, so the name
  matters (PascalCase, descriptive: `Default`, `Checked`, `Disabled`, `WithLabel`).
  Author **2–5 stories** per component (fewer for trivial ones).
- **Wrap content in a dark surface** so it reads on the studio substrate. Use a
  NON-exported helper (it won't become a cell):
  ```tsx
  function Demo({ children }) {
    return (
      <div className="bg-background text-foreground"
           style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    );
  }
  ```
  Theme via token utilities (`bg-background`, `bg-card`, `text-foreground`,
  `text-muted-foreground`, `border border-border`); use inline `style` for layout
  (padding/gap/width) — arbitrary Tailwind values may not be in the compiled CSS.
- **Mock props are runtime-only.** Previews are esbuild-compiled, NOT
  typechecked — pass only the fields the component actually reads at runtime
  (read the source). Use **realistic studio content** (map sizes, seeds like
  "1474829", recipe names like "mod-swooper-maps/standard", real labels) — never
  `foo`/`bar`/`test`. Callbacks: `const noop = () => {};`.
- **Read the component source first** (`src/components/ui/<name>.tsx` or
  `src/ui/components/<Name>.tsx`) to see its real props, sub-components, and what
  it renders. Compose compound components fully (e.g. a `Select` needs
  `SelectTrigger`+`SelectValue`+`SelectContent`+`SelectItem`s).

## Build + capture + grade loop (per component)

Run from `apps/mapgen-studio`:

```bash
export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# rebuild ONLY your components' preview html (never the whole bundle):
node .ds-sync/lib/preview-rebuild.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle --components <Name1>,<Name2>
# capture ONLY your components (scoped — never run unscoped):
node .ds-sync/package-capture.mjs --out ./ds-bundle --components <Name1>,<Name2>
```

Then for EACH component, **Read** `ds-bundle/_screenshots/review/<group>__<Name>.png`
(group = `primitives` or `composites`, given per assignment). Grade each cell on
the absolute rubric:
- **Styled**: real DS tokens/fonts applied (dark surface, slate/steel accents,
  Inter type) — not browser-default, not unstyled boxes.
- **Complete**: composition renders whole — no missing children, no collapsed/empty
  layout, no `⚠` cells.
- **Plausible**: a DS author would recognize it as sensible use — realistic
  content, sane spacing, the variant axis actually varying.

Write `.design-sync/.cache/review/<Name>.grade.json`:
```json
{"cells":{"<CellName>":{"verdict":"good","note":"one line"}}}
```
Cell keys must EXACTLY equal the export names (the capture log prints them).
If a cell is `needs-work`: fix the `.tsx` → preview-rebuild → capture → **re-Read
the sheet** → regrade. Iterate until every cell is `good`. NEVER write a grade
for a sheet you did not Read this iteration.

If a preview build fails, the capture log prints `! preview build failed: <Name>: <err> (file:line:col)` — fix the `.tsx` at that location.

## Overlays (Select, DropdownMenu, Popover, Tooltip)

These have `cardMode: single` + a viewport override ALREADY SET in config — author
**one story that renders the OPEN state** so the card shows the menu/list/content:
- `Select`: `<Select defaultOpen>` … (trigger + open item list).
- `DropdownMenu`: `<DropdownMenu open>` … (trigger + open menu items).
- `Popover`: `<Popover defaultOpen>` … (trigger + open content).
- `Tooltip`: `<TooltipProvider><Tooltip open><TooltipTrigger asChild><Button.../></TooltipTrigger><TooltipContent>…</TooltipContent></Tooltip></TooltipProvider>`.
Radix portals the open content; the single+viewport card captures it. If the
content is clipped by the viewport, note it in learnings (don't change config).

## Absolute-positioned composites

Some composites position `absolute` (read the source). Wrap them in a
`relative` dark container sized to reveal them, e.g.
`<div className="relative bg-background" style={{ width: 760, height: 80 }}>…</div>`.

## HARD RULES (violating these corrupts other agents' work)

- Edit ONLY: your assigned `.design-sync/previews/<Name>.tsx`, your
  `.design-sync/.cache/review/<Name>.grade.json`, and your learnings file
  `.design-sync/learnings/<BATCH_ID>.md`.
- NEVER run `package-build.mjs` or `package-validate.mjs` — they rewrite the
  shared bundle and race every other agent. ONLY `preview-rebuild.mjs` and
  `package-capture.mjs`, both `--components <yours>`.
- NEVER run `package-capture.mjs` without `--components`.
- Do NOT edit `.design-sync/config.json`, `NOTES.md`, or any component source, or
  any preview/grade outside your set.
- If a root cause is **config-level** (needs a provider, CSS/font/import
  resolution, a cardMode/viewport override that's wrong) OR the SAME root cause
  hits 2+ of your components — STOP on those, record it in your learnings file,
  and move on. It's the orchestrator's job, not a per-component hack.

## Report

When done, write `.design-sync/learnings/<BATCH_ID>.md` with: which components
graded `good`, any that you left `needs-work` (and why), any config changes the
orchestrator should make (overrides, viewports, providers), and any reusable
gotchas. Then return a short summary: per-component final verdict + cell count.
