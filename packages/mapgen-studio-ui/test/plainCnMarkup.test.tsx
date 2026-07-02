import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AlertTriangle, Compass, Layers, Loader2, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DisclosureHeader } from "../src/components/composites/DisclosureHeader.js";
import { EmptyState } from "../src/components/composites/EmptyState.js";
import { ViewControls } from "../src/components/composites/ViewControls.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

// Plain-cn unification no-op pins (tasks.md 3.3): ViewControls,
// DisclosureHeader, and EmptyState were the three consumers of the app's
// PLAIN `cn` (clsx-only, `src/ui/utils/cn.ts` — deleted in B3). The B3 move
// flipped them onto the package's EXTENDED `cn` (clsx + tailwind-merge —
// LEDGER adjudication 4 "one cn"). tailwind-merge resolves conflicting class
// pairs, so the flip could theoretically change rendered class lists; the
// ledger verified all three components' cn inputs are non-conflicting, making
// the flip a rendered-markup NO-OP. These pins PROVE it: the fixture is the
// byte-exact `renderToStaticMarkup` output of each component's story scenes
// captured BEFORE the move (app-side, plain cn — see the fixture header note
// in the B3 commit); the assertions render the same scenes from the moved
// package components (extended cn) and require byte equality.

const fixture: Record<string, string> = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "fixtures", "plain-cn-markup.json"),
    "utf8"
  )
);

const noop = () => {};

// --- story wrappers, byte-identical to the story files ---
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}
function Dock({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-popover/95 text-foreground border border-border divide-y divide-border-subtle"
      style={{ width: 300, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-background" style={{ width: 460, height: 220 }}>
      <div className="absolute inset-0 flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

const scenes: Record<string, ReactNode> = {
  "ViewControls/GridOn": (
    <Demo>
      <ViewControls
        themePreference="dark"
        onThemeCycle={noop}
        showGrid={true}
        onShowGridChange={noop}
      />
    </Demo>
  ),
  "ViewControls/GridOff": (
    <Demo>
      <ViewControls
        themePreference="system"
        onThemeCycle={noop}
        showGrid={false}
        onShowGridChange={noop}
      />
    </Demo>
  ),
  "DisclosureHeader/PanelHeaders": (
    <Dock>
      <DisclosureHeader
        className="px-3 py-2.5"
        expanded={true}
        controls="disclosure-stage"
        icon={<Compass className="w-4 h-4 shrink-0 text-muted-foreground" />}
        title={<span className="text-[13px] font-semibold text-foreground">Stage</span>}
        trailing={<span className="text-label text-muted-foreground/70">7</span>}
      />
      <DisclosureHeader
        className="px-3 py-2"
        expanded={false}
        controls="disclosure-step"
        icon={<Layers className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
        title={
          <span className="text-data font-semibold text-muted-foreground uppercase tracking-wider">
            Step
          </span>
        }
        summary={
          <span className="text-data font-mono text-foreground truncate">apply-rainfall</span>
        }
        trailing={<span className="text-label text-muted-foreground/70">12</span>}
      />
    </Dock>
  ),
  "DisclosureHeader/ChevronlessWithTag": (
    <Dock>
      <DisclosureHeader
        className="px-3 py-2.5"
        chevron={false}
        expanded={true}
        controls="disclosure-config"
        icon={<Settings className="w-4 h-4 shrink-0 text-muted-foreground" />}
        title={<span className="text-[13px] font-semibold text-foreground">Config</span>}
        trailing={
          <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
            Modified
          </span>
        }
      />
    </Dock>
  ),
  "EmptyState/Loading": (
    <Stage>
      <EmptyState
        className="max-w-[420px]"
        icon={<Loader2 className="h-5 w-5 animate-spin" />}
        title={
          <span className="text-data font-medium text-foreground">Loading recipe pipeline</span>
        }
        message={
          <span className="text-label text-muted-foreground">
            Reading authored artifact contracts for the selected recipe.
          </span>
        }
      />
    </Stage>
  ),
  "EmptyState/ErrorState": (
    <Stage>
      <EmptyState
        className="max-w-[420px]"
        icon={<AlertTriangle className="h-5 w-5" />}
        title={
          <span className="text-data font-medium text-foreground">Recipe pipeline unavailable</span>
        }
        message={
          <span className="text-label text-muted-foreground">
            Studio could not load the dependency graph for this recipe.
          </span>
        }
      />
    </Stage>
  ),
  "EmptyState/Awaiting": (
    <Stage>
      <EmptyState
        title={
          <span className="text-label uppercase tracking-[0.2em] text-muted-foreground/70">
            Awaiting matter
          </span>
        }
        message={
          <span className="text-data font-medium text-muted-foreground">
            Click Run to generate a map
          </span>
        }
      />
    </Stage>
  ),
};

describe("plain-cn → extended-cn unification is a rendered-markup no-op", () => {
  for (const [name, node] of Object.entries(scenes)) {
    it(`pins ${name} byte-identical to the pre-move plain-cn render`, () => {
      expect(fixture[name]).toBeTypeOf("string");
      expect(renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>)).toBe(fixture[name]);
    });
  }
});
