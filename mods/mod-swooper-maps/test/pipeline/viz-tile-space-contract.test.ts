import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { HEX_ODD_Q_TILE_SPACE_ID } from "@swooper/mapgen-core/lib/grid";

function collectTypeScriptFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...collectTypeScriptFiles(path));
    else if (path.endsWith(".ts")) out.push(path);
  }
  return out;
}

describe("standard recipe visualization tile space", () => {
  it("emits standard tile grids in the same odd-q coordinate space used by generation", () => {
    const files = collectTypeScriptFiles("mods/mod-swooper-maps/src/recipes/standard");
    const offenders = files.filter((file) => readFileSync(file, "utf8").includes("tile.hexOddR"));

    expect(HEX_ODD_Q_TILE_SPACE_ID).toBe("tile.hexOddQ");
    expect(offenders).toEqual([]);
  });
});
