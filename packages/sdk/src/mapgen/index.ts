/**
 * Civ7 map-runtime SDK entrypoint.
 *
 * `createMap` belongs in the SDK so all map mods share one typed authoring
 * contract, but it is not part of the SDK root because importing it loads the
 * Civ7 adapter runtime that only resolves inside the game.
 */

export type { MapDefinition, MapLatitudeBounds } from "./createMap.js";
export { createMap } from "./createMap.js";
