import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@swooper/mapgen-studio-ui";

/**
 * Adapted from `.design-sync/previews/Dialog.tsx`: a modal on the floating tier
 * (Radix portal → dimmed scrim + blurred panel). Rendered `defaultOpen` so the
 * real modal state shows; the global decorator provides the surrounding shell.
 */
const meta = {
  title: "primitives/Dialog",
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SavePreset: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            Capture the current recipe and config overrides as a reusable preset. A preset with the
            same name will be overwritten.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save preset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
