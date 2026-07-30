import type { Civ7MapGenerationSetupCapture } from "@civ7/adapter";
import {
  admitCiv7StandardMapInfo,
  CIV7_MAP_INFO_KEYS,
  type Civ7MapInfo,
  Civ7MapInfoSchema,
  Civ7StandardMapInfoSchema,
  Civ7StandardMapSizeIdSchema,
  findCiv7StandardMapSizePreset,
  findCiv7StandardMapSizePresetForMapInfo,
} from "@civ7/map-policy";
import {
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
  Civ7GameOptionEvidenceSchema,
  Civ7MapOptionEvidenceSchema,
  Civ7PlayerOptionEvidenceSchema,
  Civ7SignedIntSeedSchema,
} from "@civ7/map-policy/setup";
import {
  defineInitialSetup,
  type InitialSetupInputOf,
  type InitialSetupValueOf,
  MapSetupSchema,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

const CustomMapSelectionIdSchema = Type.Union(
  [
    Type.String({ minLength: 1 }),
    Type.Integer({ minimum: Number.MIN_SAFE_INTEGER, maximum: Number.MAX_SAFE_INTEGER }),
  ],
  {
    description: "Stable runtime identity for an explicitly authored custom map-size selection.",
  }
);

const StartSlotCapacitySchema = Type.Object(
  {
    west: Type.Readonly(Type.Integer({ minimum: 0 })),
    east: Type.Readonly(Type.Integer({ minimum: 0 })),
    total: Type.Readonly(Type.Integer({ minimum: 0 })),
  },
  {
    additionalProperties: false,
    description: "West/east start-slot capacity admitted for one map-size selection.",
  }
);

const MapSelectionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Readonly(Type.Literal("civ7-preset")),
      id: Type.Readonly(Civ7StandardMapSizeIdSchema),
      dimensions: Type.Readonly(MapSetupSchema.properties.dimensions),
      mapInfo: Type.Readonly(Civ7StandardMapInfoSchema),
      startSlotCapacity: Type.Readonly(StartSlotCapacitySchema),
    },
    {
      additionalProperties: false,
      description:
        "Official Civ7 preset selection with captured physical and static policy evidence.",
    }
  ),
  Type.Object(
    {
      kind: Type.Readonly(Type.Literal("custom")),
      id: Type.Readonly(CustomMapSelectionIdSchema),
      dimensions: Type.Readonly(MapSetupSchema.properties.dimensions),
      mapInfo: Type.Readonly(Civ7MapInfoSchema),
      startSlotCapacity: Type.Readonly(StartSlotCapacitySchema),
    },
    {
      additionalProperties: false,
      description:
        "Explicit custom map selection carrying stable identity and every physical, map-info, and capacity fact required by Standard generation.",
    }
  ),
]);

/**
 * Official map-option capture descriptors used by every Standard recipe invocation.
 *
 * Each descriptor preserves the authored ParameterID while identifying the runtime projection that
 * can produce the same schema-shaped value, or why no such projection is statically provable.
 */
export const STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS = CIV7_MAP_OPTION_DESCRIPTORS;

/**
 * Official game-option capture descriptors used by every Standard recipe invocation.
 *
 * Game seed has its own required lifecycle field and is intentionally absent from this evidence.
 */
export const STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS = CIV7_GAME_OPTION_DESCRIPTORS;

/** Official player-option capture descriptors applied to every alive-major player in order. */
export const STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS = CIV7_PLAYER_OPTION_DESCRIPTORS;

const STANDARD_INITIAL_MAP_OPTION_IDS = STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS.map(
  ({ parameterId }) => parameterId
);
const STANDARD_INITIAL_GAME_OPTION_IDS = STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS.map(
  ({ parameterId }) => parameterId
);
const STANDARD_INITIAL_PLAYER_OPTION_IDS = STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS.map(
  ({ parameterId }) => parameterId
);

/**
 * Complete immutable initial state admitted once for a Standard recipe run.
 *
 * One closed preset-or-custom selection retains the facts needed to interpret its physical map,
 * while dynamic player and option evidence prevents downstream reconstruction from adapter calls
 * or slot-count fallbacks.
 */
