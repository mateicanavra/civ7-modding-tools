import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { classifyBasinRiverNetwork } = hydrology.hydrography.ops;
const config = {
  strategy: "body-aware",
  config: { highOrderConfluenceUpstreamAreaMin: 64 },
} as const;

function fixture() {
  const landMask = Uint8Array.from({ length: 15 }, (_, cell) => (cell % 5 === 0 ? 0 : 1));
  const wetCells = [7, 8, 13];
  const elevation = Int16Array.from(landMask, (land) => (land ? 5 : -1));
  elevation[6] = 2;
  for (const cell of wetCells) elevation[cell] = 0;
  const waterSurface = Int16Array.from(elevation);
  const lakeMask = new Uint8Array(15),
    bodyId = new Int32Array(15);
  for (const cell of wetCells) {
    waterSurface[cell] = 2;
    lakeMask[cell] = 1;
    bodyId[cell] = 1;
  }
  return {
    width: 5,
    height: 3,
    landMask,
    elevation,
    waterSurface,
    lakeMask,
    bodyId,
    flowDir: Int32Array.of(-1, 0, 7, 8, 3, -1, 5, 6, 7, 8, -1, 10, 13, 7, 13),
    discharge: [0, 1, 1, 2, 1, 0, 37, 0, 0, 1, 0, 1, 1, 0, 1],
    riverClass: Uint8Array.from(landMask, (land, cell) =>
      land && !lakeMask[cell] ? (cell === 6 ? 2 : 1) : 0
    ),
    bodies: [
      {
        nodeId: 1,
        wetCells,
        spillElevation: 2,
        outletCell: 7,
        receiverCell: 6,
        connectorCells: [6],
        flux: {
          incomingOverflow: 6,
          dryRunoff: 0,
          wetPrecipitation: 30,
          wetDemand: 0,
          balance: 36,
        },
        outflow: 36,
      },
    ],
  };
}

describe("hydrology/classify-basin-river-network", () => {
  it("counts a multi-inlet body's wet area and tributaries once, independent of its wet connectivity tree", () => {
    const input = fixture(),
      before = structuredClone(input);
    const result = classifyBasinRiverNetwork.run(input, config);
    const alternate = fixture();
    alternate.flowDir[8] = 13;
    expect(classifyBasinRiverNetwork.run(alternate, config)).toEqual(result);
    expect(result.upstreamArea[6]).toBe(10);
    expect(result.streamOrderProxy[6]).toBe(2);
    for (const cell of input.bodies[0]!.wetCells) {
      expect(result.upstreamArea[cell]).toBe(9);
      expect(result.streamOrderProxy[cell]).toBe(2);
      expect(result.slopeClass[cell]).toBe(0);
      expect(result.flowPermanenceProxy[cell]).toBe(0);
    }
    expect(input).toEqual(before);
  });

  it("retains lake endpoint identity for incoming dry reaches and marine identity for outgoing reaches", () => {
    const result = classifyBasinRiverNetwork.run(fixture(), config);
    for (const cell of [2, 3, 4, 9, 12, 14]) {
      expect(result.mouthType[cell]).toBe(2);
      expect(result.mouthBodyId[cell]).toBe(1);
      expect(result.basinId[cell]).toBe(7);
    }
    expect(result.mouthType[6]).toBe(1);
    expect(result.mouthBodyId[6]).toBe(0);
    expect(result.basinId[6]).toBe(7);
    expect(result.slopeClass[2]).toBe(2);
    expect(result.slopeClass[6]).toBe(2);
    expect(result.basinId[0]).toBe(-1);
  });

  it("rejects a quotient cycle, invalid wet membership, and invented wet discharge", () => {
    const cycle = fixture();
    cycle.flowDir[6] = 7;
    expect(() => classifyBasinRiverNetwork.run(cycle, config)).toThrow("acyclic");
    const membership = fixture();
    membership.bodyId[8] = 0;
    expect(() => classifyBasinRiverNetwork.run(membership, config)).toThrow("partition");
    const wetDischarge = fixture();
    wetDischarge.discharge[7] = 36;
    expect(() => classifyBasinRiverNetwork.run(wetDischarge, config)).toThrow("sentinels");
  });
});
