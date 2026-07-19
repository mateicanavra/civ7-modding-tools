import { describe, expect, it } from "bun:test";
import { createMockAdapter, getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { admitMapSetup, createMapContext, type TraceEvent } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../src/recipes/standard/runtime.js";
import { standardConfig } from "../../../support/standard-config.js";

type KindEvent = { kind: string };

function isKindEvent(value: unknown): value is KindEvent {
  return (
    Boolean(value) && typeof value === "object" && typeof (value as KindEvent).kind === "string"
  );
}

describe("Morphology tracing (observability hardening smoke)", () => {
  it("emits required morphology.* kind events when steps are verbose", () => {
    const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
    const { width, height } = tinyPreset.dimensions;
    const seed = 424242;
    const mapInfo = { ...tinyPreset.mapInfo };
    const topLatitude = mapInfo.MaxLatitude;
    const bottomLatitude = mapInfo.MinLatitude;
    if (typeof topLatitude !== "number" || typeof bottomLatitude !== "number") {
      throw new Error("Civ7 Tiny map-size metadata is missing latitude bounds.");
    }

    const full = (stageId: string, stepId: string) =>
      `mod-swooper-maps.standard.${stageId}.${stepId}`;
    const verboseSteps = [
      full("morphology-coasts", "landmass-plates"),
      full("morphology-routing", "routing"),
      full("morphology-erosion", "geomorphology"),
      full("morphology-coasts", "rugged-coasts"),
      full("morphology-features", "islands"),
      full("morphology-features", "mountains"),
      full("morphology-features", "volcanoes"),
    ];
    const traceSteps: Record<string, "verbose"> = Object.fromEntries(
      verboseSteps.map((id) => [id, "verbose"] as const)
    );

    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: { ...tinyPreset.dimensions },
      latitudeBounds: {
        topLatitude,
        bottomLatitude,
      },
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: tinyPreset.id,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });

    const events: TraceEvent[] = [];
    standardRecipe.run(context, standardConfig, {
      log: () => {},
      trace: {
        config: { steps: traceSteps },
        sink: { emit: (event) => events.push(event) },
      },
    });

    const kinds = new Set(
      events
        .filter((event) => event.kind === "step.event")
        .map((event) => event.data)
        .filter(isKindEvent)
        .map((event) => event.kind)
    );

    const requiredKinds = [
      "morphology.landmassPlates.summary",
      "morphology.routing.summary",
      "morphology.geomorphology.summary",
      "morphology.coastlines.summary",
      "morphology.islands.summary",
      "morphology.mountains.summary",
      "morphology.volcanoes.summary",
    ];

    for (const required of requiredKinds) {
      expect(kinds.has(required)).toBe(true);
    }
  });
});
