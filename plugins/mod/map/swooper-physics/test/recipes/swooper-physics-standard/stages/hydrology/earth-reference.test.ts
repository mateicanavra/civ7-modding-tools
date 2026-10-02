import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { riverDirectionToReceiver } from "../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-direction.js";
import { runEarthCoastBaseline } from "../../fixtures/earth/climate.js";
import { extractEarthScript } from "../../fixtures/earth/extract.js";
import {
  createEarthReferenceSurface,
  earthReference,
  northFirstIndex,
  sourceWaterComponents,
} from "../../fixtures/earth/reference.js";

const hydro = hydrology.hydrography.ops;

function drainageFixture(rainfallIndex = 100, demandIndex = 10) {
  const { sourceShelfMask: _sourceShelfMask, landMask: _initialLandMask, ...ground } = createEarthReferenceSurface();
  const ocean = new Set(sourceWaterComponents()[0]);
  const terrain = {
    ...ground,
    elevation: Array.from(ground.elevation),
    externalWaterMask: Uint8Array.from(ground.elevation, (_, cell) => ocean.has(cell) ? 1 : 0),
    externalWaterHead: 0,
  };
  const size = terrain.width * terrain.height;
  const rainfall = new Uint8Array(size).fill(rainfallIndex);
  const humidity = new Uint8Array(size).fill(128);
  const { runoff } = hydro.computeLocalRunoff.run(
    {
      width: terrain.width,
      height: terrain.height,
      externalWaterMask: terrain.externalWaterMask,
      rainfall,
      humidity,
    },
    hydro.computeLocalRunoff.defaultConfig
  );
  return {
    ...terrain,
    geometry: hydro.computeDrainageBasins.run(terrain, {
      strategy: "plateau-saddle-hierarchy",
      config: { allowExternalEdgeOutlets: false },
    }),
    localRunoff: runoff,
    rainfall,
    potentialDemand: new Float32Array(size).fill(demandIndex),
  };
}

describe("fixed Firaxis Earth source admission", () => {
  it("retains pinned provenance, independent water, and native-index relief without a DEM claim", () => {
    const surface = createEarthReferenceSurface();
    expect(earthReference.format).toBe("firaxis-earth-huge-reference-v1");
    expect(earthReference.provenance.resourcesCommit).toBe(
      "89cee44d5ae7192f126e8ae09484c04400df9146"
    );
    expect(earthReference.grid).toEqual({
      width: 106,
      height: 66,
      topLatitude: 90,
      bottomLatitude: -90,
      wrapX: true,
      wrapY: false,
      rowZero: "south",
      indexing: "y * width + x",
      adjacency: "odd-row-offset",
    });
    expect(earthReference.elevationUnits).toBe("unchanged-native-index-not-metres");
    expect(earthReference.databaseElevation).toBe("all-zero-not-relief");
    expect(earthReference.nativeElevationRows).toHaveLength(66);
    expect(earthReference.nativeElevationRows.every((row) => row.length === 106)).toBe(true);
    expect(
      earthReference.terrainRows.every((row) => row.length === 106 && /^[OCFHM]+$/.test(row))
    ).toBe(true);
    expect(surface.elevation.length).toBe(6996);
    expect(Array.from(surface.elevation)).toEqual(earthReference.nativeElevationRows.flat());
    expect(surface.landMask.reduce((sum, land) => sum + land, 0)).toBe(3158);
    expect(surface.sourceShelfMask.reduce((sum, coast) => sum + coast, 0)).toBe(1410);
    expect(earthReference.riverDeclarations).toHaveLength(396);
    // Pins the extracted payload independently of optional local access to the large submodule.
    expect(createHash("sha256").update(JSON.stringify(earthReference)).digest("hex")).toBe(
      "1048d5d628efcaca1c2943f246603caacaf2bc2087530538c8d67466149c5485"
    );
  });

  it("retains authored channels only as references, including the small native relief differences", () => {
    const surface = createEarthReferenceSurface();
    const counts = { dryMinor: 0, dryNavigable: 0, wetMinor: 0, wetNavigable: 0 };
    let smallDrops = 0;
    for (const [x, y, direction, kind] of earthReference.riverDeclarations) {
      if (typeof x !== "number" || typeof y !== "number")
        throw new Error("Expected numeric source coordinates.");
      const cell = y * surface.width + x;
      const receiver = getHexNeighborIndicesOddQ(x, y, surface.width, surface.height).find(
        (neighbor) =>
          `DIRECTION_${riverDirectionToReceiver(surface.width, surface.height, cell, neighbor)}` ===
          direction
      );
      expect(receiver).toBeDefined();
      const drop = surface.elevation[cell]! - surface.elevation[receiver!]!;
      if (drop > 0 && drop < 13) smallDrops++;
      const wet = surface.landMask[cell] === 0;
      if (kind === "RIVER_MINOR") counts[wet ? "wetMinor" : "dryMinor"]++;
      else counts[wet ? "wetNavigable" : "dryNavigable"]++;
    }
    expect(counts).toEqual({ dryMinor: 201, dryNavigable: 191, wetMinor: 1, wetNavigable: 3 });
    expect(smallDrops).toBeGreaterThan(0);
    expect(
      sourceWaterComponents()
        .map((cells) => cells.length)
        .slice(0, 3)
    ).toEqual([3767, 10, 6]);
    const inlandReference = sourceWaterComponents().slice(1).flat();
    expect(inlandReference).toHaveLength(71);
    expect(inlandReference.every((cell) => surface.sourceShelfMask[cell] === 1)).toBe(true);
  });

  it("reflects source south-first rows without losing odd-row adjacency or the wrapped seam", () => {
    const { width, height } = earthReference.grid;
    const mapped = Array.from({ length: width * height }, (_, cell) => northFirstIndex(cell));
    expect(new Set(mapped).size).toBe(width * height);
    expect(northFirstIndex(0)).toBe(65 * width);
    expect(northFirstIndex(65 * width)).toBe(1);
    expect(northFirstIndex(65 * width + 105)).toBe(0);
    for (let cell = 0; cell < mapped.length; cell++) {
      const target = mapped[cell]!;
      const sourceNeighbors = getHexNeighborIndicesOddQ(
        cell % width,
        Math.floor(cell / width),
        width,
        height
      )
        .map(northFirstIndex)
        .sort((a, b) => a - b);
      const mappedNeighbors = getHexNeighborIndicesOddQ(
        target % width,
        Math.floor(target / width),
        width,
        height
      ).sort((a, b) => a - b);
      expect(sourceNeighbors).toEqual(mappedNeighbors);
    }
  });

  it("refuses executable elevation expressions rather than evaluating the source script", () => {
    const script = (expression: string) =>
      `function paintEarthHugeElevation(){let elevationArray=[${expression}];} function paintEarthHugeRivers(){TerrainBuilder.setRiverInfo(1,2,DirectionTypes.DIRECTION_WEST,RiverTypes.RIVER_MINOR);}`;
    expect(extractEarthScript(script("0,1e3,200"))).toEqual({
      elevation: [0, 1000, 200],
      rivers: [[1, 2, "DIRECTION_WEST", "RIVER_MINOR"]],
    });
    for (const expression of ["100+1", "danger()", "...other", "undefined"]) {
      expect(() => extractEarthScript(script(expression))).toThrow();
    }
  });
});

