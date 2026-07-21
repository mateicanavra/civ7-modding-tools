import type { Meta, StoryObj } from "@storybook/react-vite";
// Both from the package barrel: the story exercises the SAME public contract
// synced designs use — `toast` must ride the barrel (LEDGER adjudication 8) so
// this story would catch it falling off, which importing "sonner" cannot.
import { Toaster, toast } from "@swooper/mapgen-studio-ui";
import { useEffect } from "react";

/**
 * Toaster is sonner bound to the studio tokens (popover tier, shadowed). The
 * story is SELF-CONTAINED: it mounts its own `<Toaster/>` sink and fires the
 * notifications — no reliance on Storybook globals, because the design-sync
 * card renders exactly this story without the preview decorators (one render
 * path for the workbench and the synced card).
 */
const meta = {
  title: "primitives/Toaster",
  component: Toaster,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// Top-level render component (hooks must not live in a bare render arrow):
// mounts the sink and fires the toasts on mount.
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
    <div className="bg-background" style={{ position: "relative", width: "100%", minHeight: 300 }}>
      <Toaster />
    </div>
  );
}

/** Fires success, informational, and failure notices through the decorator-owned singleton toaster. */
export const Notifications: Story = {
  render: () => <ToastDemo />,
};
