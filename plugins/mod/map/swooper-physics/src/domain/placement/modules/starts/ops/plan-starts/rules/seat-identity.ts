/** Slot→player identity mapping owned by placement start planning. */

/**
 * Planner seat identity with an immutable requested homeland and a separate working selection
 * homeland. Fallback may move only `selectionRegionSlot`; terminal evidence retains the request.
 */
export type SeatIdentity = {
  readonly seatIndex: number;
  readonly playerId: number;
  readonly regionSlot: 1 | 2;
  selectionRegionSlot: 1 | 2;
};

/**
 * Builds west-then-east seat identities for an already-apportioned player set.
 * The exact admitted engine IDs remain stable while fallback may change only a
 * seat's working region.
 */
export function buildSeatIdentities(args: {
  playersWest: number;
  playersEast: number;
  playerIds: readonly number[];
}): SeatIdentity[] {
  const seats: SeatIdentity[] = [];
  const total = Math.max(0, args.playersWest) + Math.max(0, args.playersEast);
  if (total !== args.playerIds.length) {
    throw new Error(
      `Seat allocation ${total} does not match admitted player demand ${args.playerIds.length}.`
    );
  }
  for (let seatIndex = 0; seatIndex < total; seatIndex++) {
    seats.push({
      seatIndex,
      playerId: args.playerIds[seatIndex]!,
      regionSlot: seatIndex < args.playersWest ? 1 : 2,
      selectionRegionSlot: seatIndex < args.playersWest ? 1 : 2,
    });
  }
  return seats;
}
