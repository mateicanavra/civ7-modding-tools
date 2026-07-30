import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
} from "../../../../model/policy/river-class.js";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
  HYDROLOGY_MOUTH_UNRESOLVED,
  HYDROLOGY_SLOPE_FLAT,
  HYDROLOGY_SLOPE_LOW,
  HYDROLOGY_SLOPE_MODERATE,
  HYDROLOGY_SLOPE_MOUNTAIN_BLOCKED,
  HYDROLOGY_SLOPE_NONE,
  HYDROLOGY_SLOPE_STEEP,
} from "../../../../model/policy/river-network-classification.js";
import ClassifyRiverNetworkContract from "../../contract.js";
import HydrographicClassificationDefinition from "./config.js";

const FLAT_SLOPE_MAX = 0.5;
const LOW_SLOPE_MAX = 4;
const MODERATE_SLOPE_MAX = 12;
const MOUNTAIN_BLOCKED_RELIEF_MIN = 6;
const MAJOR_PERENNIAL_SPECIFIC_DISCHARGE_MIN = 4;
const MINOR_INTERMITTENT_SPECIFIC_DISCHARGE_MIN = 2.25;
const NON_RIVER_EPHEMERAL_SPECIFIC_DISCHARGE_MIN = 1.5;
const NON_RIVER_EPHEMERAL_UPSTREAM_AREA_MIN = 4;
const HIGH_ORDER_CONFLUENCE_UPSTREAM_AREA_MIN_DEFAULT = 64;

function computeLandReceiver(
  size: number,
  landMask: ArrayLike<number>,
  flowDir: ArrayLike<number>
): { receiver: Int32Array; order: Int32Array } {
  const receiver = new Int32Array(size);
  const indegree = new Int32Array(size);
  receiver.fill(-1);

  let landCount = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1) continue;
    landCount += 1;
    const raw = flowDir[i] ?? -1;
    if (raw >= 0 && raw < size && landMask[raw] === 1) {
      receiver[i] = raw;
      indegree[raw] += 1;
    }
  }

  const queue = new Int32Array(size);
  const order = new Int32Array(landCount);
  let head = 0;
  let tail = 0;
  let written = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1 && indegree[i] === 0) queue[tail++] = i;
  }

  while (head < tail) {
    const index = queue[head++]!;
    order[written++] = index;
    const dest = receiver[index] ?? -1;
    if (dest < 0) continue;
    indegree[dest] -= 1;
    if (indegree[dest] === 0) queue[tail++] = dest;
  }

  if (written !== landCount) {
    throw new Error("[Hydrology] River-network classification requires acyclic Hydrology flowDir.");
  }

  return { receiver, order };
}

function classifySlopeClass(
  index: number,
  width: number,
  height: number,
  landMask: ArrayLike<number>,
  elevation: ArrayLike<number>,
  routingElevation: ArrayLike<number>,
  receiver: ArrayLike<number>,
  terminalType: ArrayLike<number>
): number {
  if (landMask[index] !== 1) return HYDROLOGY_SLOPE_NONE;
  const dest = receiver[index] ?? -1;
  if (dest < 0) {
    if (
      terminalType[index] === 2 &&
      isMountainBlockedClosedBasin(index, width, height, landMask, elevation)
    ) {
      return HYDROLOGY_SLOPE_MOUNTAIN_BLOCKED;
    }
    return HYDROLOGY_SLOPE_FLAT;
  }

  const here = routingElevation[index] ?? 0;
  const there = routingElevation[dest] ?? 0;
  const delta = Math.max(0, here - there);
  if (delta <= FLAT_SLOPE_MAX) return HYDROLOGY_SLOPE_FLAT;
  if (delta <= LOW_SLOPE_MAX) return HYDROLOGY_SLOPE_LOW;
  if (delta <= MODERATE_SLOPE_MAX) return HYDROLOGY_SLOPE_MODERATE;
  return HYDROLOGY_SLOPE_STEEP;
}

function isMountainBlockedClosedBasin(
  index: number,
  width: number,
  height: number,
  landMask: ArrayLike<number>,
  elevation: ArrayLike<number>
): boolean {
  const here = elevation[index] ?? 0;
  const x = index % width;
  const y = Math.floor(index / width);
  let minNeighborRelief = Infinity;
  let landNeighborCount = 0;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const neighbor = ny * width + nx;
    if (landMask[neighbor] !== 1) return;
    landNeighborCount += 1;
    minNeighborRelief = Math.min(minNeighborRelief, (elevation[neighbor] ?? here) - here);
  });
  return landNeighborCount > 0 && minNeighborRelief >= MOUNTAIN_BLOCKED_RELIEF_MIN;
}

/**
 * Traverses one acyclic receiver graph to derive contributing area and Strahler-like hierarchy,
 * then propagates mouth evidence upstream and classifies slope and permanence. Rejecting cycles
 * keeps every reported measurement tied to the same causal river network.
 */
