import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  forEachHexNeighborOddQ,
  hasMaskWithinHexDistanceOddQ,
  wrapX,
} from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import PlanIslandChainsContract from "../contract.js";
import {
  normalizeIslandTunables,
  resolveClusterCount,
  selectIslandKind,
  shouldSeedIsland,
  validateIslandInputs,
} from "../rules/index.js";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;
const MOVEMENT_SCALE = 127;

type IslandEdit = { index: number; kind: "coast" | "peak" };
type Vec2 = { x: number; y: number };

function normalizeVec2(vector: Vec2): Vec2 | null {
  const length = Math.hypot(vector.x, vector.y);
  if (!Number.isFinite(length) || length <= 1e-9) return null;
  return { x: vector.x / length, y: vector.y / length };
}

function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

function fallbackDirection(seed: number): Vec2 {
  const angle =
    ((((seed * 1103515245 + 12345) >>> 0) % 4096) / 4096) * Math.PI * 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function movementDirection(params: {
  index: number;
  movementU: Int8Array;
  movementV: Int8Array;
}): Vec2 | null {
  const u = (params.movementU[params.index] ?? 0) / MOVEMENT_SCALE;
  const v = (params.movementV[params.index] ?? 0) / MOVEMENT_SCALE;
  return normalizeVec2({ x: u, y: v });
}

function boundaryTangentDirection(params: {
  index: number;
  width: number;
  height: number;
  boundaryCloseness: Uint8Array;
  movement: Vec2 | null;
}): Vec2 | null {
  const { index, width, height, boundaryCloseness } = params;
  const y = (index / width) | 0;
  const x = index - y * width;
  const row = y * width;
  const left = boundaryCloseness[row + wrapX(x - 1, width)] ?? 0;
  const right = boundaryCloseness[row + wrapX(x + 1, width)] ?? 0;
  const up = y > 0 ? boundaryCloseness[(y - 1) * width + x] ?? 0 : boundaryCloseness[index] ?? 0;
  const down =
    y < height - 1 ? boundaryCloseness[(y + 1) * width + x] ?? 0 : boundaryCloseness[index] ?? 0;
  const gradient = normalizeVec2({ x: right - left, y: down - up });
  if (!gradient) return null;
  let tangent = normalizeVec2({ x: -gradient.y, y: gradient.x });
  if (!tangent) return null;
  if (params.movement && dot(tangent, params.movement) < 0) {
    tangent = { x: -tangent.x, y: -tangent.y };
  }
  return tangent;
}

function resolveChainDirection(params: {
  index: number;
  width: number;
  height: number;
  boundaryCloseness: Uint8Array;
  movementU: Int8Array;
  movementV: Int8Array;
  hotspotSignal: number;
  rngSeed: number;
}): Vec2 {
  const movement = movementDirection({
    index: params.index,
    movementU: params.movementU,
    movementV: params.movementV,
  });
  const tangent = boundaryTangentDirection({
    index: params.index,
    width: params.width,
    height: params.height,
    boundaryCloseness: params.boundaryCloseness,
    movement,
  });
  if (params.hotspotSignal >= 0.45 && movement) return movement;
  if (tangent) return tangent;
  if (movement) return movement;
  return fallbackDirection((params.index ^ params.rngSeed) | 0);
}

function neighborVector(params: {
  x: number;
  y: number;
  nx: number;
  ny: number;
  width: number;
}): Vec2 | null {
  let dx = params.nx - params.x;
  if (dx > params.width / 2) dx -= params.width;
  else if (dx < -params.width / 2) dx += params.width;
  return normalizeVec2({ x: dx, y: params.ny - params.y });
}

function isFarEnoughFromMask(params: {
  mask: Uint8Array;
  index: number;
  width: number;
  height: number;
  radius: number;
}): boolean {
  return !hasMaskWithinHexDistanceOddQ({
    mask: params.mask,
    centerIndex: params.index,
    width: params.width,
    height: params.height,
    maxDistance: params.radius,
  });
}

function chooseNextChainTile(params: {
  current: number;
  previous: number;
  direction: Vec2;
  width: number;
  height: number;
  landMask: Uint8Array;
  plannedMask: Uint8Array;
  boundaryCloseness: Uint8Array;
  volcanism: Uint8Array;
  minDist: number;
  perlin: PerlinNoise;
  step: number;
}): number {
  const {
    current,
    previous,
    direction,
    width,
    height,
    landMask,
    plannedMask,
    boundaryCloseness,
    volcanism,
    minDist,
    perlin,
    step,
  } = params;
  const x = current % width;
  const y = (current / width) | 0;
  let bestIndex = -1;
  let bestScore = -Infinity;

  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const index = ny * width + nx;
    if (index === previous) return;
    if (landMask[index] === 1 || plannedMask[index] === 1) return;
    if (
      minDist > 0 &&
      !isFarEnoughFromMask({ mask: landMask, index, width, height, radius: minDist })
    ) {
      return;
    }

    const nVec = neighborVector({ x, y, nx, ny, width });
    if (!nVec) return;
    const bendNoise = perlin.noise2D((nx + step * 0.37) * 0.19, (ny - step * 0.13) * 0.19);
    const score =
      dot(nVec, direction) +
      bendNoise * 0.18 +
      ((volcanism[index] ?? 0) / 255) * 0.2 +
      ((boundaryCloseness[index] ?? 0) / 255) * 0.12;
    if (score > bestScore || (score === bestScore && index < bestIndex)) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestScore < -0.25 ? -1 : bestIndex;
}

function addIslandEdit(params: {
  edits: IslandEdit[];
  plannedMask: Uint8Array;
  landMask: Uint8Array;
  index: number;
  kind: "coast" | "peak";
}): boolean {
  const { edits, plannedMask, landMask, index, kind } = params;
  if (index < 0 || index >= plannedMask.length) return false;
  if (landMask[index] === 1 || plannedMask[index] === 1) return false;
  plannedMask[index] = 1;
  edits.push({ index, kind });
  return true;
}

export const defaultStrategy = createStrategy(PlanIslandChainsContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const {
      landMask,
      boundaryCloseness,
      boundaryType,
      volcanism,
      movementU,
      movementV,
    } = validateIslandInputs(input);

    const rng = createLabelRng(input.rngSeed | 0);
    const perlin = new PerlinNoise((input.rngSeed | 0) ^ 0x5f356495);
    const noiseScale = 0.1;
    const islandsCfg = config.islands;
    const {
      threshold,
      minDist,
      baseDenActive,
      baseDenElse,
      hotspotDenom,
      microcontinentChance,
    } = normalizeIslandTunables(config);

    const edits: IslandEdit[] = [];
    const plannedMask = new Uint8Array(Math.max(0, (width | 0) * (height | 0)));
    const seedSpacing = Math.max(
      2,
      Math.min(12, Math.ceil(Math.max(minDist, islandsCfg.clusterMax) * 0.75))
    );

    for (let y = 2; y < height - 2; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 1) continue;
        if (!isFarEnoughFromMask({ mask: landMask, index: i, width, height, radius: minDist })) {
          continue;
        }
        if (
          !isFarEnoughFromMask({
            mask: plannedMask,
            index: i,
            width,
            height,
            radius: seedSpacing,
          })
        ) {
          continue;
        }

        const noise = perlin.noise2D(x * noiseScale, y * noiseScale);
        const noiseValue = Math.max(0, Math.min(1, (noise + 1) / 2));
        const closenessNorm = boundaryCloseness[i] / 255;
        const bType = boundaryType[i] | 0;
        const nearActive =
          bType === BOUNDARY_CONVERGENT || bType === BOUNDARY_TRANSFORM || closenessNorm >= 0.4;
        const baseDen = nearActive ? baseDenActive : baseDenElse;
        const hotspotSignal = (volcanism[i] ?? 0) / 255;
        const allowSeed = shouldSeedIsland({
          noiseValue,
          threshold,
          baseDenom: baseDen,
          hotspotSignal,
          hotspotDenom,
          microcontinentChance,
          rng,
        });
        if (!allowSeed) continue;

        const kind = selectIslandKind({
          hotspotSignal,
          rng,
        });

        const direction = resolveChainDirection({
          index: i,
          width,
          height,
          boundaryCloseness,
          movementU,
          movementV,
          hotspotSignal,
          rngSeed: input.rngSeed | 0,
        });

        const count = resolveClusterCount(islandsCfg, rng);
        let current = i;
        let previous = -1;
        for (let n = 0; n < count; n++) {
          const localHotspotSignal = (volcanism[current] ?? 0) / 255;
          const editKind =
            n === 0
              ? kind
              : localHotspotSignal >= 0.72 && rng(1000, "island-chain-peak") < 260
                ? "peak"
                : "coast";
          const added = addIslandEdit({
            edits,
            plannedMask,
            landMask,
            index: current,
            kind: editKind,
          });
          if (!added) break;

          if (count >= 4 && rng(100, "island-side-lobe") < 34) {
            let sideIndex = -1;
            let sideScore = -Infinity;
            const cx = current % width;
            const cy = (current / width) | 0;
            forEachHexNeighborOddQ(cx, cy, width, height, (nx, ny) => {
              const candidate = ny * width + nx;
              if (candidate === previous) return;
              if (landMask[candidate] === 1 || plannedMask[candidate] === 1) return;
              if (
                minDist > 0 &&
                !isFarEnoughFromMask({
                  mask: landMask,
                  index: candidate,
                  width,
                  height,
                  radius: minDist,
                })
              ) {
                return;
              }
              const nVec = neighborVector({ x: cx, y: cy, nx, ny, width });
              if (!nVec) return;
              const score =
                1 - Math.abs(dot(nVec, direction)) +
                ((boundaryCloseness[candidate] ?? 0) / 255) * 0.08 +
                ((volcanism[candidate] ?? 0) / 255) * 0.12;
              if (score > sideScore || (score === sideScore && candidate < sideIndex)) {
                sideScore = score;
                sideIndex = candidate;
              }
            });
            if (sideIndex >= 0) {
              addIslandEdit({
                edits,
                plannedMask,
                landMask,
                index: sideIndex,
                kind: "coast",
              });
            }
          }

          const next = chooseNextChainTile({
            current,
            previous,
            direction,
            width,
            height,
            landMask,
            plannedMask,
            boundaryCloseness,
            volcanism,
            minDist,
            perlin,
            step: n,
          });
          if (next < 0) break;
          previous = current;
          current = next;
        }
      }
    }

    return { edits };
  },
});
