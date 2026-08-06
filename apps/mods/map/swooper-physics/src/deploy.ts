import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { installLocalSwooperPhysicsMod } from "./runtime/adapters/local-mod-install.js";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modOutputRoot = resolve(appRoot, "dist/mod");

function main(): void {
  const result = installLocalSwooperPhysicsMod({ inputDir: modOutputRoot });
  console.log(`Deployed ${result.filesCopied} files to ${result.targetDir}`);
}

if (import.meta.main) {
  main();
}
