import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

type PackageJson = {
  scripts?: Record<string, string>;
  nx?: {
    targets?: Record<
      string,
      {
        executor?: string;
        options?: Record<string, unknown>;
        dependsOn?: unknown[];
        continuous?: boolean;
      }
    >;
  };
};

const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

function readPackage(path: string): PackageJson {
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}

function target(packageJson: PackageJson, name: string) {
  const nxTarget = packageJson.nx?.targets?.[name];
  expect(nxTarget, `${name} target should exist`).toBeDefined();
  return nxTarget!;
}

describe("Nx dev runner topology", () => {
  test("root dev command enters the mapgen-studio Nx target", () => {
    const rootPackage = readPackage(join(repoRoot, "package.json"));
    expect(rootPackage.scripts?.["dev:mapgen-studio"]).toBe("nx run mapgen-studio:dev");
  });

  test("mapgen-studio dev target runs frontend after continuous daemon serve", () => {
    const appPackage = readPackage(join(appRoot, "package.json"));
    const dev = target(appPackage, "dev");
    const serveDaemon = target(appPackage, "serve-daemon");

    expect(dev.executor).toBe("nx:run-script");
    expect(dev.options?.script).toBe("dev:frontend");
    expect(dev.continuous).toBe(true);
    expect(dev.dependsOn).toContain("serve-daemon");
    expect(JSON.stringify(dev.dependsOn)).not.toContain("build:studio-recipes");

    expect(serveDaemon.executor).toBe("nx:run-script");
    expect(serveDaemon.options?.script).toBe("dev:server");
    expect(serveDaemon.continuous).toBe(true);
    expect(JSON.stringify(serveDaemon.dependsOn)).toContain("build:studio-recipes");
  });

  test("app dev scripts no longer launch a supervisor or daemon watcher", () => {
    const appPackage = readPackage(join(appRoot, "package.json"));
    expect(appPackage.scripts?.dev).toBe("vite");
    expect(appPackage.scripts?.["dev:server"]).toBe("bun src/server/daemon/daemon.ts");
    expect(JSON.stringify(appPackage.scripts)).not.toContain("devLive.ts");
    expect(JSON.stringify(appPackage.scripts)).not.toContain("bun --watch");
    expect(existsSync(join(appRoot, "src/server/daemon/devLive.ts"))).toBe(false);
  });
});
