import { describe, expect, it } from "vitest";
import type { BrowserRunEvent, BrowserRunRequest } from "../../src/browser-runner/protocol";

type WorkerHarness = {
  events: BrowserRunEvent[];
  postMessage(event: BrowserRunEvent): void;
  onmessage: ((ev: { data: BrowserRunRequest }) => void) | null;
};

function visibilityOf(layer: Extract<BrowserRunEvent, { type: "viz.layer.upsert" }>["layer"]): string {
  return layer.meta?.visibility === "hidden" || layer.meta?.visibility === "debug" ? layer.meta.visibility : "default";
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

  await import(`../../src/browser-runner/pipeline.worker.ts?standard-layer-visibility=${Date.now()}`);

  if (typeof harness.onmessage !== "function") throw new Error("pipeline worker did not install onmessage");

  harness.onmessage({
    data: {
      type: "run.start",
      runToken: `standard-layer-visibility-${Date.now()}`,
      generation: 1,
      recipeId: "mod-swooper-maps/standard",
      seed: 1780185340,
      mapSizeId: "MAPSIZE_TINY",
      dimensions: { width: 60, height: 38 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
      playerCount: 4,
      resourcesMode: "balanced",
      configOverrides: {},
    },
  });

  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const terminal = harness.events.find(
      (event) => event.type === "run.finished" || event.type === "run.error" || event.type === "run.canceled"
    );
    if (terminal) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  return harness.events;
}

describe("standard browser runner layer visibility", () => {
  it("keeps core data-emitting steps visible with debug layers off", async () => {
    const events = await runStandardRecipeInWorker();
    const terminal = events.find(
      (event) => event.type === "run.finished" || event.type === "run.error" || event.type === "run.canceled"
    );
    expect(terminal).toEqual(expect.objectContaining({ type: "run.finished" }));

    const layers = events.filter((event): event is Extract<BrowserRunEvent, { type: "viz.layer.upsert" }> => {
      return event.type === "viz.layer.upsert";
    });
    const finishedStepIds = events
      .filter((event): event is Extract<BrowserRunEvent, { type: "run.progress" }> => {
        return event.type === "run.progress" && event.kind === "step.finish";
      })
      .map((event) => event.stepId);

    const invisibleDataSteps = finishedStepIds.filter((stepId) => {
      const stepLayers = layers.filter((event) => event.layer.stepId === stepId);
      if (stepLayers.length === 0) return false;
      return stepLayers.every((event) => visibilityOf(event.layer) !== "default");
    });

    expect(invisibleDataSteps).toEqual([]);

    const defaultVisibleDataTypeKeys = new Set(
      layers.filter((event) => visibilityOf(event.layer) === "default").map((event) => event.layer.dataTypeKey)
    );
    expect([...defaultVisibleDataTypeKeys]).toEqual(
      expect.arrayContaining([
        "foundation.crustInit.cellType",
        "foundation.crustInit.cellAge",
        "foundation.crustInit.cellBaseElevation",
        "foundation.plateMotion.motion",
        "ecology.scoreLayers.FEATURE_FOREST",
        "map.placement.engine.landMask",
      ])
    );
  });
});
