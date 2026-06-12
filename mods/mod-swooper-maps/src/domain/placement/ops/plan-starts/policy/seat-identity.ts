/**
 * Slot→player identity mapping (placement-realignment S4, decision D3).
 *
 * This is the SINGLE point where seat slots become engine player ids. Seats
 * are ordered west seats first, then east seats. When the adapter's
 * alive-majors read surface covers the seat, its id is used verbatim
 * (`alive-majors`); otherwise the positional slot index is used and the seat
 * is flagged (`slot-index`) — recorded, never silent. The live alive-major id
 * semantics (ordering, human grouping, hemisphere homeland rules) are probed
 * at Milestone A and finalized here without touching callers.
 */

export type SeatIdentity = {
  seatIndex: number;
  playerId: number;
  playerIdSource: "alive-majors" | "slot-index";
  regionSlot: 1 | 2;
};

export function buildSeatIdentities(args: {
  playersWest: number;
  playersEast: number;
  alivePlayerIds?: readonly number[];
}): SeatIdentity[] {
  const seats: SeatIdentity[] = [];
  const alive = args.alivePlayerIds ?? [];
  const total = Math.max(0, args.playersWest) + Math.max(0, args.playersEast);
  for (let seatIndex = 0; seatIndex < total; seatIndex++) {
    const aliveId = alive[seatIndex];
    const usable = typeof aliveId === "number" && Number.isInteger(aliveId) && aliveId >= 0;
    seats.push({
      seatIndex,
      playerId: usable ? aliveId : seatIndex,
      playerIdSource: usable ? "alive-majors" : "slot-index",
      regionSlot: seatIndex < args.playersWest ? 1 : 2,
    });
  }
  return seats;
}
