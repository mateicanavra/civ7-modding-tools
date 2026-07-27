import {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";

/** Smallest player roster exposed by the Studio's world-settings control. */
export const CIV7_STUDIO_MIN_PLAYER_COUNT = 2;

/** Official Civ7 Standard map sizes in game selection order. */
export const CIV7_STUDIO_MAP_SIZE_PRESETS = CIV7_STANDARD_MAP_SIZE_PRESETS;

/** Resolves one official Civ7 Standard map size without inventing a fallback. */
export function getCiv7MapSizePreset(id: Civ7StandardMapSizeId): Civ7StandardMapSizePreset {
  return getCiv7StandardMapSizePreset(id);
}

/**
 * Returns the official number of player-start slots authored for a Standard map size.
 *
 * Civ7 divides starts between two homeland landmasses; their combined capacity is the
 * maximum roster that the map's generated placement surface can faithfully represent.
 */
export function getCiv7MapSizePlayerCapacity(id: Civ7StandardMapSizeId): number {
  const { PlayersLandmass1, PlayersLandmass2 } = getCiv7MapSizePreset(id).mapInfo;
  return PlayersLandmass1 + PlayersLandmass2;
}

/** Player-count choices admitted by Studio for one official Civ7 Standard map size. */
export function getCiv7PlayerCountOptions(id: Civ7StandardMapSizeId): readonly number[] {
  const capacity = getCiv7MapSizePlayerCapacity(id);
  return Object.freeze(
    Array.from(
      { length: capacity - CIV7_STUDIO_MIN_PLAYER_COUNT + 1 },
      (_, index) => CIV7_STUDIO_MIN_PLAYER_COUNT + index
    )
  );
}

/**
 * Normalizes world settings to the selectable player range of their official map-size preset.
 * Map-size changes therefore cannot retain a roster larger than the destination map can place.
 */
export function normalizeCiv7WorldSettings(settings: WorldSettings): WorldSettings {
  const preset = getCiv7MapSizePreset(settings.mapSize);
  const capacity = getCiv7MapSizePlayerCapacity(preset.id);
  const candidate = Number.isFinite(settings.playerCount)
    ? Math.trunc(settings.playerCount)
    : preset.defaultPlayers;
  return {
    ...settings,
    playerCount: Math.min(capacity, Math.max(CIV7_STUDIO_MIN_PLAYER_COUNT, candidate)),
  };
}
