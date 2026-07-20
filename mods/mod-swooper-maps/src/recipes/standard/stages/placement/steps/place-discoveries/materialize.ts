import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";

type DiscoveryPlacementOutcomes = Static<
  typeof import("../../artifacts/index.js").artifacts["discoveryPlacementOutcomes"]["schema"]
>;

type PlaceOfficialDiscoveriesArgs = {
  adapter: ExtendedMapContext["adapter"];
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
  adapter,
  width,
  height,
  startPositions,
  polarMargin,
}: PlaceOfficialDiscoveriesArgs): DiscoveryPlacementOutcomes {
  const result = adapter.generateOfficialDiscoveries(width, height, startPositions, polarMargin);
  const plannedCount = Math.max(0, result.attemptedCount | 0);
  const placedCount = Math.max(0, Math.min(plannedCount, result.placedCount | 0));
  return {
    summary: {
      plannedCount,
      placedCount,
      rejectedCount: Math.max(0, plannedCount - placedCount),
    },
  };
}
