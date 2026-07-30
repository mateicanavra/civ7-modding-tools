import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

export const pinnedGritIdentity = {
  packageVersion: "0.1.0-alpha.1743007075",
  nativeVersion: "grit 0.1.1",
} as const;

const moduleRequire = createRequire(import.meta.url);

export function pinnedGritPackagePath(): string {
  return moduleRequire.resolve("@getgrit/cli/package.json");
}

export function pinnedGritNativePath(): string {
  return path.join(
    path.dirname(pinnedGritPackagePath()),
    "node_modules",
    ".bin_real",
    process.platform === "win32" ? "grit.exe" : "grit"
  );
}

/**
 * Explicitly realizes the pinned native dependency in Habitat's installed module graph.
 * Rule execution itself remains download-disabled and only accepts the resulting native binary.
 */
export function acquirePinnedGrit(): void {
  const packagePath = pinnedGritPackagePath();
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as { version?: string };
  if (packageJson.version !== pinnedGritIdentity.packageVersion) {
    throw new Error(
      `Pinned Grit package identity mismatch: expected ${pinnedGritIdentity.packageVersion}, observed ${packageJson.version ?? "no version"}.`
    );
  }

  const wrapperPath = path.join(path.dirname(packagePath), "run-grit.js");
  const version = execFileSync(process.execPath, [wrapperPath, "--version"], {
    encoding: "utf8",
    env: { ...process.env, GRIT_TELEMETRY_DISABLED: "true" },
  }).trim();
  if (version !== pinnedGritIdentity.nativeVersion) {
    throw new Error(
      `Pinned Grit native identity mismatch: expected ${pinnedGritIdentity.nativeVersion}, observed ${version || "no version"}.`
    );
  }
}
