export { cachePath, ensurePatternCacheRoot } from "./cache.js";
export {
  type HabitatDirectoryEntry,
  type HabitatPathKind,
  hashFileSync,
  isDirectory,
  isFile,
  makeDirectory,
  pathExistsSync,
  readDirectory,
  readDirectoryNoFollow,
  readPathKind,
  readText,
  writeText,
} from "./filesystem.js";
export {
  type HabitatFileSystemReadPort,
  HabitatPlatform,
  HabitatPlatformLive,
  type HabitatPlatformService,
  type HabitatStructureFileSystemReadPort,
  makeHabitatPlatformLayer,
  makeHabitatPlatformService,
} from "./service.js";
export { acquireTempDirectory } from "./temp-dir.js";
export { currentTimeMillis, epochMillisToIsoString } from "./time.js";