describe("fixed Earth native-index drainage diagnostic", () => {
  it("routes controlled supply through real basins, certification and classes with no input repair", () => {
    const input = drainageFixture();
    const held = structuredClone(input);
    const first = hydro.computeBasinNetwork.run(input, hydro.computeBasinNetwork.defaultConfig);
    expect(first.status).toBe("supported");
    if (first.status !== "supported") throw new Error(JSON.stringify(first.witness));
    expect(hydro.computeBasinNetwork.run(input, hydro.computeBasinNetwork.defaultConfig)).toEqual(
      first
    );
    expect(input).toEqual(held);
    expect(input.geometry.nodes.length).toBeGreaterThan(0);
    expect(first.plan.pools.length).toBeGreaterThan(0);
    const network = first.plan;
    expect(Math.abs(network.conservation.residual)).toBeLessThanOrEqual(
      network.conservation.roundoffBound
    );
    let dryRunoff = 0;
    let wetPrecipitation = 0;
    let wetDemand = 0;
    for (let cell = 0; cell < input.externalWaterMask.length; cell++) {
      if (input.externalWaterMask[cell]) {
        expect(network.receiver[cell]).toBe(-1);
        expect(network.dryDischarge[cell]).toBe(0);
        continue;
      }
      const receiver = network.receiver[cell]!;
      if (receiver >= 0)
        expect(
          getHexNeighborIndicesOddQ(
            cell % input.width,
            Math.floor(cell / input.width),
            input.width,
            input.height
          )
        ).toContain(receiver);
      if (receiver >= 0)
        expect(network.waterSurface[receiver]!).toBeLessThanOrEqual(network.waterSurface[cell]!);
      if (network.wetMask[cell]) {
        expect(network.dryDischarge[cell]).toBe(0);
        wetPrecipitation += input.rainfall[cell]!;
        wetDemand += input.potentialDemand[cell]!;
      } else {
        dryRunoff += input.localRunoff[cell]!;
        expect(network.waterSurface[cell]).toBe(input.elevation[cell]);
      }
      expect(network.terminalId[cell]).toBeGreaterThan(0);
      expect(
        network.terminals.some((terminal) => terminal.terminalId === network.terminalId[cell])
      ).toBe(true);
    }
    expect(Math.abs(network.conservation.dryRunoff - dryRunoff)).toBeLessThanOrEqual(
      network.conservation.roundoffBound
    );
    expect(network.conservation.wetPrecipitation).toBe(wetPrecipitation);
    expect(network.conservation.wetDemand).toBe(wetDemand);
    expect(
      Math.abs(
        network.conservation.externalDischarge +
          network.conservation.unresolvedResidual -
          (dryRunoff + wetPrecipitation - wetDemand)
      )
    ).toBeLessThanOrEqual(network.conservation.roundoffBound);
    const waterComponents = sourceWaterComponents();
    const oceanReference = new Set(waterComponents[0]);
    const inlandReference = new Set(waterComponents.slice(1).flat());
    const inlandExits = network.marineExits.filter((exit) => inlandReference.has(exit.marineCell));
    expect(inlandExits).toEqual([]);
    expect(
      network.marineExits.every(
        (exit) => oceanReference.has(exit.marineCell)
      )
    ).toBe(true);
    const classInput = {
      width: input.width,
      height: input.height,
      landMask: network.exposedLandMask,
      discharge: network.dryDischarge,
      flowDir: network.receiver,
    };
    const physicalBefore = structuredClone(network);
    const normal = hydro.projectRiverNetwork.run(
      classInput,
      hydro.projectRiverNetwork.defaultConfig
    );
    const fewerMajor = hydro.projectRiverNetwork.run(classInput, {
      strategy: "discharge-percentiles",
      config: { ...hydro.projectRiverNetwork.defaultConfig.config, majorPercentile: 0.99 },
    });
    expect(normal.riverClass.some((value) => value === 1)).toBe(true);
    expect(normal.riverClass.some((value) => value === 2)).toBe(true);
    expect(fewerMajor.riverClass).not.toEqual(normal.riverClass);
    expect(input.elevation.every(value => Number.isInteger(value) && value >= -32768 && value <= 32767)).toBe(true);
    const metadata = hydro.classifyBasinRiverNetwork.run(
      {
        width: input.width,
        height: input.height,
        externalWaterMask: input.externalWaterMask,
        discharge: network.dryDischarge,
        flowDir: network.receiver,
        elevation: Int16Array.from(input.elevation),
        lakeMask: network.wetMask,
        waterSurface: network.waterSurface,
        bodyId: network.bodyId,
        componentId: network.componentId,
        terminalId: network.terminalId,
        terminalType: network.terminalType,
        bodies: network.bodies,
        components: network.components,
        transfers: network.transfers,
        ports: network.ports,
        terminals: network.terminals,
        riverClass: normal.riverClass,
      },
      hydro.classifyBasinRiverNetwork.defaultConfig
    );
    expect(metadata.upstreamArea).toHaveLength(input.externalWaterMask.length);
    expect(network).toEqual(physicalBefore);
    expect(input).toEqual(held);
  });

  it("resolves dry and balanced closed terminals without synthesizing an open network", () => {
    for (const [rain, demand, state] of [
      [0, 10, "dry"],
      [100, 100, "closed"],
    ] as const) {
      const input = drainageFixture(rain, demand);
      const before = structuredClone(input);
      const result = hydro.computeBasinNetwork.run(input, hydro.computeBasinNetwork.defaultConfig);
      expect(result.status).toBe("supported");
      if (result.status !== "supported") throw new Error(JSON.stringify(result.witness));
      expect(result.plan.pools.some((pool) => pool.state === state)).toBe(true);
      expect(
        result.plan.terminals.some(
          (terminal) => terminal.role === (state === "closed" ? "closed-wet" : "dry")
        )
      ).toBe(true);
      for (let cell = 0; cell < input.externalWaterMask.length; cell++)
        if (!input.externalWaterMask[cell]) expect(result.plan.terminalId[cell]).toBeGreaterThan(0);
      expect(hydro.computeBasinNetwork.run(input, hydro.computeBasinNetwork.defaultConfig)).toEqual(
        result
      );
      expect(input).toEqual(before);
    }
  });
});

