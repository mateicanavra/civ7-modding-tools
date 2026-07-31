import * as React from "react";
import { Toaster, toast } from "@swooper/mapgen-studio-ui";

// Toaster is sonner bound to the studio tokens (popover tier, shadowed). The
// generated story wrapper can't render it: the story relies on Storybook's
// GLOBAL decorator to mount <Toaster/>, which the composed card lacks — so
// this owned preview mounts the Toaster itself and fires three realistic
// studio notifications. Both imports ride the package barrel so toast and
// Toaster share the bundle's one inlined sonner instance (adjudication 8,
// amended). cardMode:single + viewport override frame the fixed-position
// stack.
export const Notifications = () => {
  React.useEffect(() => {
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
    >
      <Toaster />
    </div>
  );
};
