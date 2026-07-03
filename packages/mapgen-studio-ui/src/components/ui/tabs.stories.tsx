import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/Tabs.tsx`. Tabs marks the active trigger
 * with a thin steel underline (border-primary), not a filled slab — the list
 * rides the muted surface, the active label lifts to foreground.
 */
const meta = {
  title: "primitives/Tabs",
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop — not a DS export.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{
        padding: 20,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

// Three-tab studio panel; the default-selected "Recipe" tab shows its blurb.
export const RecipePanel: Story = {
  render: () => (
    <Demo>
      <Tabs defaultValue="recipe" style={{ width: 340 }}>
        <TabsList>
          <TabsTrigger value="recipe">Recipe</TabsTrigger>
          <TabsTrigger value="config">Config</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>
        <TabsContent value="recipe">
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            <span className="text-foreground" style={{ fontWeight: 600 }}>
              mod-swooper-maps/standard
            </span>{" "}
            — the full foundation → morphology → ecology pipeline. Edit the active recipe steps,
            then re-run to regenerate the map.
          </p>
        </TabsContent>
        <TabsContent value="config">
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Per-domain overrides (plate count, water %, climate bands) layered onto the recipe
            defaults.
          </p>
        </TabsContent>
        <TabsContent value="presets">
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Saved recipe + override bundles. Load a preset to seed a new map.
          </p>
        </TabsContent>
      </Tabs>
    </Demo>
  ),
};

// Two-tab variant with a different default selection (Pipeline active).
export const MapPipeline: Story = {
  render: () => (
    <Demo>
      <Tabs defaultValue="pipeline" style={{ width: 340 }}>
        <TabsList>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            The rendered 96 × 60 grid — elevation, biomes, and placement overlays.
          </p>
        </TabsContent>
        <TabsContent value="pipeline">
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>
            Stage-by-stage view of the last run: foundation, morphology, hydrology, ecology,
            placement. Inspect intermediate layers per stage.
          </p>
        </TabsContent>
      </Tabs>
    </Demo>
  ),
};