export const STANDARD_INITIAL_SETUP = defineInitialSetup({
  id: "mod-swooper-maps/standard",
  schema: Type.Object(
    {
      map: Type.Readonly(
        Type.Object(
          {
            mapSeed: Type.Readonly(MapSetupSchema.properties.mapSeed),
            latitudeBounds: Type.Readonly(MapSetupSchema.properties.latitudeBounds),
            selection: Type.Readonly(MapSelectionSchema),
          },
          {
            additionalProperties: false,
            description:
              "Map seed, geographic bounds, and explicit preset or custom map selection.",
          }
        )
      ),
      gameSeed: Type.Readonly(Civ7SignedIntSeedSchema),
      aliveMajorPlayerIds: Type.Readonly(
        Type.Immutable(
          Type.Array(Type.Integer({ minimum: 0, maximum: 63 }), {
            minItems: 1,
            uniqueItems: true,
            description:
              "Exact ordered unique alive-major player ids captured at GenerateMap time.",
          })
        )
      ),
      options: Type.Readonly(
        Type.Object(
          {
            map: Type.Readonly(Type.Immutable(Type.Array(Civ7MapOptionEvidenceSchema))),
            game: Type.Readonly(Type.Immutable(Type.Array(Civ7GameOptionEvidenceSchema))),
            player: Type.Readonly(
              Type.Immutable(
                Type.Array(
                  Type.Object(
                    {
                      playerId: Type.Readonly(Type.Integer({ minimum: 0, maximum: 63 })),
                      options: Type.Readonly(
                        Type.Immutable(Type.Array(Civ7PlayerOptionEvidenceSchema))
                      ),
                    },
                    { additionalProperties: false }
                  )
                )
              )
            ),
          },
          {
            additionalProperties: false,
            description:
              "Available or explicitly unavailable evidence for every requested Standard setup option.",
          }
        )
      ),
    },
    {
      additionalProperties: false,
      description:
        "Complete physical selection, player, and option setup for one Standard map generation.",
    }
  ),
  refine: (value, { issues }) => {
    const selection = value.map.selection;
    if (selection.kind === "civ7-preset") {
      const preset = findCiv7StandardMapSizePreset(selection.id);
      if (!preset) {
        issues.add(`map-size id ${JSON.stringify(selection.id)} is not an official Civ7 preset`);
        return;
      }

      if (
        selection.dimensions.width !== preset.dimensions.width ||
        selection.dimensions.height !== preset.dimensions.height
      ) {
        issues.add(
          `map dimensions ${selection.dimensions.width}x${selection.dimensions.height} do not match ${preset.id} ${preset.dimensions.width}x${preset.dimensions.height}`
        );
      }

      for (const key of CIV7_MAP_INFO_KEYS) {
        if (selection.mapInfo[key] !== preset.mapInfo[key]) {
          issues.add(
            `mapInfo.${key} ${String(selection.mapInfo[key])} does not match ${preset.id} ${String(preset.mapInfo[key])}`
          );
        }
      }

      const expectedWest = preset.mapInfo.PlayersLandmass1;
      const expectedEast = preset.mapInfo.PlayersLandmass2;
      const expectedTotal = expectedWest + expectedEast;
      if (
        selection.startSlotCapacity.west !== expectedWest ||
        selection.startSlotCapacity.east !== expectedEast ||
        selection.startSlotCapacity.total !== expectedTotal
      ) {
        issues.add(
          `start-slot capacity ${selection.startSlotCapacity.west}+${selection.startSlotCapacity.east}=${selection.startSlotCapacity.total} does not match ${preset.id} ${expectedWest}+${expectedEast}=${expectedTotal}`
        );
      }
    } else {
      if (typeof selection.id === "string" && selection.id.trim() !== selection.id) {
        issues.add("custom map-size id must be an unpadded string");
      }
      if (
        selection.dimensions.width !== selection.mapInfo.GridWidth ||
        selection.dimensions.height !== selection.mapInfo.GridHeight
      ) {
        issues.add(
          `custom map dimensions ${selection.dimensions.width}x${selection.dimensions.height} do not match mapInfo ${selection.mapInfo.GridWidth}x${selection.mapInfo.GridHeight}`
        );
      }
      requireConsistentStartSlotCapacity(selection, issues.add);
    }

    if (value.aliveMajorPlayerIds.length > selection.startSlotCapacity.total) {
      issues.add(
        `${value.aliveMajorPlayerIds.length} alive-major players exceed start-slot capacity ${selection.startSlotCapacity.total}`
      );
    }

    requireExactOptionEvidenceKeys(
      value.options.map,
      STANDARD_INITIAL_MAP_OPTION_IDS,
      "map",
      issues.add
    );
    requireExactOptionEvidenceKeys(
      value.options.game,
      STANDARD_INITIAL_GAME_OPTION_IDS,
      "game",
      issues.add
    );
    if (value.options.player.length !== value.aliveMajorPlayerIds.length) {
      issues.add("player option evidence must contain one row for every alive-major player");
    }
    value.options.player.forEach((player, index) => {
      if (player.playerId !== value.aliveMajorPlayerIds[index]) {
        issues.add("player option evidence must preserve exact alive-major player order");
      }
      requireExactOptionEvidenceKeys(
        player.options,
        STANDARD_INITIAL_PLAYER_OPTION_IDS,
        `player ${player.playerId}`,
        issues.add
      );
    });
  },
  physical: (value) => ({
    mapSeed: value.map.mapSeed,
    dimensions: value.map.selection.dimensions,
    latitudeBounds: value.map.latitudeBounds,
  }),
});

