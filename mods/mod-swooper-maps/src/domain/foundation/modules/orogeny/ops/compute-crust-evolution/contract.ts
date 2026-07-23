import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const CrustEvolutionConfigSchema = Type.Object(
  {
    continentalSurvivalMaturity: Type.Number({
      description:
        "Maturity below which marginal continental crust founders to oceanic. Higher = less land (archipelago); lower = more land (pangaea).",
      default: 0.6,
      minimum: 0.4,
      maximum: 0.85,
    }),
    continentalFreeboard: Type.Number({
      description:
        "Isostatic freeboard step of differentiated continental crust. Higher = high-standing continents / narrow deep shelves; lower = low continents / broad shelves.",
      default: 0.35,
      minimum: 0,
      maximum: 0.6,
    }),
    hyperextensionBreakupBase: Type.Number({
      description:
        "Breakup threshold for marginal continental crust. Lower = more rifting/fragmentation; higher = coherent continents.",
      default: 0.1,
      minimum: 0.02,
      maximum: 0.5,
    }),
    thinningThicknessLoss: Type.Number({
      description:
        "Thickness lost by a fully beta-thinned margin (shelf depth). Higher = deeper shelves/basins; lower = shallow shelves.",
      default: 0.55,
      minimum: 0,
      maximum: 1,
    }),
    oceanicAbyssalDepth: Type.Number({
      description:
        "Abyssal subsidence of oceanic floor with distance from the continental margin (deep-ocean relief). Higher = deeper, more dominant open ocean / thinner shelf fringe; 0 = flat floor (shelf-heavy).",
      default: 0.75,
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Per-map-class character knobs for foundation/compute-crust-evolution (abundance, freeboard, fragmentation, shelf depth, abyssal relief). Defaults are the earthlike profile.",
  }
);

const StrategySchema = CrustEvolutionConfigSchema;

/**
 * Contract for evolving the initial crust through accumulated tectonic activity and history.
 * Orogeny owns this differentiation boundary; projection only materializes the resulting crust later.
 */
const ComputeCrustEvolutionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust-evolution",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      initialCrust: Type.Object(
        {
          thickness: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          strength: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonics: Type.Object(
        {
          boundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          cumulativeUplift: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonicHistory: Type.Object(
        {
          eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
          eras: Type.Array(
            Type.Object(
              {
                upliftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                volcanism: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                fracture: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
              },
              { additionalProperties: false }
            )
          ),
          upliftTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          fractureTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description: "Input payload for foundation/compute-crust-evolution.",
    }
  ),
  output: Type.Object(
    {
      crust: Type.Object(
        {
          maturity: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thickness: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thermalAge: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          damage: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          type: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          age: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          buoyancy: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          baseElevation: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          strength: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description: "Output payload for foundation/compute-crust-evolution.",
    }
  ),
  strategies: {
    "tectonic-differentiation": StrategySchema,
  },
});

export default ComputeCrustEvolutionContract;
