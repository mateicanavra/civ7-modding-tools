import { describe, expect, it } from "vitest";
import type { BrowserRunEvent, BrowserRunRequest } from "../../src/browser-runner/protocol";

type WorkerHarness = {
  events: BrowserRunEvent[];
  postMessage(event: BrowserRunEvent): void;
  onmessage: ((ev: { data: BrowserRunRequest }) => void) | null;
};

function visibilityOf(
  layer: Extract<BrowserRunEvent, { type: "viz.layer.upsert" }>["layer"]
): string {
  return layer.meta?.visibility === "hidden" || layer.meta?.visibility === "debug"
    ? layer.meta.visibility
    : "default";
}

async function runStandardRecipeInWorker(): Promise<BrowserRunEvent[]> {
  const harness: WorkerHarness = {
    events: [],
    postMessage(event) {
      this.events.push(event);
    },
    onmessage: null,
  };

  Object.defineProperty(globalThis, "self", {
    value: harness,
    configurable: true,
  });

  await import("../../src/browser-runner/pipeline.worker.ts?standard-layer-visibility");

  if (typeof harness.onmessage !== "function")
    throw new Error("pipeline worker did not install onmessage");

  harness.onmessage({
    data: {
      type: "run.start",
      runToken: `standard-layer-visibility-${Date.now()}`,
      generation: 1,
      recipeId: "mod-swooper-maps/standard",
      seed: 1780185340,
      mapSizeId: "MAPSIZE_TINY",
      dimensions: { width: 8, height: 6 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
      playerCount: 2,
      resourcesMode: "balanced",
      configOverrides: {},
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
    const events = await runStandardRecipeInWorker();
    const terminal = events.find(
      (event) =>
        event.type === "run.finished" || event.type === "run.error" || event.type === "run.canceled"
    );
    expect(terminal).toEqual(expect.objectContaining({ type: "run.finished" }));

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
    expect(rawWorldMotionLayers.every((event) => visibilityOf(event.layer) === "debug")).toBe(true);
  }, 240_000);
});