/** Authoring input accepted by the Standard recipe's initial-setup boundary. */
export type StandardInitialSetupInput = InitialSetupInputOf<typeof STANDARD_INITIAL_SETUP>;

/** Deeply immutable Standard initial setup exposed only to steps that declare this authority. */
export type StandardInitialSetup = InitialSetupValueOf<typeof STANDARD_INITIAL_SETUP>;

type StandardMapOptionEvidence = StandardInitialSetupInput["options"]["map"][number];

/** Explicit preset-or-custom selection accepted by Standard setup admission. */
type StandardInitialMapSelection = StandardInitialSetupInput["map"]["selection"];

/** Complete ordered option evidence accepted by Standard setup admission. */
export type StandardInitialOptionEvidence = StandardInitialSetupInput["options"];

/** Why a headless Standard setup could not observe one requested Civ7 option. */
export type StandardInitialOptionUnavailableReason = Extract<
  StandardMapOptionEvidence,
  { status: "unavailable" }
>["reason"];

/** Every explicit axis required to construct one Standard initial-setup input. */
export type StandardInitialSetupAxes = Readonly<{
  mapSeed: number;
  gameSeed: number;
  latitudeBounds: StandardInitialSetupInput["map"]["latitudeBounds"];
  selection: StandardInitialMapSelection;
  aliveMajorPlayerIds: readonly number[];
  options: StandardInitialOptionEvidence;
}>;

/** Exact one-shot Civ7 capture consumed by the Standard setup projector. */
export type StandardCiv7SetupCapture = Civ7MapGenerationSetupCapture<
  typeof STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
  typeof STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
  typeof STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS
>;

/**
 * Constructs the one complete Standard setup shape from explicitly supplied run axes.
 *
 * This helper applies no defaults and performs no engine reads. Core remains the admission owner
 * that snapshots, validates, and binds the resulting input to its physical MapSetup.
 */
export function createStandardInitialSetupInput(
  input: StandardInitialSetupAxes
): StandardInitialSetupInput {
  return Object.freeze({
    map: Object.freeze({
      mapSeed: input.mapSeed,
      latitudeBounds: Object.freeze({
        topLatitude: input.latitudeBounds.topLatitude,
        bottomLatitude: input.latitudeBounds.bottomLatitude,
      }),
      selection: input.selection,
    }),
    gameSeed: input.gameSeed,
    aliveMajorPlayerIds: Object.freeze([...input.aliveMajorPlayerIds]),
    options: Object.freeze({
      map: Object.freeze([...input.options.map]),
      game: Object.freeze([...input.options.game]),
      player: Object.freeze(
        input.options.player.map(({ playerId, options }) =>
          Object.freeze({ playerId, options: Object.freeze([...options]) })
        )
      ),
    }),
  });
}

/**
 * Constructs complete ordered option evidence for an explicit headless-observation failure.
 *
 * Callers must supply the real reason. The helper covers every requested official key so offline
 * runs cannot silently omit an option or invent an available value.
 */
