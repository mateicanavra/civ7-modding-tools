// Self-hosted fonts (replaces the render-blocking Google Fonts @import).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createQueryClient } from "./lib/query";

// One QueryClient for the app lifetime. Created at the module root (not inside a
// component) so the cache survives re-renders and the dev-only StrictMode skip
// below cannot duplicate it. Server state reaches components through oRPC-native
// query utils (`src/lib/orpc.ts`) bound to this client.
const queryClient = createQueryClient();

const app = (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

// deck.gl/luma currently has a known issue under React StrictMode in dev
// (double-mount can break device/canvas initialization and crash on resize).
// Keep StrictMode enabled for prod builds, but disable it during local dev for stability.
const tree = import.meta.env.DEV ? app : <StrictMode>{app}</StrictMode>;

createRoot(document.getElementById("root")!).render(tree);
