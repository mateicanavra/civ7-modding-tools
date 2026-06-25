import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

type PackageJson = {
  scripts?: Record<string, string>;
};

type ProjectJson = {
  targets?: Record<
    string,
    {
      command?: string;
      executor?: string;
      options?: Record<string, unknown>;
      dependsOn?: unknown[];
      continuous?: boolean;
    }
  >;
};

const appRoot = fileURLToPath(new URL("../../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function target(projectJson: ProjectJson, name: string) {
  const nxTarget = projectJson.targets?.[name];
  expect(nxTarget, `${name} target should exist`).toBeDefined();
  return nxTarget!;
}

describe("Nx dev runner topology", () => {
  test("root package does not alias the mapgen-studio dev target", () => {
    const rootPackage = readJson<PackageJson>(join(repoRoot, "package.json"));
    expect(rootPackage.scripts?.["dev:mapgen-studio"]).toBeUndefined();
  });

  test("mapgen-studio dev target runs frontend after continuous daemon serve", () => {
    const appProject = readJson<ProjectJson>(join(appRoot, "project.json"));
    const dev = target(appProject, "dev");
    const serveDaemon = target(appProject, "serve-daemon");

    expect(dev.command).toBe("vite");
    expect(dev.executor).toBeUndefined();
    expect(dev.options?.script).toBeUndefined();
    expect(dev.continuous).toBe(true);
    expect(dev.dependsOn).toContain("serve-daemon");
    expect(JSON.stringify(dev.dependsOn)).not.toContain("build:studio-recipes");

    expect(serveDaemon.command).toBe("bun src/server/daemon/daemon.ts");
    expect(serveDaemon.executor).toBeUndefined();
    expect(serveDaemon.options?.script).toBeUndefined();
    expect(serveDaemon.continuous).toBe(true);
    expect(JSON.stringify(serveDaemon.dependsOn)).toContain("build:studio-recipes");
  });

  test("app dev scripts no longer launch a supervisor or daemon watcher", () => {
    const appPackage = readJson<PackageJson>(join(appRoot, "package.json"));
    expect(appPackage.scripts?.dev).toBeUndefined();
    expect(appPackage.scripts?.["dev:frontend"]).toBeUndefined();
    expect(appPackage.scripts?.["dev:server"]).toBeUndefined();
    expect(JSON.stringify(appPackage.scripts)).not.toContain("devLive.ts");
    expect(JSON.stringify(appPackage.scripts)).not.toContain("bun --watch");
    expect(existsSync(join(appRoot, "src/server/daemon/devLive.ts"))).toBe(false);
  });

  test("dev server ports can be isolated by environment", () => {
    const daemonSource = readFileSync(join(appRoot, "src/server/daemon/daemon.ts"), "utf8");
    const viteSource = readFileSync(join(appRoot, "vite.config.ts"), "utf8");

    expect(daemonSource).toContain("STUDIO_DAEMON_PORT");
    expect(viteSource).toContain("STUDIO_DEV_PORT");
    expect(viteSource).toContain("STUDIO_DEV_RPC_TARGET");
  });
});