describe("fixed Earth-coast flat-relief climate ablation", () => {
  it("runs actual climate operations with normalized Earthlike forcing and source latitude registration", () => {
    const earth = runEarthCoastBaseline();
    const repeated = runEarthCoastBaseline();
    const aquaplanet = runEarthCoastBaseline("aquaplanet");
    for (const run of [earth, repeated, aquaplanet]) {
      expect({ topography: run.topography, shelf: run.shelf, config: run.config }).toEqual(
        run.heldInputs
      );
      expect(run.observation.baselineClimateField).toBe(run.baseline);
      expect(run.observation.thermalField).toBe(run.thermal);
      expect(run.observation.pressureField).toBe(run.pressure);
      expect(run.observation.windField).toBe(run.wind);
      expect("surfaceTemperatureC" in run.baseline).toBe(false);
      expect(Object.keys(run.thermal)).toEqual(["surfaceTemperatureC"]);
    }
    expect(earth.setup.latitudeBounds).toEqual({ topLatitude: 90, bottomLatitude: -90 });
    expect(earth.config.seasonality.axialTiltDeg).toBe(23.44);
    expect(earth.config).toEqual(aquaplanet.config);
    expect(earth.setup).toEqual(aquaplanet.setup);
    expect(earth.topography.elevation.every((value) => value === 0)).toBe(true);
    expect(earth.topography.elevation).toEqual(aquaplanet.topography.elevation);
    expect(earth.shelf.coastalLand.some((value) => value === 1)).toBe(true);
    expect(earth.shelf.distanceToCoast.some((value) => value > 0 && value < 65535)).toBe(true);
    expect(earth.baseline).toEqual(repeated.baseline);
    expect(earth.thermal.surfaceTemperatureC).toEqual(repeated.thermal.surfaceTemperatureC);
    expect(earth.pressure).toEqual(repeated.pressure);
    expect(earth.wind).toEqual(repeated.wind);
    expect(earth.observation.currentField).toEqual(repeated.observation.currentField);
    expect(earth.observation).toEqual(repeated.observation);
    expect(earth.baseline.rainfall).not.toEqual(aquaplanet.baseline.rainfall);
    expect(earth.pressure).not.toEqual(aquaplanet.pressure);
    expect(earth.wind).not.toEqual(aquaplanet.wind);
    expect(earth.observation.seasonalRainfall).toHaveLength(earth.config.seasonality.modeCount);
    const seasonalTemperature = earth.observation.seasonalSurfaceTemperatureC;
    expect(seasonalTemperature).toHaveLength(earth.config.seasonality.modeCount);
    const integration = earth.observation.seasonalIntegration;
    expect(integration.model).toBe("periodic-cycle");
    expect(integration.phaseOrigin).toBe("northward-equinox");
    expect(integration.phases).toHaveLength(24);
    expect(
      integration.observationIndices.map((index) => integration.surfaceTemperatureC[index])
    ).toEqual(seasonalTemperature);
    const seasonalDemand = integration.surfaceTemperatureC.map(
      (surfaceTemperatureC, season) =>
        hydrology.climate.ops.computePotentialDemand.run(
          {
            width: earthReference.grid.width,
            height: earthReference.grid.height,
            surfaceTemperatureC,
            humidity: integration.humidity[season]!,
            parameters: earth.baseline.demandParameters,
          },
          earth.config.computePotentialDemand
        ).pet
    );
    expect(earth.observation.thermalField).toBe(earth.thermal);
    expect(earth.observation.oceanThermal).not.toBeNull();
    for (let cell = 0; cell < earth.thermal.surfaceTemperatureC.length; cell++) {
      const seasonMean = (fields: readonly ArrayLike<number>[]) =>
        fields.reduce((sum, field, phase) => sum + field[cell]! * integration.weights[phase]!, 0);
      expect(earth.baseline.rainfall[cell]).toBe(
        Math.max(0, Math.min(200, Math.round(seasonMean(integration.rainfall))))
      );
      expect(earth.baseline.humidity[cell]).toBe(
        Math.max(0, Math.min(255, Math.round(seasonMean(integration.humidity))))
      );
      expect(earth.baseline.potentialDemand[cell]).toBe(Math.fround(seasonMean(seasonalDemand)));
      expect(earth.pressure.pressure[cell]).toBe(Math.fround(seasonMean(integration.pressure)));
      expect(earth.wind.windU[cell]).toBe(
        new Int8Array([Math.max(-127, Math.min(127, Math.round(seasonMean(integration.windU))))])[0]
      );
      expect(earth.wind.windV[cell]).toBe(
        new Int8Array([Math.max(-127, Math.min(127, Math.round(seasonMean(integration.windV))))])[0]
      );
      if (!earth.topography.landMask[cell]) {
        expect(earth.thermal.surfaceTemperatureC[cell]).toBe(
          earth.observation.oceanThermal!.sstC[cell]
        );
      }
    }
    expect(earth.baseline.rainfall.every((value) => value >= 0 && value <= 200)).toBe(true);
    expect(earth.pressure.pressure.every(Number.isFinite)).toBe(true);
    expect(
      earth.baseline.potentialDemand.every(
        (value) =>
          Number.isFinite(value) &&
          value >= 0
      )
    ).toBe(true);
  }, 30_000);
});
