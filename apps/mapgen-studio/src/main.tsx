// Design-system CSS: tokens + globals + self-hosted fonts all arrive through
// the collapsed index.css (package theme.css + fonts.css imports — B2).
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { createQueryClient } from "./lib/query";

// One QueryClient for the app lifetime. Created at the module root (not inside
// a component) so the cache survives re-renders. Server state reaches
// components through oRPC-native query utils (`src/lib/orpc.ts`) bound to this
// client.
const queryClient = createQueryClient();

// StrictMode is deliberately OFF — everywhere, and honestly so. Its checks
// (double-mount, double-effect) run only in development builds, so the
// previous prod-only <StrictMode> wrapper provided zero coverage while its
// comment claimed partial coverage. The real blocker is dev-side:
// deck.gl/luma device/canvas initialization crashes under StrictMode's
// double-mount. Tracked exception (docs/system/DEFERRALS.md): enable
// StrictMode unconditionally once DeckCanvas guards device init against
// remount.
const app = (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(app);
