import { describe, expect, it } from "vitest";

import viteConfig from "../../vite.config";

async function loadServeConfig() {
  if (typeof viteConfig === "function") {
    return await viteConfig({
      command: "serve",
      mode: "development",
      isSsrBuild: false,
      isPreview: false,
    });
  }
  return viteConfig;
}

describe("Studio dev server watch ignores", () => {
  it("ignores Studio-written and deploy-written mod outputs so Save/Run does not full-reload the tab", async () => {
    const config = await loadServeConfig();
    const ignored = config.server?.watch?.ignored;

    expect(Array.isArray(ignored)).toBe(true);
    expect(ignored).toEqual(
      expect.arrayContaining([
        "**/mods/mod-swooper-maps/dist/**",
        "**/mods/mod-swooper-maps/mod/**",
        "**/mods/mod-swooper-maps/src/maps/generated/**",
        "**/mods/mod-swooper-maps/src/maps/configs/*.config.json",
      ])
    );
  });
});
