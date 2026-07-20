#!/usr/bin/env bun
//
// render-terrain-matrix — build-free 4x4 terrain montage (SVG + embedded PNG tiles) for
// the crust-relief deep-ocean fix. Each cell is the FINAL terrain of one (map-type, seed)
// rendered by terrain class (deep ocean / coast / land / mountain), so the deep-vs-coast
// story is visible at a glance. Rows = map types, columns = seeds.
//
//   cd mods/mod-swooper-maps && bun scripts/diag/render-terrain-matrix.ts
//
// Env: MATRIX_W/MATRIX_H (default 84x54 STANDARD), MATRIX_CELL (px per tile, default 4),
//      MATRIX_OUT (svg path, default docs/projects/crust-relief/renders/terrain-matrix.svg)
//
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";
import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  createFinalSurfaceParityMapInfo,
  runLocalFinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity.js";
import { admitStandardMapConfig } from "../../src/maps/configs/canonical.js";

const W = process.env.MATRIX_W ? Number(process.env.MATRIX_W) : 84;
const H = process.env.MATRIX_H ? Number(process.env.MATRIX_H) : 54;
const CELL = process.env.MATRIX_CELL ? Number(process.env.MATRIX_CELL) : 4;

// Rows = map configs; columns = seeds. A 4x4 that contrasts deep-ocean (earthlike) vs
// coast-heavy (archipelago) under the SAME strategy, plus two more identities.
const ROWS = [
  { type: "swooper-earthlike", label: "earthlike" },
  { type: "sundered-archipelago", label: "archipelago" },
  { type: "shattered-ring", label: "shattered-ring" },
  { type: "swooper-desert-mountains", label: "desert-mtns" },
];
const SEEDS = [1018, 1337, 42, 7];

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const cfgPath = (id: string) =>
  resolve(repoRoot, `mods/mod-swooper-maps/src/maps/configs/${id}.config.json`);

