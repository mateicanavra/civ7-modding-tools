import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const allowedConstructors = new Set([
  "packages/studio-server/src/services/Civ7TunerSession.ts",
  "packages/civ7-direct-control/src/session/session.ts",
]);

const scannedRoots = ["apps", "packages"] as const;
const ignoredDirectoryNames = new Set([
  ".git",
  "coverage",
  "dist",
  "mod",
  "node_modules",
  "test",
  "tests",
  "types",
]);

describe("Civ7 game-door invariant", () => {
  test("constructs Civ7DirectControlSession only at sanctioned owner paths", () => {
    const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
    const violations: string[] = [];

    for (const root of scannedRoots) {
      for (const file of collectTsFiles(join(repoRoot, root))) {
        const rel = normalizePath(relative(repoRoot, file));
        if (allowedConstructors.has(rel)) continue;

        const text = readFileSync(file, "utf8");
        if (/\bnew\s+Civ7DirectControlSession\s*\(/.test(text)) {
          violations.push(rel);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test("keeps StudioEventHub runtime-owned with Promise bridges only at the stream edge", () => {
    const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
    const runtimeSource = readFileSync(
      join(repoRoot, "packages/studio-server/src/runtime.ts"),
      "utf8"
    );
    const contextSource = readFileSync(
      join(repoRoot, "packages/studio-server/src/context.ts"),
      "utf8"
    );
    const handlerSource = readFileSync(
      join(repoRoot, "packages/studio-server/src/handler.ts"),
      "utf8"
    );
    const daemonSource = readFileSync(
      join(repoRoot, "apps/mapgen-studio/src/server/daemon/daemon.ts"),
      "utf8"
    );
    const eventHubSource = readFileSync(
      join(repoRoot, "packages/studio-server/src/services/StudioEventHub.ts"),
      "utf8"
    );

    expect(runtimeSource).toContain("StudioEventHubLive");
    expect(runtimeSource).toContain("const eventHubLayer = StudioEventHubLive");
    expect(runtimeSource).not.toContain("Layer.succeed(StudioEventHub, context.eventHub)");
    expect(contextSource).not.toMatch(/\beventHub\b/);
    expect(handlerSource).not.toContain("context.eventHub");
    expect(daemonSource).not.toContain("createStudioEventHub");
    expect(daemonSource).not.toContain("eventHub.shutdown()");

    const runPromiseHits = [...eventHubSource.matchAll(/Effect\.runPromise/g)];
    expect(runPromiseHits).toHaveLength(2);
    expect(eventHubSource).toContain("studioEventSubscriptionIterator");
    expect(eventHubSource).toContain("await Effect.runPromise(subscription.take)");
    expect(eventHubSource).toContain("await Effect.runPromise(subscription.close)");
    expect(eventHubSource).toContain("const published = yield* PubSub.publish(pubsub, event)");
    expect(eventHubSource).toContain('if (published && event.type === "live-game")');
    expect(eventHubSource).toContain("const replayGate = yield* Effect.makeSemaphore(1)");
    expect(eventHubSource).toContain("const hubClosed = yield* Ref.make(false)");
    expect(eventHubSource).toContain("replayGate.withPermits(1)(");
    expect(eventHubSource).toContain(".withPermits(1)(closeAllSubscriptions)");
    expect(eventHubSource).toContain("yield* Ref.set(hubClosed, true)");
    expect(eventHubSource).toContain("if (yield* Ref.get(hubClosed)) return;");
    expect(eventHubSource).toContain("return closedSubscription()");
    expect(eventHubSource).toContain("Effect.uninterruptible(");
  });
});

function findRepoRoot(start: string): string {
  let current = start;
  while (current !== dirname(current)) {
    if (fileExists(join(current, "pnpm-workspace.yaml")) || fileExists(join(current, "bun.lock"))) {
      return current;
    }
    current = dirname(current);
  }
  throw new Error(`Could not resolve repo root from ${start}`);
}

function collectTsFiles(root: string): string[] {
  const out: string[] = [];
  collect(root, out);
  return out;
}

function collect(path: string, out: string[]): void {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    const name = path.split("/").at(-1);
    if (name && ignoredDirectoryNames.has(name)) return;
    for (const entry of readdirSync(path)) collect(join(path, entry), out);
    return;
  }
  if (!stats.isFile()) return;
  if (path.endsWith(".ts") || path.endsWith(".tsx")) out.push(path);
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function normalizePath(path: string): string {
  return path.split("\\").join("/");
}
