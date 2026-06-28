#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

type PackageJson = { scripts?: Record<string, string> };
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

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const appRoot = join(repoRoot, "apps/mapgen-studio");
const failures: string[] = [];
const { default: viteConfig } = await import(pathToFileURL(join(appRoot, "vite.config.ts")).href);

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function target(projectJson: ProjectJson, name: string) {
  const nxTarget = projectJson.targets?.[name];
  if (!nxTarget) failures.push(`${name} target should exist`);
  return nxTarget;
}

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

const rootPackage = readJson<PackageJson>(join(repoRoot, "package.json"));
if (rootPackage.scripts?.["dev:mapgen-studio"] !== undefined) {
  failures.push("root package must not alias mapgen-studio dev target");
}

const appProject = readJson<ProjectJson>(join(appRoot, "project.json"));
const dev = target(appProject, "dev");
const serveDaemon = target(appProject, "serve-daemon");
if (dev) {
  if (dev.command !== "vite") failures.push(`dev.command must be vite, got ${dev.command}`);
  if (dev.executor !== undefined) failures.push("dev.executor must be undefined");
  if (dev.options?.script !== undefined) failures.push("dev.options.script must be undefined");
  if (dev.continuous !== true) failures.push("dev.continuous must be true");
  if (!JSON.stringify(dev.dependsOn).includes("serve-daemon")) {
    failures.push("dev.dependsOn must include serve-daemon");
  }
  if (JSON.stringify(dev.dependsOn).includes("build:studio-recipes")) {
    failures.push("dev.dependsOn must not include build:studio-recipes directly");
  }
}
if (serveDaemon) {
  if (serveDaemon.command !== "bun src/server/daemon/daemon.ts") {
    failures.push(`serve-daemon.command drifted: ${serveDaemon.command}`);
  }
  if (serveDaemon.executor !== undefined) failures.push("serve-daemon.executor must be undefined");
  if (serveDaemon.options?.script !== undefined) failures.push("serve-daemon.options.script must be undefined");
  if (serveDaemon.continuous !== true) failures.push("serve-daemon.continuous must be true");
  if (!JSON.stringify(serveDaemon.dependsOn).includes("build:studio-recipes")) {
    failures.push("serve-daemon.dependsOn must include build:studio-recipes");
  }
}

const appPackage = readJson<PackageJson>(join(appRoot, "package.json"));
for (const script of ["dev", "dev:frontend", "dev:server"]) {
  if (appPackage.scripts?.[script] !== undefined) failures.push(`app package must not define ${script}`);
}
if (JSON.stringify(appPackage.scripts).includes("devLive.ts")) failures.push("app scripts mention devLive.ts");
if (JSON.stringify(appPackage.scripts).includes("bun --watch")) failures.push("app scripts mention bun --watch");

const daemonSource = readFileSync(join(appRoot, "src/server/daemon/daemon.ts"), "utf8");
const viteSource = readFileSync(join(appRoot, "vite.config.ts"), "utf8");
for (const token of ["STUDIO_DAEMON_PORT"]) {
  if (!daemonSource.includes(token)) failures.push(`daemon source missing ${token}`);
}
for (const token of ["STUDIO_DEV_PORT", "STUDIO_DEV_RPC_TARGET"]) {
  if (!viteSource.includes(token)) failures.push(`vite config missing ${token}`);
}

const config = await loadServeConfig();
const ignored = config.server?.watch?.ignored;
const requiredIgnores = [
  "**/mods/mod-swooper-maps/dist/**",
  "**/mods/mod-swooper-maps/mod/**",
  "**/mods/mod-swooper-maps/src/maps/generated/**",
  "**/mods/mod-swooper-maps/src/maps/configs/*.config.json",
];
if (!Array.isArray(ignored)) {
  failures.push("vite server.watch.ignored must be an array");
} else {
  for (const pattern of requiredIgnores) {
    if (!ignored.includes(pattern)) failures.push(`vite watch ignores missing ${pattern}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
