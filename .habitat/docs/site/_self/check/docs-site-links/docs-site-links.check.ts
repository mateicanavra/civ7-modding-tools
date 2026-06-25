import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

async function run(): Promise<void> {
  const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
  }).trim();
  const projectRoot = join(repoRoot, "apps/docs");
  const tmpRoot = mkdtempSync(join(tmpdir(), "mint-pages-only-"));
  try {
    // Copy minimal inputs
    const docsJson = resolve(projectRoot, "docs.json");
    if (!existsSync(docsJson)) {
      console.error("docs.json missing");
      process.exit(1);
    }
    cpSync(docsJson, join(tmpRoot, "docs.json"));

    // Copy only *.mdx from project root recursively, excluding .archive and node_modules
    const { readdirSync, mkdirSync, copyFileSync } = await import("node:fs");
    function copyMdx(srcDir: string, dstDir: string): void {
      readdirSync(srcDir, { withFileTypes: true }).forEach((entry) => {
        const srcPath = join(srcDir, entry.name);
        const dstPath = join(dstDir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".archive") return;
          mkdirSync(dstPath, { recursive: true });
          copyMdx(srcPath, dstPath);
        } else if (entry.isFile()) {
          if (entry.name.toLowerCase().endsWith(".mdx")) {
            mkdirSync(dstDir, { recursive: true });
            copyFileSync(srcPath, dstPath);
          }
        }
      });
    }
    copyMdx(projectRoot, tmpRoot);

    // Copy public assets to tmp root so absolute paths like /civ7-official/... resolve
    const publicDir = resolve(projectRoot, "public");
    if (existsSync(publicDir)) {
      const { readdirSync, statSync } = await import("node:fs");
      readdirSync(publicDir, { withFileTypes: true }).forEach((entry) => {
        const srcPath = join(publicDir, entry.name);
        const dstPath = join(tmpRoot, entry.name);
        if (entry.isDirectory()) {
          cpSync(srcPath, dstPath, { recursive: true });
        } else if (entry.isFile()) {
          cpSync(srcPath, dstPath);
        }
      });
    }

    // Use the docs app's installed Mintlify CLI so builds do not depend on global binaries.
    const mintlifyBin = resolve(projectRoot, "node_modules/.bin/mintlify");
    const result = spawnSync(mintlifyBin, ["broken-links"], {
      cwd: tmpRoot,
      stdio: "inherit",
      env: process.env,
    });
    if (typeof result.status === "number") {
      process.exit(result.status);
    }
    // If status is null but error exists, throw
    if (result.error) {
      console.error(result.error);
      process.exit(1);
    }
  } finally {
    // Cleanup temp directory
    try {
      rmSync(tmpRoot, { recursive: true, force: true });
    } catch {}
  }
}

run();
