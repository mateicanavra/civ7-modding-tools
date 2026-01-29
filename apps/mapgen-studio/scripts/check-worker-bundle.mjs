import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appRoot = resolve(__dirname, "..");
const distRoot = resolve(appRoot, "dist");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

function fail(message) {
  console.error(`[mapgen-studio] ${message}`);
  process.exit(1);
}

try {
  const files = walk(distRoot).filter((p) => p.endsWith(".js") || p.endsWith(".mjs"));
  if (!files.length) fail(`no JS files found under ${distRoot} (did you run \`bun run build\`?)`);

  const forbidden = [
    { label: "/base-standard/ imports", needle: "/base-standard/" },
    { label: "Civ7 engine globals", needle: "GameplayMap" },
    { label: "Node builtins (node:fs)", needle: "node:fs" },
    { label: "Node builtins (node:path)", needle: "node:path" },
    { label: "Node builtins (node:process)", needle: "node:process" },
  ];

  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const { label, needle } of forbidden) {
      if (text.includes(needle)) {
        hits.push({ file, label, needle });
      }
    }
  }

  if (hits.length) {
    const lines = hits.map((h) => `- ${h.label}: ${h.needle} in ${h.file}`);
    fail(`worker bundle contains forbidden references:\n${lines.join("\n")}`);
  }
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}

console.log("[mapgen-studio] worker bundle check passed");

