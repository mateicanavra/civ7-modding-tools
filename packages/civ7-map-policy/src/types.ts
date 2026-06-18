export interface NaturalWonderCatalogEntry {
  featureType: number;
  direction: number;
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
