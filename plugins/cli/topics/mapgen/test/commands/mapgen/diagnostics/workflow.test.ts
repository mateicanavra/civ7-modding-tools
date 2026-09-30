import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Command } from "@oclif/core";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import MapgenDiagnosticsDiff from "../../../../src/commands/mapgen/diagnostics/diff";
import MapgenDiagnosticsDump from "../../../../src/commands/mapgen/diagnostics/dump";
import MapgenDiagnosticsList from "../../../../src/commands/mapgen/diagnostics/list";
import MapgenDiagnosticsTrace from "../../../../src/commands/mapgen/diagnostics/trace";

describe.sequential("MapGen diagnostic command workflow", () => {
  const outputRoot = mkdtempSync(join(tmpdir(), "civ7-mapgen-diagnostics-"));
  const messages: string[] = [];
  let runDir = "";
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    logSpy = vi.spyOn(Command.prototype, "log").mockImplementation((message = "") => {
      messages.push(message);
    });
    await MapgenDiagnosticsDump.run([
      "--map-size",
      "MAPSIZE_TINY",
      "--map-seed",
      "1337",
      "--game-seed=7331",
      "--players",
      "0,1",
      "--label",
      "workflow",
      "--output-root",
      outputRoot,
    ]);
    const receipt = JSON.parse(messages.at(-1) ?? "null") as {
      outputDir: string;
      runId: string;
    };
    runDir = receipt.outputDir;
  }, 180_000);

  afterAll(() => {
    logSpy.mockRestore();
    rmSync(outputRoot, { force: true, recursive: true });
  });

  test("dump publishes a manifest and trace for the complete Standard recipe", () => {
    expect(existsSync(join(runDir, "manifest.json"))).toBe(true);
    expect(existsSync(join(runDir, "trace.jsonl"))).toBe(true);
  });

  test("list and trace read the dump through the diagnostic package", async () => {
    messages.length = 0;
    await MapgenDiagnosticsList.run([runDir, "--prefix", "foundation."]);
    const inventory = JSON.parse(messages.at(-1) ?? "null") as { layers: unknown[] };
    expect(inventory.layers.length).toBeGreaterThan(0);

    messages.length = 0;
    await MapgenDiagnosticsTrace.run([runDir, "--event-prefix", "morphology."]);
    const trace = JSON.parse(messages.at(-1) ?? "null") as { count: number };
    expect(trace.count).toBeGreaterThan(0);
  });

  test("diff proves an exact run is identical to itself", async () => {
    messages.length = 0;
    await MapgenDiagnosticsDiff.run([runDir, runDir, "--prefix", "foundation."]);
    const comparison = JSON.parse(messages.at(-1) ?? "null") as {
      diffs: Array<{ hammingDistance?: number; maxAbsDiff?: number }>;
      unmatched: { left: unknown[]; right: unknown[] };
    };
    expect(comparison.diffs.length).toBeGreaterThan(0);
    expect(comparison.unmatched).toEqual({ left: [], right: [] });
    expect(
      comparison.diffs.every(
        (diff) => (diff.hammingDistance ?? 0) === 0 && (diff.maxAbsDiff ?? 0) === 0
      )
    ).toBe(true);
  });
});
