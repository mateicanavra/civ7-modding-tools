import type { BasinWetBody } from "../../src/domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";

/** Explicit no-source evidence for tests of the unchanged atmospheric budget. */
export function noLocalWaterSources(width: number, height: number) {
  const size = width * height;
  const bodies: BasinWetBody[] = [];
  return {
    externalWaterMask: new Uint8Array(size),
    elevation: new Int16Array(size),
    componentId: new Int32Array(size),
    discharge: Array<number>(size).fill(0),
    runoff: Array<number>(size).fill(0),
    bodies,
  };
}