const hydrographicClassificationStrategy = createStrategy(
  ClassifyRiverNetworkContract,
  HydrographicClassificationDefinition,
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;
      const size = width * height;

      const highOrderConfluenceUpstreamAreaMin =
        Number.isFinite(config.highOrderConfluenceUpstreamAreaMin) &&
        config.highOrderConfluenceUpstreamAreaMin >= 0
          ? config.highOrderConfluenceUpstreamAreaMin
          : HIGH_ORDER_CONFLUENCE_UPSTREAM_AREA_MIN_DEFAULT;

      const { receiver, order } = computeLandReceiver(size, input.landMask, input.flowDir);
      const upstreamArea = new Int32Array(size);
      const streamOrderProxy = new Uint8Array(size);
      const mouthType = new Uint8Array(size);
      const slopeClass = new Uint8Array(size);
      const flowPermanenceProxy = new Uint8Array(size);
      const maxIncomingOrder = new Uint8Array(size);
      const maxIncomingOrderCount = new Uint8Array(size);
      const spillReachMask = new Uint8Array(size);

      for (let i = 0; i < size; i++) {
        if (input.landMask[i] === 1) upstreamArea[i] = 1;
        slopeClass[i] = classifySlopeClass(
          i,
          width,
          height,
          input.landMask,
          input.elevation,
          input.routingElevation,
          receiver,
          input.terminalType
        );
      }

      for (let i = 0; i < order.length; i++) {
        const index = order[i]!;
        const dest = receiver[index] ?? -1;

        if (isAnyRiverClass(input.riverClass[index])) {
          const maxOrder = maxIncomingOrder[index] ?? 0;
          // Strahler-like escalation requires >=2 incoming tributaries that share
          // the receiver's max order. Headwater (order 1->2) confluences are
          // abundant and legitimately small, so they escalate unconditionally.
          // Higher-order escalation (order >=3) is gated on the receiver's
          // combined upstream area so that spurious small 2-into-1 junctions on
          // tiny networks do not manufacture inflated stream order.
          const hasConfluence = (maxIncomingOrderCount[index] ?? 0) >= 2;
          const escalates =
            hasConfluence &&
            (maxOrder < 2 || (upstreamArea[index] ?? 0) >= highOrderConfluenceUpstreamAreaMin);
          streamOrderProxy[index] =
            maxOrder === 0 ? 1 : Math.min(255, maxOrder + (escalates ? 1 : 0));
        }

        if (dest >= 0) {
          upstreamArea[dest] += upstreamArea[index] ?? 0;
          const currentOrder = streamOrderProxy[index] ?? 0;
          if (currentOrder > 0) {
            if (currentOrder > (maxIncomingOrder[dest] ?? 0)) {
              maxIncomingOrder[dest] = currentOrder;
              maxIncomingOrderCount[dest] = 1;
            } else if (currentOrder === (maxIncomingOrder[dest] ?? 0)) {
              maxIncomingOrderCount[dest] = Math.min(255, (maxIncomingOrderCount[dest] ?? 0) + 1);
            }
          }
        }
      }

      for (let i = order.length - 1; i >= 0; i--) {
        const index = order[i]!;
        const raw = input.flowDir[index] ?? -1;
        const dest = receiver[index] ?? -1;
        let baseMouth = HYDROLOGY_MOUTH_UNRESOLVED;
        let spillReach = (input.depressionDepth[index] ?? 0) > 0 ? 1 : 0;

        if (dest >= 0) {
          baseMouth = mouthType[dest] ?? HYDROLOGY_MOUTH_UNRESOLVED;
          if (spillReachMask[dest] === 1) spillReach = 1;
        } else if (input.lakeMask[index] === 1) {
          baseMouth = HYDROLOGY_MOUTH_ACCEPTED_LAKE;
        } else if (
          input.terminalType[index] === 1 ||
          (raw >= 0 && raw < size && input.landMask[raw] !== 1)
        ) {
          baseMouth = HYDROLOGY_MOUTH_OCEAN;
        } else if (input.terminalType[index] === 2) {
          baseMouth = HYDROLOGY_MOUTH_CLOSED_BASIN;
        }

        spillReachMask[index] = spillReach;
        mouthType[index] =
          spillReach === 1 &&
          (baseMouth === HYDROLOGY_MOUTH_OCEAN || baseMouth === HYDROLOGY_MOUTH_ACCEPTED_LAKE)
            ? HYDROLOGY_MOUTH_SPILL_PATH
            : baseMouth;
      }

      for (let i = 0; i < size; i++) {
        if (input.landMask[i] !== 1) {
          flowPermanenceProxy[i] = HYDROLOGY_FLOW_DRY;
          continue;
        }

        const area = Math.max(1, upstreamArea[i] ?? 0);
        const specificDischarge = (input.discharge[i] ?? 0) / area;
        const riverClass = input.riverClass[i] ?? 0;

        if (isMajorRiverClass(riverClass)) {
          flowPermanenceProxy[i] =
            specificDischarge >= MAJOR_PERENNIAL_SPECIFIC_DISCHARGE_MIN
              ? HYDROLOGY_FLOW_PERENNIAL
              : HYDROLOGY_FLOW_INTERMITTENT;
          continue;
        }
        if (isMinorRiverClass(riverClass)) {
          flowPermanenceProxy[i] =
            specificDischarge >= MINOR_INTERMITTENT_SPECIFIC_DISCHARGE_MIN
              ? HYDROLOGY_FLOW_INTERMITTENT
              : HYDROLOGY_FLOW_EPHEMERAL;
          continue;
        }
        flowPermanenceProxy[i] =
          specificDischarge >= NON_RIVER_EPHEMERAL_SPECIFIC_DISCHARGE_MIN &&
          area >= NON_RIVER_EPHEMERAL_UPSTREAM_AREA_MIN
            ? HYDROLOGY_FLOW_EPHEMERAL
            : HYDROLOGY_FLOW_DRY;
      }

      return {
        upstreamArea,
        streamOrderProxy,
        mouthType,
        slopeClass,
        flowPermanenceProxy,
      } as const;
    },
  }
);

export default hydrographicClassificationStrategy;
