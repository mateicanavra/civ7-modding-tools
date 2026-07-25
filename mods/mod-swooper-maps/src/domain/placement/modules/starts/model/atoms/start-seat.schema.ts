import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Viability band assigned to one admitted start candidate. */
export const StartCandidateTierSchema = Type.Union([
  Type.Literal("primary"),
  Type.Literal("islandCluster"),
  Type.Literal("marginal"),
]);

/** Fallback rung that ultimately seated one player. */
export const StartSeatRungSchema = Type.Union(
  [
    Type.Literal("regional"),
    Type.Literal("open-pool"),
    Type.Literal("quality-relaxed"),
    Type.Literal("spacing-relaxed"),
  ],
  {
    description:
      "Fallback ladder rung that seated the player. Every rung is scored; non-regional rungs are degradations recorded per seat.",
  }
);

/** Retained component scores explaining one start candidate's viability. */
export const StartComponentsSchema = Type.Object(
  {
    freshwater: Type.Number({ minimum: 0, maximum: 1 }),
    fertility: Type.Number({ minimum: 0, maximum: 1 }),
    expansion: Type.Number({ minimum: 0, maximum: 1 }),
    climate: Type.Number({ minimum: 0, maximum: 1 }),
    resource: Type.Number({ minimum: 0, maximum: 1 }),
    roughness: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Roughness penalty magnitude (0 = flat, 1 = max rugged).",
    }),
  },
  {
    additionalProperties: false,
    description: "Retained per-start component vector used to explain candidate scoring.",
  }
);

/** One terminal player-seat assignment with provenance and degradation evidence. */
export const StartSeatSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    playerId: Type.Integer({
      minimum: 0,
      description: "Engine player id stamped via setStartPosition.",
    }),
    playerIdSource: Type.Union([Type.Literal("alive-majors"), Type.Literal("slot-index")], {
      description:
        "Identity authority for this seat: an exact adapter-reported alive-major ID, or a slot-index fallback used only when the alive-major observation is empty.",
    }),
    regionSlot: Type.Integer({
      minimum: 1,
      maximum: 2,
      description:
        "Immutable requested homeland region for the seat (1=west, 2=east); fallback never rewrites it.",
    }),
    realizedRegionSlot: Type.Integer({
      minimum: 0,
      maximum: 2,
      description:
        "Terminal homeland region of the selected plot after fallback and fairness (1=west, 2=east); 0 only when unseated.",
    }),
    plotIndex: Type.Integer({
      minimum: -1,
      description: "Chosen start plot; -1 records an unseated player as explicit degradation.",
    }),
    rung: StartSeatRungSchema,
    status: Type.Union([Type.Literal("full"), Type.Literal("degraded")]),
    tier: Type.Union([StartCandidateTierSchema, Type.Literal("none")], {
      description: "Viability tier of the chosen plot; none identifies quality-relaxed seats.",
    }),
    score: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Published viability score under fixed weight normalization.",
    }),
    components: StartComponentsSchema,
    achievedSpacing: Type.Integer({
      minimum: -1,
      description: "Minimum odd-q distance to another seated start; -1 when not measurable.",
    }),
    imputedFlags: Type.Array(Type.String(), {
      description:
        "Missing inputs and seat degradations made explicit instead of silently neutral-defaulted.",
    }),
  },
  {
    additionalProperties: false,
    description: "One planned or stamped player start with complete selection provenance.",
  }
);

/** Static value admitted by {@link StartSeatSchema}. */
export type StartSeat = Static<typeof StartSeatSchema>;
