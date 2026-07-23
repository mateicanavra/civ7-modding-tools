import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import gridCellSummaryDefinition from "./strategies/grid-cell-summary/config.js";

/** Aggregates tile-level soil and fertility evidence into stable grid-cell summaries for downstream inspection. Every implementation shares this admitted input and output boundary. */
const AggregatePedologyContract = defineOp({
  kind: "compute",
  id: "ecology/pedology/aggregate",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    soilType: TypedArraySchemas.u8({ description: "Soil palette indices." }),
    fertility: TypedArraySchemas.f32({ description: "Fertility values (0..1)." }),
  }),
  output: Type.Object({
    cells: Type.Array(
      Type.Object({
        x: Type.Integer({ minimum: 0 }),
        y: Type.Integer({ minimum: 0 }),
        width: Type.Integer({ minimum: 1 }),
        height: Type.Integer({ minimum: 1 }),
        meanFertility: Type.Number({ minimum: 0, maximum: 1 }),
        dominantSoil: Type.Integer({ minimum: 0 }),
      })
    ),
  }),
  strategies: [gridCellSummaryDefinition],
});

export default AggregatePedologyContract;
