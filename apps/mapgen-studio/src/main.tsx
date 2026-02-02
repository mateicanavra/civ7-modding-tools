import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// deck.gl/luma currently has a known issue under React StrictMode in dev
// (double-mount can break device/canvas initialization and crash on resize).
// Keep StrictMode enabled for prod builds, but disable it during local dev for stability.
const app = import.meta.env.DEV ? (
  <App />
) : (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(app);
