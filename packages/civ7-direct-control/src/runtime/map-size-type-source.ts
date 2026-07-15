/** Injects the canonical map-size identity read across App UI and Tuner scripting states. */
export function canonicalMapSizeTypeScriptSource(): string {
  return `const readCanonicalMapSizeType = () => {
    const isCanonicalMapSizeType = (value) =>
      typeof value === "string" && /^MAPSIZE_[A-Z0-9_]+$/.test(value);
    const hasConfiguredMap =
      typeof Configuration !== "undefined" &&
      Configuration !== null &&
      typeof Configuration.getMap === "function";
    let rawMapSize;
    if (hasConfiguredMap) {
      const mapConfig = Configuration.getMap();
      const configuredType = mapConfig && mapConfig.mapSizeTypeName;
      if (isCanonicalMapSizeType(configuredType)) return configuredType;
      rawMapSize = mapConfig && mapConfig.mapSize;
    } else if (
      typeof GameplayMap !== "undefined" &&
      GameplayMap !== null &&
      typeof GameplayMap.getMapSize === "function"
    ) {
      rawMapSize = GameplayMap.getMapSize();
    }
    const lookupMapSize = typeof rawMapSize === "string" && /^\\d+$/.test(rawMapSize.trim())
      ? Number(rawMapSize)
      : rawMapSize;
    const maps = typeof GameInfo !== "undefined" && GameInfo && GameInfo.Maps;
    if (rawMapSize !== undefined && rawMapSize !== null && maps && typeof maps.lookup === "function") {
      let row = maps.lookup(lookupMapSize);
      if (!isCanonicalMapSizeType(row && row.MapSizeType) && lookupMapSize !== rawMapSize) {
        row = maps.lookup(rawMapSize);
      }
      const resolvedType = row && row.MapSizeType;
      if (isCanonicalMapSizeType(resolvedType)) return resolvedType;
    }
    throw new Error("Civ7 did not expose a canonical map size type");
  };`;
}
