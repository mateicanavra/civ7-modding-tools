import { describe, expect, it } from "bun:test";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";
import { deriveMantleForcing, derivePlateMotion } from "../fixtures/tectonic-operation-chain.js";
import { runTectonicHistoryChain } from "../fixtures/tectonics-history.js";

const { computeCrust, computeMesh, computePlateGraph, computePlatesTensors } =
  foundationOpsPublic.ops;

function truncateTectonicProvenance(tectonicProvenance: any, cellCount: number) {
  return {
    ...tectonicProvenance,
    cellCount,
    tracerIndex: tectonicProvenance.tracerIndex.map((tracer: Uint32Array) =>
      tracer.slice(0, cellCount)
    ),
    provenance: {
      originEra: tectonicProvenance.provenance.originEra.slice(0, cellCount),
      originPlateId: tectonicProvenance.provenance.originPlateId.slice(0, cellCount),
      lastBoundaryEra: tectonicProvenance.provenance.lastBoundaryEra.slice(0, cellCount),
      lastBoundaryType: tectonicProvenance.provenance.lastBoundaryType.slice(0, cellCount),
      lastBoundaryPolarity: tectonicProvenance.provenance.lastBoundaryPolarity.slice(0, cellCount),
      lastBoundaryIntensity: tectonicProvenance.provenance.lastBoundaryIntensity.slice(
        0,
        cellCount
      ),
      crustAge: tectonicProvenance.provenance.crustAge.slice(0, cellCount),
    },
  };
}

function appendPlateMotionPlate(
  plateMotion: ReturnType<typeof derivePlateMotion>
): ReturnType<typeof derivePlateMotion> {
  const plateCount = (plateMotion.plateCount | 0) + 1;
  const extendFloat = (values: Float32Array) => {
    const next = new Float32Array(plateCount);
    next.set(values);
    return next;
  };
  const extendQuality = (values: Uint8Array) => {
    const next = new Uint8Array(plateCount);
    next.set(values);
    return next;
  };

  return {
    ...plateMotion,
    plateCount,
    plateCenterX: extendFloat(plateMotion.plateCenterX),
    plateCenterY: extendFloat(plateMotion.plateCenterY),
    plateVelocityX: extendFloat(plateMotion.plateVelocityX),
    plateVelocityY: extendFloat(plateMotion.plateVelocityY),
    plateOmega: extendFloat(plateMotion.plateOmega),
    plateFitRms: extendFloat(plateMotion.plateFitRms),
    plateFitP90: extendFloat(plateMotion.plateFitP90),
    plateQuality: extendQuality(plateMotion.plateQuality),
  };
}

describe("foundation plate tensor projection admission", () => {
  it("rejects provenance and plate motion incompatible with projection inputs", () => {
    const syntheticDimensions = { width: 36, height: 24 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 10, cellsPerPlate: 3, relaxationSteps: 2 },
    });

    const mesh = computeMesh.run({ width, height, rngSeed: 60 }, meshConfig).mesh;
    const mantleForcing = deriveMantleForcing(mesh, 61);
    const crust = computeCrust.run(
      { mesh, mantleForcing, rngSeed: 61 },
      computeCrust.defaultConfig
    ).crust;
    const plateGraph = computePlateGraph.run(
      { mesh, crust, rngSeed: 62 },
      {
        ...computePlateGraph.defaultConfig,
        config: { ...computePlateGraph.defaultConfig.config, plateCount: 10 },
      }
    ).plateGraph;
    const plateMotion = derivePlateMotion(mesh, plateGraph, 63);
    const historyResult = runTectonicHistoryChain({
      mesh,
      crust,
      mantleForcing,
      plateGraph,
      plateMotion,
    });

    const baseInput = {
      width,
      height,
      mesh,
      crust,
      plateGraph,
      plateMotion,
      tectonics: historyResult.tectonics,
      tectonicHistory: historyResult.tectonicHistory,
    };

    expect(() =>
      computePlatesTensors.run(
        {
          ...baseInput,
          tectonicProvenance: truncateTectonicProvenance(
            historyResult.tectonicProvenance,
            mesh.cellCount - 1
          ),
        },
        computePlatesTensors.defaultConfig
      )
    ).toThrow(/tectonicProvenance\.cellCount/);

    expect(() =>
      computePlatesTensors.run(
        {
          ...baseInput,
          plateMotion: appendPlateMotionPlate(plateMotion),
          tectonicProvenance: historyResult.tectonicProvenance,
        },
        computePlatesTensors.defaultConfig
      )
    ).toThrow(/plateMotion\.plateCount/);
  });
});
