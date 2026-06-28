// Render a dump's elevation+landMask to a PNG (hypsometric tint) for before/after review.
// Usage: node render-png.mjs <runDir> <out.png> [cell]
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

const runDir = process.argv[2];
const outPath = process.argv[3];
const CELL = parseInt(process.argv[4] || "8", 10);
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
const elevL = rd("morphology.topography.elevation", "i16");
const land = rd("map.morphology.continents.landMask", "u8");
const W = elevL.w,
  H = elevL.h;
const elev = elevL.v,
  lm = land.v;

// sea level ≈ highest water tile elevation (the waterline)
let seaLevel = -32768;
for (let i = 0; i < W * H; i++) if (lm[i] === 0 && elev[i] > seaLevel) seaLevel = elev[i];

function color(i) {
  const e = elev[i];
  if (lm[i] === 0) {
    const depth = seaLevel - e; // >=0
    if (depth > 55) return [16, 28, 72];
    if (depth > 22) return [33, 66, 140];
    if (depth > 8) return [60, 120, 195];
    return [130, 192, 220]; // shelf/coast
  }
  const h = e - seaLevel;
  if (h <= 6) return [96, 152, 84];
  if (h <= 16) return [142, 172, 92];
  if (h <= 32) return [176, 148, 96];
  if (h <= 55) return [150, 112, 74];
  if (h <= 78) return [120, 96, 78];
  return [225, 222, 212]; // peaks
}

const IW = W * CELL,
  IH = H * CELL;
// raw RGBA scanlines with filter byte 0
const stride = IW * 4 + 1;
const raw = Buffer.alloc(stride * IH);
for (let y = 0; y < IH; y++) {
  raw[y * stride] = 0;
  const gy = (y / CELL) | 0;
  for (let x = 0; x < IW; x++) {
    const gx = (x / CELL) | 0;
    const [r, g, b] = color(gy * W + gx);
    const o = y * stride + 1 + x * 4;
    raw[o] = r;
    raw[o + 1] = g;
    raw[o + 2] = b;
    raw[o + 3] = 255;
  }
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td) >>> 0, 0);
  return Buffer.concat([len, td, crc]);
}
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}
const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(IW, 0);
ihdr.writeUInt32BE(IH, 4);
ihdr[8] = 8;
ihdr[9] = 6; // 8-bit RGBA
const png = Buffer.concat([
  sig,
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync(outPath, png);
console.error(`wrote ${outPath} ${IW}x${IH} seaLevel=${seaLevel}`);
