import { createOp } from "@swooper/mapgen-core/authoring";

import {
  requireCrust,
  requireMantleForcing,
  requireMesh,
  requirePlateGraph,
  requirePlateMotion,
} from "../../lib/require.js";
import ComputeTectonicHistoryContract from "./contract.js";
import {
  ERA_COUNT_MAX,
  ERA_COUNT_MIN,
  buildBoundaryEventsFromSegments,
  buildEraFields,
  buildHotspotEvents,
  buildTectonicHistoryRollups,
  buildTectonicsCurrent,
  computeEraGain,
  computeEraSegments,
  computePlateIdByEra,
  computeTectonicProvenance,
  computeTracerIndexByEra,
  deriveEmissionParams,
} from "./lib/pipeline-core.js";

const computeTectonicHistory = createOp(ComputeTectonicHistoryContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-tectonic-history");
        const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-tectonic-history");
        const mantleForcing = requireMantleForcing(
          input.mantleForcing,
          mesh.cellCount | 0,
          "foundation/compute-tectonic-history"
        );
        const plateGraph = requirePlateGraph(
          input.plateGraph,
          mesh.cellCount | 0,
          "foundation/compute-tectonic-history"
        );
        const plateMotion = requirePlateMotion(
          input.plateMotion,
          mesh.cellCount | 0,
          plateGraph.plates.length | 0,
          "foundation/compute-tectonic-history"
        );

        const weights = config.eraWeights;
        const driftStepsByEra = config.driftStepsByEra;
        if (weights.length !== driftStepsByEra.length) {
          throw new Error("[Foundation] compute-tectonic-history expects eraWeights/driftStepsByEra to match length.");
        }

        const eraCount = Math.min(weights.length, driftStepsByEra.length);
        if (eraCount < ERA_COUNT_MIN || eraCount > ERA_COUNT_MAX) {
          throw new Error(
            `[Foundation] compute-tectonic-history expects eraCount within ${ERA_COUNT_MIN}..${ERA_COUNT_MAX}.`
          );
        }

        const emission = deriveEmissionParams({
          beltInfluenceDistance: config.beltInfluenceDistance,
          beltDecay: config.beltDecay,
        });

        const plateIdByEra = computePlateIdByEra({
          mesh,
          plates: plateGraph.plates,
          currentCellToPlate: plateGraph.cellToPlate,
          plateVelocityX: plateMotion.plateVelocityX,
          plateVelocityY: plateMotion.plateVelocityY,
          driftStepsByEra,
          eraCount,
        });

        const eras: Array<ReturnType<typeof buildEraFields>> = [];
        for (let era = 0; era < eraCount; era++) {
          const eraPlateId = plateIdByEra[era] ?? plateIdByEra[plateIdByEra.length - 1]!;
          const eraSegments = computeEraSegments({
            mesh,
            crust,
            mantleForcing,
            plateGraph,
            eraPlateId,
          });

          const events = [
            ...buildBoundaryEventsFromSegments({ mesh, crust, segments: eraSegments }),
            ...buildHotspotEvents({ mesh, mantleForcing, eraPlateId }),
          ];

          eras.push(
            buildEraFields({
              mesh,
              events,
              weight: weights[era] ?? 0,
              eraGain: computeEraGain(era, eraCount),
              // Plate membership already drifts per era; keep seed drift disabled to avoid double-displacement.
              driftSteps: 0,
              emission,
            })
          );
        }

        const tectonicHistory = buildTectonicHistoryRollups({
          eras,
          plateIdByEra,
          activityThreshold: config.activityThreshold,
        });

        const tectonics = buildTectonicsCurrent({
          newestEra: eras[eraCount - 1]!,
          upliftTotal: tectonicHistory.upliftTotal,
        });

        const tracerIndex = computeTracerIndexByEra({
          mesh,
          mantleForcing,
          eras,
          eraCount,
        });

        const tectonicProvenance = computeTectonicProvenance({
          mesh,
          plateGraph,
          eras,
          tracerIndex,
          eraCount,
        });

        return {
          tectonicHistory,
          tectonics,
          tectonicProvenance,
        } as const;
      },
    },
  },
});

export default computeTectonicHistory;
