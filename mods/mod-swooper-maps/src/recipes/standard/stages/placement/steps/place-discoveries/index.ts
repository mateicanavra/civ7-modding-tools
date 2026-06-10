import { defineVizMeta, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import { placeDiscoveriesWithTypedOutcomes } from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import { validateDiscoveryPlacementOutcomesArtifact } from "./validate.js";
import PlaceDiscoveriesStepContract from "./contract.js";
import {
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  buildPlacementPointBuffers,
} from "../../viz.js";

const DISCOVERY_OUTCOME_CATEGORIES = [
  { value: 1, label: "Placed", color: [34, 197, 94, 235] as [number, number, number, number] },
  {
    value: 2,
    label: "Rejected: Out of Bounds",
    color: [249, 115, 22, 235] as [number, number, number, number],
  },
  {
    value: 3,
    label: "Rejected: Invalid Type",
    color: [217, 70, 239, 235] as [number, number, number, number],
  },
  {
    value: 4,
    label: "Rejected: Adapter",
    color: [239, 68, 68, 235] as [number, number, number, number],
  },
];

type DiscoveryOutcomeRow = Readonly<{
  status: "placed" | "rejected";
  plotIndex: number;
  reason?: "out-of-bounds" | "invalid-discovery-type" | "adapter-rejected";
}>;

function discoveryOutcomeCategoryValue(outcome: DiscoveryOutcomeRow): number {
  if (outcome.status === "placed") return 1;
  switch (outcome.reason) {
    case "out-of-bounds":
      return 2;
    case "invalid-discovery-type":
      return 3;
    default:
      return 4;
  }
}

/** Placed vs rejected-with-reason discovery points from the typed reconcile (E4.3). */
function emitDiscoveryOutcomeViz(
  context: ExtendedMapContext,
  outcomes: ReadonlyArray<DiscoveryOutcomeRow>
): void {
  if (!context.viz) return;
  const { width } = context.dimensions;
  const rows = outcomes.map((outcome) => ({
    plotIndex: outcome.plotIndex,
    value: discoveryOutcomeCategoryValue(outcome),
  }));
  const { positions, values } = buildPlacementPointBuffers(rows, width);
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.discoveries.outcome",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.discoveries.outcome", {
      label: "Discovery Outcomes",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Typed discovery reconcile outcomes per planned site: placed, or rejected with the recorded reason.",
      palette: "categorical",
      categories: DISCOVERY_OUTCOME_CATEGORIES,
    }),
  });
}

export default createStep(PlaceDiscoveriesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.discoveryPlacementOutcomes], {
    discoveryPlacementOutcomes: {
      validate: (value) => validateDiscoveryPlacementOutcomesArtifact(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const discoveries = deps.artifacts.discoveryPlan.read(context);
    const { width, height } = context.dimensions;
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.discoveries", emit, () =>
      placeDiscoveriesWithTypedOutcomes({ adapter: context.adapter, width, height, discoveries })
    );
    emitDiscoveryOutcomeViz(context, outcomes.outcomes);
    deps.artifacts.discoveryPlacementOutcomes.publish(context, outcomes);
  },
});
