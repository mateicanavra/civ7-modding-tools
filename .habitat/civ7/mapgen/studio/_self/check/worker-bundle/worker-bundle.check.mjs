import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const appRoot = resolve(repoRoot, "apps/mapgen-studio");
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
    {
      label: "/base-standard/ imports",
      pattern: /\b(?:import\s*(?:\(|["'])|from\s*["'])\/base-standard\//,
    },
    { label: "Civ7 engine globals", pattern: /\bGameplayMap\b/ },
    { label: "Node builtins (node:fs)", pattern: /["']node:fs["']/ },
    { label: "Node builtins (node:path)", pattern: /["']node:path["']/ },
    { label: "Node builtins (node:process)", pattern: /["']node:process["']/ },
  ];

  const hits = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const { label, pattern } of forbidden) {
      const match = text.match(pattern);
      if (match) {
        hits.push({ file, label, pattern, match: match[0] });
      }
    }
  }

  if (hits.length) {
    const lines = hits.map((h) => `- ${h.label}: ${h.match} in ${h.file}`);
    fail(`worker bundle contains forbidden references:\n${lines.join("\n")}`);
  }
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}

console.log("[mapgen-studio] worker bundle check passed");