export function createUnavailableStandardInitialOptionEvidence(
  reason: StandardInitialOptionUnavailableReason,
  playerIds: readonly number[]
): StandardInitialOptionEvidence {
  const unavailable = (key: string) =>
    Object.freeze({ status: "unavailable" as const, key, reason });
  return Object.freeze({
    map: Object.freeze(
      STANDARD_INITIAL_MAP_OPTION_IDS.map(unavailable)
    ) as StandardInitialOptionEvidence["map"],
    game: Object.freeze(
      STANDARD_INITIAL_GAME_OPTION_IDS.map(unavailable)
    ) as StandardInitialOptionEvidence["game"],
    player: Object.freeze(
      playerIds.map((playerId) =>
        Object.freeze({
          playerId,
          options: Object.freeze(
            STANDARD_INITIAL_PLAYER_OPTION_IDS.map(unavailable)
          ) as StandardInitialOptionEvidence["player"][number]["options"],
        })
      )
    ),
  });
}

/**
 * Projects detached Civ7 GenerateMap evidence into the Standard recipe's complete setup shape.
 *
 * The projector performs no engine reads, applies no defaults, and preserves alive-player order
 * and option availability exactly. Core performs structural and cross-field admission afterward.
 */
export function projectStandardInitialSetup(
  capture: StandardCiv7SetupCapture
): StandardInitialSetupInput {
  const preset = findCiv7StandardMapSizePresetForMapInfo(capture.mapInfo);
  if (!preset) {
    throw new TypeError(
      `Standard initial setup requires an official GameInfo.Maps MapSizeType; received lookup key ${JSON.stringify(capture.mapSizeId)} with row identity ${JSON.stringify(capture.mapInfo.MapSizeType)}.`
    );
  }
  const symbolicLookupPreset = findCiv7StandardMapSizePreset(capture.mapSizeId);
  if (symbolicLookupPreset && symbolicLookupPreset.id !== preset.id) {
    throw new TypeError(
      `Standard initial setup map-size lookup key ${symbolicLookupPreset.id} disagrees with GameInfo.Maps row identity ${preset.id}.`
    );
  }

  return createStandardInitialSetupInput({
    mapSeed: capture.mapSeed,
    gameSeed: capture.gameSeed,
    latitudeBounds: capture.latitudeBounds,
    selection: Object.freeze({
      kind: "civ7-preset" as const,
      id: preset.id,
      dimensions: Object.freeze({
        width: capture.dimensions.width,
        height: capture.dimensions.height,
      }),
      mapInfo: admitCiv7StandardMapInfo(capture.mapInfo),
      startSlotCapacity: Object.freeze({
        west: capture.startSlotCapacity.west,
        east: capture.startSlotCapacity.east,
        total: capture.startSlotCapacity.total,
      }),
    }),
    aliveMajorPlayerIds: capture.aliveMajorPlayerIds,
    options: {
      map: capture.options.map,
      game: capture.options.game,
      player: capture.options.player,
    },
  });
}

function requireConsistentStartSlotCapacity(
  selection: Readonly<{
    mapInfo: Civ7MapInfo;
    startSlotCapacity: Readonly<{ west: number; east: number; total: number }>;
  }>,
  issue: (message: string) => void
): void {
  const expectedWest = selection.mapInfo.PlayersLandmass1;
  const expectedEast = selection.mapInfo.PlayersLandmass2;
  const expectedTotal = expectedWest + expectedEast;
  if (
    selection.startSlotCapacity.west !== expectedWest ||
    selection.startSlotCapacity.east !== expectedEast ||
    selection.startSlotCapacity.total !== expectedTotal
  ) {
    issue(
      `custom start-slot capacity ${selection.startSlotCapacity.west}+${selection.startSlotCapacity.east}=${selection.startSlotCapacity.total} does not match mapInfo ${expectedWest}+${expectedEast}=${expectedTotal}`
    );
  }
}

function requireExactOptionEvidenceKeys(
  evidence: readonly Readonly<{ key: string }>[],
  expected: readonly string[],
  kind: string,
  issue: (message: string) => void
): void {
  if (
    evidence.length !== expected.length ||
    evidence.some(({ key }, index) => key !== expected[index])
  ) {
    issue(`${kind} option evidence keys must match the requested official catalog in exact order`);
  }
}
