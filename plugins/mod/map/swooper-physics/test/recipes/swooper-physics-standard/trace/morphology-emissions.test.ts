import { describe, expect, it } from "bun:test";
import type { TraceEvent } from "@swooper/mapgen-core";
import { runStandardRecipeTestMap } from "../fixtures/standard-recipe.js";

type KindEvent = { kind: string };

function isKindEvent(value: unknown): value is KindEvent {
  return (
    Boolean(value) && typeof value === "object" && typeof (value as KindEvent).kind === "string"
  );
}

describe("Morphology tracing (observability hardening smoke)", () => {
  it("emits required morphology.* kind events when steps are verbose", () => {
    const full = (stageId: string, stepId: string) =>
      `mod-swooper-maps.standard.${stageId}.${stepId}`;
    const verboseSteps = [
      full("morphology-coasts", "landmass-plates"),
      full("morphology-erosion", "geomorphology"),
      full("hydrology-hydrography", "network"),
      full("morphology-coasts", "coastline-evidence"),
      full("morphology-islands", "islands"),
      full("morphology-features", "mountains"),
      full("morphology-features", "volcanoes"),
    ];
    const traceSteps: Record<string, "verbose"> = Object.fromEntries(
      verboseSteps.map((id) => [id, "verbose"] as const)
    );

    const events: TraceEvent[] = [];
    runStandardRecipeTestMap({
      execution: {
        trace: {
          config: { steps: traceSteps },
          sink: {
            emit: (event) => {
              events.push(event);
              return undefined;
            },
          },
        },
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
      "morphology.geomorphology.summary",
      "morphology.coastlines.summary",
      "morphology.islands.summary",
      "morphology.mountains.summary",
      "morphology.volcanoes.summary",
    ];

    for (const required of requiredKinds) {
      expect(kinds.has(required)).toBe(true);
    }
    expect(kinds.has("morphology.routing.summary")).toBe(false);
    expect(events.some(event => event.kind === "step.start" && event.stageId === "morphology-routing")).toBe(false);
    expect(events.some(event => event.kind === "step.start" && event.stepId === full("hydrology-hydrography", "network"))).toBe(true);
  });
});
