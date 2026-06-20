export { cachePath, ensurePatternCacheRoot } from "./cache.js";
export {
  HabitatClock,
  HabitatClockLive,
  type HabitatClockService,
  makeFakeHabitatClockLayer,
} from "./clock.js";
export {
  type HabitatDirectoryEntry,
  HabitatFileSystem,
  HabitatFileSystemLive,
  type HabitatFileSystemService,
  makeFakeHabitatFileSystemLayer,
} from "./filesystem.js";
export {
  makeFakeResourceScopeLayer,
  ResourceScope,
  ResourceScopeLive,
  type ResourceScopeService,
} from "./scope.js";
export { acquireTempDirectory } from "./temp-dir.js";
export { WorkspaceLock, WorkspaceLockLive, type WorkspaceLockService } from "./workspace-lock.js";
export { HabitatWriteSet, HabitatWriteSetLive, type HabitatWriteSetService } from "./write-set.js";
