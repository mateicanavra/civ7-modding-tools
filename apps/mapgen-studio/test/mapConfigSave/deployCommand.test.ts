import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployCommand } from "../../src/server/mapConfigs/deploy";

describe("Swooper Maps Studio deploy command", () => {
  it("uses the Studio deploy lane for save/deploy without request markers", () => {
    const command = buildSwooperMapsStudioDeployCommand({ env: { PATH: "/bin" } });

    expect(command.args).toEqual(["run", "--cwd", "mods/mod-swooper-maps", "deploy:studio"]);
    expect(command.command).toBe("bun run --cwd mods/mod-swooper-maps deploy:studio");
    expect(command.env).not.toHaveProperty("SWOOPER_STUDIO_RUN_ID");
  });

  it("adds the Run in Game request marker only for proof-correlated launches", () => {
    const command = buildSwooperMapsStudioDeployCommand({
      requestId: "studio-run-in-game-test",
      env: { PATH: "/bin" },
    });

    expect(command.args).toEqual(["run", "--cwd", "mods/mod-swooper-maps", "deploy:studio"]);
    expect(command.command).toBe("SWOOPER_STUDIO_RUN_ID=<request> bun run --cwd mods/mod-swooper-maps deploy:studio");
    expect(command.env.SWOOPER_STUDIO_RUN_ID).toBe("studio-run-in-game-test");
  });
});
