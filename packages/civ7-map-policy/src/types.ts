import type { NaturalWonderFootprintOffset } from "./natural-wonder-footprints.js";

/**
 * Static Civ7 policy required to rank and plan one natural wonder.
 *
 * The catalog resolves generated feature-policy rows and footprint geometry once so
 * recipe steps can pass planner inputs without rebuilding a second table. Civ7
 * materialization retains its separate engine-policy owner.
 */
export interface NaturalWonderCatalogEntry {
  /** Official Civ7 feature type index. */
  readonly featureType: number;
  /** Direction emitted in planned intent after self-orientation policy. */
  readonly direction: number;
  /** Official terrain type indices on which the wonder may be anchored. */
  readonly validTerrainTypes: readonly number[];
  /** Official biome type indices in which the wonder may be anchored. */
  readonly validBiomeTypes: readonly number[];
  /** Minimum engine elevation required at the anchor, when authored by Civ7. */
  readonly minimumElevation?: number;
  /** Whether Civ7 forbids lake tiles in this wonder's footprint. */
  readonly noLake?: true;
  /** Whether Civ7 asks planners to prioritize this wonder before ordinary candidates. */
  readonly placeFirst?: true;
  /** Official feature-placement tags that constrain candidate selection. */
  readonly featureTags: readonly string[];
  /** Parity-aware odd-R offsets used to reserve and inspect the planned footprint. */
  readonly footprintOffsetsByParity: Readonly<{
    even: readonly NaturalWonderFootprintOffset[];
    odd: readonly NaturalWonderFootprintOffset[];
  }>;
}

export type ResourcePlacementRejectionReason =
  | "out-of-bounds"
  | "invalid-resource-type"
  | "cannot-have-resource";

export type ResourcePlacementMismatchReason = "wrong-resource-type";

export interface ResourcePlacementIntent {
  plotIndex: number;
  resourceType: number;
}

export type ResourcePlacementOutcome =
  | {
      status: "placed";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      observedResourceType: number;
    }
  | {
      status: "rejected";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      reason: ResourcePlacementRejectionReason;
      observedResourceType?: number;
    }
  | {
      status: "mismatch";
      plotIndex: number;
      x: number;
      y: number;
      resourceType: number;
      reason: ResourcePlacementMismatchReason;
      observedResourceType: number;
    };

export type DiscoveryPlacementRejectionReason =
  | "out-of-bounds"
  | "invalid-discovery-type"
  | "adapter-rejected";

export interface DiscoveryPlacementIntent {
  plotIndex: number;
  discoveryVisualType: number;
  discoveryActivationType: number;
}

export type DiscoveryPlacementOutcome =
  | {
      status: "placed";
      plotIndex: number;
      x: number;
      y: number;
      discoveryVisualType: number;
      discoveryActivationType: number;
    }
  | {
      status: "rejected";
      plotIndex: number;
      x: number;
      y: number;
      discoveryVisualType: number;
      discoveryActivationType: number;
      reason: DiscoveryPlacementRejectionReason;
    };
