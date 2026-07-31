import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl, type SegmentedControlProps } from "@swooper/mapgen-studio-ui";
import { Activity, Hexagon, Map as MapIcon, Workflow } from "lucide-react";

const meta = {
  title: "composites/SegmentedControl",
  component: SegmentedControl,
  args: {} as unknown as SegmentedControlProps,
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

/** Pins the labeled stage-view density used above the map canvas. */
export const Labeled: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Stage view"
      value="map"
      onValueChange={noop}
      items={[
        {
          value: "map",
          label: "Map",
          children: (
            <>
              <MapIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Map</span>
            </>
          ),
        },
        {
          value: "pipeline",
          label: "Pipeline",
          children: (
            <>
              <Workflow className="h-3.5 w-3.5 shrink-0" />
              <span>Pipeline</span>
            </>
          ),
        },
      ]}
    />
  ),
};

/** Pins the compact icon density used by layer render controls. */
export const Icons: Story = {
  render: () => (
    <SegmentedControl
      aria-label="Render mode"
      size="icon"
      value="hexagonal"
      onValueChange={noop}
      items={[
        {
          value: "hexagonal",
          label: "Hexagonal",
          tooltip: "Hexagonal",
          children: <Hexagon className="h-3.5 w-3.5" />,
        },
        {
          value: "fields",
          label: "Fields",
          tooltip: "Fields",
          children: <Activity className="h-3.5 w-3.5" />,
        },
      ]}
    />
  ),
};