// ── minimal PNG encoder (RGBA, no deps) ──────────────────────────────────────────────
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePng(rgba: Buffer, iw: number, ih: number): Buffer {
  const stride = iw * 4 + 1;
  const raw = Buffer.alloc(stride * ih);
  for (let y = 0; y < ih; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * iw * 4, (y + 1) * iw * 4);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(iw, 0);
  ihdr.writeUInt32BE(ih, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function main(): void {
  const { mapInfo, mapSizeId } = createFinalSurfaceParityMapInfo(W, H);
  const probe = createMockAdapter({
    width: W,
    height: H,
    mapInfo,
    mapSizeId,
    rng: createLabelRng(1),
  });
  const T = (n: string) => probe.getTerrainTypeIndex(n);
  const OCEAN = T("TERRAIN_OCEAN"),
    COAST = T("TERRAIN_COAST"),
    MOUNT = T("TERRAIN_MOUNTAIN");
  const HILL = T("TERRAIN_HILL"),
    NAVR = T("TERRAIN_NAVIGABLE_RIVER");
  // terrain class -> RGB. Deep ocean dark, coast pale blue, land greens, mountains grey.
  const colorFor = (v: number | null): [number, number, number] => {
    if (v === null || v === undefined) return [0, 0, 0];
    if (v === OCEAN) return [18, 34, 84];
    if (v === COAST) return [120, 184, 214];
    if (v === NAVR) return [70, 130, 190];
    if (v === MOUNT) return [148, 142, 138];
    if (v === HILL) return [150, 140, 96];
    return [104, 150, 92]; // flat / other land
  };

  const IW = W * CELL,
    IH = H * CELL;
  type Cell = { row: number; col: number; label: string; deep: number; png: string };
  const cells: Cell[] = [];

  for (let r = 0; r < ROWS.length; r++) {
    const config = admitStandardMapConfig(JSON.parse(readFileSync(cfgPath(ROWS[r]!.type), "utf8")));
    for (let c = 0; c < SEEDS.length; c++) {
      const seed = SEEDS[c]!;
      const snap = runLocalFinalSurfaceSnapshot({ width: W, height: H, seed, config });
      const adapter = createMockAdapter({
        width: W,
        height: H,
        mapInfo,
        mapSizeId,
        rng: createLabelRng(seed),
      });
      const idx = (n: string) => adapter.getTerrainTypeIndex(n);
      const vOCEAN = idx("TERRAIN_OCEAN"),
        vCOAST = idx("TERRAIN_COAST");
      const vals = snap.surfaces.terrain.values;
      let ocean = 0,
        coast = 0;
      const rgba = Buffer.alloc(IW * IH * 4);
      for (let y = 0; y < IH; y++) {
        const gy = (y / CELL) | 0;
        for (let x = 0; x < IW; x++) {
          const gx = (x / CELL) | 0;
          const v = vals[gy * W + gx] ?? null;
          if (v === vOCEAN) ocean++;
          else if (v === vCOAST) coast++;
          const [rr, gg, bb] = colorFor(v);
          const o = (y * IW + x) * 4;
          rgba[o] = rr;
          rgba[o + 1] = gg;
          rgba[o + 2] = bb;
          rgba[o + 3] = 255;
        }
      }
      // ocean/coast counted over the upscaled image -> divide out CELL^2 implicitly via ratio
      const water = ocean + coast;
      const deep = water === 0 ? 0 : +((100 * ocean) / water).toFixed(0);
      const png = encodePng(rgba, IW, IH).toString("base64");
      cells.push({ row: r, col: c, label: `${ROWS[r]!.label} · s${seed}`, deep, png });
    }
  }

  // ── compose SVG ──
  const PAD = 10,
    HEADER = 26,
    LBL = 18,
    GAP = 8,
    TITLE = 40;
  const cw = IW,
    ch = IH + LBL;
  const gridW = SEEDS.length * cw + (SEEDS.length - 1) * GAP;
  const gridH = ROWS.length * ch + (ROWS.length - 1) * GAP;
  const svgW = PAD * 2 + gridW;
  const svgH = TITLE + HEADER + gridH + PAD;
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" font-family="ui-sans-serif,system-ui,sans-serif">`
  );
  parts.push(`<rect width="${svgW}" height="${svgH}" fill="#0e1116"/>`);
  parts.push(
    `<text x="${PAD}" y="26" fill="#e6e6e6" font-size="18" font-weight="700">Crust-relief deep-ocean fix — final terrain (${W}×${H})</text>`
  );
  // column headers (seeds)
  for (let c = 0; c < SEEDS.length; c++) {
    const cx = PAD + c * (cw + GAP) + cw / 2;
    parts.push(
      `<text x="${cx}" y="${TITLE + 18}" fill="#9aa4b2" font-size="13" text-anchor="middle">seed ${SEEDS[c]}</text>`
    );
  }
  for (const cell of cells) {
    const x = PAD + cell.col * (cw + GAP);
    const y = TITLE + HEADER + cell.row * (ch + GAP);
    parts.push(
      `<image x="${x}" y="${y}" width="${cw}" height="${IH}" image-rendering="pixelated" href="data:image/png;base64,${cell.png}"/>`
    );
    parts.push(
      `<rect x="${x}" y="${y}" width="${cw}" height="${IH}" fill="none" stroke="#2a2f3a" stroke-width="1"/>`
    );
    const deepColor = cell.deep >= 40 ? "#7fd1a6" : "#d9a05b";
    parts.push(
      `<text x="${x + 4}" y="${y + IH + 13}" fill="#c9d1d9" font-size="12">${cell.label}</text>`
    );
    parts.push(
      `<text x="${x + cw - 4}" y="${y + IH + 13}" fill="${deepColor}" font-size="12" text-anchor="end" font-weight="700">${cell.deep}% deep</text>`
    );
  }
  parts.push(`</svg>`);
  const svg = parts.join("\n");

  const outSvg = process.env.MATRIX_OUT
    ? resolve(process.cwd(), process.env.MATRIX_OUT)
    : resolve(repoRoot, "docs/projects/crust-relief/renders/terrain-matrix.svg");
  mkdirSync(dirname(outSvg), { recursive: true });
  writeFileSync(outSvg, svg, "utf8");
  console.log(JSON.stringify({ ok: true, svg: outSvg, bytes: svg.length, cells: cells.length }));
}

main();
