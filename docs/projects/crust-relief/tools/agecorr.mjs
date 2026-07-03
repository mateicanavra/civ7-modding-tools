import { readFileSync } from "node:fs";
import { join } from "node:path";

const runDir = process.argv[2];
const m = JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"));
const pick = (k) => {
  const a = m.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === k);
  return a.length ? a.slice().sort((x, y) => (y.stepIndex ?? 0) - (x.stepIndex ?? 0))[0] : null;
};
const rd = (k, kind) => {
  const l = pick(k);
  if (!l) return null;
  const b = readFileSync(join(runDir, l.field.data.path));
  if (kind === "u8") return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  if (kind === "i16") return new Int16Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 2));
  return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 4));
};
const type = rd("foundation.crustTiles.type", "u8");
const buoy = rd("foundation.crustTiles.buoyancy", "f32");
const age = rd("foundation.crustTiles.age", "u8");
const topo = rd("morphology.topography.elevation", "i16");
const N = type.length;
// bucket continental crust by thermalAge, report mean buoyancy + mean topo elev + count
const buckets = {};
for (let i = 0; i < N; i++) {
  if (type[i] !== 1) continue;
  const a01 = age[i] / 255;
  const b =
    a01 < 0.2
      ? "age<0.2"
      : a01 < 0.4
        ? "0.2-0.4"
        : a01 < 0.6
          ? "0.4-0.6"
          : a01 < 0.8
            ? "0.6-0.8"
            : "0.8+";
  buckets[b] ??= { n: 0, buoy: 0, topo: 0 };
  buckets[b].n++;
  buckets[b].buoy += buoy[i];
  buckets[b].topo += topo[i];
}
console.log("CONTINENTAL crust by thermalAge bucket (mean buoyancy, mean topo-elevation):");
for (const k of ["age<0.2", "0.2-0.4", "0.4-0.6", "0.6-0.8", "0.8+"]) {
  const v = buckets[k];
  if (!v) {
    console.log(`  ${k}: (none)`);
    continue;
  }
  console.log(
    `  ${k}: n=${String(v.n).padStart(5)}  meanBuoy=${(v.buoy / v.n).toFixed(3)}  meanTopoElev=${(v.topo / v.n).toFixed(1)}`
  );
}
// also overall continental age distribution
const ages = [];
for (let i = 0; i < N; i++) if (type[i] === 1) ages.push(age[i] / 255);
ages.sort((a, b) => a - b);
const qq = (p) => ages[Math.floor(p * (ages.length - 1))];
console.log(
  "\ncontinental thermalAge percentiles:",
  JSON.stringify({ p10: +qq(0.1).toFixed(2), p50: +qq(0.5).toFixed(2), p90: +qq(0.9).toFixed(2) })
);
