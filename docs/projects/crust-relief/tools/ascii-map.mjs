// ASCII map renderer for crust-relief before/after review.
// Usage: node ascii-map.mjs <runDir> [mode]   mode = drown (default) | elev | crust
// Symbol legend (drown mode) makes "drowned continental platforms" visible:
//   ^  continental LAND, high   (topo elev > +15)        — real relief
//   #  continental LAND, low    (0..+15)
//   +  continental SUBMERGED    (continental crust under water)  <-- the villain
//   :  oceanic shallow/coast water
//   .  oceanic deep
//   o  oceanic LAND (rare)
import { readFileSync } from "node:fs";
import { join } from "node:path";

const runDir = process.argv[2];
const mode = process.argv[3] || "drown";
const m = JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"));
const pick = (k) => {
  const a = m.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === k);
  return a.length ? a.slice().sort((x, y) => (y.stepIndex ?? 0) - (x.stepIndex ?? 0))[0] : null;
};
const rd = (k, kind) => {
  const l = pick(k);
  if (!l) return null;
  const b = readFileSync(join(runDir, l.field.data.path));
  const d = l.dims;
  if (kind === "u8")
    return { v: new Uint8Array(b.buffer, b.byteOffset, b.byteLength), w: d.width, h: d.height };
  return {
    v: new Int16Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 2)),
    w: d.width,
    h: d.height,
  };
};

const land = rd("map.morphology.continents.landMask", "u8");
const crust = rd("foundation.crustTiles.type", "u8");
const shelf = rd("map.morphology.coasts.shelfMask", "u8");
const coastal = rd("map.morphology.coasts.coastalWater", "u8");
const elev = rd("morphology.topography.elevation", "i16");
const W = land.w,
  H = land.h;
const isCoast = (i) => (shelf && shelf.v[i] === 1) || (coastal && coastal.v[i] === 1);

let contLand = 0,
  contSub = 0,
  ocLand = 0,
  ocWater = 0,
  contHigh = 0;
const lines = [];
for (let y = 0; y < H; y++) {
  let row = y & 1 ? " " : ""; // odd-row hex offset
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const isLand = land.v[i] === 1;
    const isCont = crust ? crust.v[i] === 1 : 0;
    const e = elev ? elev.v[i] : 0;
    let ch;
    if (mode === "crust") {
      ch = isCont ? (isLand ? "C" : "c") : isLand ? "O" : ".";
    } else if (mode === "elev") {
      if (!isLand) ch = isCoast(i) ? ":" : ".";
      else if (e > 30) ch = "@";
      else if (e > 15) ch = "^";
      else if (e > 5) ch = "#";
      else ch = "-";
    } else {
      // drown mode
      if (isLand) {
        if (isCont) {
          contLand++;
          if (e > 15) {
            ch = "^";
            contHigh++;
          } else ch = "#";
        } else {
          ocLand++;
          ch = "o";
        }
      } else {
        if (isCont) {
          contSub++;
          ch = "+";
        } else {
          ocWater++;
          ch = isCoast(i) ? ":" : ".";
        }
      }
    }
    row += ch;
  }
  lines.push(row);
}
console.log(lines.join("\n"));
if (mode === "drown") {
  const contTot = contLand + contSub;
  console.error(
    `\n[drown] contLand=${contLand} (high ^=${contHigh}) contSubmerged +=${contSub} ` +
      `(${((100 * contSub) / contTot).toFixed(1)}% of continental) ocLand o=${ocLand} ocWater=${ocWater}  ${W}x${H}`
  );
}
