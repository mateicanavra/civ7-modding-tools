/** Schema version for deterministic installed-source receipts. */
export const SOURCE_RECEIPT_SCHEMA_VERSION = 2 as const;

/** Name of the receipt stored beside the admitted official resource tree. */
export const SOURCE_RECEIPT_FILE = ".civ7-source-receipt.json" as const;

/** Stable identity for the evidence profile used by the API authority. */
export const SOURCE_PROFILE_ID = "civ7-official-api-v1" as const;

/** Roots admitted from the installed Civ7 Resources directory. */
export const SOURCE_ROOTS = ["Base", "DLC"] as const;

/** Exact large or non-source path segments excluded from API evidence. */
export const EXCLUDED_SEGMENT_PATHS = [
  "Platforms",
  "movies",
  "data/icons",
  "fonts",
  "Assets/Benchmark",
  "Assets/Legal",
] as const;

/** Exact installed resource basenames excluded from API evidence. */
export const EXCLUDED_BASENAMES = ["Assets.car", "AppIcon.icns", "default.metallib"] as const;

/** Media and binary extensions excluded from API evidence. */
export const EXCLUDED_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".mov",
  ".ogg",
  ".mp3",
  ".wav",
  ".dds",
  ".png",
  ".ttf",
  ".otf",
] as const;

export interface InstalledApplicationIdentity {
  readonly bundleIdentifier: string;
  readonly version: string;
  readonly bundleVersion: string;
  readonly longVersion: string;
}

export interface SteamInstallationIdentity {
  readonly appId: string;
  readonly buildId: string;
  readonly installDirectory: string;
  readonly lastUpdated: string;
  readonly depots: readonly {
    readonly id: string;
    readonly manifest: string;
  }[];
  readonly state: {
    readonly flags: string;
    readonly updateResult: string;
    readonly targetBuildId: string;
    readonly download: {
      readonly expectedBytes: string;
      readonly completedBytes: string;
    };
    readonly staging: {
      readonly expectedBytes: string;
      readonly completedBytes: string;
      readonly remainingBytes: string;
    };
  };
}

export interface SourceIdentity {
  readonly application: InstalledApplicationIdentity;
  readonly steam: SteamInstallationIdentity;
}

export interface SnapshotFile {
  readonly path: string;
  readonly size: number;
  readonly sha256: string;
}

export interface SourceMapEvidence {
  readonly fileCount: number;
  readonly sourceCount: number;
  readonly embeddedSourceCount: number;
  readonly missingSourceContentCount: number;
}

export interface SourceReceipt {
  readonly schemaVersion: typeof SOURCE_RECEIPT_SCHEMA_VERSION;
  readonly source: SourceIdentity;
  readonly profile: {
    readonly id: typeof SOURCE_PROFILE_ID;
    readonly sha256: string;
    readonly roots: typeof SOURCE_ROOTS;
    readonly excludedSegmentPaths: typeof EXCLUDED_SEGMENT_PATHS;
    readonly excludedBasenames: typeof EXCLUDED_BASENAMES;
    readonly excludedExtensions: typeof EXCLUDED_EXTENSIONS;
    readonly excludedBasenamePrefixes: readonly ["ShaderAutoGen_"];
  };
  readonly snapshot: {
    readonly fileCount: number;
    readonly totalBytes: number;
    readonly sha256: string;
  };
  readonly sourceMaps: SourceMapEvidence;
}
