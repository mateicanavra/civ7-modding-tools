import * as React from "react";
import { Toaster, toast } from "mapgen-studio";

// Toaster is sonner bound to the studio tokens (popover tier, shadowed). It
// reads the theme off the `.dark` class on <html>, so we set that on mount,
// then fire a few realistic studio notifications. cardMode:single + viewport
// override frames the fixed-position stack.
export const Notifications = () => {
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
    toast.success("Seed copied to clipboard");
    toast("Generation complete", {
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
    >
      <Toaster position="top-center" />
    </div>
  );
};
