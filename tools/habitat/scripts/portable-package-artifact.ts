import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const repoRoot = path.resolve(import.meta.dirname, "../../..");
export const packageRoot = path.join(repoRoot, "tools/habitat");

const packageManifest = JSON.parse(
  readFileSync(path.join(packageRoot, "package.json"), "utf8")
) as {
  files: string[];
  name: string;
  version: string;
};

export const archiveName = `${packageManifest.name
  .replace(/^@/, "")
  .replace("/", "-")}-${packageManifest.version}.tgz`;
export const artifactRoot = path.join(packageRoot, "artifacts");
export const archivePath = path.join(artifactRoot, archiveName);
export const checksumPath = `${archivePath}.sha256`;
export const executablePackageFiles = new Set(["bin/run.js"]);

export function packArchive(destination: string): string {
  const stagingParent = mkdtempSync(path.join(tmpdir(), "habitat-package-stage-"));
  const stagedPackageRoot = path.join(stagingParent, "package");

  try {
    mkdirSync(stagedPackageRoot, { recursive: true, mode: 0o755 });
    cpSync(path.join(packageRoot, "package.json"), path.join(stagedPackageRoot, "package.json"));
    for (const packagedPath of packageManifest.files) {
      const stagedPath = path.join(stagedPackageRoot, packagedPath);
      mkdirSync(path.dirname(stagedPath), { recursive: true });
      cpSync(path.join(packageRoot, packagedPath), stagedPath, {
        recursive: true,
      });
    }
    normalizePackageModes(stagedPackageRoot);

    execFileSync(
      "bun",
      ["pm", "pack", "--cwd", stagedPackageRoot, "--destination", destination, "--quiet"],
      {
        cwd: repoRoot,
        env: { ...process.env, FORCE_COLOR: "0" },
        stdio: ["ignore", "ignore", "inherit"],
      }
    );
    return path.join(destination, archiveName);
  } finally {
    rmSync(stagingParent, { recursive: true, force: true });
  }
}

export function sha256File(targetPath: string): string {
  return createHash("sha256").update(readFileSync(targetPath)).digest("hex");
}

export function checksumDocument(digest: string): string {
  return `${digest}  ${archiveName}\n`;
}

function normalizePackageModes(stagedPackageRoot: string, relativeRoot = ""): void {
  const directory = path.join(stagedPackageRoot, relativeRoot);
  chmodSync(directory, 0o755);

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = path.join(relativeRoot, entry.name);
    const absolutePath = path.join(stagedPackageRoot, relativePath);
    if (entry.isDirectory()) {
      normalizePackageModes(stagedPackageRoot, relativePath);
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Portable Habitat package cannot contain ${relativePath}: unsupported type.`);
    }
    const packagePath = relativePath.split(path.sep).join("/");
    chmodSync(absolutePath, executablePackageFiles.has(packagePath) ? 0o755 : 0o644);
  }
}
