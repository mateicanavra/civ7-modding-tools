import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { Toaster, toast } from "@/components/ui";

/**
 * Adapted from `.design-sync/previews/Toaster.tsx`. Toaster is sonner bound to the
 * studio tokens (popover tier, shadowed). The global decorator already mounts a
 * `<Toaster/>` and owns the `.dark` class, so this story does NOT mount a second
 * Toaster — a top-level render component fires realistic studio notifications in a
 * `useEffect` and the decorator's Toaster displays them.
 */
const meta = {
  title: "primitives/Toaster",
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// Top-level render component (hooks must not live in a bare render arrow): fires
// the toasts on mount; the decorator's Toaster renders the stack.
function ToastDemo() {
  useEffect(() => {
    toast.success("Seed copied to clipboard");
    toast.info("Generation complete", {
      description: "Standard · 6 players · seed 1474829",
    });
    toast.error("Run failed", {
      description: "Pipeline stage “climate” threw — see console",
    });
  }, []);
  return (
    <div
      className="bg-background"
      style={{ position: "relative", width: "100%", minHeight: 300 }}
    />
  );
}

export const Notifications: Story = {
  render: () => <ToastDemo />,
};
