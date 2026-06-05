import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const packageRoot = new URL("..", import.meta.url).pathname;
const generatedFiles = [
  "mod/ui/civ7-intelligence-bridge.js",
  "mod/civ7-intelligence-bridge.modinfo",
];

for (const generatedFile of generatedFiles) {
  const path = join(packageRoot, generatedFile);
  const source = await readFile(path, "utf8");
  await writeFile(path, source.replace(/[ \t]+$/gm, ""));
}
