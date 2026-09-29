import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  BasinPoolSchema,
  BasinWetBodySchema,
  BasinHydraulicComponentSchema,
  BasinPortSchema,
  BasinInternalTransferSchema,
  BasinTerminalSchema,
  MarineDischargeExitSchema,
  BoundaryDischargeExitSchema,
  WaterConservationSchema,
} from "../model/atoms/basin-network.schema.js";

const common = {
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  lakeMask: TypedArraySchemas.u8({
    cardinality: "map-grid",
    description:
      "Complete strict positive-depth footprint; sole lake-mask authority before projection.",
  }),
  plannedLakeTileCount: Type.Integer({
    minimum: 0,
    description: "Footprint diagnostic, never a selection cap.",
  }),
};

/** Complete stationary water intent and signed transport, not native readback or clipped projection. */
export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Type.Union([
    Type.Object(
      {
        model: Type.Literal("legacy-sink-budget"),
        ...common,
        sinkLakeCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        model: Type.Literal("certified-sill-spill"),
        ...common,
        bodyId: TypedArraySchemas.i32({
          cardinality: "map-grid",
          description:
            "Minimum strict wet member + 1; zero outside wet bodies, never a geometry node identity.",
        }),
        componentId: TypedArraySchemas.i32({
          cardinality: "map-grid",
          description: "Minimum hydraulic member + 1; zero on ordinary dry reaches and marine.",
        }),
        waterSurface: Type.Array(Type.Number(), {
          description:
            "Finite map-grid binary64 head on wet cells, unchanged ground elsewhere; not native lake elevation.",
        }),
        pools: Type.Array(BasinPoolSchema),
        bodies: Type.Array(BasinWetBodySchema),
        components: Type.Array(BasinHydraulicComponentSchema),
        transfers: Type.Array(BasinInternalTransferSchema),
        ports: Type.Array(BasinPortSchema),
        terminals: Type.Array(BasinTerminalSchema),
        marineExits: Type.Array(MarineDischargeExitSchema),
        boundaryExits: Type.Array(BoundaryDischargeExitSchema),
        conservation: WaterConservationSchema,
      },
      { additionalProperties: false }
    ),
  ]),
  refine: (value, { issues }) => {
    const size = value.width * value.height;
    const check = (valid: unknown, message: string) => {
      if (!valid) issues.add(message);
    };
    check(value.lakeMask.length === size, "Expected map-grid lakeMask.");
    check(
      value.lakeMask.every((cell) => cell === 0 || cell === 1),
      "Expected binary lakeMask."
    );
    const plannedTileCount = value.lakeMask.reduce((sum, cell) => sum + (cell === 1 ? 1 : 0), 0);
    check(
      value.plannedLakeTileCount === plannedTileCount,
      `plannedLakeTileCount ${value.plannedLakeTileCount} does not match the ${plannedTileCount} planned tiles in lakeMask.`
    );
    if (value.model !== "certified-sill-spill") return;
    const finite = (item: unknown): boolean =>
      typeof item === "number"
        ? Number.isFinite(item)
        : item !== null && typeof item === "object"
          ? Object.values(item).every(finite)
          : true;
    check(finite(value), "Expected finite physical levels and ledger values.");
    check(value.waterSurface.length === size, "Expected map-grid Number waterSurface.");
    const close = (a: number, b: number) =>
      Math.abs(a - b) <= 64 * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
    const inGrid = (cell: number) => cell >= 0 && cell < size;
    const adjacent = (a: number, b: number) =>
      inGrid(a) &&
      inGrid(b) &&
      getHexNeighborIndicesOddQ(
        a % value.width,
        Math.floor(a / value.width),
        value.width,
        value.height
      ).includes(b);
    const bodies = new Map(value.bodies.map((body) => [body.bodyId, body]));
    const components = new Map(
      value.components.map((component) => [component.componentId, component])
    );
    const pools = new Map(value.pools.map((pool) => [pool.poolId, pool]));
    const terminals = new Map(value.terminals.map((terminal) => [terminal.terminalId, terminal]));
    check(
      bodies.size === value.bodies.length &&
        components.size === value.components.length &&
        pools.size === value.pools.length &&
        terminals.size === value.terminals.length,
      "Duplicate physical identity."
    );
    const wet = new Int32Array(size),
      members = new Int32Array(size);
    const catchments = new Set<number>(),
      leaves = new Set<number>();
    for (const pool of value.pools) {
      check(
        pool.leafIds.length > 0 && pool.poolId === Math.min(...pool.leafIds),
        "Pool identity must be minimum provenance leaf."
      );
      for (const leaf of pool.leafIds) {
        check(!leaves.has(leaf), "Pool leaf provenance overlaps.");
        leaves.add(leaf);
      }
      for (const cell of pool.catchmentCells) {
        check(
          inGrid(cell) && !catchments.has(cell),
          "Pool catchments must be disjoint map-grid sources."
        );
        catchments.add(cell);
      }
      const component = components.get(pool.componentId);
      check(
        component?.poolId === pool.poolId &&
          component.state === pool.state &&
          component.level === pool.level,
        "Pool and component state disagree."
      );
      check(
        pool.wetCells.every((cell) => pool.catchmentCells.includes(cell)) &&
          new Set(pool.wetCells).size === pool.wetCells.length,
        "Pool wet footprint must be unique owned sources."
      );
      const closure = pool.closure;
      if (closure?.resolution === "shoreline-quantization") {
        check(
          (pool.state === "closed" || pool.state === "subtile") &&
            closure.level === pool.level &&
            closure.before.balance > 0 &&
            closure.after.balance < 0 &&
            close(closure.jumpMagnitude, closure.before.balance - closure.after.balance) &&
            close(closure.unresolvedResidual, closure.before.balance) &&
            close(pool.unresolvedResidual, closure.unresolvedResidual),
          "Invalid quantized closure bracket or unresolved residual."
        );
      } else {
        check(
          pool.unresolvedResidual === 0,
          "Only quantized closure may retain unresolved supply."
        );
        if (closure?.resolution === "exact-balance") {
          const interval = closure.levels;
          check(
            (pool.level > interval.lower ||
              (interval.lowerInclusive && pool.level === interval.lower)) &&
              (interval.upper === null ||
                pool.level < interval.upper ||
                (interval.upperInclusive && pool.level === interval.upper)),
            "Physical head is outside its exact-zero interval."
          );
        }
      }
    }
    for (const body of value.bodies) {
      check(
        body.wetCells.length > 0 && body.bodyId === Math.min(...body.wetCells) + 1,
        "Body identity must be minimum strict wet member plus one."
      );
      check(
        components.get(body.componentId)?.bodyIds.includes(body.bodyId) &&
          pools.get(body.poolId)?.componentId === body.componentId &&
          components.get(body.componentId)?.level === body.level,
        "Body ownership or level disagrees with pool/component."
      );
      check(body.flux.dryRunoff === 0, "Wet body cannot own dry runoff.");
      for (const cell of body.wetCells) {
        check(
          inGrid(cell) &&
            wet[cell] === 0 &&
            value.lakeMask[cell] === 1 &&
            value.bodyId[cell] === body.bodyId &&
            value.waterSurface[cell] === body.level,
          "Body footprints must partition strict lakeMask at their physical head."
        );
        wet[cell] = body.bodyId;
      }
    }
    for (const component of value.components) {
      check(
        component.memberCells.length > 0 &&
          component.componentId === Math.min(...component.memberCells) + 1 &&
          component.memberCells.includes(component.anchorCell),
        "Invalid component identity or anchor."
      );
      check(terminals.has(component.terminalId), "Component has no resolved terminal.");
      check(
        new Set(component.bodyIds).size === component.bodyIds.length &&
          component.bodyIds.every((id) => bodies.get(id)?.componentId === component.componentId),
        "Invalid component wet-body ownership."
      );
      const junctions = new Set(component.junctionCells);
      check(junctions.size === component.junctionCells.length, "Duplicate junction membership.");
      for (const cell of component.memberCells) {
        check(
          inGrid(cell) &&
            members[cell] === 0 &&
            value.componentId[cell] === component.componentId &&
            (wet[cell] > 0
              ? bodies.get(wet[cell]!)?.componentId === component.componentId &&
                !junctions.has(cell)
              : junctions.has(cell)),
          "Component must partition wet members and dry junctions."
        );
        members[cell] = component.componentId;
      }
      check(
        component.junctionCells.every((cell) => component.memberCells.includes(cell)),
        "Junction lies outside component."
      );
      const pool = pools.get(component.poolId);
      check(
        pool?.componentId === component.componentId &&
          pool.wetCells.length === component.memberCells.filter((cell) => wet[cell] > 0).length &&
          pool.wetCells.every((cell) => members[cell] === component.componentId && wet[cell] > 0),
        "Pool wet membership differs from component."
      );
      const ports = value.ports.filter((port) => port.componentId === component.componentId);
      check(
        ports.length === (component.state === "open" ? 1 : 0) &&
          close(
            ports.reduce((sum, port) => sum + port.discharge, 0),
            component.outflow
          ),
        "Component external port contradicts state/outflow."
      );
      check(
        component.state === "open"
          ? component.outflow > 0 && component.unresolvedResidual === 0
          : component.outflow === 0,
        "Only open components export supply."
      );
      check(
        component.state === "subtile" || component.state === "dry"
          ? component.bodyIds.length === 0
          : component.bodyIds.length > 0,
        "Component state contradicts strict wet footprint."
      );
    }
    for (let cell = 0; cell < size; cell++)
      check(
        wet[cell] === value.bodyId[cell] &&
          members[cell] === value.componentId[cell] &&
          wet[cell] > 0 === (value.lakeMask[cell] === 1),
        "Map-grid body/component membership mismatch."
      );
    const transferEdges = new Set<string>();
    for (const transfer of value.transfers) {
      const key = `${transfer.cellA}:${transfer.cellB}`;
      check(
        transfer.cellA < transfer.cellB &&
          adjacent(transfer.cellA, transfer.cellB) &&
          !transferEdges.has(key) &&
          members[transfer.cellA] === transfer.componentId &&
          members[transfer.cellB] === transfer.componentId &&
          wet[transfer.cellA] === transfer.bodyA &&
          wet[transfer.cellB] === transfer.bodyB,
        "Invalid canonical internal transfer endpoints or membership."
      );
      transferEdges.add(key);
    }
    for (const port of value.ports) {
      check(
        members[port.fromCell] === port.componentId && port.discharge > 0,
        "External port requires actual positive component export."
      );
      if (port.kind === "adjacent")
        check(
          adjacent(port.fromCell, port.toCell) &&
            members[port.toCell] !== port.componentId &&
            port.destinationComponentId ===
              (port.destination === "component" ? members[port.toCell] : 0),
          "Invalid adjacent component port."
        );
      else
        check(
          Math.floor(port.fromCell / value.width) ===
            (port.side === "north" ? 0 : value.height - 1),
          "Boundary port must be on its declared north/south edge."
        );
    }
    for (const terminal of value.terminals)
      check(
        inGrid(terminal.anchorCell) &&
          terminal.terminalId === terminal.anchorCell + 1 &&
          (terminal.componentId === 0 || members[terminal.anchorCell] === terminal.componentId),
        "Invalid terminal identity/anchor."
      );
    for (const record of [...value.pools, ...value.bodies, ...value.components]) {
      const flux = record.flux;
      check(
        close(
          flux.balance,
          flux.incomingOverflow + flux.dryRunoff + flux.wetPrecipitation - flux.wetDemand
        ) && close(flux.balance, record.outflow + record.unresolvedResidual),
        "Physical ledger does not balance with explicit unresolved supply."
      );
    }
    const c = value.conservation;
    check(
      close(
        c.normalizedUnresolvedResidual,
        c.dryRunoff + c.wetPrecipitation > 0
          ? c.unresolvedResidual / (c.dryRunoff + c.wetPrecipitation)
          : 0
      ),
      "Normalized unresolved supply must use the declared total source supply."
    );
    check(
      close(c.externalDischarge, c.marineDischarge + c.boundaryDischarge) &&
        close(
          c.marineDischarge,
          value.marineExits.reduce((sum, exit) => sum + exit.discharge, 0)
        ) &&
        close(
          c.boundaryDischarge,
          value.boundaryExits.reduce((sum, exit) => sum + exit.discharge, 0)
        ) &&
        close(
          c.unresolvedResidual,
          value.pools.reduce((sum, pool) => sum + pool.unresolvedResidual, 0)
        ),
      "Global export or unresolved ledger differs from physical records."
    );
    check(
      close(
        c.residual,
        c.dryRunoff + c.wetPrecipitation - c.wetDemand - c.externalDischarge - c.unresolvedResidual
      ) && Math.abs(c.residual) <= c.roundoffBound,
      "Conservation roundoff is not the residual after explicit unresolved supply."
    );
  },
});
