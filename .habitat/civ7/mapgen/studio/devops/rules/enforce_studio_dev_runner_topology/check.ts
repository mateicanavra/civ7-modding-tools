#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, normalize } from "node:path";

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
type StudioViteCommand = "serve" | "build";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const appRoot = join(repoRoot, "apps/mapgen-studio");
const viteConfigPath = join(appRoot, "vite.config.ts");
const failures: string[] = [];
const viteRuntime: unknown = createRequire(join(appRoot, "package.json"))("vite");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function target(projectJson: ProjectJson, name: string) {
  const nxTarget = projectJson.targets?.[name];
  if (!nxTarget) failures.push(`${name} target should exist`);
  return nxTarget;
}

function field(value: unknown, name: PropertyKey): unknown {
  if (typeof value !== "object" || value === null) return undefined;
  return Reflect.get(value, name);
}

function aliasMatches(alias: unknown, importId: string): boolean {
  const find = field(alias, "find");
  if (typeof find === "string") {
    return importId === find || importId.startsWith(`${find}/`);
  }

  return find instanceof RegExp && new RegExp(find.source, find.flags).test(importId);
}

async function resolveStudioViteConfig(command: StudioViteCommand): Promise<unknown> {
  const mode = command === "serve" ? "development" : "production";
  const previousEnvironment = { ...process.env };
  const resolveConfig = field(viteRuntime, "resolveConfig");
  if (typeof resolveConfig !== "function") {
    throw new Error("app-local Vite runtime must expose a callable resolveConfig");
  }

  Object.assign(process.env, {
    NODE_ENV: mode,
    STUDIO_DEV_PORT: "43173",
    STUDIO_DEV_RPC_TARGET: "http://127.0.0.1:43174",
  });
  try {
    const resolvedConfig: unknown = await Reflect.apply(resolveConfig, viteRuntime, [
      { root: appRoot, configFile: viteConfigPath },
      command,
      mode,
      mode,
    ]);
    return resolvedConfig;
  } finally {
    for (const name of Object.keys(process.env)) delete process.env[name];
    Object.assign(process.env, previousEnvironment);
  }
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
  if (dev.options?.cwd !== "apps/mapgen-studio")
    failures.push("dev.options.cwd must be apps/mapgen-studio");
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
  if (serveDaemon.command !== "bun --conditions bun-source src/server/daemon/daemon.ts") {
    failures.push(`serve-daemon.command drifted: ${serveDaemon.command}`);
  }
  if (serveDaemon.executor !== undefined) failures.push("serve-daemon.executor must be undefined");
  if (serveDaemon.options?.cwd !== "apps/mapgen-studio")
    failures.push("serve-daemon.options.cwd must be apps/mapgen-studio");
  if (serveDaemon.options?.script !== undefined)
    failures.push("serve-daemon.options.script must be undefined");
  if (serveDaemon.continuous !== true) failures.push("serve-daemon.continuous must be true");
  if (!JSON.stringify(serveDaemon.dependsOn).includes("build:studio-recipes")) {
    failures.push("serve-daemon.dependsOn must include build:studio-recipes");
  }
}

const appPackage = readJson<PackageJson>(join(appRoot, "package.json"));
for (const script of ["dev", "dev:frontend", "dev:server"]) {
  if (appPackage.scripts?.[script] !== undefined)
    failures.push(`app package must not define ${script}`);
}
if (JSON.stringify(appPackage.scripts).includes("devLive.ts"))
  failures.push("app scripts mention devLive.ts");
if (JSON.stringify(appPackage.scripts).includes("bun --watch"))
  failures.push("app scripts mention bun --watch");

const daemonSource = readFileSync(join(appRoot, "src/server/daemon/daemon.ts"), "utf8");
if (existsSync(join(appRoot, "src/server/daemon/devLive.ts"))) {
  failures.push("retired src/server/daemon/devLive.ts must not exist");
}
for (const token of ["STUDIO_DAEMON_PORT"]) {
  if (!daemonSource.includes(token)) failures.push(`daemon source missing ${token}`);
}
for (const token of ["--conditions bun-source", "src/server/daemon/daemon.ts"]) {
  if (!daemonSource.includes(token)) failures.push(`daemon source comment missing ${token}`);
}
if (daemonSource.includes("--watch")) {
  failures.push("daemon source comment must not preserve the retired Bun watch command");
}

const serveConfig = await resolveStudioViteConfig("serve");
const buildConfig = await resolveStudioViteConfig("build");

if (field(serveConfig, "isProduction") !== false) {
  failures.push("vite serve config must not have production semantics");
}
if (field(buildConfig, "isProduction") !== true) {
  failures.push("vite build config must have production semantics");
}

const serveServer = field(serveConfig, "server");
const serveHost = field(serveServer, "host");
if (serveHost !== "127.0.0.1") {
  failures.push(`vite serve host must be 127.0.0.1, got ${String(serveHost)}`);
}
const servePort = field(serveServer, "port");
if (servePort !== 43_173) {
  failures.push(`vite serve port must honor STUDIO_DEV_PORT, got ${String(servePort)}`);
}
const rpcProxy = field(field(serveServer, "proxy"), "/rpc");
const rpcTarget = typeof rpcProxy === "string" ? rpcProxy : field(rpcProxy, "target");
if (rpcTarget !== "http://127.0.0.1:43174") {
  failures.push(`vite /rpc proxy must honor STUDIO_DEV_RPC_TARGET, got ${String(rpcTarget)}`);
}

const contractImportId = "@civ7/studio-contract";
const contractAliasPattern = /^@civ7\/studio-contract$/;
const contractSourceEntry = normalize(join(repoRoot, "packages/studio-contract/src/index.ts"));
const serveAliases = field(field(serveConfig, "resolve"), "alias");
const serveContractAliases = Array.isArray(serveAliases)
  ? serveAliases.filter((alias) => aliasMatches(alias, contractImportId))
  : [];
if (serveContractAliases.length !== 1) {
  failures.push(
    `vite serve must define exactly one alias for ${contractImportId}, got ${serveContractAliases.length}`
  );
} else {
  const [serveContractAlias] = serveContractAliases;
  const find = field(serveContractAlias, "find");
  if (
    !(find instanceof RegExp) ||
    find.source !== contractAliasPattern.source ||
    /[gimy]/.test(find.flags)
  ) {
    failures.push(
      `vite serve alias for ${contractImportId} must use the exact anchored RegExp source ${contractAliasPattern.source} without g, i, m, or y flags`
    );
  }
  const replacement = field(serveContractAlias, "replacement");
  if (typeof replacement !== "string" || normalize(replacement) !== contractSourceEntry) {
    failures.push(
      `vite serve alias for ${contractImportId} must resolve to ${contractSourceEntry}, got ${String(replacement)}`
    );
  }
}

const buildAliases = field(field(buildConfig, "resolve"), "alias");
const buildContractAliases = Array.isArray(buildAliases)
  ? buildAliases.filter((alias) => aliasMatches(alias, contractImportId))
  : [];
if (buildContractAliases.length > 0) {
  failures.push(`vite build must not define an alias matching ${contractImportId}`);
}

const ignored = field(field(serveServer, "watch"), "ignored");
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
