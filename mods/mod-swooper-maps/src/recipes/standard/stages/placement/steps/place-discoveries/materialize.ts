import type { OfficialDiscoveryGenerationResult } from "@civ7/adapter";

type OfficialDiscoveryPlacementObservation = Readonly<{
  summary: Readonly<{
    attemptedCount: number;
    placedCount: number;
    rejectedCount: number;
  }>;
}>;

type PlaceOfficialDiscoveriesArgs = {
  generateOfficialDiscoveries: (
    width: number,
    height: number,
    startPositions: ReadonlyArray<number>,
    polarMargin: number
  ) => OfficialDiscoveryGenerationResult;
  width: number;
  height: number;
  startPositions: readonly number[];
  polarMargin: number;
};

/**
 * Places discoveries by running Civ7's official discovery generator through the
 * adapter and recording the observed counts.
 *
 * Discovery type and availability are a LIVE narrative-system product
 * (`GameInfo.DiscoverySiftingImprovements` x `GameInfo.NarrativeStories`,
 * age-conditional with a per-queue budget the generator decrements). Engine
 * visual ids come from `Database.makeHash(ConstructibleType)` and activation
 * ids from the native `DiscoveryActivationTypes` enum — neither is reproducible
 * from a static map-side catalog. Deferring to the official generator is
 * therefore correct-by-construction and patch-evidence; the mod only observes how
 * many sites the engine accepted (the official generator also handles the coast
 * and deep-ocean shipwreck populations the prior land-only plan dropped).
 */
export function placeOfficialDiscoveries({
  generateOfficialDiscoveries,
  width,
  height,
  startPositions,
  polarMargin,
}: PlaceOfficialDiscoveriesArgs): OfficialDiscoveryPlacementObservation {
  const result = generateOfficialDiscoveries(width, height, startPositions, polarMargin);
  const attemptedCount = Math.max(0, result.attemptedCount | 0);
  const placedCount = Math.max(0, Math.min(attemptedCount, result.placedCount | 0));
  return {
    summary: {
      attemptedCount,
      placedCount,
      rejectedCount: attemptedCount - placedCount,
    },
  };
}
