import { STANDARD_RECIPE_CONFIG } from "mod-swooper-maps/recipes/standard-artifacts";
import { describe, expect, it, vi } from "vitest";
import type { BrowserRunEvent, BrowserRunRequest } from "../../src/browser-runner/protocol";

type WorkerHarness = {
  events: BrowserRunEvent[];
  postMessage(event: BrowserRunEvent): void;
  onmessage: ((ev: { data: BrowserRunRequest }) => void) | null;
};

type WorkerHarnessOptions = Readonly<{
  failVizDataTypeKey?: string;
}>;

const TEST_RUN_TOKEN = "standard-layer-visibility";

const workerModuleHarness = vi.hoisted(() => {
  const events: BrowserRunEvent[] = [];
  let options: WorkerHarnessOptions | undefined;
  let didFailVizPost = false;
  const harness: WorkerHarness = {
    events,
    postMessage(event) {
      if (
        options?.failVizDataTypeKey &&
        event.type === "viz.layer.upsert" &&
        event.layer.dataTypeKey === options.failVizDataTypeKey &&
        !didFailVizPost
      ) {
        didFailVizPost = true;
        throw new Error("private worker sink detail");
      }
      events.push(event);
    },
    onmessage: null,
  };

  Object.defineProperty(globalThis, "self", {
    value: harness,
    configurable: true,
  });

  return {
    harness,
    configure(next: WorkerHarnessOptions | undefined) {
      events.length = 0;
      options = next;
      didFailVizPost = false;
    },
  };
});

import "../../src/browser-runner/pipeline.worker.ts?standard-layer-visibility";

function visibilityOf(
  layer: Extract<BrowserRunEvent, { type: "viz.layer.upsert" }>["layer"]
): string {
  return layer.meta?.visibility === "hidden" || layer.meta?.visibility === "debug"
    ? layer.meta.visibility
    : "default";
}

async function runStandardRecipeInWorker(
  options?: WorkerHarnessOptions
): Promise<BrowserRunEvent[]> {
  workerModuleHarness.configure(options);
  const { harness } = workerModuleHarness;

  if (typeof harness.onmessage !== "function")
    throw new Error("pipeline worker did not install onmessage");

  harness.onmessage({
    data: {
      type: "run.start",
      runToken: TEST_RUN_TOKEN,
      generation: 1,
      recipeId: "standard",
      seed: 1780185340,
      mapSizeId: "MAPSIZE_TINY",
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
      playerCount: 2,
      resourcesMode: "balanced",
      pipelineConfig: STANDARD_RECIPE_CONFIG,
    },
  });

  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    const terminal = harness.events.find(
      (event) =>
        event.type === "run.finished" || event.type === "run.error" || event.type === "run.canceled"
    );
    if (terminal) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return harness.events;
}

describe("standard browser runner layer visibility", () => {
  it("keeps core balance layers visible with debug layers off", async () => {
    const privateDiagnostics = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const events = await runStandardRecipeInWorker({
        failVizDataTypeKey: "foundation.mesh.sites",
      });
      const terminal = events.find(
        (event) =>
          event.type === "run.finished" ||
          event.type === "run.error" ||
          event.type === "run.canceled"
      );
      expect(terminal).toEqual(expect.objectContaining({ type: "run.finished" }));
      const started = events.find((event) => event.type === "run.started");
      if (!started || started.type !== "run.started") {
        throw new Error("Browser execution emitted no run.started evidence.");
      }
      expect(events[0]).toBe(started);
      expect(started.runId).not.toBe(started.planFingerprint);

      const layers = events.filter(
        (event): event is Extract<BrowserRunEvent, { type: "viz.layer.upsert" }> => {
          return event.type === "viz.layer.upsert";
        }
      );
      const defaultVisibleDataTypeKeys = new Set(
        layers
          .filter((event) => visibilityOf(event.layer) === "default")
          .map((event) => event.layer.dataTypeKey)
      );
      expect([...defaultVisibleDataTypeKeys]).toEqual(
        expect.arrayContaining([
          "foundation.crustInit.cellType",
          "foundation.crustInit.cellAge",
          "foundation.crustInit.cellBaseElevation",
          "foundation.plates.tileMovement",
          "ecology.scoreLayers.forest",
          "map.placement.engine.landMask",
        ])
      );

      const tileMotionLayers = layers.filter((event) => {
        return (
          event.layer.dataTypeKey === "foundation.plates.tileMovement" &&
          visibilityOf(event.layer) === "default"
        );
      });
      expect(tileMotionLayers.map((event) => event.layer.spaceId)).toEqual(
        expect.arrayContaining(["tile.hexOddQ"])
      );
      expect(
        tileMotionLayers.map((event) => `${event.layer.kind}:${event.layer.meta?.role ?? ""}`)
      ).toEqual(expect.arrayContaining(["gridFields:vector", "segments:arrows"]));

      const rawWorldMotionLayers = layers.filter(
        (event) => event.layer.dataTypeKey === "foundation.plateMotion.motion"
      );
      expect(rawWorldMotionLayers.length).toBeGreaterThan(0);
      expect(rawWorldMotionLayers.every((event) => visibilityOf(event.layer) === "debug")).toBe(
        true
      );

      const facetDiagnostics = privateDiagnostics.mock.calls
        .map(([message]) => String(message))
        .filter((message) => message.startsWith("[mapgen-studio:facet]"));
      expect(facetDiagnostics).toHaveLength(1);
      expect(facetDiagnostics[0]).toContain(`request=${TEST_RUN_TOKEN}@1`);
      expect(facetDiagnostics[0]).toContain("plan=");
      expect(facetDiagnostics[0]).toContain("viz.emit failed");
      expect(facetDiagnostics[0]).not.toContain("private worker sink detail");
    } finally {
      privateDiagnostics.mockRestore();
    }
  }, 240_000);
});
