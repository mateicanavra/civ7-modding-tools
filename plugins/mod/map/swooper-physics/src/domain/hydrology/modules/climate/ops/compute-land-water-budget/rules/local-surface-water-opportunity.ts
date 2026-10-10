import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

type Params = Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  externalWaterMask: ArrayLike<number>;
  elevation: ArrayLike<number>;
  componentId: ArrayLike<number>;
  discharge: readonly number[];
  runoff: readonly number[];
  bodies: readonly Readonly<{
    bodyId: number;
    wetCells: readonly number[];
    level: number;
    flux: Readonly<{ incomingOverflow: number; wetPrecipitation: number }>;
  }>[];
}>;

/** Annual rainfall-index opportunity per represented tile area, not a conserved withdrawal or root-access model. */
export function computeLocalSurfaceWaterOpportunity(input: Params): Float64Array {
  const { width, height } = input;
  const size = width * height;
  for (const key of ["discharge", "runoff"] as const) {
    if (input[key].length !== size) throw new RangeError(`Expected ${size} ${key} samples.`);
    if (input[key].some((value) => !Number.isFinite(value) || value < 0)) {
      throw new RangeError(`Expected finite nonnegative ${key} samples.`);
    }
  }
  const opportunity = new Float64Array(size);
  const dry = (cell: number) => input.landMask[cell] === 1 && input.externalWaterMask[cell] !== 1;
  const neighbors = (cell: number) => getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height);
  const offer = (contacts: ReadonlySet<number>, value: number) => {
    for (const cell of contacts) opportunity[cell] = Math.max(opportunity[cell]!, value);
  };

  for (let donor = 0; donor < size; donor++) {
    if (!dry(donor) || input.componentId[donor] !== 0) continue;
    const supply = Math.max(0, input.discharge[donor]! - input.runoff[donor]!);
    if (supply === 0) continue;
    const contacts = new Set([donor]);
    for (const cell of neighbors(donor)) {
      if (dry(cell) && input.elevation[cell]! <= input.elevation[donor]!) contacts.add(cell);
    }
    offer(contacts, supply / contacts.size);
  }

  const seenBodies = new Map<number, Readonly<{ level: number; supply: number; wetCells: ReadonlySet<number> }>>();
  for (const body of input.bodies) {
    const wetCells = new Set(body.wetCells);
    const supply = body.flux.incomingOverflow + body.flux.wetPrecipitation;
    if (wetCells.size === 0 || !Number.isFinite(body.level) || !Number.isFinite(supply) || supply < 0) {
      throw new RangeError(`Invalid finite-body opportunity source ${body.bodyId}.`);
    }
    for (const cell of wetCells) {
      if (cell < 0 || cell >= size || input.landMask[cell] === 1 || input.externalWaterMask[cell] === 1) {
        throw new RangeError(`Finite-body ${body.bodyId} footprint must be resolved nonmarine water in the grid.`);
      }
    }
    const previous = seenBodies.get(body.bodyId);
    if (previous) {
      if (previous.level !== body.level || previous.supply !== supply || previous.wetCells.size !== wetCells.size ||
        [...wetCells].some((cell) => !previous.wetCells.has(cell))) {
        throw new RangeError(`Conflicting finite-body opportunity identity ${body.bodyId}.`);
      }
      continue;
    }
    seenBodies.set(body.bodyId, { level: body.level, supply, wetCells });
    const contacts = new Set<number>();
    for (const donor of wetCells) {
      for (const cell of neighbors(donor)) {
        if (dry(cell) && input.elevation[cell]! <= body.level) contacts.add(cell);
      }
    }
    offer(contacts, supply / (wetCells.size + contacts.size));
  }
  return opportunity;
}
