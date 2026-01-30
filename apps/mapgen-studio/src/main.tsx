import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CanvasContext } from "@luma.gl/core";
import { App } from "./App";

const patchLumaCanvasContext = (() => {
  let patched = false;
  return () => {
    if (patched) return;
    patched = true;

    const proto = CanvasContext.prototype as CanvasContext & {
      getMaxDrawingBufferSize?: () => [number, number];
      canvas?: { width?: number; height?: number };
      device?: { limits?: { maxTextureDimension2D?: number } };
    };

    const original = proto.getMaxDrawingBufferSize;
    if (!original) return;

    proto.getMaxDrawingBufferSize = function getMaxDrawingBufferSizeGuarded() {
      const device = (this as typeof proto).device;
      const maxTextureDimension = device?.limits?.maxTextureDimension2D;
      if (typeof maxTextureDimension === "number" && Number.isFinite(maxTextureDimension)) {
        return original.call(this);
      }

      const canvas = (this as typeof proto).canvas;
      const width = typeof canvas?.width === "number" ? canvas.width : 1;
      const height = typeof canvas?.height === "number" ? canvas.height : 1;
      const fallback = Math.max(1, Math.max(width, height));
      return [fallback, fallback];
    };
  };
})();

patchLumaCanvasContext();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
