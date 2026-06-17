import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { runEffectParityProbe } from "../../src/lib/effect-parity.js";
import { harnessRoot } from "../../src/lib/paths.js";

describe("Habitat Effect platform parity", () => {
  test("runs the parity probe under the source runner path", async () => {
    const result = await runEffectParityProbe();

    expect(result.commandExecution).toEqual({
      exitCode: 0,
      stdout: "habitat-effect-parity\n",
      stderr: "parity-stderr\n",
    });
    expect(result.scopedCleanup).toEqual({
      markerExistedInsideScope: true,
      cleanupObserved: true,
      pathExistsAfterScope: false,
    });
    expect(result.taggedError).toEqual({
      tag: "HabitatEffectParityTaggedError",
      caught: true,
    });
    expect(result.fakeServiceProvision).toEqual({
      exitCode: 0,
      stdout: "fake-service-ok\n",
    });
  });

  test("keeps Effect runtime execution at the Habitat runtime bridge", () => {
    const scannedRoots = [path.join(harnessRoot, "src"), path.join(harnessRoot, "test")];
    const allowedRuntimeEdges = [path.join(harnessRoot, "src", "lib", "effect-runtime.ts")];
    const offenders = scannedRoots
      .flatMap(sourceFiles)
      .filter((file) => !allowedRuntimeEdges.includes(file))
      .flatMap((file) => {
        const text = readFileSync(file, "utf8");
        return [...text.matchAll(/\b(?:Effect|NodeRuntime)\.run[A-Za-z]*/g)].map(
          (match) => `${file}:${lineNumber(text, match.index ?? 0)} ${match[0]}`
        );
      });

    expect(offenders).toEqual([]);
  });
});

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const file = path.join(root, entry);
    const stat = statSync(file);
    if (stat.isDirectory()) return sourceFiles(file);
    return file.endsWith(".ts") || file.endsWith(".js") ? [file] : [];
  });
}

function lineNumber(text: string, offset: number): number {
  return text.slice(0, offset).split("\n").length;
}
