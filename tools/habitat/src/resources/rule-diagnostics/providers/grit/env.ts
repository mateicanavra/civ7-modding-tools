/** Hermetic provider environment, including a fixed two-thread native Grit worker pool. */
export const gritHermeticEnv = {
  CLICOLOR: "0",
  FORCE_COLOR: "0",
  NO_COLOR: "1",
  GRIT_DOWNLOADS_DISABLED: "true",
  GRIT_TELEMETRY_DISABLED: "true",
  GRIT_MAX_FILE_SIZE_BYTES: "0",
  RAYON_NUM_THREADS: "2",
} as const;
