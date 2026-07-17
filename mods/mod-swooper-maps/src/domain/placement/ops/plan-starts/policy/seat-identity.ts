/** Slot→player identity mapping owned by placement start planning. */

export type SeatIdentity = {
  seatIndex: number;
  playerId: number;
  playerIdSource: "alive-majors" | "slot-index";
  regionSlot: 1 | 2;
};

/** Closed authority state for the player population admitted to start planning. */
export type SeatDemand =
  | Readonly<{
      kind: "alive-majors";
      playerIds: readonly number[];
    }>
  | Readonly<{
      kind: "slot-capacity";
      count: number;
    }>;

/**
 * Resolves the major-player demand admitted by the map's seat capacity.
 * A nonempty alive-major observation is authoritative and is capped, never
 * padded; map-size slots become demand only when no alive IDs are observed.
 * Every observed ID is validated before capacity is applied, so invalid or
 * duplicate IDs fail closed rather than disappearing from player identity.
 */
export function resolveSeatDemand(
  slotCapacity: number,
  alivePlayerIds?: readonly number[]
): SeatDemand {
  const alive = alivePlayerIds ?? [];
  if (alive.length === 0) {
    return { kind: "slot-capacity", count: Math.max(0, slotCapacity | 0) };
  }
  const seen = new Set<number>();
  for (const playerId of alive) {
    if (!Number.isInteger(playerId) || playerId < 0 || seen.has(playerId)) {
      throw new Error(`Invalid or duplicate alive-major player ID ${String(playerId)}.`);
    }
    seen.add(playerId);
  }
  const capacity = Math.max(0, slotCapacity | 0);
  return { kind: "alive-majors", playerIds: alive.slice(0, capacity) };
}

/**
 * Builds west-then-east seat identities for an already-apportioned demand.
 * Alive-major demand preserves exact engine IDs; slot-index IDs are created
 * only for the whole-demand fallback when the adapter reports no alive majors.
 */
export function buildSeatIdentities(args: {
  playersWest: number;
  playersEast: number;
  demand: SeatDemand;
}): SeatIdentity[] {
  const seats: SeatIdentity[] = [];
  const total = Math.max(0, args.playersWest) + Math.max(0, args.playersEast);
  const demanded =
    args.demand.kind === "alive-majors" ? args.demand.playerIds.length : args.demand.count;
  if (total !== demanded) {
    throw new Error(`Seat allocation ${total} does not match admitted player demand ${demanded}.`);
  }
  for (let seatIndex = 0; seatIndex < total; seatIndex++) {
    seats.push({
      seatIndex,
      playerId: args.demand.kind === "alive-majors" ? args.demand.playerIds[seatIndex]! : seatIndex,
      playerIdSource: args.demand.kind === "alive-majors" ? "alive-majors" : "slot-index",
      regionSlot: seatIndex < args.playersWest ? 1 : 2,
    });
  }
  return seats;
}
