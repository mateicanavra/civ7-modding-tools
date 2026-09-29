import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import {
  hugeRoot17,
  standardRoots37And39,
} from "../compute-basin-network/fixtures/retained-fixtures.js";

const {
  computeBasinNetwork: network,
  computeDrainageBasins: geometry,
  classifyBasinRiverNetwork: classify,
  projectRiverNetwork: project,
} = hydrology.hydrography.ops;

function metadataInput(input: Parameters<typeof network.run>[0]) {
  const result = network.run(input, network.defaultConfig);
  if (result.status !== "supported") throw new Error(JSON.stringify(result));
  const plan = result.plan;
  const { riverClass } = project.run(
    {
      width: input.width,
      height: input.height,
      channelSemantics: "principal-adjacent",
      landMask: Uint8Array.from(input.landMask, (land, cell) =>
        land && !plan.wetMask[cell] ? 1 : 0
      ),
      discharge: plan.dryDischarge,
      flowDir: plan.receiver,
    },
    {
      strategy: "discharge-percentiles",
      config: {
        minorPercentile: 0,
        majorPercentile: 1,
        minMinorDischarge: 0,
        minMajorDischarge: 0,
      },
    }
  );
  return {
    width: input.width,
    height: input.height,
    landMask: Uint8Array.from(input.landMask),
    elevation: Int16Array.from(input.elevation),
    lakeMask: plan.wetMask,
    waterSurface: plan.waterSurface,
    bodyId: plan.bodyId,
    componentId: plan.componentId,
    terminalId: plan.terminalId,
    terminalType: plan.terminalType,
    bodies: plan.bodies,
    components: plan.components,
    transfers: plan.transfers,
    ports: plan.ports,
    terminals: plan.terminals,
    discharge: plan.dryDischarge,
    flowDir: plan.receiver,
    riverClass,
  };
}
function simple(runoff: number, demand: number, boundary = false) {
  const terrain = {
    width: 5,
    height: 1,
    elevation: Int16Array.of(-1, 5, 0, 1, 6),
    landMask: Uint8Array.of(0, 1, 1, 1, 1),
  };
  return {
    ...terrain,
    geometry: geometry.run(terrain, {
      strategy: "plateau-saddle-hierarchy",
      config: { allowExternalEdgeOutlets: boundary },
    }),
    localRunoff: Array.from(terrain.landMask, (land) => land * runoff),
    rainfall: new Uint8Array(5),
    potentialDemand: Float32Array.of(0, 0, demand, 0, 0),
  };
}
describe("component-aware basin river metadata", () => {
  it("seeds a locally classified dry junction once without adding source area or an internal tributary", () => {
    const terrain = {
      width: 6,
      height: 1,
      elevation: Int16Array.of(-1, 1, 2, 0, 3, -1),
      landMask: Uint8Array.of(0, 1, 1, 1, 1, 0),
    };
    const input = metadataInput({
      ...terrain,
      geometry: geometry.run(terrain, {
        strategy: "plateau-saddle-hierarchy",
        config: { allowExternalEdgeOutlets: false },
      }),
      localRunoff: [0, 0, 20.5, 0, 0, 0],
      rainfall: new Uint8Array(6),
      potentialDemand: Float32Array.of(0, 0, 0, 10, 0, 0),
    });
    expect(input.flowDir[2]).toBe(1);
    expect([input.riverClass[2], input.riverClass[1]]).toEqual([2, 2]);
    expect([input.discharge[2], input.discharge[1]]).toEqual([10.5, 10.5]);
    const before = structuredClone(input),
      output = classify.run(input, classify.defaultConfig);
    expect([output.streamOrderProxy[2], output.streamOrderProxy[1]]).toEqual([1, 1]);
    expect([output.upstreamArea[2], output.upstreamArea[1]]).toEqual([2, 3]);
    expect(output.streamOrderProxy[3]).toBe(1);
    expect(input).toEqual(before);
    const unclassified = structuredClone(input);
    unclassified.riverClass.fill(0);
    const unclassifiedOutput = classify.run(unclassified, classify.defaultConfig);
    expect(unclassifiedOutput.upstreamArea).toEqual(output.upstreamArea);
    expect(unclassifiedOutput.streamOrderProxy[2]).toBe(0);
  });
  it("counts each original source once across inward reservoir exchange and preserves terminal authority", () => {
    const source = standardRoots37And39(),
      input = metadataInput(source),
      before = structuredClone(input);
    const output = classify.run(input, classify.defaultConfig);
    const component = input.components[0]!;
    expect(
      input.transfers.find((edge) => edge.cellA === 228 && edge.cellB === 312)!.signedDischarge
    ).toBeLessThan(0);
    for (const cell of component.memberCells) expect(output.upstreamArea[cell]).toBe(17);
    expect(output.mouthType[312]).toBe(1);
    expect(output.mouthBodyId[312]).toBe(0);
    expect(output.mouthType[61]).toBe(2);
    expect(output.mouthBodyId[61]).toBe(input.bodyId[60]);
    expect(component.junctionCells.some((cell) => input.riverClass[cell]! > 0)).toBe(true);
    const withoutLocalClass = structuredClone(input);
    for (const cell of component.junctionCells) withoutLocalClass.riverClass[cell] = 0;
    expect(classify.run(withoutLocalClass, classify.defaultConfig).streamOrderProxy).toEqual(
      output.streamOrderProxy
    );
    expect("basinId" in output).toBe(false);
    expect(input).toEqual(before);
    const reordered = structuredClone(input);
    reordered.transfers.reverse();
    reordered.bodies.reverse();
    reordered.components[0]!.memberCells.reverse();
    expect(classify.run(reordered, classify.defaultConfig)).toEqual(output);
  });
  it("resolves accepted closed bodies, subtile and dry terminals without an unresolved dry mouth", () => {
    const closed = metadataInput(hugeRoot17());
    expect(classify.run(closed, classify.defaultConfig).mouthType[149]).toBe(2);
    for (const [runoff, demand, mouth] of [
      [0, 0, 7],
      [1, 100, 6],
    ] as const) {
      const input = metadataInput(simple(runoff, demand)),
        output = classify.run(input, classify.defaultConfig);
      expect(output.mouthType[2]).toBe(mouth);
      for (let cell = 0; cell < input.landMask.length; cell++)
        if (input.landMask[cell] && !input.lakeMask[cell])
          expect(output.mouthType[cell]).toBeGreaterThan(0);
    }
  });
  it("keeps boundary export typed and incoming adjacent channels classifiable", () => {
    const terrain = {
      width: 3,
      height: 3,
      elevation: Int16Array.of(3, 3, 3, 3, 2, 3, 3, 1, 3),
      landMask: new Uint8Array(9).fill(1),
    };
    const input = metadataInput({
      ...terrain,
      geometry: geometry.run(terrain, {
        strategy: "plateau-saddle-hierarchy",
        config: { allowExternalEdgeOutlets: true },
      }),
      localRunoff: new Array<number>(9).fill(1),
      rainfall: new Uint8Array(9),
      potentialDemand: new Float32Array(9),
    });
    const output = classify.run(input, classify.defaultConfig);
    expect(Array.from(output.mouthType)).toEqual(new Array(9).fill(5));
    expect(input.riverClass[7]).toBe(0);
    expect(input.riverClass[4]).toBeGreaterThan(0);
  });
  it("rejects shadow terminal identity, incomplete components, fabricated principal flow, and wet classes", () => {
    const input = metadataInput(standardRoots37And39());
    const terminal = structuredClone(input);
    terminal.terminalId[61] = 999;
    expect(() => classify.run(terminal, classify.defaultConfig)).toThrow("terminal");
    const missing = structuredClone(input);
    missing.components[0]!.memberCells.pop();
    expect(() => classify.run(missing, classify.defaultConfig)).toThrow();
    const flow = structuredClone(input);
    flow.discharge[312] += 1;
    expect(() => classify.run(flow, classify.defaultConfig)).toThrow("principal");
    const wet = structuredClone(input);
    wet.riverClass[228] = 2;
    expect(() => classify.run(wet, classify.defaultConfig)).toThrow("wet");
    const cycle = structuredClone(input);
    cycle.flowDir[61] = 62;
    expect(() => classify.run(cycle, classify.defaultConfig)).toThrow();
  });
});
