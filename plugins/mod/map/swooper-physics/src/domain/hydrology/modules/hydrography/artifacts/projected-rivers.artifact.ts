import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { riverDirectionToReceiver } from "../model/policy/river-direction.js";

const RiverDirectionSchema = Type.Union([
  Type.Literal("EAST"), Type.Literal("NORTHEAST"), Type.Literal("NORTHWEST"),
  Type.Literal("WEST"), Type.Literal("SOUTHWEST"), Type.Literal("SOUTHEAST"),
]);

/** Publishes Hydrology's immutable Civ7-projectable river intent for downstream map products. */
export const artifact = defineArtifact({
  name: "projectedRivers",
  id: "artifact:map.rivers.projectedRivers",
  schema: Type.Object({
    model: Type.Literal("certified-sill-spill"),
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    riverMask: TypedArraySchemas.u8({ cardinality: "map-grid", description: "Native NAVIGABLE source intent, exactly the physical major dry sources." }),
    nativeMinorRiverMask: TypedArraySchemas.u8({ cardinality: "map-grid", description: "Native MINOR source intent, exactly the physical minor dry sources." }),
    plannedMinorRiverMask: TypedArraySchemas.u8({ cardinality: "map-grid" }),
    plannedMajorRiverMask: TypedArraySchemas.u8({ cardinality: "map-grid" }),
    plannedMinorRiverTileCount: Type.Integer({ minimum: 0 }),
    plannedMajorRiverTileCount: Type.Integer({ minimum: 0 }),
    authoredSourceCount: Type.Integer({ minimum: 0, description: "Dry-source write count; wet transitions are separate connectivity declarations." }),
    writes: Type.Array(Type.Object({
      sourceCell: Type.Integer({ minimum: 0 }),
      receiverCell: Type.Integer({ minimum: 0 }),
      direction: RiverDirectionSchema,
      riverClass: Type.Union([Type.Literal("MINOR"), Type.Literal("NAVIGABLE")]),
    }, { additionalProperties: false })),
    wetTransitionWrites: Type.Array(Type.Object({
      bodyId: Type.Integer({ minimum: 1 }),
      role: Type.Literal("outlet"),
      sourceCell: Type.Integer({ minimum: 0 }),
      receiverCell: Type.Integer({ minimum: 0 }),
      direction: RiverDirectionSchema,
      riverClass: Type.Literal("NAVIGABLE"),
    }, { additionalProperties: false }), {
      description: "Qualified accepted finite lake outlets to existing dry NAV sources; neither wet river terrain intent nor navigation proof.",
    }),
    wetTransitionDispositions: Type.Array(Type.Object({
      bodyId: Type.Integer({ minimum: 1 }),
      transportKind: Type.Union([Type.Literal("internal"), Type.Literal("external")]),
      wetCell: Type.Integer({ minimum: 0 }),
      adjacentCell: Type.Integer({ minimum: 0 }),
      outwardDischarge: Type.Number({ description: "Actual signed transfer from wetCell toward adjacentCell; negative values feed the reservoir." }),
      disposition: Type.Union([
        Type.Literal("authored"), Type.Literal("inward-or-zero"),
        Type.Literal("receiver-not-dry-nav"), Type.Literal("same-source-secondary"),
      ]),
    }, { additionalProperties: false }), {
      description: "Disposition of physical reservoir-boundary exchanges, including inward and unselected transfers; not a second water ledger.",
    }),
  }, {
    additionalProperties: false,
    description: "Complete authored dry-source river intent and separate wet outlet declarations; not a native through-lake navigation claim.",
  }),
  refine: (value, { issues }) => {
    const size = value.width * value.height;
    const validateEdge = (sourceCell: number, receiverCell: number, direction?: string) => {
      try {
        const expected = riverDirectionToReceiver(value.width, value.height, sourceCell, receiverCell);
        if (direction !== undefined && direction !== expected)
          issues.add("Authored river direction must identify its recorded adjacent receiver.");
      } catch {
        issues.add("Authored river writes and wet dispositions require actual adjacent map-grid edges.");
      }
    };
    const seen = new Uint8Array(size);
    let minorCount = 0;
    let majorCount = 0;
    for (const write of value.writes) {
      validateEdge(write.sourceCell, write.receiverCell, write.direction);
      if (write.sourceCell >= size || write.receiverCell >= size || seen[write.sourceCell] === 1 || write.sourceCell === write.receiverCell) {
        issues.add("Authored river writes must have unique valid dry-source identities and distinct receivers.");
        continue;
      }
      seen[write.sourceCell] = 1;
      const minor = write.riverClass === "MINOR" ? 1 : 0;
      if (value.nativeMinorRiverMask[write.sourceCell] !== minor || value.riverMask[write.sourceCell] !== 1 - minor) {
        issues.add("Authored write class must match native intent masks.");
      }
    }
    for (let cell = 0; cell < size; cell++) {
      const minor = value.plannedMinorRiverMask[cell]!;
      const major = value.plannedMajorRiverMask[cell]!;
      if ((minor !== 0 && minor !== 1) || (major !== 0 && major !== 1) || minor + major > 1 ||
          value.nativeMinorRiverMask[cell] !== minor || value.riverMask[cell] !== major || seen[cell] !== minor + major) {
        issues.add("Authored river writes must cover each physical minor/major source exactly once without demotion.");
        break;
      }
      minorCount += minor;
      majorCount += major;
    }
    if (value.authoredSourceCount !== value.writes.length || value.authoredSourceCount !== minorCount + majorCount ||
        value.plannedMinorRiverTileCount !== minorCount || value.plannedMajorRiverTileCount !== majorCount) {
      issues.add("Authored river counts must match complete source masks and writes.");
    }
    const wetSources = new Set<number>();
    const wetWrites = new Map(value.wetTransitionWrites.map((write) => [write.sourceCell, write]));
    for (const write of value.wetTransitionWrites) {
      validateEdge(write.sourceCell, write.receiverCell, write.direction);
      if (write.sourceCell >= size || write.receiverCell >= size || write.sourceCell === write.receiverCell
        || seen[write.sourceCell] === 1 || wetSources.has(write.sourceCell)) {
        issues.add("Wet outlet writes must have unique valid wet sources, separate from dry writes; one body may have multiple sources.");
      }
      if (seen[write.receiverCell] !== 1 || value.riverMask[write.receiverCell] !== 1) {
        issues.add("Wet outlet receivers must already be authored dry NAV sources.");
      }
      wetSources.add(write.sourceCell);
    }
    const dispositionKeys = new Set<string>();
    const authoredDispositions = new Set<number>();
    const selected = new Map(value.wetTransitionDispositions.filter((row) => row.disposition === "authored")
      .map((row) => [row.wetCell, row]));
    for (const row of value.wetTransitionDispositions) {
      validateEdge(row.wetCell, row.adjacentCell);
      const key = `${row.transportKind}:${row.wetCell}:${row.adjacentCell}`;
      if (row.wetCell >= size || row.adjacentCell >= size || row.wetCell === row.adjacentCell
        || seen[row.wetCell] === 1 || !Number.isFinite(row.outwardDischarge) || dispositionKeys.has(key)) {
        issues.add("Wet transition dispositions require unique finite represented exchanges, separate from dry sources.");
      }
      dispositionKeys.add(key);
      const dryNav = value.riverMask[row.adjacentCell] === 1;
      if (row.disposition === "inward-or-zero") {
        if (row.outwardDischarge > 0) issues.add("Inward transition cannot have positive outward discharge.");
      } else {
        if (row.outwardDischarge <= 0) issues.add("Outward transition requires actual positive transfer.");
        if (row.disposition === "receiver-not-dry-nav") {
          if (dryNav) issues.add("Unqualified transition receiver is already an authored dry NAV source.");
        } else if (!dryNav) issues.add("Selected or competing wet transitions require authored dry NAV receivers.");
      }
      if (row.disposition === "authored") {
        const write = wetWrites.get(row.wetCell);
        if (authoredDispositions.has(row.wetCell) || !write || write.bodyId !== row.bodyId || write.receiverCell !== row.adjacentCell) {
          issues.add("Every authored wet disposition must identify exactly one matching native write.");
        }
        authoredDispositions.add(row.wetCell);
      }
      if (row.disposition === "same-source-secondary") {
        const winner = selected.get(row.wetCell);
        if (!winner || winner.bodyId !== row.bodyId || winner.outwardDischarge < row.outwardDischarge
          || (winner.outwardDischarge === row.outwardDischarge && winner.adjacentCell > row.adjacentCell)) {
          issues.add("Secondary wet transfers require the greatest-flow, then lowest-receiver selection at the same source.");
        }
      }
    }
    if (authoredDispositions.size !== value.wetTransitionWrites.length)
      issues.add("Every wet native write requires its positive physical transfer disposition.");
  },
});
