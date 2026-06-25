import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clamp01, clampInt16 } from "@swooper/mapgen-core/lib/math";

import ComputeSculptContinentalMarginContract from "../contract.js";
import {
  byteToUnit,
  computeApronLengthScale,
  deriveApronAnchorCeiling,
  deriveBreakElevation,
  evaluateApronTarget,
  evaluateSlopeTarget,
  MARGIN_UNREACHED,
  validateSculptInputs,
} from "../rules/index.js";

const CRUST_CONTINENTAL = 1;

export const defaultStrategy = createStrategy(ComputeSculptContinentalMarginContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const {
      size,
      relief,
      elevation: baseElevation,
      crustType,
      crustAge,
      crustBuoyancy,
      boundaryCloseness,
      boundaryType,
    } = validateSculptInputs(input);

    const elevation = new Int16Array(size);
    elevation.set(baseElevation);

    // OCEANWARD (slope) field: hop-distance over OCEANIC crust from the crust-type break.
    const marginHopDistance = new Uint16Array(size);
    marginHopDistance.fill(MARGIN_UNREACHED);
    const apronLengthScale = new Float32Array(size);

    // SHOREWARD (apron) field: hop-distance over CONTINENTAL crust from the same break, plus the
    // per-seed apron length scale and shore anchor carried inland over continental crust only.
    const shorewardHop = new Uint16Array(size);
    shorewardHop.fill(MARGIN_UNREACHED);
    const shorewardApronLength = new Float32Array(size);
    const shoreAnchor = new Float32Array(size);

    const breakElevation = deriveBreakElevation(relief, config);
    const anchorCeil = deriveApronAnchorCeiling(relief, config);

    // 1a) Seed the OCEANWARD BFS: oceanic tiles adjacent to continental crust are break-edge
    //     seeds at hop 0. Crust type is datum-free (fixed before sea level is solved), so this
    //     coordinate cannot be tainted by the datum trap. Each seed carries its margin's
    //     physical apron length scale, propagated to every oceanic tile it floods.
    const oceanQueue = new Int32Array(size);
    let oHead = 0;
    let oTail = 0;

    // 1b) Seed the SHOREWARD BFS: continental tiles adjacent to oceanic crust are break-edge
    //     seeds at hop 0. Each seed carries its margin's apron length scale and a shore anchor
    //     (the local submerged-continental elevation, raised toward the ramp but capped below
    //     land), propagated inland over continental crust only.
    const landQueue = new Int32Array(size);
    let lHead = 0;
    let lTail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const isContinental = crustType[i] === CRUST_CONTINENTAL;
        let adjacentToOther = false;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          if (adjacentToOther) return;
          const neighborContinental = crustType[ny * width + nx] === CRUST_CONTINENTAL;
          if (neighborContinental !== isContinental) adjacentToOther = true;
        });
        if (!adjacentToOther) continue;

        const apronLength = computeApronLengthScale({
          boundaryTypeCode: boundaryType[i] | 0,
          closenessNorm: byteToUnit(boundaryCloseness[i] ?? 0),
          ageNorm: byteToUnit(crustAge[i] ?? 0),
          buoyancyNorm: crustBuoyancy[i] ?? 0,
          config,
        });

        if (isContinental) {
          // Continental break-edge seed -> shoreward (apron) flood.
          shorewardHop[i] = 0;
          shorewardApronLength[i] = apronLength;
          shoreAnchor[i] = Math.min(
            anchorCeil,
            Math.max(breakElevation + 1, baseElevation[i] ?? 0)
          );
          landQueue[lTail++] = i;
        } else {
          // Oceanic break-edge seed -> oceanward (slope) flood.
          marginHopDistance[i] = 0;
          apronLengthScale[i] = apronLength;
          oceanQueue[oTail++] = i;
        }
      }
    }

    // 2a) Flood the oceanward hop + apron length scale over OCEANIC tiles only.
    while (oHead < oTail) {
      const idx = oceanQueue[oHead++]!;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      const nextHop = (marginHopDistance[idx] + 1) as number;
      const carriedLength = apronLengthScale[idx];
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (crustType[ni] === CRUST_CONTINENTAL) return; // never flood onto continental crust
        if (marginHopDistance[ni] <= nextHop) return;
        marginHopDistance[ni] = nextHop;
        apronLengthScale[ni] = carriedLength;
        oceanQueue[oTail++] = ni;
      });
    }

    // 2b) Flood the shoreward hop + apron length scale + shore anchor over CONTINENTAL tiles only.
    while (lHead < lTail) {
      const idx = landQueue[lHead++]!;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      const nextHop = (shorewardHop[idx] + 1) as number;
      const carriedLength = shorewardApronLength[idx];
      const carriedAnchor = shoreAnchor[idx];
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (crustType[ni] !== CRUST_CONTINENTAL) return; // apron lives only on continental crust
        if (shorewardHop[ni] <= nextHop) return;
        shorewardHop[ni] = nextHop;
        shorewardApronLength[ni] = carriedLength;
        shoreAnchor[ni] = carriedAnchor;
        landQueue[lTail++] = ni;
      });
    }

    // 3) Carve the profile. APRON (continental crust): WRITE-TOWARD a coherent shoaling ramp,
    //    blended full at the break edge and fading shoreward, clamped to the anchor ceiling so it
    //    can RAISE too-deep noise into a real shelf but never above the submerged-shelf ceiling
    //    (stays underwater). SLOPE (oceanic crust): CARVE-DOWN (min) toward the real oceanic
    //    floor, preserving any pre-existing deeper structure (trenches, ridges).
    for (let i = 0; i < size; i++) {
      const existing = baseElevation[i] ?? 0;
      if (crustType[i] === CRUST_CONTINENTAL) {
        const hop = shorewardHop[i];
        const L = Math.max(0.25, shorewardApronLength[i]);
        // The apron only occupies the submerged OUTER margin within the apron run [0, L].
        // Continental interior (unreached, or shoreward of the apron run) is left untouched so
        // the apron coalesces the drowned outer shelf WITHOUT collapsing the highlands.
        if (hop === MARGIN_UNREACHED || hop > L) {
          elevation[i] = clampInt16(existing);
          continue;
        }
        const target = evaluateApronTarget({
          hop,
          apronLength: L,
          shoreAnchor: shoreAnchor[i],
          relief,
          config,
        });
        // Cap the apron target at the anchor ceiling so the coalesced shelf stays below land
        // (underwater by construction). The ceiling bounds the apron RAMP, not the terrain.
        const cappedTarget = Math.min(target, anchorCeil);
        const blend = config.apronBlendStrength * clamp01(1 - hop / L);
        const carved = existing + (cappedTarget - existing) * blend;
        // Write-toward is RAISE-ONLY on the apron: it lifts too-deep noise into a coherent shelf
        // but never lowers a tile that is already shallower than the ramp (that is the slope's
        // job, on oceanic crust). This guarantees the apron never deepens land toward the break.
        elevation[i] = clampInt16(Math.round(Math.max(existing, carved)));
      } else {
        const hop = marginHopDistance[i];
        if (hop === MARGIN_UNREACHED) {
          elevation[i] = clampInt16(existing);
          continue;
        }
        const target = evaluateSlopeTarget({ hop, apronLength: apronLengthScale[i], relief, config });
        elevation[i] = clampInt16(Math.round(Math.min(existing, target)));
      }
    }

    return { elevation, marginHopDistance, apronLengthScale };
  },
});
