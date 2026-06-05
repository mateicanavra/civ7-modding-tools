import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderCiv7IntelligenceBridgeModinfo } from "../src/modinfo";

const root = fileURLToPath(new URL("..", import.meta.url));
const modinfoPath = join(root, "mod", "civ7-intelligence-bridge.modinfo");

await mkdir(dirname(modinfoPath), { recursive: true });
await writeFile(modinfoPath, renderCiv7IntelligenceBridgeModinfo(), "utf8");
