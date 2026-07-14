/** Injects the canonical configured map-size identity read into Civ7 wire commands. */
export function canonicalMapSizeTypeScriptSource(): string {
  return `const readCanonicalMapSizeType = () => {
    const rawMapSize = Configuration.getMap().mapSize;
    const lookupMapSize = typeof rawMapSize === "string" && /^\\d+$/.test(rawMapSize.trim())
      ? Number(rawMapSize)
      : rawMapSize;
    let row = GameInfo.Maps.lookup(lookupMapSize);
    if ((!row || typeof row.MapSizeType !== "string") && lookupMapSize !== rawMapSize) {
      row = GameInfo.Maps.lookup(rawMapSize);
    }
    if (!row || typeof row.MapSizeType !== "string") {
      throw new Error("GameInfo.Maps did not resolve the configured map size type");
    }
    return row.MapSizeType;
  };`;
}
